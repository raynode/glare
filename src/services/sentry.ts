
export interface ConnectSentryProps {
  dsn: string
  environment: string
}
export const connectSentry = async ({
  dsn,
  environment,
}: ConnectSentryProps) => {
  if(!dsn)
    return {
      installed: false,
      captureEvent: (event: any): void => null,
      captureException: (exception: any): void => null,
      captureMessage: (event: any): void => null,
    }
  const { init, configureScope, captureEvent, captureException, captureMessage } = await import('@sentry/node')
  init({ dsn, environment })
  return {
    installed: true,
    captureEvent,
    captureException,
    captureMessage,
  }
}
