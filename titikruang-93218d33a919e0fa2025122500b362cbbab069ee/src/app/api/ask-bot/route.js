// app/api/ask-bot/route.js
import { NextResponse } from 'next/server';

let contextWindow = [];

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    // Tambahkan pesan user ke context window
    contextWindow.push({ role: 'user', content: prompt });
    if (contextWindow.length > 100) contextWindow = contextWindow.slice(-100);

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        messages: [
          {
            role: 'system',
            content: `Kamu adalah HelpBot, asisten AI untuk platform TitikRuang. Tugasmu adalah membantu pengunjung memahami fitur-fitur website, menjawab pertanyaan, dan memberikan navigasi seperti "buka ruang diskusi", "scroll ke bagian FAQ", atau "kembali ke beranda".`,
          },
          ...contextWindow,
        ],
        stream: false,
      }),
    });

    const data = await response.json();

    const reply = data.message?.content || 'Maaf, HelpBot tidak dapat menjawab saat ini.';
    contextWindow.push({ role: 'assistant', content: reply });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('❌ /api/ask-bot error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memanggil HelpBot lokal.' },
      { status: 500 }
    );
  }
}
