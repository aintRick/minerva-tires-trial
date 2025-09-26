// Features icon animation
document.addEventListener('DOMContentLoaded', function() {
    // Add icon classes to the feature divs
    const featureIcons = document.querySelectorAll('.feature div');
    
    featureIcons[0].classList.add('feature-icon');
    featureIcons[0].innerHTML = '<i class="fas fa-shield-alt"></i>';
    
    featureIcons[1].classList.add('feature-icon');
    featureIcons[1].innerHTML = '<i class="fas fa-cloud-rain"></i>';
    
    featureIcons[2].classList.add('feature-icon');
    featureIcons[2].innerHTML = '<i class="fas fa-leaf"></i>';
    
    // Simple animation for features on scroll
    const features = document.querySelectorAll('.feature');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.2 });
    
    features.forEach(feature => {
        feature.style.opacity = 0;
        feature.style.transform = 'translateY(20px)';
        feature.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(feature);
    });
});