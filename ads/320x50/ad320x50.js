function createAdWrapper() {
    const colors = ['#9C27B0', '#FF9800', '#4CAF50', '#2196F3', '#F44336'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const wrapper = document.createElement('div');
    wrapper.className = 'ad-container';
    wrapper.style.border = `4px solid ${randomColor}`;

    wrapper.innerHTML = `
        <div class="ad-header" style="background-color: ${randomColor}; border-bottom-color: ${randomColor};">
            <span class="ad-label">ADVERTISEMENT</span>
        </div>
        <div class="ad-banner" style="border-color: ${randomColor};">
            <!-- Ad content will be moved here -->
        </div>
    `;

    return wrapper;
}

// Main logic
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.ad-banner-placeholder').forEach(placeholder => {
        // Get the original ad code that user put inside the placeholder
        const originalAdContent = placeholder.innerHTML.trim();
        
        if (originalAdContent.length > 0) {
            const wrapper = createAdWrapper();
            
            // Move the original ad code into the .ad-banner div
            const adBannerSlot = wrapper.querySelector('.ad-banner');
            adBannerSlot.innerHTML = originalAdContent;
            
            // Clear placeholder and insert the styled wrapper
            placeholder.innerHTML = '';
            placeholder.appendChild(wrapper);
        }
    });
});