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

$stmt = $conn->prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $id, $user_id);

if ($stmt->execute()) {
    echo "success";
} else {
    echo "error";
}

$stmt->close();
$conn->close();
?>