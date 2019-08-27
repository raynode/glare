import { Build } from 'gram'
import { getMemoryHumanReadable } from 'services/memory'

export const memoryBuild = <BuildMode, Context>(build: Build<BuildMode, Context>) => {
  build.addQuery('getMemory', 'Memory!', { resolver: getMemoryHumanReadable })
  build.addType('Memory', {
    fields: {
      rss: 'String!',
      heapTotal: 'String!',
      heapUsed: 'String!',
      external: 'String!',
    },
  })
}
