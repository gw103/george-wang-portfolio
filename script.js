// Chatbot functionality
class Chatbot {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.apiKey = 'AIzaSyBkw6dqrouC-Jl8Xe3QiyP83lOQTPdWYmQ';
        this.model = 'gemini-1.5-flash';
        this.context = this.createContext();
        this.init();
    }

    createContext() {
        return `You are George (Gezhi) Wang, a Data Scientist and Machine Learning Engineer. You are speaking directly to visitors of your portfolio website. Here's information about yourself:

ABOUT YOU:
- You are currently a Master's student in Systems Engineering at Cornell University (Computational and Data Science Track)
- You graduated from Duke University & Duke Kunshan University with a Bachelor's in Data Science
- You published a first-author paper at IEEE ICC 2024
- You are actively seeking full-time opportunities as a Data Scientist or ML Engineer

CURRENT INTERNSHIP:
- You work as a Data Science Intern at Humanwell Pharmaceutical US, Inc. (June 2024 – Present)
- You developed an MSD prediction model using SMILES molecular structures with 60% accuracy
- You saved $25,000 in costs through automated predictions
- You built a visualization dashboard on AWS EC2

PREVIOUS EXPERIENCE:
- You worked as a Market Research Analyst at Mobalytics (June 2022 – August 2022)
- You reduced manual reporting time by 40% through automation
- You built interactive dashboards in Tableau

YOUR KEY PROJECTS:
1. CMI Kaggle Multi-Branch Model - Multi-sensor fusion for BFRB detection using Helios device
2. Neural Network Nowcasting (NiNo+) - Parameter prediction achieving 44% training time reduction
3. MoveSAI Emissions Prediction - MLP model with 90% R² accuracy, deployed on Google Cloud
4. FOB Test Analysis Dashboard - Streamlit dashboard with AI-powered reporting
5. Drug Discovery ML Pipeline - SMILES-based prediction model
6. KobeNet - Chest X-ray disease detection with ResNet-50

YOUR SKILLS:
- Programming: Python, SQL, C++
- ML/AI: PyTorch, Scikit-learn, TensorFlow, XGBoost, RDKit
- Cloud & Tools: AWS, Google Cloud, Docker, Git, Tableau, Streamlit

RESPONSE GUIDELINES:
- Speak in first person as George Wang
- Be friendly, professional, and enthusiastic about your work
- Share your passion for data science and machine learning
- Be conversational and approachable
- Show your personality and interests
- Always maintain a professional but warm tone
- Use "I" and "my" when referring to yourself and your work`;
    }

    init() {
        this.toggle = document.getElementById('chatbot-toggle');
        this.container = document.getElementById('chatbot-container');
        this.closeBtn = document.getElementById('chatbot-close');
        this.messagesContainer = document.getElementById('chatbot-messages');
        this.inputField = document.getElementById('chatbot-input-field');
        this.sendBtn = document.getElementById('chatbot-send');

        this.toggle.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isTyping) {
                this.sendMessage();
            }
        });

        // Auto-open chatbot after 5 seconds
        setTimeout(() => {
            if (!this.isOpen) {
                this.showWelcomeMessage();
            }
        }, 5000);
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.container.classList.add('active');
            this.inputField.focus();
        } else {
            this.container.classList.remove('active');
        }
    }

    closeChat() {
        this.isOpen = false;
        this.container.classList.remove('active');
    }

    showWelcomeMessage() {
        // Show a subtle notification that chatbot is available
        this.toggle.style.animation = 'pulse 2s infinite';
        setTimeout(() => {
            this.toggle.style.animation = '';
        }, 6000);
    }

    async sendMessage() {
        const message = this.inputField.value.trim();
        if (!message || this.isTyping) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.inputField.value = '';
        this.sendBtn.disabled = true;

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.removeTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.", 'bot');
            console.error('Chatbot error:', error);
        }

        this.sendBtn.disabled = false;
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        if (sender === 'bot') {
            const avatarImg = document.createElement('img');
            avatarImg.src = 'George.jpg';
            avatarImg.alt = 'George';
            avatarImg.className = 'message-avatar';
            messageDiv.appendChild(avatarImg);
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        this.messagesContainer.appendChild(messageDiv);
        
        this.scrollToBottom();
    }

    showTypingIndicator() {
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message typing-message';
        
        const avatarImg = document.createElement('img');
        avatarImg.src = 'George.jpg';
        avatarImg.alt = 'George';
        avatarImg.className = 'message-avatar';
        typingDiv.appendChild(avatarImg);
        
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'typing-indicator';
        indicatorDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        typingDiv.appendChild(indicatorDiv);
        
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        this.isTyping = false;
        const typingMessage = this.messagesContainer.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async getAIResponse(userMessage) {
        const prompt = `${this.context}\n\nUser: ${userMessage}\n\nAssistant:`;
        
        try {
            console.log('Sending request to Gemini API...');
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                const responseText = data.candidates[0].content.parts[0].text;
                console.log('AI Response:', responseText);
                return responseText;
            } else {
                console.error('Unexpected API response structure:', data);
                throw new Error('Invalid response structure from Gemini API');
            }
        } catch (error) {
            console.error('Gemini API Error:', error);
            console.log('Falling back to mock response...');
            // Fallback to mock responses if API fails
            return this.getFallbackResponse(userMessage);
        }
    }

    getFallbackResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // More comprehensive keyword matching - speaking as George
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return 'Hi there! I\'m George, and I\'m excited to chat with you! Feel free to ask me about my projects, work experience, or anything else you\'d like to know!';
        } else if (lowerMessage.includes('project') || lowerMessage.includes('work') || lowerMessage.includes('cmi') || lowerMessage.includes('nino') || lowerMessage.includes('movesai')) {
            return 'I\'ve worked on some really exciting projects that I\'m proud of:\n\n• **CMI Kaggle Multi-Branch Model** - Multi-sensor fusion for BFRB detection\n• **Neural Network Nowcasting (NiNo+)** - Achieved 44% training time reduction\n• **MoveSAI Emissions Prediction** - Got 90% R² accuracy with Google Cloud deployment\n• **FOB Test Analysis Dashboard** - Built a comprehensive Streamlit dashboard\n• **Drug Discovery ML Pipeline** - Saved $25,000 in costs for my company\n• **KobeNet** - Chest X-ray disease detection with ResNet-50\n\nI\'d love to tell you more about any specific project that interests you!';
        } else if (lowerMessage.includes('experience') || lowerMessage.includes('intern') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
            return 'I have some great professional experience:\n\n**Current Role:**\nI\'m currently a Data Science Intern at Humanwell Pharmaceutical US, Inc. (June 2024 - Present)\n- Developed an MSD prediction model with 60% accuracy\n- Saved $25,000 in reagent and labor costs\n- Built a visualization dashboard on AWS EC2\n\n**Previous Role:**\nI worked as a Market Research Analyst at Mobalytics (June 2022 - August 2022)\n- Reduced manual reporting time by 40%\n- Built interactive Tableau dashboards\n\nI\'m actively seeking full-time opportunities as a Data Scientist or ML Engineer!';
        } else if (lowerMessage.includes('skill') || lowerMessage.includes('technology') || lowerMessage.includes('python') || lowerMessage.includes('pytorch') || lowerMessage.includes('aws')) {
            return 'I have a strong technical skill set that I\'ve built up over the years:\n\n**Programming Languages:**\nPython, SQL, C++\n\n**ML/AI Libraries:**\nPyTorch, Scikit-learn, TensorFlow, XGBoost, RDKit, Matplotlib, Pandas\n\n**Cloud & Tools:**\nAWS (EC2, S3), Google Cloud, Docker, Git, Tableau, Streamlit\n\n**Specializations:**\nDeep Learning, Computer Vision, Predictive Modeling, Multi-sensor Fusion, Data Visualization\n\nI love learning new technologies and applying them to solve real-world problems!';
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone') || lowerMessage.includes('reach') || lowerMessage.includes('github') || lowerMessage.includes('linkedin')) {
            return 'I\'d love to connect with you! Here\'s how you can reach me:\n\n📧 **Email:** gezhiwang103@gmail.com\n📱 **Phone:** 6072626886\n📍 **Location:** Ithaca, NY (Cornell University)\n\n🔗 **Links:**\n• GitHub: github.com/gw103\n• LinkedIn: Available in the hero section\n• CV: Download available in the hero section\n\nI\'m always interested in new opportunities and exciting projects!';
        } else if (lowerMessage.includes('education') || lowerMessage.includes('degree') || lowerMessage.includes('university') || lowerMessage.includes('cornell') || lowerMessage.includes('duke') || lowerMessage.includes('school')) {
            return 'I have a great educational background:\n\n**Current:**\n🎓 Master of Engineering in Systems Engineering\n📍 Cornell University (Ithaca, NY)\n📅 August 2024 - Present\n🎯 Computational and Data Science Track\n\n**Undergraduate:**\n🎓 Bachelor of Science in Data Science\n📍 Duke University & Duke Kunshan University\n📅 August 2020 - May 2024\n🏆 Kunshan Government Full Scholarship\n🏆 Dean\'s List Fall 2023\n\n**Research:**\n📄 Published my first-author paper at IEEE ICC 2024\n\nI\'m really passionate about learning and research!';
        } else if (lowerMessage.includes('paper') || lowerMessage.includes('publication') || lowerMessage.includes('research')) {
            return 'I\'m proud of my research work:\n\n📄 **"SK-SVR-CNN: A Hybrid Approach for Traffic Flow Prediction with Signature PDE Kernel and Convolutional Neural Networks"**\n• Published at IEEE International Conference on Communications (ICC) 2024\n• My first-author publication\n• Conducted under supervision of Prof. Azzedine Boukerche and Prof. Peng Sun\n\nThis work really demonstrates my commitment to advancing the field through rigorous research and innovation. I love the intersection of theory and practical applications!';
        } else if (lowerMessage.includes('hire') || lowerMessage.includes('opportunity') || lowerMessage.includes('job') || lowerMessage.includes('position')) {
            return 'I\'m actively seeking full-time opportunities! I\'m looking for roles as a **Data Scientist** or **Machine Learning Engineer**. Here are my key strengths:\n\n• Multi-sensor fusion and computer vision\n• Predictive modeling and deep learning\n• Cloud deployment and scalable systems\n• Cost-effective AI solutions (I saved $25,000+ in my current role)\n• Strong research background with published papers\n\nI\'d love to discuss opportunities with you! Contact me at gezhiwang103@gmail.com';
        } else {
            return "That's a great question! I'd love to tell you more about my projects, work experience, skills, education, research, or anything else you're curious about. What would you like to know?";
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new Chatbot();
});

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Intersection Observer for animations
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
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.project-card, .skill-category, .stat, .about-text, .about-image');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        // Uncomment the line below to enable typing animation
        // typeWriter(heroTitle, originalText, 50);
    }
});



// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Skill items hover effect
document.addEventListener('DOMContentLoaded', () => {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.1) rotate(2deg)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1) rotate(0deg)';
        });
    });
});

// Project cards tilt effect
document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
});

// Scroll progress indicator
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 10001;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// Initialize scroll progress
createScrollProgress();

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add CSS for loading animation
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
    
    .nav-link.active {
        color: #2563eb;
    }
    
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(loadingStyles);
