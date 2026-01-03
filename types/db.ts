export type UserRole = "USER" | "ADMIN" | "FINANCE" | "SUPPORT";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

export type AnnouncementSeverity = "INFO" | "WARNING" | "URGENT";

export interface Announcement {
    id: string;
    content: string;
    severity: AnnouncementSeverity;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by?: string;
}
