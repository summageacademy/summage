// auth-guard.js - Robust version

// Wait a bit for Firebase to fully initialize (in case of race conditions)
function startAuthListener() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        // Firebase not ready yet — try again in 100ms
        setTimeout(startAuthListener, 100);
        return;
    }

    const auth = firebase.auth();

    auth.onAuthStateChanged((user) => {
        if (!user) {
            console.log("Not logged in → redirecting to auth.html");
            window.location.href = '/auth.html'; // Adjust path if menu.html is in subfolder
        } else {
            console.log("User logged in:", user.uid);
            // Optional: remove loader or enable page
            const loader = document.getElementById('loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 400);
            }
            document.body.classList.remove('no-scroll');
        }
    });
}

// Start the listener
startAuthListener();