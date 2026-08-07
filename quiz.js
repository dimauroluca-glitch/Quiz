let questions = [];
let currentQuestionIndex = 0;
let score = 0;

function startOfflineQuiz() {
    let rawText = document.getElementById('notes-input').value.trim();
    if (!rawText) {
        alert("Incolla il codice JSON generato dall'IA per continuare!");
        return;
    }

    try {
        // Pulisce eventuali formattazioni di testo dell'IA (es. ```json ... ```)
        if (rawText.startsWith('```')) {
            rawText = rawText.replace(/^```[a-z]*/i, '').replace(/```$/, '');
        }

        questions = JSON.parse(rawText.trim());

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Il testo inserito non è un elenco di domande valido.");
        }

        currentQuestionIndex = 0;
        score = 0;

        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        showQuestion();

    } catch (e) {
        alert("Errore nel formato del testo: assicurati di aver copiato l'intero codice JSON dall'IA. Dettaglio: " + e.message);
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
    
    document.getElementById('question-text').innerHTML = `<small style="color:var(--primary); display:block; font-size:14px; margin-bottom:10px;">Domanda ${currentQuestionIndex + 1} di ${questions.length}</small>${currentQuestion.text}`;

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
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

function getEvaluation(finalScore, total) {
    const percent = (finalScore / total) * 100;
    if (percent === 100) return { text: "Eccellente! 🌟 Preparazione impeccabile!", color: "#2ecc71" };
    if (percent >= 80) return { text: "Ottimo! 👏 Sei decisamente pronto.", color: "#2ecc71" };
    if (percent >= 60) return { text: "Sufficiente! 👍 Hai superato il test, ma rileggi i dettagli.", color: "#f39c12" };
    if (percent >= 40) return { text: "Insufficiente! 📚 Devi studiare ancora un po'.", color: "#e74c3c" };
    return { text: "Gravemente Insufficiente! ❌ Torna a leggere gli appunti.", color: "#c0392b" };
}

function showResults() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
    
    // Aggiornato per leggere dinamicamente la lunghezza totale del JSON incollato
    document.querySelector('#result-screen .score').innerHTML = `Punteggio finale: <span id="final-score">${score}</span> / ${questions.length}`;
    
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
