/**
 * Mind Lock - لعبة الألغاز الفكرية
 * ===================================
 * لعبة ألغاز تفاعلية مبنية بـ HTML, CSS, JavaScript
 * قابلة للتشغيل على المتصفحات و الموبايل عبر Capacitor
 */

// ===== نظام الصوت =====
class SoundManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.backgroundMusic = null;
        this.musicGain = null;
        this.initialized = false;
    }

    /**
     * تهيئة نظام الصوت
     */
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.audioContext.createGain();
            this.musicGain.connect(this.audioContext.destination);
            this.musicGain.gain.value = 0.3;
            this.initialized = true;
        } catch (e) {
            console.log('Web Audio API غير مدعوم');
        }
    }

    /**
     * تشغيل نغمة موسيقية
     * @param {number} frequency - التردد
     * @param {string} type - نوع الموجة
     * @param {number} duration - المدة بالثواني
     * @param {number} volume - مستوى الصوت
     */
    playTone(frequency, type = 'sine', duration = 0.3, volume = 0.5) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    /**
     * صوت الفوز - لحن سعيد ومبهج
     */
    playWinSound() {
        if (!this.enabled || !this.audioContext) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playTone(note, 'sine', 0.3, 0.4);
            }, index * 150);
        });
    }

    /**
     * صوت الخسارة - لحن حزين
     */
    playLoseSound() {
        if (!this.enabled || !this.audioContext) return;

        const notes = [400, 350, 300, 250];
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playTone(note, 'triangle', 0.4, 0.3);
            }, index * 200);
        });
    }

    /**
     * صوت الشراء - لحن تحفيزي
     */
    playPurchaseSound() {
        if (!this.enabled || !this.audioContext) return;

        const notes = [880, 1108.73, 1318.51]; // A5, C#6, E6
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playTone(note, 'sine', 0.2, 0.3);
            }, index * 100);
        });
    }

    /**
     * صوت النقر على الزر
     */
    playClickSound() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(800, 'sine', 0.1, 0.2);
    }

    /**
     * صوت اختيار خاطئ
     */
    playWrongSound() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(200, 'sawtooth', 0.3, 0.3);
    }

    /**
     * صوت اختيار صحيح
     */
    playCorrectSound() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(600, 'sine', 0.15, 0.3);
        setTimeout(() => this.playTone(800, 'sine', 0.15, 0.3), 100);
    }

    /**
     * صوت تحذير الوقت
     */
    playTimerWarningSound() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(440, 'square', 0.1, 0.2);
    }

    /**
     * بدء الموسيقى الخلفية
     */
    startBackgroundMusic() {
        if (!this.enabled || !this.audioContext || this.backgroundMusic) return;

        // إنشاء موسيقى خلفية هادئة باستخدام عدة مذبذبات
        const playNote = (freq, startTime, duration) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.musicGain);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
            gain.gain.linearRampToValueAtTime(0, startTime + duration);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        // تشغيل حلقة موسيقية
        const playLoop = () => {
            if (!this.enabled) return;
            
            const now = this.audioContext.currentTime;
            const notes = [261.63, 329.63, 392, 329.63]; // C4, E4, G4, E4
            
            notes.forEach((note, i) => {
                playNote(note, now + i * 0.5, 0.4);
            });
            
            this.backgroundMusic = setTimeout(playLoop, 2000);
        };

        playLoop();
    }

    /**
     * إيقاف الموسيقى الخلفية
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            clearTimeout(this.backgroundMusic);
            this.backgroundMusic = null;
        }
    }

    /**
     * تبديل حالة الصوت
     */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopBackgroundMusic();
        }
        return this.enabled;
    }
}

