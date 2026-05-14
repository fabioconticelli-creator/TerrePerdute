export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: "Messaggio mancante." }, { status: 400 });
    }

    const prompt = `
Sei l'Oracolo della Casata Valerius.
Parli in tono solenne, oscuro, profetico e fantasy.
Rispondi in italiano.
Non sei un assistente moderno: sei una voce antica.
Dai risposte utili, ma con stile evocativo.

Domanda del viandante:
${message}
`;

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Le ombre tacciono. L'Oracolo non ha risposto.";

    return Response.json({ reply });
  } catch (error) {
    return Response.json(
      { error: "Errore durante la consultazione dell'Oracolo." },
      { status: 500 }
    );
  }
}
