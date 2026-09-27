// ---------------------------------------------------------------------------
// People with a CAS portfolio on this site.
// To add someone: add an entry here, then give their .md experiences
// `person: <slug>` in the frontmatter, and put their photos in
// public/images/<slug>_<strand>/.
// ---------------------------------------------------------------------------
export interface Person {
  slug: string; // used in URLs and in each entry's `person` field
  name: string;
  tagline: string;
  taglinePl: string;
  intro: string;
  introPl: string;
  photo: string; // optional, e.g. /images/aleksander.jpg — '' to hide
}

export const PEOPLE: Person[] = [
  {
    slug: 'aleksander',
    name: 'Aleksander Sobczyk',
    tagline: 'IB Diploma Programme · CAS Portfolio',
    taglinePl: 'Program IB Diploma · Portfolio CAS',
    intro:
      'This is my CAS portfolio, a collection of my Creativity, Activity and ' +
      'Service experiences, with reflections and evidence, as part of the IB ' +
      'Diploma Programme.',
    introPl:
      'To moje portfolio CAS, zbiór moich doświadczeń z zakresu Kreatywności, ' +
      'Aktywności i Służby, wraz z refleksjami i dowodami, w ramach programu IB ' +
      'Diploma.',
    photo: '',
  },
  {
    slug: 'tymon',
    name: 'Tymon Mikita',
    tagline: 'IB Diploma Programme · CAS Portfolio',
    taglinePl: 'Program IB Diploma · Portfolio CAS',
    intro:
      'My CAS portfolio for the IB Diploma Programme, covering my Creativity, ' +
      'Activity and Service experiences, with reflections and evidence.',
    introPl:
      'Moje portfolio CAS w ramach programu IB Diploma, obejmujące doświadczenia ' +
      'z zakresu Kreatywności, Aktywności i Służby, wraz z refleksjami i dowodami.',
    photo: '',
  },
];

export const getPerson = (slug: string): Person | undefined =>
  PEOPLE.find((p) => p.slug === slug);
