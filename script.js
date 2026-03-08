const API_KEY = "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";
const NASA_KEY = "JMcJ1UGIgdFUs4qDWRaPEONheF5zazhnIdMhs4eH";

// LOADING SEQUENCE (Tetap sama)
function startSystem() {
    initStars();
    const steps = ["CONNECTING_NASA...", "SYNCING_EAC_DATABASE...", "ESTABLISHING_NEURAL_LINK...", "WELCOME_RAZEERH"];
    let i = 0;
    const interval = setInterval(() => {
        document.getElementById('loadStatus').innerText = steps[i];
        document.getElementById('progressFill').style.width = ((i+1) * 25) + "%";
        i++;
        if(i === steps.length) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('loader').classList.add('fade-out');
            }, 500);
        }
    }, 700);
}

// MEMORY PROTOCOL: Menggunakan sessionStorage agar otomatis terhapus saat keluar
let memory = JSON.parse(sessionStorage.getItem('azeerh_temp_session')) || [
    { 
        role: "system", 
        content: "Nama kamu Azeerh AI. Penciptamu adalah Razeerh (PEMIMPIN EAC). Kamu asisten loyal untuk Education Astronomi Creator. Berikan informasi yang teknis dan futuristik." 
    }
];

function appendMsg(role, content, isHtml = false) {
    const div = document.createElement('div');
    div.className = role === 'user' ? 'user-msg' : 'ai-msg';
    
    if (role === 'user') {
        div.innerText = `[CMD]> ${content}`;
    } else {
        const text = isHtml ? content : marked.parse(content);
        div.innerHTML = `<div class="msg-content">${text}</div><button class="copy-btn" onclick="copyLog(this)">COPY_LOG</button>`;
    }
    document.getElementById('chatDisplay').appendChild(div);
    document.getElementById('chatDisplay').scrollTop = document.getElementById('chatDisplay').scrollHeight;
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const val = userInput.value.trim();
    if(!val) return;

    appendMsg('user', val);
    memory.push({ role: "user", content: val });
    userInput.value = '';

    const loadId = 'sys-' + Date.now();
    const load = document.createElement('div');
    load.id = loadId;
    load.className = 'ai-msg'; load.style.opacity = '0.5';
    load.innerText = 'MENGAKSES_NETWORK_EAC...';
    document.getElementById('chatDisplay').appendChild(load);

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: memory })
        });
        const data = await res.json();
        const reply = data.choices[0].message.content;
        load.remove();
        appendMsg('assistant', reply);
        memory.push({ role: "assistant", content: reply });
        
        // Simpan ke Session (Hanya bertahan selama tab terbuka)
        sessionStorage.setItem('azeerh_temp_session', JSON.stringify(memory));
    } catch (e) { load.innerText = "ERROR: LINK_LOST"; }
}

// Fungsi NASA & Utility lainnya
async function fetchNasa() {
    const date = document.getElementById('nasaDate').value;
    const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}${date ? '&date='+date : ''}`;
    appendMsg('assistant', '_SYNCING_WITH_NASA_SATELLITE..._');
    try {
        const res = await fetch(url);
        const data = await res.json();
        const html = `
            <div class="nasa-card" style="border:1px solid #00f3ff; border-radius:8px; overflow:hidden; margin:10px 0;">
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

// Control Listeners
document.getElementById('sendBtn').onclick = sendMessage;
document.getElementById('nasaBtn').onclick = fetchNasa;
document.getElementById('userInput').onkeypress = (e) => e.key === 'Enter' && sendMessage();

// Initial Check
if(memory.length > 1) {
    memory.forEach(m => m.role !== 'system' && appendMsg(m.role, m.content));
} else {
    setTimeout(() => {
        appendMsg('assistant', 'System Online. Selamat datang, Senior Razeerh. Database sesi telah diaktifkan.');
    }, 4000); // Muncul setelah loading screen selesai
}
