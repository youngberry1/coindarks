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
    firstName: z.string().min(2, {
        message: "First name is required",
    }),
    middleName: z.string().optional(),
    lastName: z.string().min(2, {
        message: "Last name is required",
    }),
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
