<<<<<<< HEAD
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let wrongAnswersLog = [];
let isCardFlipped = false;
let currentQuizSubject = "Generale";

// Nuove variabili per le espansioni
let gameMode = "quiz"; // "quiz" o "flashcard"

// ---- MOTORE AUDIO ARCADE NATIVO ----
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

// Gestione dei 14 temi grafici sbloccabili in base agli XP
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
window.toggleShopView = function(openShop) {
    const setupScreen = document.getElementById('setup-screen');
    const shopScreen = document.getElementById('shop-screen');
    if (openShop) {
        setupScreen.classList.add('hidden');
        shopScreen.classList.remove('hidden');
        let currentXP = parseInt(localStorage.getItem('arcade_total_xp') || 0);
        updateShopLockStatus(currentXP);
    } else {
        shopScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
    }
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

// Generatore Ruota della Fortuna Giornaliera
window.triggerDailySpin = function() {
    const todayStr = new Date().toDateString();
    const lastSpin = localStorage.getItem('arcade_last_spin_date');
    if (lastSpin === todayStr) {
        alert("🚨 RICOMPENSA GIÀ RISCATTATA! Torna domani per un nuovo giro di ruota.");
        return;
    }
    const rewards = new Array(200, 500, 1000, 2500, 5000);
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination); osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
    }
    localStorage.setItem('arcade_last_spin_date', todayStr);
    refreshProfileXP(randomReward);
    
    // Avanza anche il contatore di spin per gli Achievement
    let totalSpins = parseInt(localStorage.getItem('ach_total_spins') || 0) + 1;
    localStorage.setItem('ach_total_spins', totalSpins);
    
    document.getElementById('spin-status-text').innerHTML = `🎉 RISCATTATO CON SUCCESSO: <b style="color:var(--neon-green)">+${randomReward} XP</b> BONUS!`;
    const sBtn = document.getElementById('spin-btn');
    if(sBtn) { sBtn.disabled = true; sBtn.style.opacity = "0.5"; sBtn.innerText = "LOCK FINO A DOMANI"; }
}

function checkDailySpinStatus() {
    const todayStr = new Date().toDateString();
    const lastSpin = localStorage.getItem('arcade_last_spin_date');
    const spinBtn = document.getElementById('spin-btn');
    const spinText = document.getElementById('spin-status-text');
    if (spinBtn && lastSpin === todayStr) {
        spinBtn.disabled = true; spinBtn.style.opacity = "0.5"; spinBtn.innerText = "LOCK FINO A DOMANI";
        if (spinText) spinText.innerHTML = `⚡ Hai già estratto il tuo premio per oggi. Torna domani!`;
    }
}
// Gestione del pannello delle 3 Missioni Quotidiane
function renderDailyQuests() {
    const todayStr = new Date().toDateString();
    const lastQuestDate = localStorage.getItem('quest_date_reset');
    
    // Se cambia giorno, rigenera le missioni azzerandole
    if (lastQuestDate !== todayStr) {
        localStorage.setItem('quest_date_reset', todayStr);
        localStorage.setItem('quest_1_done', 'false');
        localStorage.setItem('quest_2_done', 'false');
        localStorage.setItem('quest_3_done', 'false');
    }

    const q1 = localStorage.getItem('quest_1_done') === 'true';
    const q2 = localStorage.getItem('quest_2_done') === 'true';
    const q3 = localStorage.getItem('quest_3_done') === 'true';

    document.getElementById('q1-status').innerHTML = q1 ? "✅ COMPLETATA (+300 XP)" : "⏳ Incompleta (+300 XP)";
    document.getElementById('q1-status').style.color = q1 ? "var(--neon-green)" : "var(--text-muted)";
    document.getElementById('q2-status').innerHTML = q2 ? "✅ COMPLETATA (+500 XP)" : "⏳ Incompleta (+500 XP)";
    document.getElementById('q2-status').style.color = q2 ? "var(--neon-green)" : "var(--text-muted)";
    document.getElementById('q3-status').innerHTML = q3 ? "✅ COMPLETATA (+400 XP)" : "⏳ Incompleta (+400 XP)";
    document.getElementById('q3-status').style.color = q3 ? "var(--neon-green)" : "var(--text-muted)";
}

// Gestione della Bacheca dei Trofei Sbloccabili
function renderAchievements() {
    const highscore = parseInt(localStorage.getItem('arcade_highscore') || 0);
    const totalXP = parseInt(localStorage.getItem('arcade_total_xp') || 0);
    const subjectsCount = Object.keys(JSON.parse(localStorage.getItem('arcade_subjects_xp') || "{}")).length;

    const ach1 = highscore >= 10;
    const ach2 = subjectsCount >= 5;
    const ach3 = totalXP >= 1000000;

    document.getElementById('ach1-status').innerHTML = ach1 ? "🔓 SBLOCCATO (+2000 XP)" : "🔒 Bloccato";
    document.getElementById('ach1-status').style.color = ach1 ? "var(--neon-gold)" : "var(--text-muted)";
    document.getElementById('ach2-status').innerHTML = ach2 ? "🔓 SBLOCCATO (+5000 XP)" : "🔒 Bloccato";
    document.getElementById('ach2-status').style.color = ach2 ? "var(--neon-gold)" : "var(--text-muted)";
    document.getElementById('ach3-status').innerHTML = ach3 ? "🔓 SBLOCCATO (+50000 XP)" : "🔒 Bloccato";
    document.getElementById('ach3-status').style.color = ach3 ? "var(--neon-gold)" : "var(--text-muted)";
    
    // Controlla ed assegna i premi in XP se sbloccati per la prima volta
    if (ach1 && localStorage.getItem('ach_1_claimed') !== 'true') { localStorage.setItem('ach_1_claimed', 'true'); refreshProfileXP(2000); }
    if (ach2 && localStorage.getItem('ach_2_claimed') !== 'true') { localStorage.setItem('ach_2_claimed', 'true'); refreshProfileXP(5000); }
    if (ach3 && localStorage.getItem('ach_3_claimed') !== 'true') { localStorage.setItem('ach_3_claimed', 'true'); refreshProfileXP(50000); }
}

