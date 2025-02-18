import { z } from "zod";

export enum Role {
    USER = "USER",
    ADMIN = "ADMIN"
}

export const userProfileSchema = z.object({
    name: z.string().min(2).max(20),
    email: z.string().email(),
    role: z.nativeEnum(Role),
}).strict()