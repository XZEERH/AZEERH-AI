const API_KEY = "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";
const chatDisplay = document.getElementById('chatDisplay');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const configBtn = document.getElementById('configBtn');
const settingsModal = document.getElementById('settingsModal');
const closeConfig = document.getElementById('closeConfig');
const clearMem = document.getElementById('clearMem');

let memory = JSON.parse(localStorage.getItem('azeerh_v2_1')) || [
    { role: "system", content: "Kamu adalah Azeerh AI, sistem Omega untuk Komandan. Bicara dingin, efisien, dan futuristik." }
];

// Toggle Modal
configBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

closeConfig.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

// Clear Memory
clearMem.addEventListener('click', () => {
    if(confirm("PURGE SYSTEM LOGS?")) {
        localStorage.removeItem('azeerh_v2_1');
        location.reload();
    }
});

function appendMsg(role, content) {
    const isUser = role === 'user';
    const html = isUser 
        ? `<div class="user-msg">[COMMAND]> ${content}</div>`
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
    chatDisplay.insertAdjacentHTML('beforeend', `<div id="${loadId}" class="ai-msg" style="opacity:0.5; font-style:italic;">LINKING_TO_SATELIT...</div>`);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: document.getElementById('modelSelect').value,
                messages: memory
            })
        });
        const data = await response.json();
        const reply = data.choices[0].message.content;

        document.getElementById(loadId).remove();
        appendMsg('assistant', reply);
        memory.push({ role: "assistant", content: reply });
        localStorage.setItem('azeerh_v2_1', JSON.stringify(memory));
    } catch (e) {
        document.getElementById(loadId).innerText = "ERROR: NEURAL_LINK_BROKEN";
    }
}

sendBtn.onclick = sendMessage;
userInput.onkeypress = (e) => e.key === 'Enter' && sendMessage();

// Initial Load
if(memory.length > 1) {
    memory.forEach(m => m.role !== 'system' && appendMsg(m.role, m.content));
} else {
    appendMsg('assistant', 'AZEERH_OMEGA_LINK_ESTABLISHED. Menunggu parameter misi, Komandan.');
}
