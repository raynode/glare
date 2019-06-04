
import * as Knex from 'knex'
import { v4 as uuid } from 'uuid'

export const up = async (knex: Knex) => knex.schema
  .createTable('Users', table => {
    table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().unique().primary()
    table.string('givenName')
    table.string('familyName')
    table.string('nickname')
    table.string('name').notNullable()
    table.string('picture')
    table.string('gender')
    table.string('locale')
    table.string('googleID')
    table.enum('state', ['admin', 'member', 'guest'])
    table.string('email').unique().notNullable()
    table.boolean('emailVerified')
    table.timestamps(true, true)
    table.dateTime('deleted_at').defaultTo(null).comment('set to delete this')
  })

  .raw(`
    CREATE TRIGGER updateUsersUpdatedAt
      BEFORE UPDATE ON "public"."Users"
        FOR EACH ROW
          EXECUTE PROCEDURE updateUpdatedAt()
  `)

  .raw(`
    ALTER TABLE "public"."Users"
      ADD CONSTRAINT users_email_need_to_be_lowercase
        CHECK (email = lower(email));
  `)

export const down = (knex: Knex) => knex.schema
  .dropTable('Users')
