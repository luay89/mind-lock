/**
 * Mind Lock - لعبة الألغاز الفكرية
 * ===================================
 * لعبة ألغاز تفاعلية مبنية بـ HTML, CSS, JavaScript
 * قابلة للتشغيل على المتصفحات و الموبايل عبر Capacitor
 * 
 * الأقسام:
 * 1. SoundManager - نظام الصوت
 * 2. LEVELS - بيانات المستويات
 * 3. CONFIG - إعدادات اللعبة
 * 4. GameState - حالة اللعبة المركزية
 * 5. Storage - وظائف التخزين المحلي
 * 6. Timer - نظام المؤقت
 * 7. UI Handlers - معالجات الواجهة
 * 8. Game Logic - منطق اللعبة
 * 9. Event Listeners - ربط الأحداث
 * 10. Initialization - تهيئة اللعبة
 */

// ============================================================
// 1. نظام الصوت (SoundManager)
// ============================================================
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

    playWinSound() {
        if (!this.enabled || !this.audioContext) return;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 'sine', 0.3, 0.4), index * 150);
        });
    }

    playLoseSound() {
        if (!this.enabled || !this.audioContext) return;
        const notes = [400, 350, 300, 250];
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 'triangle', 0.4, 0.3), index * 200);
        });
    }

    playPurchaseSound() {
        if (!this.enabled || !this.audioContext) return;
        const notes = [880, 1108.73, 1318.51];
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 'sine', 0.2, 0.3), index * 100);
        });
    }

    playClickSound() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(800, 'sine', 0.1, 0.2);
    }

    playWrongSound() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(200, 'sawtooth', 0.3, 0.3);
    }

    playCorrectSound() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(600, 'sine', 0.15, 0.3);
        setTimeout(() => this.playTone(800, 'sine', 0.15, 0.3), 100);
    }

    playTimerWarningSound() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(440, 'square', 0.1, 0.2);
    }

    startBackgroundMusic() {
        if (!this.enabled || !this.audioContext || this.backgroundMusic) return;

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

        const playLoop = () => {
            if (!this.enabled) return;
            
            const now = this.audioContext.currentTime;
            const notes = [261.63, 329.63, 392, 329.63];
            
            notes.forEach((note, i) => {
                playNote(note, now + i * 0.5, 0.4);
            });
            
            this.backgroundMusic = setTimeout(playLoop, 2000);
        };

        playLoop();
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            clearTimeout(this.backgroundMusic);
            this.backgroundMusic = null;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopBackgroundMusic();
        }
        return this.enabled;
    }
}

// ============================================================
// 2. بيانات المستويات (LEVELS)
// ============================================================
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
        explanation: '💡 هذه سلسلة الأرقام الزوجية! كل رقم يزيد بمقدار 2 عن سابقه: 2→4→6→8→10.',
        difficulty: 1,
        baseReward: 15,
        baseTimeLimit: 60
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
        explanation: '🧠 الترتيب المنطقي: أحمد > سعيد > خالد. إذاً خالد هو الأصغر!',
        difficulty: 1,
        baseReward: 20,
        baseTimeLimit: 50
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
        explanation: '📐 قاعدة PEMDAS: الضرب يأتي قبل الجمع! أولاً: 3×2=6، ثم: 5+6=11.',
        difficulty: 1,
        baseReward: 20,
        baseTimeLimit: 50
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
        explanation: '👁️ الحل: 6 مثلثات صغيرة + 3 متوسطة + 1 كبير = 10 مثلثات!',
        difficulty: 2,
        baseReward: 25,
        baseTimeLimit: 55
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
        explanation: '⏰ الساعة "تمشي" لأن عقاربها تتحرك!',
        difficulty: 2,
        baseReward: 25,
        baseTimeLimit: 45
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
        explanation: '🌀 هذه متتالية فيبوناتشي! كل رقم = مجموع الرقمين قبله: 5+8=13.',
        difficulty: 2,
        baseReward: 30,
        baseTimeLimit: 50
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
        explanation: '🏃 عندما تتجاوز الثاني، تأخذ مكانه وتصبح أنت الثاني (ليس الأول)!',
        difficulty: 3,
        baseReward: 30,
        baseTimeLimit: 45
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
        explanation: '🧮 🍎=4، 🍊=3، 🍋=2. المجموع: 4+3+2=9.',
        difficulty: 3,
        baseReward: 35,
        baseTimeLimit: 55
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
        explanation: '🔬 هذه خدعة مولر-لاير! الخطان متساويان تماماً.',
        difficulty: 3,
        baseReward: 35,
        baseTimeLimit: 40
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
        explanation: '🗺️ الخريطة تحتوي رموزاً للمدن والغابات والمياه!',
        difficulty: 4,
        baseReward: 40,
        baseTimeLimit: 50
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
        explanation: '📊 هذه قوى العدد 3: 3¹=3، 3²=9، 3³=27، 3⁴=81، 3⁵=243.',
        difficulty: 4,
        baseReward: 40,
        baseTimeLimit: 45
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
        explanation: '📖 "ماتت جميعها إلا 9" تعني أن 9 لم تمت = بقيت 9 خراف!',
        difficulty: 4,
        baseReward: 45,
        baseTimeLimit: 40
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
        explanation: '✨ نمط رياضي ساحر! الناتج يصعد من 1 إلى 9 ثم ينزل.',
        difficulty: 5,
        baseReward: 50,
        baseTimeLimit: 50
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
        explanation: '🕳️ الحفرة تكبر كلما أخذت (حفرت) منها أكثر!',
        difficulty: 5,
        baseReward: 50,
        baseTimeLimit: 45
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
        explanation: '♟️ عد المربعات بكل الأحجام: 64 + 49 + 36 + 25 + 16 + 9 + 4 + 1 = 204!',
        difficulty: 5,
        baseReward: 60,
        baseTimeLimit: 65
    }
];

