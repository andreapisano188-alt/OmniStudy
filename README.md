# 📚 OmniStudy — Notion for Students

> L'app di studio completa in stile **Notion** con Active Recall, Flashcards Spaced Repetition (SRS), **Google Gemini AI Tutor**, Risolutore Matematico **Wolfram|Alpha**, Timer Pomodoro e Tracker Esami.
>
> Funziona su **Mac** (app nativa), **Android** (APK) e **iPhone / iPad** (Safari PWA offline).

---

## 📲 Come usarla su iPhone (Safari PWA)

L'app è configurata come **Progressive Web App (PWA)** a schermo intero con supporto offline e safe-area per Dynamic Island / Notch:

1. Carica il repository su GitHub e abilita **GitHub Pages** (vedi sotto).
2. Apri il link del sito sul tuo iPhone usando **Safari** (es: `https://<tuo-username>.github.io/<nome-repo>/`).
3. Tocca il pulsante **Condividi** in basso (icona con il quadrato e la freccia verso l'alto ⎋).
4. Scorri e seleziona **"Aggiungi a schermata Home"** (+).
5. Tocca **Aggiungi** in alto a destra.

Ora troverai l'icona di **OmniStudy** sulla schermata principale del tuo iPhone: si avvierà a schermo intero come un'app nativa di iOS, senza barre del browser e funzionante anche offline!

---

## 🚀 Caricamento su GitHub & GitHub Pages

Grazie al workflow GitHub Actions incluso (`.github/workflows/deploy.yml`), l'app viene compilata e pubblicata automaticamente:

1. Crea un nuovo repository su [GitHub](https://github.com/new).
2. Esegui questi comandi nel terminale all'interno di questa cartella:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: OmniStudy app"
   git branch -M main
   git remote add origin https://github.com/<tuo-username>/<nome-repo>.git
   git push -u origin main
   ```
3. Vai nelle **Settings** del tuo repository su GitHub:
   - Sezione **Pages** (sulla barra laterale a sinistra).
   - Sotto **Build and deployment > Source**, seleziona **GitHub Actions**.
4. In meno di 1 minuto, il tuo sito sarà online con URL sicuro HTTPS!

---

## 🖥️ App Nativa per Mac
L'applicazione è presente sia nella cartella `/Applications/OmniStudy.app` sia sulla Scrivania (`/Users/andrea/Desktop/OmniStudy.app`).

Per ricompilarla manualmente:
```bash
npm run build
clang -framework Cocoa -framework WebKit -O2 macos/main.m -o macos/OmniStudy
cp macos/OmniStudy OmniStudy.app/Contents/MacOS/OmniStudy
cp -R dist/* OmniStudy.app/Contents/Resources/web/
codesign --force --deep -s - OmniStudy.app
```

---

## 📱 App Android (APK)
L'APK pronto all'installazione è posizionato sulla Scrivania come `OmniStudy-Notion.apk`.

Per ricompilare l'APK da riga di comando:
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
# L'APK compilato si trova in: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ✨ Funzionalità Principali

- ✍️ **Editor a blocchi Notion**: H1, H2, H3, testo, checklist interattive, callout evidenziati, citazioni e blocchi codice.
- 🧠 **Active Recall Toggles**: blocchi con domanda visibile e risposta nascosta fino al clic, con pulsante rapido per trasformarli in flashcard.
- 🔄 **Spaced Repetition (SRS)**: flashcard con animazione 3D e algoritmo di intervalli (1g, 3g, 7g).
- 🤖 **Google Gemini AI Tutor**: spiegazioni Feynman, riassunti in punti elenco, simulazione interrogazioni e generatore automatico di flashcard da qualsiasi nota.
- 📐 **Wolfram|Alpha Solver**: risolutore di derivate, integrali, equazioni di secondo grado e tavola delle costanti fisiche con inserimento in LaTeX.
- 🧪 **Simulatore Quiz**: quiz a risposta multipla generati con l'AI con correzione immediata e punteggio.
- ⏱️ **Timer Pomodoro**: cicli studio da 25m e pause con chime sonoro via Web Audio API.
- 🎯 **Tracker Esami**: conto alla rovescia per gli appelli d'esame e percentuale di completamento programma.
- 🎙️ **Dettatura Vocale**: parla per scrivere appunti in italiano.
- 💾 **Sincronizzazione Facile**: esporta e importa file `.json` per trasferire note tra Mac, iPhone e Android senza bisogno di cloud proprietari.