// ===== بيانات المستويات =====
const LEVELS = [
    // المستوى 1 - سهل جداً
    {
        id: 1,
        type: 'sequence',
        typeName: 'تسلسل أرقام',
        question: 'ما هو الرقم التالي في السلسلة؟\n\n2, 4, 6, 8, ?',
        options: ['9', '10', '12', '11'],
        answer: '10',
        hint: 'أضف 2 لكل رقم',
        reveal: 'الأرقام الزوجية المتتالية',
        explanation: '💡 هذه سلسلة الأرقام الزوجية! كل رقم يزيد بمقدار 2 عن سابقه: 2→4→6→8→10. التعرف على الأنماط العددية مهارة أساسية في الرياضيات.',
        reward: 15,
        timeLimit: 60
    },
    // المستوى 2 - سهل
    {
        id: 2,
        type: 'logic',
        typeName: 'لغز منطقي',
        question: 'إذا كان أحمد أكبر من سعيد، وسعيد أكبر من خالد.\nمن هو الأصغر؟',
        options: ['أحمد', 'سعيد', 'خالد', 'لا يمكن تحديد'],
        answer: 'خالد',
        hint: 'رتب الأسماء من الأكبر للأصغر',
        reveal: 'خ...',
        explanation: '🧠 الترتيب المنطقي: أحمد > سعيد > خالد. إذاً خالد هو الأصغر! هذا النوع من الألغاز يختبر قدرتك على الاستنتاج المنطقي والترتيب.',
        reward: 20,
        timeLimit: 45
    },
    // المستوى 3 - سهل
    {
        id: 3,
        type: 'math',
        typeName: 'لغز رياضي',
        question: 'أكمل المعادلة:\n\n5 + 3 × 2 = ?',
        options: ['16', '11', '13', '10'],
        answer: '11',
        hint: 'تذكر ترتيب العمليات الحسابية',
        reveal: 'الضرب قبل الجمع',
        explanation: '📐 قاعدة PEMDAS: الضرب يأتي قبل الجمع! أولاً: 3×2=6، ثم: 5+6=11. هذه القاعدة أساسية في كل العمليات الحسابية.',
        reward: 20,
        timeLimit: 45
    },
    // المستوى 4 - متوسط
    {
        id: 4,
        type: 'visual',
        typeName: 'خدعة بصرية',
        question: 'كم مثلثاً تراه في هذا الشكل؟\n\n      △\n    △   △\n  △   △   △',
        options: ['6', '10', '8', '7'],
        answer: '10',
        hint: 'لا تنسَ المثلثات المركبة',
        reveal: '6 صغيرة + 3 متوسطة + 1 كبير',
        explanation: '👁️ الحل: 6 مثلثات صغيرة + 3 مثلثات متوسطة (كل منها يضم مثلثين) + 1 مثلث كبير = 10 مثلثات! دائماً ابحث عن الأشكال المركبة.',
        reward: 25,
        timeLimit: 50
    },
    // المستوى 5 - متوسط
    {
        id: 5,
        type: 'riddle',
        typeName: 'لغز ذكاء',
        question: 'ما الشيء الذي يمشي بدون أرجل؟',
        options: ['الساعة', 'الماء', 'الهواء', 'الوقت'],
        answer: 'الساعة',
        hint: 'شيء نستخدمه يومياً',
        reveal: 'عقاربها تمشي',
        explanation: '⏰ الساعة "تمشي" لأن عقاربها تتحرك! هذا النوع من الألغاز يعتمد على التفكير المجازي واللعب بالكلمات.',
        reward: 25,
        timeLimit: 40
    },
    // المستوى 6 - متوسط
    {
        id: 6,
        type: 'sequence',
        typeName: 'تسلسل أرقام',
        question: 'ما هو الرقم التالي؟\n\n1, 1, 2, 3, 5, 8, ?',
        options: ['11', '12', '13', '10'],
        answer: '13',
        hint: 'كل رقم = مجموع الرقمين السابقين',
        reveal: 'متتالية فيبوناتشي',
        explanation: '🌀 هذه متتالية فيبوناتشي الشهيرة! كل رقم = مجموع الرقمين قبله: 5+8=13. توجد في الطبيعة: الصدف، الزهور، والمجرات!',
        reward: 30,
        timeLimit: 45
    },
    // المستوى 7 - صعب
    {
        id: 7,
        type: 'logic',
        typeName: 'لغز منطقي',
        question: 'في سباق، تجاوزت الشخص الثاني.\nفي أي مركز أنت الآن؟',
        options: ['الأول', 'الثاني', 'الثالث', 'الرابع'],
        answer: 'الثاني',
        hint: 'فكر منطقياً، من أخذ مكانك؟',
        reveal: 'أخذت مكان الثاني',
        explanation: '🏃 خدعة! عندما تتجاوز الثاني، تأخذ مكانه وتصبح أنت الثاني (ليس الأول). لتصبح أولاً يجب أن تتجاوز الأول!',
        reward: 30,
        timeLimit: 40
    },
    // المستوى 8 - صعب
    {
        id: 8,
        type: 'math',
        typeName: 'لغز رياضي',
        question: 'إذا كان:\n🍎 + 🍎 = 8\n🍎 + 🍊 = 7\n🍊 + 🍋 = 5\n\nما قيمة 🍎 + 🍊 + 🍋؟',
        options: ['10', '9', '11', '8'],
        answer: '9',
        hint: '🍎 = 4',
        reveal: '4 + 3 + 2',
        explanation: '🧮 الحل خطوة بخطوة: 🍎=4 (من 🍎+🍎=8)، 🍊=3 (من 4+🍊=7)، 🍋=2 (من 3+🍋=5). المجموع: 4+3+2=9. هذا يسمى نظام المعادلات!',
        reward: 35,
        timeLimit: 50
    },
    // المستوى 9 - صعب
    {
        id: 9,
        type: 'visual',
        typeName: 'خدعة بصرية',
        question: 'أي خط أطول؟\n\n>————<\n<————>',
        options: ['الأول', 'الثاني', 'متساويان', 'لا يمكن تحديد'],
        answer: 'متساويان',
        hint: 'لا تثق بعينيك دائماً',
        reveal: 'خدعة مولر-لاير البصرية',
        explanation: '🔬 هذه خدعة مولر-لاير الشهيرة! الخطان متساويان تماماً، لكن الأسهم تخدع الدماغ. اكتُشفت عام 1889 وتثبت أن العين قد تكذب!',
        reward: 35,
        timeLimit: 35
    },
    // المستوى 10 - صعب جداً
    {
        id: 10,
        type: 'riddle',
        typeName: 'لغز ذكاء',
        question: 'لدي مدن لكن لا سكان فيها،\nلدي غابات لكن لا أشجار،\nلدي ماء لكن لا سمك.\n\nما أنا؟',
        options: ['الخريطة', 'اللوحة', 'الحلم', 'الكتاب'],
        answer: 'الخريطة',
        hint: 'شيء يمثل العالم',
        reveal: 'خر...',
        explanation: '🗺️ الخريطة تحتوي رموزاً للمدن والغابات والمياه، لكنها مجرد رسومات! هذا اللغز يختبر التفكير التجريدي والتمييز بين الحقيقي والرمزي.',
        reward: 40,
        timeLimit: 45
    },
    // المستوى 11 - صعب جداً
    {
        id: 11,
        type: 'sequence',
        typeName: 'تسلسل أرقام',
        question: 'ما هو الرقم الناقص؟\n\n3, 9, 27, ?, 243',
        options: ['54', '72', '81', '108'],
        answer: '81',
        hint: 'اضرب في نفس الرقم',
        reveal: 'قوى العدد 3',
        explanation: '📊 هذه قوى العدد 3: 3¹=3، 3²=9، 3³=27، 3⁴=81، 3⁵=243. كل رقم هو الرقم السابق مضروباً في 3!',
        reward: 40,
        timeLimit: 40
    },
    // المستوى 12 - تحدي
    {
        id: 12,
        type: 'logic',
        typeName: 'لغز منطقي',
        question: 'مزارع لديه 17 خروفاً.\nماتت جميعها إلا 9.\nكم خروفاً تبقى؟',
        options: ['8', '9', '0', '17'],
        answer: '9',
        hint: 'اقرأ السؤال بعناية',
        reveal: '"إلا 9" = بقي 9',
        explanation: '📖 السر في كلمة "إلا"! "ماتت جميعها إلا 9" تعني أن 9 لم تمت = بقيت 9 خراف. القراءة الدقيقة مفتاح الحل!',
        reward: 45,
        timeLimit: 35
    },
    // المستوى 13 - تحدي
    {
        id: 13,
        type: 'math',
        typeName: 'لغز رياضي',
        question: 'ما هو ناتج:\n\n111,111,111 × 111,111,111 = ?',
        options: ['12345678987654321', '123456789123456789', '12345678901234567', '11111111111111111'],
        answer: '12345678987654321',
        hint: 'الناتج يشكل نمطاً متماثلاً',
        reveal: 'نمط تصاعدي ثم تنازلي',
        explanation: '✨ نمط رياضي ساحر! 1×1=1، 11×11=121، 111×111=12321... الناتج دائماً متماثل! يصعد من 1 إلى 9 ثم ينزل. جمال الرياضيات!',
        reward: 50,
        timeLimit: 45
    },
    // المستوى 14 - تحدي
    {
        id: 14,
        type: 'riddle',
        typeName: 'لغز ذكاء',
        question: 'كلما أخذت منه أكثر، كبر أكثر.\nما هو؟',
        options: ['الحفرة', 'الجوع', 'العطش', 'الطمع'],
        answer: 'الحفرة',
        hint: 'شيء مادي ملموس',
        reveal: 'الحفر يجعلها أكبر',
        explanation: '🕳️ الحفرة تكبر كلما أخذت (حفرت) منها أكثر! هذا اللغز يعتمد على التفكير العكسي - الأخذ هنا يعني الإضافة للحجم.',
        reward: 50,
        timeLimit: 40
    },
    // المستوى 15 - أسطوري
    {
        id: 15,
        type: 'visual',
        typeName: 'خدعة بصرية',
        question: 'كم مربعاً في رقعة شطرنج 8×8؟\n(ليس فقط المربعات الصغيرة)',
        options: ['64', '204', '200', '256'],
        answer: '204',
        hint: 'فكر في المربعات بجميع الأحجام',
        reveal: '1² + 2² + 3² + ... + 8²',
        explanation: '♟️ عد المربعات بكل الأحجام: 64 (1×1) + 49 (2×2) + 36 (3×3) + 25 + 16 + 9 + 4 + 1 = 204! الصيغة: مجموع مربعات الأعداد من 1 إلى n.',
        reward: 60,
        timeLimit: 60
    }
];

