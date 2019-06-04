import { File } from 'formidable'
import { createReadStream } from 'fs'

export const saveToBuffer = (file: File) =>
  new Promise<Buffer>((resolve, reject) => {
    const buffer = []
    const reader = createReadStream(file.path)
    reader.on('data', data => buffer.push(data))
    reader.on('end', () => resolve(Buffer.concat(buffer)))
    reader.on('error', reject)
  })
