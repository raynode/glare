import * as crypto from 'crypto'

const { createCipheriv, createDecipheriv, randomBytes } = crypto
const scryptSync = (crypto as any).scryptSync // typescript...

const algorithm = 'aes-192-cbc'
const keyLength = 24

export const createSalt = () => randomBytes(24).toString('hex')

export const encrypt = async (clearText: string, password: string, salt: string = createSalt()) => {
  const iv = randomBytes(keyLength)
    .toString('hex')
    .slice(0, 16) // Initialization vector.
  const key = scryptSync(password, salt, keyLength)
  const cipher = createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(clearText, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${encrypted}.${iv}`
}

export const decrypt = async (encryptedData: string, password: string, salt: string) => {
  const key = scryptSync(password, salt, keyLength)
  const [data, iv] = encryptedData.split('.')
  const decipher = createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(data, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
