// The 7 CAS Learning Outcomes — official IB wording + a plain-language
// explanation and a hint on how to demonstrate each one. English + Polish.
export interface LO {
  n: number;
  title: string; // official IB wording
  titlePl: string;
  plain: string; // what it means, simply
  plainPl: string;
  how: string; // how you typically show it
  howPl: string;
}

export const LEARNING_OUTCOMES_FULL: LO[] = [
  {
    n: 1,
    title: 'Identify own strengths and develop areas for growth',
    titlePl: 'Rozpoznawanie własnych mocnych stron i rozwijanie obszarów do poprawy',
    plain: 'Know what you are genuinely good at, and be honest about what you want to get better at.',
    plainPl: 'Wiedz, w czym naprawdę jesteś dobry, i bądź szczery co do tego, co chcesz poprawić.',
    how: 'Reflect on a strength you used and a weakness you noticed, and set a goal to improve it.',
    howPl: 'Zastanów się nad mocną stroną, którą wykorzystałeś, i słabością, którą zauważyłeś, i wyznacz cel, by ją poprawić.',
  },
  {
    n: 2,
    title: 'Demonstrate that challenges have been undertaken, developing new skills in the process',
    titlePl: 'Podejmowanie wyzwań i rozwijanie nowych umiejętności',
    plain: 'Take on something that is actually difficult for you, and pick up new skills along the way.',
    plainPl: 'Podejmij się czegoś, co jest dla ciebie naprawdę trudne, i zdobądź przy tym nowe umiejętności.',
    how: 'Show a real challenge you chose and a skill you did not have before but built.',
    howPl: 'Pokaż prawdziwe wyzwanie, które wybrałeś, i umiejętność, której wcześniej nie miałeś, a którą zbudowałeś.',
  },
  {
    n: 3,
    title: 'Demonstrate how to initiate and plan a CAS experience',
    titlePl: 'Inicjowanie i planowanie doświadczenia CAS',
    plain: 'Start and organise an experience yourself, rather than just showing up to one someone else ran.',
    plainPl: 'Sam zainicjuj i zorganizuj doświadczenie, zamiast tylko pojawić się na czymś prowadzonym przez kogoś innego.',
    how: 'Show the planning you did: the idea, the steps, the schedule, the people you organised.',
    howPl: 'Pokaż swoje planowanie: pomysł, kroki, harmonogram, osoby, które zorganizowałeś.',
  },
  {
    n: 4,
    title: 'Show commitment to and perseverance in CAS experiences',
    titlePl: 'Zaangażowanie i wytrwałość w doświadczeniach CAS',
    plain: 'Keep showing up and keep going, even when it gets hard, boring or inconvenient.',
    plainPl: 'Pojawiaj się i działaj dalej, nawet gdy staje się to trudne, nudne lub niewygodne.',
    how: 'Show consistency over time, like a routine you stuck to or something you did not quit.',
    howPl: 'Pokaż konsekwencję w czasie, na przykład rutynę, której się trzymałeś, lub coś, czego nie porzuciłeś.',
  },
  {
    n: 5,
    title: 'Demonstrate the skills and recognize the benefits of working collaboratively',
    titlePl: 'Umiejętność współpracy i dostrzeganie korzyści z pracy zespołowej',
    plain: 'Work well with other people, and understand why teamwork made the outcome better.',
    plainPl: 'Dobrze współpracuj z innymi i rozumiej, dlaczego praca zespołowa poprawiła efekt.',
    how: 'Show how you cooperated, divided work, or solved a problem together.',
    howPl: 'Pokaż, jak współpracowałeś, dzieliłeś pracę lub wspólnie rozwiązaliście problem.',
  },
  {
    n: 6,
    title: 'Demonstrate engagement with issues of global significance',
    titlePl: 'Zaangażowanie w kwestie o znaczeniu globalnym',
    plain: 'Engage with an issue that matters beyond your own life, something of global importance.',
    plainPl: 'Zaangażuj się w sprawę, która ma znaczenie poza twoim własnym życiem, o znaczeniu globalnym.',
    how: 'Connect an experience to a wider issue: the environment, poverty, inequality, health, etc.',
    howPl: 'Powiąż doświadczenie z szerszą kwestią: środowiskiem, ubóstwem, nierównością, zdrowiem itp.',
  },
  {
    n: 7,
    title: 'Recognize and consider the ethics of choices and actions',
    titlePl: 'Rozpoznawanie i rozważanie etyki wyborów i działań',
    plain: 'Think about the right and wrong of what you do, and act responsibly.',
    plainPl: 'Myśl o tym, co dobre i złe w tym, co robisz, i postępuj odpowiedzialnie.',
    how: 'Show an ethical question you faced and how you thought it through.',
    howPl: 'Pokaż kwestię etyczną, przed którą stanąłeś, i jak ją przemyślałeś.',
  },
];

// n -> short Polish title, matching the English LEARNING_OUTCOMES map in content.config.
export const LEARNING_OUTCOMES_PL: Record<number, string> = Object.fromEntries(
  LEARNING_OUTCOMES_FULL.map((lo) => [lo.n, lo.titlePl])
);
