
import { capitalize, pluralize, singularize } from 'inflection'
import { Dictionary, keyBy, map, mapValues } from 'lodash'
import { Instance, Model as SeqModel } from 'services/db'
import { Model } from './types'

export interface RawModel<Attr, Inst extends Instance<Attr>> extends SeqModel<Inst & Attr, Attr> {
  rawAttributes: any
  associations: Dictionary<any>
  attributes: any
  sequelize: any
}

export const models = {}
export const convertToModel = <Attr, Inst extends Instance<Attr> & Attr>(rawModel: SeqModel<Inst, Attr>): Model => {
  const localModel: RawModel<Attr, Inst> = rawModel as any

  const name = capitalize(singularize(localModel.name))
  // check model cache
  if(models[name])
    return models[name]
  const model: Model = {
    name,
    attributes: localModel.attributes,
    associations: {},
    fieldNames: {
      create: `${name}CreateInput`,
      list: `${name}ListType`,
      model: `${name}`,
      order: `${name}OrderEnum`,
      page: `Page`,
      update: `${name}UpdateInput`,
    },
    names: {
      create: `onCreate${name}`,
      createOne: `create${name}`,
      delete: `onDelete${name}`,
      deleteMany: `delete${pluralize(name)}`,
      findMany: `${pluralize(name)}`,
      findOne: `${name}`,
      filters: `${name}Filter`,
      updateData: `Update${name}`,
      createData: `Initial${name}`,
      update: `onUpdate${name}`,
      updateOne: `update${name}`,
    },
    methods: {
      createOne: async data => rawModel.create(data),
      findOne: async (where, order, offset, limit) => rawModel.findOne({ where }),
      findMany: async (where, order, offset, limit) => rawModel.findAll({ where }),
      deleteMany: async (where, order, offset, limit) => rawModel.findAll({ where }),
      update: async (where, order, data) => rawModel.update(data, { where }),
    },
    inspect: () => `${name}Model`,
  }
  // add incomplete-model to cache to prevent loops
  models[name] = model

  const associatedModelnames = map(localModel.associations, association => {
    return ({
      ...localModel.attributes[association.foreignKey],
      as: association.as,
      model: association.target,
      modelName: capitalize(singularize(association.target.name)),
      single: association.isSingleAssociation,
    })
  })

  model.associations = mapValues(keyBy(associatedModelnames
    .filter(association => localModel.sequelize.models[association.modelName])
    .map(association => ({
      key: association.modelName,
      value: {
        ...association,
        source: model,
        target: convertToModel(association.model),
      },
    }))
  , 'key'), 'value')

  return model
}