// بنك الأسئلة: إذا كان questions/questionBank.js محمّل، سيتم استخدامه (300+ سؤال)
// وإلا سيتم استخدام الأسئلة الافتراضية داخل هذا الملف.
const QUESTIONS = window.MIND_LOCK_QUESTIONS || LEVELS;

// ============================================================
// 3. إعدادات اللعبة (CONFIG)
// ============================================================
const CONFIG = {
    // إعدادات أساسية
    initialLives: 3,
    initialCoins: 50,
    maxLives: 5,
    
    // تكاليف المساعدة
    hintCost: 10,
    revealCost: 25,
    skipCost: 50,
    lifeCost: 30,
    
    // إعدادات الوقت
    lifeRestoreTime: 5 * 60 * 1000, // 5 دقائق
    
    // مضاعفات المكافآت
    timeBonusMultiplier: 0.5,
    speedBonusThreshold: 0.5, // 50% من الوقت المتبقي للمكافأة الإضافية
    speedBonusMultiplier: 0.3,
    
    // معدلات الصعوبة التصاعدية
    difficultyScaling: {
        timeReduction: 0.05,    // تقليل الوقت 5% لكل مستوى
        rewardIncrease: 0.1,    // زيادة المكافأة 10% لكل مستوى
        maxTimeReduction: 0.4   // أقصى تقليل للوقت 40%
    },
    
    // مفتاح التخزين
    storageKey: 'mindLockSave'
};

// ============================================================
// 4. حالة اللعبة المركزية (GameState)
// ============================================================

/**
 * حالة اللعبة المركزية - Singleton Pattern
 * تدير جميع بيانات اللعبة في مكان واحد
 */
