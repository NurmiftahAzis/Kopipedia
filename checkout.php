<?php
session_start();
$conn = new mysqli("localhost", "root", "", "kopipedia_db");

$user_id = $_SESSION['user_id'];
$total = $_POST['total'];
$payment_method = $_POST['payment_method'];

$stmt = $conn->prepare("INSERT INTO orders (user_id, total, payment_method) VALUES (?, ?, ?)");
$stmt->bind_param("iis", $user_id, $total, $payment_method);
$stmt->execute();

$conn->query("INSERT INTO log_activity (user_id, activity) VALUES ($user_id, 'Melakukan Checkout')");
echo "success";
?>
