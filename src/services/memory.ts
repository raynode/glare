// hacky but typings needed fixing
export const getNodeMemory = () => process.memoryUsage() as NodeJS.MemoryUsage & { external: number }

export const humanFileSize = (size: number) => {
  const i = size ? Math.floor(Math.log(size) / Math.log(1024)) : 0
  const str = (size / Math.pow(1024, i)).toFixed(2)
  return `${str} ${['B', 'kB', 'MB', 'GB', 'TB', 'PB'][i]}`
}

export interface MemoryResult<T> {
  rss: T
  heapTotal: T
  heapUsed: T
  external: T
}

export const getMemoryHumanReadable = (): MemoryResult<string> => {
  const memory = getNodeMemory()
  return {
    rss: humanFileSize(memory.rss),
    heapTotal: humanFileSize(memory.heapTotal),
    heapUsed: humanFileSize(memory.heapUsed),
    external: humanFileSize(memory.external),
  }
}

export const getMemory = (): MemoryResult<number> => {
  const memory = getNodeMemory()
  return {
    rss: memory.rss,
    heapTotal: memory.heapTotal,
    heapUsed: memory.heapUsed,
    external: memory.external,
  }
}
