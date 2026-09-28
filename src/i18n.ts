// Polish translations for the fixed CAS vocabulary, reused across pages.
// UI strings elsewhere use the <T> component; these are lookups for values that
// come from data (the STRANDS constant, etc.).
export const STRAND_PL: Record<string, string> = {
  Creativity: 'Kreatywność',
  Activity: 'Aktywność',
  Service: 'Służba',
};

export const STRAND_SUB_PL: Record<string, string> = {
  Creativity: 'Sztuka, projekty, tworzenie',
  Activity: 'Sport, ruch, wysiłek',
  Service: 'Wolontariat, pomaganie innym',
};

// Polish plural of "doświadczenie" for a count (1 / 2-4 / 5+).
export const plExp = (c: number) => {
  if (c === 1) return 'doświadczenie';
  const m10 = c % 10, m100 = c % 100;
  return m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14) ? 'doświadczenia' : 'doświadczeń';
};

export const STRAND_SUB_EN: Record<string, string> = {
  Creativity: 'Art, projects, making',
  Activity: 'Sport, movement, effort',
  Service: 'Volunteering, helping others',
};
