// Chatbot functionality
class Chatbot {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        // URL of the Cloudflare Worker from worker/gemini-proxy.js (see GEMINI_SETUP.md).
        // The Gemini API key lives in that Worker, never in this file.
        // While this is empty, the chatbot answers from the built-in responses below.
        this.proxyUrl = 'https://yellow-shape-197f.gezhiwang103.workers.dev';
        this.init();
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
        if (!this.proxyUrl) {
            return this.getFallbackResponse(userMessage);
        }

        try {
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage })
            });

            console.log('Chat proxy status:', response.status);
            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.reply) {
                throw new Error(data.error || `Chat proxy returned status ${response.status}`);
            }
            return data.reply;
        } catch (error) {
            console.error('Chat proxy error:', error);
            console.log('Falling back to built-in response...');
            // Fall back to the built-in responses if the AI call fails
            return this.getFallbackResponse(userMessage);
        }
    }

    getFallbackResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        const isChinese = /[\u4e00-\u9fff]/.test(userMessage);
        
        // Chinese responses
        if (isChinese) {
            if (lowerMessage.includes('你好') || lowerMessage.includes('嗨') || lowerMessage.includes('hello')) {
                return '你好！我是George，很高兴和你聊天！你可以问我关于我的项目、工作经验或任何你想了解的事情！';
            } else if (lowerMessage.includes('项目') || lowerMessage.includes('工作') || lowerMessage.includes('cmi') || lowerMessage.includes('nino') || lowerMessage.includes('movesai') || lowerMessage.includes('foosball') || lowerMessage.includes('足球')) {
                return '我做过一些非常令人兴奋的项目，我为此感到自豪：\n\n• **Creative Machine Lab桌上足球杯** - 用PPO训练基于Transformer的世界模型策略并获得第一名，随后蒸馏到π0.5 VLA模型\n• **CMI Kaggle行为检测** - 多模态传感器分类器，F1从0.76提升到0.81\n• **神经网络临近预报(NiNo+)** - 实现44%训练时间减少\n• **MoveSAI排放预测** - 在Google Cloud部署获得90% R²准确率\n• **FOB测试分析仪表板** - 构建了全面的Streamlit仪表板\n• **药物发现ML管道** - 在Humanwell三个月内节省约25,000美元\n• **KobeNet** - 使用ResNet-50进行胸部X光疾病检测\n\n我很乐意告诉你更多关于任何感兴趣的具体项目！';
            } else if (lowerMessage.includes('经验') || lowerMessage.includes('实习') || lowerMessage.includes('工作') || lowerMessage.includes('职业')) {
                return '我有一些很棒的专业经验：\n\n**当前职位：**\n我目前在哥伦比亚大学商学院担任数据分析师（2026年9月至今）\n- 将1410万条招聘数据清洗为10家顶尖雇主的49.7万条不重复职位\n- 搭建了PostgreSQL星型数据仓库，并编写了32项自动化数据质量测试\n- 构建了展示招聘趋势的交互式Power BI仪表板\n\n**之前职位：**\n上海交通大学机器人机器学习研究助理（2026年3月-8月）\n- 以共同第一作者身份完成了面向世界动作模型（World Action Models）的免训练推理加速框架（AAAI在审）\n- 在RoboTwin 2.0上实现2.16×–2.68×端到端加速，在Unitree G1真机上实现2.98×加速\n\nHumanwell Pharmaceutical US, Inc.数据科学家实习生（2025年6月-8月）\n- 构建三模型集成预测均方位移（MSD），RMSE比最佳单模型提升约6%\n- 使用FastAPI和Docker部署为REST API，三个月内节省约25,000美元\n\nMobalytics市场研究分析师（2022年6月-8月）\n- 通过自动化减少了40%的手动报告时间\n- 构建了交互式Tableau仪表板\n\n欢迎与我聊聊数据科学家或ML工程师的机会！';
            } else if (lowerMessage.includes('技能') || lowerMessage.includes('技术') || lowerMessage.includes('python') || lowerMessage.includes('pytorch') || lowerMessage.includes('aws')) {
                return '我拥有多年来建立的强大技术技能：\n\n**编程语言：**\nPython, SQL, C++, Java\n\n**ML/AI与数据分析库：**\nPyTorch, Scikit-learn, Pandas, NumPy, Matplotlib, PySpark, TensorFlow, XGBoost, RDKit\n\n**云和工具：**\nAWS (EC2, S3), Google Cloud, Docker, Git, Tableau, Power BI, PostgreSQL, FastAPI, Streamlit\n\n**专业领域：**\n机器学习, 深度学习, 强化学习, 大语言模型, 计算机视觉, 具身智能, 机器人, 云计算, 数据可视化\n\n我喜欢学习新技术并将它们应用到解决现实世界的问题中！';
            } else if (lowerMessage.includes('联系') || lowerMessage.includes('邮箱') || lowerMessage.includes('电话') || lowerMessage.includes('github') || lowerMessage.includes('linkedin')) {
                return '我很乐意与你联系！以下是我的联系方式：\n\n📧 **邮箱：** gezhiwang103@gmail.com\n📱 **电话：** 6072626886\n📍 **位置：** 纽约州纽约市（哥伦比亚大学）\n\n🔗 **链接：**\n• GitHub: github.com/gw103\n• LinkedIn: 在hero部分可用\n• 简历: 在hero部分可下载\n\n我总是对新机会和令人兴奋的项目感兴趣！';
            } else if (lowerMessage.includes('教育') || lowerMessage.includes('学位') || lowerMessage.includes('大学') || lowerMessage.includes('columbia') || lowerMessage.includes('哥伦比亚') || lowerMessage.includes('cornell') || lowerMessage.includes('duke') || lowerMessage.includes('学校')) {
                return '我有很好的教育背景：\n\n**当前：**\n🎓 计算机科学理学硕士\n📍 哥伦比亚大学（纽约州纽约市）\n📅 2026年8月 - 2027年12月\n\n**硕士：**\n🎓 系统工程工程硕士\n📍 康奈尔大学（纽约州伊萨卡）\n📅 2024年8月 - 2025年12月\n🎯 课程侧重人工智能与数据科学\n\n**本科：**\n🎓 数据科学理学学士\n📍 昆山杜克大学和杜克大学\n📅 2020年8月 - 2024年5月\n🏆 昆山政府全额奖学金\n🏆 2023年秋季院长名单\n\n**研究：**\n📄 在IEEE ICC 2024发表了我的第一作者论文，另有一篇关于世界动作模型的共同第一作者论文在审\n\n我真的很热衷于学习和研究！';
            } else if (lowerMessage.includes('论文') || lowerMessage.includes('发表') || lowerMessage.includes('研究')) {
                return '我为我的研究工作感到自豪：\n\n📄 **"DASH: 面向世界动作模型的免训练漂移自适应推测式推理框架"**\n• 共同第一作者，论文在审\n• 在RoboTwin 2.0上实现2.16×–2.68×端到端加速，成功率仅下降0.1–0.3个百分点\n• 在Unitree G1真机上实现2.98×端到端加速\n• 在上海交通大学担任机器人机器学习研究助理期间完成\n\n📄 **"SK-SVR-CNN: 结合签名PDE核和卷积神经网络的交通流预测混合方法"**\n• 发表于IEEE国际通信会议(ICC) 2024\n• 我的第一作者发表\n• 在Azzedine Boukerche教授和Peng Sun教授的指导下进行\n\n这项工作真正展示了我通过严谨研究和创新推进该领域的承诺。我喜欢理论和实际应用的交叉点！';
            } else if (lowerMessage.includes('招聘') || lowerMessage.includes('机会') || lowerMessage.includes('工作') || lowerMessage.includes('职位')) {
                return '我很乐意了解新的机会！我对**数据科学家**和**机器学习工程师**的职位感兴趣。以下是我的主要优势：\n\n• 具身智能与机器人研究（世界动作模型推理加速）\n• 强化学习和深度学习\n• 基于SQL、PostgreSQL和Power BI的数据工程与分析\n• 将模型部署为生产级API（在Humanwell节省约25,000美元）\n• 扎实的研究背景：一篇IEEE ICC第一作者论文，另有一篇在审\n\n我很乐意与你讨论机会！联系我：gezhiwang103@gmail.com';
            } else {
                return "这是一个很好的问题！我很乐意告诉你更多关于我的项目、工作经验、技能、教育、研究或任何你好奇的事情。你想了解什么？";
            }
        }
        
        // English responses (original)
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return 'Hi there! I\'m George, and I\'m excited to chat with you! Feel free to ask me about my projects, work experience, or anything else you\'d like to know!';
        } else if (lowerMessage.includes('project') || lowerMessage.includes('work') || lowerMessage.includes('cmi') || lowerMessage.includes('nino') || lowerMessage.includes('movesai') || lowerMessage.includes('foosball') || lowerMessage.includes('足球')) {
            return 'I\'ve worked on some really exciting projects that I\'m proud of:\n\n• **Creative Machine Lab Foosball Cup** - Won 1st place with a world-model policy trained with PPO, then distilled it into the π0.5 VLA\n• **CMI Kaggle: Detect Behavior with Sensor Data** - Multimodal sensor classifier, F1 improved from 0.76 to 0.81\n• **Neural Network Nowcasting (NiNo+)** - Achieved 44% training time reduction\n• **MoveSAI Emissions Prediction** - Got 90% R² accuracy with Google Cloud deployment\n• **FOB Test Analysis Dashboard** - Built a comprehensive Streamlit dashboard\n• **Drug Discovery ML Pipeline** - Saved about $25K in 3 months at Humanwell\n• **KobeNet** - Chest X-ray disease detection with ResNet-50\n\nI\'d love to tell you more about any specific project that interests you!';
        } else if (lowerMessage.includes('experience') || lowerMessage.includes('intern') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
            return 'I have some great professional experience:\n\n**Current Role:**\nI\'m currently a Data Analyst at Columbia Business School (Sep 2026 - Present)\n- Cleaned 14.1M job-posting records down to 497K distinct postings across 10 top employers\n- Built a PostgreSQL star-schema warehouse with 32 automated data-quality tests\n- Built an interactive Power BI dashboard on posting trends\n\n**Previous Roles:**\nRobotics Machine Learning Research Assistant at Shanghai Jiao Tong University (Mar 2026 - Aug 2026)\n- Co-first-authored a training-free inference acceleration framework for World Action Models (under review at AAAI)\n- Reached 2.16×–2.68× end-to-end speedups on RoboTwin 2.0 and 2.98× on a real Unitree G1\n\nData Scientist Intern at Humanwell Pharmaceutical US, Inc. (Jun 2025 - Aug 2025)\n- Built a 3-model ensemble to predict Mean Squared Displacement, improving RMSE by about 6%\n- Deployed it with FastAPI and Docker, saving about $25K in 3 months\n\nMarket Research Analyst Extern at Mobalytics (June 2022 - August 2022)\n- Reduced manual reporting time by 40%\n- Built interactive Tableau dashboards\n\nI\'m always glad to hear about Data Scientist and ML Engineer opportunities!';
        } else if (lowerMessage.includes('skill') || lowerMessage.includes('technology') || lowerMessage.includes('python') || lowerMessage.includes('pytorch') || lowerMessage.includes('aws')) {
            return 'I have a strong technical skill set that I\'ve built up over the years:\n\n**Programming Languages:**\nPython, SQL, C++, Java\n\n**ML/AI & Data Libraries:**\nPyTorch, Scikit-learn, Pandas, NumPy, Matplotlib, PySpark, TensorFlow, XGBoost, RDKit\n\n**Cloud & Tools:**\nAWS (EC2, S3), Google Cloud, Docker, Git, Tableau, Power BI, PostgreSQL, FastAPI, Streamlit\n\n**Specializations:**\nMachine Learning, Deep Learning, Reinforcement Learning, Large Language Models, Computer Vision, Embodied AI, Robotics, Cloud Computing, Data Visualization\n\nI love learning new technologies and applying them to solve real-world problems!';
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone') || lowerMessage.includes('reach') || lowerMessage.includes('github') || lowerMessage.includes('linkedin')) {
            return 'I\'d love to connect with you! Here\'s how you can reach me:\n\n📧 **Email:** gezhiwang103@gmail.com\n📱 **Phone:** 6072626886\n📍 **Location:** New York, NY (Columbia University)\n\n🔗 **Links:**\n• GitHub: github.com/gw103\n• LinkedIn: Available in the hero section\n• Resume: Download available in the hero section\n\nI\'m always interested in new opportunities and exciting projects!';
        } else if (lowerMessage.includes('education') || lowerMessage.includes('degree') || lowerMessage.includes('university') || lowerMessage.includes('columbia') || lowerMessage.includes('哥伦比亚') || lowerMessage.includes('cornell') || lowerMessage.includes('duke') || lowerMessage.includes('school')) {
            return 'I have a great educational background:\n\n**Current:**\n🎓 Master of Science in Computer Science\n📍 Columbia University (New York, NY)\n📅 August 2026 - December 2027\n\n**Graduate:**\n🎓 Master of Engineering in Systems Engineering\n📍 Cornell University (Ithaca, NY)\n📅 August 2024 - December 2025\n🎯 Coursework focused on AI and Data Science\n\n**Undergraduate:**\n🎓 Bachelor of Science in Data Science\n📍 Duke Kunshan University & Duke University\n📅 August 2020 - May 2024\n🏆 Kunshan Government Full Scholarship\n🏆 Dean\'s List Fall 2023\n\n**Research:**\n📄 First-author paper at IEEE ICC 2024, plus a co-first-authored paper on World Action Models under review\n\nI\'m really passionate about learning and research!';
        } else if (lowerMessage.includes('paper') || lowerMessage.includes('publication') || lowerMessage.includes('research')) {
            return 'I\'m proud of my research work:\n\n📄 **"DASH: A Training-Free Drift-Adaptive Speculative Inference Framework for World Action Models"**\n• Co-first author, manuscript under review\n• 2.16×–2.68× end-to-end speedups on RoboTwin 2.0 with only 0.1–0.3 pp success-rate loss\n• 2.98× end-to-end speedup on a real Unitree G1\n• Done as a Robotics Machine Learning Research Assistant at Shanghai Jiao Tong University\n\n📄 **"SK-SVR-CNN: A Hybrid Approach for Traffic Flow Prediction with Signature PDE Kernel and Convolutional Neural Networks"**\n• Published at IEEE International Conference on Communications (ICC) 2024\n• My first-author publication\n• Conducted under supervision of Prof. Azzedine Boukerche and Prof. Peng Sun\n\nThis work really demonstrates my commitment to advancing the field through rigorous research and innovation. I love the intersection of theory and practical applications!';
        } else if (lowerMessage.includes('hire') || lowerMessage.includes('opportunity') || lowerMessage.includes('job') || lowerMessage.includes('position')) {
            return 'I\'d love to hear about new opportunities! I\'m interested in **Data Scientist** and **Machine Learning Engineer** roles. Here are my key strengths:\n\n• Embodied AI and robotics research (inference acceleration for World Action Models)\n• Reinforcement learning and deep learning\n• Data engineering and analytics with SQL, PostgreSQL and Power BI\n• Deploying models as production APIs (saved about $25K at Humanwell)\n• Strong research background: a first-author IEEE ICC paper and another under review\n\nI\'d love to discuss opportunities with you! Contact me at gezhiwang103@gmail.com';
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
