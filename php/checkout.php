<?php
session_start();
// Set content type to plain text for direct "success" or "error" output
header('Content-Type: text/plain'); 

$conn = new mysqli("localhost", "root", "", "kopipedia_db");

if ($conn->connect_error) {
    error_log("Database connection failed for checkout: " . $conn->connect_error);
    echo "error_db_connection";
    exit();
}

if (!isset($_SESSION['user_id'])) {
    echo "error_not_logged_in";
    exit();
}

$user_id = $_SESSION['user_id'];
$total_from_frontend = $_POST['total']; // This will be verified
$payment_method = $_POST['payment_method'];
$address_id = $_POST['address_id']; 
$cart_items_json = $_POST['cart_items'];
$cart_items = json_decode($cart_items_json, true);

if (empty($cart_items)) {
    echo "error_empty_cart";
    exit();
}

// Start transaction
$conn->begin_transaction();

try {
    $calculated_total = 0;
    $order_items_to_insert = [];

    // Verify product prices and calculate total on server-side
    foreach ($cart_items as $item) {
        $product_id = $item['id']; // Assumed to be passed from frontend now
        $quantity = $item['quantity']; // Assumed to be passed from frontend now

        if (!is_numeric($product_id) || $product_id <= 0 || !is_numeric($quantity) || $quantity <= 0) {
            throw new Exception("Invalid product ID or quantity in cart.");
        }

        // Fetch product details from database to get the real price
        $stmt_product = $conn->prepare("SELECT price FROM products WHERE id = ?");
        $stmt_product->bind_param("i", $product_id);
        $stmt_product->execute();
        $product_result = $stmt_product->get_result();
        $product_data = $product_result->fetch_assoc();
        $stmt_product->close();

        if (!$product_data) {
            throw new Exception("Product with ID {$product_id} not found.");
        }

        $price_per_unit = $product_data['price'];
        $item_total = $price_per_unit * $quantity;
        $calculated_total += $item_total;

        $order_items_to_insert[] = [
            'product_id' => $product_id,
            'quantity' => $quantity,
            'price' => $price_per_unit // Store price per unit at time of order
        ];
    }

    // Optional: Compare $calculated_total with $total_from_frontend to detect tampering
    // If (abs($calculated_total - $total_from_frontend) > some_small_epsilon) { throw new Exception("Price mismatch!"); }

    // 1. Insert into orders table
    $stmt_order = $conn->prepare("INSERT INTO orders (user_id, total, payment_method, address_id) VALUES (?, ?, ?, ?)");
    $stmt_order->bind_param("iisi", $user_id, $calculated_total, $payment_method, $address_id);
    $stmt_order->execute();
    $order_id = $conn->insert_id;
    $stmt_order->close();

    // 2. Insert into order_items table
    $stmt_order_item = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($order_items_to_insert as $item) {
        $stmt_order_item->bind_param("iiis", $order_id, $item['product_id'], $item['quantity'], $item['price']);
        $stmt_order_item->execute();
    }
    $stmt_order_item->close();

    // 3. Log activity
    $conn->query("INSERT INTO log_activity (user_id, activity) VALUES ($user_id, 'Melakukan Checkout dengan Order ID: $order_id')");

    // Commit transaction
    $conn->commit();
    echo "success";

} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    error_log("Checkout error: " . $e->getMessage());
    echo "error_checkout_failed";
}

$conn->close();
?>