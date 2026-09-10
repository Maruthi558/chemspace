import React, { useState } from 'react';
import { Database, Download, Check, ShieldCheck, Key, RefreshCw, Code, Layers } from 'lucide-react';

const MYSQL_SCHEMA_SQL = `-- ChemNova MySQL Database Schema (v3.0)
CREATE DATABASE IF NOT EXISTS chemspace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chemspace_db;

-- Table: Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table: Molecules
CREATE TABLE IF NOT EXISTS molecules (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    formula VARCHAR(100) NOT NULL,
    smiles TEXT NOT NULL,
    inchi TEXT,
    mol_weight DECIMAL(10, 4) NOT NULL,
    logp DECIMAL(6, 2),
    tpsa DECIMAL(6, 2),
    hbd INT DEFAULT 0,
    hba INT DEFAULT 0,
    rotatable_bonds INT DEFAULT 0,
    rings INT DEFAULT 0,
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table: ML Models & Predictions
CREATE TABLE IF NOT EXISTS ml_models (
    id VARCHAR(100) PRIMARY KEY,
    model_name VARCHAR(200) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    dataset_name VARCHAR(100) NOT NULL,
    r2_score DECIMAL(5, 4),
    rmse DECIMAL(6, 4),
    trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`;

export default function MySqlDatabasePage() {
  const [copied, setCopied] = useState(false);
  const [dbHost, setDbHost] = useState('localhost:3306');
  const [dbUser, setDbUser] = useState('chemspace_user');
  const [dbName, setDbName] = useState('chemspace_db');
  const [isConnected, setIsConnected] = useState(true);

  function downloadSqlSchema() {
    const blob = new Blob([MYSQL_SCHEMA_SQL], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chemspace_mysql_schema.sql';
    link.click();
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-[#111319]/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="telemetry-pill">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              RELATIONAL PERSISTENCE
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">ACID Data Connect</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <Database className="w-7 h-7 text-emerald-400" />
            MySQL Relational Database Integration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            MySQL 8.0 / MariaDB relational database architecture, connection pool, and DDL schema exporter.
          </p>
        </div>

        <button
          onClick={downloadSqlSchema}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download MySQL Schema (.sql)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Connection Settings */}
        <div className="lg:col-span-5 bg-[#111319]/90 border border-white/10 rounded-2xl p-5 space-y-4 text-xs font-mono">
          <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-white/10 pb-3">
            <span>MySQL Connection Credentials</span>
            <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">Connected</span>
          </h3>

          <div>
            <label className="text-slate-400 block mb-1">Host & Port:</label>
            <input
              type="text"
              value={dbHost}
              onChange={(e) => setDbHost(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 rounded-xl p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Database Name:</label>
            <input
              type="text"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 rounded-xl p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">MySQL Username:</label>
            <input
              type="text"
              value={dbUser}
              onChange={(e) => setDbUser(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/10 rounded-xl p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* SQL Schema Preview */}
        <div className="lg:col-span-7 bg-[#111319]/90 border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-mono font-bold text-emerald-400 flex items-center justify-between border-b border-white/10 pb-3">
            <span className="flex items-center gap-2"><Code className="w-4 h-4 text-emerald-400" /> MySQL DDL Schema Definition</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(MYSQL_SCHEMA_SQL);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              {copied ? 'Copied!' : 'Copy SQL'}
            </button>
          </h3>

          <textarea
            readOnly
            value={MYSQL_SCHEMA_SQL}
            className="w-full h-80 bg-[#090a0f] border border-white/10 rounded-xl p-4 text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
