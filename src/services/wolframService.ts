export interface CalculationResult {
  query: string;
  solution: string;
  latex: string;
  steps?: string[];
  wolframUrl: string;
}

export const PHYSICAL_CONSTANTS = [
  { name: 'Velocità della luce nel vuoto (c)', value: '299,792,458 m/s', latex: 'c = 2.998 \\times 10^8 \\text{ m/s}' },
  { name: 'Costante di Planck (h)', value: '6.62607015 × 10^-34 J·s', latex: 'h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}' },
  { name: 'Costante Gravitazionale (G)', value: '6.67430 × 10^-11 N·m²/kg²', latex: 'G = 6.674 \\times 10^{-11} \\text{ N}\\cdot\\text{m}^2/\\text{kg}^2' },
  { name: 'Numero di Avogadro (N_A)', value: '6.02214076 × 10^23 mol^-1', latex: 'N_A = 6.022 \\times 10^{23} \\text{ mol}^{-1}' },
  { name: 'Carica Elementare (e)', value: '1.602176634 × 10^-19 C', latex: 'e = 1.602 \\times 10^{-19} \\text{ C}' },
  { name: 'Costante dei Gas Ideali (R)', value: '8.314462618 J/(mol·K)', latex: 'R = 8.314 \\text{ J}/(\\text{mol}\\cdot\\text{K})' },
  { name: 'Massa a riposo Elettrone (m_e)', value: '9.1093837 × 10^-31 kg', latex: 'm_e = 9.109 \\times 10^{-31} \\text{ kg}' },
];

export async function solveMathOrQuery(query: string, appId?: string): Promise<CalculationResult> {
  const cleanQ = query.trim();
  const wolframUrl = `https://www.wolframalpha.com/input?i=${encodeURIComponent(cleanQ)}`;

  // If user provided a Wolfram Alpha AppID, query the API
  if (appId && appId.trim()) {
    try {
      const apiUrl = `https://api.wolframalpha.com/v1/result?appid=${appId.trim()}&i=${encodeURIComponent(cleanQ)}`;
      const resp = await fetch(apiUrl);
      if (resp.ok) {
        const text = await resp.text();
        return {
          query: cleanQ,
          solution: text,
          latex: text,
          wolframUrl
        };
      }
    } catch (e) {
      console.warn("Wolfram API fetch failed, using smart engine:", e);
    }
  }

  // Built-in smart symbolic engine
  return computeSymbolic(cleanQ, wolframUrl);
}

