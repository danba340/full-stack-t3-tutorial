import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import type { AppRouter } from "./server/api/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type allTodosOutput = RouterOutputs["todo"]["all"];

export type Todo = allTodosOutput[number];

export const todoInput = z
  .string({
    required_error: "Describe your todo",
  })
  .min(1)
  .max(50);
