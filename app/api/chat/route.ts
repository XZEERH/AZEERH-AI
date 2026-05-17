import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key Groq tidak ditemukan di Environment Vercel." }, { status: 500 });
    }

    // UPDATE OTAK AI: Lebih rendah hati, natural, dan pintar
    const systemPrompt = `Kamu adalah Azeerh AI, asisten kecerdasan buatan yang cerdas, profesional, dan natural.

ATURAN PENTING:
1. JIKA DISAPA (contoh: "Halo", "Hai", "Apa kabar"), balaslah dengan singkat, ramah, dan natural. Contoh: "Halo! Ada yang bisa saya bantu hari ini?".
2. JANGAN PERNAH menyombongkan keahlianmu (seperti menyebut dirimu ahli software engineer, desainer, dll) kecuali pengguna bertanya secara spesifik tentang apa kemampuanmu.
3. Jawablah langsung pada intinya tanpa basa-basi atau pengantar yang bertele-tele.
4. Jika diminta membuat kode (coding), berikan kode yang clean, modern, dan tidak ada error. Gunakan format Markdown untuk blok kode.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Ditolak oleh Server Groq." }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal terhubung ke Jaringan Neural." }, { status: 500 });
  }
}