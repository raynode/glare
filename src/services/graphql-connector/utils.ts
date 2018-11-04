import { mapValues } from 'lodash'

export type RecordOf<Keys, Type> = { [key in keyof Keys]: Type }

export const applyToRecordOf = <Keys, Types, Result>(
  record: RecordOf<Keys, Types>,
  method: (type: Types, key: string) => Result,
) => mapValues(record, method) as RecordOf<Keys, Result>
