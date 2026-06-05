// Intersection Observer for Premium Scroll Reveal Cascades
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Trigger animation once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
});

// Frontend Application State
let userProfile = null;
let chatHistory = [];

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add symbol based on type
    const symbol = type === 'success' ? '✓' : '✕';
    toast.innerHTML = `<span style="font-weight: bold; margin-right: 6px;">${symbol}</span><span>${message}</span>`;
    
    container.appendChild(toast);

    // Automate toast cleanup
    setTimeout(() => {
        toast.classList.add('toast-exit');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 4000);
}

// Blueprint Generation Logic
async function generateFutureMe(event) {
    event.preventDefault();

    const name = document.getElementById('nameInput').value.trim();
    const age = document.getElementById('ageInput').value.trim();
    const tone = document.getElementById('toneInput').value;
    const goal = document.getElementById('goalInput').value.trim();
    const barrier = document.getElementById('barrierInput').value.trim();
    const proud = document.getElementById('proudInput').value.trim();

    const errorElement = document.getElementById('formError');
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loaderText');
    const resultContainer = document.getElementById('resultContainer');
    const submitBtn = document.getElementById('submitBtn');

    // Validation Check
    if (!name || !age || !goal || !barrier || !proud) {
        errorElement.style.display = 'flex';
        showToast('Please fulfill all profile fields.', 'error');
        return;
    }

    errorElement.style.display = 'none';
    resultContainer.style.display = 'none';
    
    // Lock submit parameters to prevent duplicate clicks
    submitBtn.disabled = true;
    loader.style.display = 'flex';
    loaderText.innerText = 'Initializing temporal connection...';

    // Sequence loading descriptions for interactive feel
    const loadingInterval = setInterval(() => {
        const phrases = [
            'Analyzing current behavioral trajectory...',
            'Accessing future alignment coordinates...',
            'Structuring execution metrics...',
            'Formulating temporal identity blueprint...'
        ];
        loaderText.innerText = phrases[Math.floor(Math.random() * phrases.length)];
    }, 2000);

    try {
        const response = await fetch('/api/generate-futureme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                age,
                goal,
                struggle: barrier,
                oneYearVision: proud,
                tone
            })
        });

        clearInterval(loadingInterval);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Server responded with an error status.');
        }

        // Cache parameters to application state
        userProfile = {
            name,
            age,
            goal,
            struggle: barrier,
            oneYearVision: proud,
            tone
        };
        chatHistory = []; // Reset chat history for new profile

        // Populating Detailed Result Card Markup
        document.getElementById('resultMetaName').innerText = `Future ${name}`;
        document.getElementById('resultMetaAge').innerText = `Age Unified Matrix (Current Age: ${age})`;
        document.getElementById('resultMetaIdentity').innerText = data.data.futureIdentity || 'BLUEPRINT';
        document.getElementById('resultText').innerText = `"${data.data.message}"`;

        // Populate Moves List
        const movesList = document.getElementById('resultMoves');
        movesList.innerHTML = '';
        if (data.data.nextMoves && data.data.nextMoves.length > 0) {
            data.data.nextMoves.forEach(move => {
                const li = document.createElement('li');
                li.innerText = move;
                movesList.appendChild(li);
            });
        } else {
            movesList.innerHTML = '<li>Optimize daily execution patterns.</li><li>Minimize local workspace friction.</li><li>Maintain goal-aligned routines.</li>';
        }

        // Populate Habit, Warning, and Mantra
        document.getElementById('resultHabit').innerText = data.data.habit || 'Not defined.';
        document.getElementById('resultWarning').innerText = data.data.warning || 'No critical threat detected.';
        document.getElementById('resultMantra').innerText = data.data.mantra ? `"${data.data.mantra}"` : 'Keep the circle small.';

        // Make elements visible and dynamic
        loader.style.display = 'none';
        resultContainer.style.display = 'block';
        
        // Show Chat Section and Update Navigation
        const chatSection = document.getElementById('chat');
        chatSection.style.display = 'block';
        document.getElementById('navChatLink').style.display = 'block';
        
        // Make sure Chat avatar has initial
        const avatarInitial = name.charAt(0).toUpperCase();
        document.getElementById('chatAvatar').innerText = avatarInitial;
        document.getElementById('chatName').innerText = `Future ${name}`;
        
        // Scroll into display area smoothly
        setTimeout(() => {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        showToast('Temporal identity blueprint successfully synthesized!');

    } catch (error) {
        clearInterval(loadingInterval);
        loader.style.display = 'none';
        console.error('Error generating FutureMe:', error);
        showToast(error.message || 'FutureMe could not respond right now. Try again.', 'error');
    } finally {
        submitBtn.disabled = false;
    }
}

