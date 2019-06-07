import { builder } from 'graph/builder'
export { builder }

import initializeScalars from './scalars'

import initializeLink from './types/link'
import initializeUser from './types/user'

initializeScalars(builder)
initializeUser(builder)
initializeLink(builder)
