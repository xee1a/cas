PHOTO ORGANISATION (CAS evidence)

Convention: one folder per PERSON + STRAND, in the format:
    <name>_<strand>
e.g. alex_activity, alex_service, alex_creativity

That way, when friends add their CAS, everyone has their own folders
(e.g. kuba_service, ania_creativity) and nothing gets mixed up.

Folders that already exist:
    alex_activity/     -> photos for Activity experiences (e.g. swimming)
    alex_service/      -> photos for Service (Food Not Bombs, lawn)
    alex_creativity/   -> photos for Creativity (e.g. chess) — empty for now

HOW TO ADD A PHOTO:
1. Put the file in the right folder, e.g. public/images/alex_creativity/chess.jpg
2. In the entry file (.md), under "gallery", give the full path:

   gallery:
     - src: /images/alex_creativity/chess.jpg
       caption: "Photo caption"

Note: the path always starts with /images/... (no "public").
Formats: .jpg .jpeg .png .webp

Current photos:
   alex_activity/karnet.jpg              -> plywanie.md (Swimming)
   alex_activity/sep15..sep25.png        -> plywanie.md (Apple Fitness screenshots)
   alex_service/trawnik-przed.jpg        -> koszenie-trawnika.md
   alex_service/trawnik-po.jpg           -> koszenie-trawnika.md
   alex_service/food-not-bombs1.jpg      -> food-not-bombs.md
   alex_service/food-not-bombs2.jpg      -> food-not-bombs.md