// Copy to Clipboard Action
function copyResultToClipboard() {
    if (!userProfile) {
        showToast('No blueprint has been generated to copy.', 'error');
        return;
    }

    const name = document.getElementById('resultMetaName').innerText;
    const identity = document.getElementById('resultMetaIdentity').innerText;
    const message = document.getElementById('resultText').innerText;
    
    const moves = Array.from(document.querySelectorAll('#resultMoves li'))
        .map((li, index) => `${index + 1}. ${li.innerText}`).join('\n');
        
    const habit = document.getElementById('resultHabit').innerText;
    const warning = document.getElementById('resultWarning').innerText;
    const mantra = document.getElementById('resultMantra').innerText;

    const formattedText = `===========================================
FUTUREME TEMPORAL IDENTITY BLUEPRINT
===========================================
Identity: ${name} (${identity})
Generated Profile:
- Current Age: ${userProfile.age}
- Goal: ${userProfile.goal}
- Struggle: ${userProfile.struggle}
- One-Year Vision: ${userProfile.oneYearVision}
- Tone Strategy: ${userProfile.tone}

-------------------------------------------
MESSAGE FROM YOUR FUTURE SELF:
${message}

-------------------------------------------
NEXT 3 ACTIONS:
${moves}

-------------------------------------------
DAILY HABIT TO INTEGRATE TODAY:
${habit}

-------------------------------------------
FUTURE WARNING ENCOUNTERED:
${warning}

-------------------------------------------
DAILY MANTRA SYSTEM:
${mantra}
===========================================`;

    navigator.clipboard.writeText(formattedText)
        .then(() => {
            showToast('Blueprint copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            showToast('Failed to copy to clipboard.', 'error');
        });
}

// Scroll to form and reset fields
function scrollToCreateAndReset() {
    document.getElementById('create').scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        document.getElementById('blueprintForm').reset();
        document.getElementById('resultContainer').style.display = 'none';
        document.getElementById('chat').style.display = 'none';
        document.getElementById('navChatLink').style.display = 'none';
        
        // Reset chat messaging interface
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `<div class="message incoming">Hello. I have integrated our baseline data parameters. Ask me anything regarding the system architecture or choices we finalized to reach this position.</div>`;
        
        userProfile = null;
        chatHistory = [];
        showToast('Identity systems reset. Ready for new synthesis.');
    }, 600);
}

// Focus on chat section
function initiateChatSection() {
    const chatSection = document.getElementById('chat');
    chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
        document.getElementById('chatInput').focus();
    }, 800);
}

// Send Message inside Chat loop
async function sendMessage(event) {
    event.preventDefault();

    if (!userProfile) {
        showToast('Please synthesize an identity blueprint before chatting.', 'error');
        return;
    }

    const inputField = document.getElementById('chatInput');
    const messageText = inputField.value.trim();
    if (!messageText) return;

    const chatMessages = document.getElementById('chatMessages');
    const chatSendBtn = document.getElementById('chatSendBtn');

    // Build and render user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message outgoing';
    userMsg.innerText = messageText;
    chatMessages.appendChild(userMsg);

    // Reset and scroll chat interface
    inputField.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Build typing indicator element
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typingIndicator';
    typingIndicator.className = 'message incoming';
    typingIndicator.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    // Add User Message to History before generating request
    const userPayloadMessage = { role: 'user', message: messageText };

    // Set UI lock state during processing
    inputField.disabled = true;
    chatSendBtn.disabled = true;
    
    // Render typing loader
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch('/api/chat-futureme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userProfile,
                chatHistory,
                question: messageText
            })
        });

        // Remove Typing Indicator
        const typingEl = document.getElementById('typingIndicator');
        if (typingEl) typingEl.remove();

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Server responded with an error status.');
        }

        // Render response message
        const incomingMsg = document.createElement('div');
        incomingMsg.className = 'message incoming';
        incomingMsg.innerText = data.reply;
        chatMessages.appendChild(incomingMsg);
        
        // Cache conversation loops to history parameters
        chatHistory.push(userPayloadMessage);
        chatHistory.push({ role: 'futureme', message: data.reply });

        // Auto clean history bounds to prevent extremely long tokens (keep last 10 messages)
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(-20);
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        const typingEl = document.getElementById('typingIndicator');
        if (typingEl) typingEl.remove();
        
        console.error('Error in chat request:', error);
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'message incoming';
        errorMsg.style.borderColor = 'rgba(255, 69, 58, 0.2)';
        errorMsg.innerHTML = `<span style="color: #ff453a;">✕ FutureMe alignment matrix failed to resolve response. Try asking again.</span>`;
        chatMessages.appendChild(errorMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        showToast('Chat response connection failure.', 'error');
    } finally {
        inputField.disabled = false;
        chatSendBtn.disabled = false;
        inputField.focus();
    }
}
