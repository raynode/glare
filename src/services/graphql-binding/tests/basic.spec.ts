// tslint:disable-next-line
import * as faker from 'faker'

import { createModel } from '../create-model'

import { modelsToSDL } from './test-utils'

describe('basic graphql generation', () => {
  it('should create a basic graphql setup from a model', () => {
    const model = createModel(
      'BasicTest',
      {
        stringField: {
          allowNull: true,
          allowUpdate: true,
          comment: 'this is a test-string field',
          defaultValue: 'none',
          type: 'string',
          visible: true,
        },
      },
      {
        createOne: () => null,
        findOne: () => null,
        deleteMany: () => null,
        findMany: () => null,
        update: () => null,
      },
    )
    expect(modelsToSDL([model])).toMatchSnapshot()
  })
})
