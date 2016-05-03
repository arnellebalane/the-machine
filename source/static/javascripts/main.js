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
    } else if (!('PushManager' in window)) {
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
    var url = '/' + action + '?id=' + subscriptionId + '&swcache=false';
    fetch(url).catch(function(error) {
        console.error('Subscription error', error);
    });
}


function sendMessageToServer(message) {
    sendMessageUsingBackgroundSync(message).catch(function(error) {
        console.error('Error sending message using background sync', error);
        sendMessageUsingFetch(message);
    });
}


function sendMessageUsingBackgroundSync(message) {
    return new Promise(function(resolve, reject) {
        if ('SyncManager' in window) {
            return navigator.serviceWorker.getRegistration()
                .then(function(registration) {
                    return registration.sync.register('send-message')
                        .then(function() {
                            return storeMessageLocally(message);
                        });
                })
                .catch(function(error) {
                    console.error('getRegistration() error', error);
                    sendMessageUsingFetch(message);
                });
        }
        reject(message);
    });
}


function sendMessageUsingFetch(message) {
    var request = new Request('/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
    });
    fetch(request).catch(function(error) {
        console.error('Message sending error', error);
    });
}





var DB_NAME = 'message-storage';

var idb = indexedDB.open(DB_NAME, 1);
var db;

idb.onupgradeneeded = function(e) {
    var objectStore = e.target.result
        .createObjectStore('messages', { autoIncrement: true });
    objectStore.createIndex('message', 'message', { unique: false });
};

idb.onsuccess = function(e) {
    db = e.target.result;
};


function storeMessageLocally(message) {
    var transaction = db.transaction(['messages'], 'readwrite');
    var objectStore = transaction.objectStore('messages');
    objectStore.add({ message: message });
}





document.addEventListener('click', function(e) {
    var target = e.target;
    if (target.matches('.unsubscribe-link')) {
        e.preventDefault();
        unsubscribeFromPushNotifications();
        target.parentNode.removeChild(target);
    }
});


var messageForm = document.querySelector('.message-form');
if (messageForm) {
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var message = this.message.value;
        this.message.value = '';
        sendMessageToServer(message);
    });
}
