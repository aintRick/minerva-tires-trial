<?php
/**
 * Updated Booking Service Database Processing with proper time handling
 */

// Set content type to JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Database Configuration
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'minerva');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Database Connection Class
 */
class DatabaseConnection {
    private $pdo;
    
    public function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }
    
    public function getPdo() {
        return $this->pdo;
    }
}

/**
 * Updated Booking Class with proper time handling
 */
class BookingService {
    private $db;
    
    public function __construct(DatabaseConnection $database) {
        $this->db = $database->getPdo();
    }
    
    /**
     * Convert 12-hour format to 24-hour format
     */
    private function convertTo24Hour($time12h) {
        // Handle both formats: "8:00 AM" and already converted "08:00:00"
        if (strpos($time12h, 'AM') !== false || strpos($time12h, 'PM') !== false) {
            $parts = explode(' ', trim($time12h));
            $time = $parts[0];
            $ampm = $parts[1];
            
            $timeParts = explode(':', $time);
            $hours = intval($timeParts[0]);
            $minutes = $timeParts[1];
            
            if ($ampm === 'AM' && $hours == 12) {
                $hours = 0;
            } elseif ($ampm === 'PM' && $hours != 12) {
                $hours += 12;
            }
            
            return sprintf('%02d:%s:00', $hours, $minutes);
        }
        
        // If already in 24-hour format, return as is
        if (preg_match('/^\d{2}:\d{2}:\d{2}$/', $time12h)) {
            return $time12h;
        }
        
        // If in HH:MM format, add seconds
        if (preg_match('/^\d{2}:\d{2}$/', $time12h)) {
            return $time12h . ':00';
        }
        
        return $time12h; // Return original if no conversion needed
    }
    
    /**
     * Convert 24-hour format to 12-hour format for display
     */
    private function convertTo12Hour($time24h) {
        $time = DateTime::createFromFormat('H:i:s', $time24h);
        if ($time) {
            return $time->format('g:i A');
        }
        
        // Fallback parsing
        $timeParts = explode(':', $time24h);
        $hours = intval($timeParts[0]);
        $minutes = $timeParts[1];
        
        $ampm = ($hours >= 12) ? 'PM' : 'AM';
        $hours = ($hours > 12) ? $hours - 12 : ($hours == 0 ? 12 : $hours);
        
        return sprintf('%d:%s %s', $hours, $minutes, $ampm);
    }
    
    /**
     * Validate booking data
     */
    private function validateBookingData($data) {
        $errors = [];
        
        // Required fields validation
        $requiredFields = ['user_name', 'user_email', 'phone', 'service', 'appointment_date', 'appointment_time'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                $errors[] = "Field '{$field}' is required";
            }
        }
        
