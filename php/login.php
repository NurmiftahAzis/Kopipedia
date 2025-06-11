<?php
session_start();
$conn = new mysqli("localhost", "root", "", "kopipedia_db");

// Check connection
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    echo "error"; // Generic error to frontend
    exit();
}

$email = $_POST['email'];
$password = $_POST['password'];

// Use prepared statements for security
$stmt = $conn->prepare("SELECT id, fullname, email, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc(); // Use fetch_assoc() for a single row

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['fullname'] = $user['fullname'];
    $_SESSION['login'] = true;
    // Log activity
    $conn->query("INSERT INTO log_activity (user_id, activity) VALUES ({$user['id']}, 'Login Berhasil')");
    echo "success";
} else {
    echo "error";
}

$stmt->close();
$conn->close();
?>