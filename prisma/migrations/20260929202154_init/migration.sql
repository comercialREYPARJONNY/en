-- CreateEnum
CREATE TYPE "Seniority" AS ENUM ('LESS_THAN_1_YEAR', 'ONE_TO_THREE_YEARS', 'MORE_THAN_3_YEARS');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('LIKERT', 'SATISFACTION', 'NPS', 'FREQUENCY', 'RANKING', 'OPEN');

-- CreateEnum
CREATE TYPE "PriorityDimension" AS ENUM ('COMMUNICATION', 'DECISIONS', 'COMMERCIAL_TRAINING', 'TECHNICAL_TRAINING', 'METHODOLOGY');

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leader" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyBlock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "scored" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SurveyBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "shortLabel" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "allowComment" BOOLEAN NOT NULL DEFAULT false,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "inResults" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrequencyOption" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "FrequencyOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "strengthThreshold" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "improveThreshold" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "alertThreshold" DOUBLE PRECISION NOT NULL DEFAULT 3.5,
    "favorableMin" INTEGER NOT NULL DEFAULT 4,
    "frequencyGapThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "minResponsesForSegment" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" UUID NOT NULL,
    "surveyId" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "seniority" "Seniority" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyAnswer" (
    "id" TEXT NOT NULL,
    "responseId" UUID NOT NULL,
    "questionId" TEXT NOT NULL,
    "numericValue" INTEGER,
    "isNotApplicable" BOOLEAN NOT NULL DEFAULT false,
    "optionValue" TEXT,
    "textValue" TEXT,
    "comment" TEXT,

    CONSTRAINT "SurveyAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriorityRank" (
    "id" TEXT NOT NULL,
    "responseId" UUID NOT NULL,
    "dimension" "PriorityDimension" NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "PriorityRank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Leader_name_key" ON "Leader"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyBlock_name_key" ON "SurveyBlock"("name");

-- CreateIndex
CREATE INDEX "Question_blockId_idx" ON "Question"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "FrequencyOption_label_key" ON "FrequencyOption"("label");

-- CreateIndex
CREATE INDEX "SurveyResponse_leaderId_idx" ON "SurveyResponse"("leaderId");

-- CreateIndex
CREATE INDEX "SurveyResponse_surveyId_idx" ON "SurveyResponse"("surveyId");

-- CreateIndex
CREATE INDEX "SurveyResponse_completedAt_idx" ON "SurveyResponse"("completedAt");

-- CreateIndex
CREATE INDEX "SurveyAnswer_questionId_idx" ON "SurveyAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyAnswer_responseId_questionId_key" ON "SurveyAnswer"("responseId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "PriorityRank_responseId_dimension_key" ON "PriorityRank"("responseId", "dimension");

-- CreateIndex
CREATE UNIQUE INDEX "PriorityRank_responseId_rank_key" ON "PriorityRank"("responseId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "SurveyBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Leader"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriorityRank" ADD CONSTRAINT "PriorityRank_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
