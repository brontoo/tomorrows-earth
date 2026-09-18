import { eq, and, count, inArray, desc, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  User, InsertUser, users, 
  academicYears, AcademicYear, InsertAcademicYear,
  sustainabilityZones, SustainabilityZone, InsertSustainabilityZone,
  missions, Mission, InsertMission,
  missionCompletions, MissionCompletion, InsertMissionCompletion,
  sustainabilityPointEvents, SustainabilityPointEvent, InsertSustainabilityPointEvent,
  sustainabilityLevels, SustainabilityLevel, InsertSustainabilityLevel,
  badges, Badge, InsertBadge,
  studentBadges, StudentBadge, InsertStudentBadge,
  impactEntries, ImpactEntry, InsertImpactEntry,
  categories, InsertCategory,
  subcategories, InsertSubcategory,
  projects, InsertProject,
  journeyPosts, InsertJourneyPost,
  comments, InsertComment,
  votes, InsertVote,
  systemConfig, InsertSystemConfig,
  resources, InsertResource,
  notifications, InsertNotification,
  teachers, InsertTeacher,
  assignments, InsertAssignment, Assignment,
  projectFeedback, InsertProjectFeedback,
  rubrics, InsertRubric,
  rubricScores, InsertRubricScore,
  messages, InsertMessage,
  teacherAnalytics, InsertTeacherAnalytics,
  submissionHistory, InsertSubmissionHistory
} from "../drizzle/schema.js";
import { ENV } from './_core/env.js';
import { getStaffRegistryEntryByEmail } from "./staffRegistry.js";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: postgres.Sql | null = null;

export async function getDb() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!_db && dbUrl) {
    try {
      // Log connection attempt (masking sensitive info)
      const maskedUrl = dbUrl.replace(/:([^@]+)@/, ":****@");
      console.log(`[Database] Attempting to connect to: ${maskedUrl}`);
      
      _client = postgres(dbUrl, {
        // Connection options to help troubleshooting
        connect_timeout: 10,
        idle_timeout: 20,
        max_lifetime: 60 * 30,
      });
      _db = drizzle(_client);
    } catch (error) {
      console.error("[Database] CRITICAL: Failed to connect to PostgreSQL:", error);
      _db = null;
    }
  } else if (!_db && !dbUrl) {
    console.error("[Database] ERROR: DATABASE_URL is missing in environment variables!");
  }
  return _db;
}

// ============ USER MANAGEMENT ============

export async function upsertUser(user: InsertUser) {
  if (!user.email) {
    throw new Error("User email is required for upsert");
  }

  const normalizedEmail = user.email.toLowerCase();
  const canonicalStaff = getStaffRegistryEntryByEmail(normalizedEmail);

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return undefined;
  }

  try {
    const values: InsertUser = {
      email: normalizedEmail,
      openId: user.openId ?? undefined,
    };
    const updateSet: Record<string, any> = {};

    // Handle optional fields
    const optionalFields = [
      "name", "grade", "schoolClass", "loginMethod", "passwordHash", 
      "passwordResetToken", "emailVerified", "verificationToken", "verificationExpires",
      "openId"
    ] as const;
    
    optionalFields.forEach(field => {
      const value = user[field];
      if (value !== undefined) {
        (values as any)[field] = value;
        updateSet[field] = value;
      }
    });

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (canonicalStaff) {
      const canonicalRole = canonicalStaff.role === "admin"
        ? "admin"
        : canonicalStaff.role === "teacher"
          ? "teacher"
          : "public";
      values.role = canonicalRole;
      updateSet.role = canonicalRole;
      values.name = canonicalStaff.name;
      updateSet.name = canonicalStaff.name;
    } else if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.approved !== undefined) {
      values.approved = user.approved;
      updateSet.approved = user.approved;
    }
    if (user.passwordResetExpires !== undefined) {
      values.passwordResetExpires = user.passwordResetExpires;
      updateSet.passwordResetExpires = user.passwordResetExpires;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.email,
      set: updateSet,
    });

    // Fetch and return the created/updated user
    return await getUserByEmail(normalizedEmail);
  } catch (error) {
    console.error("[Database] CRITICAL: Failed to upsert user. Error details:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update password: database not available");
    return;
  }

  try {
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update password:", error);
    throw error;
  }
}

