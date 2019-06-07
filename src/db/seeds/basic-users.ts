import { NodeType } from 'gram'
import * as Knex from 'knex'
import { User } from '../models'

export const seed = async (knex: Knex) => {
  await knex('Users').del()

  type RequiredProperties = 'name' | 'email' | 'state'
  const users: Array<Pick<User, RequiredProperties> & Partial<User>> = [
    {
      // ADMIN
      givenName: 'Kopelke',
      nickname: 'Nox',
      name: 'nox',
      state: 'admin',
      email: 'kopelke@gmail.com',
      emailVerified: true,
    },
    {
      // MEMBER
      nickname: 'Testy',
      name: 'Test-User',
      state: 'member',
      email: 'nox@raynode.de',
      emailVerified: true,
    },
    {
      // GUEST
      name: 'unknown',
      state: 'guest',
      email: 'unknown@example.com',
      emailVerified: false,
    },
    {
      name: 'RETRACTED',
      state: 'guest',
      email: 'retracted@raynode.de',
      emailVerified: true,
      deleted_at: new Date(),
    },
  ]

  await knex('Users').insert(users)
}
