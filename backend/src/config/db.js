const Database = require("better-sqlite3");
const path = require("path");

// Permite apontar para um banco diferente em testes (ex: DB_PATH=":memory:"),
// sem precisar tocar no banco de desenvolvimento.
const caminhoDb = process.env.DB_PATH || path.join(__dirname, "..", "..", "kanban.db");

const db = new Database(caminhoDb);

// Sem isso, as constraints FOREIGN KEY declaradas abaixo não são
// realmente aplicadas pelo SQLite (ficam só "de decoração").
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    usuario TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS colunas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    ordem INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    prioridade TEXT DEFAULT 'media',
    prazo TEXT,
    coluna_id INTEGER NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (coluna_id) REFERENCES colunas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_colunas_usuario ON colunas(usuario_id);
  CREATE INDEX IF NOT EXISTS idx_cards_usuario ON cards(usuario_id);
  CREATE INDEX IF NOT EXISTS idx_cards_coluna ON cards(coluna_id);
`);

module.exports = db;