        // Email validation
        if (!empty($data['user_email']) && !filter_var($data['user_email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email format";
        }
        
        // Phone validation (Philippine format)
        if (!empty($data['phone']) && !preg_match('/^\+63\d{9,10}$/', $data['phone'])) {
            $errors[] = "Invalid phone number format";
        }
        
        // Date validation
        if (!empty($data['appointment_date'])) {
            $appointmentDate = DateTime::createFromFormat('Y-m-d', $data['appointment_date']);
            $today = new DateTime();
            $today->setTime(0, 0, 0);
            
            if (!$appointmentDate || $appointmentDate < $today) {
                $errors[] = "Appointment date must be today or in the future";
            }
        }
        
        // Time validation - check if it's a valid time format
        if (!empty($data['appointment_time'])) {
            $timePattern = '/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/';
            if (!preg_match($timePattern, $data['appointment_time'])) {
                $errors[] = "Invalid time format";
            }
        }
        
        return $errors;
    }
    
    /**
     * Check for duplicate bookings
     */
    private function checkDuplicateBooking($data) {
        try {
            $sql = "SELECT COUNT(*) FROM appointment 
                    WHERE user_email = :email 
                    AND service = :service 
                    AND appointment_date = :date 
                    AND appointment_time = :time
                    AND status != 'Cancelled'";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':email' => $data['user_email'],
                ':service' => $data['service'],
                ':date' => $data['appointment_date'],
                ':time' => $data['appointment_time']
            ]);
            
            return $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            error_log("Error checking duplicate booking: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Sanitize input data
     */
    private function sanitizeData($data) {
        $sanitized = [];
        
        $sanitized['user_name'] = htmlspecialchars(trim($data['user_name']), ENT_QUOTES, 'UTF-8');
        $sanitized['user_email'] = filter_var(trim($data['user_email']), FILTER_SANITIZE_EMAIL);
        $sanitized['phone'] = preg_replace('/[^+\d]/', '', $data['phone']);
        $sanitized['service'] = htmlspecialchars(trim($data['service']), ENT_QUOTES, 'UTF-8');
        $sanitized['appointment_date'] = trim($data['appointment_date']);
        
        // Handle time conversion
        $sanitized['appointment_time'] = $this->convertTo24Hour(trim($data['appointment_time']));
        
        // Store display time if provided, otherwise convert from 24-hour
        if (!empty($data['appointment_time_display'])) {
            $sanitized['appointment_time_display'] = htmlspecialchars(trim($data['appointment_time_display']), ENT_QUOTES, 'UTF-8');
        } else {
            $sanitized['appointment_time_display'] = $this->convertTo12Hour($sanitized['appointment_time']);
        }
        
        $sanitized['note'] = !empty($data['note']) ? htmlspecialchars(trim($data['note']), ENT_QUOTES, 'UTF-8') : null;
        
        return $sanitized;
    }
    
    /**
     * Create new booking
     */
    public function createBooking($data) {
        try {
            // Sanitize data
            $data = $this->sanitizeData($data);
            
            // Validate data
            $errors = $this->validateBookingData($data);
            if (!empty($errors)) {
                return ['success' => false, 'message' => implode(', ', $errors)];
            }
            
            // Check for duplicate booking
            if ($this->checkDuplicateBooking($data)) {
                return ['success' => false, 'message' => 'A booking with the same details already exists'];
            }
            
            // Check if appointment_time_display column exists, if not use appointment_time
            $checkColumnSql = "SHOW COLUMNS FROM appointment LIKE 'appointment_time_display'";
            $columnExists = $this->db->query($checkColumnSql)->rowCount() > 0;
            
            if ($columnExists) {
                // Use the new column structure
                $sql = "INSERT INTO appointment (user_name, user_email, phone, service, appointment_date, appointment_time, appointment_time_display, note, status) 
                        VALUES (:user_name, :user_email, :phone, :service, :appointment_date, :appointment_time, :appointment_time_display, :note, :status)";
                
                $executeData = [
                    ':user_name' => $data['user_name'],
                    ':user_email' => $data['user_email'],
                    ':phone' => $data['phone'],
                    ':service' => $data['service'],
                    ':appointment_date' => $data['appointment_date'],
                    ':appointment_time' => $data['appointment_time'],
                    ':appointment_time_display' => $data['appointment_time_display'],
                    ':note' => $data['note'],
                    ':status' => 'Pending'
                ];
            } else {
                // Use existing structure, store display format in appointment_time
                $sql = "INSERT INTO appointment (user_name, user_email, phone, service, appointment_date, appointment_time, note, status) 
                        VALUES (:user_name, :user_email, :phone, :service, :appointment_date, :appointment_time, :note, :status)";
                
                $executeData = [
                    ':user_name' => $data['user_name'],
                    ':user_email' => $data['user_email'],
                    ':phone' => $data['phone'],
                    ':service' => $data['service'],
                    ':appointment_date' => $data['appointment_date'],
                    ':appointment_time' => $data['appointment_time_display'], // Use display format
                    ':note' => $data['note'],
                    ':status' => 'Pending'
                ];
            }
            
            $stmt = $this->db->prepare($sql);
            $success = $stmt->execute($executeData);
            
            if ($success) {
                $bookingId = $this->db->lastInsertId();
                
                // Log successful booking
                error_log("New booking created - ID: {$bookingId}, Email: {$data['user_email']}, Service: {$data['service']}, Time: {$data['appointment_time_display']}");
                
                return [
                    'success' => true, 
                    'message' => 'Booking created successfully',
                    'booking_id' => $bookingId
                ];
            } else {
                throw new Exception("Failed to create booking");
            }
            
        } catch (PDOException $e) {
            error_log("Database Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error occurred'];
        } catch (Exception $e) {
            error_log("Booking Error: " . $e->getMessage());
            return ['success' => false, 'message' => 'An error occurred while processing your booking'];
        }
    }
}

/**
 * Main Processing Logic
 */
try {
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Check if data was received
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data received");
    }
    
    if (empty($data)) {
        throw new Exception("No data received");
    }
    
    // Initialize database connection
    $database = new DatabaseConnection();
    $bookingService = new BookingService($database);
    
    // Process the booking
    $result = $bookingService->createBooking($data);
    
    // Set appropriate HTTP status code
    if ($result['success']) {
        http_response_code(201); // Created
    } else {
        http_response_code(400); // Bad Request
    }
    
    // Return JSON response
    echo json_encode($result);
    
} catch (Exception $e) {
    // Log the error
    error_log("Booking Processing Error: " . $e->getMessage());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error occurred. Please try again later.'
    ]);
}

// Close any open database connections
$database = null;
$bookingService = null;
?>