    document.addEventListener("DOMContentLoaded", () => {
    
    let currentUser = null;
    
    function showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update URL hash
        window.location.hash = pageId;
    }

        // Replace this with your actual backend URL
        const API_BASE_URL = 'http://localhost:8080/api/user/send';
        


        // Handle Login/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        document.getElementById('loginForm').addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            try {
                const response = await fetch(`${API_BASE_URL}/signin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ loginEmail: email, loginPassword: password })
                });

                let result = {};
                try {
                    result = await response.json();
                } catch (err) {
                    console.warn("Could not parse response JSON");
                }

                if (response.ok) {
                    localStorage.setItem("authToken", result.token);
                    localStorage.setItem("userEmail", email);

                    alert("Login successful!");
                    showPage('dashboard');

                    // Now retrieve the form token using the email
                    await loadUserTokenByEmail(email);

                } else {
                    alert("Login failed: " + (result.message || "Invalid credentials."));
                }
            } catch (err) {
                alert("Network error. Please try again later.");
                console.error("Fetch error:", err);
            }
        });

        // Handle Signup/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        document.getElementById('signupForm').addEventListener('submit', async function (e) {
            e.preventDefault();

            const firstName = document.getElementById('signupFirstName').value.trim();
            const lastName = document.getElementById('signupLastName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();

            if (password !== confirmPassword) {
                return alert("Passwords do not match.");
            }

            if (!document.getElementById('agreeTerms').checked) {
                return alert("You must agree to the Terms of Service and Privacy Policy.");
            }

            const response = await fetch(`${API_BASE_URL}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nameUser: firstName,
                    lastNameUser: lastName,
                    emailUser: email,
                    password: password
                })
            });

            const result = await response.json();
            if (response.ok) {
                alert("Account created successfully!");
                showPage('dashboard');
            } else {
                alert("Signup failed: " + (result.message || "Unknown error."));
            }
        });

        document.addEventListener("DOMContentLoaded", () => {
            const token = localStorage.getItem("authToken");
            if (token) {
                showPage('dashboard'); // Auto-login
            } else {
                showPage('home');
            }
        });

        // Handle contact form/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        document.getElementById('contactForm').addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = document.getElementById('firstName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            const token = document.getElementById('contactToken').value.trim(); // hidden input or auto-filled

            const payload = {
                name,
                email,
                subject,
                message,
                token
            };

            try {
                const response = await fetch('http://localhost:8080/api/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    showNotification('✅ Message sent successfully! We\'ll get back to you soon.', 'success');
                    this.reset();
                } else {
                    const error = await response.json();
                    showNotification('❌ Error sending message: ' + (error.message || 'Please try again.'), 'error');
                }
            } catch (err) {
                console.error('Network error:', err);
                showNotification('❌ Network error. Please try again later.', 'error');
            }
        });

    // Logout function///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function logout() {
        localStorage.removeItem("authToken");
        showPage('login');
    }

    // Get the token using email/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async function loadUserTokenByEmail(email) {
        const jwt = localStorage.getItem("authToken");

        if (!jwt) {
            alert("Missing auth token. Please log in again.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/retrieveToken/${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });

            const result = await response.json();

            if (response.ok && result.token) {
                window.userToken = result.token;

                // Extract user details
                const userName = result.userEmail?.nameUser || "User"; // Fallback to "User" if missing
                const userLastName = result.userEmail?.lastNameUser || "";

                // Update welcome message with the user's name instead of email
                document.getElementById("username").innerText = `${userName} ${userLastName}`.trim();
                
                // Update form preview (if needed)
                document.getElementById("static-form").value = generateStaticForm(result.token);
            } else {
                alert("Failed to retrieve form token. Check your credentials or permissions.");
            }
        } catch (err) {
            console.error("Token fetch error:", err);
            alert("Could not fetch token from server.");
        }
    }
        

    // Utility to generate form
    function generateStaticForm(token) {
        return `<form action="https://yourplatform.com/api/submit" method="POST">
    <input type="hidden" name="token" value="${token}">

    <label>Name:</label>
    <input type="text" name="name" required>

    <label>Email:</label>
    <input type="email" name="email" required>

    <label>Message:</label>
    <textarea name="message" required></textarea>

    <button type="submit">Send</button>
    </form>`;
    }

    // Update AI Generator/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function generateForm() {
        const prompt = document.getElementById("prompt-input").value.toLowerCase();
        const output = document.getElementById("generated-code");

        let fields = "";

        if (prompt.includes("name")) {
            fields += '  <label>Name:</label>\n  <input type="text" name="name" required>\n\n';
        }
        if (prompt.includes("email")) {
            fields += '  <label>Email:</label>\n  <input type="email" name="email" required>\n\n';
        }
        if (prompt.includes("subject")) {
            fields += '  <label>Subject:</label>\n  <input type="text" name="subject">\n\n';
        }
        if (prompt.includes("message")) {
            fields += '  <label>Message:</label>\n  <textarea name="message" required></textarea>\n\n';
        }

        const token = window.userToken || "your_token_here";
        const formTemplate = `<form action="https://yourplatform.com/api/submit" method="POST">
                            <input type="hidden" name="token" value="${token}">

        ${fields}  <button type="submit">Send</button>
        </form>`;

        output.value = formTemplate;
    }

    function copyGeneratedCode() {
        const textarea = document.getElementById("generated-code");
        textarea.select();
        document.execCommand("copy");
        alert("Generated form code copied!");
    }

    function copyStaticForm() {
        const textarea = document.getElementById("static-form");
        textarea.select();
        document.execCommand("copy");
        alert("Contact form code copied!");
    }

    // Notification system/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'success' ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(21, 128, 61, 0.9))' : 
                       type === 'error' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(185, 28, 28, 0.9))' : 
                       'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    function copyCode() {
        const codeBlock = document.getElementById('code-block');
        const text = codeBlock.textContent || codeBlock.innerText;
        
        navigator.clipboard.writeText(text).then(() => {
            const button = document.querySelector('.copy-button');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.background = 'rgba(34, 197, 94, 0.2)';
            button.style.color = '#22c55e';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = 'rgba(255, 255, 255, 0.1)';
                button.style.color = '#b0b0b0';
            }, 2000);
        });
    }

    // Handle initial page load
    window.addEventListener('load', function() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showPage(hash);
        }
    });

    // Handle browser back/forward
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showPage(hash);
        } else {
            showPage('home');
        }
    });

    // Smooth scrolling for anchor links/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // If it's a page navigation, use showPage
            if (document.getElementById(targetId) && document.getElementById(targetId).classList.contains('page')) {
                showPage(targetId);
            } else {
                // Otherwise, smooth scroll to element
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Add scroll-based animations/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);


    // Observe elements for animation
    document.querySelectorAll('.step, .feature').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Enhanced token management
    function deleteToken(tokenId) {
        if (confirm('Are you sure you want to delete this token? This action cannot be undone.')) {
            showNotification('Token deleted successfully', 'success');
            // In a real app, you would remove the token from the list here
        }
    }

    // Add some interactive features for better UX
    document.addEventListener('DOMContentLoaded', function() {
        // Add loading states to buttons
        const buttons = document.querySelectorAll('button, .cta-button');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                if (this.type === 'submit') {
                    const originalText = this.textContent;
                    this.textContent = 'Processing...';
                    this.disabled = true;
                    
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.disabled = false;
                    }, 2000);
                }
            });
        });

        // Add form validation feedback/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.checkValidity()) {
                    this.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                } else {
                    this.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }
            });

            input.addEventListener('input', function() {
                this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            });
        });
    });

    // Smooth scrolling for anchor links/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    });