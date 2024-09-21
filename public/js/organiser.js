document.addEventListener('DOMContentLoaded', () => {
  const eventLocationSelect = document.getElementById('event-location');
  const organiserEventForm = document.getElementById('organiserEvent-form');
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

  // Fetch venues and populate dropdown
  async function fetchVenues() {
    try {
      const response = await fetch('/venue');
      if (response.ok) {
        const venues = await response.json();
        populateDropdown(venues);
      } else {
        throw new Error('Failed to fetch venues');
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      alert('Failed to load venues. Please try again later.');
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

  // Check booked venues based on selected date
  async function checkBookedVenues(eventDate) {
    try {
      const response = await fetch(`/booked-venues?date=${eventDate}`);
      if (response.ok) {
        const bookedVenues = await response.json();
        updateVenueOptions(bookedVenues);
      } else {
        throw new Error('Failed to fetch booked venues');
      }
    } catch (error) {
      console.error('Error fetching booked venues:', error);
      alert('Failed to check booked venues. Please try again later.');
    }
  }

  function updateVenueOptions(bookedVenues) {
    const options = eventLocationSelect.options;
    let alertTriggered = false;

    for (let i = 0; i < options.length; i++) {
      const venueId = options[i].value;
      if (bookedVenues.includes(venueId)) {
        options[i].disabled = true;
        if (!alertTriggered) {
          alert(`The venue ${options[i].textContent} is booked for the selected date. Please choose a different date or venue.`);
          alertTriggered = true; // Only alert once
        }
      } else {
        options[i].disabled = false; // Ensure options are re-enabled if available
      }
    }
  }

  document.getElementById('event-date').addEventListener('change', (e) => {
    checkBookedVenues(e.target.value);
  });

  // Populate the dropdown when the page loads
  fetchVenues();

  organiserEventForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Collect organiser data
    const organiserName = document.getElementById('organiser-name').value;
    const organiserEmail = document.getElementById('organiser-email').value;
    const organiserPhone = document.getElementById('organiser-phone').value;

    // Validate organiser data
    if (!organiserName || !organiserEmail || !organiserPhone) {
      alert('Please fill in all fields for the organiser.');
      return; // Prevent form submission if validation fails
    }

    const organiserData = { organiserName, organiserEmail, organiserPhone };

    try {
      // Create organiser
      const organiserResponse = await fetch('/organiser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(organiserData)
      });

      if (!organiserResponse.ok) {
        const organiserDataResponse = await organiserResponse.json();
        console.log('Error creating organiser:', organiserDataResponse);
        return; // Exit if the organiser creation fails
      }

      const organiserDataResponse = await organiserResponse.json();
      const organiserId = organiserDataResponse._id;

      // Log the organiserId to ensure it's defined
      console.log('Organiser ID:', organiserId);

      // Create FormData from the organiserEventForm
      const eventData = new FormData(organiserEventForm);
      eventData.append('organiserId', organiserId); // Add organiser ID to event data

      const eventResponse = await fetch('/event', {
        method: 'POST',
        body: eventData
      });

      if (eventResponse.ok) {
        const eventDataResponse = await eventResponse.json();
        alert('Event created successfully');
        console.log('Event created successfully:', eventDataResponse);
        // Redirect to event page
        window.location.href = '/event.html';
      } else {
        const eventErrorData = await eventResponse.json();
        throw new Error(eventErrorData.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred: ${error.message}`);
    }
  });
});
