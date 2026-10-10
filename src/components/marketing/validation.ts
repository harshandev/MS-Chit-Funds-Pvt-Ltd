import { z } from "zod";

/** 10-digit Indian mobile number (starts 6-9). Demo-level validation only. */
export const mobileSchema = z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number.");
export const emailSchema = z.email("Enter a valid email address.");
