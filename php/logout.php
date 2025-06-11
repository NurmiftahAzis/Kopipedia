<?php
session_start();
// Log logout activity (optional, but good for tracking)
if (isset($_SESSION['user_id'])) {
    $conn = new mysqli("localhost", "root", "", "kopipedia_db");
    if ($conn->connect_error) {
        error_log('Database connection failed for logout: ' . $conn->connect_error);
    } else {
        $user_id = $_SESSION['user_id'];
        $conn->query("INSERT INTO log_activity (user_id, activity) VALUES ($user_id, 'Logout')");
        $conn->close();
    }
}

session_unset();
session_destroy();
echo "success"; // Respond to frontend
?>