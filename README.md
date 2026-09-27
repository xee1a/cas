# CAS Reflections

Osobista strona/blog do refleksji CAS (IB Diploma Programme). Zbudowana w
[Astro](https://astro.build). Wpisy pisze się w Markdown, strona automatycznie
liczy pokrycie 7 learning outcomes i pozwala filtrować po stringach.

## Uruchomienie lokalnie

```bash
npm install      # tylko za pierwszym razem
npm run dev      # http://localhost:4321
```

## Dodawanie wpisu

1. Skopiuj `src/content/reflections/_TEMPLATE.md.txt` jako nowy plik `.md`,
   np. `src/content/reflections/moje-doswiadczenie.md`.
2. Uzupełnij frontmatter (tytuł, datę, `strands`, `learningOutcomes`, itd.).
3. Napisz refleksję pod frontmatterem (zwykły Markdown).
4. Zdjęcia wrzuć do `public/images/` i linkuj jako `/images/nazwa.jpg`.

Ustaw `draft: true`, żeby wpis nie pojawił się jeszcze publicznie.

## Publikacja (GitHub Pages — darmowo)

1. Załóż repozytorium na GitHub i wypchnij ten folder.
2. W repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push na `main` uruchomi automatyczny deploy (`.github/workflows/deploy.yml`).

Domyślnie strona wyląduje pod `https://<login>.github.io/<repo>`.

## Własna domena

Kupujesz tylko domenę (~40–60 zł/rok), hosting zostaje darmowy.

1. Kup domenę (patrz niżej) i w panelu rejestratora dodaj rekordy DNS:
   - **subdomena** (np. `cas.twojadomena.pl`): rekord `CNAME` → `<login>.github.io`
   - **domena główna** (np. `twojadomena.pl`): 4 rekordy `A` na adresy GitHuba
     (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`)
2. W repo: **Settings → Pages → Custom domain** wpisz swoją domenę, zaznacz
   **Enforce HTTPS**.
3. W repo **Settings → Secrets and variables → Actions → Variables** dodaj:
   - `SITE` = `https://twojadomena.pl`
   - `BASE` = `/`
4. Utwórz plik `public/CNAME` z jedną linijką: `twojadomena.pl`.

### Rejestratorzy (rekomendacje)

| Rejestrator | Dlaczego | TLD warte uwagi |
|---|---|---|
| **Cloudflare Registrar** | ceny po kosztach, zero marży i podbić przy odnowieniu | `.com`, `.me`, `.dev` |
| **Porkbun** | tanio, prosty panel, darmowe WHOIS privacy | `.me`, `.dev`, `.blog` |
| **Namecheap** | popularny, częste promocje 1. roku | `.com`, `.me` |

Dla osobistego portfolio dobrze wyglądają: `imie.me`, `imienazwisko.com`,
`imie-cas.com`. `.dev` wymaga HTTPS (GitHub i tak daje za darmo).
