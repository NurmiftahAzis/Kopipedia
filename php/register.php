<?php
session_start(); // Add session_start()
$conn = new mysqli("localhost", "root", "", "kopipedia_db");

// Check connection
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    echo "error";
    exit();
}

$fullname = $_POST['fullname'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$password = password_hash($_POST['password'], PASSWORD_BCRYPT);

// Use prepared statement to prevent SQL injection and handle unique email constraint
$stmt = $conn->prepare("INSERT INTO users (fullname, email, phone, password) VALUES (?, ?, ?, ?)");
if ($stmt === false) {
    error_log("Prepare failed: " . $conn->error);
    echo "error";
    exit();
}
$stmt->bind_param("ssss", $fullname, $email, $phone, $password);

if ($stmt->execute()) {
    $user_id = $conn->insert_id;
    // Log activity after successful registration
    $conn->query("INSERT INTO log_activity (user_id, activity) VALUES ($user_id, 'Registrasi Akun')");
    echo "success";
} else {
    // Check for duplicate email error (MySQL error code 1062 for duplicate entry for unique key)
    if ($conn->errno == 1062) {
        echo "error_duplicate_email"; // Specific error for frontend
    } else {
        error_log("Registration failed: " . $stmt->error);
        echo "error";
    }
}

$stmt->close();
$conn->close();
?>