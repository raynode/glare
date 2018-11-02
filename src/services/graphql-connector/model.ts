import { mapValues } from 'lodash'
import { create } from 'services/logger'

const logger = create('graphql-connector')

export type RecordOf<Keys, Type> = { [key in keyof Keys]: Type }

export interface BaseAttribute {
  nonNull?: boolean
  list?: boolean
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
  fields: Fields<Attrs, Assocs, Types, Models>
}

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

export const applyToRecordOf = <Keys, Types>(record: RecordOf<Keys, Types>, method: (type: Types) => Types) =>
  mapValues(record, method) as RecordOf<Keys, Types>

export const modelCreator = <Types, Models extends string>() => {
  const models: ModelCache<any> = {} as any

  return <Attrs, Assocs, Name extends Models>(
    name: Name,
    attributes: Attributes<Attrs, Types> = {} as any,
    associations: Associations<Assocs, Models> = {} as any,
  ) => {
    logger(`creating Model ${name}`)
    const log = logger(name)
    const model: Model<Attrs, Assocs, Types, Models> = {
      name,
      attributes: applyToRecordOf(attributes, completeAttribute),
      associations: applyToRecordOf(associations, completeAssociation),
      fields: {
        ...(attributes as any),
        ...(associations as any),
      },
    }
    models[name] = model
    return model
  }
}
