import { APP_CONFIG, SHORTCUTS } from "./config.js";
import { normalizeText, normalizeNumericInput, isPositiveInteger, matchesPrefix, removeDuplicateWords, toPersianDigits } from "./utils.js";

function applyShortcut(rule, prefix, rest) {
  const base = rule.replacementPrefix ? `${rule.replacementPrefix} ${prefix}` : rule.replacement;
  return rest ? `${base} ${rest}` : base;
}

export function transformProductName(value) {
  const name = normalizeText(value);
  if (!name) return "";

  const orderedRules = [...SHORTCUTS].sort((a, b) => {
    const aLength = Math.max(...a.prefixes.map(prefix => prefix.length));
    const bLength = Math.max(...b.prefixes.map(prefix => prefix.length));
    return bLength - aLength;
  });

  for (const rule of orderedRules) {
    for (const prefix of [...rule.prefixes].sort((a, b) => b.length - a.length)) {
      const exactMatch = rule.exact && name === prefix;
      const prefixMatch = !rule.exact && matchesPrefix(name, prefix);
      if (!exactMatch && !prefixMatch) continue;

      let rest = exactMatch ? "" : name.slice(prefix.length).trim();
      let changed = true;
      while (changed && rest) {
        changed = false;
        for (const nestedPrefix of [...rule.prefixes].sort((a, b) => b.length - a.length)) {
          if (!matchesPrefix(rest, nestedPrefix)) continue;
          rest = rest.slice(nestedPrefix.length).trim();
          changed = true;
          break;
        }
      }
      return removeDuplicateWords(applyShortcut(rule, prefix, rest));
    }
  }

  return removeDuplicateWords(name);
}

export function validateForm(data) {
  const errors = { name: "", price: "", discount: "", discountCompare: "" };
  const productName = transformProductName(data.productName);
  const price = normalizeNumericInput(data.price);
  const discount = normalizeNumericInput(data.discount);

  if (!productName) errors.name = "نام محصول الزامی است.";
  else if (productName.length > APP_CONFIG.maxProductNameLength) errors.name = `حداکثر ${APP_CONFIG.maxProductNameLength} کاراکتر مجاز است.`;

  if (!price) errors.price = "قیمت الزامی است.";
  else if (!isPositiveInteger(price)) errors.price = "قیمت باید فقط عدد باشد.";

  if (discount) {
    if (!isPositiveInteger(discount)) errors.discount = "قیمت با تخفیف باید فقط عدد باشد.";
    else if (price && Number(discount) >= Number(price)) errors.discountCompare = "قیمت با تخفیف باید کمتر از قیمت اصلی باشد.";
  }

  return { errors, productName, price, discount };
}

export function buildCaption(data, selectedPlatform) {
  const validation = validateForm(data);
  const { errors, productName, price, discount } = validation;
  const optionalData = {
    weight: normalizeText(data.weight),
    quantity: normalizeText(data.quantity),
    scent: normalizeText(data.scent),
    customTitle: normalizeText(data.customTitle),
    customValue: normalizeText(data.customValue)
  };

  if (errors.name || errors.price) {
    return { text: "برای ساخت کپشن، «نام محصول» و «قیمت» را وارد کنید.", validation };
  }

  const lines = [productName, `قیمت : ${toPersianDigits(price)}`];
  if (discount && !errors.discount && !errors.discountCompare) lines.push(`با #تخفیف : ${toPersianDigits(discount)}`);
  if (optionalData.weight) lines.push(`وزن : ${optionalData.weight}`);
  if (optionalData.quantity) lines.push(`تعداد : ${optionalData.quantity}`);
  if (optionalData.scent) lines.push(`رایحه : ${optionalData.scent}`);
  if (optionalData.customTitle && optionalData.customValue) lines.push(`${optionalData.customTitle} : ${optionalData.customValue}`);

  lines.push("", "🛒 جهت خرید :", APP_CONFIG.platforms[selectedPlatform] ?? APP_CONFIG.platforms.eitaa, "", `${APP_CONFIG.footerTitle}\n${APP_CONFIG.footerHandle}`);
  return { text: lines.join("\n"), validation };
}
