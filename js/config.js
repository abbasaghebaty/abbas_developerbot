export const APP_CONFIG = Object.freeze({
  footerTitle: "شوینده و محصولات بهداشتی شما",
  footerHandle: "@Shoma_shop",
  platforms: Object.freeze({
    eitaa: "https://eitaa.com/shoma_shop/12",
    rubika: "https://rubika.ir/shoma_shop/BHBJBCCDHAJFJFHJ"
  }),
  maxProductNameLength: 40
});

export const SHORTCUTS = Object.freeze([
  { prefixes: ["مایع ظرفشویی", "مایع ظرف", "ظرف"], replacement: "مایع ظرفشویی (ریکا)", description: "نام‌های رایج ظرفشویی را به قالب استاندارد تبدیل می‌کند." },
  { prefixes: ["مایع دستشویی", "مایع دست"], replacement: "مایع دستشویی", description: "نام‌های کوتاه مایع دستشویی را یکدست می‌کند." },
  { prefixes: ["دستی"], replacement: "پودر دستی (تاید)", exact: true, description: "فقط وقتی متن دقیقاً «دستی» باشد اعمال می‌شود." },
  { prefixes: ["دست"], replacement: "مایع دستشویی", exact: true, description: "فقط وقتی متن دقیقاً «دست» باشد اعمال می‌شود." },
  { prefixes: ["ریکا"], replacement: "مایع ظرفشویی (ریکا)", description: "«ریکا» را به نام کامل محصول تبدیل می‌کند." },
  { prefixes: ["ماشینی"], replacement: "پودر ماشینی (تاید)", description: "نام کوتاه پودر ماشینی را به قالب استاندارد تبدیل می‌کند." },
  { prefixes: ["سفید کننده", "سفیدکننده"], replacement: "سفید کننده (وایتکس)", description: "دو شکل نوشتاری «سفیدکننده» را یکسان می‌کند." },
  { prefixes: ["رخشا"], replacement: "پودر رخشا", description: "نام کوتاه رخشا را به نام کامل محصول تبدیل می‌کند." },
  { prefixes: ["گلنار"], replacement: "صابون گلنار", description: "نام کوتاه گلنار را به نام کامل محصول تبدیل می‌کند." },
  { prefixes: ["مای لیدی", "مولپد", "گود مود", "گودمود"], replacementPrefix: "نوار بهداشتی", description: "نام برند را به عبارت استاندارد «نوار بهداشتی ...» تبدیل می‌کند." },
  { prefixes: ["رختشویی", "رخت شویی"], replacement: "صابون رختشویی", description: "نام‌های مختلف رختشویی را یکدست می‌کند." },
  { prefixes: ["خمیر دندان", "خمیردندان", "خمیر دندون", "خمیردندون"], replacement: "خمیردندان", description: "فاصله و شکل محاوره‌ای خمیردندان را استاندارد می‌کند." },
  { prefixes: ["تیرک"], replacement: "تیرک (جرم گیر)", description: "نام کوتاه تیرک را به قالب محصول تبدیل می‌کند." }
]);
