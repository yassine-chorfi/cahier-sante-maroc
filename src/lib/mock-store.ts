// Mock data store for "Cahier de Santé Maroc" frontend.
// Persists to localStorage so the UI behaves like a real backend.
// Will be replaced by Laravel API calls.

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

export interface LocalAdmin {
  id: number;
  name: string;
  region: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  status: string;
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

const KEY = "csm_store_v1";

interface Store {
  admins: LocalAdmin[];
  users: User[];
  citizens: Citizen[];
  logs: ActivityLog[];
  seq: number;
}

function seed(): Store {
  const admins: LocalAdmin[] = [
    {
      id: 1,
      name: "Administration Locale Casablanca-Anfa",
      region: "Casablanca-Settat",
      city: "Casablanca",
      district: "Anfa",
      address: "Boulevard Mohammed V",
      phone: "+212 522 000 000",
      status: "active",
    },
  ];
  const users: User[] = [
    {
      id: 1,
      full_name: "Super Administrateur",
      email: "super@csm.ma",
      password: "password",
      employee_number: "SA-0001",
      role: "super_admin",
      status: "active",
      local_administration_id: 1,
    },
    {
      id: 2,
      full_name: "Admin Local Casablanca",
      email: "admin@csm.ma",
      password: "password",
      employee_number: "AL-0001",
      role: "admin_local",
      status: "active",
      local_administration_id: 1,
    },
    {
      id: 3,
      full_name: "Agent Local",
      email: "agent@csm.ma",
      password: "password",
      employee_number: "AG-0001",
      role: "agent_local",
      status: "active",
      local_administration_id: 1,
    },
  ];
  const citizens: Citizen[] = [
    {
      id: 1,
      health_record_number: "CSM-2026-000001",
      cin: "BK123456",
      first_name: "Youssef",
      last_name: "El Amrani",
      birth_date: "1990-05-12",
      birth_place: "Casablanca",
      gender: "M",
      address: "12 Rue Ibn Sina, Casablanca",
      phone: "+212 661 234 567",
      status: "active",
      created_by_admin_id: 2,
      local_administration_id: 1,
      created_at: new Date().toISOString(),
      parents: {
        father_cin: "BK111222",
        father_name: "Ahmed El Amrani",
        mother_cin: "BK333444",
        mother_name: "Fatima Bennani",
        phone: "+212 661 000 111",
        address: "12 Rue Ibn Sina, Casablanca",
      },
      health: {
        child_blood_type: "O+",
        father_blood_type: "A+",
        mother_blood_type: "O+",
        allergies: "Aucune",
        genetic_diseases: "Aucune",
        congenital_disability: "Non",
        notes: "RAS",
      },
      documents: [],
    },
    {
      id: 2,
      health_record_number: "CSM-2026-000002",
      cin: "BE998877",
      first_name: "Salma",
      last_name: "Benali",
      birth_date: "1995-09-30",
      birth_place: "Rabat",
      gender: "F",
      address: "45 Avenue Hassan II, Rabat",
      phone: "+212 662 998 877",
      status: "active",
      created_by_admin_id: 2,
      local_administration_id: 1,
      created_at: new Date().toISOString(),
      documents: [],
    },
  ];
  const logs: ActivityLog[] = [
    {
      id: 1,
      user_id: 2,
      user_name: "Admin Local Casablanca",
      citizen_id: 1,
      action: "CREATE_CITIZEN",
      description: "Création du dossier CSM-2026-000001",
      created_at: new Date().toISOString(),
    },
  ];
  return { admins, users, citizens, logs, seq: 100 };
}

function load(): Store {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as Store;
  } catch {
    return seed();
  }
}

function save(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export const store = {
  get: load,
  save,
  reset() {
    if (typeof window !== "undefined") localStorage.removeItem(KEY);
  },
  nextId() {
    const s = load();
    s.seq += 1;
    save(s);
    return s.seq;
  },
  nextHealthRecordNumber() {
    const s = load();
    const n = s.citizens.length + 1;
    return `CSM-${new Date().getFullYear()}-${String(n).padStart(6, "0")}`;
  },
  addCitizen(c: Citizen) {
    const s = load();
    s.citizens.push(c);
    save(s);
  },
  updateCitizen(id: number, patch: Partial<Citizen>) {
    const s = load();
    s.citizens = s.citizens.map((c) => (c.id === id ? { ...c, ...patch } : c));
    save(s);
  },
  log(entry: Omit<ActivityLog, "id" | "created_at">) {
    const s = load();
    s.logs.unshift({
      ...entry,
      id: s.seq + 1,
      created_at: new Date().toISOString(),
    });
    s.seq += 1;
    save(s);
  },
};
