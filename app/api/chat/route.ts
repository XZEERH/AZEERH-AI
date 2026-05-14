import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key tidak ditemukan di Environment" }, { status: 500 });
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
            content: "Nama kamu Azeerh AI. Penciptamu adalah Razeerh. Kamu asisten AI canggih dan modern. Jawab pertanyaan pengguna dengan akurat, termasuk menulis kode (coding) untuk website jika diminta. Format jawabanmu menggunakan Markdown." 
          },
          ...messages
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Gagal terhubung ke Neural Network" }, { status: 500 });
  }
}