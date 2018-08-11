
import { configure, create, Log } from '@raynode/nx-logger'
import { transport } from '@raynode/nx-logger-debug'

const namespace = process.env.NODE_ENV === 'production' ? ['glare'] : ['glare-dev']

configure({
  transport,
  namespace,
})

export const log = create()
export { create, Log }
