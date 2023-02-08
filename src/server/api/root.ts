import { createTRPCRouter } from "./trpc";
import { todoRouter } from "./routers/todo";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  todo: todoRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
