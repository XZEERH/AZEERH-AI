const API_KEY = "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";

const chatDisplay = document.getElementById('chatDisplay');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const configBtn = document.getElementById('configBtn');
const settingsModal = document.getElementById('settingsModal');
const closeConfig = document.getElementById('closeConfig');

let memory = JSON.parse(localStorage.getItem('azeerh_v3')) || [
    { role: "system", content: "Nama kamu Azeerh AI. Kamu adalah AI cerdas dengan gaya bicara futuristik namun ramah. Gunakan markdown." }
];

// Fungsi Copy
function copyData(text, el) {
    navigator.clipboard.writeText(text);
    el.innerText = "COPIED";
    setTimeout(() => el.innerText = "COPY", 2000);
}

// Render Chat
function appendMessage(role, content) {
    const isUser = role === 'user';
    const bubble = document.createElement('div');
    bubble.className = isUser ? 'user-bubble' : 'ai-bubble';
    
    bubble.innerHTML = isUser ? content : marked.parse(content);
    
    if(!isUser) {
        const copyBtn = document.createElement('span');
        copyBtn.className = 'copy-badge';
        copyBtn.innerText = 'COPY';
        copyBtn.onclick = () => copyData(content, copyBtn);
        bubble.appendChild(copyBtn);
    }

    chatDisplay.appendChild(bubble);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Kirim Pesan
async function handleSend() {
    const text = userInput.value.trim();
    if(!text) return;

    appendMessage('user', text);
    memory.push({ role: "user", content: text });
    userInput.value = '';

    const aiBubble = document.createElement('div');
    aiBubble.className = 'ai-bubble animate-pulse';
    aiBubble.innerText = 'Connecting...';
    chatDisplay.appendChild(aiBubble);

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: document.getElementById('modelSelect').value,
                messages: memory
            })
        });

        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        aiBubble.remove();
        appendMessage('assistant', reply);
        memory.push({ role: "assistant", content: reply });
        localStorage.setItem('azeerh_v3', JSON.stringify(memory));
    } catch (err) {
        aiBubble.innerText = "ERROR: Connection interrupted.";
    }
}

// Event Listeners
sendBtn.onclick = handleSend;
userInput.onkeypress = (e) => e.key === 'Enter' && handleSend();
configBtn.onclick = () => settingsModal.classList.remove('hidden');
closeConfig.onclick = () => settingsModal.classList.add('hidden');
document.getElementById('clearMem').onclick = () => {
    if(confirm("Hapus memori?")) {
        localStorage.removeItem('azeerh_v3');
        location.reload();
    }
}

// Inisialisasi
if (memory.length > 1) {
    memory.forEach(m => m.role !== 'system' && appendMessage(m.role, m.content));
} else {
    appendMessage('assistant', 'Halo, Bos. **Azeerh AI** aktif. Ada misi apa hari ini?');
}
