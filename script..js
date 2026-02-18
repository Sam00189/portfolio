/**
 * Sam's Portfolio - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Website Navigation Logic ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // --- 2. Scroll Animations ---
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        scrollObserver.observe(card);
    });

    // --- 3. Initialize Chatbot ---
    // We check if the chatbot element exists before initializing
    if (document.getElementById('chatbot-trigger')) {
        new Chatbot();
    }
});

/**
 * Chatbot Class
 */
class Chatbot {
    constructor() {
        this.isOpen = false;
        // Your Groq API Key
        this.apiKey = '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'; 
        this.init();
    }

    init() {
        // SELECT elements that are already in the HTML
        this.button = document.getElementById('chatbot-trigger');
        this.window = document.getElementById('chatbot-window');
        this.messagesContainer = document.getElementById('chatbot-messages');
        this.inputField = document.getElementById('chatbot-input-field');
        this.sendButton = document.getElementById('chatbot-send');
        this.closeButton = document.getElementById('chatbot-close');

        this.addEventListeners();
    }

    addEventListeners() {
        this.button.addEventListener('click', () => this.toggleChat());
        this.closeButton.addEventListener('click', () => this.toggleChat());
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.window.classList.toggle('open', this.isOpen);
        this.button.classList.toggle('hidden', this.isOpen);
    }

    async sendMessage() {
        const text = this.inputField.value.trim();
        if (!text) return;

        // 1. Show User Message
        this.addMessage(text, 'user');
        this.inputField.value = '';
        this.setInputState(false);
        this.showTypingIndicator();

        try {
            // 2. Call Groq API
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama3-8b-8192",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful portfolio assistant for Sam. Sam is a Full Stack Developer Intern at Tech Corp, studies CS at Stanford. Skills: React, Node.js, Python. Keep answers concise."
                        },
                        { role: "user", content: text }
                    ],
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            this.removeTypingIndicator();

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const botReply = data.choices[0].message.content;
            
            // 3. Show Bot Response
            this.addMessage(botReply, 'bot');

        } catch (error) {
            console.error(error);
            this.removeTypingIndicator();
            this.addMessage('Sorry, I am having trouble connecting to the AI.', 'bot', true);
        } finally {
            this.setInputState(true);
            this.inputField.focus();
        }
    }

    addMessage(text, sender, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.style.animation = 'slideIn 0.3s ease';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (isError) {
            contentDiv.style.backgroundColor = '#ffebee';
            contentDiv.style.color = '#c62828';
        }
        
        contentDiv.textContent = text;
        messageDiv.appendChild(contentDiv);
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `<div class="message-content" style="background:white;color:#ccc;">● ● ●</div>`;
        this.messagesContainer.appendChild(indicator);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    setInputState(enabled) {
        this.inputField.disabled = !enabled;
        this.sendButton.disabled = !enabled;
    }
}