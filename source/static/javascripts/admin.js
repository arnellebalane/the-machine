document.querySelector('.notify-assets-btn')
    .addEventListener('click', function() {
        var request = new Request('/notify', { method: 'POST' });
        fetch(request).catch(function(error) {
            console.error('Error notifying assets', error);
        });
    });
