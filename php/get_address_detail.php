<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
    exit();
}

$conn = new mysqli("localhost", "root", "", "kopipedia_db");
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

$user_id = $_SESSION['user_id'];
$address_id = $_GET['id'];

$stmt = $conn->prepare("SELECT * FROM addresses WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $address_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();
$address = $result->fetch_assoc();

if ($address) {
    echo json_encode(['status' => 'success', 'address' => $address]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Address not found or unauthorized']);
}

$stmt->close();
$conn->close();
?>