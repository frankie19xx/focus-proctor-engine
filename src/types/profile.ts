export type Role = "student" | "lecturer" | "admin";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  status: ApprovalStatus;
  registration_number: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
