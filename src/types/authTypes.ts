import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2).max(20),
    email: z.string().email(),
    password: z.string().min(2).max(25),
}).strict()

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(2).max(25),
}).strict()