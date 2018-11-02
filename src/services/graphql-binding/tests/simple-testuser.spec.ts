// tslint:disable-next-line
import * as faker from 'faker'

import { createModel } from '../create-model'

import { Methods, QueryGenerator } from '../types'
import { modelsToSchema, modelsToSDL } from './test-utils'

import { graphql, GraphQLSchema } from 'graphql'

interface TestUser {
  id: number
  email: string
  nickname?: string
}
let testusers = []
const queryGenerator: QueryGenerator = <T>(model: T) => {
  const methods: Methods<TestUser> = {
    createOne: async user => {
      testusers.push(user)
      return user as TestUser
    },
    findOne: async ({ nickname, email }, order, offset) => {
      if (nickname && email) return testusers.find(user => user.nickname === nickname && user.email === email)
      if (nickname) return testusers.find(user => user.nickname === nickname)
      if (email) return testusers.find(user => user.email === email)
      throw new Error('need some filter')
    },
    deleteMany: async (where, order, offset, limit) => {
      const hits = await methods.findMany(where, order, offset, limit)
      const ids = hits.map(user => user.id)
      testusers = testusers.filter(user => !ids.includes(user.id))
      return hits
    },
    findMany: async ({ nickname, email }, order, offset, limit) => {
      if (nickname && email) return testusers.filter(user => user.nickname === nickname && user.email === email)
      if (nickname) return testusers.filter(user => user.nickname === nickname)
      if (email) return testusers.filter(user => user.email === email)
      throw new Error('need some filter')
    },
    update: async (where, order, offset, { nickname, email }) => {
      const user = await methods.findOne(where, order, offset, 1)
      if (user) {
        if (nickname) user.nickname = nickname
        if (email) user.email = email
      }
      return user
    },
  }
  return methods as any
}

const Testuser = createModel('Testuser', {
  id: {
    allowNull: false,
    allowUpdate: true,
    comment: 'Invisible Field, hidden from the schema',
    type: 'string',
    visible: false,
  },
  email: {
    allowNull: false,
    allowUpdate: true,
    comment: 'Not-Null field',
    type: 'string',
    visible: true,
  },
  nickname: {
    allowNull: true,
    allowUpdate: true,
    comment: 'Nullable field',
    defaultValue: null,
    type: 'string',
    visible: true,
  },
})

describe('basic graphql generation', () => {
  let run: (query: string, variables?: Record<string, any>, context?: any) => any
  let schema: GraphQLSchema

  beforeEach(() => {
    testusers = [
      {
        id: 473,
        email: 'test@domain.com',
        nickname: 'example',
      },
    ]
    schema = modelsToSchema([Testuser], { methodMapper: queryGenerator })
    run = (query, variables = {}, ctx = null) => graphql(schema, query, null, { ctx }, variables)
  })

  it('should create a basic graphql setup from a model', () => {
    expect(modelsToSDL([Testuser])).toMatchSnapshot()
  })

  it('should run a findOne query correctly', async () => {
    const result = await run(`{
      data: Testuser(where: { nickname: "example" }) { email }
    }`)
    expect(result.data).toEqual({ data: { email: 'test@domain.com' } })
  })

  it('should run a findMany query correctly', async () => {
    const result = await run(`{
      data: Testusers(where: { email: "test@domain.com" }) { nickname }
    }`)
    expect(result.data).toEqual({ data: [{ nickname: 'example' }] })
  })

  it('should run a create mutation correctly', async () => {
    const result = await run(`mutation {
      data: createTestuser(data: { email: "new+user@domain.com", nickname: "newb" }) { email nickname }
    }`)
    expect(result.data).toEqual({ data: { email: 'new+user@domain.com', nickname: 'newb' } })
    expect(testusers).toHaveLength(2)
  })

  it('should run a delete mutation correctly', async () => {
    const result = await run(`mutation {
      data: deleteTestusers(where: { nickname: "example" }) { email nickname }
    }`)
    expect(result.data).toEqual({ data: [{ email: 'test@domain.com', nickname: 'example' }] })
    expect(testusers).toHaveLength(0)
  })

  it('should run a update mutation correctly', async () => {
    const result = await run(`mutation {
      data: updateTestuser(
        where: { nickname: "example" }
        data: {
          email: "super+user@domain.com"
          nickname: "superman"
        }
      ) { email nickname }
    }`)
    expect(result.data).toEqual({ data: { email: 'super+user@domain.com', nickname: 'superman' } })
  })
})
