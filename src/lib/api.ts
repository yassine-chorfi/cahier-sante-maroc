import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";
import type { ActivityLog, Citizen, User } from "./mock-store";

type DbUserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
  employee_number: string | null;
  role: string | null;
  status: "active" | "inactive";
  establishment_id: number | null;
};

type CitizenRow = {
  id: number;
  health_identifier: string;
  cin: string | null;
  first_name: string;
  last_name: string;
  gender: "M" | "F" | string | null;
  birth_date: string | Date;
  birth_place: string | null;
  blood_type: string | null;
  address: string | null;
  phone: string | null;
  status: "active" | "archived" | string;
  created_by: number | null;
  created_at: string | Date;
  father_full_name: string | null;
  father_cin: string | null;
  mother_full_name: string | null;
  mother_cin: string | null;
  parents_phone: string | null;
  genetic_diseases: string | null;
  allergies: string | null;
  congenital_disabilities: string | null;
  notes: string | null;
  death_date: string | Date | null;
  death_reason: string | null;
  death_file_path: string | null;
  archived_by: number | null;
  archived_at: string | Date | null;
};

type DocRow = {
  id: number;
  document_type: string | null;
  file_path: string | null;
  uploaded_by: number | null;
  created_at: string | Date;
};

type LogRow = {
  id: number;
  user_id: number | null;
  user_name: string | null;
  table_name: string | null;
  record_id: number | null;
  action: string;
  new_data: string | null;
  created_at: string | Date;
};

type CitizenListInput = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "all" | "active" | "archived";
  sortBy?: "created_at" | "last_name" | "birth_date" | "health_identifier";
  sortDir?: "asc" | "desc";
};

type CountRow = {
  total: number;
};

function dateOnly(value: string | Date | null | undefined) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function iso(value: string | Date | null | undefined) {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapUser(row: DbUserRow): User {
  return {
    id: row.id,
    full_name: row.name,
    email: row.email,
    password: "",
    employee_number: row.employee_number ?? "",
    role:
      row.role === "admin_general"
        ? "super_admin"
        : row.role === "admin_local"
          ? "admin_local"
          : "agent_local",
    status: row.status,
    local_administration_id: row.establishment_id ?? 0,
  };
}

async function verifyPassword(plain: string, stored: string) {
  if (stored.startsWith("$2y$")) {
    return bcrypt.compare(plain, stored.replace("$2y$", "$2b$"));
  }
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
    return bcrypt.compare(plain, stored);
  }
  return stored === plain;
}

function mapCitizen(row: CitizenRow, docs: DocRow[] = []): Citizen {
  return {
    id: row.id,
    health_record_number: row.health_identifier,
    cin: row.cin ?? "",
    first_name: row.first_name,
    last_name: row.last_name,
    birth_date: dateOnly(row.birth_date),
    birth_place: row.birth_place ?? "",
    gender: row.gender === "F" ? "F" : "M",
    address: row.address ?? "",
    phone: row.phone ?? "",
    status: row.status === "archived" || row.death_date ? "archived" : "active",
    created_by_admin_id: row.created_by ?? 0,
    local_administration_id: 0,
    created_at: iso(row.created_at),
    parents: {
      father_cin: row.father_cin ?? "",
      father_name: row.father_full_name ?? "",
      mother_cin: row.mother_cin ?? "",
      mother_name: row.mother_full_name ?? "",
      phone: row.parents_phone ?? "",
      address: row.address ?? "",
    },
    health: {
      child_blood_type: row.blood_type ?? "",
      father_blood_type: "",
      mother_blood_type: "",
      allergies: row.allergies ?? "",
      genetic_diseases: row.genetic_diseases ?? "",
      congenital_disability: row.congenital_disabilities ?? "",
      notes: row.notes ?? "",
    },
    documents: docs.map((d) => ({
      id: d.id,
      document_type: d.document_type ?? "document",
      file_name: d.file_path?.split(/[\\/]/).pop() ?? "document",
      uploaded_by: d.uploaded_by ?? 0,
      created_at: iso(d.created_at),
    })),
    death: row.death_date
      ? {
          death_date: dateOnly(row.death_date),
          death_certificate: row.death_file_path ?? "",
          archived_by: row.archived_by ?? 0,
          reason: row.death_reason ?? "",
          created_at: iso(row.archived_at ?? row.death_date),
        }
      : undefined,
  };
}