const GameState = {
    // بيانات اللاعب
    currentLevel: 1,
    coins: CONFIG.initialCoins,
    lives: CONFIG.initialLives,
    
    // بيانات الجولة الحالية
    timeRemaining: 60,
    roundStatus: 'idle', // 'idle' | 'playing' | 'win' | 'lose' | 'timeout' | 'paused' | 'checking'
    currentQuestionId: null, // السؤال الحالي (ID)
    
    // إدارة الأسئلة (منع التكرار داخل نفس الجلسة)
    usedQuestionIds: new Set(), // كل سؤال تم عرضه (صح أو خطأ) لا يعود مرة أخرى في نفس الجلسة
    
    // حالة المساعدات في المستوى الحالي
    hintUsed: false,
    revealUsed: false,
    skipUsed: false,
    
    // مراجع المؤقتات
    timerInterval: null,
    lifeRestoreTimeout: null,
    lifeRestoreEndTime: null,
    
    // إحصائيات الجلسة
    totalCorrectAnswers: 0,
    totalWrongAnswers: 0,
    fastAnswers: 0,
    
    /**
     * إعادة تعيين حالة اللعبة بالكامل
     */
    reset() {
        this.currentLevel = 1;
        this.coins = CONFIG.initialCoins;
        this.lives = CONFIG.initialLives;
        this.roundStatus = 'idle';
        this.resetRoundState();
        this.totalCorrectAnswers = 0;
        this.totalWrongAnswers = 0;
        this.fastAnswers = 0;
        this.usedQuestionIds = new Set();
        this.currentQuestionId = null;
    },
    
    /**
     * إعادة تعيين حالة الجولة فقط
     */
    resetRoundState() {
        this.hintUsed = false;
        this.revealUsed = false;
        this.skipUsed = false;
        this.roundStatus = 'idle';
    },
    
    /**
     * التحقق من إمكانية استخدام المساعدة
     */
    canUseHelp(type) {
        if (this.roundStatus !== 'playing') return false;
        
        switch (type) {
            case 'hint':
                return !this.hintUsed && this.coins >= CONFIG.hintCost;
            case 'reveal':
                return !this.revealUsed && this.coins >= CONFIG.revealCost;
            case 'skip':
                return this.coins >= CONFIG.skipCost;
            default:
                return false;
        }
    },
    
    /**
     * استخدام المساعدة وخصم العملات
     */
    useHelp(type) {
        if (!this.canUseHelp(type)) return false;
        
        switch (type) {
            case 'hint':
                this.coins -= CONFIG.hintCost;
                this.hintUsed = true;
                break;
            case 'reveal':
                this.coins -= CONFIG.revealCost;
                this.revealUsed = true;
                break;
            case 'skip':
                this.coins -= CONFIG.skipCost;
                this.skipUsed = true;
                break;
            default:
                return false;
        }
        return true;
    },
    
    /**
     * إضافة عملات
     */
    addCoins(amount) {
        this.coins += amount;
    },
    
    /**
     * خسارة حياة
     */
    loseLife() {
        this.lives = Math.max(0, this.lives - 1);
        return this.lives;
    },
    
    /**
     * إضافة حياة
     */
    addLife(amount = 1) {
        this.lives = Math.min(CONFIG.maxLives, this.lives + amount);
        return this.lives;
    },
    
    /**
     * التحقق من وجود حياة
     */
    hasLives() {
        return this.lives > 0;
    },
    
    /**
     * الانتقال للمستوى التالي
     */
    nextLevel() {
        this.currentLevel++;
        this.resetRoundState();
    },
    
    /**
     * الحصول على بيانات المستوى الحالي مع تطبيق الصعوبة التصاعدية
     * يستخدم getCurrentQuestionData للحصول على السؤال الحالي
     */
    getCurrentLevelData() {
        return this.getCurrentQuestionData();
    },
    
    /**
     * التحقق من اكتمال جميع المستويات
     */
    isGameComplete() {
        return this.currentLevel > this.getMaxLevel();
    },

    /**
     * أقصى مستوى موجود داخل بنك الأسئلة
     */
    getMaxLevel() {
        const levels = QUESTIONS.map(q => (q.level ?? q.id ?? 1));
        return levels.length ? Math.max(...levels) : 1;
    },

    /**
     * إرجاع الأسئلة الخاصة بمستوى محدد
     */
    getQuestionsForLevel(level) {
        return QUESTIONS.filter(q => (q.level ?? q.id) === level);
    },

    /**
     * اختيار سؤال عشوائي من نفس المستوى (بدون تكرار). 
     * إذا نفدت أسئلة المستوى، ينتقل تلقائياً للمستوى التالي.
     */
    getRandomQuestion() {
        const maxLevel = this.getMaxLevel();

        while (this.currentLevel <= maxLevel) {
            const candidates = this.getQuestionsForLevel(this.currentLevel)
                .filter(q => !this.usedQuestionIds.has(q.id));

            if (candidates.length === 0) {
                // نفدت أسئلة المستوى الحالي -> انتقل للمستوى التالي
                this.currentLevel++;
                continue;
            }

            const randomIndex = Math.floor(Math.random() * candidates.length);
            const picked = candidates[randomIndex];
            this.currentQuestionId = picked.id;
            this.usedQuestionIds.add(picked.id);
            return picked;
        }

        return null;
    },
    
    /**
     * الحصول على بيانات السؤال الحالي مع تطبيق الصعوبة التصاعدية
     */
    getCurrentQuestionData() {
        const question = QUESTIONS.find(l => l.id === this.currentQuestionId);
        if (!question) return null;

        // نظام صعوبة تصاعدي حقيقي حسب المستوى:
        // 1–5 سهل: وقت أطول
        // 6–15 متوسط: وقت أقل + خيارات متقاربة (يتم دعمها من بنك الأسئلة)
        // 16+ صعب: وقت أقل بشكل ملموس
        const level = this.currentLevel;

        const band = (level <= 5)
            ? { minTime: 35, rewardMult: 1.0 }
            : (level <= 15)
                ? { minTime: 25, rewardMult: 1.15 }
                : { minTime: 15, rewardMult: 1.35 };

        // تقليل تدريجي للوقت (تصاعدي) + دفعة تقليل إضافية بعد مستويات معينة
        const progressiveReduction = Math.min((level - 1) * 0.03, 0.55); // حتى 55%
        let timeLimit = Math.floor(question.baseTimeLimit * (1 - progressiveReduction));
        if (level >= 6 && level <= 15) timeLimit = Math.floor(timeLimit * 0.92);
        if (level >= 16) timeLimit = Math.floor(timeLimit * 0.85);
        timeLimit = Math.max(timeLimit, band.minTime);

        // مكافأة تصاعدية واضحة
        const rewardScale = 1 + (level - 1) * 0.08;
        const reward = Math.max(1, Math.floor(question.baseReward * rewardScale * band.rewardMult));

        return {
            ...question,
            timeLimit,
            reward
        };
    }
};

