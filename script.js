const API_KEY = "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";
const NASA_KEY = "JMcJ1UGIgdFUs4qDWRaPEONheF5zazhnIdMhs4eH";

const chatDisplay = document.getElementById('chatDisplay');
const userInput = document.getElementById('userInput');
const nasaDateInput = document.getElementById('nasaDate');
const sendBtn = document.getElementById('sendBtn');
const nasaBtn = document.getElementById('nasaBtn');

// Identitas khusus Senior Razeerh
let memory = JSON.parse(localStorage.getItem('azeerh_final_system')) || [
    { 
        role: "system", 
        content: "Kamu adalah Azeerh AI, sistem AI canggih milik Education Astronomi Creator (EAC). Penciptamu adalah Razeerh. Kamu harus loyal, memanggilnya Senior Razeerh, dan bicara dengan gaya futuristik." 
    }
];

function initStars() {
    const field = document.getElementById('starfield');
    for (let i = 0; i < 70; i++) {
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

function appendMsg(role, content, isHtml = false) {
    const div = document.createElement('div');
    div.className = role === 'user' ? 'user-msg' : 'ai-msg';
    
    if (role === 'user') {
        div.innerText = `[CMD]> ${content}`;
    } else {
        const text = isHtml ? content : marked.parse(content);
        div.innerHTML = `<div class="msg-content">${text}</div><button class="copy-btn" onclick="copyLog(this)">COPY_LOG</button>`;
    }
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

async function sendMessage() {
    const val = userInput.value.trim();
    if(!val) return;
    appendMsg('user', val);
    memory.push({ role: "user", content: val });
    userInput.value = '';

    const load = document.createElement('div');
    load.className = 'ai-msg'; load.style.opacity = '0.5';
    load.innerText = 'MENGHUBUNGKAN_EAC_NETWORK...';
    chatDisplay.appendChild(load);

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: document.getElementById('modelSelect').value, messages: memory })
        });
        const data = await res.json();
        const reply = data.choices[0].message.content;
        load.remove();
        appendMsg('assistant', reply);
        memory.push({ role: "assistant", content: reply });
        localStorage.setItem('azeerh_final_system', JSON.stringify(memory));
    } catch (e) { load.innerText = "ERROR: LINK_LOST"; }
}

async function fetchNasa() {
    const date = nasaDateInput.value;
    const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}${date ? '&date='+date : ''}`;
    appendMsg('assistant', '_SYNCING_WITH_NASA_SATELLITE..._');
    try {
        const res = await fetch(url);
        const data = await res.json();
        const html = `
            <div style="border:1px solid #00f3ff; border-radius:8px; overflow:hidden; margin:10px 0;">
                <img src="${data.url}" style="width:100%">
                <div style="padding:8px; font-size:11px;"><strong>${data.title}</strong></div>
            </div>
            <button class="dl-btn" onclick="window.open('${data.url}')">OPEN_FULL_RES</button>
            <p>${data.explanation.substring(0, 150)}...</p>
        `;
        appendMsg('assistant', html, true);
    } catch (e) { appendMsg('assistant', 'ERROR: NASA_UNREACHABLE'); }
}

function copyLog(btn) {
    const txt = btn.parentElement.querySelector('.msg-content').innerText;
    navigator.clipboard.writeText(txt);
    btn.innerText = "COPIED!";
    setTimeout(() => btn.innerText = "COPY_LOG", 2000);
}

sendBtn.onclick = sendMessage;
nasaBtn.onclick = fetchNasa;
userInput.onkeypress = (e) => e.key === 'Enter' && sendMessage();
configBtn.onclick = () => settingsModal.classList.remove('hidden');
document.getElementById('closeConfig').onclick = () => settingsModal.classList.add('hidden');
document.getElementById('clearMem').onclick = () => { localStorage.removeItem('azeerh_final_system'); location.reload(); };

if(memory.length > 1) {
    memory.forEach(m => m.role !== 'system' && appendMsg(m.role, m.content));
} else {
    appendMsg('assistant', 'System Online. Selamat datang, Senior Razeerh.');
}