function parseLog(row: LogRow): ActivityLog {
  let extra: Record<string, unknown> = {};
  try {
    extra = row.new_data ? JSON.parse(row.new_data) : {};
  } catch {
    extra = {};
  }

  return {
    id: row.id,
    user_id: row.user_id ?? 0,
    user_name: row.user_name ?? "Systeme",
    citizen_id:
      typeof extra.citizen_id === "number"
        ? extra.citizen_id
        : row.table_name === "citizens"
          ? row.record_id
          : null,
    action: row.action,
    description:
      typeof extra.description === "string"
        ? extra.description
        : `${row.action} ${row.table_name ?? ""} #${row.record_id ?? ""}`.trim(),
    created_at: iso(row.created_at),
  };
}

async function insertLog(
  userId: number | null,
  tableName: string,
  recordId: number | null,
  action: string,
  description: string,
  citizenId?: number | null,
) {
  const { query } = await import("./db.server");
  await query(
    `INSERT INTO action_logs (user_id, table_name, record_id, action, new_data, ip_address)
     VALUES (:userId, :tableName, :recordId, :action, :newData, :ip)`,
    {
      userId,
      tableName,
      recordId,
      action,
      newData: JSON.stringify({ description, citizen_id: citizenId ?? recordId }),
      ip: "",
    },
  );
}

const citizenSelect = `
  SELECT c.*, p.father_full_name, p.father_cin, p.mother_full_name, p.mother_cin,
    p.phone AS parents_phone, m.genetic_diseases, m.allergies,
    m.congenital_disabilities, m.notes, d.death_date, d.reason AS death_reason,
    d.file_path AS death_file_path, a.archived_by, a.archived_at
  FROM citizens c
  LEFT JOIN parents p ON p.citizen_id = c.id
  LEFT JOIN medical_basic_infos m ON m.citizen_id = c.id
  LEFT JOIN death_certificates d ON d.citizen_id = c.id
  LEFT JOIN archives a ON a.citizen_id = c.id
`;

