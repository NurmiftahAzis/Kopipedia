<?php
session_start();
$conn = new mysqli("localhost", "root", "", "kopipedia_db");

$email = $_POST['email'];
$password = $_POST['password']; 


$res = $conn->query("SELECT * FROM users WHERE email = '$email'");
$user = $res->fetchAll();

if ($user && password_verify($password, $user['password'])) {
  $_SESSION['user_id'] = $user['id'];
  $_SESSION['email'] = $user['email'];
  $_SESSION['fullname'] = $user['fullname'];
  $_SESSION['login'] = true;
  $conn->query("INSERT INTO log_activity (user_id, activity) VALUES ({$user['id']}, 'Login Berhasil')");
  echo "success";
} else {
  echo "error";
}
?>
