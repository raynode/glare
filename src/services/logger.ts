
import {
  configure,
  create,
  join,
  LogLevel,
  split,
  WARN,
} from '@raynode/nx-logger'
import { transport } from '@raynode/nx-logger-debug'
import { parseError } from '@sentry/node/dist/parsers'
import { SentryEvent, Severity } from '@sentry/types'
import { config } from 'config'
import { connectSentry } from 'services/sentry'

const namespace = process.env.NODE_ENV === 'production' ? ['glare'] : ['glare-dev']
const levelToSeverity = (level: number): Severity => {
  if(LogLevel[level])
    switch (level) {
      case LogLevel.DEBUG: return Severity.Debug
      case LogLevel.ERROR: return Severity.Error
      case LogLevel.INFO: return Severity.Info
      case LogLevel.LOG: return Severity.Log
      case LogLevel.WARN: return Severity.Warning
    }
  return Severity.Error
}

configure({
  transport,
  namespace,
})

export const verbosityFilter = (verbosityCompare: (verbosity: number) => boolean) =>
  (config, messages, verbosity) => verbosityCompare(verbosity)

export * from '@raynode/nx-logger'
export const log = create()
export { transport }

export const attachSentryTransport = async () => {
  const {
    captureEvent,
    captureException,
    captureMessage,
    installed,
  } = await connectSentry(config.sentry)

  log(`Sentry is ${installed ? '' : 'not '}connected!`)

  if(installed) {
    const sentryTransport = async (configuration, messages, verbosity) => {
      const event: SentryEvent = {
        tags: {
          namespace: configuration.namespace.join('>'),
        },
      }
      if(typeof messages[0] === 'string') {
        event.message = messages.join(' ')
        event.level = levelToSeverity(configuration.verbosity)
      } else {
        const parsedEvent = await parseError(messages[0])
        event.exception = parsedEvent.exception
      }
      captureEvent(event)
    }

    log.update({
      // if verbosity is higher then WARN, transport to sentry as well, else just debug
      transport: split(verbosityFilter(verbosity => verbosity < WARN), join(transport, sentryTransport), transport),
    })
  }
}
