// Entries added through the /panel/ page. They live in the Firebase Realtime
// Database (not in src/content), so pages render them client-side next to the
// static Markdown entries.
//
//   posts/<person>/<id>   -> LivePost (small; listed on portfolio pages)
//   photos/<person>/<id>  -> LivePhoto[] (big; only loaded on the entry page)
//   editors/<email key>   -> person slug the account may post as, or '*' (admin)
//
// Access rules: database.rules.json in the repo root.
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import { FIREBASE_CONFIG } from '../firebase-config';
import { STRAND_PL } from '../i18n';

export type Strand = 'Creativity' | 'Activity' | 'Service';
export const STRANDS: Strand[] = ['Creativity', 'Activity', 'Service'];

export interface LivePost {
  id: string;
  person: string;
  title: string;
  strand: Strand;
  date: string; // YYYY-MM-DD
  summary?: string;
  reflection?: string;
  los?: string; // "1,4"
  hours?: number;
  photoCount?: number;
  createdAt: number;
  updatedAt: number;
}

export interface LivePhoto {
  src: string; // JPEG data URL
  caption?: string;
}

const APP_NAME = 'cas-live';

export function firebaseApp() {
  return getApps().find((a) => a.name === APP_NAME) ?? initializeApp(FIREBASE_CONFIG!, APP_NAME);
}

export const db = () => getDatabase(firebaseApp());

export const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

// Firebase keys can't contain '.', so emails are stored with ',' instead.
export const emailKey = (email: string) => email.toLowerCase().replace(/\./g, ',');

export async function fetchPosts(person: string): Promise<LivePost[]> {
  const snap = await get(ref(db(), `posts/${person}`));
  const val = (snap.val() ?? {}) as Record<string, Omit<LivePost, 'id' | 'person'>>;
  return Object.entries(val).map(([id, p]) => ({ ...p, id, person }));
}

export async function fetchAllPosts(): Promise<LivePost[]> {
  const snap = await get(ref(db(), 'posts'));
  const val = (snap.val() ?? {}) as Record<string, Record<string, Omit<LivePost, 'id' | 'person'>>>;
  return Object.entries(val).flatMap(([person, posts]) =>
    Object.entries(posts).map(([id, p]) => ({ ...p, id, person }))
  );
}

export async function fetchPost(person: string, id: string): Promise<LivePost | null> {
  const snap = await get(ref(db(), `posts/${person}/${id}`));
  return snap.exists() ? { ...snap.val(), id, person } : null;
}

export async function fetchPhotos(person: string, id: string): Promise<LivePhoto[]> {
  const snap = await get(ref(db(), `photos/${person}/${id}`));
  return snap.exists() ? (Object.values(snap.val()) as LivePhoto[]) : [];
}

export const parseLos = (s?: string) =>
  [...new Set((s ?? '').split(',').map(Number).filter((n) => n >= 1 && n <= 7))].sort((a, b) => a - b);

export const postUrl = (person: string, id: string) =>
  `${base}post/?p=${encodeURIComponent(person)}&id=${encodeURIComponent(id)}`;

// Same date format as the static entries.
export const fmtDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d.valueOf())
    ? iso
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
}

// Client-side twin of <T>: both languages rendered, CSS shows the active one.
export function t(en: string, pl: string): DocumentFragment {
  const f = document.createDocumentFragment();
  f.append(h('span', 'lang-en', en), h('span', 'lang-pl', pl));
  return f;
}

export function chip(s: Strand) {
  const c = h('span', `chip ${s}`);
  c.append(t(s, STRAND_PL[s]));
  return c;
}

// Mirrors the markup of components/PostList.astro.
export function postCard(p: LivePost): HTMLLIElement {
  const li = h('li', 'post-item');
  li.dataset.strands = p.strand;
  li.dataset.date = p.date;
  const a = h('a', 'post-card');
  a.href = postUrl(p.person, p.id);
  const meta = h('div', 'post-meta');
  meta.append(chip(p.strand), h('span', 'post-date', fmtDate(p.date)));
  a.append(meta, h('h3', 'post-title', p.title));
  if (p.summary) a.append(h('p', 'post-summary', p.summary));
  const los = parseLos(p.los);
  if (los.length) {
    const tags = h('div', 'lo-tags');
    los.forEach((n) => tags.append(h('span', 'lo-tag', `LO${n}`)));
    a.append(tags);
  }
  li.append(a);
  return li;
}
