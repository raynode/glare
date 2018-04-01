
import { configure, create, Log } from '@raynode/nx-logger'
import { transport } from '@raynode/nx-logger-debug'

const namespace = process.env.NODE_ENV === 'production' ? ['glare'] : ['glare-dev']

configure({
  transport,
  namespace,
})

const logger = create()
export default logger
export { create, Log }
