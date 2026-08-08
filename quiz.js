let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let wrongAnswersLog = [];
let isCardFlipped = false;
let currentQuizSubject = "Generale";

function playArcadeSound(type) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    
    if (type === 'correct') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); 
        gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'wrong') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(220, ctx.currentTime); 
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
    }
}

window.changeTheme = function(themeName) {
    const body = document.body;
    const xp = parseInt(localStorage.getItem('arcade_total_xp') || 0);
    
    if (themeName === 'veterano' && xp < 4000) return;
    if (themeName === 'suprema' && xp < 8000) return;
    if (themeName === 'pazzo' && xp < 15000) return;
    if (themeName === 'master' && xp < 30000) return;
    if (themeName === 'divina' && xp < 50000) return;
    if (themeName === 'enciclo' && xp < 100000) return;
    if (themeName === 'architeto' && xp < 250000) return;
    if (themeName === 'filosofo' && xp < 500000) return;
    if (themeName === 'alieni' && xp < 1000000) return;
    if (themeName === 'reassoluto' && xp < 10000000) return;
    if (themeName === 'interstel' && xp < 100000000) return;
    if (themeName === 'creatore' && xp < 500000000) return;
    if (themeName === 'cosmica' && xp < 1000000000) return;
    
    body.className = ''; 
    if (themeName !== 'cyber') body.classList.add('theme-' + themeName);
    localStorage.setItem('arcade_active_theme', themeName);
}

function updateShopLockStatus(xp) {
    if (xp >= 4000) { document.getElementById('shop-btn-veterano').classList.remove('locked'); document.getElementById('shop-btn-veterano').innerText = "Veterano ⚔️"; }
    if (xp >= 8000) { document.getElementById('shop-btn-suprema').classList.remove('locked'); document.getElementById('shop-btn-suprema').innerText = "Intelligenza Suprema 🧠"; }
    if (xp >= 15000) { document.getElementById('shop-btn-pazzo').classList.remove('locked'); document.getElementById('shop-btn-pazzo').innerText = "Scienziato Pazzo 🧪"; }
    if (xp >= 30000) { document.getElementById('shop-btn-master').classList.remove('locked'); document.getElementById('shop-btn-master').innerText = "Master Copia-Incolla ⚡"; }
    if (xp >= 50000) { document.getElementById('shop-btn-divina').classList.remove('locked'); document.getElementById('shop-btn-divina').innerText = "Divinità dello Studio 👑"; }
    if (xp >= 100000) { document.getElementById('shop-btn-enciclo').classList.remove('locked'); document.getElementById('shop-btn-enciclo').innerText = "Enciclopedia Vivente 🎓"; }
    if (xp >= 250000) { document.getElementById('shop-btn-architeto').classList.remove('locked'); document.getElementById('shop-btn-architeto').innerText = "Architetto del Sapere 🏛️"; }
    if (xp >= 500000) { document.getElementById('shop-btn-filosofo').classList.remove('locked'); document.getElementById('shop-btn-filosofo').innerText = "Filosofo Immortale 🔮"; }
    if (xp >= 1000000) { document.getElementById('shop-btn-alieni').classList.remove('locked'); document.getElementById('shop-btn-alieni').innerText = "Intelligenza Alieni 👽"; }
    if (xp >= 10000000) { document.getElementById('shop-btn-reassoluto').classList.remove('locked'); document.getElementById('shop-btn-reassoluto').innerText = "Re del Copia-Incolla 👑"; }
    if (xp >= 100000000) { document.getElementById('shop-btn-interstel').classList.remove('locked'); document.getElementById('shop-btn-interstel').innerText = "Entità Interstellare ✨"; }
    if (xp >= 500000000) { document.getElementById('shop-btn-creatore').classList.remove('locked'); document.getElementById('shop-btn-creatore').innerText = "Creatore di Mondi 🪐"; }
    if (xp >= 1000000000) { document.getElementById('shop-btn-cosmica').classList.remove('locked'); document.getElementById('shop-btn-cosmica').innerText = "Singolarità Cosmica 🌌"; }
}

