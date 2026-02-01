/* =======================
   PERMISSION
======================= */

export interface Permission {
  permission_id: string;
  name: string;
  description?: string;
}

/* =======================
   STUDENT ↔ PERMISSION
======================= */

export interface StudentPermission {
  student_id: string;
  permission_id: string;

  // optional relations (حسب include من API)
  permission?: Permission;
}

/* =======================
   PAYLOADS
======================= */

export interface CreatePermissionPayload {
  name: string;
  description?: string;
}