export async function verifyUserEmail(token: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);
    const user = result[0];

    if (!user) return undefined;

    // Check if token is expired (if expires field is set)
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return undefined;
    }

    await db.update(users).set({ 
      emailVerified: true, 
      verificationToken: null, 
      verificationExpires: null 
    }).where(eq(users.id, user.id));

    return await getUserByEmail(user.email);
  } catch (error) {
    console.error("[Database] Failed to verify email:", error);
    return undefined;
  }
}

// ============ CATEGORIES ============

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(categories).orderBy(categories.order);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function insertCategory(category: InsertCategory): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(categories).values(category);
}

// ============ SUBCATEGORIES ============

export async function getSubcategoriesByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(subcategories).where(eq(subcategories.categoryId, categoryId)).orderBy(subcategories.order);
}

export async function getSubcategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(subcategories).where(eq(subcategories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function insertSubcategory(subcategory: InsertSubcategory): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(subcategories).values(subcategory);
}

// ============ PROJECTS ============

export async function getProjectsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(projects).where(eq(projects.createdBy, studentId));
}

export async function getProjectsBySupervisor(supervisorId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(projects).where(eq(projects.supervisorId, supervisorId));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function insertProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values(project).returning({ id: projects.id });
  return result[0];
}

// ============ TEACHERS ============

export async function getAllTeachers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(teachers);
}

export async function getTeacherByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function isProjectReviewer(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const userResult = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userResult.length === 0) {
    return false;
  }

  if (userResult[0].role === "admin") {
    return true;
  }

  const teacherResult = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(eq(teachers.userId, userId))
    .limit(1);

  return teacherResult.length > 0;
}

// ============ NOTIFICATIONS ============
export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId));
}

export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
}

// ============ RESOURCES ============
export async function deleteResource(resourceId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(resources).where(eq(resources.id, resourceId));
}

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(notifications).values(data);
}

export async function getAllResources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources);
}

export async function getResourcesByType(type: "toolkit" | "rubric" | "faq" | "guide") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).where(eq(resources.type, type));
}

export async function createResource(data: InsertResource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(resources).values(data);
}

export async function updateResource(id: number, data: Partial<InsertResource>) {
  const db = await getDb();
  if (!db) return;
  await db.update(resources).set(data).where(eq(resources.id, id));
}

export async function getVotingLeaderboard() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    projectId: votes.projectId,
    voteCount: count(votes.id)
  }).from(votes).groupBy(votes.projectId);
  return result as Array<{ projectId: number; voteCount: number }>;
}

export async function getVotesByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(votes).where(eq(votes.projectId, projectId));
}

export async function getSystemConfig(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(systemConfig).where(eq(systemConfig.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setSystemConfig(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  const existing = await getSystemConfig(key);
  if (existing) {
    await db.update(systemConfig).set({ value }).where(eq(systemConfig.key, key));
  } else {
    await db.insert(systemConfig).values({ key, value });
  }
}

// ============ ACADEMIC YEARS ============

export async function getAcademicYears(): Promise<AcademicYear[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(academicYears).orderBy(academicYears.startDate);
}

export async function getCurrentAcademicYear(): Promise<AcademicYear | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(academicYears).where(eq(academicYears.isCurrent, true)).limit(1);
  return result[0];
}

export async function createAcademicYear(data: InsertAcademicYear): Promise<AcademicYear> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(academicYears).values(data).returning();
  return result[0];
}

export async function updateAcademicYear(
  id: number,
  updates: Partial<InsertAcademicYear>,
): Promise<AcademicYear | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .update(academicYears)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(academicYears.id, id))
    .returning();
  return result[0];
}

export async function setCurrentAcademicYear(id: number): Promise<AcademicYear | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.transaction(async (tx) => {
    await tx.update(academicYears).set({ isCurrent: false, updatedAt: new Date() });
    const result = await tx
      .update(academicYears)
      .set({ isCurrent: true, updatedAt: new Date() })
      .where(eq(academicYears.id, id))
      .returning();
    return result[0];
  });
}

