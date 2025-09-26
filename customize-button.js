// Button hover effects and animation
document.addEventListener('DOMContentLoaded', function() {
    const customizeButton = document.getElementById('customizeButton');
    
    if (customizeButton) {
        // Add pulse animation on page load
        setTimeout(() => {
            customizeButton.classList.add('pulse');
        }, 1500);
        
        // Remove animation after it completes
        customizeButton.addEventListener('animationend', function() {
            this.classList.remove('pulse');
            
            // Add pulse again after some time
            setTimeout(() => {
                customizeButton.classList.add('pulse');
            }, 10000); // Repeat every 10 seconds
        });
    }
    
    // Add this style to the document for the pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(255, 69, 0, 0.7);
            }
            70% {
                box-shadow: 0 0 0 15px rgba(255, 69, 0, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(255, 69, 0, 0);
            }
        }
        
        .pulse {
            animation: pulse 1.5s ease-out;
        }
    `;
    document.head.appendChild(style);
});