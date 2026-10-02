"""
ChemSpace Database Repository
Implements strict user data isolation, ownership scoping, and customer data management.
Every operation guarantees that records are scoped exclusively to the authenticated user.
"""

import time
import secrets
import json
import logging
from typing import Optional, Dict, Any, List, Tuple
from .connection import get_db_connection

logger = logging.getLogger("chemspace.repository")


# ============================================================================
# 1. USER MAPPING & PROVISIONING
# ============================================================================

def get_or_create_user(
    firebase_uid: str,
    email: Optional[str] = None,
    display_name: Optional[str] = None,
    photo_url: Optional[str] = None,
    phone_number: Optional[str] = None
) -> Dict[str, Any]:
    """
    Looks up user by permanent Firebase UID.
    If the user does not exist, provisions a new record in MySQL `users`
    plus default rows in `user_profiles` and `user_preferences`.
    Returns user dictionary with internal integer `id` and `firebase_uid`.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()

        # 1. Look up existing user
        cur.execute("SELECT * FROM users WHERE firebase_uid = ?", (firebase_uid,))
        user = cur.fetchone()

        if user:
            # Update safe fields & last_login_at
            updates = []
            params = []
            if email and email != user.get("email"):
                updates.append("email = ?")
                params.append(email)
            if display_name and display_name != user.get("display_name"):
                updates.append("display_name = ?")
                params.append(display_name)
            if photo_url and photo_url != user.get("photo_url"):
                updates.append("photo_url = ?")
                params.append(photo_url)
            if phone_number and phone_number != user.get("phone_number"):
                updates.append("phone_number = ?")
                params.append(phone_number)

            updates.append("last_login_at = CURRENT_TIMESTAMP")
            params.append(firebase_uid)

            update_sql = f"UPDATE users SET {', '.join(updates)} WHERE firebase_uid = ?"
            cur.execute(update_sql, params)
            conn.commit()

            # Refetch updated user
            cur.execute("SELECT * FROM users WHERE firebase_uid = ?", (firebase_uid,))
            return cur.fetchone()

        # 2. User does not exist — provision safely in transaction
        cur.execute(
            """
            INSERT INTO users (firebase_uid, email, display_name, photo_url, phone_number, last_login_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (firebase_uid, email, display_name, photo_url, phone_number)
        )
        user_id = cur.lastrowid

        # Provision profile defaults
        cur.execute(
            """
            INSERT INTO user_profiles (user_id, workplace, title, department)
            VALUES (?, 'ChemNova Research Institute', 'Lead Research Chemist', 'Synthetic & Computational Chemistry')
            """,
            (user_id,)
        )

        # Provision preference defaults
        cur.execute(
            """
            INSERT INTO user_preferences (user_id, theme, language, voice_id, speech_speed, voice_enabled, ai_response_mode)
            VALUES (?, 'dark', 'en', 'default', 1.0, 1, 'balanced')
            """,
            (user_id,)
        )

        conn.commit()

        cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        return cur.fetchone()


def get_user_by_firebase_uid(firebase_uid: str) -> Optional[Dict[str, Any]]:
    """
    Returns user record by Firebase UID or None.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE firebase_uid = ?", (firebase_uid,))
        return cur.fetchone()


# ============================================================================
# 2. USER PROFILE & PREFERENCES
# ============================================================================

def get_user_profile(user_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetches merged user and user_profiles data strictly scoped by user_id.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT 
                u.id, u.firebase_uid, u.email, u.display_name, u.photo_url, u.phone_number, u.status, u.created_at,
                p.workplace, p.title, p.department, p.lab_room, p.safety_level, p.orcid
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
            """,
            (user_id,)
        )
        return cur.fetchone()


