import { GoogleGenAI } from '@google/generative-ai';

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        document.getElementById('api-key').value = savedKey;
    }
    
    const btn = document.getElementById('generate-btn');
    if (btn) btn.addEventListener('click', generateQuiz);
});

async function generateQuiz() {
    const text = document.getElementById('notes-input').value.trim();
    const apiKey = document.getElementById('api-key').value.trim();

    if (!apiKey) {
        alert("Per favore, inserisci la tua Gemini API Key!");
        return;
    }
    if (!text || text.length < 15) {
        alert("Inserisci un testo più lungo per generare il quiz.");
        return;
    }

    localStorage.setItem('gemini_api_key', apiKey);

    document.getElementById('generate-btn').disabled = true;
    document.getElementById('loading-text').classList.remove('hidden');

    const prompt = `Analizza i seguenti appunti e genera un quiz di esattamente 10 domande in lingua italiana. 
    Il quiz deve contenere 5 domande a scelta multipla (con 4 opzioni ciascuna) e 5 domande di tipo vero o falso.
    Le risposte errate delle scelte multiple devono essere verosimili e intelligenti. Le domande vero o falso devono essere chiare.
    Restituisci esplicitamente ed ESCLUSIVAMENTE un array JSON (senza formattazione markdown \`\`\`json) contenente oggetti con questa esatta struttura:
    [
      { "type": "multiple", "text": "Testo della domanda...", "correctAnswer": "Risposta esatta", "choices": ["Opzione 1", "Opzione 2", "Opzione 3", "Opzione 4"] },
      { "type": "tf", "text": "Testo dell'affermazione...", "correctAnswer": "Vero", "explanation": "Spiegazione..." }
    ]
    Ecco gli appunti: ${text}`;

    try {
        // Inizializza l'SDK ufficiale di Google
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        // Utilizziamo il modello stabile gemini-2.5-flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json" // Forza la struttura JSON esatta
            }
        });

        const jsonText = response.text.trim();
        questions = JSON.parse(jsonText);

        currentQuestionIndex = 0;
        score = 0;

        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        showQuestion();

    } catch (error) {
        alert("Errore SDK Gemini: " + error.message);
        console.error(error);
    } finally {
        document.getElementById('generate-btn').disabled = false;
        document.getElementById('loading-text').classList.add('hidden');
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