// ===== إعدادات اللعبة =====
const CONFIG = {
    initialLives: 3,
    initialCoins: 50,
    hintCost: 10,
    revealCost: 25,
    skipCost: 50,
    lifeCost: 30,
    lifeRestoreTime: 5 * 60 * 1000, // 5 دقائق
    timeBonusMultiplier: 0.5
};

// ===== حالة اللعبة =====
let gameState = {
    currentLevel: 1,
    coins: CONFIG.initialCoins,
    lives: CONFIG.initialLives,
    timeRemaining: 60,
    timerInterval: null,
    lifeRestoreTimeout: null,
    lifeRestoreEndTime: null,
    hintUsed: false,
    revealUsed: false,
    isPaused: false
};

// ===== مدير الصوت =====
const soundManager = new SoundManager();

// ===== عناصر DOM =====
const elements = {
    // الشاشات
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    winScreen: document.getElementById('win-screen'),
    loseScreen: document.getElementById('lose-screen'),
    gameoverScreen: document.getElementById('gameover-screen'),
    timeoutScreen: document.getElementById('timeout-screen'),
    
    // أزرار البداية
    playBtn: document.getElementById('play-btn'),
    continueBtn: document.getElementById('continue-btn'),
    soundToggle: document.getElementById('sound-toggle'),
    soundIcon: document.getElementById('sound-icon'),
    
    // عناصر اللعب
    coinsDisplay: document.getElementById('coins-display'),
    levelDisplay: document.getElementById('level-display'),
    livesDisplay: document.getElementById('lives-display'),
    timerProgress: document.getElementById('timer-progress'),
    timerText: document.getElementById('timer-text'),
    puzzleType: document.getElementById('puzzle-type'),
    puzzleQuestion: document.getElementById('puzzle-question'),
    inputArea: document.getElementById('input-area'),
    answerInput: document.getElementById('answer-input'),
    optionsArea: document.getElementById('options-area'),
    submitBtn: document.getElementById('submit-btn'),
    
    // أزرار المساعدة
    hintBtn: document.getElementById('hint-btn'),
    revealBtn: document.getElementById('reveal-btn'),
    skipBtn: document.getElementById('skip-btn'),
    menuBtn: document.getElementById('menu-btn'),
    
    // شاشة الفوز
    rewardAmount: document.getElementById('reward-amount'),
    timeBonus: document.getElementById('time-bonus'),
    explanationBox: document.getElementById('explanation-box'),
    explanationText: document.getElementById('explanation-text'),
    nextLevelBtn: document.getElementById('next-level-btn'),
    
    // شاشة الخسارة
    remainingLives: document.getElementById('remaining-lives'),
    retryBtn: document.getElementById('retry-btn'),
    
    // شاشة انتهاء اللعبة
    countdownDisplay: document.getElementById('countdown-display'),
    buyLifeBtn: document.getElementById('buy-life-btn'),
    homeBtn: document.getElementById('home-btn'),
    
    // شاشة انتهاء الوقت
    correctAnswerTimeout: document.getElementById('correct-answer-timeout'),
    retryTimeoutBtn: document.getElementById('retry-timeout-btn'),
    
    // النوافذ المنبثقة
    hintModal: document.getElementById('hint-modal'),
    hintText: document.getElementById('hint-text'),
    closeHint: document.getElementById('close-hint'),
    revealModal: document.getElementById('reveal-modal'),
    revealText: document.getElementById('reveal-text'),
    closeReveal: document.getElementById('close-reveal'),
    pauseMenu: document.getElementById('pause-menu'),
    pauseLevel: document.getElementById('pause-level'),
    pauseCoins: document.getElementById('pause-coins'),
    pauseLives: document.getElementById('pause-lives'),
    resumeBtn: document.getElementById('resume-btn'),
    restartBtn: document.getElementById('restart-btn'),
    quitBtn: document.getElementById('quit-btn'),
    pauseSoundToggle: document.getElementById('pause-sound-toggle')
};

