document.addEventListener('DOMContentLoaded', function() {
    const ticketForm = document.getElementById('ticket-form');
    const quantityInput = document.getElementById('quantity');
    const ticketTypeSelect = document.getElementById('ticket-type');
    const totalPriceDiv = document.getElementById('total-price');
    const ticketList = document.getElementById('ticket-list');

    const ticketPrices = {
        VIP: 1000,
        General: 500,
        Student: 100
    };

    function updateTotalPrice() {
        const quantity = parseInt(quantityInput.value, 10) || 0;
        const ticketType = ticketTypeSelect.value;
        const price = ticketPrices[ticketType] || 0;
        const totalPrice = quantity * price;
        totalPriceDiv.textContent = `Total Price: $${totalPrice}`;
    }

    function addTicketToDropdown(ticket) {
        const ticketList = document.getElementById('ticketList');
        const ticketItem = document.createElement('div');
        ticketItem.className = 'ticket-item';
    
        // Creating a container for details
        const ticketDetails = document.createElement('div');
        ticketDetails.className = 'ticket-details';
    
        // Creating elements for each detail
        const quantity = document.createElement('div');
        quantity.className = 'ticket-detail';
        quantity.textContent = `Quantity: ${ticket.quantity}`;
        
        const ticketType = document.createElement('div');
        ticketType.className = 'ticket-detail';
        ticketType.textContent = `Type: ${ticket.ticketType}`;
    
        const email = document.createElement('div');
        email.className = 'ticket-detail';
        email.textContent = `Email: ${ticket.email}`;
        
        const name = document.createElement('div');
        name.className = 'ticket-detail';
        name.textContent = `Name: ${ticket.name}`;
    
        // Append details to ticketDetails
        ticketDetails.appendChild(quantity);
        ticketDetails.appendChild(ticketType);
        ticketDetails.appendChild(email);
        ticketDetails.appendChild(name);
    
        // Append ticketDetails to ticketItem
        ticketItem.appendChild(ticketDetails);
    
        ticketList.appendChild(ticketItem);
    }
    

    function validateForm(data) {
        const requiredFields = ['name', 'email', 'ticketType', 'quantity'];
        for (let field of requiredFields) {
            if (!data[field]) {
                return `Field ${field} is required.`;
            }
        }
        return null;
    }

    quantityInput.addEventListener('input', updateTotalPrice);
    ticketTypeSelect.addEventListener('change', updateTotalPrice);

    ticketForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(ticketForm);
        const data = {};
        formData.forEach((value, key) => data[key] = value);

        const validationError = validateForm(data);
        if (validationError) {
            alert(validationError);
            return;
        }

        const ticketData = {
            name: data.name,
            email: data.email,
            ticketType: data.ticketType,
            quantity: data.quantity,
            price: ticketPrices[data.ticketType]
        };

        try {
            const response = await fetch('/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketData)
            });

            if (response.ok) {
                alert('Ticket booked successfully!');
                addTicketToDropdown(ticketData);
                ticketForm.reset();
                window.location.href = 'event.html';
                totalPriceDiv.textContent = 'Total Price: $0';
            } else {
                const errorData = await response.json();
                console.error('Failed to book ticket:', errorData);
                alert(`Error booking ticket: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error booking ticket:', error);
            alert('Error booking ticket');
        }
    });

    async function fetchTickets() {
        try {
            const response = await fetch('/tickets', {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch tickets');
            }
            const tickets = await response.json();

            ticketList.innerHTML = ''; // Clear existing tickets

            tickets.forEach(ticket => {
                const ticketElement = document.createElement('a');
                ticketElement.href = `ticket.html?id=${ticket.id}`;
                ticketElement.textContent = `Ticket for ${ticket.name} (${ticket.ticketType}, ${ticket.quantity})`;
                ticketList.appendChild(ticketElement);
            });
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    }

    fetchTickets();
});
