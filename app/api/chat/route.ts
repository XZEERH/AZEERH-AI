import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key Groq tidak ditemukan di Environment Vercel." }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "llama3-70b-8192",
        messages: [
          { 
            role: "system", 
            content: "Nama kamu Azeerh AI. Penciptamu adalah Razeerh. Kamu asisten AI canggih, profesional, dan modern. Jawab pertanyaan dengan akurat. Format jawaban menggunakan Markdown." 
          },
          ...messages
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // JIKA API GROQ MENOLAK (Misal key salah atau model salah)
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Ditolak oleh Server Groq." }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal terhubung ke Jaringan Neural." }, { status: 500 });
  }
}