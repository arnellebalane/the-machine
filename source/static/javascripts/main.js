if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
            initializeServiceWorker(registration);
        })
        .catch(function(error) {
            console.error('register() error', error);
        });
}


function initializeServiceWorker(registration) {
    if (!('showNotification' in registration)) {
        console.warn('Notifications are not supported in this browser.');
        return;
    } else if (Notification.permission === 'denied') {
        console.warn('Notifications are blocked in this browser.');
        return;
    } else if (!('pushManager' in registration)) {
        console.warn('Push notifications are not supported in this browser.');
        return;
    }

    registration.pushManager.getSubscription().then(function(subscription) {
        if (!subscription) {
            return subscribeToPushNotifications();
        }
        sendSubscriptionToServer('subscribe', subscription);
    });
}


function subscribeToPushNotifications() {
    navigator.serviceWorker.getRegistration()
        .then(function(registration) {
            if (!registration) {
                console.error('No service worker registered yet.');
                return;
            }
            registration.pushManager.subscribe({ userVisibleOnly: true })
                .then(function(subscription) {
                    sendSubscriptionToServer('subscribe', subscription);
                });
        })
        .catch(function(error) {
            console.error('getRegistration() error', error);
        });
}


function unsubscribeFromPushNotifications() {
    navigator.serviceWorker.getRegistration()
        .then(function(registration) {
            if (!registration) {
                console.error('No service worker registered yet.');
                return;
            }
            registration.pushManager.getSubscription()
                .then(function(subscription) {
                    if (!subscription) {
                        return;
                    }
                    subscription.unsubscribe().then(function() {
                        sendSubscriptionToServer('unsubscribe', subscription);
                    });
                });
        })
        .catch(function(error) {
            console.error('getRegistration() error', error);
        });
}


function sendSubscriptionToServer(action, subscription) {
    var subscriptionId = subscription.endpoint.split('/').pop();
    var url = '/' + action + '?id=' + subscriptionId;
    fetch(url).catch(function(error) {
        console.error('Subscription error', error);
    });
}





document.addEventListener('click', function(e) {
    var target = e.target;
    if (target.matches('.unsubscribe-link')) {
        e.preventDefault();
        unsubscribeFromPushNotifications();
        target.parentNode.removeChild(target);
    }
});