window.handleFileImport = function(files) {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('notes-input').value = e.target.result;
        alert("File '" + file.name + "' caricato con successo!");
    };
    reader.readAsText(file);
}
function addSubjectXP(subject, points) {
    let safeSubject = (subject && subject.trim()) ? subject.trim() : "Generale";
    let subjectsData = JSON.parse(localStorage.getItem('arcade_subjects_xp') || "{}");
    if (!subjectsData[safeSubject]) subjectsData[safeSubject] = 0;
    subjectsData[safeSubject] += points;
    localStorage.setItem('arcade_subjects_xp', JSON.stringify(subjectsData));
    renderSubjectsList();
}

function renderSubjectsList() {
    const container = document.getElementById('subjects-list-container');
    if (!container) return;
    const subjectsData = JSON.parse(localStorage.getItem('arcade_subjects_xp') || "{}");
    if (Object.keys(subjectsData).length === 0) return;
    container.innerHTML = '';
    for (let sub in subjectsData) {
        let xp = subjectsData[sub];
        let lv = Math.floor(xp / 1000) + 1;
        const row = document.createElement('div');
        row.className = 'subject-tag-row';
        row.innerHTML = `<span>📚 <b>${sub}</b></span> <span style="color:var(--neon-blue)">LV.${lv} (${xp} XP)</span>`;
        container.appendChild(row);
    }
}

function refreshProfileXP(pointsToAdd = 0) {
    let currentXP = parseInt(localStorage.getItem('arcade_total_xp') || 0);
    currentXP += pointsToAdd;
    if (currentXP > 1000000000) currentXP = 1000000000;
    localStorage.setItem('arcade_total_xp', currentXP);
    
    let currentLevel = Math.floor(currentXP / 1000) + 1;
    let rankName = "RECLUTA (LV." + currentLevel + ")";
    
    if (currentXP >= 1000000000) rankName = "🌌 SINGOLARITÀ COSMICA MAX 🌌 (LV." + currentLevel + ")";
    else if (currentXP >= 500000000) rankName = "🪐 CREATORE DI MONDI (LV." + currentLevel + ")";
    else if (currentXP >= 100000000) rankName = "✨ ENTITÀ INTERSTELLARE (LV." + currentLevel + ")";
    else if (currentXP >= 10000000) rankName = "👑 RE ASSOLUTO DEL COPIA-INCOLLA (LV." + currentLevel + ")";
    else if (currentXP >= 1000000) rankName = "👽 INTELLIGENZA ALIENA (LV." + currentLevel + ")";
    else if (currentXP >= 500000) rankName = "🔮 FILOSOFO IMMORTALE (LV." + currentLevel + ")";
    else if (currentXP >= 250000) rankName = "🏛️ ARCHITETTO DEL SAPERE (LV." + currentLevel + ")";
    else if (currentXP >= 100000) rankName = "🎓 ENCICLOPEDIA VIVENTE (LV." + currentLevel + ")";
    else if (currentXP >= 50000) rankName = "DIVINITÀ DELLO STUDIO 👑 (LV." + currentLevel + ")";
    else if (currentXP >= 30000) rankName = "MASTER DEL COPIA-INCOLLA ⚡ (LV." + currentLevel + ")";
    else if (currentXP >= 15000) rankName = "SCIENZIATO PAZZO 🧪 (LV." + currentLevel + ")";
    else if (currentXP >= 8000) rankName = "INTELLIGENZA SUPREMA 🧠 (LV." + currentLevel + ")";
    else if (currentXP >= 4000) rankName = "VETERANO VERO ⚔️ (LV." + currentLevel + ")";
    
    document.getElementById('profile-rank').innerText = rankName;
    document.getElementById('profile-xp').innerText = currentXP.toLocaleString() + " XP";
    
    let xpPercent = (currentXP / 1000000000) * 100;
    const barFill = document.getElementById('profile-xp-bar-fill');
    const barText = document.getElementById('profile-xp-percent');
    if (barFill && barText) {
        if (currentXP > 0 && xpPercent < 0.1) {
            barFill.style.width = "0.5%"; barText.innerText = xpPercent.toFixed(4) + "%";
        } else {
            barFill.style.width = xpPercent + "%"; barText.innerText = xpPercent.toFixed(2) + "%";
        }
    }
    updateShopLockStatus(currentXP);
}
document.addEventListener('DOMContentLoaded', () => {
    const savedHighScore = localStorage.getItem('arcade_highscore') || 0;
    const hsEl = document.getElementById('global-highscore');
    if (hsEl) hsEl.innerText = `${savedHighScore} / 10`;
    changeTheme(localStorage.getItem('arcade_active_theme') || 'cyber');
    refreshProfileXP(0); renderSubjectsList();
    if (localStorage.getItem('arcade_saved_session')) {
        document.getElementById('resume-screen').classList.remove('hidden');
        document.getElementById('setup-screen').classList.add('hidden');
    }
});

