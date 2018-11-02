import * as graphql from 'graphql'

export type GuardFn = (val: any) => boolean
export const arrayFunctionCheck = (val: any, guards: GuardFn[]) => !!guards.find(fn => fn(val))
export const undefinedNode: GuardFn = () => false

export const isASTKindToNode = (node: any): node is graphql.ASTKindToNode => node.kind === 'ASTKindTo'

export const isNameNode = (node: any): node is graphql.NameNode => node.kind === 'Name'

export const isDocumentNode = (node: any): node is graphql.DocumentNode => node.kind === 'Document'

export const isOperationDefinitionNode = (node: any): node is graphql.OperationDefinitionNode =>
  node.kind === 'OperationDefinition'

export const isVariableDefinitionNode = (node: any): node is graphql.VariableDefinitionNode =>
  node.kind === 'VariableDefinition'

export const isVariableNode = (node: any): node is graphql.VariableNode => node.kind === 'Variable'

export const isSelectionSetNode = (node: any): node is graphql.SelectionSetNode => node.kind === 'SelectionSet'

export const isFieldNode = (node: any): node is graphql.FieldNode => node.kind === 'Field'

export const isArgumentNode = (node: any): node is graphql.ArgumentNode => node.kind === 'Argument'

export const isFragmentSpreadNode = (node: any): node is graphql.FragmentSpreadNode => node.kind === 'FragmentSpread'

export const isInlineFragmentNode = (node: any): node is graphql.InlineFragmentNode => node.kind === 'InlineFragment'

export const isFragmentDefinitionNode = (node: any): node is graphql.FragmentDefinitionNode =>
  node.kind === 'FragmentDefinition'

export const isIntValueNode = (node: any): node is graphql.IntValueNode => node.kind === 'IntValue'

export const isFloatValueNode = (node: any): node is graphql.FloatValueNode => node.kind === 'FloatValue'

export const isStringValueNode = (node: any): node is graphql.StringValueNode => node.kind === 'StringValue'

export const isBooleanValueNode = (node: any): node is graphql.BooleanValueNode => node.kind === 'BooleanValue'

export const isNullValueNode = (node: any): node is graphql.NullValueNode => node.kind === 'NullValue'

export const isEnumValueNode = (node: any): node is graphql.EnumValueNode => node.kind === 'EnumValue'

export const isListValueNode = (node: any): node is graphql.ListValueNode => node.kind === 'ListValue'

export const isObjectValueNode = (node: any): node is graphql.ObjectValueNode => node.kind === 'ObjectValue'

export const isObjectFieldNode = (node: any): node is graphql.ObjectFieldNode => node.kind === 'ObjectField'

export const isDirectiveNode = (node: any): node is graphql.DirectiveNode => node.kind === 'Directive'

export const isNamedTypeNode = (node: any): node is graphql.NamedTypeNode => node.kind === 'NamedType'

export const isListTypeNode = (node: any): node is graphql.ListTypeNode => node.kind === 'ListType'

export const isNonNullTypeNode = (node: any): node is graphql.NonNullTypeNode => node.kind === 'NonNullType'

export const isSchemaDefinitionNode = (node: any): node is graphql.SchemaDefinitionNode =>
  node.kind === 'SchemaDefinition'

export const isOperationTypeDefinitionNode = (node: any): node is graphql.OperationTypeDefinitionNode =>
  node.kind === 'OperationTypeDefinition'

export const isScalarTypeDefinitionNode = (node: any): node is graphql.ScalarTypeDefinitionNode =>
  node.kind === 'ScalarTypeDefinition'

export const isObjectTypeDefinitionNode = (node: any): node is graphql.ObjectTypeDefinitionNode =>
  node.kind === 'ObjectTypeDefinition'

export const isFieldDefinitionNode = (node: any): node is graphql.FieldDefinitionNode => node.kind === 'FieldDefinition'

export const isInputValueDefinitionNode = (node: any): node is graphql.InputValueDefinitionNode =>
  node.kind === 'InputValueDefinition'

export const isInterfaceTypeDefinitionNode = (node: any): node is graphql.InterfaceTypeDefinitionNode =>
  node.kind === 'InterfaceTypeDefinition'

export const isUnionTypeDefinitionNode = (node: any): node is graphql.UnionTypeDefinitionNode =>
  node.kind === 'UnionTypeDefinition'

export const isEnumTypeDefinitionNode = (node: any): node is graphql.EnumTypeDefinitionNode =>
  node.kind === 'EnumTypeDefinition'

