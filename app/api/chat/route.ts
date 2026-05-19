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

    // MEMORY & VISION FORMATTING
    const formattedMessages = messages.map((msg: any) => {
      if (msg.role === "user" && msg.imageUrl) {
        return {
          role: "user",
          content: [
            { type: "text", text: msg.content || "Tolong analisis gambar ini secara detail." },
            { type: "image_url", image_url: { url: msg.imageUrl } }
          ]
        };
      }
      return { role: msg.role, content: msg.content };
    });

    const systemPrompt = `Kamu adalah Azeerh AI, asisten AI generasi terbaru kelas premium buatan Razeerh.
Karakteristikmu: Natural, cerdas, santai namun profesional, reasoning step-by-step, dan anti-halusinasi. Jika tidak tahu, jujurlah.
Keahlianmu:
1. Tool-Awareness: Kamu bisa memanggil tool untuk meng-generate gambar dan video. JIKA PENGGUNA MEMINTA DIBUATKAN GAMBAR ATAU VIDEO, gunakan fungsi/tool yang tersedia. Buat prompt bahasa inggris yang sangat detail, cinematic, perhatikan lighting, composition, atmosphere, dan camera angle.
2. Vision: Kamu bisa menganalisis gambar yang diunggah pengguna dengan sangat tajam dan akurat.
3. Code & Web Expert: Kamu menulis kode TypeScript, React, Next.js, dan Tailwind CSS berskala Production-ready. Struktur UI yang kamu buat selalu premium, clean, modern, smooth, dan sangat responsif.
4. Realtime Awareness: Jika pertanyaan butuh konteks realtime (harga kripto, berita hari ini), berikan analisis logis berdasarkan data terkini yang kamu miliki, dan tekankan bahwa kamu memprosesnya dengan penalaran cerdas.
Gunakan format Markdown untuk menjawab. Jawablah langsung pada intinya, jangan kaku.`;

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
              prompt: { type: "string", description: "Prompt visual bahasa inggris yang sangat cinematic, panjang, detail, lighting, ambiance." }
            },
            required: ["type", "prompt"]
          }
        }
      }
    ];

    // INITIAL CALL KE GROQ (MENGGUNAKAN MODEL VISION RESMI GROQ)
    let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // UPDATE: Model resmi Groq untuk Vision & Tool Calling
        model: model || "llama-3.2-90b-vision-preview", 
        messages: [{ role: "system", content: systemPrompt }, ...formattedMessages],
        temperature: 0.6,
        tools: tools,
        tool_choice: "auto"
      }),
    });

    let data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.error?.message || "Ditolak Server Groq." }, { status: response.status });

    const responseMessage = data.choices[0].message;

    // JIKA AI MEMUTUSKAN UNTUK MENGGUNAKAN TOOL (MEMBUAT GAMBAR/VIDEO)
    if (responseMessage.tool_calls) {
      if (!falKey) {
        return NextResponse.json({ choices: [{ message: { content: "⚠️ **SYSTEM ERROR:** Gagal membuat media. `FAL_API_KEY` belum dipasang di Environment Vercel." } }] });
      }

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
          mediaOutput = `Berikut adalah gambar yang kamu minta:\n\n![Generated Image](${falData.images[0].url})`;
        } else if (args.type === "video") {
          const falRes = await fetch("https://fal.run/fal-ai/minimax/video-01", {
            method: "POST",
            headers: { "Authorization": `Key ${falKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: args.prompt })
          });
          const falData = await falRes.json();
          mediaOutput = `Berikut adalah video sinematik yang kamu minta:\n\n[VIDEO_GENERATED](${falData.video.url})`;
        }

        // PANGGIL GROQ KEDUA KALINYA UNTUK MENYAMPAIKAN HASIL KE USER
        formattedMessages.push(responseMessage);
        formattedMessages.push({ role: "tool", tool_call_id: toolCall.id, name: toolCall.function.name, content: mediaOutput });

        const secondResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: model, messages: [{ role: "system", content: systemPrompt }, ...formattedMessages], temperature: 0.6 }),
        });
        
        data = await secondResponse.json();
      } catch (err) {
        return NextResponse.json({ choices: [{ message: { content: "Maaf, terjadi kesalahan saat menghubungi server Rendering Studio (Fal.ai)." } }] });
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal terhubung ke Neural Core." }, { status: 500 });
  }
}