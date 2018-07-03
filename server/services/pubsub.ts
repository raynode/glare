
import { PubSub, withFilter } from 'graphql-subscriptions'

export enum Subscriptions {
  ChangedNumber = 'ChangedNumber',
  CreatedArticle = 'CreatedArticle',
}

export const pubsub = new PubSub()
export { withFilter }

export const createSubscritionResolver = (subscrition: string) => ({
  resolve: payload => payload,
  subscribe: () => pubsub.asyncIterator(subscrition),
})
