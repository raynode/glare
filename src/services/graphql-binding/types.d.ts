
import {
  GraphQLFieldResolver,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLType,
} from 'graphql'
import { Dictionary } from 'lodash'

export type DBType = any

export interface FieldFactoryOptions {
  list?: boolean
  description?: string
}

export type FieldFactory = (field: string, options?: FieldFactoryOptions) => Dictionary<BaseField>

export interface ListItem<Type> {
  key: string
  value: Type
}

export interface Attribute {
  allowUpdate: boolean
  comment: string
  type: DBType
}
export type Attributes = Record<string, Attribute>

export type Thunk<Type> = () => Type

export type ThunkField = () => Field
export type Field = BaseField & GraphQLOutputType & GraphQLInputType
export interface BaseField {
  type: GraphQLType
  args?: Record<string, any>
  resolve: GraphQLFieldResolver<any, any>
  description?: string
}

export interface Association {
  as: string
  single: boolean
  source: Model
  target: Model
}
export type Associations = Record<string, Association>

export type OrderDirections = 'ASC' | 'DESC'
export type FindFn<Result> = (
  where: any,
  order: Dictionary<OrderDirections>,
  offset: number,
  limit: number,
) => Promise<Result>

export interface Model {
  initialized?: boolean
  name: string
  attributes: Attributes
  associations: Associations
  inspect?: () => string
  findOne: FindFn<any>
  findMany: FindFn<any[]>
  deleteMany: FindFn<any[]>
  updateOne: FindFn<any>
  fields?: Dictionary<BaseField>
  filterFields?: Dictionary<BaseField>
  type?: GraphQLObjectType
  listType?: GraphQLObjectType
  where?: { type: GraphQLInputObjectType }
}
export type Models = Record<string, Model>

// Basic to mapper to convert one thing to another
export type Mapper<Type, Result> = (type: Type) => Result
// Basic check function
export type Check<Type> = Mapper<Type, boolean>

// convert an attribute to a GraphQLType
export type AttributeGraphQLMapper = (key: string, type: Attribute, model: Model, config: BuildConfiguration) =>
  BaseField
// convert some type into an Model
export type TypeModelMapper<Type> = Mapper<Type, GraphQLType>

// check to define if an attribute is a String-Type
export type isStringAttribute = Check<Attribute>
// check to define if an attribute is a Numeric-Type
export type isArithmeticAttribute = Check<Attribute>
// check to define if an attribute is a List-Type
export type isListAttribute = Check<Attribute>
// check if the Attribute should be used at all
export type isAttributeVisible = Check<Attribute>
// check to define if an association has many models
export type isManyAssociation = Check<Association>
// check to define if an association has single models
export type isSingleAssociation = Check<Association>

export interface BuildConfiguration<Type = any> {
  attributeGraphQLMapper: AttributeGraphQLMapper
  typeModelMapper: TypeModelMapper<Type>
  isAttributeVisible: isAttributeVisible
  isStringAttribute: isStringAttribute
  isArithmeticAttribute: isArithmeticAttribute
  isListAttribute: isListAttribute
  isManyAssociation: isManyAssociation
  isSingleAssociation: isSingleAssociation
}
