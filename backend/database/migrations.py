"""
ChemSpace Database Schema Migrations Runner
Ensures all required normalized tables and indices exist in MySQL and fallback SQLite engine.
"""

import logging
from .connection import get_db_connection, detect_and_test_engine

logger = logging.getLogger("chemspace.migrations")

MIGRATIONS = [
    {
        "version": 1,
        "name": "001_initial_user_isolation_schema",
        "mysql_sql": [
            """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                firebase_uid VARCHAR(128) NOT NULL UNIQUE,
                email VARCHAR(255),
                display_name VARCHAR(255),
                photo_url TEXT,
                phone_number VARCHAR(50),
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_login_at TIMESTAMP NULL,
                INDEX idx_users_firebase_uid (firebase_uid),
                INDEX idx_users_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """,
            """
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                workplace VARCHAR(255) DEFAULT 'ChemNova Research Institute',
                title VARCHAR(255) DEFAULT 'Lead Research Chemist',
                department VARCHAR(255) DEFAULT 'Department of Synthetic & Computational Chemistry',
                lab_room VARCHAR(100) DEFAULT 'Suite B-402',
                safety_level VARCHAR(100) DEFAULT 'BSL-2 / Chemical Class 1',
                orcid VARCHAR(100) DEFAULT '0000-0002-1825-0097',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_profiles_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """,
            """
            CREATE TABLE IF NOT EXISTS user_preferences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                theme VARCHAR(50) DEFAULT 'dark',
                language VARCHAR(50) DEFAULT 'en',
                voice_id VARCHAR(100) DEFAULT 'default',
                speech_speed FLOAT DEFAULT 1.0,
                voice_enabled BOOLEAN DEFAULT TRUE,
                auto_read BOOLEAN DEFAULT FALSE,
                ai_response_mode VARCHAR(50) DEFAULT 'balanced',
                web_search_enabled BOOLEAN DEFAULT TRUE,
                watermark_enabled BOOLEAN DEFAULT TRUE,
                privacy_blur_enabled BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_preferences_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """,
            """
            CREATE TABLE IF NOT EXISTS files (
                id VARCHAR(64) PRIMARY KEY,
                user_id INT NOT NULL,
                original_name VARCHAR(255) NOT NULL,
                stored_name VARCHAR(255) NOT NULL,
                storage_path VARCHAR(500) NOT NULL,
                mime_type VARCHAR(100) NOT NULL,
                file_size BIGINT NOT NULL,
                checksum VARCHAR(128),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_files_user (user_id, created_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """,
            """
            CREATE TABLE IF NOT EXISTS downloads (
                id VARCHAR(64) PRIMARY KEY,
                user_id INT NOT NULL,
                file_id VARCHAR(64),
                filename VARCHAR(255) NOT NULL,
                file_type VARCHAR(50) NOT NULL,
                file_size BIGINT DEFAULT 0,
                source_module VARCHAR(100) NOT NULL,
                download_status VARCHAR(50) DEFAULT 'completed',
                checksum VARCHAR(128),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_downloads_user (user_id, created_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """,
            """
            CREATE TABLE IF NOT EXISTS recent_items (
                id VARCHAR(64) PRIMARY KEY,
                user_id INT NOT NULL,
                item_type VARCHAR(100) NOT NULL,
                item_id VARCHAR(100),
                title VARCHAR(255) NOT NULL,
                module VARCHAR(100) NOT NULL,
                detail TEXT,
                smiles TEXT,
                data_json LONGTEXT,
                metadata_json LONGTEXT,
                last_opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_recent_user_type (user_id, item_type),
                INDEX idx_recent_user_opened (user_id, last_opened_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """,
            """
            CREATE TABLE IF NOT EXISTS saved_projects (
                id VARCHAR(64) PRIMARY KEY,
                user_id INT NOT NULL,
                project_name VARCHAR(255) NOT NULL,
                project_type VARCHAR(100) NOT NULL,
                description TEXT,
                project_data LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_projects_user (user_id, created_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """,
            """
            CREATE TABLE IF NOT EXISTS saved_molecules (
                id VARCHAR(64) PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                smiles TEXT NOT NULL,
                inchi TEXT,
                inchikey VARCHAR(100),
                formula VARCHAR(100),
                molecular_weight DECIMAL(10, 4),
                metadata_json LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_molecules_user (user_id, created_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """,
            """
            CREATE TABLE IF NOT EXISTS ai_conversations (
                id VARCHAR(64) PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_conversations_user (user_id, updated_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """,
            """
            CREATE TABLE IF NOT EXISTS ai_messages (
                id VARCHAR(64) PRIMARY KEY,
                conversation_id VARCHAR(64) NOT NULL,
                user_id INT NOT NULL,
                role VARCHAR(50) NOT NULL,
                content LONGTEXT NOT NULL,
                reasoning_details TEXT,
                molecule_card TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_messages_conv (conversation_id, created_at ASC),
                INDEX idx_messages_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """,
            """
            CREATE TABLE IF NOT EXISTS activity_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                action_type VARCHAR(100) NOT NULL,
                resource_type VARCHAR(100),
                resource_id VARCHAR(100),
                details TEXT,
                ip_address VARCHAR(45),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_activity_user (user_id, created_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
        ],
        "sqlite_sql": [
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firebase_uid TEXT NOT NULL UNIQUE,
                email TEXT,
                display_name TEXT,
                photo_url TEXT,
                phone_number TEXT,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login_at REAL
            );
            """,
            "CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);",
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
            """
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                workplace TEXT DEFAULT 'ChemNova Research Institute',
                title TEXT DEFAULT 'Lead Research Chemist',
                department TEXT DEFAULT 'Department of Synthetic & Computational Chemistry',
                lab_room TEXT DEFAULT 'Suite B-402',
                safety_level TEXT DEFAULT 'BSL-2 / Chemical Class 1',
                orcid TEXT DEFAULT '0000-0002-1825-0097',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """,
            "CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON user_profiles(user_id);",
            """
            CREATE TABLE IF NOT EXISTS user_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                theme TEXT DEFAULT 'dark',
                language TEXT DEFAULT 'en',
                voice_id TEXT DEFAULT 'default',
                speech_speed REAL DEFAULT 1.0,
                voice_enabled INTEGER DEFAULT 1,
                auto_read INTEGER DEFAULT 0,
                ai_response_mode TEXT DEFAULT 'balanced',
                web_search_enabled INTEGER DEFAULT 1,
                watermark_enabled INTEGER DEFAULT 1,
                privacy_blur_enabled INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """,
            "CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON user_preferences(user_id);",
            """
            CREATE TABLE IF NOT EXISTS files (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                original_name TEXT NOT NULL,
                stored_name TEXT NOT NULL,
                storage_path TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                checksum TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """,
            "CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id, created_at DESC);",
            """
            CREATE TABLE IF NOT EXISTS downloads (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                file_id TEXT,
                filename TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER DEFAULT 0,
                source_module TEXT NOT NULL,
                download_status TEXT DEFAULT 'completed',
                checksum TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """,
            "CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id, created_at DESC);",
            """
            CREATE TABLE IF NOT EXISTS recent_items (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                item_type TEXT NOT NULL,
                item_id TEXT,
                title TEXT NOT NULL,
                module TEXT NOT NULL,
                detail TEXT,
                smiles TEXT,
                data_json TEXT,
                metadata_json TEXT,
                last_opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """,
            "CREATE INDEX IF NOT EXISTS idx_recent_user_type ON recent_items(user_id, item_type);",
            "CREATE INDEX IF NOT EXISTS idx_recent_user_opened ON recent_items(user_id, last_opened_at DESC);",
            """
            CREATE TABLE IF NOT EXISTS saved_projects (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                project_name TEXT NOT NULL,
                project_type TEXT NOT NULL,
                description TEXT,
                project_data TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """,
            "CREATE INDEX IF NOT EXISTS idx_projects_user ON saved_projects(user_id, created_at DESC);",
            """
            CREATE TABLE IF NOT EXISTS saved_molecules (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                smiles TEXT NOT NULL,
                inchi TEXT,
                inchikey TEXT,
                formula TEXT,
                molecular_weight REAL,
                metadata_json TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """,
            "CREATE INDEX IF NOT EXISTS idx_molecules_user ON saved_molecules(user_id, created_at DESC);",
            """
            CREATE TABLE IF NOT EXISTS ai_conversations (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """,
            "CREATE INDEX IF NOT EXISTS idx_conversations_user ON ai_conversations(user_id, updated_at DESC);",
            """
            CREATE TABLE IF NOT EXISTS ai_messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                reasoning_details TEXT,
                molecule_card TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """,
            "CREATE INDEX IF NOT EXISTS idx_messages_conv ON ai_messages(conversation_id, created_at ASC);",
            "CREATE INDEX IF NOT EXISTS idx_messages_user ON ai_messages(user_id);",
            """
            CREATE TABLE IF NOT EXISTS activity_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                action_type TEXT NOT NULL,
                resource_type TEXT,
                resource_id TEXT,
                details TEXT,
                ip_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """,
            "CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_history(user_id, created_at DESC);"
        ]
    }
]


