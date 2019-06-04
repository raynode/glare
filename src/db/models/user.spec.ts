
import { internet, name, random } from 'faker'
import { QueryBuilder } from 'knex'

import { db } from '../db'
import { User, Users } from './user'

describe('User Model Tests', () => {
  beforeAll(async () => db('Users').del())
  afterAll(() => db.client.pool.destroy())

  describe('Basic user data', () => {

    const order = 'id_ASC'
    let id: string
    let userObject: User

    const whereId = (id: string) => (query: QueryBuilder) => query.where({ id })

    const matchUser = ({ updated_at: _, ...modifiedUser }: User) => {
      const { updated_at, ...modifiedUserObject } = userObject
      expect(modifiedUser).toMatchObject(modifiedUserObject)
    }

    it('should have an empty database', async () => {
      expect(await db('Users')).toHaveLength(0)
    })

    it('should create a user', async () => {
      userObject = (await Users.create({ data: {
        givenName: name.lastName(),
        familyName: name.lastName(),
        nickname: random.word(),
        name: name.findName(),
        email: internet.email().toLowerCase(),
      }}))[0]
      id = userObject.id
    })

    it('should find the user with findMany', async () => {
      const results = await Users.find()
      expect(results).toHaveLength(1)
      matchUser(results[0])
    })

    it('should find the user with findOne by id', async () => {
      const result = await Users.find({ where: whereId(id) })
      matchUser(result[0])
    })

    it('should update the example users name', async () => {
      const newName = name.findName()
      const update = await Users.update({ where: whereId(id), data: { name: newName }})
      userObject.name = newName
      matchUser(update[0])
    })

    it('should remove the example user and return the data', async () => {
      const users = await Users.remove({ where: whereId(id) })
      expect(users).toHaveLength(1)
      expect(users[0].deleted_at).not.toBeNull()
      users[0].deleted_at = null
      matchUser(users[0])
    })

    it('should not find the user anymore', async () => {
      const results = await Users.find()
      expect(results).toHaveLength(0)
    })

    it('should still have the user in the database', async () => {
      expect(await db('Users')).toHaveLength(1)
    })
  })
})
