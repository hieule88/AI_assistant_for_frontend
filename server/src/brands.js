import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FILE = fileURLToPath(new URL('../brands.json', import.meta.url));

const SEED = [
  {
    id: 'acme-coffee',
    name: 'Acme Coffee',
    colors: { primary: '#6b4f3a', bg: '#f3e9df', text: '#2a1d16' },
    font: 'Georgia, "Times New Roman", serif',
    logo: '☕',
  },
];

let _cache = null;

function load() {
  if (_cache) return _cache;
  if (existsSync(FILE)) {
    try {
      _cache = JSON.parse(readFileSync(FILE, 'utf8'));
    } catch {
      _cache = [...SEED];
    }
  } else {
    _cache = [...SEED];
    save();
  }
  return _cache;
}

function save() {
  writeFileSync(FILE, JSON.stringify(_cache, null, 2));
}

export function listBrands() {
  return load();
}

export function getBrand(id) {
  if (!id) return null;
  return load().find((b) => b.id === id) || null;
}

function makeId(name) {
  const base =
    String(name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'brand';
  const existing = new Set(load().map((b) => b.id));
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export function createBrand({ name, colors, font, logo } = {}) {
  if (!name || !String(name).trim()) throw new Error('Thiếu "name" cho brand');
  const brand = {
    id: makeId(name),
    name: String(name).trim(),
    colors: {
      primary: colors?.primary || '#4f46e5',
      ...(colors?.bg ? { bg: colors.bg } : {}),
      ...(colors?.text ? { text: colors.text } : {}),
    },
    ...(font ? { font: String(font) } : {}),
    ...(logo ? { logo: String(logo) } : {}),
  };
  load().push(brand);
  save();
  return brand;
}
