const form = document.getElementById('organiser-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Organiser data
    const organiserData = {
        organiserName: document.getElementById('organiser-name').value,
        organiserEmail: document.getElementById('organiser-email').value,
        organiserPhone: document.getElementById('organiser-phone').value
    };

    try {
        const response = await fetch('/organiser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(organiserData)
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Error creating organiser:', data.message);
            return;
        }

        console.log('Organiser created successfully:', data);
    } catch (error) {
        console.error('Error submitting organiser data:', error);
    }

    // Event data 
    const eventData = new FormData();
    eventData.append('eventName', document.getElementById('event-name').value);
    eventData.append('eventLocation', document.getElementById('event-location').value);
    eventData.append('eventImage', document.getElementById('event-image').files[0]);
    eventData.append('eventDate', document.getElementById('event-date').value);
    eventData.append('eventDescription', document.getElementById('event-description').value);


    try {
        const response = await fetch('/event', {
            method: 'POST',
            body: eventData
        });

        if (response.ok) {
            const data = await response.json();
            fetchEvents(); // Fetch and display updated venues list
        } else {
            alert('Error creating event');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while creating the event.');
    }

    form.reset();
});