def run_migrations():
    """
    Applies any outstanding database migrations safely.
    """
    engine = detect_and_test_engine()
    logger.info(f"[Database Migrations] Checking schema on active engine: {engine.upper()}")

    with get_db_connection() as conn:
        cur = conn.cursor()

        # 1. Ensure schema_migrations table exists
        if engine == "mysql":
            cur.execute("""
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version INT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
        else:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """)
        conn.commit()

        # 2. Get list of applied migration versions
        cur.execute("SELECT version FROM schema_migrations")
        applied_rows = cur.fetchall()
        applied_versions = {r["version"] for r in applied_rows}

        # 3. Apply missing migrations
        for migration in MIGRATIONS:
            v = migration["version"]
            name = migration["name"]

            if v in applied_versions:
                continue

            logger.info(f"[Database Migrations] Applying migration v{v}: {name}...")

            # Safe legacy migration check: ensure users table has firebase_uid
            try:
                if engine == "sqlite":
                    cur.execute("PRAGMA table_info(users)")
                    cols = [r["name"] for r in cur.fetchall()]
                    if cols and "firebase_uid" not in cols:
                        logger.info("[Database Migrations] Upgrading legacy users table to users_legacy_backup...")
                        cur.execute("ALTER TABLE users RENAME TO users_legacy_backup")
                        conn.commit()
                else:
                    cur.execute("SHOW TABLES LIKE 'users'")
                    if cur.fetchone():
                        cur.execute("SHOW COLUMNS FROM users LIKE 'firebase_uid'")
                        if not cur.fetchone():
                            logger.info("[Database Migrations] Upgrading legacy MySQL users table...")
                            cur.execute("RENAME TABLE users TO users_legacy_backup")
                            conn.commit()
            except Exception as leg_err:
                logger.warning(f"[Database Migrations] Legacy table check note: {leg_err}")

            statements = migration["mysql_sql"] if engine == "mysql" else migration["sqlite_sql"]

            for stmt in statements:
                stmt_clean = stmt.strip()
                if stmt_clean:
                    cur.execute(stmt_clean)

            cur.execute(
                "INSERT INTO schema_migrations (version, name) VALUES (?, ?)",
                (v, name)
            )
            conn.commit()
            logger.info(f"[Database Migrations] Successfully applied migration v{v}.")

    logger.info(f"[Database Migrations] All migrations up to date.")