// ============ SUSTAINABILITY ZONES ============

export async function getActiveSustainabilityZones(): Promise<SustainabilityZone[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sustainabilityZones)
    .where(eq(sustainabilityZones.isActive, true))
    .orderBy(sustainabilityZones.sortOrder);
}

export async function getAllSustainabilityZones(): Promise<SustainabilityZone[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sustainabilityZones).orderBy(sustainabilityZones.sortOrder);
}

export async function getSustainabilityZoneBySlug(slug: string): Promise<SustainabilityZone | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sustainabilityZones)
    .where(eq(sustainabilityZones.slug, slug)).limit(1);
  return result[0];
}

export async function createSustainabilityZone(data: InsertSustainabilityZone): Promise<SustainabilityZone> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sustainabilityZones).values(data).returning();
  return result[0];
}

export async function updateSustainabilityZone(
  id: number,
  updates: Partial<InsertSustainabilityZone>,
): Promise<SustainabilityZone | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(sustainabilityZones)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(sustainabilityZones.id, id))
    .returning();
  return result[0];
}

// ============ MISSIONS ============

export async function getPublishedMissions(filters?: { zoneId?: number; academicYearId?: number }): Promise<Mission[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(missions.isPublished, true)];
  if (filters?.zoneId !== undefined) conditions.push(eq(missions.zoneId, filters.zoneId));
  if (filters?.academicYearId !== undefined) conditions.push(eq(missions.academicYearId, filters.academicYearId));
  return db.select().from(missions).where(and(...conditions)).orderBy(missions.createdAt);
}

export async function getAllMissions(): Promise<Mission[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(missions).orderBy(missions.createdAt);
}

export async function getMissionBySlug(slug: string, includeUnpublished = false): Promise<Mission | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const conditions = [eq(missions.slug, slug)];
  if (!includeUnpublished) conditions.push(eq(missions.isPublished, true));
  const result = await db.select().from(missions).where(and(...conditions)).limit(1);
  return result[0];
}

export async function getMissionById(id: number, includeUnpublished = false): Promise<Mission | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const conditions = [eq(missions.id, id)];
  if (!includeUnpublished) conditions.push(eq(missions.isPublished, true));
  const result = await db.select().from(missions).where(and(...conditions)).limit(1);
  return result[0];
}

export async function createMission(data: InsertMission): Promise<Mission> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(missions).values(data).returning();
  return result[0];
}

export async function updateMission(id: number, updates: Partial<InsertMission>): Promise<Mission | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(missions)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(missions.id, id))
    .returning();
  return result[0];
}

// ============ MISSION COMPLETIONS ============

export async function getMissionCompletion(missionId: number, studentId: number, academicYearId: number): Promise<MissionCompletion | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(missionCompletions).where(and(
    eq(missionCompletions.missionId, missionId),
    eq(missionCompletions.studentId, studentId),
    eq(missionCompletions.academicYearId, academicYearId),
  )).limit(1);
  return result[0];
}

export async function createMissionCompletion(data: InsertMissionCompletion): Promise<MissionCompletion> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(missionCompletions).values(data).returning();
  return result[0];
}

export async function updateMissionCompletion(id: number, updates: Partial<InsertMissionCompletion>): Promise<MissionCompletion | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(missionCompletions)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(missionCompletions.id, id))
    .returning();
  return result[0];
}

export async function getMissionCompletionById(id: number): Promise<MissionCompletion | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(missionCompletions).where(eq(missionCompletions.id, id)).limit(1);
  return result[0];
}

export async function getMissionVerificationQueue(): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    completion: missionCompletions,
    missionTitle: missions.title,
    missionPoints: missions.pointsAvailable,
    studentName: users.name,
    studentEmail: users.email,
  })
    .from(missionCompletions)
    .innerJoin(missions, eq(missionCompletions.missionId, missions.id))
    .innerJoin(users, eq(missionCompletions.studentId, users.id))
    .where(inArray(missionCompletions.status, ["submitted", "verification_required"]))
    .orderBy(desc(missionCompletions.submittedAt));
}

