import { readFileSync } from 'fs'
import { basename, join } from 'path'

export const loadTypeDefs = (dirname: string) => (
  filename: string = basename(dirname),
  extension = '.schema.graphql',
) => readFileSync(join(dirname, filename + extension), 'utf8')
