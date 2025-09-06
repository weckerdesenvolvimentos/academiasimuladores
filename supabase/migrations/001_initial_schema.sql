-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('LINK', 'EMBED', 'FILE', 'NONE');

-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('IDEIA', 'PROTOTIPO', 'PILOTO', 'PRODUCAO');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('VIEWER', 'EDITOR', 'ADMIN');

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subareas" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulator_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "codeBase" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulator_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulator_disciplines" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "subareaId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "learningObjectives" TEXT NOT NULL,
    "gameMechanics" TEXT NOT NULL,
    "kpis" TEXT NOT NULL,
    "syllabus" TEXT,
    "devObjectives" TEXT,
    "attachmentType" "AttachmentType" NOT NULL DEFAULT 'NONE',
    "attachmentUrl" TEXT,
    "attachmentFilePath" TEXT,
    "attachmentEmbedHtml" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulator_disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'IDEIA',
    "reach" DOUBLE PRECISION NOT NULL,
    "impact" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "effort" DOUBLE PRECISION NOT NULL,
    "riceScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "areas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "areas_slug_key" ON "areas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subareas_areaId_name_key" ON "subareas"("areaId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "simulator_disciplines_code_key" ON "simulator_disciplines"("code");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_groupId_key" ON "roadmap"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "subareas" ADD CONSTRAINT "subareas_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulator_disciplines" ADD CONSTRAINT "simulator_disciplines_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "simulator_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulator_disciplines" ADD CONSTRAINT "simulator_disciplines_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulator_disciplines" ADD CONSTRAINT "simulator_disciplines_subareaId_fkey" FOREIGN KEY ("subareaId") REFERENCES "subareas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap" ADD CONSTRAINT "roadmap_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "simulator_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
