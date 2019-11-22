import { Build } from 'gram'
import { getMemory } from 'services/memory'

const stack = []
const stackSize = 100
const stackUpdaterInterval = 5000 // 5s
let interval: ReturnType<typeof setInterval> | false = false

const updater = () => {
  stack.unshift({
    time: Date.now(),
    ...getMemory(),
  })
  if (stack.length - 1 > stackSize) stack.pop()
}

export const startUpdater = () => {
  if (interval)
    // interval running
    return
  interval = setInterval(updater, stackUpdaterInterval)
}

export const stopUpdater = () => {
  if (interval) {
    clearInterval(interval)
    interval = false
  }
}

export const historyBuild = <BuildMode, Context>(build: Build<BuildMode, Context>) => {
  build.addQuery('history', 'History!', { resolver: () => ({}) })
  build.addType('HistoryMemory', {
    type: 'type',
    fields: {
      time: 'DateTime!',
      rss: 'Int!',
      heapTotal: 'Int!',
      heapUsed: 'Int!',
      external: 'Int!',
    },
  })
  build.addType('History', {
    fields: {
      memory: {
        args: {
          limit: 'Int',
        },
        type: '[HistoryMemory!]!',
      },
    },
    resolver: {
      memory: (_, args, context) => {
        const limit = (args && args.limit) || stackSize
        return stack.slice(0, limit)
      },
    },
  })
}