window.resumeGame = function(shouldResume) {
    document.getElementById('resume-screen').classList.add('hidden');
    if (shouldResume) {
        const savedState = JSON.parse(localStorage.getItem('arcade_saved_session'));
        questions = savedState.questions; currentQuestionIndex = savedState.currentIndex;
        score = savedState.score; streak = savedState.streak; wrongAnswersLog = savedState.wrongAnswersLog;
        currentQuizSubject = savedState.subject || "Generale";
        document.getElementById('quiz-screen').classList.remove('hidden'); showQuestion();
    } else {
        localStorage.removeItem('arcade_saved_session'); document.getElementById('setup-screen').classList.remove('hidden');
    }
}

function freezeCurrentSession() {
    localStorage.setItem('arcade_saved_session', JSON.stringify({
        questions: questions, currentIndex: currentQuestionIndex, score: score, streak: streak, wrongAnswersLog: wrongAnswersLog, subject: currentQuizSubject
    }));
}

function startOfflineQuiz(mode) {
    let rawText = document.getElementById('notes-input').value.trim();
    if (!rawText) { alert("Incolla il codice JSON o carica un file!"); return; }
    try {
        if (rawText.startsWith('```')) rawText = rawText.replace(/^```[a-z]*/i, '').replace(/```$/, '');
        let parsedData = JSON.parse(rawText.trim());
        if (!Array.isArray(parsedData) && parsedData.questions) {
            currentQuizSubject = parsedData.subject || "Generale"; questions = parsedData.questions;
        } else {
            questions = parsedData; currentQuizSubject = "Generale";
        }
        currentQuestionIndex = 0; score = 0; streak = 0; wrongAnswersLog = [];
        document.getElementById('setup-screen').classList.add('hidden');
        if (mode === 'flashcard') {
            document.getElementById('flashcard-screen').classList.remove('hidden'); showFlashcard();
        } else {
            document.getElementById('quiz-screen').classList.remove('hidden'); freezeCurrentSession(); showQuestion();
        }
    } catch (e) { alert("Errore del codice JSON fornito."); }
}

function showFlashcard() {
    isCardFlipped = false;
    const currentQuestion = questions[currentQuestionIndex];
    document.getElementById('flash-hud-index').innerText = `CARTA ${currentQuestionIndex + 1} / ${questions.length}`;
    document.getElementById('flashcard-element').innerHTML = `<div style='text-align:center;'>${currentQuestion.text}</div>`;
}

window.flipFlashcard = function() {
    const currentQuestion = questions[currentQuestionIndex];
    const card = document.getElementById('flashcard-element');
    isCardFlipped = !isCardFlipped;
    if (isCardFlipped) {
        card.style.borderColor = "var(--neon-purple)";
        let ansText = currentQuestion.type === 'tf' ? `RISPOSTA: ${currentQuestion.correctAnswer}<br><small>${currentQuestion.explanation || ''}</small>` : `RISPOSTA: <span style='color:var(--neon-green)'>${currentQuestion.correctAnswer}</span>`;
        card.innerHTML = `<div style='text-align:center;'>${ansText}</div>`;
    } else {
        card.style.borderColor = "var(--neon-blue)"; card.innerHTML = `<div style='text-align:center;'>${currentQuestion.text}</div>`;
    }
}

