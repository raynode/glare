import * as Sequelize from 'sequelize'
import {
  DataTypeAbstract,
  DataTypeAnyDate,
  DataTypeAnyFloat,
  DataTypeAnyInteger,
  DataTypeAnyNumber,
  DataTypeAnyString,
  DataTypeArray,
  DataTypeBigInt,
  DataTypeBlob,
  DataTypeBoolean,
  DataTypeChar,
  DataTypeDate,
  DataTypeDateOnly,
  DataTypeDecimal,
  DataTypeDouble,
  DataTypeEnum,
  DataTypeFloat,
  DataTypeGeometry,
  DataTypeHStore,
  DataTypeInteger,
  DataTypeJSONB,
  DataTypeJSONType,
  DataTypeMediumInt,
  DataTypeNow,
  DataTypeNumber,
  DataTypeRange,
  DataTypeReal,
  DataTypeScalar,
  DataTypeSmallInt,
  DataTypeString,
  DataTypeText,
  DataTypeTime,
  DataTypeTinyInt,
  DataTypeUUID,
  DataTypeUUIDv1,
  DataTypeUUIDv4,
  DataTypeVirtual,
} from 'services/db'

const DataTypeConstructors = (Sequelize as any).DataTypes

export const isAbstract = (type: any): type is DataTypeAbstract => type instanceof DataTypeConstructors.ABSTRACT
export const isString = (type: any): type is DataTypeString => type instanceof DataTypeConstructors.STRING
export const isChar = (type: any): type is DataTypeChar => type instanceof DataTypeConstructors.CHAR
export const isText = (type: any): type is DataTypeText => type instanceof DataTypeConstructors.TEXT
export const isNumber = (type: any): type is DataTypeNumber => type instanceof DataTypeConstructors.NUMBER
export const isTinyInt = (type: any): type is DataTypeTinyInt => type instanceof DataTypeConstructors.TINYINT
export const isSmallInt = (type: any): type is DataTypeSmallInt => type instanceof DataTypeConstructors.SMALLINT
export const isMediumInt = (type: any): type is DataTypeMediumInt => type instanceof DataTypeConstructors.MEDIUMINT
export const isInteger = (type: any): type is DataTypeInteger => type instanceof DataTypeConstructors.INTEGER
export const isBigInt = (type: any): type is DataTypeBigInt => type instanceof DataTypeConstructors.BIGINT
export const isFloat = (type: any): type is DataTypeFloat => type instanceof DataTypeConstructors.FLOAT
export const isTime = (type: any): type is DataTypeTime => type instanceof DataTypeConstructors.TIME
export const isDate = (type: any): type is DataTypeDate => type instanceof DataTypeConstructors.DATE
export const isDateOnly = (type: any): type is DataTypeDateOnly => type instanceof DataTypeConstructors.DATEONLY
export const isBoolean = (type: any): type is DataTypeBoolean => type instanceof DataTypeConstructors.BOOLEAN
export const isNow = (type: any): type is DataTypeNow => type instanceof DataTypeConstructors.NOW
export const isBlob = (type: any): type is DataTypeBlob => type instanceof DataTypeConstructors.BLOB
export const isDecimal = (type: any): type is DataTypeDecimal => type instanceof DataTypeConstructors.DECIMAL
export const isNumeric = (type: any): type is DataTypeDecimal => type instanceof DataTypeConstructors.NUMERIC
export const isUUID = (type: any): type is DataTypeUUID => type instanceof DataTypeConstructors.UUID
export const isUUIDv1 = (type: any): type is DataTypeUUIDv1 => type instanceof DataTypeConstructors.UUIDV1
export const isUUIDv4 = (type: any): type is DataTypeUUIDv4 => type instanceof DataTypeConstructors.UUIDV4
export const isHstore = (type: any): type is DataTypeHStore => type instanceof DataTypeConstructors.HSTORE
export const isJson = (type: any): type is DataTypeJSONType => type instanceof DataTypeConstructors.JSON
export const isJsonb = (type: any): type is DataTypeJSONB => type instanceof DataTypeConstructors.JSONB
export const isVirtual = (type: any): type is DataTypeVirtual => type instanceof DataTypeConstructors.VIRTUAL
export const isArray = (type: any): type is DataTypeArray => type instanceof DataTypeConstructors.ARRAY
export const isNone = (type: any): type is DataTypeVirtual => type instanceof DataTypeConstructors.NONE
export const isEnum = (type: any): type is DataTypeEnum => type instanceof DataTypeConstructors.ENUM
export const isRange = (type: any): type is DataTypeRange => type instanceof DataTypeConstructors.RANGE
export const isReal = (type: any): type is DataTypeReal => type instanceof DataTypeConstructors.REAL
export const isDouble = (type: any): type is DataTypeDouble => type instanceof DataTypeConstructors.DOUBLE
export const isDoublePrecision = (type: any): type is DataTypeDouble => type instanceof DataTypeConstructors.DOUBLE
export const isGeometry = (type: any): type is DataTypeGeometry => type instanceof DataTypeConstructors.GEOMETRY

export const isFloatType = (type: any): type is DataTypeAnyFloat =>
  isFloat(type) || isDouble(type) || isDoublePrecision(type) || isReal(type)

export const isIntegerType = (type: any): type is DataTypeAnyInteger =>
  isNumber(type) || isTinyInt(type) || isSmallInt(type) || isMediumInt(type) || isInteger(type)

export const isNumericType = (type: any): type is DataTypeAnyNumber => isFloatType(type) || isIntegerType(type)

export const isStringType = (type: any): type is DataTypeAnyString =>
  isChar(type) ||
  isText(type) ||
  isString(type) ||
  isBigInt(type) || // these need to be stored as string
  isDecimal(type) // these need to be stored as string

export const isDateType = (type: any): type is DataTypeAnyDate => isDate(type) || isDateOnly(type) || isTime(type)

export const isScalarType = (type: any): type is DataTypeScalar =>
  isNumericType(type) || isStringType(type) || isDateType(type) || isUUID(type) || isBoolean(type)
