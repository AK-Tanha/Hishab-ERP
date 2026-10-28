import { z } from "zod";

export const RegisterTenantSchema = z.object({
  businessNameEn: z.string().min(2, "Business name (English) is required"),
  businessNameBn: z.string().min(2, "ব্যবসার নাম (বাংলা) আবশ্যক"),
  subdomain: z.string().min(3).max(63).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Subdomain must be lowercase alphanumeric with hyphens"),
  ownerNameEn: z.string().min(2),
  ownerNameBn: z.string().min(2),
  ownerEmail: z.string().email(),
  ownerPhone: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters"),
  plan: z.enum(["starter", "growth", "enterprise"]).default("starter"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantSubdomain: z.string().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const InviteUserSchema = z.object({
  email: z.string().email(),
  roleCode: z.enum(["owner", "admin", "accountant", "sales", "storekeeper"]),
});

export const UpdateUserSchema = z.object({
  nameEn: z.string().min(2).optional(),
  nameBn: z.string().min(2).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type RegisterTenantInput = z.infer<typeof RegisterTenantSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type InviteUserInput = z.infer<typeof InviteUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
