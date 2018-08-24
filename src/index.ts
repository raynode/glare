
import { config } from 'config'
import { log } from 'services/logger'
import { connectSentry } from 'services/sentry'

const main = async () => {
  const {
    captureEvent,
    captureException,
    captureMessage,
    installed,
  } = await connectSentry(config.sentry)

  log(`Sentry is ${installed ? '' : 'not '}connected!`)

  process.on('unhandledRejection', rejection => {
    log.error('unhandledRejection', rejection)
    captureException(rejection)
  })

  const { server } = await import('server')
  server(log)
  .then(serverInfo => {
    log(`🚀 Server running on port ${serverInfo.port}`)
    log(`url: ${serverInfo.url}`)
    log(`subscriptionsUrl: ${serverInfo.subscriptionsUrl}`)
  })
}

main()
.catch(err => log.error('Main threw an error:', err))
