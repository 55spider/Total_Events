document.addEventListener('DOMContentLoaded', () => {

    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    const signUpForm = document.querySelector('.form-container.sign-up form');
    const signInForm = document.querySelector('.form-container.sign-in form');


    registerBtn.addEventListener('click', () => {
        container.classList.add("active");
    });
    
    loginBtn.addEventListener('click', () => {
        container.classList.remove("active");
    });

   
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('signUpName').value.trim();
            const email = document.getElementById('signUpEmail').value.trim();
            const password = document.getElementById('signUpPassword').value.trim();

            if (validateSignUp (name, email, password)) {
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
                        localStorage.setItem('userName', name);
                        alert(`Welcome ${localStorage.getItem('userName')}`);
                        console.log("Registration successful", result);
                        window.location.href = "home.html";
                    } else {
                        console.log(`Error: ${error}`);
                        alert(`Error: ${error}`);
                    }
                } catch (error) {
                    console.log(`Error: ${error}`);
                }
            } else {
                const error = "Invalid registration details. Please try again.";
                console.log(`Error: ${error}`);
            }
        });

        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('signInEmail').value.trim();
            const password = document.getElementById('signInPassword').value.trim();
            
            console.log(`Logging in with email: ${email}`);
            console.log(`Logging in with password: ${password}`);


            if (validateLogin(email, password)) {
                try {
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    });

                    const result = await response.json();

                    if (response.ok) {
                        console.log("Login successful");
                       localStorage.setItem('userEmail', email);
                       alert(`Welcome ${localStorage.getItem('userEmail')}`);
                       window.location.href = "home.html";
                    } else {
                        console.log('Error logging in user:', result);
                        alert(`Error logging in user: ${result.error || 'An error occurred'}`);
                    }
                } catch (error) {
                    console.log('Error:', error);
                }
            } else {
                const error = "Invalid email or password. Please try again.";
                console.log(`Error: ${error}`);
                alert(`Error: ${error}`);
            }
        });
    

    function validateLogin(email, password) {
        if (email.trim() === "") {
            console.log("Email is required"); // Debugging log
            alert('Email is required')
            return false;
        }
        if (password.trim() === "") {
            console.log("Password is required"); // Debugging log
            alert('Password is required')
            return false;
        }
        if (password.length < 6) {
            console.log("Password must be at least 6 characters long"); // Debugging log
            alert('Password must be at least 6 characters long')
            return false;
        }
        return true;
    }

        function validateSignUp(name, email, password) {
            if (name.trim() === "") {
                console.log("Name is required"); // Debugging log
                alert('Name is required')
                return false;
            }
            if (email.trim() === "") {
                console.log("Email is required"); // Debugging log
                alert('Email is required')
                return false;
            }
            if (password.trim() === "") {
                console.log("Password is required"); // Debugging log
                alert('Password is required')
                return false;
            }
            if (password.length < 6) {
                console.log("Password must be at least 6 characters long"); // Debugging log
                alert('Password must be at least 6 characters long')
                return false;
            }
        return true;
        }
    });
