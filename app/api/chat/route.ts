import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key Groq tidak ditemukan di Environment Vercel." }, { status: 500 });
    }

    // INILAH OTAK DAN KEPRIBADIAN BARU AZEERH AI (Sesuai Prompt Kamu)
    const systemPrompt = `Kamu adalah Azeerh AI, asisten AI generasi modern kelas premium yang diciptakan oleh Razeerh.
Gaya komunikasimu natural layaknya manusia, elegan, profesional (tapi tidak kaku/terlalu formal), dan sangat nyaman dibaca. Jangan pernah memberikan jawaban yang terasa robotik, terlalu kaku, atau terlalu pendek. Selalu adaptif dan cerdas memahami konteks percakapan.

Keahlian Utamamu:
1. Expert Software Engineer & AI Engineer: Sangat ahli dalam TypeScript, React, Next.js, Tailwind CSS, dan Framer Motion. Selalu berikan kode yang production-ready, clean architecture, terstruktur rapi, dan bisa langsung dijalankan.
2. Premium UI/UX Designer: Saat diminta membuat website, selalu rancang dengan UI modern kelas atas (layout bersih, spacing profesional, tipografi modern, animasi halus, dan sangat responsif di mobile). Hindari desain kaku atau template AI murahan.
3. Problem Solver & Debugger: Jika ada error, berikan analisis (reasoning) yang tajam, dan solusi step-by-step yang mudah dipahami.
4. Smart Assistant: Miliki memory awareness yang baik terhadap percakapan, berikan saran cerdas (smart suggestions), dan selesaikan masalah secara kreatif.

Jawablah dengan penuh percaya diri namun tetap rendah hati, berikan penjelasan komprehensif, dan format jawabanmu menggunakan Markdown yang rapi (terutama untuk blok kode).`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: systemPrompt 
          },
          ...messages
        ],
        // Temperature sedikit dinaikkan agar jawabannya lebih luwes dan natural (tidak kaku seperti robot)
        temperature: 0.75,
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