# Contributions (travail en binôme)

Tous les commits non-merge ont été relus. Les commits signés **JohnnyJohnnyJohn** sont attribués à Fethi. Nous avons conçu et livré ensemble une architecture hexagonale avec persistance Prisma/SQLite, providers météo/geo/NLP/Vision, un scoring robuste et une UI cartographique Leaflet.

## Alex
- Mise en place & outillage : initialisation du dépôt, configuration Prisma/env, nettoyage lint/format, base des scripts.
- Domaine & scoring : définition des contrats hexagonaux, service de MoodScore, affinage des modificateurs météo, séries de tests de scoring pour couvrir les cas soleil/pluie/froid/chaleur/humidité et sentiments (texte/image).
- Application & infrastructure : création des adapters de providers (geo, météo, NLP, Vision) derrière les ports, mocks systématiques, mapping des icônes météo, persistance API multi-stockage (mémoire/localStorage/API), intégration cohérente via ports.
- UI/UX : refonte de l’interface avec carte Leaflet plein écran et contrôles flottants, itérations sur MoodCapture (géolocalisation, caméra, persistance, gestion d’image et météo), renforcement des tests UI/flow.

## Fethi (Fethi-Dev-ID / JohnnyJohnnyJohn)
- Domaine & scoring : première implémentation du scoring et des services mock, jeux de tests couvrant météo et sentiment, intégration directe du scoring dans les écrans.
- Application & infrastructure : ajout des use cases avec fakes et tests, dépôt Prisma pour SQLite, durcissement du service météo (appel API + gestion d’erreurs), repository Prisma pour les moods.
- UI/UX : améliorations CameraCapture et MoodCapture (clear, hydratation, gestion des images), store mémoire + formatter + tests, refactors AddMoodModal et composants pour une expérience plus fluide, enrichissements UI/styles.
- Documentation : mise à jour du README sur les objectifs, la structure et les phases du projet.

## Travail conjoint
- Définition et respect des couches (domain → application → infrastructure) avec UI alignée sur les ports/stores.
- Persistance Prisma/SQLite et API Express (`/api/moods`) consommée par le front.
- Stratégie de mocks déterministes pour garantir la stabilité des tests et le développement hors-ligne.

