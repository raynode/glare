import { config } from 'config'
import { default as fetch } from 'node-fetch'
import { create } from 'services/logger'

const log = create('services:ifttt:webhook')

export interface WebhookMessage {
  event: string
  value1?: string
  value2?: string
  value3?: string
}

const WebhookKey = config.ifttt.webhook

export const webhook = async ({ event, ...data }: WebhookMessage) => {
  const url = `https://maker.ifttt.com/trigger/${event}/with/key/${WebhookKey}`
  try {
    log(url, data)
    const result = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    log(result)
    log(await result.text())
  } catch (err) {
    log.error(err)
  }
}
