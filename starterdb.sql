/*
 Navicat Premium Dump SQL

 Source Server         : Local-PostgreSQL
 Source Server Type    : PostgreSQL
 Source Server Version : 170002 (170002)
 Source Host           : localhost:5432
 Source Catalog        : starterdb
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 170002 (170002)
 File Encoding         : 65001

 Date: 24/02/2025 01:22:01
*/


-- ----------------------------
-- Sequence structure for Branch_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."Branch_id_seq";
CREATE SEQUENCE "public"."Branch_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for LoginLog_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."LoginLog_id_seq";
CREATE SEQUENCE "public"."LoginLog_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for RefreshToken_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."RefreshToken_id_seq";
CREATE SEQUENCE "public"."RefreshToken_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for Role_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."Role_id_seq";
CREATE SEQUENCE "public"."Role_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for UserRole_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."UserRole_id_seq";
CREATE SEQUENCE "public"."UserRole_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for User_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."User_id_seq";
CREATE SEQUENCE "public"."User_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Table structure for Branch
-- ----------------------------
DROP TABLE IF EXISTS "public"."Branch";
CREATE TABLE "public"."Branch" (
  "id" int4 NOT NULL DEFAULT nextval('"Branch_id_seq"'::regclass),
  "branchCode" text COLLATE "pg_catalog"."default" NOT NULL,
  "branchName" text COLLATE "pg_catalog"."default" NOT NULL,
  "address" text COLLATE "pg_catalog"."default",
  "phone" text COLLATE "pg_catalog"."default",
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL,
  "del" int4 NOT NULL DEFAULT 0
)
;

-- ----------------------------
-- Records of Branch
-- ----------------------------
INSERT INTO "public"."Branch" VALUES (2, '018', 'รังสิตคลอง 8', '', '', '2025-02-23 18:15:06.505', '2025-02-23 18:15:06.505', 0);
INSERT INTO "public"."Branch" VALUES (1, '001', 'สนญ.', '', '', '2025-02-23 18:12:36.999', '2025-02-23 18:14:27.48', 0);

-- ----------------------------
-- Table structure for LoginLog
-- ----------------------------
DROP TABLE IF EXISTS "public"."LoginLog";
CREATE TABLE "public"."LoginLog" (
  "id" int4 NOT NULL DEFAULT nextval('"LoginLog_id_seq"'::regclass),
  "userId" int4,
  "loginTime" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" text COLLATE "pg_catalog"."default",
  "success" bool NOT NULL,
  "del" int4 NOT NULL DEFAULT 0
)
;

-- ----------------------------
-- Records of LoginLog
-- ----------------------------
INSERT INTO "public"."LoginLog" VALUES (1, 1, '2025-02-23 18:06:06.365', '127.0.0.1', 't', 0);

-- ----------------------------
-- Table structure for RefreshToken
-- ----------------------------
DROP TABLE IF EXISTS "public"."RefreshToken";
CREATE TABLE "public"."RefreshToken" (
  "id" int4 NOT NULL DEFAULT nextval('"RefreshToken_id_seq"'::regclass),
  "token" text COLLATE "pg_catalog"."default" NOT NULL,
  "userId" int4 NOT NULL,
  "expiresAt" timestamp(3) NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" timestamp(3),
  "del" int4 NOT NULL DEFAULT 0
)
;