// ===== وظائف التخزين المحلي =====
/**
 * حفظ حالة اللعبة في التخزين المحلي
 */
function saveGameState() {
    const dataToSave = {
        currentLevel: gameState.currentLevel,
        coins: gameState.coins,
        lives: gameState.lives,
        lifeRestoreEndTime: gameState.lifeRestoreEndTime,
        soundEnabled: soundManager.enabled
    };
    localStorage.setItem('mindLockSave', JSON.stringify(dataToSave));
}

/**
 * تحميل حالة اللعبة من التخزين المحلي
 */
function loadGameState() {
    const savedData = localStorage.getItem('mindLockSave');
    if (savedData) {
        const data = JSON.parse(savedData);
        gameState.currentLevel = data.currentLevel || 1;
        gameState.coins = data.coins || CONFIG.initialCoins;
        gameState.lives = data.lives || CONFIG.initialLives;
        gameState.lifeRestoreEndTime = data.lifeRestoreEndTime || null;
        soundManager.enabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
        
        // التحقق من استعادة الحياة أثناء عدم اللعب
        checkLifeRestoration();
        
        return true;
    }
    return false;
}

/**
 * التحقق من استعادة الحياة
 */
function checkLifeRestoration() {
    if (gameState.lifeRestoreEndTime && gameState.lives < CONFIG.initialLives) {
        const now = Date.now();
        if (now >= gameState.lifeRestoreEndTime) {
            // استعادة حياة واحدة
            gameState.lives = Math.min(gameState.lives + 1, CONFIG.initialLives);
            gameState.lifeRestoreEndTime = null;
            saveGameState();
        }
    }
}

