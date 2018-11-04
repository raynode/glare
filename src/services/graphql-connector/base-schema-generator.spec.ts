import { BaseSchemaGenerator, createModelRecord } from './base-schema-generator'
import { modelCreator, ModelCreator } from './model'
import { createSDL, Models, Types } from './tests/utils'

describe('base-schema-generator', () => {
  let creator: ModelCreator<Types, Models>
  let generator: BaseSchemaGenerator<Types>
  beforeEach(() => {
    creator = modelCreator<Types, Models>()
    generator = createModelRecord({
      typeConverter: type => null,
    })
  })

  it('should be a function, and generate a empty schema without any models', () => {
    expect(typeof generator).toBe('function')
    const baseSchema = generator([])
    expect(typeof baseSchema).toBe('object')
    expect(baseSchema).toHaveProperty('queryFields')
    expect(baseSchema).toHaveProperty('mutationFields')
    // expect(baseSchema).toHaveProperty('subscriptionFields')
  })

  it('should create the fields list in a model', () => {
    const sampleModel = creator('Sample', {
      number: { type: 'int' },
      name: { type: 'string' },
    })
    const otherModel = creator(
      'Other',
      {
        value: { type: 'string' },
      },
      {
        sample: { model: 'Sample' },
        more: { model: 'Other' },
      },
    )
    const baseSchema = generator([sampleModel, otherModel])
    console.log(createSDL(baseSchema))
  })
})
