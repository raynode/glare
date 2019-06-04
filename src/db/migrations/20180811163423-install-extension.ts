
import * as Knex from 'knex'
import { v4 as uuid } from 'uuid'

export const up = async (knex: Knex) => knex.schema
  .raw(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`)
  .raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
  .raw(`
CREATE OR REPLACE FUNCTION updateUpdatedAt()
RETURNS TRIGGER AS $$
  BEGIN
    NEW."updated_at" = NOW();
    RETURN NEW;
  END;
$$ LANGUAGE 'plpgsql'
  `)

export const down = async (knex: Knex) => knex.schema
  .raw(`DROP FUNCTION IF EXISTS updateUpdatedAt;`)
  .raw(`DROP EXTENSION IF EXISTS "uuid-ossp";`)
  .raw(`DROP EXTENSION IF EXISTS "pgcrypto";`)
