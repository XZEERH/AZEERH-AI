const API_KEY = "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";
const chatDisplay = document.getElementById('chatDisplay');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const configBtn = document.getElementById('configBtn');
const settingsModal = document.getElementById('settingsModal');

let memory = JSON.parse(localStorage.getItem('azeerh_pro')) || [
    { role: "system", content: "Kamu adalah Azeerh AI, asisten komandan arsitek. Bicara tegas, teknis, dan futuristik." }
];

async function handleSend() {
    const text = userInput.value.trim();
    if(!text) return;

    // Render User
    const userMsg = `<div style="text-align:right; color:var(--neon-magenta); font-size:12px; margin-bottom:10px;">[USER]> ${text}</div>`;
    chatDisplay.insertAdjacentHTML('beforeend', userMsg);
    
    memory.push({ role: "user", content: text });
    userInput.value = '';

    // Loading
    const loadId = 'L' + Date.now();
    chatDisplay.insertAdjacentHTML('beforeend', `<div id="${loadId}" class="ai-bubble" style="opacity:0.5">MENGHUBUNGKAN_KE_SATELIT...</div>`);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: document.getElementById('modelSelect').value, messages: memory })
        });
        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        document.getElementById(loadId).remove();
        chatDisplay.insertAdjacentHTML('beforeend', `<div class="ai-bubble">${marked.parse(reply)}</div>`);
        memory.push({ role: "assistant", content: reply });
        localStorage.setItem('azeerh_pro', JSON.stringify(memory));
    } catch (e) {
        document.getElementById(loadId).innerText = "ERROR_KONEKSI_OMEGA";
    }
}

sendBtn.onclick = handleSend;
userInput.onkeypress = (e) => e.key === 'Enter' && handleSend();
configBtn.onclick = () => settingsModal.classList.toggle('hidden');
// (Tambahkan fungsi close modal sesuai kebutuhan)
