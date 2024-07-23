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
        const ticketItem = document.createElement('div');
        ticketItem.textContent = `${ticket.quantity} x ${ticket.ticketType} - ${ticket.email} - ${ticket.name}`;
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
            quantity: data.quantity
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
                addTicketToDropdown({
                    name: data.name,
                    email: data.email,
                    ticketType: data.ticketType,
                    quantity: data.quantity
                });
                ticketForm.reset();
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

    const ticketsDropdown = document.querySelector('.tickets-dropdown');
    const dropbtn = ticketsDropdown.querySelector('.dropbtn');
    const dropdownContent = ticketsDropdown.querySelector('.dropdown-content');

    ticketsDropdown.addEventListener('click', function(event) {
        if (event.target === dropbtn) {
            dropdownContent.classList.toggle('show');
        } else {
            dropdownContent.classList.remove('show');
        }
    });

    async function fetchTickets() {
        try {
            const response = await fetch('/tickets');
            if (!response.ok) {
                throw new Error('Failed to fetch tickets');
            }
            const tickets = await response.json();

            const ticketList = document.getElementById('ticket-list');
            ticketList.innerHTML = '';

            tickets.forEach(ticket => {
                const ticketElement = document.createElement('a');
                ticketElement.href = `ticket.html?id=${ticket.id}`;
                ticketElement.textContent = `${ticket.ticketType}  Ticket for ${ticket.name} (${ticket.quantity})`;
                ticketList.appendChild(ticketElement);
            });
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    }

    window.onload = fetchTickets;
});
