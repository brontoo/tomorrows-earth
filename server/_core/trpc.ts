import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '../../shared/const.js';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { maskConnectionString } from "./envCheck.js";
import { hashValue } from "./requestContext.js";
import type { TrpcContext } from "./context.js";

const GENERIC_SERVER_ERROR = "Something went wrong. Please try again.";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  /**
   * Unexpected errors are logged once, server-side, with a correlation id and a
   * masked message, then hidden from the client. Errors we raised deliberately
   * (TRPCError without a cause) keep their message, which is written to be safe
   * for end users.
   */
  errorFormatter({ shape, error, type, path }) {
    const isExpected = error instanceof TRPCError && !error.cause;
    const isServerError = error.code === "INTERNAL_SERVER_ERROR";

    if (!isExpected) {
      const correlationId = `err_${hashValue(`${type}:${path ?? "-"}:${Date.now()}:${Math.random()}`)}`;
      const cause = error.cause instanceof Error ? error.cause : error;
      const message = cause instanceof Error ? maskConnectionString(cause.message) : String(cause);
      console.error(`[tRPC] ${type} ${path ?? "<no-path>"} failed [${correlationId}]: ${message}`);

      return {
        ...shape,
        message: GENERIC_SERVER_ERROR,
        data: { ...shape.data, correlationId },
      };
    }

    if (isServerError) {
      // Deliberate 500s (e.g. session signing) keep their message but still get
      // an id so a user can quote it and support can find the log line.
      const correlationId = `err_${hashValue(`${type}:${path ?? "-"}:${Date.now()}:${Math.random()}`)}`;
      return { ...shape, data: { ...shape.data, correlationId } };
    }

    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
