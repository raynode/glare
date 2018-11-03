import { create } from 'services/logger'
import { applyToRecordOf, RecordOf } from './utils'

const logger = create('graphql-connector')

export type FieldType = 'Attribute' | 'Association'

export interface BaseAttribute {
  nonNull?: boolean
  list?: boolean
}

export interface BaseField extends BaseAttribute {
  fieldType: FieldType
  list: boolean
  name: string
  nonNull: boolean
}

export interface Attribute<Types> extends BaseAttribute {
  type: Types
}
export interface Association<Models> extends BaseAttribute {
  model: Models
}

export type Fields<Attrs, Assocs, Types, Models> = RecordOf<Attrs & Assocs, BaseAttribute>

export interface Model<Attrs, Assocs, Types, Models> {
  name: Models
  attributes: Attributes<Attrs, Types>
  associations: Associations<Assocs, Models>
  fields: BaseField[]
}
export type AnyModel<Types, Models> = Model<any, any, Types, Models>

export type Attributes<Attrs, Types> = RecordOf<Attrs, Attribute<Types>>
export type Associations<Assocs, Models> = RecordOf<Assocs, Association<Models>>

export type ModelCache<Models extends string, Type = any> = { [key in Models]: Type }

export const completeBaseAttribute = (attribute: BaseAttribute): BaseAttribute => ({
  nonNull: false,
  list: false,
  ...attribute,
})

export const completeAttribute = <Types>(attribute: Attribute<Types>): Attribute<Types> => ({
  ...attribute,
  ...completeBaseAttribute(attribute),
})

export const completeAssociation = <Models>(association: Association<Models>): Association<Models> => ({
  ...association,
  ...completeBaseAttribute(association),
})

export type ModelCreator<Types, Models extends string> = <Attrs, Assocs, Name extends Models>(
  name: Name,
  attributes?: Attributes<Attrs, Types>,
  associations?: Associations<Assocs, Models>,
) => Model<Attrs, Assocs, Types, Models>

export const modelCreator = <Types, Models extends string>(): ModelCreator<Types, Models> => {
  const models: ModelCache<any> = {} as any

  return (name, partialAttributes = {} as any, partialAssociations = {} as any) => {
    logger(`creating Model ${name}`)
    const log = logger(name)
    const attributes = applyToRecordOf(partialAttributes, completeAttribute)
    const associations = applyToRecordOf(partialAssociations, completeAssociation)
    const fields = Object.keys(attributes)
      .map(
        (field: string): BaseField => ({
          fieldType: 'Attribute',
          name: field,
          ...attributes[field],
        }),
      )
      .concat(
        Object.keys(associations).map(
          (field: string): BaseField => ({
            fieldType: 'Association',
            name: field,
            ...associations[field],
          }),
        ),
      )
    const model = { attributes, associations, name, fields }
    models[name] = model
    return model
  }
}
