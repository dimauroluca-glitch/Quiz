let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let engine = null;

// Modello IA ottimizzato, ultra-leggero e veloce
const selectedModel = "Gemma-2-2b-it-q4f16-1";

async function generateQuiz() {
    const text = document.getElementById('notes-input').value.trim();

    if (!text || text.length < 15) {
        alert("Inserisci un testo più lungo per generare il quiz.");
        return;
    }

    document.getElementById('generate-btn').disabled = true;
    const loadingBox = document.getElementById('loading-box');
    const loadingText = document.getElementById('loading-text');
    const progressFill = document.getElementById('progress-fill');
    loadingBox.classList.remove('hidden');

    try {
        // Inizializzazione tramite la variabile globale esposta dal bundle compilato
        if (!engine) {
            engine = new webllm.CreateEngine();
            
            engine.setInitProgressCallback((report) => {
                const percent = Math.round(report.progress * 100);
                loadingText.innerText = `Fase: ${report.text} (${percent}%)`;
                progressFill.style.width = `${percent}%`;
            });

            await engine.reload(selectedModel);
        }

        loadingText.innerText = "🧠 L'IA locale sta elaborando le domande dai tuoi appunti...";
        progressFill.style.width = "100%";

        const prompt = `Analizza i seguenti appunti e genera un quiz di esattamente 10 domande in lingua italiana. 
        Il quiz deve contenere 5 domande a scelta multipla (con 4 opzioni ciascuna) e 5 domande di tipo vero o falso.
        Restituisci ESCLUSIVAMENTE un array JSON puro, senza alcun testo aggiuntivo e senza formattazione markdown.
        Usa questa esatta struttura:
        [
          { "type": "multiple", "text": "Testo della domanda...", "correctAnswer": "Risposta esatta", "choices": ["Opzione 1", "Opzione 2", "Opzione 3", "Opzione 4"] },
          { "type": "tf", "text": "Testo dell'affermazione...", "correctAnswer": "Vero", "explanation": "Spiegazione..." }
        ]
        Ecco gli appunti: ${text}`;

        const messages = [
            { role: "system", content: "Sei un generatore di quiz rigido. Rispondi solo in formato JSON, senza fare introduzioni o commenti." },
            { role: "user", content: prompt }
        ];

        const reply = await engine.chat.completions.create({
            messages: messages,
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const jsonText = reply.choices.message.content.trim();
        questions = JSON.parse(jsonText);

        currentQuestionIndex = 0;
        score = 0;

        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        showQuestion();

    } catch (error) {
        alert("Errore dell'IA Locale: " + error.message + "\nAssicurati che il tuo browser supporti WebGPU (usa Chrome o Edge aggiornati).");
        console.error(error);
    } finally {
        document.getElementById('generate-btn').disabled = false;
        loadingBox.classList.add('hidden');
    }
}

function showQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    document.getElementById('feedback-text').innerText = '';
    document.getElementById('next-btn').classList.add('hidden');
    
    const optionsContainer = document.getElementById('options-container');
    const tfContainer = document.getElementById('tf-container');

    optionsContainer.innerHTML = '';
    tfContainer.classList.add('hidden');
    
    document.getElementById('question-text').innerHTML = `<small style="color:var(--primary); display:block; font-size:14px; margin-bottom:10px;">Domanda ${currentQuestionIndex + 1} di 10</small>${currentQuestion.text}`;

    if (currentQuestion.type === 'tf') {
        tfContainer.classList.remove('hidden');
        const btnVero = document.getElementById('btn-vero');
        const btnFalso = document.getElementById('btn-falso');
        btnVero.className = 'option-btn';
        btnFalso.className = 'option-btn';
        btnVero.style.pointerEvents = 'auto';
        btnFalso.style.pointerEvents = 'auto';
    } else {
        currentQuestion.choices.forEach(option => {
            const li = document.createElement('li');
            li.className = 'option-item';
            li.innerText = option;
            li.onclick = () => checkMultipleAnswer(li, option, currentQuestion.correctAnswer);
            optionsContainer.appendChild(li);
        });
    }
}

window.checkTrueFalse = function(userChoice) {
    const currentQuestion = questions[currentQuestionIndex];
    const btnVero = document.getElementById('btn-vero');
    const btnFalso = document.getElementById('btn-falso');
    const feedback = document.getElementById('feedback-text');

    btnVero.style.pointerEvents = 'none';
    btnFalso.style.pointerEvents = 'none';

    const isCorrect = userChoice === currentQuestion.correctAnswer;

    if (userChoice === 'Vero') {
        btnVero.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) btnFalso.classList.add('correct');
    } else {
        btnFalso.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) btnVero.classList.add('correct');
    }

    if (isCorrect) {
        score++;
        feedback.innerHTML = `<span style="color: var(--success);">Esatto! 🎉</span>`;
    } else {
        feedback.innerHTML = `<span style="color: var(--danger);">Sbagliato! ❌</span> ${currentQuestion.explanation || ''}`;
    }

    document.getElementById('next-btn').classList.remove('hidden');
}

// Intercettore di attivazione per il pulsante
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('generate-btn');
    if (btn) btn.addEventListener('click', generateQuiz);
});
window.checkMultipleAnswer = function(selectedLi, selectedOption, correctOption) {
    const options = document.querySelectorAll('.option-item');
    options.forEach(li => li.style.pointerEvents = 'none');

    const feedback = document.getElementById('feedback-text');
    const isCorrect = selectedOption.toLowerCase() === correctOption.toLowerCase();

    if (isCorrect) {
        selectedLi.classList.add('correct');
        score++;
        feedback.innerHTML = `<span style="color: var(--success);">Esatto! 🎉</span>`;
    } else {
        selectedLi.classList.add('wrong');
        options.forEach(li => {
            if (li.innerText.toLowerCase() === correctOption.toLowerCase()) {
                li.classList.add('correct');
            }
        });
        feedback.innerHTML = `<span style="color: var(--danger);">Sbagliato! ❌</span> Risposta corretta: <strong>${correctOption}</strong>`;
    }

    document.getElementById('next-btn').classList.remove('hidden');
}

window.nextQuestion = function() {
    currentQuestionIndex++;
    if (currentQuestionIndex < 10) {
        showQuestion();
    } else {
        showResults();
    }
}

function getEvaluation(finalScore) {
    if (finalScore === 10) return { text: "Eccellente! 🌟 Preparazione impeccabile!", color: "#2ecc71" };
    if (finalScore >= 8) return { text: "Ottimo! 👏 Sei decisamente pronto.", color: "#2ecc71" };
    if (finalScore >= 6) return { text: "Sufficiente! 👍 Hai superato il test, ma rileggi i dettagli.", color: "#f39c12" };
    if (finalScore >= 4) return { text: "Insufficiente! 📚 Devi studiare ancora un po'.", color: "#e74c3c" };
    return { text: "Gravemente Insufficiente! ❌ Torna a leggere gli appunti.", color: "#c0392b" };
}

function showResults() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
    
    const evaluation = getEvaluation(score);
    const targetEl = document.getElementById('evaluation-text');
    targetEl.innerText = evaluation.text;
    targetEl.style.color = evaluation.color;
}

window.resetQuiz = function() {
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
    document.getElementById('notes-input').value = '';
}
