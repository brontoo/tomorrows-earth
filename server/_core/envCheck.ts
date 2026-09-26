/**
 * Server environment validation.
 *
 * Purpose: a missing or unusable server variable is a fatal deployment error.
 * Previously it degraded silently (getDb() returned null, ~60 call sites treated
 * that as "no data"), which surfaced as an unactionable 500 such as
 * "Failed to create user session" during sign-in.
 *
 * Safety rules for this module:
 *  - NEVER log, return, or interpolate a variable's value.
 *  - Only the variable NAME, the detected problem, and the fix are reported.
 *  - Connection strings are masked before any diagnostic uses them.
 */

const VERCEL_ENV_FIX =
  "Add this variable in Vercel → Project → Settings → Environment Variables → Production";

const VERCEL_ENV_FIX_ALL =
  "Add this variable for Production and Preview in Vercel → Project → Settings → Environment Variables";

export type EnvIssue = {
  var: string;
  problem: string;
  fix: string;
};

export type EnvValidationResult = {
  ok: boolean;
  issues: EnvIssue[];
};

function isPostgresUrl(value: string): boolean {
  if (!/^postgres(ql)?:\/\//i.test(value)) return false;
  try {
    const { hostname, port } = new URL(value);
    if (!hostname) return false;
    // postgres-js cannot parse a non-numeric port; it throws at construction.
    if (port && !/^\d+$/.test(port)) return false;
    return true;
  } catch {
    return false;
  }
}

/** Masks credentials so a URL can appear in logs without leaking the password. */
export function maskConnectionString(value: string): string {
  return value.replace(/\/\/[^@/]*@/, "//****@").replace(/([?&](?:password|secret|key)=)[^&]*/gi, "$1****");
}

function checkVariable(name: string, raw: string | undefined, issues: EnvIssue[]): void {
  if (raw === undefined) {
    issues.push({
      var: name,
      problem: "is not set in the server environment",
      fix: VERCEL_ENV_FIX,
    });
    return;
  }
  if (raw.trim() === "") {
    issues.push({
      var: name,
      problem: "is set to an empty value",
      fix: VERCEL_ENV_FIX,
    });
  }
}

export function validateServerEnv(env: NodeJS.ProcessEnv = process.env): EnvValidationResult {
  const issues: EnvIssue[] = [];
  const isProduction = env.NODE_ENV === "production";

  const databaseUrl = env.DATABASE_URL;
  checkVariable("DATABASE_URL", databaseUrl, issues);
  if (databaseUrl && databaseUrl.trim() !== "" && !isPostgresUrl(databaseUrl.trim())) {
    issues.push({
      var: "DATABASE_URL",
      problem:
        "is not a valid postgres:// or postgresql:// connection string, so the database client cannot be created",
      fix: VERCEL_ENV_FIX,
    });
  }

  // Session cookies are signed with JWT_SECRET. A missing/short secret breaks
  // sign-in and silently invalidates every existing session.
  if (isProduction) {
    checkVariable("JWT_SECRET", env.JWT_SECRET, issues);
    if (env.JWT_SECRET && env.JWT_SECRET.trim().length < 32) {
      issues.push({
        var: "JWT_SECRET",
        problem: "is shorter than 32 characters, which is not strong enough to sign sessions",
        fix: VERCEL_ENV_FIX,
      });
    }
  }

  return { ok: issues.length === 0, issues };
}

function formatIssues(issues: EnvIssue[]): string {
  return issues
    .map((issue) => `  - ${issue.var} ${issue.problem}.\n    Fix: ${issue.fix}`)
    .join("\n");
}

/**
 * Throws a single actionable error when the server environment is unusable.
 * The message contains variable names and fixes only, never values.
 */
export function assertServerEnv(env: NodeJS.ProcessEnv = process.env): void {
  const { ok, issues } = validateServerEnv(env);
  if (ok) return;
  throw new Error(
    `Server environment is not configured correctly:\n${formatIssues(issues)}`
  );
}

/**
 * Returns the first problem as a single line. Used on hot paths (e.g. getDb)
 * that must not throw, but must not degrade silently either.
 */
export function describeFirstEnvIssue(env: NodeJS.ProcessEnv = process.env): string | null {
  const { issues } = validateServerEnv(env);
  if (issues.length === 0) return null;
  const [first] = issues;
  return `${first.var} ${first.problem}. Fix: ${first.fix}`;
}

export const ENV_DOCS = {
  /** Required at runtime in every environment. */
  required: {
    DATABASE_URL:
      "PostgreSQL connection string (postgres://... or postgresql://...). Required for sign-in, voting, projects and every read. Supabase users can copy it from Project Settings → Database → Connection string.",
  },
  /** Required in production. */
  requiredInProduction: {
    JWT_SECRET:
      "Secret used to sign session cookies. Must be at least 32 characters. Without it every sign-in fails with 'Session signing failed'.",
  },
  optional: {
    VITE_APP_ID: "Application identifier embedded in the session token.",
    OAUTH_SERVER_URL: "OAuth callback host used by registerOAuthRoutes.",
    OWNER_OPEN_ID: "openId that is granted the admin role on first upsert.",
    SUPABASE_URL: "Supabase project URL used for media uploads.",
    SUPABASE_SERVICE_ROLE_KEY: "Supabase service-role key for server-side storage access.",
    RESEND_API_KEY: "Transactional email. Omit to disable outbound email.",
  },
} as const;
