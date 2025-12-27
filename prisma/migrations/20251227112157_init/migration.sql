-- CreateTable
CREATE TABLE "Mood" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "placeName" TEXT NOT NULL,
    "weatherSummary" TEXT,
    "weatherIcon" TEXT,
    "imageUrl" TEXT,
    "textSentimentScore" REAL,
    "imageSentimentScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
