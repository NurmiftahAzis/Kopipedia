<?php
$conn = new mysqli("localhost", "root", "", "kopipedia_db");

$fullname = $_POST['fullname'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$password = password_hash($_POST['password'], PASSWORD_BCRYPT);

$stmt = $conn->prepare("INSERT INTO users (fullname, email, phone, password) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $fullname, $email, $phone, $password);
$stmt->execute();

$user_id = $conn->insert_id;
$conn->query("INSERT INTO log_activity (user_id, activity) VALUES ($user_id, 'Registrasi Akun')");

echo "success";
?>
