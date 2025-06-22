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

    // Handle login form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simulate login (in real app, this would make an API call)
        if (email && password) {
            currentUser = { email: email, name: email.split('@')[0] };
            showPage('dashboard');
            
            // Update user info in dashboard
            document.querySelector('.user-info span').textContent = email;
            document.querySelector('.user-avatar').textContent = email.charAt(0).toUpperCase();
            
            // Show success message
            showNotification('Login successful!', 'success');
        }
    });

    // Handle contact form
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simulate form submission
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        
        // Reset form
        this.reset();
    });

    // Logout function
    function logout() {
        currentUser = null;
        showPage('home');
        showNotification('Logged out successfully', 'info');
    }

    // Token management functions
    function copyToken(tokenId) {
        const tokenUrl = `https://dropform.dev/${tokenId}`;
        navigator.clipboard.writeText(tokenUrl).then(() => {
            showNotification('Token URL copied to clipboard!', 'success');
        });
    }

    function addNewToken() {
        const tokenName = prompt('Enter a name for your new token:');
        if (tokenName) {
            // Simulate token creation
            const newTokenId = 'df_' + Math.random().toString(36).substr(2, 12);
            showNotification(`New token "${tokenName}" created!`, 'success');
            // In a real app, you would refresh the token list here
        }
    }

    // Notification system
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

    // Smooth scrolling for anchor links
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

    // Add scroll-based animations
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

    function viewTokenStats(tokenId) {
        showNotification('Token statistics feature coming soon!', 'info');
        // In a real app, this would show detailed analytics
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

        // Add form validation feedback
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

    // Smooth scrolling for anchor links
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