// ===== وظائف إدارة الشاشات =====
/**
 * إخفاء جميع الشاشات
 */
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

/**
 * عرض شاشة معينة
 * @param {HTMLElement} screen - عنصر الشاشة
 */
function showScreen(screen) {
    hideAllScreens();
    screen.classList.add('active');
}

/**
 * عرض شاشة فوق الشاشة الحالية (overlay)
 * @param {HTMLElement} screen - عنصر الشاشة
 */
function showOverlay(screen) {
    screen.classList.add('active');
}

/**
 * إخفاء شاشة overlay
 * @param {HTMLElement} screen - عنصر الشاشة
 */
function hideOverlay(screen) {
    screen.classList.remove('active');
}

// ===== وظائف اللعب =====
/**
 * بدء لعبة جديدة
 */
function startNewGame() {
    soundManager.init();
    soundManager.playClickSound();
    
    gameState.currentLevel = 1;
    gameState.coins = CONFIG.initialCoins;
    gameState.lives = CONFIG.initialLives;
    
    saveGameState();
    startLevel();
}

/**
 * متابعة اللعب من آخر مستوى
 */
function continueGame() {
    soundManager.init();
    soundManager.playClickSound();
    startLevel();
}

/**
 * بدء مستوى جديد
 */
function startLevel() {
    // إعادة تعيين حالة المستوى
    gameState.hintUsed = false;
    gameState.revealUsed = false;
    gameState.isPaused = false;
    
    // الحصول على بيانات المستوى
    const level = getCurrentLevel();
    if (!level) {
        // انتهت جميع المستويات
        showVictoryScreen();
        return;
    }
    
    // تحديث العرض
    updateDisplay();
    
    // عرض شاشة اللعب
    showScreen(elements.gameScreen);
    
    // عرض اللغز
    displayPuzzle(level);
    
    // بدء المؤقت
    startTimer(level.timeLimit);
    
    // بدء الموسيقى الخلفية
    soundManager.startBackgroundMusic();
}

/**
 * الحصول على المستوى الحالي
 */
function getCurrentLevel() {
    return LEVELS.find(level => level.id === gameState.currentLevel);
}

/**
 * عرض اللغز على الشاشة
 * @param {Object} level - بيانات المستوى
 */
function displayPuzzle(level) {
    // تحديث نوع اللغز
    elements.puzzleType.textContent = level.typeName;
    
    // تحديث السؤال
    elements.puzzleQuestion.textContent = level.question;
    
    // إعداد الخيارات أو حقل الإدخال
    if (level.options) {
        elements.inputArea.style.display = 'none';
        elements.submitBtn.style.display = 'none';
        elements.optionsArea.style.display = 'grid';
        
        // إنشاء أزرار الخيارات
        elements.optionsArea.innerHTML = '';
        level.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => selectOption(btn, option));
            elements.optionsArea.appendChild(btn);
        });
    } else {
        // إظهار حقل الإدخال للألغاز النصية
        elements.optionsArea.style.display = 'none';
        elements.inputArea.style.display = 'block';
        elements.submitBtn.style.display = 'block';
        elements.answerInput.value = '';
        elements.answerInput.focus();
    }
    
    // تفعيل أزرار المساعدة
    updateHelpButtons();
}

/**
 * تحديث حالة أزرار المساعدة
 */
function updateHelpButtons() {
    elements.hintBtn.disabled = gameState.hintUsed || gameState.coins < CONFIG.hintCost;
    elements.revealBtn.disabled = gameState.revealUsed || gameState.coins < CONFIG.revealCost;
    elements.skipBtn.disabled = gameState.coins < CONFIG.skipCost;
}

/**
 * اختيار إجابة من الخيارات
 * @param {HTMLElement} btn - زر الخيار
 * @param {string} answer - الإجابة المختارة
 */