window.nextFlashcard = function() {
    if (currentQuestionIndex < questions.length - 1) { currentQuestionIndex++; showFlashcard(); } 
    else { alert("Mazzo completato! Avviamo il quiz a punti."); exitFlashcards(); }
}
window.prevFlashcard = function() { if (currentQuestionIndex > 0) { currentQuestionIndex--; showFlashcard(); } }
function exitFlashcards() { document.getElementById('flashcard-screen').classList.add('hidden'); document.getElementById('quiz-screen').classList.remove('hidden'); currentQuestionIndex = 0; score = 0; freezeCurrentSession(); showQuestion(); }
function triggerFlashEffect(status) {
    const container = document.getElementById('game-container');
    if (!container) return;
    container.classList.remove('flash-correct', 'flash-wrong');
    void container.offsetWidth; 
    container.classList.add(status === 'correct' ? 'flash-correct' : 'flash-wrong');
}

function updateStreakHUD() {
    const badge = document.getElementById('hud-streak');
    if (!badge) return;
    if (streak >= 2) { badge.innerText = `COMBO x${streak} 🔥`; badge.classList.remove('hidden'); } 
    else { badge.classList.add('hidden'); }
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) { showResults(); return; }
    const currentQuestion = questions[currentQuestionIndex];
    document.getElementById('feedback-text').innerText = '';
    document.getElementById('next-btn').classList.add('hidden');
    const optionsContainer = document.getElementById('options-container');
    const tfContainer = document.getElementById('tf-container');
    optionsContainer.innerHTML = ''; 
    if (tfContainer) tfContainer.classList.add('hidden');
    let safeSub = currentQuizSubject ? currentQuizSubject : "Generale";
    document.getElementById('hud-current').innerText = `STAGE ${currentQuestionIndex + 1} / ${questions.length} [${safeSub}]`;
    document.getElementById('hud-score').innerText = `SCORE: ${score * 100}`;
    updateStreakHUD();
    document.getElementById('progress-fill').style.width = `${(currentQuestionIndex / questions.length) * 100}%`;
    document.getElementById('question-text').innerHTML = currentQuestion.text;

    if (currentQuestion.type === 'tf') {
        if (tfContainer) tfContainer.classList.remove('hidden');
        const btnVero = document.getElementById('btn-vero'); const btnFalso = document.getElementById('btn-falso');
        if (btnVero && btnFalso) {
            btnVero.className = 'option-btn'; btnFalso.className = 'option-btn';
            btnVero.style.pointerEvents = 'auto'; btnFalso.style.pointerEvents = 'auto';
        }
    } else {
        if (currentQuestion.choices && Array.isArray(currentQuestion.choices)) {
            currentQuestion.choices.forEach(option => {
                const li = document.createElement('li'); li.className = 'option-item'; li.innerText = option;
                li.onclick = () => checkMultipleAnswer(li, option, currentQuestion.correctAnswer);
                optionsContainer.appendChild(li);
            });
        }
    }
}

window.checkTrueFalse = function(userChoice) {
    const currentQuestion = questions[currentQuestionIndex];
    const btnVero = document.getElementById('btn-vero'); const btnFalso = document.getElementById('btn-falso');
    const feedback = document.getElementById('feedback-text');
    if (btnVero && btnFalso) { btnVero.style.pointerEvents = 'none'; btnFalso.style.pointerEvents = 'none'; }
    const isCorrect = userChoice.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    if (userChoice === 'Vero') { 
        if (btnVero) btnVero.classList.add(isCorrect ? 'correct' : 'wrong'); 
        if (!isCorrect && btnFalso) btnFalso.classList.add('correct'); 
    } else { 
        if (btnFalso) btnFalso.classList.add(isCorrect ? 'correct' : 'wrong'); 
        if (!isCorrect && btnVero) btnVero.classList.add('correct'); 
    }
    let safeSub = currentQuizSubject ? currentQuizSubject : "Generale";
    if (isCorrect) {
        streak++; score += streak; triggerFlashEffect('correct'); playArcadeSound('correct');
        refreshProfileXP(150 * streak); addSubjectXP(safeSub, 150 * streak);
        feedback.innerHTML = `<span style="color: var(--neon-green);">+${streak * 100} XP - ESATTO! 🔥</span>`;
    } else {
        wrongAnswersLog.push({ q: currentQuestion.text, user: userChoice, correct: currentQuestion.correctAnswer, expl: currentQuestion.explanation || '' });
        streak = 0; triggerFlashEffect('wrong'); playArcadeSound('wrong');
        feedback.innerHTML = `<span style="color: var(--neon-red);">COMBO INTERROTTA! ❌</span>`;
    }
    freezeCurrentSession(); document.getElementById('next-btn').classList.remove('hidden');
}

