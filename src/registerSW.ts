
// PWA Service Worker Registration
let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;

if ('serviceWorker' in navigator) {
  try {
    // Dynamically import the PWA register function only if available
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        updateSW = registerSW({
          onNeedRefresh() {
            // Show a prompt to user to refresh the app
            if (confirm('New content available. Reload?')) {
              updateSW?.(true);
            }
          },
          onOfflineReady() {
            console.log('App ready to work offline');
          },
        });
      })
      .catch(() => {
        console.log('PWA not available in this environment');
      });
  } catch (error) {
    console.log('PWA registration failed:', error);
  }
}

export { updateSW };