function citizenWhere(input: CitizenListInput) {
  const conditions: string[] = [];
  const params: Record<string, string | number> = {};

  if (input.status === "active") {
    conditions.push("c.status = 'active'");
  }
  if (input.status === "archived") {
    conditions.push("(c.status = 'archived' OR d.death_date IS NOT NULL)");
  }
  if (input.search?.trim()) {
    params.search = `%${input.search.trim()}%`;
    conditions.push(`(
      c.cin LIKE :search
      OR c.first_name LIKE :search
      OR c.last_name LIKE :search
      OR c.health_identifier LIKE :search
      OR c.phone LIKE :search
    )`);
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

export const loginUser = createServerFn({ method: "POST" })
  .inputValidator((data: { identifier: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { query } = await import("./db.server");
    const rows = await query<DbUserRow>(
      `SELECT u.*, r.name AS role
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE (
         LOWER(u.email) = LOWER(:identifier)
         OR LOWER(u.employee_number) = LOWER(:identifier)
       )
       AND u.status = 'active'
       LIMIT 1`,
      { identifier: data.identifier },
    );
    const row = rows[0];
    if (!row || !(await verifyPassword(data.password, row.password))) return null;
    await query(
      `INSERT INTO access_logs (user_id, action, ip_address, establishment_id)
       VALUES (:userId, 'LOGIN', :ip, :establishmentId)`,
      { userId: row.id, ip: "", establishmentId: row.establishment_id },
    );
    await insertLog(row.id, "users", row.id, "LOGIN", `Connexion de ${row.name}`, null);
    return mapUser(row);
  });

export const logoutUser = createServerFn({ method: "POST" })
  .inputValidator((data: { user_id: number; name: string }) => data)
  .handler(async ({ data }) => {
    await insertLog(
      data.user_id,
      "users",
      data.user_id,
      "LOGOUT",
      `Deconnexion de ${data.name}`,
      null,
    );
    return { ok: true };
  });

export const listCitizens = createServerFn({ method: "GET" })
  .inputValidator((data?: CitizenListInput) => data ?? {})
  .handler(async ({ data }) => {
    const { query } = await import("./db.server");
    const page = Math.max(Number(data.page ?? 1), 1);
    const pageSize = Math.min(Math.max(Number(data.pageSize ?? 10), 5), 50);
    const offset = (page - 1) * pageSize;
    const sortMap = {
      created_at: "c.created_at",
      last_name: "c.last_name",
      birth_date: "c.birth_date",
      health_identifier: "c.health_identifier",
    };
    const sortBy = sortMap[data.sortBy ?? "created_at"];
    const sortDir = data.sortDir === "asc" ? "ASC" : "DESC";
    const { where, params } = citizenWhere(data);

    const rows = await query<CitizenRow>(
      `${citizenSelect} ${where} ORDER BY ${sortBy} ${sortDir} LIMIT :limit OFFSET :offset`,
      { ...params, limit: pageSize, offset },
    );
    const [count] = await query<CountRow>(
      `SELECT COUNT(*) AS total
       FROM citizens c
       LEFT JOIN death_certificates d ON d.citizen_id = c.id
       ${where}`,
      params,
    );
    return {
      items: rows.map((row) => mapCitizen(row)),
      total: count?.total ?? 0,
      page,
      pageSize,
      pageCount: Math.max(Math.ceil((count?.total ?? 0) / pageSize), 1),
    };
  });

export const listAllCitizens = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("./db.server");
  const rows = await query<CitizenRow>(`${citizenSelect} ORDER BY c.created_at DESC`);
  return rows.map((row) => mapCitizen(row));
});

export const getDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("./db.server");
  const [statusRows, monthRows, actionRows, citizensPage, logs] = await Promise.all([
    query<{ status_group: string; total: number }>(
      `SELECT
         CASE WHEN c.status = 'archived' OR d.death_date IS NOT NULL THEN 'archived' ELSE 'active' END AS status_group,
         COUNT(*) AS total
       FROM citizens c
       LEFT JOIN death_certificates d ON d.citizen_id = c.id
       GROUP BY status_group`,
    ),
    query<{ month: string; total: number }>(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS total
       FROM citizens
       WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
       GROUP BY month
       ORDER BY month ASC`,
    ),
    query<{ action: string; total: number }>(
      `SELECT action, COUNT(*) AS total
       FROM action_logs
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY action
       ORDER BY total DESC
       LIMIT 8`,
    ),
    listCitizens({
      data: { page: 1, pageSize: 5, status: "all", sortBy: "created_at", sortDir: "desc" },
    }),
    listLogs(),
  ]);

  const active = statusRows.find((row) => row.status_group === "active")?.total ?? 0;
  const archived = statusRows.find((row) => row.status_group === "archived")?.total ?? 0;
  const total = active + archived;
  const activity24h = logs.filter(
    (log) => Date.now() - new Date(log.created_at).getTime() <= 24 * 60 * 60 * 1000,
  ).length;

  return {
    stats: { total, active, archived, activity24h },
    recentCitizens: citizensPage.items,
    recentLogs: logs.slice(0, 8),
    statusChart: [
      { name: "Actifs", value: active, fill: "var(--color-active)" },
      { name: "Archives", value: archived, fill: "var(--color-archived)" },
    ],
    monthlyChart: monthRows.map((row) => ({ month: row.month, total: row.total })),
    activityChart: actionRows.map((row) => ({ action: row.action, total: row.total })),
  };
});

export const getCitizen = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number; user_id?: number | null }) => data)
  .handler(async ({ data }) => {
    const { query } = await import("./db.server");
    const rows = await query<CitizenRow>(`${citizenSelect} WHERE c.id = :id LIMIT 1`, {
      id: data.id,
    });
    if (!rows[0]) return null;
    const docs = await query<DocRow>(
      `SELECT * FROM medical_documents WHERE citizen_id = :id ORDER BY created_at DESC`,
      { id: data.id },
    );
    const logs = await listLogsByCitizen({ data: { id: data.id } });
    if (data.user_id) {
      await insertLog(
        data.user_id,
        "citizens",
        data.id,
        "VIEW_CITIZEN",
        `Consultation du dossier ${rows[0].health_identifier}`,
        data.id,
      );
    }
    return { citizen: mapCitizen(rows[0], docs), logs };
  });

export const listLogs = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("./db.server");
  const rows = await query<LogRow>(
    `SELECT l.*, u.name AS user_name
     FROM action_logs l
     LEFT JOIN users u ON u.id = l.user_id
     ORDER BY l.created_at DESC
     LIMIT 200`,
  );
  return rows.map(parseLog);
});

export const listLogsByCitizen = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const logs = await listLogs();
    return logs.filter((log) => log.citizen_id === data.id);
  });

const createCitizenSchema = z.object({
  user_id: z.number().nullable(),
  establishment_id: z.number().nullable(),
  cin: z.string().trim().min(4, "CIN requis").max(30),
  first_name: z.string().trim().min(1, "Prenom requis").max(100),
  last_name: z.string().trim().min(1, "Nom requis").max(100),
  birth_date: z.string().trim().min(1, "Date de naissance requise"),
  birth_place: z.string().trim().min(1, "Lieu de naissance requis").max(150),
  gender: z.enum(["M", "F"]),
  address: z.string().trim().min(1, "Adresse requise").max(500),
  phone: z.string().trim().min(6, "Telephone requis").max(30),
  father_cin: z.string().trim().max(30),
  father_name: z.string().trim().max(150),
  mother_cin: z.string().trim().max(30),
  mother_name: z.string().trim().max(150),
  parents_phone: z.string().trim().max(30),
  child_blood_type: z.string().trim().max(10),
  allergies: z.string().trim().max(1000),
  genetic_diseases: z.string().trim().max(1000),
  congenital_disability: z.string().trim().max(1000),
  notes: z.string().trim().max(2000),
  documents: z.array(
    z.object({
      file_name: z.string().trim().min(1).max(255),
      document_type: z.string().trim().min(1).max(100),
    }),
  ),
});

const updateCitizenSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  address: z.string().trim().max(255),
  phone: z.string().trim().max(30),
  allergies: z.string().trim().max(500),
  genetic_diseases: z.string().trim().max(500),
  congenital_disability: z.string().trim().max(500),
  notes: z.string().trim().max(1000),
});

export const createCitizen = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof createCitizenSchema>) => createCitizenSchema.parse(data))
  .handler(async ({ data }) => {
    const { transaction } = await import("./db.server");
    return transaction(async (conn) => {
      const [[existingCin]] = await conn.execute<RowDataPacket[]>(
        "SELECT id FROM citizens WHERE cin = ? LIMIT 1",
        [data.cin],
      );
      if (existingCin) {
        throw new Error("CIN_ALREADY_EXISTS");
      }

      const year = new Date().getFullYear();
      const [[counter]] = await conn.execute<RowDataPacket[]>(
        "SELECT COUNT(*) + 1 AS n FROM citizens WHERE YEAR(created_at) = ?",
        [year],
      );
      const healthIdentifier = `CSM-${year}-${String(counter.n).padStart(6, "0")}`;
      const [citizenResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO citizens
          (user_id, health_identifier, cin, first_name, last_name, gender, birth_date, birth_place,
           blood_type, address, phone, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
        [
          data.user_id,
          healthIdentifier,
          data.cin || null,
          data.first_name,
          data.last_name,
          data.gender,
          data.birth_date,
          data.birth_place,
          data.child_blood_type || null,
          data.address,
          data.phone,
          data.user_id,
        ],
      );
      const citizenId = citizenResult.insertId;
      await conn.execute(
        `INSERT INTO parents
          (citizen_id, father_full_name, father_cin, mother_full_name, mother_cin, phone)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          citizenId,
          data.father_name || null,
          data.father_cin || null,
          data.mother_name || null,
          data.mother_cin || null,
          data.parents_phone || null,
        ],
      );
      await conn.execute(
        `INSERT INTO medical_basic_infos
          (citizen_id, genetic_diseases, allergies, congenital_disabilities, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [
          citizenId,
          data.genetic_diseases || null,
          data.allergies || null,
          data.congenital_disability || null,
          data.notes || null,
        ],
      );
      for (const doc of data.documents) {
        await conn.execute(
          `INSERT INTO medical_documents
            (citizen_id, uploaded_by, establishment_id, document_type, file_path, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            citizenId,
            data.user_id,
            data.establishment_id,
            doc.document_type,
            doc.file_name,
            "Document ajoute depuis l'interface admin local",
          ],
        );
      }
      await conn.execute(
        `INSERT INTO action_logs (user_id, table_name, record_id, action, new_data, ip_address)
         VALUES (?, 'citizens', ?, 'CREATE_CITIZEN', ?, ?)`,
        [
          data.user_id,
          citizenId,
          JSON.stringify({
            citizen_id: citizenId,
            description: `Creation du dossier ${healthIdentifier} (${data.first_name} ${data.last_name})`,
          }),
          "",
        ],
      );
      return { id: citizenId, health_record_number: healthIdentifier };
    });
  });

