<?php
session_start();
$conn = new mysqli("localhost", "root", "", "kopipedia_db");

if ($conn->connect_error) {
    echo "error";
    exit();
}

if (!isset($_SESSION['user_id'])) {
    echo "error"; // User not logged in
    exit();
}

$user_id = $_SESSION['user_id'];
$total = $_POST['total'];
$payment_method = $_POST['payment_method'];
$address_id = $_POST['address_id']; // New: Get selected address ID
$cart_items_json = $_POST['cart_items']; // New: Get cart items from frontend
$cart_items = json_decode($cart_items_json, true);

// Start transaction
$conn->begin_transaction();

try {
    // 1. Insert into orders table
    // Add address_id to orders table (you might need to alter your orders table first)
    // ALTER TABLE orders ADD COLUMN address_id INT(11) DEFAULT NULL;
    // ALTER TABLE orders ADD CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES addresses(id);
    $stmt = $conn->prepare("INSERT INTO orders (user_id, total, payment_method, address_id) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iisi", $user_id, $total, $payment_method, $address_id);
    $stmt->execute();
    $order_id = $conn->insert_id;

    // 2. Insert into order_items table
    if (!empty($cart_items)) {
        foreach ($cart_items as $item) {
            // You might need to fetch product_id from products table based on item name
            // For simplicity, let's assume `item.name` maps to a product name
            // and `item.price` is the actual price per unit.
            // A more robust solution would pass product_id from frontend.

            // To get product_id, you'd query the products table:
            $product_name = $item['name'];
            $product_price = $item['price']; // This is the price per unit from the product data
            $quantity = 1; // Assuming quantity is 1 for now, or pass from frontend

            $stmt_product_id = $conn->prepare("SELECT id FROM products WHERE name = ?");
            $stmt_product_id->bind_param("s", $product_name);
            $stmt_product_id->execute();
            $product_result = $stmt_product_id->get_result();
            $product_row = $product_result->fetch_assoc();
            $product_id = $product_row ? $product_row['id'] : null; // Handle case where product name not found

            if ($product_id) {
                $stmt_order_item = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
                $stmt_order_item->bind_param("iiis", $order_id, $product_id, $quantity, $product_price);
                $stmt_order_item->execute();
            } else {
                // Log or handle error if product not found
                error_log("Product with name '{$product_name}' not found for order item.");
            }
        }
    }

    // 3. Log activity
    $conn->query("INSERT INTO log_activity (user_id, activity) VALUES ($user_id, 'Melakukan Checkout dengan Order ID: $order_id')");

    // Commit transaction
    $conn->commit();
    echo "success";

} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    error_log("Checkout error: " . $e->getMessage());
    echo "error";
}

$conn->close();
?>