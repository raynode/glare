
import { config } from 'config'
import { attachSentryTransport, log } from 'services/logger'

const main = async () => {
  process.on('unhandledRejection', rejection => {
    log.error('unhandledRejection', rejection)
  })

  attachSentryTransport()
  .catch(() => log.error('Error while connecting to sentry'))

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
