import { z } from "zod";

const RESERVED_USERNAMES = [
  "admin",
  "api",
  "auth",
  "bury",
  "dashboard",
  "login",
  "logout",
  "settings",
  "signup",
  "about",
  "help",
  "support",
  "blog",
  "docs",
  "terms",
  "privacy",
  "legal",
  "static",
  "public",
  "app",
  "www",
  "mail",
  "ftp",
  "null",
  "undefined",
  "root",
  "system",
];

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be 20 characters or less")
  .regex(
    /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
    "Lowercase letters, numbers, and hyphens only. Must start and end with a letter or number."
  )
  .refine(
    (val) => !RESERVED_USERNAMES.includes(val),
    "This username is reserved"
  );

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or less"),
  startDate: z
    .string()
    .regex(/^\d{4}(-\d{2})?$/, "Use YYYY or YYYY-MM format"),
  endDate: z
    .string()
    .regex(/^\d{4}(-\d{2})?$/, "Use YYYY or YYYY-MM format"),
  causeOfDeath: z
    .string()
    .min(1, "Cause of death is required")
    .max(100, "Cause of death must be 100 characters or less"),
  epitaph: z
    .string()
    .min(1, "Epitaph is required")
    .max(140, "Epitaph must be 140 characters or less"),
  description: z.string().max(2000).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  techStack: z.array(z.string()).max(10).optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
