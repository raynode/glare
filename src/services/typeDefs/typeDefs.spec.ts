import { join } from 'path'

import * as faker from 'faker'
import * as mock from 'mock-fs'

import { loadTypeDefs } from './index'

describe('utils/typeDefs:loadTypeDefs', () => {
  afterEach(() => {
    mock.restore()
  })

  it('should return a function', () => {
    expect(typeof loadTypeDefs(faker.lorem.word())).toEqual('function')
  })

  it('should return the contents of the schema.graphql file', () => {
    const dir = faker.lorem.word()
    const contents = faker.lorem.words(150)
    mock({
      [join(dir, dir + '.schema.graphql')]: contents,
    })
    expect(loadTypeDefs(dir)()).toEqual(contents)
  })
})