export async function reviewMissionCompletion(input: {
  completionId: number;
  decision: "approve" | "request_revision" | "reject";
  reviewerId: number;
  feedback?: string;
  score?: number;
}): Promise<{ completion: MissionCompletion; pointsAwarded: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.transaction(async (tx) => {
    const completionRows = await tx.select().from(missionCompletions)
      .where(eq(missionCompletions.id, input.completionId)).limit(1);
    const completion = completionRows[0];
    if (!completion) throw new Error("Mission completion not found");
    if (completion.status !== "submitted" && completion.status !== "verification_required") {
      throw new Error("Mission completion is not awaiting verification");
    }

    const nextStatus = input.decision === "approve"
      ? "completed"
      : input.decision === "request_revision"
        ? "revision_requested"
        : "rejected";
    const updatedRows = await tx.update(missionCompletions).set({
      status: nextStatus,
      teacherFeedback: input.feedback ?? null,
      score: input.score ?? null,
      verifiedBy: input.decision === "approve" ? input.reviewerId : null,
      verifiedAt: input.decision === "approve" ? new Date() : null,
      completedAt: input.decision === "approve" ? new Date() : null,
      updatedAt: new Date(),
    }).where(eq(missionCompletions.id, input.completionId)).returning();
    const updated = updatedRows[0];
    let pointsAwarded = 0;

    if (input.decision === "approve") {
      const missionRows = await tx.select().from(missions).where(eq(missions.id, completion.missionId)).limit(1);
      const mission = missionRows[0];
      if (mission && mission.pointsAvailable > 0) {
        const pointRows = await tx.insert(sustainabilityPointEvents).values({
          studentId: completion.studentId,
          academicYearId: completion.academicYearId,
          sourceType: "mission",
          sourceId: completion.id,
          points: mission.pointsAvailable,
          reason: `Completed mission: ${mission.title}`,
          verificationStatus: "verified",
          verifiedBy: input.reviewerId,
          metadata: JSON.stringify({ missionId: mission.id }),
        }).onConflictDoNothing().returning();
        pointsAwarded = pointRows[0]?.points ?? 0;
      }
    }

    return { completion: updated, pointsAwarded };
  });
}

export async function getStudentPassport(studentId: number) {
  const academicYear = await getCurrentAcademicYear();
  if (!academicYear) return null;

  const events = await getPointEventsByStudent(studentId, academicYear.id);
  const totalPoints = events.reduce((total, event) => event.verificationStatus === "reversed" || event.verificationStatus === "rejected" ? total : total + event.points, 0);
  const levels = await (async () => {
    const database = await getDb();
    if (!database) return [] as SustainabilityLevel[];
    return database.select().from(sustainabilityLevels)
      .where(eq(sustainabilityLevels.isActive, true))
      .orderBy(sustainabilityLevels.minPoints);
  })();
  const currentLevel = [...levels].reverse().find((level) => level.minPoints <= totalPoints) ?? levels[0] ?? null;
  const nextLevel = levels.find((level) => level.minPoints > totalPoints) ?? null;

  const database = await getDb();
  if (!database) return { academicYear, totalPoints, currentLevel, nextLevel, completedMissions: 0, badges: [], recentEvents: events.slice(-5).reverse() };
  const completedRows = await database.select({ count: count(missionCompletions.id) })
    .from(missionCompletions)
    .where(and(
      eq(missionCompletions.studentId, studentId),
      eq(missionCompletions.academicYearId, academicYear.id),
      eq(missionCompletions.status, "completed"),
    ));
  const earnedBadges = await database.select({
    badge: badges,
    earnedAt: studentBadges.earnedAt,
    evidence: studentBadges.evidence,
  })
    .from(badges)
    .leftJoin(studentBadges, and(
      eq(studentBadges.badgeId, badges.id),
      eq(studentBadges.studentId, studentId),
      eq(studentBadges.academicYearId, academicYear.id),
    ))
    .where(eq(badges.isActive, true));

  return {
    academicYear,
    totalPoints,
    currentLevel,
    nextLevel,
    completedMissions: completedRows[0]?.count ?? 0,
    badges: earnedBadges,
    recentEvents: events.slice(-5).reverse(),
  };
}

