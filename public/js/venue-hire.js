document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const venueName = urlParams.get('venueName');
    const venueCapacity = urlParams.get('venueCapacity');

    if (venueName && venueCapacity) {
        document.getElementById('venue-name').value = venueName;
        document.getElementById('venue-capacity').value = venueCapacity;
    }

    const form  = document.querySelector('#venue-hire-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch('/venue-hire', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Venue hired successfully!');
                form.reset();
                window.location.href = '/venue.html'; // Redirect to venues page
            } else {
                alert('Failed to hire venue');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while hiring the venue.');
        }
    });
});
