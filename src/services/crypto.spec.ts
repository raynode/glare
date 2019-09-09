import { decrypt, encrypt } from './crypto'

const password = '☣️'
const salt = '🧂'
const fixtures = ['some clear text data', 'Hello World!', 'Hello :-D', '🔥']

describe('services:crypto', () => {
  fixtures.forEach(data => {
    it(`should correctly encrypt and decrypt ${data}`, async () => {
      const encrypted = await encrypt(data, password, salt)
      const result = await decrypt(encrypted, password, salt)
      expect(result).toEqual(data)
    })
  })
})