// ============ VERIFIED IMPACT ============

export async function getStudentImpact(studentId: number, academicYearId?: number): Promise<ImpactEntry[]> {
  const database = await getDb();
  if (!database) return [];
  const conditions = [eq(impactEntries.studentId, studentId), eq(impactEntries.verificationStatus, "verified")];
  if (academicYearId !== undefined) conditions.push(eq(impactEntries.academicYearId, academicYearId));
  return database.select().from(impactEntries).where(and(...conditions)).orderBy(desc(impactEntries.createdAt));
}

export async function getSchoolImpactSummary(academicYearId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select({
    metricType: impactEntries.metricType,
    metricLabel: impactEntries.metricLabel,
    unit: impactEntries.unit,
    total: sum(impactEntries.quantity),
  }).from(impactEntries).where(and(
    eq(impactEntries.academicYearId, academicYearId),
    eq(impactEntries.verificationStatus, "verified"),
  )).groupBy(impactEntries.metricType, impactEntries.metricLabel, impactEntries.unit);
}

export async function createImpactEntry(data: InsertImpactEntry): Promise<ImpactEntry> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const result = await database.insert(impactEntries).values(data).returning();
  return result[0];
}

// ============ SUSTAINABILITY POINTS ============

export async function getPointEventsByStudent(studentId: number, academicYearId?: number): Promise<SustainabilityPointEvent[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(sustainabilityPointEvents.studentId, studentId)];
  if (academicYearId !== undefined) conditions.push(eq(sustainabilityPointEvents.academicYearId, academicYearId));
  return db.select().from(sustainabilityPointEvents)
    .where(and(...conditions))
    .orderBy(sustainabilityPointEvents.createdAt);
}

export async function getStudentPointTotal(studentId: number, academicYearId: number): Promise<number> {
  const events = await getPointEventsByStudent(studentId, academicYearId);
  return events.reduce((total, event) => {
    if (event.verificationStatus === "reversed" || event.verificationStatus === "rejected") return total;
    return total + event.points;
  }, 0);
}

export async function awardMissionPoints(
  completionId: number,
  verifiedBy?: number,
): Promise<SustainabilityPointEvent | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.transaction(async (tx) => {
    const completionRows = await tx.select().from(missionCompletions)
      .where(eq(missionCompletions.id, completionId)).limit(1);
    const completion = completionRows[0];
    if (!completion || (completion.status !== "verified" && completion.status !== "completed")) return undefined;

    const missionRows = await tx.select().from(missions).where(eq(missions.id, completion.missionId)).limit(1);
    const mission = missionRows[0];
    if (!mission || mission.pointsAvailable <= 0) return undefined;

    const existing = await tx.select().from(sustainabilityPointEvents).where(and(
      eq(sustainabilityPointEvents.studentId, completion.studentId),
      eq(sustainabilityPointEvents.academicYearId, completion.academicYearId),
      eq(sustainabilityPointEvents.sourceType, "mission"),
      eq(sustainabilityPointEvents.sourceId, completionId),
    )).limit(1);
    if (existing[0]) return existing[0];

    const result = await tx.insert(sustainabilityPointEvents).values({
      studentId: completion.studentId,
      academicYearId: completion.academicYearId,
      sourceType: "mission",
      sourceId: completionId,
      points: mission.pointsAvailable,
      reason: `Completed mission: ${mission.title}`,
      verificationStatus: "verified",
      verifiedBy: verifiedBy ?? completion.verifiedBy,
      metadata: JSON.stringify({ missionId: mission.id }),
    }).returning();
    return result[0];
  });
}

export async function createComment(data: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(comments).values(data);
}

export async function deleteComment(commentId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(comments).where(eq(comments.id, commentId));
}

export async function hasUserVoted(voterIdentifier: string, projectId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(votes).where(and(eq(votes.voterIdentifier, voterIdentifier), eq(votes.projectId, projectId))).limit(1);
  return result.length > 0;
}