export const isEnumValueDefinitionNode = (node: any): node is graphql.EnumValueDefinitionNode =>
  node.kind === 'EnumValueDefinition'

export const isInputObjectTypeDefinitionNode = (node: any): node is graphql.InputObjectTypeDefinitionNode =>
  node.kind === 'InputObjectTypeDefinition'

// (node: any): node is graphql.ScalarTypeExtensionNode => node.kind === 'ScalarTypeExtension'
export const isScalarTypeExtensionNode = undefinedNode

export const isObjectTypeExtensionNode = (node: any): node is graphql.ObjectTypeExtensionNode =>
  node.kind === 'ObjectTypeExtension'

// (node: any): node is graphql.InterfaceTypeExtensionNode => node.kind === 'InterfaceTypeExtension'
export const isInterfaceTypeExtensionNode = undefinedNode

// (node: any): node is graphql.UnionTypeExtensionNode => node.kind === 'UnionTypeExtension'
export const isUnionTypeExtensionNode = undefinedNode

// (node: any): node is graphql.EnumTypeExtensionNode => node.kind === 'EnumTypeExtension'
export const isEnumTypeExtensionNode = undefinedNode

// (node: any): node is graphql.InputObjectTypeExtensionNode => node.kind === 'InputObjectTypeExtension'
export const isInputObjectTypeExtensionNode = undefinedNode

export const isDirectiveDefinitionNode = (node: any): node is graphql.DirectiveDefinitionNode =>
  node.kind === 'DirectiveDefinition'

export const isAstNode = (node: any): node is graphql.ASTNode =>
  arrayFunctionCheck(node, [
    isNameNode,
    isDocumentNode,
    isOperationDefinitionNode,
    isVariableDefinitionNode,
    isVariableNode,
    isSelectionSetNode,
    isFieldNode,
    isArgumentNode,
    isFragmentSpreadNode,
    isInlineFragmentNode,
    isFragmentDefinitionNode,
    isIntValueNode,
    isFloatValueNode,
    isStringValueNode,
    isBooleanValueNode,
    isNullValueNode,
    isEnumValueNode,
    isListValueNode,
    isObjectValueNode,
    isObjectFieldNode,
    isDirectiveNode,
    isNamedTypeNode,
    isListTypeNode,
    isNonNullTypeNode,
    isSchemaDefinitionNode,
    isOperationTypeDefinitionNode,
    isScalarTypeDefinitionNode,
    isObjectTypeDefinitionNode,
    isFieldDefinitionNode,
    isInputValueDefinitionNode,
    isInterfaceTypeDefinitionNode,
    isUnionTypeDefinitionNode,
    isEnumTypeDefinitionNode,
    isEnumValueDefinitionNode,
    isInputObjectTypeDefinitionNode,
    isScalarTypeExtensionNode,
    isObjectTypeExtensionNode,
    isInterfaceTypeExtensionNode,
    isUnionTypeExtensionNode,
    isEnumTypeExtensionNode,
    isInputObjectTypeExtensionNode,
    isDirectiveDefinitionNode,
  ])

export const isValueNode = (node: any): node is graphql.ValueNode =>
  arrayFunctionCheck(node, [
    isVariableNode,
    isIntValueNode,
    isFloatValueNode,
    isStringValueNode,
    isBooleanValueNode,
    isNullValueNode,
    isEnumValueNode,
    isListValueNode,
    isObjectValueNode,
  ])

export const isTypeDefinitionNode = (node: any): node is graphql.TypeDefinitionNode =>
  arrayFunctionCheck(node, [
    isScalarTypeDefinitionNode,
    isObjectTypeDefinitionNode,
    isInterfaceTypeDefinitionNode,
    isUnionTypeDefinitionNode,
    isEnumTypeDefinitionNode,
    isInputObjectTypeDefinitionNode,
  ])

export const isTypeExtensionNode = (node: any): node is graphql.TypeExtensionNode =>
  arrayFunctionCheck(node, [
    isScalarTypeExtensionNode,
    isObjectTypeExtensionNode,
    isInterfaceTypeExtensionNode,
    isUnionTypeExtensionNode,
    isEnumTypeExtensionNode,
    isInputObjectTypeExtensionNode,
  ])

// tslint:disable-next-line:max-line-length
export const isTypeSystemDefinitionNode = (node: any): node is graphql.TypeSystemDefinitionNode =>
  arrayFunctionCheck(node, [
    isSchemaDefinitionNode,
    isTypeDefinitionNode,
    isTypeExtensionNode,
    isDirectiveDefinitionNode,
  ])