function selectOption(btn, answer) {
    soundManager.playClickSound();
    
    // إيقاف المؤقت مؤقتاً
    stopTimer();
    
    // تحديد الخيار
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    // التحقق من الإجابة
    const level = getCurrentLevel();
    
    setTimeout(() => {
        checkAnswer(answer, btn);
    }, 300);
}

/**
 * تأكيد الإجابة (للألغاز النصية)
 */
function submitAnswer() {
    const answer = elements.answerInput.value.trim();
    if (!answer) return;
    
    soundManager.playClickSound();
    stopTimer();
    checkAnswer(answer, null);
}

/**
 * التحقق من صحة الإجابة
 * @param {string} answer - الإجابة
 * @param {HTMLElement} btn - زر الخيار (إن وجد)
 */
function checkAnswer(answer, btn) {
    const level = getCurrentLevel();
    const isCorrect = answer.toString().toLowerCase() === level.answer.toString().toLowerCase();
    
    if (isCorrect) {
        // إجابة صحيحة
        if (btn) {
            btn.classList.add('correct');
        }
        soundManager.playCorrectSound();
        
        setTimeout(() => {
            handleCorrectAnswer();
        }, 500);
    } else {
        // إجابة خاطئة
        if (btn) {
            btn.classList.add('wrong');
            // إظهار الإجابة الصحيحة
            document.querySelectorAll('.option-btn').forEach(b => {
                if (b.textContent === level.answer) {
                    b.classList.add('correct');
                }
            });
        }
        soundManager.playWrongSound();
        
        setTimeout(() => {
            handleWrongAnswer();
        }, 1000);
    }
}

/**
 * معالجة الإجابة الصحيحة
 */
function handleCorrectAnswer() {
    const level = getCurrentLevel();
    
    // حساب المكافأة مع مكافأة الوقت
    const timeBonus = Math.floor(gameState.timeRemaining * CONFIG.timeBonusMultiplier);
    const totalReward = level.reward + timeBonus;
    
    // تحديث العملات
    gameState.coins += totalReward;
    
    // حفظ المستوى المكتمل قبل الانتقال
    const completedLevel = gameState.currentLevel;
    
    // الانتقال للمستوى التالي
    gameState.currentLevel++;
    
    // حفظ التقدم
    saveGameState();
    
    // عرض شاشة الفوز
    elements.rewardAmount.textContent = '+' + totalReward;
    elements.timeBonus.textContent = gameState.timeRemaining + ' ثانية (+' + timeBonus + ' 💰)';
    
    // عرض الشرح والتحليل
    if (level.explanation) {
        elements.explanationText.textContent = level.explanation;
        elements.explanationBox.style.display = 'block';
    } else {
        elements.explanationBox.style.display = 'none';
    }
    
    soundManager.stopBackgroundMusic();
    soundManager.playWinSound();
    
    showOverlay(elements.winScreen);
}

/**
 * معالجة الإجابة الخاطئة
 */
function handleWrongAnswer() {
    // إنقاص المحاولات
    gameState.lives--;
    
    // حفظ التقدم
    saveGameState();
    
    if (gameState.lives <= 0) {
        // انتهت المحاولات
        showGameOver();
    } else {
        // عرض شاشة الخسارة
        elements.remainingLives.textContent = gameState.lives;
        soundManager.stopBackgroundMusic();
        soundManager.playLoseSound();
        showOverlay(elements.loseScreen);
    }
}

/**
 * معالجة انتهاء الوقت
 */
function handleTimeout() {
    const level = getCurrentLevel();
    
    // إنقاص المحاولات
    gameState.lives--;
    saveGameState();
    
    elements.correctAnswerTimeout.textContent = level.answer;
    
    soundManager.stopBackgroundMusic();
    soundManager.playLoseSound();
    
    if (gameState.lives <= 0) {
        showGameOver();
    } else {
        showOverlay(elements.timeoutScreen);
    }
}

/**
 * عرض شاشة انتهاء اللعبة
 */
function showGameOver() {
    soundManager.stopBackgroundMusic();
    soundManager.playLoseSound();
    
    // بدء عداد استعادة الحياة
    gameState.lifeRestoreEndTime = Date.now() + CONFIG.lifeRestoreTime;
    saveGameState();
    
    showOverlay(elements.gameoverScreen);
    startLifeRestoreCountdown();
}

/**
 * بدء عداد استعادة الحياة
 */
function startLifeRestoreCountdown() {
    if (gameState.lifeRestoreTimeout) {
        clearInterval(gameState.lifeRestoreTimeout);
    }
    
    const updateCountdown = () => {
        const remaining = gameState.lifeRestoreEndTime - Date.now();
        
        if (remaining <= 0) {
            // استعادة حياة
            gameState.lives = 1;
            gameState.lifeRestoreEndTime = null;
            saveGameState();
            
            clearInterval(gameState.lifeRestoreTimeout);
            hideOverlay(elements.gameoverScreen);
            startLevel();
            return;
        }
        
        // تحديث العرض
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        elements.countdownDisplay.textContent = 
            String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    };
    
    updateCountdown();
    gameState.lifeRestoreTimeout = setInterval(updateCountdown, 1000);
}