export async function createVote(data: InsertVote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(votes).values(data);
}

export async function getVotesByVoter(voterIdentifier: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ projectId: votes.projectId })
    .from(votes)
    .where(eq(votes.voterIdentifier, voterIdentifier));
}

export async function updateJourneyPost(id: number, data: Partial<InsertJourneyPost>) {
  const db = await getDb();
  if (!db) return;
  await db.update(journeyPosts).set(data).where(eq(journeyPosts.id, id));
}

export async function deleteJourneyPost(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(journeyPosts).where(eq(journeyPosts.id, id));
}

export async function getCommentsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(comments).where(eq(comments.projectId, projectId));
}

export async function getJourneyPostsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: journeyPosts.id,
      projectId: journeyPosts.projectId,
      title: journeyPosts.title,
      content: journeyPosts.content,
      imageUrls: journeyPosts.imageUrls,
      videoUrl: journeyPosts.videoUrl,
      weekNumber: journeyPosts.weekNumber,
      createdBy: journeyPosts.createdBy,
      createdAt: journeyPosts.createdAt,
      updatedAt: journeyPosts.updatedAt,
      studentName: users.name,
      studentEmail: users.email,
      projectTitle: projects.title,
      teamName: projects.teamName,
      projectGrade: projects.grade,
      projectCategoryId: projects.categoryId,
    })
    .from(journeyPosts)
    .leftJoin(users, eq(journeyPosts.createdBy, users.id))
    .leftJoin(projects, eq(journeyPosts.projectId, projects.id))
    .where(eq(journeyPosts.projectId, projectId));
}

export async function getAllJourneyPosts() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: journeyPosts.id,
      projectId: journeyPosts.projectId,
      title: journeyPosts.title,
      content: journeyPosts.content,
      imageUrls: journeyPosts.imageUrls,
      videoUrl: journeyPosts.videoUrl,
      weekNumber: journeyPosts.weekNumber,
      createdBy: journeyPosts.createdBy,
      createdAt: journeyPosts.createdAt,
      updatedAt: journeyPosts.updatedAt,
      studentName: users.name,
      studentEmail: users.email,
      projectTitle: projects.title,
      teamName: projects.teamName,
      projectGrade: projects.grade,
      projectCategoryId: projects.categoryId,
    })
    .from(journeyPosts)
    .leftJoin(users, eq(journeyPosts.createdBy, users.id))
    .leftJoin(projects, eq(journeyPosts.projectId, projects.id));
}

export async function createJourneyPost(data: InsertJourneyPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(journeyPosts).values(data);
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projects).where(eq(projects.id, id));
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(projects).values(data);
}

export async function getProjectStats() {
  const db = await getDb();
  if (!db) return { totalProjects: 0, totalStudents: 0, totalCategories: 0 };
  const projectList = await db.select().from(projects);
  const categoryList = await db.select().from(categories);
  return {
    totalProjects: projectList.length,
    totalStudents: new Set(projectList.map(p => p.createdBy)).size,
    totalCategories: categoryList.length,
  };
}

export async function getProjectsBySubcategory(subcategoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.subcategoryId, subcategoryId));
}

export async function getProjectsByStatus(status: "approved" | "draft" | "submitted" | "rejected" | "finalist") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.status, status));
}

export async function getProjectsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.createdBy, userId));
}

export async function updateTeacher(id: number, data: Partial<InsertTeacher>) {
  const db = await getDb();
  if (!db) return;
  await db.update(teachers).set(data).where(eq(teachers.id, id));
}

export async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects);
}

export async function getPublicProjects() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: projects.id,
      title: projects.title,
      teamName: projects.teamName,
      grade: projects.grade,
      status: projects.status,
      thumbnailUrl: projects.thumbnailUrl,
      abstract: projects.abstract,
      categoryId: projects.categoryId,
      subcategoryId: projects.subcategoryId,
    })
    .from(projects)
    .where(inArray(projects.status, ["approved", "finalist"]));
}

export async function getProjectsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.categoryId, categoryId));
}

export async function updateSubcategory(id: number, data: Partial<InsertSubcategory>) {
  const db = await getDb();
  if (!db) return;
  await db.update(subcategories).set(data).where(eq(subcategories.id, id));
}

