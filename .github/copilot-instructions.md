# تعليمات Copilot — مستودعات المهندس محسن الشامى

> ضع هذا الملف فى `.github/copilot-instructions.md` بجذر كل مستودع.
> يقرأه وكيل Copilot ومراجع الأكواد وشات المستودع قبل أى شغل.

---

## HARD RULES — READ BEFORE WRITING ANY CODE

1. **NEVER introduce a new backtick (`) into any HTML or JS file.** The count of backtick characters in `index.html` must be byte-identical before and after your change. Use string concatenation with `+` and `\u0022` escapes instead of template literals. You may edit *inside* an existing template literal, but only with `${...}` — never with `+X+`.
2. **Any change to `index.html` MUST bump the version in `sw.js`.** Otherwise the change never reaches users: the installed PWA keeps serving the cached build forever.
3. **Bump all three version markers in the same commit:** the static build tag in the HTML, the `BUILD` constant in JS, and `VERSION` in `sw.js`. Never one without the others.
4. **Never invent data.** No fabricated coordinates, dates, gauge readings, discharges or areas. If a value is unknown, say so in the PR body and leave a `TODO`.
5. **Never fail silently.** Every new `fetch`, `iframe` or user input path must surface the real server/validation error text inside the UI. Missing data is displayed as "غير متاح" — never as `0`.
6. **Small, surgical diffs only.** Do not reformat, do not reorder, do not "clean up", do not rewrite whole sections. One issue = one focused change.

---

## ١. السياق

- تطبيقات **PWA أحادية الملف**: `index.html` (أحياناً أكثر من ميجابايت) + `sw.js` + `manifest`.
- **vanilla JS خالص** — لا React ولا npm ولا خطوة بناء ولا مكتبات مجمَّعة. المكتبات الخارجية (three.js · leaflet · chart) من CDN بإصدار مثبَّت.
- المستخدمون **مهندسو رى فى الميدان** على هواتف أندرويد متوسطة بشبكة ضعيفة. الجهاز الذى يُطوَّر عليه أسرع بأضعاف من جهازهم.
- الواجهة **عربية RTL بالكامل**، خط Cairo، والأرقام والوحدات هندسية (م³/ث · م · فدان).
- التخزين: **Firebase RTDB** (مشروع `ismailia-64500`، جذر `/mwri`) عبر REST مباشر بلا SDK. `PATCH` هو الافتراضى لا `PUT`، وكل كتابة تحمل `updatedAt` و`src`.

## ٢. القيود المقدسة (كسرها = شاشة بيضاء عند المستخدم)

### ٢-١ ممنوع backticks جديدة
السبب: الرفع والتحرير يتمّان من موبايل أندرويد/Termux، وbacktick جديد يكسر الملف.
تحقّق قبل فتح الـPR وبعده:

```bash
python3 -c "print(open('index.html',encoding='utf-8').read().count(chr(96)))"
```

الرقمان **متطابقان حرفياً**. اكتب:

```js
var s = '<div class=' + '\u0022' + cls + '\u0022' + '>' + txt + '</div>';
```

### ٢-٢ ثلاثية الترقيم
كل تعديل على `index.html` يرفع الثلاثة معاً:
1. الوسم الثابت فى HTML (`build X.YZ`) — لأنه ما يظهر فى لقطة الشاشة قبل تشغيل JS.
2. ثابت `BUILD` داخل JS.
3. `VERSION` فى `sw.js` — ويُقفز فوق أى نسخة يُحتمل وجودها فى الميدان.

الـPR الذى يعدّل `index.html` بلا `sw.js` **مرفوض**.

### ٢-٣ بايتات ≠ حروف
النص العربى UTF-8 متعدد البايتات. قارن الأحجام بـ`os.path.getsize` لا بـ`len(str)`.

## ٣. قبل ما تفتح Pull Request

1. عدّ backticks قبل/بعد — متطابق.
2. الثلاثية مرقّمة (الثلاثة معاً).
3. `node --check` على كل بلوك `<script>` غير خارجى.
4. كل استبدال نصّى مسبوق بتأكيد أن المرساة موجودة **مرة واحدة** فقط — الاستبدال الأعمى فى ملف ١٫٧ ميجا ممنوع.
5. فى وصف الـPR: ما تغيّر، أرقام الثلاثية، عدد الـbackticks قبل/بعد، وما لم تستطع التحقق منه.

## ٤. فخاخ مؤكَّدة — كل واحد منها كلّف جلسة تصحيح

هذه أخطاء **تمرّ من `node --check` ومن كل فحص ساكن بصفر إنذار**:

- **`isFinite(null) === true`** — القيمة الغائبة تنزلق فتُقرأ صفراً صحيحاً. اكتب دائماً `typeof v === 'number' && isFinite(v)`.
- **مجموع الأجزاء المقرَّبة ≠ المجموع المقرَّب** — اجمع على القيم الخام دائماً وقرّب عند العرض فقط.
- **تعارض توقيع الدوال** — نداء بوسائط بترتيب مختلف لا يكسر الصيغة، بل يعطى كانفاس أبيض أو استثناءً مبتلَعاً داخل `requestAnimationFrame`. قارن الوسائط بالتعريف حرفاً حرفاً، ولا تضع أكثر من نداء رسم فى `rAF` واحد بلا `try/catch` لكلٍّ.
- **اتجاه الحركة فى SVG من إشارة `stroke-dashoffset` لا من شكل المسار** — السالبة تزحف مع اتجاه الرسم والموجبة تعكسه. أى كتلة تشذّ عن السائد فى نفس الملف = خطأ.
- **`const`/`let` فى سكربت كلاسيكى لا تصير خصائص على `window`** — البلوك المُلحَق الذى يقرأ `window.DATA` يجد `undefined` بصمت. استخدم `typeof X !== 'undefined'` بالمعرّف المجرّد.
- **سطح `BufferGeometry` بلا `side: THREE.DoubleSide` يختفى تماماً** — يظهر المجرى قاعاً جافاً بصفر خطأ.
- **الدمج فى المزامنة بالمفتاح لا بالاستبدال** — كل عنصر داخل مصفوفة يُزامَن له مفتاح ثابت و**طابع `_t` خاص به**؛ الموسوم يغلب غير الموسوم، وبين موسومَين الأحدث. الحذف شاهدة صريحة لا حذفاً من المصفوفة.
- **الملء التلقائى للمتصفح يفرّغ الشاشة** — `autocomplete="off"` على كل مربعات البحث، ورسالة الفراغ تذكر الفلتر المطبَّق نصّاً ومعها زرّ مسح.
- **الأداء ليس صحّة** — أى دالة تلمس سلسلة بأكثر من بضع مئات من النقاط تُذاكَر بمفتاح مشتقّ من البيانات؛ ولا تحويل نصّى لتاريخ داخل حلقة مزدوجة.
- **الخطأ الدائم لا يدخل طابور الأوفلاين** — 400/404/422 تُعلَن وتُسقَط؛ ونصّ الخطأ يُقرأ من **جسم الردّ** لا من `status`، ويُعرض داخل الواجهة لا فى `title` (لا يوجد hover على الموبايل).

## ٥. ممنوع بلا طلب صريح

- تغيير أى **معادلة هيدروليكية** (مانينج · العمق الحرج · GVF · معادلات البوابات · منحنيات التصريف) — القرار الهيدروليكى لصاحب المستودع وحده.
- تغيير أى **رقم مرجعى** (منسوب · سعة · زمام · مقنن · كيلومتر · معامل خشونة).
- لمس مفاتيح أو أسرار أو روابط القاعدة، أو رفع أى مفتاح فى الكود.
- تغيير ثيم أو ألوان تطبيق قائم. (الطابع **الفاتح** هو الافتراضى لأى تصميم جديد.)
- تحويل الملف الأحادى إلى وحدات أو إضافة خطوة بناء.
- حذف كود يبدو ميتاً بناءً على استنتاج غير مُثبَت — اطرح الشكّ فى وصف الـPR واطلب دليلاً.

## ٦. أسلوب الكود

- vanilla JS، `var`/`function` على النمط السائد فى الملف — اتبع ما حولك لا ما تفضّله.
- لا تعليقات زائدة، ولا إعادة تنسيق لأسطر لم تلمسها.
- كل نصّ واجهة جديد **بالعربية**.
- الوحدات مذكورة دائماً فى الواجهة، والحقل ذو الوحدة المضاعَفة (مليون جنيه · ألف م³) يحمل حارس مدى يعرض القيمة محوَّلة ويطلب تأكيداً — ولا يحوّل صامتاً.

---

## بيانات هذا المستودع (محسوبة آلياً وقت الرفع)

- عدد الـbackticks فى `index.html`: **0** — لا يزيد ولا ينقص بعد أى تعديل
- وسم البيلد فى HTML: `غير موجود`
- ثابت BUILD فى JS: `غير موجود`
- VERSION فى `sw.js`: `2.0`
- حجم `index.html`: 403286 بايت
