
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
    inspect: () => `${name}Model`,
  }
  // add incomplete-model to cache to prevent loops
  models[name] = model

  const associatedModelnames = map(localModel.associations, association =>
    capitalize(singularize(association.as)))

  model.associations = mapValues(keyBy(associatedModelnames
    .filter(key => localModel.sequelize.models[key])
    .map(key => ({
      key,
      value: {
        source: model,
        target: convertToModel(localModel.sequelize.models[key]),
      },
    }))
  , 'key'), 'value')

  return model
}
