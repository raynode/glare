
import { readFileSync } from 'fs'
import { join } from 'path'

export const loadTypeDefs = (dirname: string) =>
  (filename: string, extension = '.schema.graphql') =>
    readFileSync(join(dirname, filename + extension), 'utf8')
