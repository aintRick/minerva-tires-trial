<?php
// Database connection
$servername = "localhost";
$username = "root"; 
$password = "";     
$dbname = "minerva";

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Fetch contact information
    $stmt = $pdo->prepare("SELECT * FROM getintouch ORDER BY id LIMIT 1");
    $stmt->execute();
    $contact_info = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Fetch business hours with proper weekday ordering
    $stmt = $pdo->prepare("SELECT * FROM business_hours ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')");
    $stmt->execute();
    $business_hours = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Create response array directly from database data
    $formatted_hours = [];
    
    foreach ($business_hours as $hour) {
        $formatted_hours[] = [
            'day' => $hour['day'],
            'open_time' => $hour['open_time'],
            'close_time' => $hour['close_time'],
            'is_closed' => (int)$hour['is_closed'] // Ensure it's an integer
        ];
    }
    
    // If no data found, create default closed schedule
    if (empty($formatted_hours)) {
        $default_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        foreach ($default_days as $day) {
            $formatted_hours[] = [
                'day' => $day,
                'open_time' => null,
                'close_time' => null,
                'is_closed' => 1
            ];
        }
    }
    
    // Prepare response data
    $response = [
        'success' => true,
        'contact_info' => $contact_info,
        'business_hours' => $formatted_hours
    ];
    
    echo json_encode($response);
    
} catch(PDOException $e) {
    $error_response = [
        'success' => false,
        'error' => 'Database connection failed: ' . $e->getMessage()
    ];
    echo json_encode($error_response);
}
?>