export const updateCitizen = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof updateCitizenSchema>) => updateCitizenSchema.parse(data))
  .handler(async ({ data }) => {
    const { transaction } = await import("./db.server");
    await transaction(async (conn) => {
      const [[row]] = await conn.execute<RowDataPacket[]>(
        "SELECT health_identifier, status FROM citizens WHERE id = ? LIMIT 1",
        [data.id],
      );
      if (!row) throw new Error("Dossier introuvable");
      if (row.status === "archived") throw new Error("Dossier archive en lecture seule");

      await conn.execute("UPDATE citizens SET address = ?, phone = ? WHERE id = ?", [
        data.address,
        data.phone,
        data.id,
      ]);
      const [medicalResult] = await conn.execute<ResultSetHeader>(
        `UPDATE medical_basic_infos
         SET allergies = ?, genetic_diseases = ?, congenital_disabilities = ?, notes = ?
         WHERE citizen_id = ?`,
        [data.allergies, data.genetic_diseases, data.congenital_disability, data.notes, data.id],
      );
      if (medicalResult.affectedRows === 0) {
        await conn.execute(
          `INSERT INTO medical_basic_infos
            (citizen_id, allergies, genetic_diseases, congenital_disabilities, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [data.id, data.allergies, data.genetic_diseases, data.congenital_disability, data.notes],
        );
      }
      await conn.execute(
        `INSERT INTO action_logs (user_id, table_name, record_id, action, new_data, ip_address)
         VALUES (?, 'citizens', ?, 'UPDATE_CITIZEN', ?, ?)`,
        [
          data.user_id,
          data.id,
          JSON.stringify({
            citizen_id: data.id,
            description: `Modification du dossier ${row.health_identifier}`,
          }),
          "",
        ],
      );
    });
    return { ok: true };
  });

export const archiveCitizen = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      id: number;
      user_id: number | null;
      death_date: string;
      reason: string;
      certificate_file: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { transaction } = await import("./db.server");
    await transaction(async (conn) => {
      await conn.execute("UPDATE citizens SET status = 'archived' WHERE id = ?", [data.id]);
      await conn.execute(
        `INSERT INTO death_certificates
          (citizen_id, certificate_number, death_date, death_place, reason, file_path, validated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id,
          `DC-${new Date().getFullYear()}-${String(data.id).padStart(6, "0")}`,
          data.death_date,
          "",
          data.reason,
          data.certificate_file || "certificat_deces.pdf",
          data.user_id,
        ],
      );
      await conn.execute(
        "INSERT INTO archives (citizen_id, archived_by, reason) VALUES (?, ?, ?)",
        [data.id, data.user_id, data.reason],
      );
      await conn.execute(
        `INSERT INTO action_logs (user_id, table_name, record_id, action, new_data, ip_address)
         VALUES (?, 'citizens', ?, 'ARCHIVE_CITIZEN', ?, ?)`,
        [
          data.user_id,
          data.id,
          JSON.stringify({
            citizen_id: data.id,
            description: `Archivage du dossier #${data.id} - ${data.reason}`,
          }),
          "",
        ],
      );
    });
    return { ok: true };
  });
