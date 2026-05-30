export type Role = "super_admin" | "admin_local" | "agent_local";

export interface User {
  id: number;
  full_name: string;
  email: string;
  password: string;
  employee_number: string;
  role: Role;
  status: "active" | "inactive";
  local_administration_id: number;
}

export interface Citizen {
  id: number;
  health_record_number: string;
  cin: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  birth_place: string;
  gender: "M" | "F";
  address: string;
  phone: string;
  status: "active" | "archived";
  created_by_admin_id: number;
  local_administration_id: number;
  created_at: string;
  parents?: ParentInfo;
  health?: HealthInfo;
  documents?: CitizenDoc[];
  death?: DeathArchive;
}

export interface ParentInfo {
  father_cin: string;
  father_name: string;
  mother_cin: string;
  mother_name: string;
  phone: string;
  address: string;
}

export interface HealthInfo {
  child_blood_type: string;
  father_blood_type: string;
  mother_blood_type: string;
  allergies: string;
  genetic_diseases: string;
  congenital_disability: string;
  notes: string;
}

export interface CitizenDoc {
  id: number;
  document_type: string;
  file_name: string;
  uploaded_by: number;
  created_at: string;
}

export interface DeathArchive {
  death_date: string;
  death_certificate: string;
  archived_by: number;
  reason: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user_name: string;
  citizen_id: number | null;
  action: string;
  description: string;
  created_at: string;
}
