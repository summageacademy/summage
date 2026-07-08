function createAdBanner() {
    const colors = ['#9C27B0', '#FF9800', '#4CAF50', '#2196F3', '#F44336'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const container = document.createElement('div');
    container.className = 'ad-container';
    container.style.border = `4px solid ${randomColor}`;

    container.innerHTML = `
        <div class="ad-header" style="background-color: ${randomColor}; border-bottom-color: ${randomColor};">
            <span class="ad-label">ADVERTISEMENT</span>
        </div>
        <div class="ad-banner" style="border-color: ${randomColor};">
            <div class="placeholder-content">
                <!-- Yandex.RTB R-A-19402847-1 -->
                <div id="yandex_rtb_R-A-19402847-1"></div>
                <script>
                window.yaContextCb.push(() => {
                    Ya.Context.AdvManager.render({
                        "blockId": "R-A-19402847-1",
                        "renderTo": "yandex_rtb_R-A-19402847-1"
                    })
                })
                </script>
            </div>
        </div>
    `;

    return container;
}

// Auto-insert all elements with class "ad-banner-placeholder"
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.ad-banner-placeholder').forEach(placeholder => {
        placeholder.appendChild(createAdBanner());
    });
});