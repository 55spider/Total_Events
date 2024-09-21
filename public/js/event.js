document.addEventListener('DOMContentLoaded', () => {
  // Function to create a box for each event
  function createEventBox(event) {
      const eventBox = document.createElement('div');
      eventBox.classList.add('box');

      const eventLink = document.createElement('a');
      eventLink.href = `/ticket.html?eventId=${event._id}`;

      if (event.image) {
          const eventImage = document.createElement('img');
          eventImage.src = event.image;
          eventImage.alt = event.name || 'Event Image'; // Better alt text
          eventBox.appendChild(eventImage);
      }

      const eventName = document.createElement('h3');
      eventName.textContent = event.name.toUpperCase();
      eventLink.appendChild(eventName);

      const eventDescription = document.createElement('p');
      eventDescription.textContent = event.description;
      eventLink.appendChild(eventDescription);

      const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
      });

      const eventDate = document.createElement('span');
      eventDate.classList.add('date');
      eventDate.textContent = `Date: ${formattedDate}`;
      eventLink.appendChild(eventDate);

      eventBox.appendChild(eventLink);

      return eventBox;
  }

  // Function to display all events in the box container
  function displayEvents(events) {
      const boxContainer = document.getElementById('eventBoxContainer');
      if (!boxContainer) {
          console.error('Element with ID "eventBoxContainer" not found.');
          return;
      }

      boxContainer.innerHTML = ''; // Clear existing content
      events.forEach(event => {
          const eventBox = createEventBox(event);
          boxContainer.appendChild(eventBox);
      });

      console.log('Events displayed in boxContainer:', boxContainer);
  }

  // Fetch events from the server
  async function fetchEvents() {
      try {
          const response = await fetch('/event', { method: 'GET' });
          if (response.ok) {
              const events = await response.json();
              displayEvents(events); // Call displayEvents within fetchEvents
          } else {
              throw new Error('Failed to fetch events');
          }
      } catch (error) {
          console.error('Error fetching events:', error);
          alert('Failed to load events. Please try again later.');
      }
  }

  // Fetch events on page load
  fetchEvents();
});
