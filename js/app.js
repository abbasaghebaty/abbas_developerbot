import { SHORTCUTS } from "./config.js";
import { buildCaption } from "./caption.js";
import { normalizeNumericInput, normalizeText } from "./utils.js";

const $ = id => document.getElementById(id);
const elements = {
  productName: $("productName"), price: $("price"), discountPrice: $("discountPrice"), weight: $("weight"),
  quantity: $("quantity"), scent: $("scent"), customTitle: $("customTitle"), customValue: $("customValue"),
  previewOutput: $("previewOutput"), copyBtn: $("copyBtn"), clearFormBtn: $("clearFormBtn"), clearOutputBtn: $("clearOutputBtn"),
  copyFeedback: $("copyFeedback"), themeToggle: $("themeToggle"), themeIcon: $("themeIcon"), themeLabel: $("themeLabel"),
  shortcutList: $("shortcutList"),
  error: { name: $("nameError"), price: $("priceError"), discount: $("discountError"), discountCompare: $("discountCompareError") }
};
const platformButtons = [...document.querySelectorAll(".platform-btn")];
const clearButtons = [...document.querySelectorAll(".clear-field-btn")];
const inputs = [elements.productName, elements.price, elements.discountPrice, elements.weight, elements.quantity, elements.scent, elements.customTitle, elements.customValue];
let selectedPlatform = "eitaa";
let copyTimer = 0;

function formData() {
  return { productName: elements.productName.value, price: elements.price.value, discount: elements.discountPrice.value, weight: elements.weight.value, quantity: elements.quantity.value, scent: elements.scent.value, customTitle: elements.customTitle.value, customValue: elements.customValue.value };
}
function setError(element, message) { element.textContent = message; element.classList.toggle("visible", Boolean(message)); }
function updateErrors(validation) {
  setError(elements.error.name, validation.errors.name);
  setError(elements.error.price, validation.errors.price);
  setError(elements.error.discount, validation.errors.discount);
  setError(elements.error.discountCompare, validation.errors.discountCompare);
}
function updateClearButtons() {
  clearButtons.forEach(button => {
    const target = document.getElementById(button.dataset.target);
    button.closest(".input-wrapper")?.classList.toggle("has-value", Boolean(target?.value.trim()));
  });
}
function renderPreview() {
  if (document.activeElement === elements.previewOutput) return;
  const result = buildCaption(formData(), selectedPlatform);
  updateErrors(result.validation);
  elements.previewOutput.textContent = result.text;
}
function normalizeNumericField(input) {
  const value = normalizeNumericInput(input.value);
  if (value !== input.value) input.value = value;
}
function resetForm() {
  inputs.forEach(input => { input.value = ""; });
  selectedPlatform = "eitaa";
  platformButtons.forEach(button => button.classList.toggle("active", button.dataset.platform === selectedPlatform));
  elements.previewOutput.textContent = "";
  updateClearButtons(); renderPreview(); elements.productName.focus();
}
function clearOutput() { elements.previewOutput.textContent = ""; elements.previewOutput.focus(); }
async function copyCaption() {
  const text = elements.previewOutput.textContent.trim();
  if (!text || text.startsWith("برای ساخت کپشن")) return setCopyFeedback("کپشن آماده‌ای برای کپی وجود ندارد.", false);
  try { await navigator.clipboard.writeText(text); setCopyFeedback("کپی شد.", true); }
  catch {
    const textarea = document.createElement("textarea"); textarea.value = text; textarea.setAttribute("readonly", ""); textarea.style.position = "fixed"; textarea.style.opacity = "0";
    document.body.appendChild(textarea); textarea.select();
    try { document.execCommand("copy"); setCopyFeedback("کپی شد.", true); } catch { setCopyFeedback("کپی ناموفق بود.", false); }
    textarea.remove();
  }
}
function setCopyFeedback(message, success) {
  elements.copyFeedback.textContent = message;
  elements.copyFeedback.style.color = success ? "var(--success)" : "var(--error)";
  elements.copyFeedback.classList.add("show"); clearTimeout(copyTimer);
  copyTimer = window.setTimeout(() => elements.copyFeedback.classList.remove("show"), 2200);
}
function applyTheme(theme) {
  const isLight = theme === "light"; document.body.classList.toggle("light-mode", isLight);
  elements.themeIcon.textContent = isLight ? "☀️" : "🌙"; elements.themeLabel.textContent = isLight ? "روشن" : "تاریک";
  localStorage.setItem("caption-theme", isLight ? "light" : "dark");
}
function toggleTheme() { applyTheme(document.body.classList.contains("light-mode") ? "dark" : "light"); }
function renderShortcutGuide() {
  elements.shortcutList.replaceChildren();
  for (const shortcut of SHORTCUTS) {
    const item = document.createElement("li"); item.className = "shortcut-item";
    const trigger = document.createElement("span"); trigger.className = "shortcut-trigger"; trigger.textContent = shortcut.prefixes.join(" / ");
    const description = document.createElement("span"); description.className = "shortcut-description"; description.textContent = shortcut.description;
    item.append(trigger, description); elements.shortcutList.appendChild(item);
  }
}
platformButtons.forEach(button => button.addEventListener("click", () => {
  selectedPlatform = button.dataset.platform || "eitaa";
  platformButtons.forEach(item => item.classList.toggle("active", item === button)); renderPreview();
}));
inputs.forEach(input => {
  input.addEventListener("input", () => { if (input === elements.price || input === elements.discountPrice) normalizeNumericField(input); updateClearButtons(); renderPreview(); });
  input.addEventListener("blur", () => { input.value = normalizeText(input.value); if (input === elements.price || input === elements.discountPrice) normalizeNumericField(input); updateClearButtons(); renderPreview(); });
});
clearButtons.forEach(button => button.addEventListener("click", () => {
  const target = document.getElementById(button.dataset.target); if (!target) return; target.value = ""; target.dispatchEvent(new Event("input", { bubbles: true })); target.focus();
}));
elements.copyBtn.addEventListener("click", copyCaption); elements.clearFormBtn.addEventListener("click", resetForm); elements.clearOutputBtn.addEventListener("click", clearOutput); elements.themeToggle.addEventListener("click", toggleTheme);
renderShortcutGuide(); applyTheme(localStorage.getItem("caption-theme") || "dark"); updateClearButtons(); renderPreview(); elements.productName.focus();
