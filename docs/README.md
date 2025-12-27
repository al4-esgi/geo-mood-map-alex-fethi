# GeoMood Map — Guide technique

## 1) Fonctionnalités
GeoMood Map+ enregistre un ressenti (texte, note, photo éventuelle), détermine le lieu à partir des coordonnées GPS, récupère la météo instantanée, calcule un MoodScore en combinant texte, météo et image, puis stocke et affiche les entrées en liste et sur une carte.

## 2) Installation et lancement
1. Installer les dépendances :  
   `npm install`
2. Créer un `.env` à la racine, par exemple :  
   ```
   DATABASE_URL="file:./prisma/dev.db"
   VITE_API_URL="http://localhost:3001"
   # Clés optionnelles (mockées si absentes)
   VITE_WEATHER_API_KEY=""
   VITE_GCLOUD_NLP_KEY=""
   VITE_GCLOUD_VISION_KEY=""
   ```
3. Initialiser la base (SQLite par défaut) :  
   `npm run prisma:migrate:dev`
4. Démarrer l’API et le front :  
   `npm run dev:fullstack`  
   API sur `http://localhost:3001`, UI sur `http://localhost:5173`
5. Exécuter les tests (rangés dans `/tests`) :  
   `npm test`

## 3) Architecture (hexagonale)
- **Domain (`src/domain`)** : modèles, règles métier et ports (ex. `MoodScoreService`, interfaces des providers météo/geo/NLP/Vision). Aucun couplage framework.
- **Application (`src/application`)** : cas d’usage (`SaveMoodUseCase`, `ListMoodsUseCase`) et doubles/fakes pour les tests.
- **Infrastructure (`src/infrastructure`)** : adaptateurs des ports (repository Prisma, providers réels et mocks).
- **Presentation (`src/presentation`)** : UI React (MoodCapture, MoodMapPage) qui consomme stores/services sans accès direct à la base.
- **Persistence (`src/persistence`)** : stores côté UI (mémoire, localStorage, API).
- **Server (`/server`)** : API Express exposant `/api/moods` via le repository Prisma.
- **Tests (`/tests`)** : l’ensemble des tests Vitest, regroupés hors de `src`.

Principes retenus :
- Limiter le couplage : ports/adaptateurs ; le domaine reste isolé.
- Scoring centralisé : `MoodScoreService` (et son wrapper `computeMoodScore` pour l’UI/tests).
- Mocks déterministes quand une clé API manque ou en environnement de test, pour garder des scénarios fiables.

## 4) APIs et modes dégradés
- **Géolocalisation** : Nominatim (OpenStreetMap) via `getPlaceByCoords`, avec repli mock hors-ligne ou en test.
- **Météo** : OpenWeatherMap via `getWeatherByCoords`, avec mock déterministe si absence de clé ou erreur réseau.
- **Sentiment texte** : Google Cloud NLP (optionnel), avec fallback par mots-clés en l’absence de clé ou en test.
- **Sentiment image** : Google Vision (optionnel), avec mock labels/score si pas de clé ou en test.
- **Icônes** : URLs OpenWeather lorsque fournies.

## 5) Points d’attention
- L’UI utilise par défaut la persistance API : lancer le serveur et définir `DATABASE_URL`.
- SQLite est configuré par défaut ; adapter `DATABASE_URL` si vous changez de SGBD.
