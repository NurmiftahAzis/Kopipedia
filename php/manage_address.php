<?php
session_start();
header('Content-Type: text/plain'); // Simpler for success/error string response

if (!isset($_SESSION['user_id'])) {
    echo "error_not_logged_in";
    exit();
}

$conn = new mysqli("localhost", "root", "", "kopipedia_db");
if ($conn->connect_error) {
    error_log('Database connection failed: ' . $conn->connect_error);
    echo "error_db_connection";
    exit();
}

$user_id = $_SESSION['user_id'];
$label = $_POST['label'];
$recipient_name = $_POST['recipient_name'];
$recipient_phone = $_POST['recipient_phone'];
$full_address = $_POST['full_address'];
$postal_code = $_POST['postal_code'];

// Check if it's an update or add
$id = isset($_POST['id']) && !empty($_POST['id']) ? $_POST['id'] : null;

if ($id) {
    // Update existing address
    $stmt = $conn->prepare("UPDATE addresses SET label = ?, recipient_name = ?, recipient_phone = ?, full_address = ?, postal_code = ? WHERE id = ? AND user_id = ?");
    $stmt->bind_param("sssssii", $label, $recipient_name, $recipient_phone, $full_address, $postal_code, $id, $user_id);
} else {
    // Add new address
    $stmt = $conn->prepare("INSERT INTO addresses (user_id, label, recipient_name, recipient_phone, full_address, postal_code) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssss", $user_id, $label, $recipient_name, $recipient_phone, $full_address, $postal_code);
}

if ($stmt->execute()) {
    echo "success";
} else {
    error_log("Address save error: " . $stmt->error);
    echo "error_save_failed";
}

$stmt->close();
$conn->close();
?>