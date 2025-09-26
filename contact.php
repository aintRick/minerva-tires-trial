<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set proper headers for AJAX
header('Content-Type: text/plain');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../PHPMailer/src/Exception.php';
require '../PHPMailer/src/PHPMailer.php';
require '../PHPMailer/src/SMTP.php';

// Allow only POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo "failed";
    exit;
}

// Get and sanitize form data
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$inquiry_type = trim($_POST['inquiry_type'] ?? '');
$message = trim($_POST['message'] ?? '');

// Basic validation
if (empty($name) || empty($email) || empty($inquiry_type) || empty($message)) {
    echo "failed";
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "failed";
    exit;
}

// Create PHPMailer instance
$mail = new PHPMailer(true);

try {
    // SMTP configuration
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'minervatires@gmail.com';
    $mail->Password = 'oskrmswaoonzfbht'; // Make sure this is your correct app password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    // Additional SMTP settings for better reliability
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );

    // Email settings
    $mail->setFrom('minervatires@gmail.com', 'Minerva Tires Website');
    $mail->addReplyTo($email, $name);
    $mail->addAddress('minervatires@gmail.com', 'Minerva Tires');

    // Email content
    $mail->isHTML(false); // Set to plain text
    $mail->Subject = "New Contact Form Inquiry: " . ucfirst($inquiry_type);
    
    $emailBody = "You have received a new contact form submission:\n\n";
    $emailBody .= "Name: " . $name . "\n";
    $emailBody .= "Email: " . $email . "\n";
    if (!empty($phone)) {
        $emailBody .= "Phone: " . $phone . "\n";
    }
    $emailBody .= "Inquiry Type: " . ucfirst($inquiry_type) . "\n\n";
    $emailBody .= "Message:\n" . $message . "\n\n";
    $emailBody .= "---\n";
    $emailBody .= "Submitted on: " . date('Y-m-d H:i:s') . "\n";
    $emailBody .= "IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n";
    
    $mail->Body = $emailBody;

    // Send email
    if ($mail->send()) {
        echo "success";
    } else {
        echo "failed";
    }

} catch (Exception $e) {
    // Log the error for debugging (optional)
    error_log("PHPMailer Error: " . $mail->ErrorInfo);
    echo "failed";
}
?>