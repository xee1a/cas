// The 7 CAS Learning Outcomes — official IB wording + a plain-language
// explanation and a hint on how to demonstrate each one.
export interface LO {
  n: number;
  title: string; // official IB wording
  plain: string; // what it means, simply
  how: string; // how you typically show it
}

export const LEARNING_OUTCOMES_FULL: LO[] = [
  {
    n: 1,
    title: 'Identify own strengths and develop areas for growth',
    plain: 'Know what you are genuinely good at, and be honest about what you want to get better at.',
    how: 'Reflect on a strength you used and a weakness you noticed, and set a goal to improve it.',
  },
  {
    n: 2,
    title: 'Demonstrate that challenges have been undertaken, developing new skills',
    plain: 'Take on something that is actually difficult for you, and pick up new skills along the way.',
    how: 'Show a real challenge you chose and a skill you did not have before but built.',
  },
  {
    n: 3,
    title: 'Demonstrate how to initiate and plan a CAS experience',
    plain: 'Start and organise an experience yourself, rather than just showing up to one someone else ran.',
    how: 'Show the planning you did: the idea, the steps, the schedule, the people you organised.',
  },
  {
    n: 4,
    title: 'Show commitment to and perseverance in CAS experiences',
    plain: 'Keep showing up and keep going, even when it gets hard, boring or inconvenient.',
    how: 'Show consistency over time, like a routine you stuck to or something you did not quit.',
  },
  {
    n: 5,
    title: 'Demonstrate the skills and recognise the benefits of working collaboratively',
    plain: 'Work well with other people, and understand why teamwork made the outcome better.',
    how: 'Show how you cooperated, divided work, or solved a problem together.',
  },
  {
    n: 6,
    title: 'Demonstrate engagement with issues of global significance',
    plain: 'Engage with an issue that matters beyond your own life, something of global importance.',
    how: 'Connect an experience to a wider issue: the environment, poverty, inequality, health, etc.',
  },
  {
    n: 7,
    title: 'Recognise and consider the ethics of choices and actions',
    plain: 'Think about the right and wrong of what you do, and act responsibly.',
    how: 'Show an ethical question you faced and how you thought it through.',
  },
];
