import { capitalize, pluralize, singularize } from 'inflection'

import { Attributes, BaseModel, Methods } from './types'

export const createModel = <Type = any>(name: string, attributes: Attributes): BaseModel<Type> => {
  return {
    associations: {},
    assocResolvers: [],
    attributes,
    fieldNames: {
      create: `${name}CreateInput`,
      list: `${name}ListType`,
      model: `${name}`,
      order: `${name}OrderEnum`,
      page: `Page`,
      update: `${name}UpdateInput`,
    },
    inspect: () => `${name}Model`,
    name,
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
  }
}
