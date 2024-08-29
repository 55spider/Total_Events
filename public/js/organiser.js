document.addEventListener('DOMContentLoaded', () => {
    const eventLocationSelect = document.getElementById('event-location');
    const form = document.getElementById('organiser-form');
    const urlParams = new URLSearchParams(window.location.search);
    const venueName = urlParams.get('venueName');
  
    // Add venue option to dropdown if venueName is in the URL params
    if (venueName) {
      const venueOption = document.createElement('option');
      venueOption.value = venueName;
      venueOption.textContent = venueName;
      eventLocationSelect.appendChild(venueOption);
      eventLocationSelect.value = venueName;
    }
  
    async function fetchVenues() {
      try {
        const response = await fetch('/venue', { method: 'GET' });
        if (response.ok) {
          const venues = await response.json();
          populateDropdown(venues);
        } else {
          throw new Error('Failed to fetch venues');
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
      }
    }
  
    function populateDropdown(venues) {
      // Clear existing options
      eventLocationSelect.innerHTML = '<option value="" disabled selected>Choose a venue</option>';
  
      venues.forEach((venue) => {
        const option = document.createElement('option');
        option.value = venue.name;
        option.textContent = venue.name;
        eventLocationSelect.appendChild(option);
      });
    }
  
    async function checkBookedVenues(eventDate) {
      try {
        const response = await fetch(`/booked-venues?date=${eventDate}`, { method: 'GET' });
        if (response.ok) {
          const bookedVenues = await response.json();
          const options = eventLocationSelect.options;
          for (let i = 0; i < options.length; i++) {
            const venueId = options[i].value;
            if (bookedVenues.includes(venueId)) {
              options[i].disabled = true;
              const errorMessage = `There is an event scheduled on ${eventDate} at ${options[i].textContent}. Please choose a different date or venue.`;
              alert(errorMessage);
              break; // Exit the loop if a booked venue is found
            }
          }
        } else {
          const errorMessage = response.statusText || 'Failed to fetch booked venues';
          console.error('Error fetching booked venues:', errorMessage);
          alert(`Failed to check booked venues: ${errorMessage}`);
        }
      } catch (error) {
        console.error('Error fetching booked venues:', error);
        alert('Failed to check booked venues. Please try again later.');
      }
    }
    
    document.getElementById('event-date').addEventListener('change', (e) => {
      checkBookedVenues(e.target.value);
    });
  
    // Populate the dropdown when the page loads
    fetchVenues();
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      // Organiser data
      const organiserName = document.getElementById('organiser-name').value;
      const organiserEmail = document.getElementById('organiser-email').value;
      const organiserPhone = document.getElementById('organiser-phone').value;
  
      if (!organiserName || !organiserEmail || !organiserPhone) {
        alert('Please fill in all fields for the organiser.');
        return;  // Prevent form submission if validation fails
      }
  
      const organiserData = {
        organiserName,
        organiserEmail,
        organiserPhone
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
          alert(`Error creating organiser: ${data.message || 'An error occurred'}`);
          return;
        }
  
        console.log('Organiser created successfully:', data);
  
        // Send event data here
        const eventData = new FormData(form);
        try {
          const response = await fetch('/event', {
            method: 'POST',
            body: eventData
          });
  
          if (response.ok) {
            const data = await response.json();
            alert('Event created successfully');
            console.log('Event created successfully:', data);
            form.reset(); //  form reset 
          } else {
            const errorData = await response.json();
            console.error('Error creating event:', errorData);
            alert(`Error creating event: ${errorData.message || 'An error occurred'}`);
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while creating the event.');
        }
      } catch (error) {
        console.error('Error submitting organiser data:', error);
      }
    });
  });
  