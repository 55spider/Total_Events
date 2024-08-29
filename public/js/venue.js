document.addEventListener('DOMContentLoaded', () => {
    const venuesList = document.getElementById('venues-list');

    function createVenueBox(venue) {
        const venueBox = document.createElement('div');
        venueBox.classList.add('venue-box');

        if (venue.image) {
            const venueImage = document.createElement('img');
            venueImage.src = venue.image;
            venueImage.alt = "Venue Image";
            venueBox.appendChild(venueImage);
        }

        const venueName = document.createElement('h3');
        venueName.textContent = venue.name;
        venueBox.appendChild(venueName);

        const venueLocation = document.createElement('p');
        venueLocation.textContent = `Location: ${venue.location}`;
        venueBox.appendChild(venueLocation);

        const venueCapacity = document.createElement('p');
        venueCapacity.textContent = `Capacity: ${venue.capacity}`;
        venueBox.appendChild(venueCapacity);
        
        // Create the link element and wrap the venueBox
        const venueLink = document.createElement('a');
        venueLink.href = `/organiser.html?venueName=${encodeURIComponent(venue.name)}`;
        venueLink.appendChild(venueBox);

        return venueLink;
    }

    function displayVenues(venues) {
        venuesList.innerHTML = ''; // Clear existing content
        venues.forEach((venue) => {
            const venueBox = createVenueBox(venue);
            venuesList.appendChild(venueBox);
        });
    }

    async function fetchVenues() {
        try {
            const response = await fetch('/venue', { method: 'GET' });
            if (response.ok) {
                const venues = await response.json();
                displayVenues(venues);
            } else {
                throw new Error('Failed to fetch venues');
            }
        } catch (error) {
            console.error('Error fetching venues:', error);
        }
    }

    // Fetch and display venues when the page loads
    fetchVenues();
});