function checkGameEndQuestsAndAchievements(finalCorrectCount) {
    // Avanza la Quest 1 (Mente Lucida: Meno di 2 errori su 10 domande)
    if (questions.length === 10 && (10 - finalCorrectCount) <= 2) {
        if (localStorage.getItem('quest_1_done') !== 'true') { localStorage.setItem('quest_1_done', 'true'); refreshProfileXP(300); }
    }
    // Avanza la Quest 3 (Inarrestabile: Aver fatto una combo di almeno x5)
    if (localStorage.getItem('quest_3_trigger_session') === 'true') {
        if (localStorage.getItem('quest_3_done') !== 'true') { localStorage.setItem('quest_3_done', 'true'); refreshProfileXP(400); }
    }
    localStorage.removeItem('quest_3_trigger_session');
    
    renderDailyQuests();
    renderAchievements();
}
function addSubjectXP(subject, points) {
    let safeSubject = (subject && subject.trim()) ? subject.trim() : "Generale";
    let subjectsData = JSON.parse(localStorage.getItem('arcade_subjects_xp') || "{}");
    if (!subjectsData[safeSubject]) subjectsData[safeSubject] = 0;
    subjectsData[safeSubject] += points;
    localStorage.setItem('arcade_subjects_xp', JSON.stringify(subjectsData));
    
    // Avanza Quest 2 (Stacanovista: Almeno due materie nello storico)
    if (Object.keys(subjectsData).length >= 2) {
        if (localStorage.getItem('quest_2_done') !== 'true') { localStorage.setItem('quest_2_done', 'true'); refreshProfileXP(500); }
    }
    renderSubjectsList();
}

function renderSubjectsList() {
    const container = document.getElementById('subjects-list-container');
    if (!container) return;
    const subjectsData = JSON.parse(localStorage.getItem('arcade_subjects_xp') || "{}");
    const subjectsRecords = JSON.parse(localStorage.getItem('arcade_subjects_records') || "{}");
    if (Object.keys(subjectsData).length === 0) return;
    container.innerHTML = '';
    for (let sub in subjectsData) {
        let xp = subjectsData[sub];
        let lv = Math.floor(xp / 1000) + 1;
        let topScore = subjectsRecords[sub] !== undefined ? subjectsRecords[sub] : 0;
        const row = document.createElement('div');
        row.className = 'subject-tag-row';
        row.innerHTML = `<span>📚 <b>${sub}</b></span> <span><span style="color:var(--neon-gold); margin-right:12px; font-weight:800;">🥇 TOP: ${topScore}/10</span><span style="color:var(--neon-blue)">LV.${lv} (${xp} XP)</span></span>`;
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
        if (currentXP > 0 && xpPercent < 0.1) { barFill.style.width = "0.5%"; barText.innerText = xpPercent.toFixed(4) + "%"; } 
        else { barFill.style.width = xpPercent + "%"; barText.innerText = xpPercent.toFixed(2) + "%"; }
    }
    updateShopLockStatus(currentXP);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedHighScore = localStorage.getItem('arcade_highscore') || 0;
    const hsEl = document.getElementById('global-highscore');
    if (hsEl) hsEl.innerText = `${savedHighScore} / 10`;
    changeTheme(localStorage.getItem('arcade_active_theme') || 'cyber');
    refreshProfileXP(0); renderSubjectsList(); checkDailySpinStatus();
    renderDailyQuests(); renderAchievements();
    if (localStorage.getItem('arcade_saved_session')) {
        document.getElementById('resume-screen').classList.remove('hidden'); document.getElementById('setup-screen').classList.add('hidden');
    }
});
window.resumeGame = function(shouldResume) {
    document.getElementById('resume-screen').classList.add('hidden');
    if (shouldResume) {
        const savedState = JSON.parse(localStorage.getItem('arcade_saved_session'));
        questions = savedState.questions; currentQuestionIndex = savedState.currentIndex;
        score = savedState.score; streak = savedState.streak; wrongAnswersLog = savedState.wrongAnswersLog;
        currentQuizSubject = savedState.subject || "Generale"; gameMode = savedState.gameMode || "quiz";
        playerLives = savedState.playerLives !== undefined ? savedState.playerLives : 3;
        document.getElementById('quiz-screen').classList.remove('hidden'); showQuestion();
    } else {
        localStorage.removeItem('arcade_saved_session'); document.getElementById('setup-screen').classList.remove('hidden');
    }
}