/**
 * شراء حياة إضافية
 */
function buyLife() {
    if (gameState.coins >= CONFIG.lifeCost) {
        soundManager.playPurchaseSound();
        
        gameState.coins -= CONFIG.lifeCost;
        gameState.lives = 1;
        gameState.lifeRestoreEndTime = null;
        
        if (gameState.lifeRestoreTimeout) {
            clearInterval(gameState.lifeRestoreTimeout);
        }
        
        saveGameState();
        hideOverlay(elements.gameoverScreen);
        startLevel();
    }
}

// ===== وظائف المؤقت =====
/**
 * بدء المؤقت
 * @param {number} seconds - الوقت بالثواني
 */
function startTimer(seconds) {
    gameState.timeRemaining = seconds;
    updateTimerDisplay();
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        if (gameState.isPaused) return;
        
        gameState.timeRemaining--;
        updateTimerDisplay();
        
        // صوت تحذير عندما يقل الوقت عن 10 ثواني
        if (gameState.timeRemaining <= 10 && gameState.timeRemaining > 0) {
            soundManager.playTimerWarningSound();
        }
        
        if (gameState.timeRemaining <= 0) {
            stopTimer();
            handleTimeout();
        }
    }, 1000);
}

/**
 * إيقاف المؤقت
 */
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

/**
 * تحديث عرض المؤقت
 */
function updateTimerDisplay() {
    const level = getCurrentLevel();
    const percentage = (gameState.timeRemaining / level.timeLimit) * 100;
    
    elements.timerProgress.style.width = percentage + '%';
    elements.timerText.textContent = gameState.timeRemaining;
    
    // تغيير لون شريط الوقت حسب الوقت المتبقي
    if (percentage <= 20) {
        elements.timerProgress.style.background = 'var(--error-color)';
    } else if (percentage <= 50) {
        elements.timerProgress.style.background = 'var(--warning-color)';
    } else {
        elements.timerProgress.style.background = 'linear-gradient(90deg, var(--success-color), var(--warning-color), var(--error-color))';
    }
}

// ===== وظائف المساعدة =====
/**
 * عرض التلميح
 */
function showHint() {
    if (gameState.hintUsed || gameState.coins < CONFIG.hintCost) return;
    
    soundManager.playPurchaseSound();
    
    gameState.coins -= CONFIG.hintCost;
    gameState.hintUsed = true;
    
    const level = getCurrentLevel();
    elements.hintText.textContent = level.hint;
    
    saveGameState();
    updateDisplay();
    updateHelpButtons();
    
    elements.hintModal.classList.add('active');
}

/**
 * عرض الكشف الجزئي
 */
function showReveal() {
    if (gameState.revealUsed || gameState.coins < CONFIG.revealCost) return;
    
    soundManager.playPurchaseSound();
    
    gameState.coins -= CONFIG.revealCost;
    gameState.revealUsed = true;
    
    const level = getCurrentLevel();
    elements.revealText.textContent = level.reveal;
    
    saveGameState();
    updateDisplay();
    updateHelpButtons();
    
    elements.revealModal.classList.add('active');
}

/**
 * تخطي المستوى
 */
function skipLevel() {
    if (gameState.coins < CONFIG.skipCost) return;
    
    soundManager.playPurchaseSound();
    
    gameState.coins -= CONFIG.skipCost;
    gameState.currentLevel++;
    
    stopTimer();
    saveGameState();
    soundManager.stopBackgroundMusic();
    startLevel();
}

// ===== وظائف القائمة =====
/**
 * فتح قائمة الإيقاف المؤقت
 */
function openPauseMenu() {
    gameState.isPaused = true;
    soundManager.playClickSound();
    
    elements.pauseLevel.textContent = gameState.currentLevel;
    elements.pauseCoins.textContent = gameState.coins;
    elements.pauseLives.textContent = gameState.lives;
    elements.pauseSoundToggle.textContent = soundManager.enabled ? '🔊' : '🔇';
    
    elements.pauseMenu.classList.add('active');
}

/**
 * استئناف اللعب
 */
function resumeGame() {
    gameState.isPaused = false;
    soundManager.playClickSound();
    elements.pauseMenu.classList.remove('active');
}

/**
 * إعادة تشغيل المستوى
 */
function restartLevel() {
    soundManager.playClickSound();
    elements.pauseMenu.classList.remove('active');
    stopTimer();
    soundManager.stopBackgroundMusic();
    startLevel();
}

/**
 * الخروج للقائمة الرئيسية
 */
function quitToMenu() {
    soundManager.playClickSound();
    stopTimer();
    soundManager.stopBackgroundMusic();
    elements.pauseMenu.classList.remove('active');
    showScreen(elements.startScreen);
}

