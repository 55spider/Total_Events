document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#venue-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch('/venue', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Venue created successfully!');
                form.reset();
                window.location.href = '/venue.html'; // Redirect to venues page
            } else {
                alert('Error creating venue');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the venue.');
        }
    });
});
