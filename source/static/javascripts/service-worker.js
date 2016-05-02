self.addEventListener('push', function(event) {
    event.waitUntil(
        self.registration.showNotification('The Machine', {
            body: 'We have a new number',
            icon: '/static/images/logo.png'
        })
    );
});