/**
 * تبديل حالة الصوت
 */
function toggleSound() {
    const enabled = soundManager.toggle();
    elements.soundIcon.textContent = enabled ? '🔊' : '🔇';
    elements.pauseSoundToggle.textContent = enabled ? '🔊' : '🔇';
    saveGameState();
}

// ===== وظائف العرض =====
/**
 * تحديث جميع عناصر العرض
 */
function updateDisplay() {
    elements.coinsDisplay.textContent = gameState.coins;
    elements.levelDisplay.textContent = gameState.currentLevel;
    elements.livesDisplay.textContent = gameState.lives;
}

/**
 * عرض شاشة النصر النهائية
 */
function showVictoryScreen() {
    soundManager.stopBackgroundMusic();
    soundManager.playWinSound();
    
    // يمكن إضافة شاشة نصر خاصة هنا
    alert('🎉 تهانينا! لقد أكملت جميع المستويات! 🏆\n\nمجموع عملاتك: ' + gameState.coins);
    
    // إعادة تعيين اللعبة
    gameState.currentLevel = 1;
    saveGameState();
    showScreen(elements.startScreen);
}

// ===== ربط الأحداث =====
function initializeEventListeners() {
    // أزرار شاشة البداية
    elements.playBtn.addEventListener('click', startNewGame);
    elements.continueBtn.addEventListener('click', continueGame);
    elements.soundToggle.addEventListener('click', toggleSound);
    
    // أزرار المساعدة
    elements.hintBtn.addEventListener('click', showHint);
    elements.revealBtn.addEventListener('click', showReveal);
    elements.skipBtn.addEventListener('click', skipLevel);
    
    // زر الإجابة (للألغاز النصية)
    elements.submitBtn.addEventListener('click', submitAnswer);
    elements.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitAnswer();
    });
    
    // أزرار القائمة
    elements.menuBtn.addEventListener('click', openPauseMenu);
    elements.resumeBtn.addEventListener('click', resumeGame);
    elements.restartBtn.addEventListener('click', restartLevel);
    elements.quitBtn.addEventListener('click', quitToMenu);
    elements.pauseSoundToggle.addEventListener('click', toggleSound);
    
    // إغلاق النوافذ المنبثقة
    elements.closeHint.addEventListener('click', () => {
        elements.hintModal.classList.remove('active');
    });
    elements.closeReveal.addEventListener('click', () => {
        elements.revealModal.classList.remove('active');
    });
    
    // أزرار شاشة الفوز
    elements.nextLevelBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        hideOverlay(elements.winScreen);
        startLevel();
    });
    
    // أزرار شاشة الخسارة
    elements.retryBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        hideOverlay(elements.loseScreen);
        startLevel();
    });
    
    // أزرار شاشة انتهاء الوقت
    elements.retryTimeoutBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        hideOverlay(elements.timeoutScreen);
        
        if (gameState.lives <= 0) {
            showGameOver();
        } else {
            startLevel();
        }
    });
    
    // أزرار شاشة انتهاء اللعبة
    elements.buyLifeBtn.addEventListener('click', buyLife);
    elements.homeBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        if (gameState.lifeRestoreTimeout) {
            clearInterval(gameState.lifeRestoreTimeout);
        }
        hideOverlay(elements.gameoverScreen);
        showScreen(elements.startScreen);
    });
    
    // إغلاق النوافذ عند النقر خارجها
    elements.hintModal.addEventListener('click', (e) => {
        if (e.target === elements.hintModal) {
            elements.hintModal.classList.remove('active');
        }
    });
    elements.revealModal.addEventListener('click', (e) => {
        if (e.target === elements.revealModal) {
            elements.revealModal.classList.remove('active');
        }
    });
}

// ===== تهيئة اللعبة =====
function initGame() {
    // تحميل البيانات المحفوظة
    const hasSavedData = loadGameState();
    
    // تحديث أيقونة الصوت
    elements.soundIcon.textContent = soundManager.enabled ? '🔊' : '🔇';
    
    // إظهار زر المتابعة إذا كان هناك تقدم محفوظ
    if (hasSavedData && gameState.currentLevel > 1) {
        elements.continueBtn.style.display = 'flex';
    }
    
    // ربط الأحداث
    initializeEventListeners();
    
    // عرض شاشة البداية
    showScreen(elements.startScreen);
    
    console.log('🧠 Mind Lock - تم تحميل اللعبة بنجاح!');
}

// بدء اللعبة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initGame);

// تهيئة الصوت عند أول تفاعل مع الصفحة (مطلوب لمتصفحات الموبايل)
document.addEventListener('touchstart', () => {
    soundManager.init();
}, { once: true });

document.addEventListener('click', () => {
    soundManager.init();
}, { once: true });
