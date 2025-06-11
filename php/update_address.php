<?php
session_start();
header('Content-Type: text/plain');

if (!isset($_SESSION['user_id'])) {
    echo "error";
    exit();
}

$conn = new mysqli("localhost", "root", "", "kopipedia_db");
if ($conn->connect_error) {
    echo "error";
    exit();
}

$user_id = $_SESSION['user_id'];
$id = $_POST['id'];
$label = $_POST['label'];
$recipient_name = $_POST['recipient_name'];
$recipient_phone = $_POST['recipient_phone'];
$full_address = $_POST['full_address'];
$postal_code = $_POST['postal_code'];

$stmt = $conn->prepare("UPDATE addresses SET label = ?, recipient_name = ?, recipient_phone = ?, full_address = ?, postal_code = ? WHERE id = ? AND user_id = ?");
$stmt->bind_param("sssssii", $label, $recipient_name, $recipient_phone, $full_address, $postal_code, $id, $user_id);

if ($stmt->execute()) {
    echo "success";
} else {
    echo "error";
}

$stmt->close();
$conn->close();
?>