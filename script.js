const API_KEY = "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";
const NASA_API_KEY = "JMcJ1UGIgdFUs4qDWRaPEONheF5zazhnIdMhs4eH";

const chatDisplay = document.getElementById('chatDisplay');
const userInput = document.getElementById('userInput');
const nasaDateInput = document.getElementById('nasaDate');

let memory = JSON.parse(localStorage.getItem('azeerh_eac_v35')) || [
    { role: "system", content: "Nama kamu Azeerh AI. Penciptamu adalah Razeerh (pemimpin EAC). Kamu asisten loyal untuk seorang razeerh." }
];

function appendMsg(role, content, isHtml = false) {
    const div = document.createElement('div');
    div.className = role === 'user' ? 'user-msg' : 'ai-msg';
    
    if (role === 'user') {
        div.innerText = `[CMD]> ${content}`;
    } else {
        const textContent = isHtml ? content : marked.parse(content);
        div.innerHTML = `
            <div class="msg-body">${textContent}</div>
            <button class="copy-btn" onclick="copyText(this)">COPY_LOG</button>
        `;
    }
    
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

async function fetchNasaToday() {
    const date = nasaDateInput.value;
    const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}${date ? '&date='+date : ''}`;
    
    appendMsg('assistant', '_MENGHUBUNGKAN_KE_NASA..._');
    try {
        const res = await fetch(url);
        const data = await res.json();
        const nasaHtml = `
            <div class="nasa-card">
                <img src="${data.url}" id="nasaImg">
                <div class="nasa-info"><strong>${data.title}</strong></div>
            </div>
            <button class="dl-btn" onclick="downloadImg('${data.url}', '${data.title}')">DOWNLOAD_IMAGE</button>
        `;
        appendMsg('assistant', nasaHtml, true);
    } catch (e) { appendMsg('assistant', 'ERROR: DATA_TIDAK_DITEMUKAN'); }
}

// Fungsi Copy Pesan
function copyText(btn) {
    const text = btn.parentElement.querySelector('.msg-body').innerText;
    navigator.clipboard.writeText(text);
    btn.innerText = "COPIED!";
    btn.classList.add('copied-anim');
    setTimeout(() => { 
        btn.innerText = "COPY_LOG"; 
        btn.classList.remove('copied-anim');
    }, 2000);
}

// Fungsi Download Gambar
function downloadImg(url, title) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `EAC_${title}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ... (Gunakan sisa logika sendMessage, initStars dari v3.0) ...