window.checkMultipleAnswer = function(selectedLi, selectedOption, correctOption) {
    const currentQuestion = questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option-item');
    options.forEach(li => li.style.pointerEvents = 'none');
    const feedback = document.getElementById('feedback-text');
    let safeSub = currentQuizSubject ? currentQuizSubject : "Generale";
    if (selectedOption.toLowerCase() === correctOption.toLowerCase()) {
        selectedLi.classList.add('correct'); streak++; score += streak; triggerFlashEffect('correct'); playArcadeSound('correct');
        refreshProfileXP(150 * streak); addSubjectXP(safeSub, 150 * streak);
        feedback.innerHTML = `<span style="color: var(--neon-green);">+${streak * 100} XP - ESATTO! 🔥</span>`;
    } else {
        selectedLi.classList.add('wrong'); options.forEach(li => { if (li.innerText.toLowerCase() === correctOption.toLowerCase()) li.classList.add('correct'); });
        wrongAnswersLog.push({ q: currentQuestion.text, user: selectedOption, correct: correctOption, expl: `La risposta esatta era: ${correctOption}` });
        streak = 0; triggerFlashEffect('wrong'); playArcadeSound('wrong');
        feedback.innerHTML = `<span style="color: var(--neon-red);">RISPOSTA ERRATA! ❌</span>`;
    }
    freezeCurrentSession(); document.getElementById('next-btn').classList.remove('hidden');
}

window.nextQuestion = function() { currentQuestionIndex++; if (currentQuestionIndex < questions.length) showQuestion(); else showResults(); }
function getEvaluation(finalScore, total) {
    const percent = (finalScore / total) * 100;
    if (percent === 100) return { text: "GOD MODE 👑", color: "var(--neon-green)" };
    if (percent >= 80) return { text: "PRO GAMER ⭐", color: "var(--neon-blue)" };
    if (percent >= 60) return { text: "LIVELLO SUPERATO 👍", color: "#eab308" };
    return { text: "GAME OVER ❌", color: "#b91c1c" };
}

function showResults() {
    document.getElementById('quiz-screen').classList.add('hidden'); document.getElementById('result-screen').classList.remove('hidden');
    localStorage.removeItem('arcade_saved_session');
    let correctAnswersCount = questions.length - wrongAnswersLog.length;
    document.getElementById('final-score').innerText = correctAnswersCount;
    
    const evaluation = getEvaluation(correctAnswersCount, questions.length);
    const targetEl = document.getElementById('evaluation-text'); 
    if (targetEl) { targetEl.innerText = evaluation.text; targetEl.style.color = evaluation.color; }

    const currentHighScore = parseInt(localStorage.getItem('arcade_highscore') || 0);
    if (correctAnswersCount > currentHighScore) {
        localStorage.setItem('arcade_highscore', correctAnswersCount);
        const scoreWidget = document.getElementById('global-highscore');
        if (scoreWidget) scoreWidget.innerText = `${correctAnswersCount} / 10`;
        document.getElementById('new-record-text').classList.remove('hidden');
    } else { document.getElementById('new-record-text').classList.add('hidden'); }

    const logList = document.getElementById('error-log-list'); if (logList) logList.innerHTML = '';
    if (wrongAnswersLog.length > 0) {
        document.getElementById('error-log-container').classList.remove('hidden');
        wrongAnswersLog.forEach((item, i) => {
            const div = document.createElement('div'); div.className = 'error-item';
            div.innerHTML = `<strong>#${i+1} ${item.q}</strong><br><span style="color:var(--neon-red);">Tua: ${item.user}</span> | <span style="color:var(--neon-green);">Esatta: ${item.correct}</span>`;
            if (logList) logList.appendChild(div);
        });
    } else { document.getElementById('error-log-container').classList.add('hidden'); }
}

