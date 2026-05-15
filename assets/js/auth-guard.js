// auth-guard.js – silent redirect if not logged in
// Include AFTER Firebase SDKs + firebase.initializeApp()

(function() {
  // We do NOT touch DOM visibility or add loaders

  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      // Not logged in → immediate silent redirect
      // Use replace() so user cannot go back with browser back button
      window.location.replace('/authentication/');  // ← change to your actual login page path
      // Alternative: window.location.href = '/login.html';
    }
    // If logged in → do absolutely nothing, page continues normally
  });

  // Very short timeout fallback (in case auth listener never fires – rare)
  setTimeout(() => {
    if (!firebase.auth().currentUser) {
      window.location.replace('/authentication/');
    }
  }, 4000); // 4 seconds is more than enough for most connections

})();