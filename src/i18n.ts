import { ENGLISH } from './localization/en';

export type Language = 'ru' | 'en';
let selected: Language | undefined;
export function getLanguage(): Language {
  if (selected) return selected;
  try { return globalThis.localStorage?.getItem('ab-language') === 'en' ? 'en' : 'ru'; } catch { return 'ru'; }
}
export function setLanguage(language: Language): void {
  selected = language;
  try { globalThis.localStorage?.setItem('ab-language', language); } catch { /* Storage can be disabled. */ }
}
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const phrases = Object.keys(ENGLISH).sort((a, b) => b.length - a.length);
const pattern = new RegExp(`(?<![А-Яа-яЁё])(?:${phrases.map(escapeRegExp).join('|')})(?![А-Яа-яЁё])`, 'g');
/** Translate presentation strings only. Engine IDs and saved state remain untouched. */
export function translate(text: string, language: Language = getLanguage()): string {
  if (language === 'ru' || !/[А-Яа-яЁё]/.test(text)) return text;
  return text.replace(pattern, phrase => ENGLISH[phrase]);
}

const attributes = ['title', 'aria-label', 'placeholder'] as const;
const excluded = 'script,style,textarea,[data-i18n="off"],[data-user-content]';
/** Localize text and accessible labels, preserving DOM bindings and serialized data. */
export function installLocalization(root: HTMLElement): () => void {
  const sources = new WeakMap<Node, { original: string; rendered: string }>();
  const attributeSources = new WeakMap<Element, Map<string, { original: string; rendered: string }>>();
  function localizeText(node: Text) {
    if (node.parentElement?.closest(excluded)) return;
    const value = node.data, previous = sources.get(node);
    const original = previous?.rendered === value ? previous.original : value;
    const rendered = translate(original);
    sources.set(node, { original, rendered });
    if (value !== rendered) node.data = rendered;
  }
  function localizeElement(element: Element) {
    if (element.closest(excluded)) return;
    let history = attributeSources.get(element);
    if (!history) { history = new Map(); attributeSources.set(element, history); }
    for (const attribute of attributes) {
      const value = element.getAttribute(attribute);
      if (value === null) continue;
      const previous = history.get(attribute);
      const original = previous?.rendered === value ? previous.original : value;
      const rendered = translate(original);
      history.set(attribute, { original, rendered });
      if (rendered !== value) element.setAttribute(attribute, rendered);
    }
  }
  function visit(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) { localizeText(node as Text); return; }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;
    if (element.closest(excluded)) return;
    localizeElement(element);
    for (const child of Array.from(node.childNodes)) visit(child);
  }
  visit(root);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') localizeText(record.target as Text);
      else if (record.type === 'attributes') localizeElement(record.target as Element);
      else for (const added of Array.from(record.addedNodes)) visit(added);
    }
  });
  observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...attributes] });
  return () => observer.disconnect();
}

/** Convenience for HTML generated in tests or server rendering. */
export function localizedHTML(html: string, language: Language = getLanguage()): string {
  const stack: { name: string; skip: boolean }[] = [];
  const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  return html.replace(/(<[^>]*>)|([^<]+)/g, (part, tag: string | undefined) => {
    const parentSkipped = stack.at(-1)?.skip ?? false;
    if (!tag) return parentSkipped ? part : translate(part, language);
    const closing = tag.match(/^<\s*\/\s*([\w:-]+)/);
    if (closing) {
      const index = stack.map(entry => entry.name).lastIndexOf(closing[1].toLowerCase());
      if (index >= 0) stack.splice(index);
      return tag;
    }
    const opening = tag.match(/^<\s*([\w:-]+)/);
    if (!opening) return tag;
    const name = opening[1].toLowerCase();
    const skip = parentSkipped || ['script', 'style', 'textarea'].includes(name)
      || /\sdata-user-content(?:\s|=|>)/i.test(tag) || /\sdata-i18n\s*=\s*["']off["']/i.test(tag);
    if (!voidElements.has(name) && !/\/\s*>$/.test(tag)) stack.push({ name, skip });
    if (skip) return tag;
    return tag.replace(/(\s)(title|aria-label|placeholder)=("([^"]*)"|'([^']*)')/g,
      (_all: string, space: string, key: string, quoted: string, double: string | undefined, single: string | undefined) => `${space}${key}=${quoted[0]}${translate(double ?? single ?? '', language)}${quoted[0]}`);
  });
}
