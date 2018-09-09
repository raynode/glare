import { GraphQLEnumType, GraphQLObjectType } from 'graphql'

export interface HandlerProps<Type, Result> {
  onAdd?: (name: string, type: Type) => Result
}

export const collectionGenerator = <Type extends {}, Result = Type>({
  onAdd = (name, type): Result => type as any,
}: HandlerProps<Type, Result>) => {

  const collection: Record<string, Result> = {}
  const all = () => collection
  const has = (name: string) => collection.hasOwnProperty(name)
  const get = (name: string) => collection[name]
  const add = (name: string, type: Type) => collection[name] = onAdd(name, type)
  const handle = (name: string, type: Type) =>
    has(name) ? get(name) : add(name, type)

  return {
    all,
    has,
    get,
    add,
    handle,
  }
}

const addName = <Type extends { name: string }>(name: string, type: Type) => {
  type.name = name
  return type
}
export const enums = collectionGenerator<GraphQLEnumType>({ onAdd: addName })
export const objects = collectionGenerator<GraphQLObjectType>({ onAdd: addName })