export async function getAllTeachersWithInfo() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: teachers.id,
      userId: teachers.userId,
      department: teachers.department,
      expertise: teachers.expertise,
      maxStudents: teachers.maxStudents,
      currentStudents: teachers.currentStudents,
      createdAt: teachers.createdAt,
      updatedAt: teachers.updatedAt,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id));
}

export async function createTeacher(data: InsertTeacher) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(teachers).values(data);
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(categories).values(data);
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) return;
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function createSubcategory(data: InsertSubcategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(subcategories).values(data);
}

export async function approveTeacher(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role: "teacher" }).where(eq(users.id, userId));
}

export async function updateUserRole(userId: number, role: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role: role as any }).where(eq(users.id, userId));
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPendingTeachers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.role, "teacher"));
}


// ============ STUDENT ASSIGNMENTS ============

export async function getAssignmentByStudentId(studentId: number): Promise<Assignment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(assignments).where(eq(assignments.studentId, studentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAssignment(data: InsertAssignment): Promise<Assignment | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(assignments).values(data);
  return getAssignmentByStudentId(data.studentId);
}

export async function updateAssignment(
  studentId: number,
  data: Pick<InsertAssignment, "teacherName" | "mainCategoryId" | "subcategoryId">
): Promise<Assignment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db
    .update(assignments)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(assignments.studentId, studentId));
  return getAssignmentByStudentId(studentId);
}

export async function updateAssignmentStatus(studentId: number, status: "assigned" | "unlocked" | "reset"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(assignments).set({ status }).where(eq(assignments.studentId, studentId));
}

export async function resetAssignment(studentId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(assignments).set({ status: "unlocked" }).where(eq(assignments.studentId, studentId));
}

export async function getAllAssignments(): Promise<Assignment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assignments);
}

export async function getAssignmentsByTeacherName(teacherName: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: assignments.id,
      studentId: assignments.studentId,
      studentName: users.name,
      studentEmail: users.email,
      teacherName: assignments.teacherName,
      mainCategoryId: assignments.mainCategoryId,
      categoryName: categories.name,
      subcategoryId: assignments.subcategoryId,
      subcategoryName: subcategories.name,
      status: assignments.status,
      assignedAt: assignments.assignedAt,
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.studentId, users.id))
    .leftJoin(categories, eq(assignments.mainCategoryId, categories.id))
    .leftJoin(subcategories, eq(assignments.subcategoryId, subcategories.id))
    .where(eq(assignments.teacherName, teacherName));
}

export async function getAssignmentsByStatus(status: "assigned" | "unlocked" | "reset"): Promise<Assignment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assignments).where(eq(assignments.status, status));
}


// ============ TEACHER DASHBOARD - FEEDBACK & GRADING ============

export async function createProjectFeedback(feedback: InsertProjectFeedback): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(projectFeedback).values(feedback);
}

export async function getProjectFeedback(projectId: number): Promise<any> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(projectFeedback).where(eq(projectFeedback.projectId, projectId));
  return result[0] || null;
}

export async function updateProjectFeedback(feedbackId: number, updates: Partial<InsertProjectFeedback>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(projectFeedback).set(updates).where(eq(projectFeedback.id, feedbackId));
}

export async function getTeacherFeedbacks(teacherId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectFeedback).where(eq(projectFeedback.teacherId, teacherId));
}

// ============ TEACHER DASHBOARD - RUBRICS ============

export async function createRubric(rubric: InsertRubric): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(rubrics).values(rubric);
}

export async function getTeacherRubrics(teacherId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rubrics).where(eq(rubrics.teacherId, teacherId));
}

export async function getRubricById(rubricId: number): Promise<any> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(rubrics).where(eq(rubrics.id, rubricId));
  return result[0] || null;
}

export async function updateRubric(rubricId: number, updates: Partial<InsertRubric>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(rubrics).set(updates).where(eq(rubrics.id, rubricId));
}

export async function deleteRubric(rubricId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(rubrics).where(eq(rubrics.id, rubricId));
}

