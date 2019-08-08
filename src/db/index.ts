export { db } from './db'

// utility functions
export const single = async <Type>(promise: Promise<Type[]>) => {
  const results = await promise
  return results.length ? results[0] : null
}
