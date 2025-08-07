// sw-init.ts
export function initServiceWorker() {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.info('Service Worker registered successfully:', registration.scope);

          // ✅ Send env variables to the SW
          if (registration.active) {
            registration.active.postMessage({
              type: 'ENV',
              payload: {
                environment: process.env.NODE_ENV,
              },
            });
          } else {
            // If SW is not active yet, wait for it to become active
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              navigator.serviceWorker.controller?.postMessage({
                type: 'ENV',
                payload: {
                  environment: process.env.NODE_ENV,
                },
              });
            });
          }

          if ('Notification' in window) {
            Notification.requestPermission().then((permission) => {
              console.info('Notification permission:', permission);
            });
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  } else {
    console.warn('Service Worker not supported in this browser.');
  }
}