// ============================================================
// 5. نظام التخزين المحلي (Storage)
// ============================================================
const Storage = {
    /**
     * حفظ حالة اللعبة
     */
    save() {
        try {
            const dataToSave = {
                currentLevel: GameState.currentLevel,
                coins: GameState.coins,
                lives: GameState.lives,
                lifeRestoreEndTime: GameState.lifeRestoreEndTime,
                soundEnabled: soundManager.enabled,
                totalCorrectAnswers: GameState.totalCorrectAnswers,
                totalWrongAnswers: GameState.totalWrongAnswers,
                fastAnswers: GameState.fastAnswers,
                savedAt: Date.now()
            };
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(dataToSave));
            return true;
        } catch (e) {
            console.error('خطأ في حفظ البيانات:', e);
            return false;
        }
    },
    
    /**
     * تحميل حالة اللعبة
     */
    load() {
        try {
            const savedData = localStorage.getItem(CONFIG.storageKey);
            if (!savedData) return false;
            
            const data = JSON.parse(savedData);
            
            // استعادة البيانات
            GameState.currentLevel = data.currentLevel || 1;
            GameState.coins = data.coins ?? CONFIG.initialCoins;
            GameState.lives = data.lives ?? CONFIG.initialLives;
            GameState.lifeRestoreEndTime = data.lifeRestoreEndTime || null;
            GameState.totalCorrectAnswers = data.totalCorrectAnswers || 0;
            GameState.totalWrongAnswers = data.totalWrongAnswers || 0;
            GameState.fastAnswers = data.fastAnswers || 0;
            soundManager.enabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
            
            // التحقق من استعادة الحياة أثناء عدم اللعب
            this.checkLifeRestoration();
            
            return true;
        } catch (e) {
            console.error('خطأ في تحميل البيانات:', e);
            return false;
        }
    },
    
    /**
     * التحقق من استعادة الحياة
     */
    checkLifeRestoration() {
        if (GameState.lifeRestoreEndTime && GameState.lives < CONFIG.initialLives) {
            const now = Date.now();
            const timePassed = now - GameState.lifeRestoreEndTime;
            
            if (timePassed >= 0) {
                // حساب عدد الأرواح المستعادة
                const livesRestored = Math.floor(timePassed / CONFIG.lifeRestoreTime) + 1;
                GameState.addLife(livesRestored);
                GameState.lifeRestoreEndTime = null;
                this.save();
            }
        }
    },
    
    /**
     * التحقق من وجود بيانات محفوظة
     */
    hasSavedData() {
        try {
            const savedData = localStorage.getItem(CONFIG.storageKey);
            if (!savedData) return false;
            
            const data = JSON.parse(savedData);
            return data.currentLevel > 1 || data.coins !== CONFIG.initialCoins;
        } catch (e) {
            return false;
        }
    },
    
    /**
     * مسح البيانات المحفوظة
     */
    clear() {
        try {
            localStorage.removeItem(CONFIG.storageKey);
            return true;
        } catch (e) {
            console.error('خطأ في مسح البيانات:', e);
            return false;
        }
    }
};

// ============================================================
// 6. نظام المؤقت (Timer)
// ============================================================
const Timer = {
    /**
     * بدء المؤقت
     */
    start(seconds) {
        // إيقاف أي مؤقت سابق أولاً
        this.stop();
        
        GameState.timeRemaining = seconds;
        this.updateDisplay();
        
        GameState.timerInterval = setInterval(() => {
            // لا تعمل إذا كانت اللعبة متوقفة مؤقتاً
            if (GameState.roundStatus === 'paused') return;
            
            GameState.timeRemaining--;
            this.updateDisplay();
            
            // صوت تحذير عندما يقل الوقت عن 10 ثواني
            if (GameState.timeRemaining <= 10 && GameState.timeRemaining > 0) {
                soundManager.playTimerWarningSound();
            }
            
            // انتهاء الوقت
            if (GameState.timeRemaining <= 0) {
                this.stop();
                GameLogic.handleTimeout();
            }
        }, 1000);
    },
    
    /**
     * إيقاف المؤقت
     */
    stop() {
        if (GameState.timerInterval) {
            clearInterval(GameState.timerInterval);
            GameState.timerInterval = null;
        }
    },
    
    /**
     * إيقاف مؤقت (pause)
     */
    pause() {
        // لا نوقف الـ interval، فقط نغير الحالة
        GameState.roundStatus = 'paused';
    },
    
    /**
     * استئناف المؤقت
     */
    resume() {
        GameState.roundStatus = 'playing';
    },
    
    /**
     * تحديث عرض المؤقت
     */
    updateDisplay() {
        const level = GameState.getCurrentLevelData();
        if (!level) return;
        
        const percentage = (GameState.timeRemaining / level.timeLimit) * 100;
        
        elements.timerProgress.style.width = percentage + '%';
        elements.timerText.textContent = GameState.timeRemaining;
        
        // تغيير لون شريط الوقت حسب الوقت المتبقي
        if (percentage <= 20) {
            elements.timerProgress.style.background = 'var(--error-color)';
        } else if (percentage <= 50) {
            elements.timerProgress.style.background = 'var(--warning-color)';
        } else {
            elements.timerProgress.style.background = 'linear-gradient(90deg, var(--success-color), var(--warning-color), var(--error-color))';
        }
    }
};

