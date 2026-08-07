let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// Al caricamento della pagina, se esiste una chiave salvata nel browser, la reinserisce da sola
document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        const apiKeyEl = document.getElementById('api-key');
        if (apiKeyEl) apiKeyEl.value = savedKey;
    }
    
    const btn = document.getElementById('generate-btn');
    if (btn) btn.addEventListener('click', generateQuiz);
});

function startOfflineQuiz() {
    let rawText = document.getElementById('notes-input').value.trim();
    if (!rawText) {
        alert("Incolla il codice JSON generato dall'IA per iniziare il gioco!");
        return;
    }

    try {
        if (rawText.startsWith('```')) {
            rawText = rawText.replace(/^```[a-z]*/i, '').replace(/```$/, '');
        }

        questions = JSON.parse(rawText.trim());

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Dati di gioco non validi.");
        }

        currentQuestionIndex = 0;
        score = 0;

        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        showQuestion();

    } catch (e) {
        alert("Errore Codice: assicurati di copiare tutto l'array JSON dall'IA.");
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
    
    document.getElementById('hud-current').innerText = `STAGE ${currentQuestionIndex + 1} / ${questions.length}`;
    document.getElementById('hud-score').innerText = `SCORE: ${score * 100}`;
    
    const progressPercent = (currentQuestionIndex / questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progressPercent}%`;

    document.getElementById('question-text').innerHTML = currentQuestion.text;

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

    const isCorrect = userChoice.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();

    if (userChoice === 'Vero') {
        btnVero.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) btnFalso.classList.add('correct');
    } else {
        btnFalso.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) btnVero.classList.add('correct');
    }

    if (isCorrect) {
        score++;
        document.getElementById('hud-score').innerText = `SCORE: ${score * 100}`;
        feedback.innerHTML = `<span style="color: var(--neon-green);">+100 XP - ESATTO! 🔥🏆</span>`;
    } else {
        feedback.innerHTML = `<span style="color: var(--neon-red);">COMBO INTERROTTA! ❌</span><br><small style="font-weight:500; font-size:0.9rem; color:var(--text-muted);">${currentQuestion.explanation || ''}</small>`;
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
        document.getElementById('hud-score').innerText = `SCORE: ${score * 100}`;
        feedback.innerHTML = `<span style="color: var(--neon-green);">+100 XP - ESATTO! 🔥🏆</span>`;
    } else {
        selectedLi.classList.add('wrong');
        options.forEach(li => {
            if (li.innerText.toLowerCase() === correctOption.toLowerCase()) {
                li.classList.add('correct');
            }
        });
        feedback.innerHTML = `<span style="color: var(--neon-red);">RISPOSTA ERRATA! ❌</span><br><small style="font-weight:500; font-size:0.9rem; color:var(--text-muted);">La soluzione corretta era: <b>${correctOption}</b></small>`;
    }

    document.getElementById('next-btn').classList.remove('hidden');
}

window.nextQuestion = function() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

function getEvaluation(finalScore, total) {
    const percent = (finalScore / total) * 100;
    if (percent === 100) return { text: "GOD MODE 👑 - Perfetto al 100%!", color: "var(--neon-green)" };
    if (percent >= 80) return { text: "PRO GAMER ⭐ - Sei preparatissimo!", color: "var(--neon-blue)" };
    if (percent >= 60) return { text: "LIVELLO SUPERATO 👍 - Sufficiente!", color: "#eab308" };
    if (percent >= 40) return { text: "N00B ALERT 📚 - Insufficiente, studia!", color: "var(--neon-red)" };
    return { text: "GAME OVER ❌ - Rileggi subito tutto!", color: "#b91c1c" };
}

function showResults() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
    document.getElementById('total-questions-hud').innerText = questions.length;
    
    document.getElementById('progress-fill').style.width = "100%";
    
    const evaluation = getEvaluation(score, questions.length);
    const targetEl = document.getElementById('evaluation-text');
    targetEl.innerText = evaluation.text;
    targetEl.style.color = evaluation.color;
}

window.resetQuiz = function() {
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
    document.getElementById('notes-input').value = '';
}

window.copyPromptToClipboard = function() {
    const promptText = `Genera un quiz di 10 domande (5 multiple con 4 opzioni e 5 vero/falso) basato sugli appunti che ti lascio qui sotto. Restituisci ESCLUSIVAMENTE un array JSON puro, senza alcuna introduzione, senza saluti e senza racchiuderlo nei blocchi di codice markdown (niente tre backtick e niente scritta json). I dati devono seguire questa esatta struttura:

[
  { "type": "multiple", "text": "Domanda...", "correctAnswer": "Risposta esatta", "choices": ["Opzione 1", "Opzione 2", "Opzione 3", "Opzione 4"] },
  { "type": "tf", "text": "Affermazione...", "correctAnswer": "Vero", "explanation": "Spiegazione..." }
]

Ecco i miei appunti: `;

    navigator.clipboard.writeText(promptText).then(() => {
        const btn = document.querySelector('.copy-btn');
        const oldText = btn.innerText;
        btn.innerText = "✅ COPIATO CON SUCCESSO!";
        btn.style.background = "var(--neon-green)";
        setTimeout(() => {
            btn.innerText = oldText;
            btn.style.background = "var(--neon-blue)";
        }, 2000);
    }).catch(err => {
        alert("Impossibile copiare automaticamente. Seleziona il testo del comando a mano.");
    });
}