def update_user_profile(user_id: int, profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Updates profile fields strictly scoped by user_id.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()

        # Update users table safe fields
        user_updates = []
        user_params = []
        if "displayName" in profile_data:
            user_updates.append("display_name = ?")
            user_params.append(profile_data["displayName"])
        if "photoURL" in profile_data or "avatar" in profile_data:
            user_updates.append("photo_url = ?")
            user_params.append(profile_data.get("photoURL") or profile_data.get("avatar"))
        if "phoneNumber" in profile_data:
            user_updates.append("phone_number = ?")
            user_params.append(profile_data["phoneNumber"])

        if user_updates:
            user_params.append(user_id)
            cur.execute(f"UPDATE users SET {', '.join(user_updates)} WHERE id = ?", user_params)

        # Update or insert user_profiles
        prof_updates = []
        prof_params = []
        for field, col in [
            ("workplace", "workplace"),
            ("title", "title"),
            ("department", "department"),
            ("labRoom", "lab_room"),
            ("safetyLevel", "safety_level"),
            ("orcid", "orcid"),
        ]:
            if field in profile_data:
                prof_updates.append(f"{col} = ?")
                prof_params.append(profile_data[field])

        if prof_updates:
            prof_params.append(user_id)
            cur.execute(
                f"UPDATE user_profiles SET {', '.join(prof_updates)} WHERE user_id = ?",
                prof_params
            )

        conn.commit()
    return get_user_profile(user_id)


def get_user_preferences(user_id: int) -> Dict[str, Any]:
    """
    Fetches user preferences strictly scoped by user_id.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM user_preferences WHERE user_id = ?", (user_id,))
        row = cur.fetchone()

        if not row:
            # Default preferences fallback
            return {
                "theme": "dark",
                "language": "en",
                "voiceEnabled": True,
                "voiceSpeed": 1.0,
                "voiceName": "default",
                "autoRead": False,
                "aiResponseMode": "balanced",
                "webSearchEnabled": True,
                "watermarkEnabled": True,
                "privacyBlurEnabled": True,
            }

        return {
            "theme": row.get("theme", "dark"),
            "language": row.get("language", "en"),
            "voiceEnabled": bool(row.get("voice_enabled", 1)),
            "voiceSpeed": float(row.get("speech_speed", 1.0)),
            "voiceName": row.get("voice_id", "default"),
            "autoRead": bool(row.get("auto_read", 0)),
            "aiResponseMode": row.get("ai_response_mode", "balanced"),
            "webSearchEnabled": bool(row.get("web_search_enabled", 1)),
            "watermarkEnabled": bool(row.get("watermark_enabled", 1)),
            "privacyBlurEnabled": bool(row.get("privacy_blur_enabled", 1)),
            "updatedAt": str(row.get("updated_at", "")),
        }


def update_user_preferences(user_id: int, prefs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Upserts user preferences strictly scoped by user_id.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT user_id FROM user_preferences WHERE user_id = ?", (user_id,))
        exists = cur.fetchone()

        theme = prefs.get("theme", "dark")
        language = prefs.get("language", "en")
        voice_id = prefs.get("voiceName", prefs.get("voice_id", "default"))
        speech_speed = float(prefs.get("voiceSpeed", prefs.get("speech_speed", 1.0)))
        voice_enabled = 1 if prefs.get("voiceEnabled", prefs.get("voice_enabled", True)) else 0
        auto_read = 1 if prefs.get("autoRead", prefs.get("auto_read", False)) else 0
        ai_response_mode = prefs.get("aiResponseMode", prefs.get("ai_response_mode", "balanced"))
        web_search = 1 if prefs.get("webSearchEnabled", prefs.get("web_search_enabled", True)) else 0
        watermark = 1 if prefs.get("watermarkEnabled", prefs.get("watermark_enabled", True)) else 0
        privacy_blur = 1 if prefs.get("privacyBlurEnabled", prefs.get("privacy_blur_enabled", True)) else 0

        if exists:
            cur.execute(
                """
                UPDATE user_preferences SET
                    theme = ?, language = ?, voice_id = ?, speech_speed = ?,
                    voice_enabled = ?, auto_read = ?, ai_response_mode = ?,
                    web_search_enabled = ?, watermark_enabled = ?, privacy_blur_enabled = ?
                WHERE user_id = ?
                """,
                (theme, language, voice_id, speech_speed, voice_enabled, auto_read,
                 ai_response_mode, web_search, watermark, privacy_blur, user_id)
            )
        else:
            cur.execute(
                """
                INSERT INTO user_preferences (
                    user_id, theme, language, voice_id, speech_speed,
                    voice_enabled, auto_read, ai_response_mode, web_search_enabled,
                    watermark_enabled, privacy_blur_enabled
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, theme, language, voice_id, speech_speed, voice_enabled,
                 auto_read, ai_response_mode, web_search, watermark, privacy_blur)
            )

        conn.commit()
    return get_user_preferences(user_id)