// ============ TEACHER DASHBOARD - RUBRIC SCORES ============

export async function createRubricScore(score: InsertRubricScore): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(rubricScores).values(score);
}

export async function getRubricScores(feedbackId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rubricScores).where(eq(rubricScores.feedbackId, feedbackId));
}

// ============ TEACHER DASHBOARD - MESSAGING ============

export async function sendMessage(message: InsertMessage): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(messages).values(message);
}

export async function getTeacherMessages(teacherId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.senderId, teacherId));
}

export async function getStudentMessages(studentId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.recipientId, studentId));
}

export async function markMessageAsRead(messageId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(messages).set({ isRead: true, readAt: new Date() }).where(eq(messages.id, messageId));
}

// ============ TEACHER DASHBOARD - ANALYTICS ============

export async function createTeacherAnalytics(analytics: InsertTeacherAnalytics): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(teacherAnalytics).values(analytics);
}

export async function getTeacherAnalytics(teacherId: number, date: string): Promise<any> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(teacherAnalytics).where(
    and(eq(teacherAnalytics.teacherId, teacherId), eq(teacherAnalytics.date, date))
  );
  return result[0] || null;
}

export async function updateTeacherAnalytics(analyticsId: number, updates: Partial<InsertTeacherAnalytics>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(teacherAnalytics).set(updates).where(eq(teacherAnalytics.id, analyticsId));
}

// ============ TEACHER DASHBOARD - SUBMISSION HISTORY ============

export async function createSubmissionHistory(history: InsertSubmissionHistory): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(submissionHistory).values(history);
}

export async function getProjectHistory(projectId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(submissionHistory).where(eq(submissionHistory.projectId, projectId));
}

export async function updateProjectStatusWithHistory(
  projectId: number,
  updates: Partial<InsertProject>,
  history: Omit<InsertSubmissionHistory, "projectId">,
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.transaction(async (tx) => {
    await tx.update(projects).set(updates).where(eq(projects.id, projectId));
    await tx.insert(submissionHistory).values({ ...history, projectId });
  });
}

// ============ TEACHER DASHBOARD - STUDENT SUBMISSIONS ============

export async function getTeacherStudentSubmissions(teacherId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  const scopedTeacherIds = await getTeacherScopeUserIds(teacherId);
  return db.select().from(projects).where(inArray(projects.supervisorId, scopedTeacherIds));
}

export async function getProjectsAwaitingReview(teacherId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  const scopedTeacherIds = await getTeacherScopeUserIds(teacherId);
  return db.select().from(projects).where(
    and(
      inArray(projects.supervisorId, scopedTeacherIds),
      eq(projects.status, "submitted")
    )
  );
}

export async function getTeacherStats(teacherId: number): Promise<{
  totalStudents: number;
  totalSubmissions: number;
  pendingReviews: number;
  completedReviews: number;
}> {
  const db = await getDb();
  if (!db) return { totalStudents: 0, totalSubmissions: 0, pendingReviews: 0, completedReviews: 0 };

  const scopedTeacherIds = await getTeacherScopeUserIds(teacherId);
  
  const submissionList = await db.select().from(projects).where(inArray(projects.supervisorId, scopedTeacherIds));
  const pending = submissionList.filter(p => p.status === "submitted").length;
  const completed = submissionList.filter(p => p.status === "approved" || p.status === "rejected").length;
  
  return {
    totalStudents: submissionList.length,
    totalSubmissions: submissionList.length,
    pendingReviews: pending,
    completedReviews: completed,
  };
}

async function getTeacherScopeUserIds(teacherId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [teacherId];

  const current = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, teacherId))
    .limit(1);

  if (current.length === 0) {
    return [teacherId];
  }

  const ids = new Set<number>([teacherId]);
  const user = current[0];

  if (user.email) {
    const sameEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "teacher"), eq(users.email, user.email)));

    sameEmail.forEach((row) => ids.add(row.id));
  }

  if (user.name) {
    const sameName = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "teacher"), eq(users.name, user.name)));

    sameName.forEach((row) => ids.add(row.id));
  }

  return Array.from(ids);
}
