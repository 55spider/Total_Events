document.addEventListener('DOMContentLoaded', () => {
    var swiper = new Swiper(".mySwiper", {
        effect: "coverflow",
        centeredSlides: true,
        slidesPerView: "auto",
        coverflowEffect: {
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: true
        },
        pagination: {
            el: ".swiper-pagination",
            dynamicBullets: true,
        },
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        }
    });

    const container = document.getElementById('container');
    const signUpButton = document.getElementById('register');
    const signInButton = document.getElementById('login');
    const signUpToggleButton = document.getElementById('register-toggle');
    const signInToggleButton = document.getElementById('login-toggle');
    const signInError = document.getElementById('signInError');
    const signUpError = document.getElementById('signUpError');
    const logoutButton = document.getElementById('logout');

    if (signUpButton && signInButton && signUpToggleButton && signInToggleButton) {
        signUpButton.addEventListener('click', async () => {
            const name = document.getElementById('signUpName').value.trim();
            const email = document.getElementById('signUpEmail').value.trim();
            const password = document.getElementById('signUpPassword').value.trim();

            if (validateSignUp(name, email, password)) {
                try {
                    const response = await fetch('/signup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name, email, password })
                    });

                    const result = await response.json();

                    if (response.ok) {
                        console.log("Registration successful", result);
                        localStorage.setItem('userName', name);
                        window.location.href = "home.html";
                    } else {
                        const error = result.errors ? result.errors.map(err => err.msg).join(', ') : result.error;
                        signUpError.textContent = error;
                        signUpError.style.display = 'block';
                        console.log(`Error: ${error}`);
                    }
                } catch (error) {
                    signUpError.textContent = "An error occurred. Please try again.";
                    signUpError.style.display = 'block';
                    console.log(`Error: ${error}`);
                }
            } else {
                const error = "Invalid registration details. Please try again.";
                signUpError.textContent = error;
                signUpError.style.display = 'block';
                console.log(`Error: ${error}`);
            }
        });

        signInButton.addEventListener('click', async () => {
            const email = document.getElementById('signInEmail').value.trim();
            const password = document.getElementById('signInPassword').value.trim();

            if (validateLogin(email, password)) {
                try {
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    });

                    if (response.ok) {
                        window.location.href = "home.html";
                    } else {
                        const result = await response.json();
                        signInError.textContent = result.error;
                        signInError.style.display = 'block';
                    }
                } catch (error) {
                    signInError.textContent = "An error occurred. Please try again.";
                    signInError.style.display = 'block';
                }
            } else {
                const error = "Invalid email or password. Please try again.";
                signInError.textContent = error;
                signInError.style.display = 'block';
                console.log(`Error: ${error}`);
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            fetch('/logout', { method: 'POST' })
                .then(response => {
                    if (response.ok) {
                        window.location.replace('/login.html');
                    } else {
                        throw new Error('Logout failed');
                    }
                })
                .catch(error => {
                    console.error('Logout error:', error);
                    alert('Error logging out. Please try again.');
                });
        });
    }

    function validateLogin(email, password) {
        if (email === "" || password === "") {
            console.log("Login validation failed: Empty email or password"); // Debugging log
            return false;
        }
        if (password.length < 6) {
            console.log("Login validation failed: Password length < 6"); // Debugging log
            return false;
        }
        console.log("Login validation passed"); // Debugging log
        return true;
    }

    function validateSignUp(name, email, password) {
        if (name === "" || email === "" || password === "") {
            console.log("SignUp validation failed: Empty name, email, or password"); // Debugging log
            return false;
        }
        if (name.length < 2 || password.length < 6) {
            console.log("SignUp validation failed: Invalid name length or password length"); // Debugging log
            return false;
        }
        console.log("SignUp validation passed"); // Debugging log
        return true;
    }

    const ticketsDropdown = document.querySelector('.tickets-dropdown');
    if (ticketsDropdown) {
        const dropbtn = ticketsDropdown.querySelector('.dropbtn');
        const dropdownContent = ticketsDropdown.querySelector('.dropdown-content');

        ticketsDropdown.addEventListener('click', function (event) {
            if (event.target === dropbtn) {
                dropdownContent.classList.toggle('show');
            } else {
                dropdownContent.classList.remove('show');
            }
        });
    }
});
