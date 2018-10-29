import { GraphQLScalarType } from 'graphql'

import { isIntValueNode, isStringValueNode } from 'services/graphql-binding/graphql-node-guards'

/**
 * A special custom Scalar type for Dates that converts to a ISO formatted string
 * @param {String} options.name:
 * @param {String} options.description:
 * @param {Date} options.serialize(d)
 * @param {String} parseValue(value)
 * @param {Object} parseLiteral(ast)
 */
export const DateType = new GraphQLScalarType({
  name: 'Date',
  description: 'A special custom Scalar type for Dates that converts to a ISO formatted string ',

  serialize(date: Date) {
    if (!date) return null

    if (date instanceof Date) return date.toISOString()
    return date
  },

  parseValue(value: string | number) {
    if (!value) return null

    try {
      return new Date(value)
    } catch (e) {
      return null
    }
  },

  parseLiteral(ast) {
    if (isIntValueNode(ast) || isStringValueNode(ast)) return new Date(ast.value)
    return null
  },
})
