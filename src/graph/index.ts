import { builder } from 'graph/builder'
export { builder }

import initializeLink from './types/link'
import initializeUser from './types/user'

initializeUser(builder)
initializeLink(builder)
