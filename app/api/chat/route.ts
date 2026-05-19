import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // MENGAMBIL KUNCI RAHASIA DARI VERCEL
    const apiKey = process.env.GROQ_API_KEY;
    const falKey = process.env.FAL_API_KEY; 

    if (!apiKey) {
      return NextResponse.json({ error: "API Key Groq tidak ditemukan di Environment Vercel." }, { status: 500 });
    }

    // 🔥 FIX 1: "must be a string" - Sabuk pengaman agar konten tidak pernah null
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
      return { role: msg.role, content: msg.content || "" };
    });

     const systemPrompt = `Kamu adalah Azeerh AI, asisten AI Full-Stack generasi terbaru kelas premium buatan Razeerh.
Karakteristikmu: Natural, cerdas, santai namun profesional, reasoning step-by-step, dan selalu up-to-date.
Jika disapa, jawablah dengan singkat, ramah, dan natural (misal: "Halo! Ada yang bisa saya bantu hari ini?"). JANGAN menyombongkan keahlian kecuali ditanya secara spesifik.

Keahlian Utamamu:
1. Ahli Koding Full-Stack: Kamu sangat ahli dalam pengembangan Frontend dan Backend (React, Next.js, TypeScript, Tailwind, Node.js, Database, dll). Selalu berikan arsitektur kode yang clean, modern, UI/UX premium, dan production-ready.
2. Tool-Awareness (Media Generator): JIKA pengguna meminta dibuatkan GAMBAR atau VIDEO, gunakan tool yang tersedia. WAJIB buat parameter prompt visual dalam BAHASA INGGRIS yang sangat detail, cinematic, pencahayaan epik, dan profesional. NAMUN, pastikan penjelasan dan percakapanmu dengan pengguna tetap menggunakan BAHASA INDONESIA yang elegan.
3. Informasi Terkini & Realtime: Kamu dituntut untuk selalu memberikan informasi yang paling mutakhir, lengkap, dan tidak ketinggalan zaman. Untuk hal terkait teknologi, tren, harga, atau berita terkini, berikan wawasan paling tajam dan akurat berdasarkan data terbaru. Jika tidak tahu atau data di luar jangkauan ingatanmu, jujurlah.
4. Vision: Mampu menganalisis gambar dengan tingkat akurasi tinggi.

Gunakan format Markdown untuk menjawab. Jawablah langsung pada intinya tanpa bertele-tele.`;
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
              prompt: { type: "string", description: "Prompt visual dalam BAHASA INGGRIS yang sangat cinematic, detail, lighting, ambiance." }
            },
            required: ["type", "prompt"]
          }
        }
      }
    ];

    // 🔥 FIX 2: "does not exist" - Menggunakan ID Resmi Llama 4 Scout yang punya Vision + Tools
    const groqOmniModel = "meta-llama/llama-4-scout-17b-16e-instruct";

    let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: groqOmniModel, // Memaksa AI selalu pakai model terpintar
        messages: [{ role: "system", content: systemPrompt }, ...formattedMessages],
        temperature: 0.6,
        tools: tools,
        tool_choice: "auto"
      }),
    });

    let data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.error?.message || "Ditolak Server Groq." }, { status: response.status });

    const responseMessage = data.choices[0].message;

    // 🔥 FIX 3: PROSES RENDERING MEDIA DENGAN PENANGKAP ERROR AKURAT
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
          // Akan menampilkan error ASLI dari Fal (misal: "Insufficient balance" atau API Key salah)
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

        // Amankan data balasan dari Groq agar tidak null
        const cleanResponseMessage = {
          role: responseMessage.role,
          content: responseMessage.content || "",
          tool_calls: responseMessage.tool_calls
        };

        formattedMessages.push(cleanResponseMessage);
        formattedMessages.push({ role: "tool", tool_call_id: toolCall.id, name: toolCall.function.name, content: mediaOutput });

        const secondResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: groqOmniModel, messages: [{ role: "system", content: systemPrompt }, ...formattedMessages], temperature: 0.6 }),
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