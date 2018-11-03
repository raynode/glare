import { mapValues } from 'lodash'

export type RecordOf<Keys, Type> = { [key in keyof Keys]: Type }

export const applyToRecordOf = <Keys, Types>(record: RecordOf<Keys, Types>, method: (type: Types) => Types) =>
  mapValues(record, method) as RecordOf<Keys, Types>
