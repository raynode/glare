
export const listReducer = <Data>(list: Data[]) =>
  <Result>(mapper: (value: Data) => { key: string, value: Result }): Record<string, Result> =>
    list.reduce((results, data) => {
      const { key, value } = mapper(data)
      results[key] = value
      return results
    }, {})

export const listMapFn = <Data>(source: Record<string, Data>) =>
  <Result>(mapper: (key: string, value: Data) => Result) =>
    Object.keys(source).map(key => mapper(key, source[key]))

export const objectMapFn = <Data>(source: Record<string, Data>) =>
  <Result>(mapper: (key: string, value: Data) => Result): Record<string, Result> =>
    listReducer(Object.keys(source))(key => ({ key, value: mapper(key, source[key]) }))

// removes all dublicates from an array
export const arrayUnique = <Type>(array: Type[]): Type[] =>
  Array.from(new Set(array))
// flattens an array
export const arrayConcat = <Type>(array: Type[][]): Type[] =>
  [].concat.apply([], array)