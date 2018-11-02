import {
  GraphQLEnumType,
  GraphQLFieldResolver,
  GraphQLInputFieldConfigMap,
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
  allowNull: boolean
  defaultValue?: any // not allowed if allowNull === true
  visible: boolean
  comment?: string
  type: DBType
}
export type Attributes = Record<string, Attribute>

export type Thunk<Type> = () => Type

export type ThunkField = () => Field
export type Field = BaseField & GraphQLOutputType & GraphQLInputType
export interface BaseField {
  type: GraphQLType
  args?: Record<string, any>
  resolve?: GraphQLFieldResolver<any, any>
  description?: string
}

export interface Association extends Attribute {
  as: string
  field: string
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
export type UpdateFn<Result> = (
  where: any,
  order: Dictionary<OrderDirections>,
  offset: number,
  data: Partial<Type>,
) => Promise<Result>
export type CreateFn<Result> = (data: Partial<Result>) => Promise<Result>

export interface Methods<Type = any> {
  createOne: CreateFn<Type>
  findMany: FindFn<Type[]>
  findOne: FindFn<Type>
  deleteMany: FindFn<Type[]>
  update: UpdateFn<Type>
}

export type QueryGenerator = <Types, Type extends Types>(model: Model<Type>) => Methods<Type>

// type A = string
// type B = number

// const x: QueryGenerator<A | B>
// const a: Model<A>
// const b: Model<B>

// const y = x(a)
// const z = x(b)

// const r = y.findMany(null, null, null, null)

type ModelQueryName = 'findOne' | 'findMany'
type ModelMutationNames = 'createOne' | 'updateOne' | 'deleteMany'
type ModelSubsciptionNames = 'create' | 'update' | 'delete'
type ModelInputNames = 'filters' | 'updateData' | 'createData'
type ModelNames = ModelQueryName | ModelMutationNames | ModelSubsciptionNames | ModelInputNames

type InputTypesNames = 'page' | 'create' | 'update'
type OutputTypesNames = 'model' | 'list'
type EnumTypesNames = 'order'

export interface BaseModel<Type = any> {
  associations: Associations
  assocResolvers?: any[]
  attributes: Attributes
  fieldNames: Record<InputTypesNames | OutputTypesNames | EnumTypesNames, string>
  inspect: () => string
  name: string
  names: Record<ModelNames, string>
}

export interface Model<Type = any> extends BaseModel<Type> {
  inputTypes?: Record<InputTypesNames, GraphQLInputObjectType>
  outputTypes?: Record<OutputTypesNames, GraphQLObjectType>
  enumTypes?: Record<EnumTypesNames, GraphQLEnumType>
  methods: Methods<Type>

  createFields?: Dictionary<BaseField>
  createType?: GraphQLInputObjectType
  fields?: Dictionary<BaseField>
  filterFields?: Dictionary<BaseField>
  updateFields?: GraphQLInputFieldConfigMap
  initialized: true
  inspect?: () => string
  listType?: GraphQLObjectType
  type?: GraphQLObjectType
  updateType?: GraphQLInputObjectType
  where?: { type: GraphQLInputObjectType }

  filterParser?: any
}
export type Models = Record<string, Model>

// Basic to mapper to convert one thing to another
export type Mapper<Type, Result> = (type: Type) => Result
// Basic check function
export type Check<Type> = Mapper<Type, boolean>

// convert an attribute to a GraphQLType
export type AttributeGraphQLMapper = (
  key: string,
  type: Attribute,
  model: Model,
  config: BuildConfiguration,
) => BaseField
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

// used in mapping the filtervalues to the values used in the resolvers
export type Filter =
  | 'eq'
  | 'in'
  | 'not_in'
  | 'not'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
export type FilterMapper = (modifier: Filter, field: string, value: any) => Dictionary<any>

export interface BuildConfiguration<Types = any> {
  filterMapper: FilterMapper
  methodMapper: QueryGenerator<Types>

  attributeGraphQLMapper: AttributeGraphQLMapper
  typeModelMapper: TypeModelMapper<Types>
  isAttributeVisible: isAttributeVisible
  isStringAttribute: isStringAttribute
  isArithmeticAttribute: isArithmeticAttribute
  isListAttribute: isListAttribute
  isManyAssociation: isManyAssociation
  isSingleAssociation: isSingleAssociation
}
