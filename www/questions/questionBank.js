/*
 * Mind Lock - Question Bank
 * -------------------------
 * ملف مستقل للأسئلة (قابل للتوسعة بسهولة).
 * يولّد 300 سؤال (30 مستوى × 10 أسئلة) بتدرج صعوبة حقيقي:
 * - المستوى 1–5: سهل
 * - المستوى 6–15: متوسط
 * - المستوى 16+: صعب
 */

(function () {
    'use strict';

    const TYPE_NAMES = {
        math: 'لغز رياضي',
        sequence: 'تسلسل أرقام',
        logic: 'لغز منطقي',
        riddle: 'لغز ذكاء',
        analysis: 'تحليل',
        speed: 'سرعة بديهة'
    };

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function uniqueStrings(arr) {
        const seen = new Set();
        const out = [];
        for (const x of arr) {
            const s = String(x);
            if (!seen.has(s)) {
                seen.add(s);
                out.push(s);
            }
        }
        return out;
    }

    function makeOptions(correct, distractors) {
        const all = uniqueStrings([correct, ...distractors]).slice(0, 4);
        while (all.length < 4) {
            all.push(String(Number(correct) + (all.length + 1)));
        }
        return shuffle(all);
    }

    function bandForLevel(level) {
        if (level <= 5) {
            return { band: 'easy', difficulty: 1, baseReward: 15, baseTimeLimit: 75 };
        }
        if (level <= 15) {
            return { band: 'medium', difficulty: 3, baseReward: 25, baseTimeLimit: 55 };
        }
        return { band: 'hard', difficulty: 5, baseReward: 40, baseTimeLimit: 40 };
    }

    function genEasyMath(a, b) {
        const correct = a + b;
        return {
            q: `كم ناتج: ${a} + ${b} ؟`,
            answer: String(correct),
            options: makeOptions(String(correct), [correct + 1, correct - 1, correct + 2])
        };
    }

    function genMediumMath(a, b, c) {
        const correct = a + b * c;
        return {
            q: `أكمل:\n\n${a} + ${b} × ${c} = ؟`,
            answer: String(correct),
            options: makeOptions(String(correct), [
                (a + b) * c,
                a * b + c,
                a + b + c
            ])
        };
    }

    function genHardMath(a, b) {
        const x = Math.floor((b - a) / 2);
        const correct = x;
        return {
            q: `إذا كان: 2x + ${a} = ${b}\n\nفما قيمة x ؟`,
            answer: String(correct),
            options: makeOptions(String(correct), [correct + 1, correct - 1, correct + 2])
        };
    }

    function genArithmeticSequence(start, step, length) {
        const seq = [];
        for (let i = 0; i < length; i++) seq.push(start + i * step);
        const correct = start + length * step;
        return {
            q: `ما هو الرقم التالي في السلسلة؟\n\n${seq.join(', ')}, ؟`,
            answer: String(correct),
            options: makeOptions(String(correct), [correct + step, correct - step, correct + 2 * step])
        };
    }

    function genGeometricSequence(start, ratio, length) {
        const seq = [];
        let v = start;
        for (let i = 0; i < length; i++) {
            seq.push(v);
            v *= ratio;
        }
        const correct = v;
        return {
            q: `ما هو الرقم التالي؟\n\n${seq.join(', ')}, ؟`,
            answer: String(correct),
            options: makeOptions(String(correct), [correct * ratio, correct / ratio, correct + start])
        };
    }

    function genLogicOrder(names) {
        const [a, b, c] = names;
        return {
            q: `إذا كان ${a} أكبر من ${b}، و${b} أكبر من ${c}.\nمن هو الأصغر؟`,
            answer: c,
            options: shuffle([a, b, c, 'لا يمكن تحديد'])
        };
    }

    function genLogicRace() {
        return {
            q: 'في سباق، تجاوزت الشخص الثاني.\nفي أي مركز أنت الآن؟',
            answer: 'الثاني',
            options: shuffle(['الأول', 'الثاني', 'الثالث', 'الرابع'])
        };
    }

    const RIDDLES = [
        { q: 'ما الشيء الذي كلما أخذت منه أكثر، كبر أكثر؟', a: 'الحفرة', opts: ['الحفرة', 'الجوع', 'العطش', 'الوقت'] },
        { q: 'ما الشيء الذي يكتب ولا يقرأ؟', a: 'القلم', opts: ['القلم', 'الكتاب', 'الورق', 'العين'] },
        { q: 'شيء له أسنان ولا يعض. ما هو؟', a: 'المشط', opts: ['المشط', 'الكلب', 'المنشار', 'الذئب'] },
        { q: 'شيء يمشي بلا أرجل ويبكي بلا عيون. ما هو؟', a: 'السحاب', opts: ['السحاب', 'الوقت', 'الريح', 'المطر'] },
        { q: 'بيت بلا أبواب ولا نوافذ، فما هو؟', a: 'البيضة', opts: ['البيضة', 'القوقعة', 'الخيمة', 'الكتاب'] },
        { q: 'شيء كلما زاد نقص. ما هو؟', a: 'العمر', opts: ['العمر', 'المال', 'الذكاء', 'الضوء'] },
        { q: 'ما الشيء الذي تسمعه ولا تراه، وإذا رأيته لا تسمعه؟', a: 'الهواء', opts: ['الهواء', 'الصوت', 'الظل', 'الموسيقى'] },
        { q: 'ما الشيء الذي يوجد في القرن مرة وفي الدقيقة مرتين ولا يوجد في الساعة؟', a: 'حرف القاف', opts: ['حرف القاف', 'حرف الألف', 'حرف الميم', 'حرف السين'] },
        { q: 'شيء يطير بلا جناح، ويبكي بلا عين. ما هو؟', a: 'الدخان', opts: ['الدخان', 'الطائرة', 'السحاب', 'العطر'] },
        { q: 'ما الشيء الذي إذا دخل الماء لا يبتل؟', a: 'الضوء', opts: ['الضوء', 'الورق', 'الخشب', 'القطن'] }
    ];

    function genRiddle(index) {
        const r = RIDDLES[index % RIDDLES.length];
        return {
            q: r.q,
            answer: r.a,
            options: shuffle(r.opts)
        };
    }

    function genSpeedCompare(a, b, c, d) {
        const nums = [a, b, c, d];
        const max = Math.max(...nums);
        return {
            q: `سرعة بديهة: اختر العدد الأكبر\n\n${nums.join('  -  ')}`,
            answer: String(max),
            options: shuffle(nums.map(String))
        };
    }

    function genAnalysisPattern(a, b, c) {
        const k = b - a;
        const correct = c + k;
        return {
            q: `تحليل: إذا كان\n1 ↦ ${a}\n2 ↦ ${b}\n3 ↦ ${c}\n\nفما قيمة 4 ↦ ؟`,
            answer: String(correct),
            options: makeOptions(String(correct), [correct + 1, correct - 1, correct + 2])
        };
    }

    function buildQuestions() {
        const questions = [];
        let id = 1;

        const nameTriples = [
            ['أحمد', 'سعيد', 'خالد'],
            ['ليلى', 'نور', 'سارة'],
            ['عمر', 'ياسر', 'حاتم'],
            ['هند', 'ريم', 'مها']
        ];

        for (let level = 1; level <= 30; level++) {
            const band = bandForLevel(level);

            for (let i = 0; i < 10; i++) {
                const typeOrder = ['math', 'sequence', 'logic', 'math', 'analysis', 'sequence', 'speed', 'logic', 'riddle', 'math'];
                const type = typeOrder[i % typeOrder.length];

                const base = level * 3 + i;
                const a = base + 2;
                const b = base + 5;
                const c = (base % 7) + 2;

                let payload;
                let hint = '';
                let reveal = '';
                let explanation = '';

                if (type === 'math') {
                    if (band.band === 'easy') {
                        payload = genEasyMath(a, c);
                        hint = 'اجمع الرقمين مباشرة.';
                        reveal = 'عملية جمع بسيطة.';
                        explanation = `لأن ${a} + ${c} = ${payload.answer}.`;
                    } else if (band.band === 'medium') {
                        payload = genMediumMath(a, c, 2);
                        hint = 'تذكر ترتيب العمليات (الضرب قبل الجمع).';
                        reveal = 'ابدأ بالضرب ثم اجمع.';
                        explanation = `أولاً: ${c}×2=${c * 2} ثم: ${a}+${c * 2}=${payload.answer}.`;
                    } else {
                        const b2 = a + 2 * ((level % 9) + 2);
                        payload = genHardMath(a, b2);
                        hint = 'اعزل x في طرف لوحده.';
                        reveal = 'اطرح ثم اقسم على 2.';
                        explanation = `2x = ${b2}-${a} ⇒ x = (${b2}-${a})÷2 = ${payload.answer}.`;
                    }
                } else if (type === 'sequence') {
                    if (band.band === 'easy') {
                        payload = genArithmeticSequence(2 + level, 2, 4);
                        hint = 'أضف نفس العدد كل مرة.';
                        reveal = 'زيادة ثابتة.';
                        explanation = `السلسلة تزيد بخطوة ثابتة، والرقم التالي هو ${payload.answer}.`;
                    } else if (band.band === 'medium') {
                        payload = genArithmeticSequence(3 + level, 3, 4);
                        hint = 'راقب الفرق بين الأرقام.';
                        reveal = 'الفرق ثابت.';
                        explanation = `الفرق = 3، لذلك التالي هو ${payload.answer}.`;
                    } else {
                        payload = genGeometricSequence(2 + (level % 3), 2, 4);
                        hint = 'قد تكون ضرباً وليس جمعاً.';
                        reveal = 'كل مرة ×2.';
                        explanation = `هذه متتالية هندسية (×2)، التالي هو ${payload.answer}.`;
                    }
                } else if (type === 'logic') {
                    if (i % 2 === 0) {
                        payload = genLogicOrder(nameTriples[(level + i) % nameTriples.length]);
                        hint = 'رتّب من الأكبر إلى الأصغر.';
                        reveal = 'الأصغر هو الأخير في الترتيب.';
                        explanation = `بما أن الأول أكبر من الثاني والثاني أكبر من الثالث، فالأصغر هو: ${payload.answer}.`;
                    } else {
                        payload = genLogicRace();
                        hint = 'عندما تتجاوز شخصاً تأخذ مكانه.';
                        reveal = 'أنت مكان الثاني.';
                        explanation = 'أنت تجاوزت الثاني فأخذت مكانه = الثاني.';
                    }
                } else if (type === 'analysis') {
                    payload = genAnalysisPattern(3 + level, 6 + level, 9 + level);
                    hint = 'ابحث عن الفرق الثابت بين النتائج.';
                    reveal = 'الزيادة ثابتة.';
                    explanation = `القاعدة زيادة ثابتة (+${(6 + level) - (3 + level)}). لذلك الناتج ${payload.answer}.`;
                } else if (type === 'speed') {
                    payload = genSpeedCompare(a, b, a + 7, b + 4);
                    hint = 'قارن بسرعة: الأكبر هو الأعلى قيمة.';
                    reveal = 'اختر أكبر رقم.';
                    explanation = `الأكبر هو ${payload.answer}.`;
                } else {
                    payload = genRiddle(level * 10 + i);
                    hint = 'فكر في المعنى المجازي للسؤال.';
                    reveal = 'الإجابة كلمة واحدة غالباً.';
                    explanation = `الإجابة هي: ${payload.answer}.`;
                }

                questions.push({
                    id: id++,
                    level,
                    type,
                    typeName: TYPE_NAMES[type] || 'لغز',
                    question: payload.q,
                    options: payload.options,
                    answer: payload.answer,
                    hint,
                    reveal,
                    explanation,
                    difficulty: band.difficulty,
                    baseReward: band.baseReward,
                    baseTimeLimit: band.baseTimeLimit
                });
            }
        }

        return questions;
    }

    window.MIND_LOCK_QUESTIONS = buildQuestions();
})();
