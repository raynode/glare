import { capitalize, pluralize, singularize } from 'inflection'

export interface Names {
  fields: Record<'create' | 'delete' | 'findMany' | 'findOne' | 'update', string>
}
export type NamingStrategy = (name: string) => Names

export const defaultNamingStrategy: NamingStrategy = name => ({
  fields: {
    create: `create${singularize(name)}`,
    delete: `delete${pluralize(name)}`,
    findMany: `${pluralize(name)}`,
    findOne: `${singularize(name)}`,
    update: `update${singularize(name)}`,
  },
})
