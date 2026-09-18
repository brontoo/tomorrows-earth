import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc.js";
import * as adminDb from "../admin.js";
import * as db from "../db.js";

export const adminRouter = router({
  // User Management
  getAllUsers: adminProcedure.query(async () => {
    return adminDb.getAllUsers();
  }),
  
  getUsersByRole: adminProcedure
    .input(z.object({ role: z.string() }))
    .query(async ({ input }) => {
      return adminDb.getUsersByRole(input.role);
    }),
  
  updateUserStatus: adminProcedure
    .input(z.object({ userId: z.number(), approved: z.boolean() }))
    .mutation(async ({ input }) => {
      await adminDb.updateUserStatus(input.userId, input.approved);
      return { success: true };
    }),
  
  deleteUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      await adminDb.deleteUser(input.userId);
      return { success: true };
    }),

  // Analytics
  getPlatformStats: adminProcedure.query(async () => {
    return adminDb.getPlatformStats();
  }),

  // Event Settings
  getEventSettings: adminProcedure.query(async () => {
    return adminDb.getEventSettings();
  }),
  
  updateEventSettings: adminProcedure
    .input(z.object({
      eventDate: z.string().optional(),
      eventLocation: z.string().optional(),
      eventDescription: z.string().optional(),
      votingOpen: z.boolean().optional(),
      votingStartDate: z.string().optional(),
      votingEndDate: z.string().optional(),
      submissionDeadline: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await adminDb.updateEventSettings(input);
      return { success: true };
    }),

  academicYears: router({
    list: adminProcedure.query(() => db.getAcademicYears()),
    create: adminProcedure
      .input(z.object({
        label: z.string().min(1).max(20),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        pointsStartDate: z.coerce.date(),
        pointsEndDate: z.coerce.date(),
        expoStartDate: z.coerce.date().optional(),
        expoEndDate: z.coerce.date().optional(),
        isCurrent: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const created = await db.createAcademicYear({ ...input, isCurrent: false });
        if (input.isCurrent) await db.setCurrentAcademicYear(created.id);
        return { success: true, academicYearId: created.id };
      }),
    setCurrent: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const updated = await db.setCurrentAcademicYear(input.id);
        if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Academic year not found" });
        return { success: true, academicYear: updated };
      }),
  }),

  zones: router({
    list: adminProcedure.query(() => db.getAllSustainabilityZones()),
    create: adminProcedure
      .input(z.object({
        slug: z.string().min(1).max(120),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        icon: z.string().max(100).optional(),
        coverImage: z.string().url().optional(),
        theme: z.string().max(100).optional(),
        sortOrder: z.number().int().default(0),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const zone = await db.createSustainabilityZone(input);
        return { success: true, zoneId: zone.id };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        icon: z.string().max(100).optional(),
        coverImage: z.string().url().nullable().optional(),
        theme: z.string().max(100).optional(),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const zone = await db.updateSustainabilityZone(id, updates);
        if (!zone) throw new TRPCError({ code: "NOT_FOUND", message: "Sustainability zone not found" });
        return { success: true };
      }),
  }),

  missions: router({
    list: adminProcedure.query(() => db.getAllMissions()),
    create: adminProcedure
      .input(z.object({
        academicYearId: z.number().int().positive(),
        zoneId: z.number().int().positive(),
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(160),
        description: z.string().min(1),
        missionType: z.enum(["learn", "investigate", "act", "experience", "collaborate", "create"]),
        difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
        instructions: z.string().min(1),
        estimatedMinutes: z.number().int().positive(),
        pointsAvailable: z.number().int().nonnegative().default(0),
        evidenceRequired: z.boolean().default(false),
        verificationMethod: z.enum(["automatic", "teacher_review", "experience_result", "admin_review"]).default("teacher_review"),
        repeatPolicy: z.enum(["once", "once_per_term", "repeatable_capped", "teacher_assigned"]).default("once"),
        sdgIds: z.array(z.number().int().positive()).optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        isPublished: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { sdgIds, ...mission } = input;
        const created = await db.createMission({ ...mission, sdgIds: sdgIds ? JSON.stringify(sdgIds) : null, createdBy: ctx.user.id });
        return { success: true, missionId: created.id };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().min(1).optional(),
        instructions: z.string().min(1).optional(),
        pointsAvailable: z.number().int().nonnegative().optional(),
        evidenceRequired: z.boolean().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const mission = await db.updateMission(id, updates);
        if (!mission) throw new TRPCError({ code: "NOT_FOUND", message: "Mission not found" });
        return { success: true };
      }),
  }),

  // Voting Management
  getVotingStats: adminProcedure.query(async () => {
    return adminDb.getVotingStats();
  }),
  
  toggleVoting: adminProcedure
    .input(z.object({ open: z.boolean() }))
    .mutation(async ({ input }) => {
      await adminDb.toggleVoting(input.open);
      return { success: true };
    }),

  // Activity Logs
  getActivityLogs: adminProcedure
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      return adminDb.getActivityLogs(input?.limit ?? 50);
    }),

  // Journey Cinema Management
  getJourneyPosts: adminProcedure.query(async () => {
    return adminDb.getJourneyPostsForAdmin();
  }),

  deleteJourneyPost: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await adminDb.deleteJourneyPostForAdmin(input.id);
      return { success: true };
    }),

  // Project Management
  getAllProjects: adminProcedure.query(async () => {
    return adminDb.getAllProjectsForAdmin();
  }),

  deleteProject: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await adminDb.deleteProjectForAdmin(input.id);
        return { success: true };
      } catch (error) {
        if (error instanceof Error && error.message === "Project not found") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }

        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete project" });
      }
    }),
});
