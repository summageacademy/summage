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
            <!-- Yandex ad will be placed here -->
        </div>
    `;
    return wrapper;
}

// Main logic
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.ad-banner-placeholder').forEach(placeholder => {
        if (placeholder.children.length > 0) {
            const wrapper = createAdWrapper();
            const adBannerSlot = wrapper.querySelector('.ad-banner');
            
            // Move all original content (div + script) into the ad banner
            while (placeholder.firstChild) {
                adBannerSlot.appendChild(placeholder.firstChild);
            }
            
            // Replace placeholder content with styled wrapper
            placeholder.innerHTML = '';
            placeholder.appendChild(wrapper);
        }
    });
});