// ============================================================
// 7. معالجات الواجهة (UI)
// ============================================================
const UI = {
    /**
     * إخفاء جميع الشاشات
     */
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    },
    
    /**
     * عرض شاشة معينة
     */
    showScreen(screen) {
        this.hideAllScreens();
        if (screen) screen.classList.add('active');
    },
    
    /**
     * عرض شاشة فوق الشاشة الحالية
     */
    showOverlay(screen) {
        if (screen) screen.classList.add('active');
    },
    
    /**
     * إخفاء شاشة overlay
     */
    hideOverlay(screen) {
        if (screen) screen.classList.remove('active');
    },
    
    /**
     * تحديث جميع عناصر العرض
     */
    updateDisplay() {
        elements.coinsDisplay.textContent = GameState.coins;
        elements.levelDisplay.textContent = GameState.currentLevel;
        elements.livesDisplay.textContent = GameState.lives;
        
        // تحديث أزرار المساعدة
        this.updateHelpButtons();
    },
    
    /**
     * تحديث حالة أزرار المساعدة
     */
    updateHelpButtons() {
        const isPlaying = GameState.roundStatus === 'playing';
        
        // زر التلميح
        elements.hintBtn.disabled = !isPlaying || !GameState.canUseHelp('hint');
        elements.hintBtn.classList.toggle('used', GameState.hintUsed);
        
        // زر الكشف
        elements.revealBtn.disabled = !isPlaying || !GameState.canUseHelp('reveal');
        elements.revealBtn.classList.toggle('used', GameState.revealUsed);
        
        // زر التخطي
        elements.skipBtn.disabled = !isPlaying || !GameState.canUseHelp('skip');
    },
    
    /**
     * عرض اللغز على الشاشة
     */
    displayPuzzle(level) {
        // تحديث نوع اللغز
        elements.puzzleType.textContent = level.typeName;
        
        // تحديث السؤال
        elements.puzzleQuestion.textContent = level.question;
        
        // إعداد الخيارات
        if (level.options) {
            elements.inputArea.style.display = 'none';
            elements.submitBtn.style.display = 'none';
            elements.optionsArea.style.display = 'grid';
            
            // إنشاء أزرار الخيارات
            elements.optionsArea.innerHTML = '';
            level.options.forEach((option) => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = option;
                btn.addEventListener('click', () => GameLogic.selectOption(btn, option));
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
    },
    
    /**
     * عرض شاشة الفوز
     */
    showWinScreen(reward, timeBonus, explanation) {
        elements.rewardAmount.textContent = '+' + (reward + timeBonus);
        elements.timeBonus.textContent = GameState.timeRemaining + ' ثانية (+' + timeBonus + ' 💰)';
        
        if (explanation) {
            elements.explanationText.textContent = explanation;
            elements.explanationBox.style.display = 'block';
        } else {
            elements.explanationBox.style.display = 'none';
        }
        
        this.showOverlay(elements.winScreen);
    },
    
    /**
     * عرض شاشة الخسارة
     */
    showLoseScreen() {
        elements.remainingLives.textContent = GameState.lives;
        this.showOverlay(elements.loseScreen);
    },
    
    /**
     * عرض شاشة انتهاء الوقت
     */
    showTimeoutScreen(correctAnswer) {
        elements.correctAnswerTimeout.textContent = correctAnswer;
        this.showOverlay(elements.timeoutScreen);
    },
    
    /**
     * عرض شاشة انتهاء المحاولات
     */
    showGameOverScreen() {
        this.showOverlay(elements.gameoverScreen);
        GameLogic.startLifeRestoreCountdown();
    },
    
    /**
     * تحديث قائمة الإيقاف المؤقت
     */
    updatePauseMenu() {
        elements.pauseLevel.textContent = GameState.currentLevel;
        elements.pauseCoins.textContent = GameState.coins;
        elements.pauseLives.textContent = GameState.lives;
        elements.pauseSoundToggle.textContent = soundManager.enabled ? '🔊' : '🔇';
    },
    
    /**
     * تحديث أيقونة الصوت
     */
    updateSoundIcon() {
        const icon = soundManager.enabled ? '🔊' : '🔇';
        elements.soundIcon.textContent = icon;
        elements.pauseSoundToggle.textContent = icon;
    }
};

// ============================================================
// 8. منطق اللعبة (GameLogic)
// ============================================================
const GameLogic = {
    /**
     * بدء لعبة جديدة
     */
    startNewGame() {
        soundManager.init();
        soundManager.playClickSound();
        
        GameState.reset();
        Storage.save();
        
        this.startLevel();
    },
    
    /**
     * متابعة اللعب من آخر مستوى
     */
    continueGame() {
        soundManager.init();
        soundManager.playClickSound();
        
        this.startLevel();
    },
    
    /**
     * بدء مستوى جديد
     */
    startLevel() {
        // إيقاف أي مؤقتات سابقة
        Timer.stop();
        
        // إعادة تعيين حالة الجولة
        GameState.resetRoundState();
        GameState.roundStatus = 'playing';
        
        // الحصول على سؤال عشوائي من المستوى المناسب
        const question = GameState.getRandomQuestion();
        if (!question) {
            this.showVictoryScreen();
            return;
        }
        
        // الحصول على بيانات السؤال مع الصعوبة التصاعدية
        const level = GameState.getCurrentLevelData();
        
        // تحديث العرض
        UI.updateDisplay();
        
        // عرض شاشة اللعب
        UI.showScreen(elements.gameScreen);
        
        // عرض اللغز
        UI.displayPuzzle(level);
        
        // بدء المؤقت
        Timer.start(level.timeLimit);
        
        // بدء الموسيقى الخلفية
        soundManager.startBackgroundMusic();
    },
    
    /**
     * اختيار إجابة من الخيارات
     */
    selectOption(btn, answer) {
        if (GameState.roundStatus !== 'playing') return;
        
        soundManager.playClickSound();
        
        // إيقاف قبول الإجابات
        GameState.roundStatus = 'checking';
        
        // تحديد الخيار
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        // التحقق من الإجابة بعد تأخير قصير
        setTimeout(() => {
            this.checkAnswer(answer, btn);
        }, 300);
    },
    
    /**
     * تأكيد الإجابة (للألغاز النصية)
     */
    submitAnswer() {
        if (GameState.roundStatus !== 'playing') return;
        
        const answer = elements.answerInput.value.trim();
        if (!answer) return;
        
        soundManager.playClickSound();
        GameState.roundStatus = 'checking';
        
        this.checkAnswer(answer, null);
    },
    
    /**
     * التحقق من صحة الإجابة
     */
    checkAnswer(answer, btn) {
        const level = GameState.getCurrentLevelData();
        const isCorrect = answer.toString().toLowerCase() === level.answer.toString().toLowerCase();
        
        if (isCorrect) {
            if (btn) btn.classList.add('correct');
            soundManager.playCorrectSound();
            
            setTimeout(() => {
                this.handleCorrectAnswer();
            }, 500);
        } else {
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
                this.handleWrongAnswer();
            }, 1000);
        }
    },
    
    /**
     * معالجة الإجابة الصحيحة
     */
    handleCorrectAnswer() {
        Timer.stop();
        
        const level = GameState.getCurrentLevelData();
        GameState.roundStatus = 'win';
        
        // حساب المكافأة
        const timeBonus = Math.floor(GameState.timeRemaining * CONFIG.timeBonusMultiplier);
        let totalReward = level.reward + timeBonus;
        
        // مكافأة إضافية للإجابة السريعة
        const timePercentage = GameState.timeRemaining / level.timeLimit;
        if (timePercentage >= CONFIG.speedBonusThreshold) {
            const speedBonus = Math.floor(level.reward * CONFIG.speedBonusMultiplier);
            totalReward += speedBonus;
            GameState.fastAnswers++;
        }
        
        // تحديث الإحصائيات
        GameState.totalCorrectAnswers++;
        GameState.addCoins(totalReward);
        GameState.nextLevel();
        
        // حفظ التقدم
        Storage.save();
        
        // إيقاف الموسيقى وتشغيل صوت الفوز
        soundManager.stopBackgroundMusic();
        soundManager.playWinSound();
        
        // عرض شاشة الفوز
        UI.showWinScreen(level.reward, timeBonus, level.explanation);
    },
    
    /**
     * معالجة الإجابة الخاطئة
     * يتم الانتقال لسؤال جديد بدلاً من إعادة نفس السؤال
     */
    handleWrongAnswer() {
        Timer.stop();
        
        GameState.roundStatus = 'lose';
        GameState.totalWrongAnswers++;
        GameState.loseLife();
        
        // السؤال لن يتكرر لأنه تمت إضافته إلى usedQuestionIds عند اختياره
        
        Storage.save();
        
        soundManager.stopBackgroundMusic();
        soundManager.playLoseSound();
        
        if (!GameState.hasLives()) {
            this.showGameOver();
        } else {
            UI.showLoseScreen();
        }
    },
    
    /**
     * معالجة انتهاء الوقت
     */
    handleTimeout() {
        const level = GameState.getCurrentLevelData();
        
        GameState.roundStatus = 'timeout';
        GameState.totalWrongAnswers++;
        GameState.loseLife();
        
        Storage.save();
        
        soundManager.stopBackgroundMusic();
        soundManager.playLoseSound();
        
        if (!GameState.hasLives()) {
            this.showGameOver();
        } else {
            UI.showTimeoutScreen(level.answer);
        }
    },
    
    /**
     * عرض شاشة انتهاء اللعبة
     */
    showGameOver() {
        // بدء عداد استعادة الحياة
        GameState.lifeRestoreEndTime = Date.now() + CONFIG.lifeRestoreTime;
        Storage.save();
        
        UI.showGameOverScreen();
    },
    
    /**
     * بدء عداد استعادة الحياة
     */
    startLifeRestoreCountdown() {
        // إيقاف أي عداد سابق
        if (GameState.lifeRestoreTimeout) {
            clearInterval(GameState.lifeRestoreTimeout);
        }
        
        const updateCountdown = () => {
            const remaining = GameState.lifeRestoreEndTime - Date.now();
            
            if (remaining <= 0) {
                // استعادة حياة
                GameState.addLife(1);
                GameState.lifeRestoreEndTime = null;
                Storage.save();
                
                clearInterval(GameState.lifeRestoreTimeout);
                GameState.lifeRestoreTimeout = null;
                
                UI.hideOverlay(elements.gameoverScreen);
                this.startLevel();
                return;
            }
            
            // تحديث العرض
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            elements.countdownDisplay.textContent = 
                String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        };
        
        updateCountdown();
        GameState.lifeRestoreTimeout = setInterval(updateCountdown, 1000);
    },
    
    /**
     * شراء حياة إضافية
     */
    buyLife() {
        if (GameState.coins < CONFIG.lifeCost) return;
        
        soundManager.playPurchaseSound();
        
        GameState.coins -= CONFIG.lifeCost;
        GameState.addLife(1);
        GameState.lifeRestoreEndTime = null;
        
        if (GameState.lifeRestoreTimeout) {
            clearInterval(GameState.lifeRestoreTimeout);
            GameState.lifeRestoreTimeout = null;
        }
        
        Storage.save();
        
        UI.hideOverlay(elements.gameoverScreen);
        this.startLevel();
    },
    
    /**
     * عرض التلميح
     */
    showHint() {
        if (!GameState.useHelp('hint')) return;
        
        soundManager.playPurchaseSound();
        
        const level = GameState.getCurrentLevelData();
        elements.hintText.textContent = level.hint;
        
        Storage.save();
        UI.updateDisplay();
        
        elements.hintModal.classList.add('active');
    },
    
    /**
     * عرض الكشف الجزئي
     */
    showReveal() {
        if (!GameState.useHelp('reveal')) return;
        
        soundManager.playPurchaseSound();
        
        const level = GameState.getCurrentLevelData();
        elements.revealText.textContent = level.reveal;
        
        Storage.save();
        UI.updateDisplay();
        
        elements.revealModal.classList.add('active');
    },
    
    /**
     * تخطي المستوى
     */
    skipLevel() {
        if (!GameState.useHelp('skip')) return;
        
        soundManager.playPurchaseSound();
        
        Timer.stop();
        GameState.nextLevel();
        
        Storage.save();
        soundManager.stopBackgroundMusic();
        
        this.startLevel();
    },
    
    /**
     * فتح قائمة الإيقاف المؤقت
     */
    openPauseMenu() {
        if (GameState.roundStatus === 'playing') {
            Timer.pause();
        }
        
        soundManager.playClickSound();
        UI.updatePauseMenu();
        elements.pauseMenu.classList.add('active');
    },
    
    /**
     * استئناف اللعب
     */
    resumeGame() {
        Timer.resume();
        soundManager.playClickSound();
        elements.pauseMenu.classList.remove('active');
    },
    
    /**
     * إعادة تشغيل المستوى
     */
    restartLevel() {
        soundManager.playClickSound();
        elements.pauseMenu.classList.remove('active');
        
        Timer.stop();
        soundManager.stopBackgroundMusic();
        
        this.startLevel();
    },
    
    /**
     * الخروج للقائمة الرئيسية
     */
    quitToMenu() {
        soundManager.playClickSound();
        
        Timer.stop();
        soundManager.stopBackgroundMusic();
        GameState.roundStatus = 'idle';
        
        elements.pauseMenu.classList.remove('active');
        UI.showScreen(elements.startScreen);
    },
    
    /**
     * تبديل حالة الصوت
     */
    toggleSound() {
        soundManager.toggle();
        UI.updateSoundIcon();
        Storage.save();
    },
    
    /**
     * عرض شاشة النصر النهائية
     */
    showVictoryScreen() {
        soundManager.stopBackgroundMusic();
        soundManager.playWinSound();
        
        // عرض رسالة النصر
        const message = `🎉 تهانينا! لقد أكملت جميع المستويات! 🏆\n\n` +
            `مجموع عملاتك: ${GameState.coins} 💰\n` +
            `إجابات صحيحة: ${GameState.totalCorrectAnswers}\n` +
            `إجابات سريعة: ${GameState.fastAnswers}`;
        
        alert(message);
        
        // إعادة تعيين اللعبة
        GameState.currentLevel = 1;
        Storage.save();
        
        UI.showScreen(elements.startScreen);
    }
};

