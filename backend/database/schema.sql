-- ChemSpace Secure Enterprise Database Schema (v4.0)
-- Engine: MySQL 8.0+ / MariaDB 10.5+ with InnoDB
-- Strict User Data Isolation & Customer Data Management Architecture

CREATE DATABASE IF NOT EXISTS chemspace_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE chemspace_db;

-- 1. Users Table (Permanent Identity Reference: Firebase UID)
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

-- 2. User Profiles Table (Laboratory, Title, Research Field)
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

-- 3. User Preferences Table (Theme, Audio, AI mode, Privacy)
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

-- 4. Files Metadata Table (User-Specific Private Storage)
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

-- 5. Downloads Tracking Table (User-Specific Download History)
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

-- 6. Recent Items / Navigation History (User-Specific)
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

-- 7. Saved Chemistry Projects (ChemDraw, Retrosynthesis, Kinetics)
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

-- 8. Saved Molecules (User-Specific Molecule Vault)
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

-- 9. AI Conversations (ChemSpace Scientific Chat Sessions)
CREATE TABLE IF NOT EXISTS ai_conversations (
    id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversations_user (user_id, updated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. AI Messages (User-Scoped Messages with Chemical Cards)
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

-- 11. Activity History (Auditable User Events)
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

-- 12. Schema Migrations Log
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