# ============================================================================
# 3. PRIVATE FILE STORAGE & ISOLATION
# ============================================================================

def list_user_files(user_id: int, limit: int = 50, offset: int = 0) -> Tuple[List[Dict[str, Any]], int]:
    """
    Returns files strictly owned by authenticated user_id.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, original_name, stored_name, mime_type, file_size, checksum, created_at, updated_at
            FROM files
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """,
            (user_id, limit, offset)
        )
        files = cur.fetchall()

        cur.execute("SELECT COUNT(*) AS total FROM files WHERE user_id = ?", (user_id,))
        total_row = cur.fetchone()
        total = total_row.get("total", 0) if total_row else 0
        return files, total


def create_user_file(
    user_id: int,
    original_name: str,
    stored_name: str,
    storage_path: str,
    mime_type: str,
    file_size: int,
    checksum: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates a private file record scoped strictly to user_id.
    """
    file_id = f"file_{secrets.token_hex(12)}"
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO files (id, user_id, original_name, stored_name, storage_path, mime_type, file_size, checksum)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (file_id, user_id, original_name, stored_name, storage_path, mime_type, file_size, checksum)
        )
        conn.commit()

        cur.execute(
            "SELECT id, original_name, stored_name, mime_type, file_size, checksum, created_at FROM files WHERE id = ? AND user_id = ?",
            (file_id, user_id)
        )
        return cur.fetchone()


def get_user_file(user_id: int, file_id: str) -> Optional[Dict[str, Any]]:
    """
    STRICT CHECK: Returns file only if user_id matches owner.
    Prevents cross-user file access.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM files WHERE id = ? AND user_id = ?", (file_id, user_id))
        return cur.fetchone()


def delete_user_file(user_id: int, file_id: str) -> bool:
    """
    STRICT CHECK: Deletes file only if owned by user_id.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM files WHERE id = ? AND user_id = ?", (file_id, user_id))
        conn.commit()
        return cur.rowcount > 0


# ============================================================================
# 4. DOWNLOADS TRACKING & ISOLATION
# ============================================================================

def list_user_downloads(user_id: int, limit: int = 50, offset: int = 0) -> Tuple[List[Dict[str, Any]], int]:
    """
    Returns download records strictly owned by user_id.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, file_id, filename, file_type, file_size, source_module, download_status, checksum, created_at
            FROM downloads
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """,
            (user_id, limit, offset)
        )
        items = cur.fetchall()

        cur.execute("SELECT COUNT(*) AS total FROM downloads WHERE user_id = ?", (user_id,))
        total_row = cur.fetchone()
        total = total_row.get("total", 0) if total_row else 0
        return items, total


def record_user_download(
    user_id: int,
    filename: str,
    file_type: str,
    file_size: int = 0,
    source_module: str = "ChemSpace",
    file_id: Optional[str] = None,
    download_status: str = "completed",
    checksum: Optional[str] = None
) -> Dict[str, Any]:
    """
    Records a user-specific download event.
    """
    dl_id = f"dl_{secrets.token_hex(10)}"
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO downloads (id, user_id, file_id, filename, file_type, file_size, source_module, download_status, checksum)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (dl_id, user_id, file_id, filename, file_type, file_size, source_module, download_status, checksum)
        )
        conn.commit()

        cur.execute("SELECT * FROM downloads WHERE id = ? AND user_id = ?", (dl_id, user_id))
        return cur.fetchone()


def delete_user_download(user_id: int, download_id: str) -> bool:
    """
    STRICT CHECK: Deletes download record only if user_id owns it.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM downloads WHERE id = ? AND user_id = ?", (download_id, user_id))
        conn.commit()
        return cur.rowcount > 0


# ============================================================================
# 5. RECENT ITEMS & HISTORY ISOLATION
# ============================================================================

def list_user_recent_items(
    user_id: int,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "newest",
    limit: int = 50,
    offset: int = 0
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Returns user history items strictly owned by user_id.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        query = "SELECT * FROM recent_items WHERE user_id = ?"
        params: List[Any] = [user_id]

        if category and category != "all":
            query += " AND item_type = ?"
            params.append(category)

        if search:
            query += " AND (title LIKE ? OR smiles LIKE ? OR detail LIKE ? OR module LIKE ?)"
            s = f"%{search}%"
            params.extend([s, s, s, s])

        order = "ASC" if sort == "oldest" else "DESC"
        query += f" ORDER BY created_at {order} LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cur.execute(query, params)
        rows = cur.fetchall()

        # Format rows with JSON deserialization
        items = []
        for r in rows:
            data_dict = {}
            meta_dict = {}
            try:
                if r.get("data_json"):
                    data_dict = json.loads(r["data_json"])
            except Exception:
                pass
            try:
                if r.get("metadata_json"):
                    meta_dict = json.loads(r["metadata_json"])
            except Exception:
                pass

            items.append({
                "id": r["id"],
                "category": r["item_type"],
                "title": r["title"],
                "module": r["module"],
                "detail": r.get("detail"),
                "smiles": r.get("smiles"),
                "data": data_dict,
                "metadata": meta_dict,
                "createdAt": str(r.get("created_at", "")),
                "lastOpenedAt": str(r.get("last_opened_at", ""))
            })

        # Count total
        count_q = "SELECT COUNT(*) AS total FROM recent_items WHERE user_id = ?"
        count_p: List[Any] = [user_id]
        if category and category != "all":
            count_q += " AND item_type = ?"
            count_p.append(category)
        if search:
            count_q += " AND (title LIKE ? OR smiles LIKE ? OR detail LIKE ? OR module LIKE ?)"
            s = f"%{search}%"
            count_p.extend([s, s, s, s])

        cur.execute(count_q, count_p)
        c_row = cur.fetchone()
        total = c_row.get("total", 0) if c_row else 0
        return items, total


def save_user_recent_item(
    user_id: int,
    item_type: str,
    title: str,
    module: str = "ChemSpace",
    item_id: Optional[str] = None,
    detail: Optional[str] = None,
    smiles: Optional[str] = None,
    data: Optional[Dict[str, Any]] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Saves or updates an item strictly owned by user_id.
    """
    final_id = item_id or f"hist_{secrets.token_hex(10)}"
    data_str = json.dumps(data or {})
    meta_str = json.dumps(metadata or {})

    with get_db_connection() as conn:
        cur = conn.cursor()

        # Check existing ownership
        cur.execute("SELECT user_id FROM recent_items WHERE id = ?", (final_id,))
        existing = cur.fetchone()

        if existing:
            if existing.get("user_id") != user_id:
                # Security violation attempt: cannot modify another user's item
                raise PermissionError("Access denied: You do not own this resource.")

            cur.execute(
                """
                UPDATE recent_items SET
                    item_type = ?, title = ?, module = ?, detail = ?, smiles = ?,
                    data_json = ?, metadata_json = ?, last_opened_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
                """,
                (item_type, title, module, detail, smiles, data_str, meta_str, final_id, user_id)
            )
        else:
            cur.execute(
                """
                INSERT INTO recent_items (
                    id, user_id, item_type, title, module, detail, smiles, data_json, metadata_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (final_id, user_id, item_type, title, module, detail, smiles, data_str, meta_str)
            )

        conn.commit()

        cur.execute("SELECT * FROM recent_items WHERE id = ? AND user_id = ?", (final_id, user_id))
        saved = cur.fetchone()
        return {
            "id": saved["id"],
            "category": saved["item_type"],
            "title": saved["title"],
            "module": saved["module"],
            "smiles": saved.get("smiles"),
            "detail": saved.get("detail"),
            "data": data or {},
            "metadata": metadata or {},
            "createdAt": str(saved.get("created_at", ""))
        }


def delete_user_recent_item(user_id: int, item_id: str) -> bool:
    """
    STRICT CHECK: Deletes item only if user_id owns it.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM recent_items WHERE id = ? AND user_id = ?", (item_id, user_id))
        conn.commit()
        return cur.rowcount > 0


# ============================================================================
# 6. SAVED PROJECTS ISOLATION
# ============================================================================

def list_user_projects(user_id: int, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """
    Lists projects strictly scoped by user_id.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, project_name, project_type, description, created_at, updated_at
            FROM saved_projects
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """,
            (user_id, limit, offset)
        )
        return cur.fetchall()


def get_user_project(user_id: int, project_id: str) -> Optional[Dict[str, Any]]:
    """
    STRICT CHECK: Returns project only if user_id is the owner.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM saved_projects WHERE id = ? AND user_id = ?", (project_id, user_id))
        return cur.fetchone()


def save_user_project(
    user_id: int,
    project_name: str,
    project_type: str,
    project_data: Any,
    project_id: Optional[str] = None,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Saves or updates a project strictly scoped by user_id.
    """
    final_id = project_id or f"proj_{secrets.token_hex(10)}"
    data_str = json.dumps(project_data) if not isinstance(project_data, str) else project_data

    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT user_id FROM saved_projects WHERE id = ?", (final_id,))
        existing = cur.fetchone()

        if existing:
            if existing.get("user_id") != user_id:
                raise PermissionError("Access denied: You do not own this project.")
            cur.execute(
                """
                UPDATE saved_projects SET
                    project_name = ?, project_type = ?, description = ?, project_data = ?
                WHERE id = ? AND user_id = ?
                """,
                (project_name, project_type, description, data_str, final_id, user_id)
            )
        else:
            cur.execute(
                """
                INSERT INTO saved_projects (id, user_id, project_name, project_type, description, project_data)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (final_id, user_id, project_name, project_type, description, data_str)
            )
        conn.commit()

        cur.execute("SELECT * FROM saved_projects WHERE id = ? AND user_id = ?", (final_id, user_id))
        return cur.fetchone()


def delete_user_project(user_id: int, project_id: str) -> bool:
    """
    STRICT CHECK: Deletes project only if user_id owns it.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM saved_projects WHERE id = ? AND user_id = ?", (project_id, user_id))
        conn.commit()
        return cur.rowcount > 0


# ============================================================================
# 7. SAVED MOLECULES ISOLATION
# ============================================================================

def list_user_molecules(user_id: int, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """
    Lists saved molecules strictly owned by user_id.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, name, smiles, inchi, inchikey, formula, molecular_weight, created_at, updated_at
            FROM saved_molecules
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """,
            (user_id, limit, offset)
        )
        return cur.fetchall()


def get_user_molecule(user_id: int, molecule_id: str) -> Optional[Dict[str, Any]]:
    """
    STRICT CHECK: Returns molecule only if owned by user_id.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM saved_molecules WHERE id = ? AND user_id = ?", (molecule_id, user_id))
        return cur.fetchone()


def save_user_molecule(
    user_id: int,
    name: str,
    smiles: str,
    molecule_id: Optional[str] = None,
    inchi: Optional[str] = None,
    inchikey: Optional[str] = None,
    formula: Optional[str] = None,
    molecular_weight: Optional[float] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Saves or updates molecule strictly owned by user_id.
    """
    final_id = molecule_id or f"mol_{secrets.token_hex(10)}"
    meta_str = json.dumps(metadata or {})

    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT user_id FROM saved_molecules WHERE id = ?", (final_id,))
        existing = cur.fetchone()

        if existing:
            if existing.get("user_id") != user_id:
                raise PermissionError("Access denied: You do not own this molecule.")
            cur.execute(
                """
                UPDATE saved_molecules SET
                    name = ?, smiles = ?, inchi = ?, inchikey = ?, formula = ?,
                    molecular_weight = ?, metadata_json = ?
                WHERE id = ? AND user_id = ?
                """,
                (name, smiles, inchi, inchikey, formula, molecular_weight, meta_str, final_id, user_id)
            )
        else:
            cur.execute(
                """
                INSERT INTO saved_molecules (
                    id, user_id, name, smiles, inchi, inchikey, formula, molecular_weight, metadata_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (final_id, user_id, name, smiles, inchi, inchikey, formula, molecular_weight, meta_str)
            )
        conn.commit()

        cur.execute("SELECT * FROM saved_molecules WHERE id = ? AND user_id = ?", (final_id, user_id))
        return cur.fetchone()


def delete_user_molecule(user_id: int, molecule_id: str) -> bool:
    """
    STRICT CHECK: Deletes molecule only if user_id owns it.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM saved_molecules WHERE id = ? AND user_id = ?", (molecule_id, user_id))
        conn.commit()
        return cur.rowcount > 0


# ============================================================================
# 8. AI CONVERSATIONS & MESSAGES ISOLATION
# ============================================================================

def list_user_conversations(user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Lists AI conversations strictly scoped by user_id.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, title, created_at, updated_at
            FROM ai_conversations
            WHERE user_id = ?
            ORDER BY updated_at DESC
            LIMIT ?
            """,
            (user_id, limit)
        )
        return cur.fetchall()


def create_user_conversation(
    user_id: int,
    title: str = "New Scientific Discussion",
    conversation_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates an AI conversation strictly owned by user_id.
    """
    final_id = conversation_id or f"conv_{secrets.token_hex(10)}"
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO ai_conversations (id, user_id, title) VALUES (?, ?, ?)",
            (final_id, user_id, title)
        )
        conn.commit()

        cur.execute("SELECT * FROM ai_conversations WHERE id = ? AND user_id = ?", (final_id, user_id))
        return cur.fetchone()


def get_conversation_messages(user_id: int, conversation_id: str) -> Optional[List[Dict[str, Any]]]:
    """
    STRICT CHECK: Verifies user_id owns conversation before returning any messages.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM ai_conversations WHERE id = ? AND user_id = ?", (conversation_id, user_id))
        conv = cur.fetchone()
        if not conv:
            return None

        cur.execute(
            """
            SELECT id, conversation_id, role, content, reasoning_details, molecule_card, created_at
            FROM ai_messages
            WHERE conversation_id = ? AND user_id = ?
            ORDER BY created_at ASC
            """,
            (conversation_id, user_id)
        )
        return cur.fetchall()


def add_conversation_message(
    user_id: int,
    conversation_id: str,
    role: str,
    content: str,
    reasoning_details: Optional[str] = None,
    molecule_card: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Adds message to conversation. Validates conversation ownership first.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()

        # Strict check
        cur.execute("SELECT id FROM ai_conversations WHERE id = ? AND user_id = ?", (conversation_id, user_id))
        conv = cur.fetchone()
        if not conv:
            raise PermissionError("Access denied: You do not own this AI conversation.")

        msg_id = f"msg_{secrets.token_hex(12)}"
        card_str = json.dumps(molecule_card) if molecule_card and not isinstance(molecule_card, str) else molecule_card

        cur.execute(
            """
            INSERT INTO ai_messages (id, conversation_id, user_id, role, content, reasoning_details, molecule_card)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (msg_id, conversation_id, user_id, role, content, reasoning_details, card_str)
        )

        # Update conversation timestamp
        cur.execute("UPDATE ai_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (conversation_id,))
        conn.commit()

        cur.execute("SELECT * FROM ai_messages WHERE id = ?", (msg_id,))
        return cur.fetchone()


# ============================================================================
# 9. USER ACTIVITY AUDIT LOGGING
# ============================================================================

def log_user_activity(
    user_id: int,
    action_type: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = "127.0.0.1"
):
    """
    Logs an audit event scoped strictly to user_id.
    """
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO activity_history (user_id, action_type, resource_type, resource_id, details, ip_address)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (user_id, action_type, resource_type, resource_id, details, ip_address)
            )
            conn.commit()
    except Exception as e:
        logger.error(f"[Audit] Failed to log activity: {e}")


def get_user_audit_logs(user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Returns audit logs strictly concerning the authenticated user.
    """
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, action_type, resource_type, resource_id, details, ip_address, created_at
            FROM activity_history
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (user_id, limit)
        )
        rows = cur.fetchall()
        logs = []
        for r in rows:
            logs.append({
                "id": r["id"],
                "eventType": r["action_type"],
                "resourceType": r.get("resource_type"),
                "resourceId": r.get("resource_id"),
                "details": r.get("details", ""),
                "ipAddress": r.get("ip_address", ""),
                "timestamp": str(r.get("created_at", ""))
            })
        return logs
