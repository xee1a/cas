import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// CAS strands
export const STRANDS = ['Creativity', 'Activity', 'Service'] as const;

// 7 CAS Learning Outcomes (LO1-LO7) - oficjalne IB
export const LEARNING_OUTCOMES: Record<number, string> = {
  1: 'Identify own strengths and develop areas for growth',
  2: 'Demonstrate that challenges have been undertaken, developing new skills in the process',
  3: 'Demonstrate how to initiate and plan a CAS experience',
  4: 'Show commitment to and perseverance in CAS experiences',
  5: 'Demonstrate the skills and recognize the benefits of working collaboratively',
  6: 'Demonstrate engagement with issues of global significance',
  7: 'Recognize and consider the ethics of choices and actions',
};

const reflections = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reflections' }),
  schema: z.object({
    title: z.string(),
    // Czyj to wpis — slug osoby z src/people.ts (np. "aleksander", "tymon")
    person: z.string(),
    // Data wpisu / doswiadczenia
    date: z.coerce.date(),
    // Jeden lub wiecej stringow (experience moze laczyc np. Creativity + Service)
    strands: z.array(z.enum(STRANDS)).min(1),
    // Ktore Learning Outcomes pokrywa ten wpis (1-7)
    learningOutcomes: z.array(z.number().int().min(1).max(7)).default([]),
    // Krotkie streszczenie na liste / karte
    summary: z.string().optional(),
    // Tagi tematyczne (opcjonalne)
    tags: z.array(z.string()).default([]),
    // Zdjecie/okladka wpisu (sciezka wzgledem /public lub URL)
    image: z.string().optional(),
    // Ile godzin CAS (opcjonalne, do podsumowania)
    hours: z.number().optional(),
    // Galeria zdjec (dowody). Pliki wrzucaj do public/images/
    gallery: z
      .array(
        z.object({
          src: z.string(), // np. /images/basen-karnet.jpg
          caption: z.string().optional(),
        })
      )
      .default([]),
    // Zalaczniki/dokumenty (np. PDF). Pliki wrzucaj do public/files/
    attachments: z
      .array(
        z.object({
          src: z.string(), // np. /files/plan.pdf
          label: z.string(),
        })
      )
      .default([]),
    // Dane w stylu Apple Fitness (opcjonalne) — renderowane jako karta na wpisie
    fitness: z
      .object({
        activity: z.string().default('Pływanie'),
        // Pierscienie aktywnosci (opcjonalne) — wartosc / cel
        rings: z
          .object({
            move: z.number(),
            moveGoal: z.number(),
            exercise: z.number(),
            exerciseGoal: z.number(),
            stand: z.number(),
            standGoal: z.number(),
          })
          .optional(),
        // Dziennik sesji — kazda to jeden trening (Twoj dowod ile plyniesz)
        workouts: z
          .array(
            z.object({
              date: z.string(), // etykieta, np. "24 wrz"
              distance: z.number(), // w metrach
              duration: z.string(), // "42:15"
              pace: z.string().optional(), // np. "2:48 /100m"
              calories: z.number().optional(), // kcal
              avgHr: z.number().optional(), // uderzenia/min
            })
          )
          .default([]),
      })
      .optional(),
    // Draft = nie publikuj jeszcze
    draft: z.boolean().default(false),
  }),
});

export const collections = { reflections };