-- ----------------------------
-- Records of RefreshToken
-- ----------------------------
INSERT INTO "public"."RefreshToken" VALUES (1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQwMzMzOTY2LCJleHAiOjE3NDA5Mzg3NjZ9._Y_gcoLOXsrByOMri0fdRinZvyQ88qL3GdYPAhpa2m8', 1, '2025-03-02 18:06:06.372', '2025-02-23 18:06:06.373', NULL, 0);

-- ----------------------------
-- Table structure for Role
-- ----------------------------
DROP TABLE IF EXISTS "public"."Role";
CREATE TABLE "public"."Role" (
  "id" int4 NOT NULL DEFAULT nextval('"Role_id_seq"'::regclass),
  "roleName" text COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "canView" bool NOT NULL DEFAULT false,
  "canAdd" bool NOT NULL DEFAULT false,
  "canEdit" bool NOT NULL DEFAULT false,
  "canDelete" bool NOT NULL DEFAULT false,
  "del" int4 NOT NULL DEFAULT 0
)
;

-- ----------------------------
-- Records of Role
-- ----------------------------
INSERT INTO "public"."Role" VALUES (1, 'admin', 'administrator', 't', 't', 't', 't', 0);

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS "public"."User";
CREATE TABLE "public"."User" (
  "id" int4 NOT NULL DEFAULT nextval('"User_id_seq"'::regclass),
  "username" text COLLATE "pg_catalog"."default" NOT NULL,
  "email" text COLLATE "pg_catalog"."default" NOT NULL,
  "passwordHash" text COLLATE "pg_catalog"."default" NOT NULL,
  "branchId" int4,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL,
  "del" int4 NOT NULL DEFAULT 0
)
;

-- ----------------------------
-- Records of User
-- ----------------------------
INSERT INTO "public"."User" VALUES (1, 'admin', 'admin@example.com', '$2b$10$9J7pUC40nFP2NLxJrCKcMec/IrnscfE0nUWO1N77bocn/EBcB5nWy', NULL, '2025-02-23 18:05:49.482', '2025-02-23 18:05:49.482', 0);

-- ----------------------------
-- Table structure for UserRole
-- ----------------------------
DROP TABLE IF EXISTS "public"."UserRole";
CREATE TABLE "public"."UserRole" (
  "id" int4 NOT NULL DEFAULT nextval('"UserRole_id_seq"'::regclass),
  "userId" int4 NOT NULL,
  "roleId" int4 NOT NULL,
  "del" int4 NOT NULL DEFAULT 0
)
;

-- ----------------------------
-- Records of UserRole
-- ----------------------------
INSERT INTO "public"."UserRole" VALUES (1, 1, 1, 0);

-- ----------------------------
-- Table structure for _prisma_migrations
-- ----------------------------
DROP TABLE IF EXISTS "public"."_prisma_migrations";
CREATE TABLE "public"."_prisma_migrations" (
  "id" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "checksum" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "finished_at" timestamptz(6),
  "migration_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "logs" text COLLATE "pg_catalog"."default",
  "rolled_back_at" timestamptz(6),
  "started_at" timestamptz(6) NOT NULL DEFAULT now(),
  "applied_steps_count" int4 NOT NULL DEFAULT 0
)
;

-- ----------------------------
-- Records of _prisma_migrations
-- ----------------------------
INSERT INTO "public"."_prisma_migrations" VALUES ('a7a9c076-0ee1-46f6-b76a-a988bf5a1cf3', '99d87aaf160fbdfd3d31dcc37cb7e23e282e4967687bd4d757a84eb5d2fe501c', '2025-02-24 01:03:56.503642+07', '20250223180356_init', NULL, NULL, '2025-02-24 01:03:56.46176+07', 1);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."Branch_id_seq"
OWNED BY "public"."Branch"."id";
SELECT setval('"public"."Branch_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."LoginLog_id_seq"
OWNED BY "public"."LoginLog"."id";
SELECT setval('"public"."LoginLog_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."RefreshToken_id_seq"
OWNED BY "public"."RefreshToken"."id";
SELECT setval('"public"."RefreshToken_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."Role_id_seq"
OWNED BY "public"."Role"."id";
SELECT setval('"public"."Role_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."UserRole_id_seq"
OWNED BY "public"."UserRole"."id";
SELECT setval('"public"."UserRole_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."User_id_seq"
OWNED BY "public"."User"."id";
SELECT setval('"public"."User_id_seq"', 1, true);

-- ----------------------------
-- Indexes structure for table Branch
-- ----------------------------
CREATE UNIQUE INDEX "Branch_branchCode_key" ON "public"."Branch" USING btree (
  "branchCode" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table Branch
-- ----------------------------
ALTER TABLE "public"."Branch" ADD CONSTRAINT "Branch_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table LoginLog
-- ----------------------------
ALTER TABLE "public"."LoginLog" ADD CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table RefreshToken
-- ----------------------------
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "public"."RefreshToken" USING btree (
  "token" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table RefreshToken
-- ----------------------------
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table Role
-- ----------------------------
CREATE UNIQUE INDEX "Role_roleName_key" ON "public"."Role" USING btree (
  "roleName" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table Role
-- ----------------------------
ALTER TABLE "public"."Role" ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table User
-- ----------------------------
CREATE UNIQUE INDEX "User_email_key" ON "public"."User" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "User_username_key" ON "public"."User" USING btree (
  "username" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table User
-- ----------------------------
ALTER TABLE "public"."User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table UserRole
-- ----------------------------
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "public"."UserRole" USING btree (
  "userId" "pg_catalog"."int4_ops" ASC NULLS LAST,
  "roleId" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table UserRole
-- ----------------------------
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table _prisma_migrations
-- ----------------------------
ALTER TABLE "public"."_prisma_migrations" ADD CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table LoginLog
-- ----------------------------
ALTER TABLE "public"."LoginLog" ADD CONSTRAINT "LoginLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table RefreshToken
-- ----------------------------
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table User
-- ----------------------------
ALTER TABLE "public"."User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table UserRole
-- ----------------------------
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
