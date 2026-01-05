import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(1, {
        message: "Password is required",
    }),
});

export const RegisterSchema = z.object({
    firstName: z.string()
        .min(2, { message: "First name is required" })
        .regex(/^[a-zA-Z\s'-]+$/, { message: "First name cannot contain numbers or special characters" }),
    middleName: z.string()
        .optional()
        .refine(val => !val || /^[a-zA-Z\s'-]+$/.test(val), {
            message: "Middle name cannot contain numbers or special characters"
        }),
    lastName: z.string()
        .min(2, { message: "Last name is required" })
        .regex(/^[a-zA-Z\s'-]+$/, { message: "Last name cannot contain numbers or special characters" }),
    email: z.string().email({
        message: "Email is required",
    }),
    password: z
        .string()
        .min(6, { message: "Minimum 6 characters required" })
        .regex(/[A-Z]/, { message: "Must contain at least 1 uppercase letter" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Must contain at least 1 special character" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
});

export const NewPasswordSchema = z.object({
    password: z
        .string()
        .min(6, { message: "Minimum 6 characters required" })
        .regex(/[A-Z]/, { message: "Must contain at least 1 uppercase letter" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Must contain at least 1 special character" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
