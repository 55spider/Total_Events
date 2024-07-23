const boxContainer = document.getElementById('box-container');


function createEventBox(event) {
    const eventBox = document.createElement('div');
    eventBox.classList.add('box');

    const eventLink = document.createElement('a');
    eventLink.href = `/ticket.html?eventId=${event._id}`; // Use the unique MongoDB event ID

    const eventImage = document.createElement('img');
    eventImage.src = `data:${event.contentType};base64,${event.image}`;
    //eventImage.alt = "Event Image";
    eventLink.appendChild(eventImage);

    if (venue.image) {
        const venueImage = document.createElement('img');
        venueImage.src = venue.image;
        venueImage.alt = "Venue Image";
        venueBox.appendChild(venueImage);
    }

    const eventName = document.createElement('h3');
    eventName.textContent = event.name;
    eventLink.appendChild(eventName);

    const eventDescription = document.createElement('p');
    eventDescription.textContent = event.description;
    eventLink.appendChild(eventDescription);

    const eventDate = document.createElement('span');
    eventDate.classList.add('date');
    eventDate.textContent = `Date: ${event.date}`;
    eventLink.appendChild(eventDate);

    eventBox.appendChild(eventLink);

    return eventBox;
}

function displayEvents(events) {
    boxContainer.innerHTML = ''; // Clear existing content
    events.forEach((event) => {
        const eventBox = createEventBox(event);
        boxContainer.appendChild(eventBox);
        
    });
}

async function fetchEvents() {
    try {
        const response = await fetch('/event', { method: 'GET' });
        if (response.ok) {
            const events = await response.json();
            displayEvents(events);
        } else {
            throw new Error('Failed to fetch events');
        }
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// Fetch and display events when the page loads
fetchEvents();