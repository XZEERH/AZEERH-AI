import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();
    
    // MENGAMBIL KUNCI RAHASIA DARI VERCEL ENVIRONMENT
    const apiKey = process.env.GROQ_API_KEY;
    const falKey = process.env.FAL_API_KEY; 

    if (!apiKey) {
      return NextResponse.json({ error: "API Key Groq tidak ditemukan di Environment Vercel." }, { status: 500 });
    }

    // MEMORY & VISION FORMATTING: Menyesuaikan standar ketat Vision Groq
    const formattedMessages = messages.map((msg: any) => {
      if (msg.imageUrl) {
        return {
          role: msg.role,
          content: [
            { type: "text", text: msg.content || "Tolong analisis gambar ini secara detail." },
            { type: "image_url", image_url: { url: msg.imageUrl } }
          ]
        };
      }
      return { role: msg.role, content: msg.content };
    });

    // 🔥 UPDATE SYSTEM PROMPT: Full-Stack Expert, Cinematic English Prompt, Indonesian Chat & Up-to-date Info
    const systemPrompt = `Kamu adalah Azeerh AI, asisten AI Full-Stack generasi terbaru kelas premium buatan Razeerh.
Karakteristikmu: Natural, cerdas, santai namun profesional, reasoning step-by-step, dan selalu up-to-date.
Jika disapa, jawablah dengan singkat, ramah, dan natural (misal: "Halo! Ada yang bisa saya bantu hari ini?"). JANGAN menyombongkan keahlian kecuali ditanya secara spesifik.

Keahlian Utamamu:
1. Ahli Koding Full-Stack: Kamu sangat ahli dalam pengembangan Frontend dan Backend (React, Next.js, TypeScript, Tailwind, Node.js, Database, dll). Selalu berikan arsitektur kode yang clean, modern, UI/UX premium, dan production-ready.
2. Tool-Awareness (Media Generator): JIKA pengguna meminta dibuatkan GAMBAR atau VIDEO, gunakan tool yang tersedia. WAJIB buat parameter prompt visual dalam BAHASA INGGRIS yang sangat detail, cinematic, pencahayaan epik, dan profesional. NAMUN, pastikan penjelasan dan percakapanmu dengan pengguna tetap menggunakan BAHASA INDONESIA yang elegan.
3. Informasi Terkini & Realtime: Kamu dituntut untuk selalu memberikan informasi yang paling mutakhir, lengkap, dan tidak ketinggalan zaman. Untuk hal terkait teknologi, tren, harga, atau berita terkini, berikan wawasan paling tajam dan akurat berdasarkan data terbaru. Jika tidak tahu atau data di luar jangkauan ingatanmu, jujurlah.
4. Vision: Mampu menganalisis gambar dengan tingkat akurasi tinggi.

Gunakan format Markdown untuk menjawab. Jawablah langsung pada intinya tanpa bertele-tele.`;

    // TOOL DEFINITIONS UNTUK FAL.AI
    const tools = [
      {
        type: "function",
        function: {
          name: "generate_media",
          description: "Gunakan HANYA JIKA pengguna secara eksplisit meminta dibuatkan gambar (image) atau video.",
          parameters: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["image", "video"], description: "Pilih 'image' jika diminta gambar, 'video' jika diminta video." },
              prompt: { type: "string", description: "Prompt visual dalam BAHASA INGGRIS yang sangat cinematic, detail, lighting, ambiance, dan resolusi tinggi." }
            },
            required: ["type", "prompt"]
          }
        }
      }
    ];

    let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.2-90b-vision-preview", // ONE MODEL FOR ALL
        messages: [{ role: "system", content: systemPrompt }, ...formattedMessages],
        temperature: 0.6,
        tools: tools,
        tool_choice: "auto"
      }),
    });

    let data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.error?.message || "Ditolak Server Groq." }, { status: response.status });

    const responseMessage = data.choices[0].message;

    // PROSES RENDERING MEDIA
    if (responseMessage.tool_calls) {
      if (!falKey) return NextResponse.json({ choices: [{ message: { content: "⚠️ Gagal: `FAL_API_KEY` belum dipasang di Environment Vercel." } }] });

      const toolCall = responseMessage.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      let mediaOutput = "";

      try {
        if (args.type === "image") {
          const falRes = await fetch("https://fal.run/fal-ai/flux-pro", {
            method: "POST",
            headers: { "Authorization": `Key ${falKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: args.prompt, image_size: "landscape_16_9" })
          });
          
          const falData = await falRes.json();
          if (!falRes.ok) throw new Error(falData.detail || falData.error || "Gagal dari server Fal.ai");
          
          mediaOutput = `Berikut adalah gambar yang kamu minta:\n\n![Generated Image](${falData.images[0].url})`;
        } else if (args.type === "video") {
          const falRes = await fetch("https://fal.run/fal-ai/minimax/video-01", {
            method: "POST",
            headers: { "Authorization": `Key ${falKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: args.prompt })
          });
          
          const falData = await falRes.json();
          if (!falRes.ok) throw new Error(falData.detail || falData.error || "Gagal dari server Fal.ai");
          
          mediaOutput = `Berikut adalah video sinematik yang kamu minta:\n\n[VIDEO_GENERATED](${falData.video.url})`;
        }

        // PANGGIL GROQ KEDUA KALINYA UNTUK MENYAMPAIKAN HASIL KE USER (Dalam Bahasa Indonesia)
        formattedMessages.push(responseMessage);
        formattedMessages.push({ role: "tool", tool_call_id: toolCall.id, name: toolCall.function.name, content: mediaOutput });

        const secondResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "llama-3.2-90b-vision-preview", messages: [{ role: "system", content: systemPrompt }, ...formattedMessages], temperature: 0.6 }),
        });
        
        data = await secondResponse.json();
      } catch (err: any) {
        return NextResponse.json({ choices: [{ message: { content: `⚠️ **Gagal Membuat Media:** ${err.message}` } }] });
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal terhubung ke Neural Core." }, { status: 500 });
  }
}