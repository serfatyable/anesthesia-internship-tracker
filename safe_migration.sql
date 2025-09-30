-- AlterTable
ALTER TABLE "public"."Rotation" ALTER COLUMN "state" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Verification" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "public"."VerificationStatus";

-- CreateTable
CREATE TABLE "public"."QuizResult" (
    "id" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reflection" (
    "id" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image1Url" TEXT,
    "image2Url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reflection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Case" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image1Url" TEXT,
    "image2Url" TEXT,
    "image3Url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProcedureKnowledgeFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcedureKnowledgeFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MentorFeedback" (
    "id" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TutorFavoriteIntern" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "internId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorFavoriteIntern_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizResult_internId_idx" ON "public"."QuizResult"("internId");

-- CreateIndex
CREATE INDEX "QuizResult_itemId_itemType_idx" ON "public"."QuizResult"("itemId", "itemType");

-- CreateIndex
CREATE UNIQUE INDEX "QuizResult_internId_itemId_itemType_key" ON "public"."QuizResult"("internId", "itemId", "itemType");

-- CreateIndex
CREATE INDEX "Reflection_internId_idx" ON "public"."Reflection"("internId");

-- CreateIndex
CREATE INDEX "Reflection_itemId_itemType_idx" ON "public"."Reflection"("itemId", "itemType");

-- CreateIndex
CREATE UNIQUE INDEX "Reflection_internId_itemId_itemType_key" ON "public"."Reflection"("internId", "itemId", "itemType");

-- CreateIndex
CREATE INDEX "Case_category_idx" ON "public"."Case"("category");

-- CreateIndex
CREATE INDEX "Case_createdAt_idx" ON "public"."Case"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_caseId_idx" ON "public"."Comment"("caseId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "public"."Comment"("parentId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "public"."Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_caseId_idx" ON "public"."Favorite"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_caseId_key" ON "public"."Favorite"("userId", "caseId");

-- CreateIndex
CREATE INDEX "ProcedureKnowledgeFavorite_userId_idx" ON "public"."ProcedureKnowledgeFavorite"("userId");

-- CreateIndex
CREATE INDEX "ProcedureKnowledgeFavorite_itemId_itemType_idx" ON "public"."ProcedureKnowledgeFavorite"("itemId", "itemType");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureKnowledgeFavorite_userId_itemId_itemType_key" ON "public"."ProcedureKnowledgeFavorite"("userId", "itemId", "itemType");

-- CreateIndex
CREATE INDEX "MentorFeedback_internId_idx" ON "public"."MentorFeedback"("internId");

-- CreateIndex
CREATE INDEX "MentorFeedback_mentorId_idx" ON "public"."MentorFeedback"("mentorId");

-- CreateIndex
CREATE INDEX "MentorFeedback_itemId_itemType_idx" ON "public"."MentorFeedback"("itemId", "itemType");

-- CreateIndex
CREATE INDEX "MentorFeedback_internId_itemId_itemType_idx" ON "public"."MentorFeedback"("internId", "itemId", "itemType");

-- CreateIndex
CREATE INDEX "TutorFavoriteIntern_tutorId_idx" ON "public"."TutorFavoriteIntern"("tutorId");

-- CreateIndex
CREATE INDEX "TutorFavoriteIntern_internId_idx" ON "public"."TutorFavoriteIntern"("internId");

-- CreateIndex
CREATE UNIQUE INDEX "TutorFavoriteIntern_tutorId_internId_key" ON "public"."TutorFavoriteIntern"("tutorId", "internId");

-- CreateIndex
CREATE INDEX "Verification_status_idx" ON "public"."Verification"("status");

-- AddForeignKey
ALTER TABLE "public"."QuizResult" ADD CONSTRAINT "QuizResult_internId_fkey" FOREIGN KEY ("internId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reflection" ADD CONSTRAINT "Reflection_internId_fkey" FOREIGN KEY ("internId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Case" ADD CONSTRAINT "Case_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProcedureKnowledgeFavorite" ADD CONSTRAINT "ProcedureKnowledgeFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MentorFeedback" ADD CONSTRAINT "MentorFeedback_internId_fkey" FOREIGN KEY ("internId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MentorFeedback" ADD CONSTRAINT "MentorFeedback_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorFavoriteIntern" ADD CONSTRAINT "TutorFavoriteIntern_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorFavoriteIntern" ADD CONSTRAINT "TutorFavoriteIntern_internId_fkey" FOREIGN KEY ("internId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

