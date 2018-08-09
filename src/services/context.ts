
import { User } from 'db/models'

export interface Context {
  name?: string
  user?: User
  auth: any
}
