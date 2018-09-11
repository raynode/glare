
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
    findOne: async (where, order, offset, limit) => rawModel.findOne({ where }),
    findMany: async (where, order, offset, limit) => rawModel.findAll({ where }),
    deleteMany: async (where, order, offset, limit) => rawModel.findAll({ where }),
    updateOne: async (where, order, offset, limit) => rawModel.findOne({ where }),
    inspect: () => `${name}Model`,
  }
  // add incomplete-model to cache to prevent loops
  models[name] = model

  const associatedModelnames = map(localModel.associations, association => ({
    as: association.as,
    modelName: capitalize(singularize(association.as)),
    single: association.as === singularize(association.as),
  }))

  model.associations = mapValues(keyBy(associatedModelnames
    .filter(association => localModel.sequelize.models[association.modelName])
    .map(association => ({
      key: association.modelName,
      value: {
        as: association.as,
        single: association.single,
        source: model,
        target: convertToModel(localModel.sequelize.models[association.modelName]),
      },
    }))
  , 'key'), 'value')

  return model
}
