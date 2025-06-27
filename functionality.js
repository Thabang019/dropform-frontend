    function showPage(pageId) {
            console.log("Showing page:", pageId);
            
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
            
            // Update navigation buttons
            updateNavigation(pageId);
    }

    // Navigation update function
        function updateNavigation(pageId) {
            const loginBtn = document.getElementById('loginBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            
            if (!loginBtn || !logoutBtn) return;
            
            // Show logout only on dashboard, show login otherwise
            const isDashboard = pageId === 'dashboard';
            loginBtn.style.display = isDashboard ? 'none' : 'block';
            logoutBtn.style.display = isDashboard ? 'block' : 'none';
            
            // Optional: Update active nav link styling
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.toggle('active', link.getAttribute('onclick')?.includes(`'${pageId}'`));
            });
        }

        // Logout function
        document.getElementById("logoutBtn").addEventListener("click", logoutUser);
        function logoutUser() {
            console.log("Logging out...");
            // Add your logout logic here (clear session, etc.)
            showPage('home'); // Redirect to home after logout
            return false; // Prevent default anchor behavior
        }

        // Initialize on load
        document.addEventListener('DOMContentLoaded', function() {
            // Load page from URL hash or default to home
            const pageFromHash = window.location.hash.substring(1);
            const initialPage = pageFromHash || 'home';
            showPage(initialPage);
            
            // Handle back/forward navigation
            window.addEventListener('hashchange', function() {
                const pageFromHash = window.location.hash.substring(1);
                if (pageFromHash) {
                    showPage(pageFromHash);
                }
            });
        });

    
    document.addEventListener("DOMContentLoaded", () => {
    
    let currentUser = null;
    
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
    document.getElementById("generateBtn").addEventListener("click", generateForm);
    document.getElementById("staticForm").addEventListener("click", copyStaticForm);
    document.getElementById("GeneratedCode").addEventListener("click", copyGeneratedCode);
    
        
    const GEMINI_API_KEY = "AIzaSyC6D0f4-yB-JJD54aqhtpJOzU6SGMK4hvk"; // Replace with your actual API key
        
        async function generateForm() {
            const prompt = document.getElementById("prompt-input").value.trim();
            const outputTextarea = document.getElementById("generated-code");
            const token = "DEMO_TOKEN";

            if (!prompt) {
                outputTextarea.value = "Please describe your form before generating.";
                return;
            }

            if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-actual-api-key-here") {
                outputTextarea.value = "Error: Please set your actual Gemini API key in the code.";
                return;
            }

            outputTextarea.value = "Loading AI library...";

            try {
                // Add timeout to prevent hanging
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Operation timed out after 30 seconds")), 30000);
                });

                await Promise.race([loadGeminiScript(), timeoutPromise]);
                
                outputTextarea.value = "Generating form...";
                
                const formHtml = await Promise.race([
                    generateWithGemini(prompt, token, GEMINI_API_KEY),
                    timeoutPromise
                ]);
                
                outputTextarea.value = formHtml;
            } catch (error) {
                console.error("Error:", error);
                outputTextarea.value = "Error: " + error.message + "\n\nTry refreshing the page and trying again.";
            }
        }

        function copyGeneratedCode() {
            const code = document.getElementById("generated-code");
            code.select();
            document.execCommand("copy");
            alert("Code copied to clipboard!");
        }

        // Simplified script loading - try multiple approaches
        async function loadGeminiScript() {
            // Method 1: Try ES modules first (most reliable)
            try {
                if (!window.GoogleGenerativeAI) {
                    console.log("Loading Gemini library via dynamic import...");
                    const module = await import('https://esm.run/@google/generative-ai');
                    window.GoogleGenerativeAI = module.GoogleGenerativeAI;
                    console.log("Gemini library loaded successfully");
                }
                return;
            } catch (error) {
                console.log("ES modules failed, trying UMD approach:", error);
            }

        // Method 2: Fallback to UMD script loading
        return new Promise((resolve, reject) => {
                if (window.GoogleGenerativeAI) {
                    resolve();
                    return;
                }

                console.log("Loading UMD script...");
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/@google/generative-ai@latest/dist/index.umd.js';
                
                script.onload = () => {
                    console.log("UMD script loaded");
                    // Check multiple possible global names
                    setTimeout(() => {
                        if (window.GoogleGenerativeAI || window.google?.generativeai) {
                            window.GoogleGenerativeAI = window.GoogleGenerativeAI || window.google.generativeai.GoogleGenerativeAI;
                            resolve();
                        } else {
                            reject(new Error("Library loaded but GoogleGenerativeAI not found"));
                        }
                    }, 500);
                };
                
                script.onerror = () => {
                    reject(new Error("Failed to load Gemini library"));
                };
                
                document.head.appendChild(script);
            });
        }

    async function generateWithGemini(prompt, token, apiKey) {
        try {
            console.log("Initializing Gemini AI...");
            
            if (!window.GoogleGenerativeAI) {
                throw new Error("GoogleGenerativeAI library not available");
            }

        const genAI = new window.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Sending request to Gemini...");

        const result = await model.generateContent([
            `Generate a clean HTML contact form based on this description: "${prompt}"

            Requirements:
            1. Basic structure must be:
            <form action="https://dropform.dev/your-unique-id" method="POST">
            <input type="hidden" name="token" value="${token}">
            <!-- fields go here -->
            <button type="submit">Send Message</button>
            </form>

            2. Always include these required fields:
            - Name (text input with name="name")
            - Email (email input with name="email") 
            - Message (textarea with name="message")

            3. Only add these optional fields if mentioned:
            - Phone number (if "phone" is mentioned, name="phone")
            - Subject (if "subject" is mentioned, name="subject")

            4. Include proper labels for accessibility
            5. Never include CSS, JavaScript, or comments
            6. Return ONLY the HTML code, nothing else.`

        ]);

        const response = await result.response;
        const text = response.text();

        console.log("Received response from Gemini");

        if (!text || !text.includes("<form")) {
            throw new Error("Invalid form generated by AI");
        }

        return text.trim();
    } catch (error) {
        console.error("Gemini API Error:", error);
        
        // Provide helpful error messages
        if (error.message.includes("API_KEY")) {
            throw new Error("Invalid API key. Please check your Gemini API key.");
        } else if (error.message.includes("quota")) {
            throw new Error("API quota exceeded. Please try again later.");
        } else if (error.message.includes("network")) {
            throw new Error("Network error. Please check your connection.");
        } else {
            throw new Error(`AI generation failed: ${error.message}`);
        }
    }
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