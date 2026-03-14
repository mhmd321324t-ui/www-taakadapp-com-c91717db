const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, model } = await req.json();
    const aiModel = model || 'gemini-2.5-flash';

    const systemPrompt = `أنت مساعد ذكي لإدارة تطبيق "أذاني" - تطبيق إسلامي شامل.
مهامك:
- مساعدة المدير في إدارة التطبيق والموقع
- تقديم اقتراحات لتحسين المحتوى والأداء
- المساعدة في كتابة المحتوى الإسلامي (أدعية، قصص، نصائح)
- تحليل البيانات وتقديم تقارير
- المساعدة في حل المشاكل التقنية
- تقديم أفكار لميزات جديدة
أجب دائماً بالعربية وبأسلوب احترافي ومفيد.`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'مرحباً! أنا مساعدك الذكي لإدارة تطبيق أذاني. كيف يمكنني مساعدتك؟' }] },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من الرد.';

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
