self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('the-machine').then(function(cache) {
            cache.addAll([
                '/',
                '/static/stylesheets/main.css',
                '/static/javascripts/main.js',
                '/manifest.json'
            ]);
        })
    );
});


self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});


self.addEventListener('push', function(event) {
    event.waitUntil(
        self.registration.showNotification('The Machine', {
            body: 'We have a new number',
            icon: '/static/images/logo.png'
        })
    );
});


self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(self.clients.openWindow('/'));
});
