
import { PubSub, withFilter } from 'apollo-server'

export enum Subscriptions {
  ChangedNumber = 'ChangedNumber',
  CreatedArticle = 'CreatedArticle',
}

export const pubsub = new PubSub()
export { withFilter }

export const createSubscritionResolver = (subscrition: string, resolve) => ({
  resolve,
  subscribe: () => pubsub.asyncIterator(subscrition),
})
