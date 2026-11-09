import { Page, Flashcard, QuizQuestion } from '../types';

export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function callGemini(prompt: string, apiKey?: string, systemInstruction?: string): Promise<string> {
  if (!apiKey || !apiKey.trim()) {
    // Helpful simulation fallback when no key is set yet
    return simulateGeminiResponse(prompt);
  }

  try {
    const url = `${GEMINI_API_URL}?key=${apiKey.trim()}`;
    const contents: any[] = [];

    if (systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: `Istruzioni di sistema: ${systemInstruction}\n\nRichiesta utente: ${prompt}` }]
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `Errore HTTP ${response.status}`;
      throw new Error(msg);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Nessuna risposta generata da Gemini.');
    }

    return text;
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    throw err;
  }
}

// 1. Generate Flashcards from current page content
export async function generateFlashcardsWithGemini(page: Page, apiKey?: string): Promise<{ front: string; back: string }[]> {
  const pageText = `Titolo: ${page.title}\n\nContenuto appunti:\n` + page.blocks.map(b => `${b.type.toUpperCase()}: ${b.content} ${b.extra || ''}`).join('\n');

  const prompt = `Sei un tutor esperto di memorizzazione e ripetizione spaziata (SRS).
Dati i seguenti appunti di studio, genera da 3 a 5 flashcards ad altissimo rendimento (Active Recall) focalizzate sui concetti chiave, formule o definizioni.
Rispondi ESCLUSIVAMENTE con un JSON valido nel formato seguente, senza testo extra prima o dopo:
[
  {
    "front": "Domanda o concetto conciso",
    "back": "Risposta spiegata chiara ed esaustiva"
  }
]

Appunti:
${pageText}`;

  try {
    const raw = await callGemini(prompt, apiKey, "Rispondi unicamente con un array JSON di oggetti { front, back }.");
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn("Fallback flashcard generation:", e);
  }

  // Fallback if parsing fails or no key
  return [
    {
      front: `Qual è il concetto centrale di "${page.title}"?`,
      back: page.blocks[0]?.content || "Concetto fondamentale studiato nella lezione."
    },
    {
      front: `Spiega in sintesi l'argomento trattato in ${page.title}`,
      back: page.blocks.map(b => b.content).filter(Boolean).slice(0, 2).join('. ') || "Ripassare i punti chiave del capitolo."
    }
  ];
}

// 2. Generate Quiz Questions from page
export async function generateQuizWithGemini(page: Page, apiKey?: string): Promise<QuizQuestion[]> {
  const pageText = `Titolo: ${page.title}\n` + page.blocks.map(b => `${b.content} ${b.extra || ''}`).join('\n');

  const prompt = `Sei un professore universitario. Crea 3 domande a risposta multipla d'esame per verificare la comprensione dei seguenti appunti.
Ogni domanda deve avere 4 opzioni (A, B, C, D), l'indice della risposta esatta (da 0 a 3) e una spiegazione del perché è corretta.
Rispondi ESCLUSIVAMENTE con un JSON valido nel formato seguente:
[
  {
    "question": "Testo della domanda?",
    "options": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
    "correctIndex": 0,
    "explanation": "Spiegazione della risposta corretta."
  }
]

Appunti:
${pageText}`;

  try {
    const raw = await callGemini(prompt, apiKey, "Rispondi unicamente con un array JSON.");
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((q: any, i: number) => ({
        id: `q-${Date.now()}-${i}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation
      }));
    }
  } catch (e) {
    console.warn("Fallback quiz generation:", e);
  }

  return [
    {
      id: `q-fallback-1`,
      question: `Riguardo a "${page.title}", quale affermazione è corretta?`,
      options: [
        `È un concetto fondamentale trattato in ${page.tags[0] || 'questa materia'}`,
        `Non ha applicazioni pratiche`,
        `È una teoria smentita di recente`,
        `Si applica solo a casi nulli`
      ],
      correctIndex: 0,
      explanation: "È il cardine principale sviluppato in questi appunti di studio."
    }
  ];
}

// Intelligent simulation fallback when user hasn't put an API key yet
function simulateGeminiResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('feynman') || p.includes('bambino') || p.includes('semplice')) {
    return `🎓 **Spiegazione Metodo Feynman:**\n\nImmagina questo concetto come una ricetta di cucina: invece di usare termini difficili, pensa a come ogni ingrediente interagisce con l'altro. Se cambi una quantità (variabile), il sapore finale (risultato) cambia di conseguenza. Questa intuizione ti permette di ricordare la logica senza doverla imparare a memoria!\n\n*(💡 Per risposte AI in tempo reale personalizzate sui tuoi testi, inserisci la tua chiave gratuita Google Gemini in Impostazioni).*`;
  }
  if (p.includes('riassum') || p.includes('punti chiave') || p.includes('sintesi')) {
    return `📋 **Sintesi Punti Chiave:**\n\n1. **Definizione Principale:** Concetto cardine da memorizzare per l'esame.\n2. **Regola / Meccanismo:** Come si applica e quali condizioni richiede.\n3. **Caso Particolare o Limite:** L'eccezione tipica che i professori chiedono all'orale.\n4. **Collegamento:** Si collega direttamente agli argomenti successivi del programma.\n\n*(💡 Configura la tua API Key Gemini gratuita per generare riassunti automatici da qualsiasi documento).*`;
  }
  return `🤖 **Tutor Gemini:**\n\nHo analizzato la tua richiesta: *"__${prompt.slice(0, 80)}...__"*\n\nPer studiare al meglio questo argomento ti consiglio di:\n- Scomporre il problema nei suoi assiomi di base.\n- Creare un toggle di **Active Recall** per testarti a libro chiuso.\n- Verificare i passaggi matematici con il risolutore integrato **Wolfram**.\n\n*(🔑 Suggerimento: Puoi collegare la tua API Key gratuita di Gemini tramite il pulsante ⚙️ Impostazioni per avere risposte AI illimitate su misura per i tuoi corsi!)*`;
}
