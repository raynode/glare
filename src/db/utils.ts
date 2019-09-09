import { reduce, uniq } from 'lodash'

export const mapValues = <Source, Result>(mapFn: (source: Source) => Result) => (
  sources: Record<string, Source>,
  extend: Partial<Record<string, Source>> = {},
): Record<string, Result> =>
  reduce(
    uniq([].concat(Object.keys(sources)).concat(Object.keys(extend))),
    (results, key) => {
      results[key] = mapFn(extend.hasOwnProperty(key) ? extend[key] : sources[key])
      return results
    },
    {},
  )
