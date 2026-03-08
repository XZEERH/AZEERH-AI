const API_KEY = "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";
const chatDisplay = document.getElementById('chatDisplay');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const configBtn = document.getElementById('configBtn');
const settingsModal = document.getElementById('settingsModal');

let memory = JSON.parse(localStorage.getItem('azeerh_eac_v1')) || [
    { role: "system", content: "Kamu adalah Azeerh AI, asisten senior Razeerh. Bicara tegas, futuristik, dan sangat cerdas." }
];

function initStars() {
    const field = document.getElementById('starfield');
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1 + 'px';
        star.style.width = size; star.style.height = size;
        star.style.top = Math.random() * 100 + 'vh';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.setProperty('--duration', Math.random() * 3 + 2 + 's');
        field.appendChild(star);
    }
}

function appendMsg(role, content) {
    const html = role === 'user' 
        ? `<div class="user-msg">[CMD]> ${content}</div>`
        : `<div class="ai-msg">${marked.parse(content)}</div>`;
    chatDisplay.insertAdjacentHTML('beforeend', html);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

async function sendMessage() {
    const text = userInput.value.trim();
    if(!text) return;

    appendMsg('user', text);
    memory.push({ role: "user", content: text });
    userInput.value = '';

    const loadId = 'sys-' + Date.now();
    chatDisplay.insertAdjacentHTML('beforeend', `<div id="${loadId}" class="ai-msg" style="opacity:0.5">MENGHUBUNGKAN_KE_AZEERH...</div>`);

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: document.getElementById('modelSelect').value, messages: memory })
        });
        const data = await response.json();
        const reply = data.choices[0].message.content;
        document.getElementById(loadId).remove();
        appendMsg('assistant', reply);
        memory.push({ role: "assistant", content: reply });
        localStorage.setItem('azeerh_eac_v1', JSON.stringify(memory));
    } catch (e) {
        document.getElementById(loadId).innerText = "ERROR: NEURAL_LINK_FAILED";
    }
}

sendBtn.onclick = sendMessage;
userInput.onkeypress = (e) => e.key === 'Enter' && sendMessage();
configBtn.onclick = () => settingsModal.classList.remove('hidden');
document.getElementById('closeConfig').onclick = () => settingsModal.classList.add('hidden');
document.getElementById('clearMem').onclick = () => { localStorage.removeItem('azeerh_eac_v1'); location.reload(); };

// Load History
if(memory.length > 1) memory.forEach(m => m.role !== 'system' && appendMsg(m.role, m.content));
