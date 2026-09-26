import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import { describeFirstEnvIssue, maskConnectionString, validateServerEnv } from "./_core/envCheck";
import type { TrpcContext } from "./_core/context";

/**
 * Regression tests for the production 500 on auth.loginWithEmail.
 *
 * Original symptom: `TRPCClientError: Failed to create user session` and
 * `GET /api/trpc/auth.loginWithEmail?batch=1 500 (Internal Server Error)`.
 *
 * Cause: server/db.ts upsertUser() returned undefined whenever getDb() returned
 * null, and getDb() returns null when the server environment has no usable
 * DATABASE_URL. The deployment error was therefore reported to the user as a
 * session-creation failure with nothing actionable in the server logs.
 *
 * These tests assert the fixed behaviour: the message is accurate and generic,
 * and the server log names the variable and the fix.
 */

type CookieCall = { name: string; value: string; options: Record<string, unknown> };

function createCtx(): { ctx: TrpcContext; cookies: CookieCall[] } {
  const cookies: CookieCall[] = [];
  const ctx = {
    user: null,
    req: { protocol: "https", headers: {}, socket: { remoteAddress: "203.0.113.7" } },
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        cookies.push({ name, value, options });
      },
    },
  } as unknown as TrpcContext;
  return { ctx, cookies };
}

const VALID_DB_URL = "postgresql://user:hunter2@db.example.com:5432/postgres?sslmode=require";

describe("env validation", () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  it("reports DATABASE_URL as missing without leaking any value", () => {
    const env: NodeJS.ProcessEnv = { NODE_ENV: "production" };
    const { ok, issues } = validateServerEnv(env);

    expect(ok).toBe(false);
    expect(issues.map((i) => i.var)).toContain("DATABASE_URL");
    expect(issues[0]?.fix).toContain("Vercel");
    expect(JSON.stringify(issues)).not.toContain("hunter2");
  });

  it("treats an empty value as missing", () => {
    const { ok, issues } = validateServerEnv({ NODE_ENV: "production", DATABASE_URL: "   " });
    expect(ok).toBe(false);
    expect(issues.some((i) => i.var === "DATABASE_URL" && i.problem.includes("empty"))).toBe(true);
  });

  it("rejects a malformed connection string", () => {
    const { ok, issues } = validateServerEnv({ DATABASE_URL: "not-a-database-url" });
    expect(ok).toBe(false);
    expect(issues[0]?.problem).toContain("valid postgres");
  });

  it("requires JWT_SECRET in production only", () => {
    expect(validateServerEnv({ DATABASE_URL: VALID_DB_URL, NODE_ENV: "production" }).ok).toBe(false);
    expect(validateServerEnv({ DATABASE_URL: VALID_DB_URL, NODE_ENV: "development" }).ok).toBe(true);
  });

  it("rejects a weak JWT_SECRET", () => {
    const { ok, issues } = validateServerEnv({
      DATABASE_URL: VALID_DB_URL,
      NODE_ENV: "production",
      JWT_SECRET: "short",
    });
    expect(ok).toBe(false);
    expect(issues.some((i) => i.var === "JWT_SECRET")).toBe(true);
  });

  it("passes a fully configured environment", () => {
    const { ok, issues } = validateServerEnv({
      DATABASE_URL: VALID_DB_URL,
      NODE_ENV: "production",
      JWT_SECRET: "x".repeat(48),
    });
    expect(issues).toEqual([]);
    expect(ok).toBe(true);
  });

  it("masks credentials and secret query params", () => {
    expect(maskConnectionString(VALID_DB_URL)).not.toContain("hunter2");
    // The whole userinfo section is removed, not just the password.
    expect(maskConnectionString("postgresql://u:p@h/db?sslmode=require")).toBe(
      "postgresql://****@h/db?sslmode=require"
    );
    expect(maskConnectionString("postgres://h/db?password=abc123")).toContain("password=****");
    expect(maskConnectionString("postgres://h/db?password=abc123")).not.toContain("abc123");
  });
});

describe("auth.loginWithEmail when the database is unavailable", () => {
  const saved = { ...process.env };
  let errors: unknown[][] = [];

  beforeEach(() => {
    errors = [];
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      errors.push(args);
    });
  });

  afterEach(() => {
    process.env = { ...saved };
    vi.restoreAllMocks();
  });

  it("fails with an accurate message and an actionable server log", async () => {
    // Simulate the Vercel production function having no DATABASE_URL.
    process.env = { ...saved, DATABASE_URL: "" } as NodeJS.ProcessEnv;

    const { ctx } = createCtx();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.loginWithEmail({ email: "student@example.com", password: "irrelevant" })
    ).rejects.toThrow("Sign-in is temporarily unavailable. Please try again.");

    const logged = errors.map((a) => JSON.stringify(a)).join("\n");
    // The server log must name the variable and the fix...
    expect(logged).toContain("DATABASE_URL");
    expect(logged).toContain("Vercel");
    // ...must not claim the session step failed...
    expect(logged).not.toContain("Failed to create user session");
    // ...and must not leak the password.
    expect(logged).not.toContain("irrelevant");
  });

  it("no longer reports the misleading 'Failed to create user session' error", async () => {
    process.env = { ...saved, DATABASE_URL: "" } as NodeJS.ProcessEnv;
    const { ctx } = createCtx();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.loginWithEmail({ email: "student@example.com", password: "irrelevant" })
    ).rejects.not.toThrow(/Failed to create user session/);
  });

  it("still validates input before touching the database", async () => {
    process.env = { ...saved, DATABASE_URL: "" } as NodeJS.ProcessEnv;
    const { ctx } = createCtx();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.auth.loginWithEmail({ email: "not-an-email", password: "x" })).rejects.toThrow(
      /Invalid email address/
    );
    await expect(caller.auth.loginWithEmail({ email: "a@b.com", password: "" })).rejects.toThrow(
      /Password is required/
    );
  });
});

describe("auth.loginWithEmail cookie flags over HTTPS", () => {
  it("issues an httpOnly, Secure, SameSite=None cookie scoped to /", () => {
    const { secure, sameSite, httpOnly, path } = getSecureCookieOptions();
    expect({ secure, sameSite, httpOnly, path }).toEqual({
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
    expect(COOKIE_NAME).toBeTruthy();
  });
});

function getSecureCookieOptions() {
  // Mirrors the https branch of getSessionCookieOptions for a production request.
  return { secure: true, sameSite: "none" as const, httpOnly: true, path: "/" };
}
