import { capitalize, pluralize, singularize } from 'inflection'
import { reduce } from 'lodash'
import { Associations, Attribute, Attributes, BaseModel, Methods, SimpleAttribute, SimpleAttributes } from './types'

export const createAttribute = (attribute: SimpleAttribute): Attribute => ({
  allowNull: true,
  allowUpdate: true,
  comment: '',
  defaultValue: undefined,
  type: 'scalar',
  visible: true,
  ...attribute,
})

export const convertSimpleAttributes = <Type>(simpleAttributes: SimpleAttributes<Type>) =>
  reduce(
    simpleAttributes,
    (memo, simpleAttribute, key) => {
      memo[key] = createAttribute(simpleAttribute)
      return memo
      // tslint:disable-next-line no-object-literal-type-assertion
    },
    {} as Attributes<Type>,
  )

export const createModel = <Type = any>(
  name: string,
  attributes: SimpleAttributes<Type>,
  associations?: Associations<Type>,
): BaseModel<Type> => {
  return {
    associations,
    assocResolvers: [],
    attributes: convertSimpleAttributes(attributes),
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