// AGGIORNATO: Impacchetta gli errori e apre direttamente WhatsApp con il testo pronto
window.exportQuizReport = function() {
    let correctAnswersCount = questions.length - wrongAnswersLog.length;
    let safeSub = currentQuizSubject ? currentQuizSubject : "Generale";
    
    // Generiamo il testo formattato con i grassetti di WhatsApp (*testo*)
    let waText = `*⚡ REPORT DI STUDIO - NOTEQUIZ ARCADE ⚡*\n`;
    waText += `-----------------------------------------\n`;
    waText += `📅 *Data:* ${new Date().toLocaleDateString()}\n`;
    waText += `📚 *Materia:* ${safeSub}\n`;
    waText += `🎯 *Esito:* ${correctAnswersCount} / ${questions.length} Esatte\n`;
    waText += `🏆 *Grado:* ${getEvaluation(correctAnswersCount, questions.length).text}\n`;
    waText += `-----------------------------------------\n\n`;
    
    if (wrongAnswersLog.length > 0) {
        waText += `❌ *ELENCO ERRORI DA RIPASSARE:* \n\n`;
        
        wrongAnswersLog.forEach((item, i) => {
            waText += `*• Domanda ${i + 1}:* ${item.q}\n`;
            waText += `  👉 _Tua risp:_ ${item.user}\n`;
            waText += `  ✅ _Risp corr:_ *${item.correct}*\n`;
            if (item.expl) {
                waText += `  📖 _Dettaglio:_ ${item.expl}\n`;
            }
            waText += `\n`;
        });
    } else {
        waText += `🔥 *PREPARAZIONE PERFETTA!* 🔥\nZero errori commessi. Sei pronto per distruggere la verifica! 🚀\n`;
    }

    // Codifichiamo il testo in modo che sia digerito correttamente dagli URL internet
    let encodedText = encodeURIComponent(waText);
    
    // URL universale che apre l'applicazione di WhatsApp sia da Smartphone che da WhatsApp Web su PC
    let whatsappUrl = `https://whatsapp.com{encodedText}`;
    
    // Apre la chat in una nuova scheda del browser
    window.open(whatsappUrl, '_blank');
}

window.resetQuiz = function() {
    document.getElementById('result-screen').classList.add('hidden'); document.getElementById('setup-screen').classList.remove('hidden');
    document.getElementById('notes-input').value = ''; document.getElementById('hud-streak').classList.add('hidden');
    localStorage.removeItem('arcade_saved_session'); refreshProfileXP(0); renderSubjectsList();
}

window.wipeAllArcadeData = function() {
    if (confirm("Azzerare tutto permanentemente?")) {
        localStorage.clear(); alert("Profilo Formattato!"); window.location.reload();
    }
}

window.copyPromptToClipboard = function() {
    const promptText = `Genera un quiz di 10 domande (5 multiple con 4 opzioni e 5 vero/falso) basato sugli appunti che ti lascio qui sotto. All'inizio del JSON inserisci anche la chiave "subject": "NomeMateria" inserendo la disciplina corretta per gli appunti inseriti. Restituisci ESCLUSIVAMENTE un blocco JSON puro, senza alcuna introduzione e senza blocchi di codice markdown (niente tre backtick). Segui questa struttura:\n\n{\n  "subject": "NomeDellaMateria",\n  "questions": [\n    { "type": "multiple", "text": "Domanda...", "correctAnswer": "Risposta esatta", "choices": ["Opzione 1", "Opzione 2", "Opzione 3", "Opzione 4"] },\n    { "type": "tf", "text": "Affermazione...", "correctAnswer": "Vero", "explanation": "Spiegazione..." }\n  ]\n}\n\nEcco i miei appunti: `;
    navigator.clipboard.writeText(promptText).then(() => {
        const btn = document.querySelector('.copy-btn');
        if (btn) {
            btn.innerText = "✅ COPIATO!"; 
            setTimeout(() => { btn.innerText = "📋 COPIA COMANDO PER L'IA"; }, 2000);
        }
    });
}