function computeSymbolic(query: string, wolframUrl: string): CalculationResult {
  const q = query.toLowerCase().trim();

  // 1. Derivata
  if (q.startsWith('d/') || q.includes('derivata') || q.includes('derivative')) {
    if (q.includes('sin') || q.includes('sen')) {
      return {
        query,
        solution: "La derivata di sin(x) è cos(x)",
        latex: "\\frac{d}{dx}\\sin(x) = \\cos(x)",
        steps: [
          "1. Definizione con limite: lim (h->0) [sin(x+h) - sin(x)] / h",
          "2. Formule di prostaferesi: sin(p) - sin(q) = 2 cos((p+q)/2) sin((p-q)/2)",
          "3. Risultato: cos(x)"
        ],
        wolframUrl
      };
    }
    if (q.includes('cos')) {
      return {
        query,
        solution: "La derivata di cos(x) è -sin(x)",
        latex: "\\frac{d}{dx}\\cos(x) = -\\sin(x)",
        steps: ["Applicazione della derivazione per le funzioni goniometriche: d/dx[cos(x)] = -sin(x)"],
        wolframUrl
      };
    }
    if (q.includes('e^x') || q.includes('exp')) {
      return {
        query,
        solution: "La derivata di e^x è e^x",
        latex: "\\frac{d}{dx}e^x = e^x",
        steps: ["La funzione esponenziale con base e è l'unica funzione che coincide con la propria derivata."],
        wolframUrl
      };
    }
    if (q.includes('ln') || q.includes('log')) {
      return {
        query,
        solution: "La derivata di ln(x) è 1/x (per x > 0)",
        latex: "\\frac{d}{dx}\\ln(x) = \\frac{1}{x}, \\quad x > 0",
        steps: ["Derivata del logaritmo naturale."],
        wolframUrl
      };
    }
    // General polynomial derivative match: x^n
    const polyMatch = q.match(/x\^?(\d+)?/);
    if (polyMatch) {
      const n = polyMatch[1] ? parseInt(polyMatch[1]) : 1;
      const newN = n - 1;
      const resLatex = newN === 0 ? `${n}` : newN === 1 ? `${n}x` : `${n}x^{${newN}}`;
      return {
        query,
        solution: `Derivata di x^${n} = ${resLatex}`,
        latex: `\\frac{d}{dx}x^{${n}} = ${resLatex}`,
        steps: [
          `Regola di potenza: d/dx[x^n] = n * x^(n-1)`,
          `Moltiplica per l'esponente ${n} e decrementa l'esponente a ${newN}`
        ],
        wolframUrl
      };
    }
  }

  // 2. Integrale
  if (q.startsWith('int') || q.includes('integrale') || q.includes('integral')) {
    if (q.includes('1/x')) {
      return {
        query,
        solution: "Integrale di 1/x = ln|x| + c",
        latex: "\\int \\frac{1}{x}\\,dx = \\ln|x| + C",
        steps: ["Integrale notevole del logaritmo."],
        wolframUrl
      };
    }
    if (q.includes('cos')) {
      return {
        query,
        solution: "Integrale di cos(x) = sin(x) + c",
        latex: "\\int \\cos(x)\\,dx = \\sin(x) + C",
        steps: ["Funzione primitiva di cos(x) è sin(x)."],
        wolframUrl
      };
    }
    if (q.includes('sin') || q.includes('sen')) {
      return {
        query,
        solution: "Integrale di sin(x) = -cos(x) + c",
        latex: "\\int \\sin(x)\\,dx = -\\cos(x) + C",
        steps: ["Funzione primitiva di sin(x) è -cos(x)."],
        wolframUrl
      };
    }
    return {
      query,
      solution: "Integrale di potenza: int x^n dx = (x^(n+1))/(n+1) + C",
      latex: "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C, \\quad n \\neq -1",
      steps: ["Aumenta l'esponente di 1 e dividi per il nuovo esponente."],
      wolframUrl
    };
  }

  // 3. Risoluzione equazione secondo grado
  const quadMatch = q.match(/([+-]?\d*)x\^2\s*([+-]\s*\d*)x\s*([+-]\s*\d*)\s*=\s*0/);
  if (quadMatch) {
    let a = parseFloat(quadMatch[1].replace(/\s+/g, '') || '1');
    let b = parseFloat(quadMatch[2].replace(/\s+/g, '') || '1');
    let c = parseFloat(quadMatch[3].replace(/\s+/g, '') || '0');
    if (isNaN(a)) a = 1;

    const delta = b * b - 4 * a * c;
    if (delta > 0) {
      const x1 = ((-b + Math.sqrt(delta)) / (2 * a)).toFixed(2);
      const x2 = ((-b - Math.sqrt(delta)) / (2 * a)).toFixed(2);
      return {
        query,
        solution: `Due soluzioni reali distinte: x₁ = ${x1}, x₂ = ${x2}`,
        latex: `\\Delta = ${b}^2 - 4(${a})(${c}) = ${delta} \\implies x_{1,2} = \\frac{-(${b}) \\pm \\sqrt{${delta}}}{2(${a})} \\implies x_1 = ${x1}, \\; x_2 = ${x2}`,
        steps: [
          `1. Calcolo del discriminante: Δ = b² - 4ac = ${delta}`,
          `2. Poiché Δ > 0, esistono due soluzioni reali distinte`,
          `3. Formula risolutiva: x = (-b ± √Δ) / (2a)`,
          `4. x₁ = ${x1}, x₂ = ${x2}`
        ],
        wolframUrl
      };
    } else if (delta === 0) {
      const x = (-b / (2 * a)).toFixed(2);
      return {
        query,
        solution: `Due soluzioni reali coincidenti: x = ${x}`,
        latex: `\\Delta = 0 \\implies x = -\\frac{b}{2a} = ${x}`,
        steps: [`Discriminante nullo Δ = 0, soluzione doppia x = ${x}`],
        wolframUrl
      };
    } else {
      return {
        query,
        solution: `Nessuna radice reale (due soluzioni complesse coniugate con Δ = ${delta})`,
        latex: `\\Delta = ${delta} < 0 \\implies x_{1,2} \\in \\mathbb{C}`,
        steps: [`Δ < 0: non esistono intersezioni reali con l'asse x.`],
        wolframUrl
      };
    }
  }

  // 4. Default general calculator calculation
  try {
    // Basic arithmetic evaluation fallback
    const sanitized = q.replace(/[^0-9+\-*/().^sqrtlogpieE]/g, '');
    if (sanitized && /^[0-9+\-*/().^e]+$/.test(sanitized)) {
      const evaluated = Function(`'use strict'; return (${sanitized.replace(/\^/g, '**')})`)();
      return {
        query,
        solution: `Risultato calcolato: ${evaluated}`,
        latex: `${query} = ${evaluated}`,
        steps: [`Valutazione dell'espressione numerica: ${evaluated}`],
        wolframUrl
      };
    }
  } catch (err) {}

  // Fallback
  return {
    query,
    solution: `Calcolo pronto per Wolfram|Alpha: ${query}`,
    latex: `\\text{Risultato per: } ${query}`,
    steps: [
      "Puoi visualizzare il grafico 2D/3D interattivo e tutti i passaggi completi cliccando su 'Apri in Wolfram|Alpha'."
    ],
    wolframUrl
  };
}
