import { AnyType, LinkType, ListType, ScalarType } from './types'

export const isListType = (type: AnyType): type is ListType => type === 'list'
export const isScalarType = (type: AnyType): type is ScalarType => type === 'scalar'
export const isLinkType = (type: AnyType): type is LinkType => type === 'linkMany' || type === 'linkSingle'
