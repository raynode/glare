import { capitalize, pluralize, singularize } from 'inflection'
import { Dictionary, keyBy, map, mapValues } from 'lodash'
import { Instance, Model as SeqModel, sequelize, Sequelize } from 'services/db'
import { FilterMapper, Model, QueryGenerator } from './types'

const Op = Sequelize.Op
export const sequelizeFilterMapper: FilterMapper = (modifier, field, value) => {
  switch (modifier) {
    case 'eq':
      return { [Op.eq]: value }
    case 'in':
      return { [Op.in]: value }
    case 'not_in':
      return { [Op.notIn]: value }
    case 'not':
      return { [Op.ne]: value }
    case 'lt':
      return { [Op.lt]: value }
    case 'lte':
      return { [Op.lte]: value }
    case 'gt':
      return { [Op.gt]: value }
    case 'gte':
      return { [Op.gte]: value }
    case 'contains':
      return { [Op.like]: `%${value}%` }
    // case 'not_contains': return { [Op.not]: { [Op.like]: `%${value}%` } }
    case 'starts_with':
      return { [Op.like]: `${value}%` }
    // case 'not_starts_with': return { [Op.not]: { [Op.like]: `${value}%` } }
    case 'ends_with':
      return { [Op.like]: `%${value}` }
    // case 'not_ends_with': return { [Op.not]: { [Op.like]: `%${value}` } }
  }
  throw new Error('unkown modifier: ' + modifier)
}

export const sequelizeMethodMapper: QueryGenerator = <Type>(model: Model<Type>) => {
  const rawModel = sequelize.models[model.name]
  return {
    createOne: async data => rawModel.create(data),
    findOne: async (where, order, offset, limit) => rawModel.findOne({ where }),
    findMany: async (where, order, offset, limit) => rawModel.findAll({ where }),
    deleteMany: async (where, order, offset, limit) => rawModel.findAll({ where }),
    update: async (where, order, offset, data) => {
      const [affectedCount, affectedRows] = await rawModel.update(data, { where, returning: true })
      if (affectedCount === 0) return null
      return affectedRows[0]
    },
  }
}

export interface RawModel<Attr, Inst extends Instance<Attr>> extends SeqModel<Inst & Attr, Attr> {
  rawAttributes: any
  associations: Dictionary<any>
  attributes: any
  sequelize: any
}

export const models = {}
export const convertToModel = <Attr, Inst extends Instance<Attr> & Attr>(
  rawModel: SeqModel<Inst, Attr>,
): Model<Inst> => {
  const localModel: RawModel<Attr, Inst> = rawModel as any

  // check model cache
  const name = capitalize(singularize(localModel.name))
  if (models[name]) return models[name]

  const associatedModelnames = map(localModel.associations, association => ({
    ...localModel.attributes[association.foreignKey],
    as: association.as,
    model: association.target,
    modelName: capitalize(singularize(association.target.name)),
    single: association.isSingleAssociation,
  }))

  const model: any = {
    name,
    attributes: localModel.attributes,
    associations: {},
    assocResolvers: [],
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
    inspect: () => `${name}Model`,
  }
  // add incomplete-model to cache to prevent loops
  models[name] = model

  model.associations = mapValues(
    keyBy(
      associatedModelnames
        .filter(association => localModel.sequelize.models[association.modelName])
        .map(association => ({
          key: association.modelName,
          value: {
            ...association,
            source: model,
            target: convertToModel(association.model),
          },
        })),
      'key',
    ),
    'value',
  )

  return model
}