// ============================================================
// 9. مدير الصوت (إنشاء instance)
// ============================================================
const soundManager = new SoundManager();

// ============================================================
// 10. عناصر DOM
// ============================================================
let elements = {};

/**
 * تهيئة مراجع عناصر DOM
 */
function initializeElements() {
    elements = {
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
}

// ============================================================
// 11. ربط الأحداث (Event Listeners)
// ============================================================
function initializeEventListeners() {
    // ===== أزرار شاشة البداية =====
    elements.playBtn.addEventListener('click', () => GameLogic.startNewGame());
    elements.continueBtn.addEventListener('click', () => GameLogic.continueGame());
    elements.soundToggle.addEventListener('click', () => GameLogic.toggleSound());
    
    // ===== أزرار المساعدة =====
    elements.hintBtn.addEventListener('click', () => GameLogic.showHint());
    elements.revealBtn.addEventListener('click', () => GameLogic.showReveal());
    elements.skipBtn.addEventListener('click', () => GameLogic.skipLevel());
    
    // ===== زر الإجابة (للألغاز النصية) =====
    elements.submitBtn.addEventListener('click', () => GameLogic.submitAnswer());
    elements.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') GameLogic.submitAnswer();
    });
    
    // ===== أزرار القائمة =====
    elements.menuBtn.addEventListener('click', () => GameLogic.openPauseMenu());
    elements.resumeBtn.addEventListener('click', () => GameLogic.resumeGame());
    elements.restartBtn.addEventListener('click', () => GameLogic.restartLevel());
    elements.quitBtn.addEventListener('click', () => GameLogic.quitToMenu());
    elements.pauseSoundToggle.addEventListener('click', () => GameLogic.toggleSound());
    
    // ===== إغلاق النوافذ المنبثقة =====
    elements.closeHint.addEventListener('click', () => {
        elements.hintModal.classList.remove('active');
    });
    elements.closeReveal.addEventListener('click', () => {
        elements.revealModal.classList.remove('active');
    });
    
    // ===== أزرار شاشة الفوز =====
    elements.nextLevelBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        UI.hideOverlay(elements.winScreen);
        GameLogic.startLevel();
    });
    
    // ===== أزرار شاشة الخسارة =====
    elements.retryBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        UI.hideOverlay(elements.loseScreen);
        GameLogic.startLevel();
    });
    
    // ===== أزرار شاشة انتهاء الوقت =====
    elements.retryTimeoutBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        UI.hideOverlay(elements.timeoutScreen);
        
        if (!GameState.hasLives()) {
            GameLogic.showGameOver();
        } else {
            GameLogic.startLevel();
        }
    });
    
    // ===== أزرار شاشة انتهاء اللعبة =====
    elements.buyLifeBtn.addEventListener('click', () => GameLogic.buyLife());
    elements.homeBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        
        if (GameState.lifeRestoreTimeout) {
            clearInterval(GameState.lifeRestoreTimeout);
            GameState.lifeRestoreTimeout = null;
        }
        
        UI.hideOverlay(elements.gameoverScreen);
        UI.showScreen(elements.startScreen);
    });
    
    // ===== إغلاق النوافذ عند النقر خارجها =====
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
    
    // ===== معالجة إغلاق الصفحة =====
    window.addEventListener('beforeunload', () => {
        Storage.save();
    });
    
    // ===== معالجة visibility change (للموبايل) =====
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // حفظ عند إخفاء الصفحة
            Storage.save();
            if (GameState.roundStatus === 'playing') {
                Timer.pause();
            }
        } else {
            // استئناف عند العودة (إذا كانت اللعبة في وضع الإيقاف المؤقت)
            if (GameState.roundStatus === 'paused' && !elements.pauseMenu.classList.contains('active')) {
                Timer.resume();
            }
        }
    });
}

// ============================================================
// 12. تهيئة اللعبة (Initialization)
// ============================================================
function initGame() {
    // تهيئة مراجع DOM
    initializeElements();
    
    // تحميل البيانات المحفوظة
    const hasSavedData = Storage.load();
    
    // تحديث أيقونة الصوت
    UI.updateSoundIcon();
    
    // إظهار زر المتابعة إذا كان هناك تقدم محفوظ
    if (hasSavedData && Storage.hasSavedData()) {
        elements.continueBtn.style.display = 'flex';
    } else {
        elements.continueBtn.style.display = 'none';
    }
    
    // ربط الأحداث
    initializeEventListeners();
    
    // عرض شاشة البداية
    UI.showScreen(elements.startScreen);
    
    console.log('🧠 Mind Lock - تم تحميل اللعبة بنجاح!');
    console.log(`📊 المستوى الحالي: ${GameState.currentLevel}`);
    console.log(`💰 العملات: ${GameState.coins}`);
    console.log(`❤️ المحاولات: ${GameState.lives}`);
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