function freezeCurrentSession() {
    localStorage.setItem('arcade_saved_session', JSON.stringify({
        questions: questions, currentIndex: currentQuestionIndex, score: score, streak: streak,
        wrongAnswersLog: wrongAnswersLog, subject: currentQuizSubject, gameMode: gameMode
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
        gameMode = mode;
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
        let ansText = currentQuestion.type === 'tf' ? `RISPOSTA: ${currentQuestion.correctAnswer}<br><small>${currentQuestion.explanation || ''}</small>` : `RISPOSTA CORRETTA:<br><span style='color:var(--neon-green)'>${currentQuestion.correctAnswer}</span>`;
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
function exitFlashcards() { document.getElementById('flashcard-screen').classList.add('hidden'); document.getElementById('quiz-screen').classList.remove('hidden'); currentQuestionIndex = 0; score = 0; gameMode = "quiz"; freezeCurrentSession(); showQuestion(); }

function triggerFlashEffect(status) {
    const container = document.getElementById('game-container');
    if (!container) return;
    container.classList.remove('flash-correct', 'flash-wrong');
    void container.offsetWidth; container.classList.add(status === 'correct' ? 'flash-correct' : 'flash-wrong');
}

function updateStreakHUD() {
    const badge = document.getElementById('hud-streak');
    if (!badge) return;
    if (streak >= 2) { 
        badge.innerText = `COMBO x${streak} 🔥`; badge.classList.remove('hidden'); 
        if (streak >= 5) localStorage.setItem('quest_3_trigger_session', 'true'); // Attiva trigger per Quest 3
    } else { badge.classList.add('hidden'); }
}
function showQuestion() {
    if (currentQuestionIndex >= questions.length) { showResults(); return; }
    const currentQuestion = questions[currentQuestionIndex];
    document.getElementById('feedback-text').innerText = '';
    document.getElementById('next-btn').classList.add('hidden');
    const optionsContainer = document.getElementById('options-container');
    const tfContainer = document.getElementById('tf-container');
    optionsContainer.innerHTML = ''; if (tfContainer) tfContainer.classList.add('hidden');
    let safeSub = currentQuizSubject ? currentQuizSubject : "Generale";
    
    // Ripristinato l'HUD classico senza icone dei cuori
    document.getElementById('hud-current').innerText = `STAGE ${currentQuestionIndex + 1} / ${questions.length} [${safeSub}]`;
    document.getElementById('hud-score').innerText = `SCORE: ${score * 100}`;
    updateStreakHUD();
    document.getElementById('progress-fill').style.width = `${(currentQuestionIndex / questions.length) * 100}%`;
    document.getElementById('question-text').innerHTML = currentQuestion.text;

    if (currentQuestion.type === 'tf') {
        if (tfContainer) tfContainer.classList.remove('hidden');
        const btnVero = document.getElementById('btn-vero'); const btnFalso = document.getElementById('btn-falso');
        if (btnVero && btnFalso) { btnVero.className = 'option-btn'; btnFalso.className = 'option-btn'; btnVero.style.pointerEvents = 'auto'; btnFalso.style.pointerEvents = 'auto'; }
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
    if (userChoice === 'Vero') { if (btnVero) btnVero.classList.add(isCorrect ? 'correct' : 'wrong'); if (!isCorrect && btnFalso) btnFalso.classList.add('correct'); } 
    else { if (btnFalso) btnFalso.classList.add(isCorrect ? 'correct' : 'wrong'); if (!isCorrect && btnVero) btnVero.classList.add('correct'); }
    let safeSub = currentQuizSubject ? currentQuizSubject : "Generale";
    if (isCorrect) {
        streak++; score += streak; triggerFlashEffect('correct'); playArcadeSound('correct');
        let xpGained = 150 * streak; refreshProfileXP(xpGained); addSubjectXP(safeSub, xpGained);
        feedback.innerHTML = `<span style="color: var(--neon-green);">+${xpGained} XP - ESATTO! 🔥</span>`;
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
        let xpGained = 150 * streak; refreshProfileXP(xpGained); addSubjectXP(safeSub, xpGained);
        feedback.innerHTML = `<span style="color: var(--neon-green);">+${xpGained} XP - ESATTO! 🔥</span>`;
    } else {
        selectedLi.classList.add('wrong'); options.forEach(li => { if (li.innerText.toLowerCase() === correctOption.toLowerCase()) li.classList.add('correct'); });
        wrongAnswersLog.push({ q: currentQuestion.text, user: selectedOption, correct: correctOption, expl: `La risposta era: ${correctOption}` });
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
    if (percent >= 60) return { text: "SUPERATO 👍", color: "#eab308" };
    return { text: "GAME OVER ❌", color: "#b91c1c" };
}

function showResults() {
    document.getElementById('quiz-screen').classList.add('hidden'); 
    document.getElementById('result-screen').classList.remove('hidden');
    localStorage.removeItem('arcade_saved_session');
    
    let correctAnswersCount = questions.length - wrongAnswersLog.length;
    document.getElementById('final-score').innerText = correctAnswersCount;
    
    // In caso di sconfitta prematura in Survival, adatta l'HUD finale
    document.getElementById('total-questions-hud').innerText = currentQuestionIndex === questions.length ? questions.length : currentQuestionIndex;
    
    const evaluation = getEvaluation(correctAnswersCount, currentQuestionIndex);
    const targetEl = document.getElementById('evaluation-text'); 
    if (targetEl) { targetEl.innerText = evaluation.text; targetEl.style.color = evaluation.color; }

    // Aggiornamento record specifico per materia
    let safeSub = currentQuizSubject ? currentQuizSubject : "Generale";
    let subjectsRecords = JSON.parse(localStorage.getItem('arcade_subjects_records') || "{}");
    let oldRecord = subjectsRecords[safeSub] || 0;
    if (correctAnswersCount > oldRecord) { 
        subjectsRecords[safeSub] = correctAnswersCount; 
        localStorage.setItem('arcade_subjects_records', JSON.stringify(subjectsRecords)); 
    }

    // Cronologia ultimi 5 test
    const history = JSON.parse(localStorage.getItem('arcade_quiz_history') || "[]");
    const today = new Date(); const dateStr = today.getDate() + "/" + (today.getMonth() + 1);
    history.push({ date: dateStr, score: correctAnswersCount, total: questions.length });
    if (history.length > 5) history.shift();
    localStorage.setItem('arcade_quiz_history', JSON.stringify(history));

    // CORRETTO: Sincronizzato l'ID esatto per aggiornare istantaneamente l'HUD in alto a destra
    const currentHighScore = parseInt(localStorage.getItem('arcade_highscore') || 0);
    const recordLabel = document.getElementById('new-record-text');
    
    if (correctAnswersCount > currentHighScore) {
        localStorage.setItem('arcade_highscore', correctAnswersCount);
        const scoreWidget = document.getElementById('global-highscore');
        if (scoreWidget) {
            scoreWidget.innerText = `${correctAnswersCount} / 10`;
        }
        if (recordLabel) recordLabel.classList.remove('hidden');
    } else { 
        if (recordLabel) recordLabel.classList.add('hidden'); 
    }

    const logList = document.getElementById('error-log-list'); if (logList) logList.innerHTML = '';
    if (wrongAnswersLog.length > 0) {
        document.getElementById('error-log-container').classList.remove('hidden');
        wrongAnswersLog.forEach((item, i) => {
            const div = document.createElement('div'); div.className = 'error-item';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div><strong>#${i+1} ${item.q}</strong><br><span style="color:var(--neon-red);">Tua: ${item.user}</span> | <span style="color:var(--neon-green);">Esatta: ${item.correct}</span></div>
                    <button class="copy-btn" style="margin:0; padding:4px 10px; font-size:0.75rem; background:var(--neon-purple); color:white;" onclick="askTutorAI('${window.btoa(encodeURIComponent(item.q))}', '${window.btoa(encodeURIComponent(item.correct))}')">🤖 CHIEDI AL TUTOR</button>
                </div>
                <div id="tutor-box-${window.btoa(encodeURIComponent(item.q)).replace(/=/g,'')}" class="hidden" style="margin-top:8px; padding:10px; background:rgba(192,132,252,0.1); border-left:2px solid var(--neon-purple); border-radius:4px; font-size:0.85rem;"></div>`;
            logList.appendChild(div);
        });
    } else { document.getElementById('error-log-container').classList.add('hidden'); }
    checkGameEndQuestsAndAchievements(correctAnswersCount);
}

window.askTutorAI = function(encodedQ, encodedAns) {
    const q = decodeURIComponent(window.atob(encodedQ)); const ans = decodeURIComponent(window.atob(encodedAns));
    const box = document.getElementById("tutor-box-" + encodedQ.replace(/=/g,''));
    if (!box) return; box.classList.remove('hidden');
    box.innerHTML = "⏳ Generazione dell'esempio pratico...";
    setTimeout(() => { box.innerHTML = `💡 *SPIEGAZIONE DEL TUTOR:* La risposta esatta è *${ans}*.\nSe hai dei dubbi copia questo messaggio e chiedi alla chat principale: _"Spiegami in modo semplice perché negli appunti la risposta a '${q}' è '${ans}'"_`; }, 400);
}

window.exportQuizReport = function() {
    let correctAnswersCount = questions.length - wrongAnswersLog.length;
    let safeSub = currentQuizSubject ? currentQuizSubject : "Generale";
    
    // 1. Generazione dell'intestazione del report
    let shareText = `⚡ REPORT DI STUDIO - NOTEQUIZ ARCADE ⚡\n`;
    shareText += `-----------------------------------------\n`;
    shareText += `📚 Materia: ${safeSub}\n`;
    shareText += `🎯 Esito: ${correctAnswersCount} / ${questions.length} Esatte\n`;
    shareText += `🏆 Grado: ${getEvaluation(correctAnswersCount, questions.length).text}\n`;
    shareText += `-----------------------------------------\n\n`;
    
    // CORRETTO: Ora il codice controlla e concatena gli errori reali al testo di condivisione
    if (wrongAnswersLog.length > 0) {
        shareText += `❌ ELENCO ERRORI DA RIPASSARE:\n\n`;
        wrongAnswersLog.forEach((item, i) => {
            shareText += `• Domanda ${i + 1}: ${item.q}\n`;
            shareText += `  Tua risp: ${item.user}\n`;
            shareText += `  Risp corr: ${item.correct}\n`;
            if (item.expl) {
                shareText += `  Dettaglio: ${item.expl}\n`;
            }
            shareText += `\n`;
        });
    } else {
        shareText += `🔥 PREPARAZIONE PERFETTA! 🔥\nZero errori commessi. Pronto per la verifica! 🚀\n`;
    }

    // 2. Invio del blocco di testo completo al sistema di condivisione nativo
    if (navigator.share) {
        navigator.share({ 
            title: `Report NoteQuiz - ${safeSub}`, 
            text: shareText 
        })
        .then(() => console.log('Condivisione riuscita!'))
        .catch((error) => console.log('Errore condivisione:', error));
    } else {
        // Soluzione di riserva per PC: copia tutto il testo negli appunti
        navigator.clipboard.writeText(shareText).then(() => {
            alert("Il report completo (inclusi gli errori) è stato COPIATO NEGLI APPUNTI! Puoi incollarlo manualmente (Ctrl+V) dove preferisci.");
        }).catch(err => { 
            alert("Impossibile copiare il testo."); 
        });
    }
}

window.resetQuiz = function() {
    document.getElementById('result-screen').classList.add('hidden'); document.getElementById('setup-screen').classList.remove('hidden');
    document.getElementById('notes-input').value = ''; 
    document.getElementById('hud-streak').classList.add('hidden');
    localStorage.removeItem('arcade_saved_session'); 
    refreshProfileXP(0); 
    renderSubjectsList(); 
    renderDailyQuests(); 
    renderAchievements();
}

window.wipeAllArcadeData = function() {
    if (confirm("Azzerare tutto il profilo permanentemente?")) { 
        localStorage.clear(); 
        alert("Profilo Formattato!"); 
        window.location.reload(); 
    }
}

window.copyPromptToClipboard = function() {
    const promptText = `Genera un quiz di 10 domande (5 multiple con 4 opzioni e 5 vero/falso) basato sugli appunti che ti lascio qui sotto. All'inizio del JSON inserisci anche la chiave "subject": "NomeMateria" inserendo la disciplina corretta per gli appunti inseriti. Restituisci ESCLUSIVAMENTE un blocco JSON puro, senza alcuna introduzione e senza blocchi di codice markdown (niente tre backtick). Segui questa struttura:

{
  "subject": "NomeDellaMateria",
  "questions": [
    { "type": "multiple", "text": "Domanda...", "correctAnswer": "Risposta esatta", "choices": ["Opzione 1", "Opzione 2", "Opzione 3", "Opzione 4"] },
    { "type": "tf", "text": "Affermazione...", "correctAnswer": "Vero", "explanation": "Spiegazione..." }
  ]
}

Ecco i miei appunti: `;

    navigator.clipboard.writeText(promptText).then(() => {
        const btn = document.querySelector('.copy-btn');
        if (btn) { 
            btn.innerText = "✅ COPIATO!"; 
            setTimeout(() => { btn.innerText = "📋 COPIA COMANDO PER L'IA"; }, 2000); 
        }
    });
}
=======
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let wrongAnswersLog = [];
let isCardFlipped = false;
let currentQuizSubject = "Generale";

// Nuove variabili per le espansioni
let gameMode = "quiz"; // "quiz" o "flashcard"

// ---- MOTORE AUDIO ARCADE NATIVO ----
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

// Gestione dei 14 temi grafici sbloccabili in base agli XP
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
window.toggleShopView = function(openShop) {
    const setupScreen = document.getElementById('setup-screen');
    const shopScreen = document.getElementById('shop-screen');
    if (openShop) {
        setupScreen.classList.add('hidden');
        shopScreen.classList.remove('hidden');
        let currentXP = parseInt(localStorage.getItem('arcade_total_xp') || 0);
        updateShopLockStatus(currentXP);
    } else {
        shopScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
    }
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

// Generatore Ruota della Fortuna Giornaliera
window.triggerDailySpin = function() {
    const todayStr = new Date().toDateString();
    const lastSpin = localStorage.getItem('arcade_last_spin_date');
    if (lastSpin === todayStr) {
        alert("🚨 RICOMPENSA GIÀ RISCATTATA! Torna domani per un nuovo giro di ruota.");
        return;
    }
    const rewards = new Array(200, 500, 1000, 2500, 5000);
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination); osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
    }
    localStorage.setItem('arcade_last_spin_date', todayStr);
    refreshProfileXP(randomReward);
    
    // Avanza anche il contatore di spin per gli Achievement
    let totalSpins = parseInt(localStorage.getItem('ach_total_spins') || 0) + 1;
    localStorage.setItem('ach_total_spins', totalSpins);
    
    document.getElementById('spin-status-text').innerHTML = `🎉 RISCATTATO CON SUCCESSO: <b style="color:var(--neon-green)">+${randomReward} XP</b> BONUS!`;
    const sBtn = document.getElementById('spin-btn');
    if(sBtn) { sBtn.disabled = true; sBtn.style.opacity = "0.5"; sBtn.innerText = "LOCK FINO A DOMANI"; }
}

function checkDailySpinStatus() {
    const todayStr = new Date().toDateString();
    const lastSpin = localStorage.getItem('arcade_last_spin_date');
    const spinBtn = document.getElementById('spin-btn');
    const spinText = document.getElementById('spin-status-text');
    if (spinBtn && lastSpin === todayStr) {
        spinBtn.disabled = true; spinBtn.style.opacity = "0.5"; spinBtn.innerText = "LOCK FINO A DOMANI";
        if (spinText) spinText.innerHTML = `⚡ Hai già estratto il tuo premio per oggi. Torna domani!`;
    }
}
// Gestione del pannello delle 3 Missioni Quotidiane
function renderDailyQuests() {
    const todayStr = new Date().toDateString();
    const lastQuestDate = localStorage.getItem('quest_date_reset');
    
    // Se cambia giorno, rigenera le missioni azzerandole
    if (lastQuestDate !== todayStr) {
        localStorage.setItem('quest_date_reset', todayStr);
        localStorage.setItem('quest_1_done', 'false');
        localStorage.setItem('quest_2_done', 'false');
        localStorage.setItem('quest_3_done', 'false');
    }

    const q1 = localStorage.getItem('quest_1_done') === 'true';
    const q2 = localStorage.getItem('quest_2_done') === 'true';
    const q3 = localStorage.getItem('quest_3_done') === 'true';

    document.getElementById('q1-status').innerHTML = q1 ? "✅ COMPLETATA (+300 XP)" : "⏳ Incompleta (+300 XP)";
    document.getElementById('q1-status').style.color = q1 ? "var(--neon-green)" : "var(--text-muted)";
    document.getElementById('q2-status').innerHTML = q2 ? "✅ COMPLETATA (+500 XP)" : "⏳ Incompleta (+500 XP)";
    document.getElementById('q2-status').style.color = q2 ? "var(--neon-green)" : "var(--text-muted)";
    document.getElementById('q3-status').innerHTML = q3 ? "✅ COMPLETATA (+400 XP)" : "⏳ Incompleta (+400 XP)";
    document.getElementById('q3-status').style.color = q3 ? "var(--neon-green)" : "var(--text-muted)";
}

// Gestione della Bacheca dei Trofei Sbloccabili
function renderAchievements() {
    const highscore = parseInt(localStorage.getItem('arcade_highscore') || 0);
    const totalXP = parseInt(localStorage.getItem('arcade_total_xp') || 0);
    const subjectsCount = Object.keys(JSON.parse(localStorage.getItem('arcade_subjects_xp') || "{}")).length;

    const ach1 = highscore >= 10;
    const ach2 = subjectsCount >= 5;
    const ach3 = totalXP >= 1000000;

    document.getElementById('ach1-status').innerHTML = ach1 ? "🔓 SBLOCCATO (+2000 XP)" : "🔒 Bloccato";
    document.getElementById('ach1-status').style.color = ach1 ? "var(--neon-gold)" : "var(--text-muted)";
    document.getElementById('ach2-status').innerHTML = ach2 ? "🔓 SBLOCCATO (+5000 XP)" : "🔒 Bloccato";
    document.getElementById('ach2-status').style.color = ach2 ? "var(--neon-gold)" : "var(--text-muted)";
    document.getElementById('ach3-status').innerHTML = ach3 ? "🔓 SBLOCCATO (+50000 XP)" : "🔒 Bloccato";
    document.getElementById('ach3-status').style.color = ach3 ? "var(--neon-gold)" : "var(--text-muted)";
    
    // Controlla ed assegna i premi in XP se sbloccati per la prima volta
    if (ach1 && localStorage.getItem('ach_1_claimed') !== 'true') { localStorage.setItem('ach_1_claimed', 'true'); refreshProfileXP(2000); }
    if (ach2 && localStorage.getItem('ach_2_claimed') !== 'true') { localStorage.setItem('ach_2_claimed', 'true'); refreshProfileXP(5000); }
    if (ach3 && localStorage.getItem('ach_3_claimed') !== 'true') { localStorage.setItem('ach_3_claimed', 'true'); refreshProfileXP(50000); }
}

function checkGameEndQuestsAndAchievements(finalCorrectCount) {
    // Avanza la Quest 1 (Mente Lucida: Meno di 2 errori su 10 domande)
    if (questions.length === 10 && (10 - finalCorrectCount) <= 2) {
        if (localStorage.getItem('quest_1_done') !== 'true') { localStorage.setItem('quest_1_done', 'true'); refreshProfileXP(300); }
    }
    // Avanza la Quest 3 (Inarrestabile: Aver fatto una combo di almeno x5)
    if (localStorage.getItem('quest_3_trigger_session') === 'true') {
        if (localStorage.getItem('quest_3_done') !== 'true') { localStorage.setItem('quest_3_done', 'true'); refreshProfileXP(400); }
    }
    localStorage.removeItem('quest_3_trigger_session');
    
    renderDailyQuests();
    renderAchievements();
}
function addSubjectXP(subject, points) {
    let safeSubject = (subject && subject.trim()) ? subject.trim() : "Generale";
    let subjectsData = JSON.parse(localStorage.getItem('arcade_subjects_xp') || "{}");
    if (!subjectsData[safeSubject]) subjectsData[safeSubject] = 0;
    subjectsData[safeSubject] += points;
    localStorage.setItem('arcade_subjects_xp', JSON.stringify(subjectsData));
    
    // Avanza Quest 2 (Stacanovista: Almeno due materie nello storico)
    if (Object.keys(subjectsData).length >= 2) {
        if (localStorage.getItem('quest_2_done') !== 'true') { localStorage.setItem('quest_2_done', 'true'); refreshProfileXP(500); }
    }
    renderSubjectsList();
}

function renderSubjectsList() {
    const container = document.getElementById('subjects-list-container');
    if (!container) return;
    const subjectsData = JSON.parse(localStorage.getItem('arcade_subjects_xp') || "{}");
    const subjectsRecords = JSON.parse(localStorage.getItem('arcade_subjects_records') || "{}");
    if (Object.keys(subjectsData).length === 0) return;
    container.innerHTML = '';
    for (let sub in subjectsData) {
        let xp = subjectsData[sub];
        let lv = Math.floor(xp / 1000) + 1;
        let topScore = subjectsRecords[sub] !== undefined ? subjectsRecords[sub] : 0;
        const row = document.createElement('div');
        row.className = 'subject-tag-row';
        row.innerHTML = `<span>📚 <b>${sub}</b></span> <span><span style="color:var(--neon-gold); margin-right:12px; font-weight:800;">🥇 TOP: ${topScore}/10</span><span style="color:var(--neon-blue)">LV.${lv} (${xp} XP)</span></span>`;
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
        if (currentXP > 0 && xpPercent < 0.1) { barFill.style.width = "0.5%"; barText.innerText = xpPercent.toFixed(4) + "%"; } 
        else { barFill.style.width = xpPercent + "%"; barText.innerText = xpPercent.toFixed(2) + "%"; }
    }
    updateShopLockStatus(currentXP);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedHighScore = localStorage.getItem('arcade_highscore') || 0;
    const hsEl = document.getElementById('global-highscore');
    if (hsEl) hsEl.innerText = `${savedHighScore} / 10`;
    changeTheme(localStorage.getItem('arcade_active_theme') || 'cyber');
    refreshProfileXP(0); renderSubjectsList(); checkDailySpinStatus();
    renderDailyQuests(); renderAchievements();
    if (localStorage.getItem('arcade_saved_session')) {
        document.getElementById('resume-screen').classList.remove('hidden'); document.getElementById('setup-screen').classList.add('hidden');
    }
});
window.resumeGame = function(shouldResume) {
    document.getElementById('resume-screen').classList.add('hidden');
    if (shouldResume) {
        const savedState = JSON.parse(localStorage.getItem('arcade_saved_session'));
        questions = savedState.questions; currentQuestionIndex = savedState.currentIndex;
        score = savedState.score; streak = savedState.streak; wrongAnswersLog = savedState.wrongAnswersLog;
        currentQuizSubject = savedState.subject || "Generale"; gameMode = savedState.gameMode || "quiz";
        playerLives = savedState.playerLives !== undefined ? savedState.playerLives : 3;
        document.getElementById('quiz-screen').classList.remove('hidden'); showQuestion();
    } else {
        localStorage.removeItem('arcade_saved_session'); document.getElementById('setup-screen').classList.remove('hidden');
    }
}

function freezeCurrentSession() {
    localStorage.setItem('arcade_saved_session', JSON.stringify({
        questions: questions, currentIndex: currentQuestionIndex, score: score, streak: streak,
        wrongAnswersLog: wrongAnswersLog, subject: currentQuizSubject, gameMode: gameMode
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
        gameMode = mode;
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
        let ansText = currentQuestion.type === 'tf' ? `RISPOSTA: ${currentQuestion.correctAnswer}<br><small>${currentQuestion.explanation || ''}</small>` : `RISPOSTA CORRETTA:<br><span style='color:var(--neon-green)'>${currentQuestion.correctAnswer}</span>`;
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
function exitFlashcards() { document.getElementById('flashcard-screen').classList.add('hidden'); document.getElementById('quiz-screen').classList.remove('hidden'); currentQuestionIndex = 0; score = 0; gameMode = "quiz"; freezeCurrentSession(); showQuestion(); }

function triggerFlashEffect(status) {
    const container = document.getElementById('game-container');
    if (!container) return;
    container.classList.remove('flash-correct', 'flash-wrong');
    void container.offsetWidth; container.classList.add(status === 'correct' ? 'flash-correct' : 'flash-wrong');
}

function updateStreakHUD() {
    const badge = document.getElementById('hud-streak');
    if (!badge) return;
    if (streak >= 2) { 
        badge.innerText = `COMBO x${streak} 🔥`; badge.classList.remove('hidden'); 
        if (streak >= 5) localStorage.setItem('quest_3_trigger_session', 'true'); // Attiva trigger per Quest 3
    } else { badge.classList.add('hidden'); }
}
function showQuestion() {
    if (currentQuestionIndex >= questions.length) { showResults(); return; }
    const currentQuestion = questions[currentQuestionIndex];
    document.getElementById('feedback-text').innerText = '';
    document.getElementById('next-btn').classList.add('hidden');
    const optionsContainer = document.getElementById('options-container');
    const tfContainer = document.getElementById('tf-container');
    optionsContainer.innerHTML = ''; if (tfContainer) tfContainer.classList.add('hidden');
    let safeSub = currentQuizSubject ? currentQuizSubject : "Generale";
    
    // Ripristinato l'HUD classico senza icone dei cuori
    document.getElementById('hud-current').innerText = `STAGE ${currentQuestionIndex + 1} / ${questions.length} [${safeSub}]`;
    document.getElementById('hud-score').innerText = `SCORE: ${score * 100}`;
    updateStreakHUD();
    document.getElementById('progress-fill').style.width = `${(currentQuestionIndex / questions.length) * 100}%`;
    document.getElementById('question-text').innerHTML = currentQuestion.text;

    if (currentQuestion.type === 'tf') {
        if (tfContainer) tfContainer.classList.remove('hidden');
        const btnVero = document.getElementById('btn-vero'); const btnFalso = document.getElementById('btn-falso');
        if (btnVero && btnFalso) { btnVero.className = 'option-btn'; btnFalso.className = 'option-btn'; btnVero.style.pointerEvents = 'auto'; btnFalso.style.pointerEvents = 'auto'; }
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
    if (userChoice === 'Vero') { if (btnVero) btnVero.classList.add(isCorrect ? 'correct' : 'wrong'); if (!isCorrect && btnFalso) btnFalso.classList.add('correct'); } 
    else { if (btnFalso) btnFalso.classList.add(isCorrect ? 'correct' : 'wrong'); if (!isCorrect && btnVero) btnVero.classList.add('correct'); }
    let safeSub = currentQuizSubject ? currentQuizSubject : "Generale";
    if (isCorrect) {
        streak++; score += streak; triggerFlashEffect('correct'); playArcadeSound('correct');
        let xpGained = 150 * streak; refreshProfileXP(xpGained); addSubjectXP(safeSub, xpGained);
        feedback.innerHTML = `<span style="color: var(--neon-green);">+${xpGained} XP - ESATTO! 🔥</span>`;
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
        let xpGained = 150 * streak; refreshProfileXP(xpGained); addSubjectXP(safeSub, xpGained);
        feedback.innerHTML = `<span style="color: var(--neon-green);">+${xpGained} XP - ESATTO! 🔥</span>`;
    } else {
        selectedLi.classList.add('wrong'); options.forEach(li => { if (li.innerText.toLowerCase() === correctOption.toLowerCase()) li.classList.add('correct'); });
        wrongAnswersLog.push({ q: currentQuestion.text, user: selectedOption, correct: correctOption, expl: `La risposta era: ${correctOption}` });
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
    if (percent >= 60) return { text: "SUPERATO 👍", color: "#eab308" };
    return { text: "GAME OVER ❌", color: "#b91c1c" };
}

function showResults() {
    document.getElementById('quiz-screen').classList.add('hidden'); 
    document.getElementById('result-screen').classList.remove('hidden');
    localStorage.removeItem('arcade_saved_session');
    
    let correctAnswersCount = questions.length - wrongAnswersLog.length;
    document.getElementById('final-score').innerText = correctAnswersCount;
    
    // In caso di sconfitta prematura in Survival, adatta l'HUD finale
    document.getElementById('total-questions-hud').innerText = currentQuestionIndex === questions.length ? questions.length : currentQuestionIndex;
    
    const evaluation = getEvaluation(correctAnswersCount, currentQuestionIndex);
    const targetEl = document.getElementById('evaluation-text'); 
    if (targetEl) { targetEl.innerText = evaluation.text; targetEl.style.color = evaluation.color; }

    // Aggiornamento record specifico per materia
    let safeSub = currentQuizSubject ? currentQuizSubject : "Generale";
    let subjectsRecords = JSON.parse(localStorage.getItem('arcade_subjects_records') || "{}");
    let oldRecord = subjectsRecords[safeSub] || 0;
    if (correctAnswersCount > oldRecord) { 
        subjectsRecords[safeSub] = correctAnswersCount; 
        localStorage.setItem('arcade_subjects_records', JSON.stringify(subjectsRecords)); 
    }

    // Cronologia ultimi 5 test
    const history = JSON.parse(localStorage.getItem('arcade_quiz_history') || "[]");
    const today = new Date(); const dateStr = today.getDate() + "/" + (today.getMonth() + 1);
    history.push({ date: dateStr, score: correctAnswersCount, total: questions.length });
    if (history.length > 5) history.shift();
    localStorage.setItem('arcade_quiz_history', JSON.stringify(history));

    // CORRETTO: Sincronizzato l'ID esatto per aggiornare istantaneamente l'HUD in alto a destra
    const currentHighScore = parseInt(localStorage.getItem('arcade_highscore') || 0);
    const recordLabel = document.getElementById('new-record-text');
    
    if (correctAnswersCount > currentHighScore) {
        localStorage.setItem('arcade_highscore', correctAnswersCount);
        const scoreWidget = document.getElementById('global-highscore');
        if (scoreWidget) {
            scoreWidget.innerText = `${correctAnswersCount} / 10`;
        }
        if (recordLabel) recordLabel.classList.remove('hidden');
    } else { 
        if (recordLabel) recordLabel.classList.add('hidden'); 
    }

    const logList = document.getElementById('error-log-list'); if (logList) logList.innerHTML = '';
    if (wrongAnswersLog.length > 0) {
        document.getElementById('error-log-container').classList.remove('hidden');
        wrongAnswersLog.forEach((item, i) => {
            const div = document.createElement('div'); div.className = 'error-item';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div><strong>#${i+1} ${item.q}</strong><br><span style="color:var(--neon-red);">Tua: ${item.user}</span> | <span style="color:var(--neon-green);">Esatta: ${item.correct}</span></div>
                    <button class="copy-btn" style="margin:0; padding:4px 10px; font-size:0.75rem; background:var(--neon-purple); color:white;" onclick="askTutorAI('${window.btoa(encodeURIComponent(item.q))}', '${window.btoa(encodeURIComponent(item.correct))}')">🤖 CHIEDI AL TUTOR</button>
                </div>
                <div id="tutor-box-${window.btoa(encodeURIComponent(item.q)).replace(/=/g,'')}" class="hidden" style="margin-top:8px; padding:10px; background:rgba(192,132,252,0.1); border-left:2px solid var(--neon-purple); border-radius:4px; font-size:0.85rem;"></div>`;
            logList.appendChild(div);
        });
    } else { document.getElementById('error-log-container').classList.add('hidden'); }
    checkGameEndQuestsAndAchievements(correctAnswersCount);
}

window.askTutorAI = function(encodedQ, encodedAns) {
    const q = decodeURIComponent(window.atob(encodedQ)); const ans = decodeURIComponent(window.atob(encodedAns));
    const box = document.getElementById("tutor-box-" + encodedQ.replace(/=/g,''));
    if (!box) return; box.classList.remove('hidden');
    box.innerHTML = "⏳ Generazione dell'esempio pratico...";
    setTimeout(() => { box.innerHTML = `💡 *SPIEGAZIONE DEL TUTOR:* La risposta esatta è *${ans}*.\nSe hai dei dubbi copia questo messaggio e chiedi alla chat principale: _"Spiegami in modo semplice perché negli appunti la risposta a '${q}' è '${ans}'"_`; }, 400);
}

window.exportQuizReport = function() {
    let correctAnswersCount = questions.length - wrongAnswersLog.length;
    let safeSub = currentQuizSubject ? currentQuizSubject : "Generale";
    
    // 1. Generazione dell'intestazione del report
    let shareText = `⚡ REPORT DI STUDIO - NOTEQUIZ ARCADE ⚡\n`;
    shareText += `-----------------------------------------\n`;
    shareText += `📚 Materia: ${safeSub}\n`;
    shareText += `🎯 Esito: ${correctAnswersCount} / ${questions.length} Esatte\n`;
    shareText += `🏆 Grado: ${getEvaluation(correctAnswersCount, questions.length).text}\n`;
    shareText += `-----------------------------------------\n\n`;
    
    // CORRETTO: Ora il codice controlla e concatena gli errori reali al testo di condivisione
    if (wrongAnswersLog.length > 0) {
        shareText += `❌ ELENCO ERRORI DA RIPASSARE:\n\n`;
        wrongAnswersLog.forEach((item, i) => {
            shareText += `• Domanda ${i + 1}: ${item.q}\n`;
            shareText += `  Tua risp: ${item.user}\n`;
            shareText += `  Risp corr: ${item.correct}\n`;
            if (item.expl) {
                shareText += `  Dettaglio: ${item.expl}\n`;
            }
            shareText += `\n`;
        });
    } else {
        shareText += `🔥 PREPARAZIONE PERFETTA! 🔥\nZero errori commessi. Pronto per la verifica! 🚀\n`;
    }

    // 2. Invio del blocco di testo completo al sistema di condivisione nativo
    if (navigator.share) {
        navigator.share({ 
            title: `Report NoteQuiz - ${safeSub}`, 
            text: shareText 
        })
        .then(() => console.log('Condivisione riuscita!'))
        .catch((error) => console.log('Errore condivisione:', error));
    } else {
        // Soluzione di riserva per PC: copia tutto il testo negli appunti
        navigator.clipboard.writeText(shareText).then(() => {
            alert("Il report completo (inclusi gli errori) è stato COPIATO NEGLI APPUNTI! Puoi incollarlo manualmente (Ctrl+V) dove preferisci.");
        }).catch(err => { 
            alert("Impossibile copiare il testo."); 
        });
    }
}

window.resetQuiz = function() {
    document.getElementById('result-screen').classList.add('hidden'); document.getElementById('setup-screen').classList.remove('hidden');
    document.getElementById('notes-input').value = ''; 
    document.getElementById('hud-streak').classList.add('hidden');
    localStorage.removeItem('arcade_saved_session'); 
    refreshProfileXP(0); 
    renderSubjectsList(); 
    renderDailyQuests(); 
    renderAchievements();
}

window.wipeAllArcadeData = function() {
    if (confirm("Azzerare tutto il profilo permanentemente?")) { 
        localStorage.clear(); 
        alert("Profilo Formattato!"); 
        window.location.reload(); 
    }
}

window.copyPromptToClipboard = function() {
    const promptText = `Genera un quiz di 10 domande (5 multiple con 4 opzioni e 5 vero/falso) basato sugli appunti che ti lascio qui sotto. All'inizio del JSON inserisci anche la chiave "subject": "NomeMateria" inserendo la disciplina corretta per gli appunti inseriti. Restituisci ESCLUSIVAMENTE un blocco JSON puro, senza alcuna introduzione e senza blocchi di codice markdown (niente tre backtick). Segui questa struttura:

{
  "subject": "NomeDellaMateria",
  "questions": [
    { "type": "multiple", "text": "Domanda...", "correctAnswer": "Risposta esatta", "choices": ["Opzione 1", "Opzione 2", "Opzione 3", "Opzione 4"] },
    { "type": "tf", "text": "Affermazione...", "correctAnswer": "Vero", "explanation": "Spiegazione..." }
  ]
}

Ecco i miei appunti: `;

    navigator.clipboard.writeText(promptText).then(() => {
        const btn = document.querySelector('.copy-btn');
        if (btn) { 
            btn.innerText = "✅ COPIATO!"; 
            setTimeout(() => { btn.innerText = "📋 COPIA COMANDO PER L'IA"; }, 2000); 
        }
    });
}
>>>>>>> f78a488dc59d250aee7e67d98865ebd1ebc4a5c6
