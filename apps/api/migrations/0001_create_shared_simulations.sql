CREATE TABLE shared_simulations (
  id          TEXT PRIMARY KEY,          -- 10 chars, base62, gerado com crypto.getRandomValues
  input_json  TEXT NOT NULL,             -- só as entradas validadas, nunca o resultado
  schema_ver  INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL,             -- ISO-8601
  expires_at  TEXT NOT NULL
);
CREATE INDEX idx_shared_expires ON shared_simulations(expires_at);
