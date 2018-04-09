
import config from 'config'
import { decode, verify } from 'jsonwebtoken'
import * as jwk from 'jwks-rsa'
import fetch from 'node-fetch'

import { create } from 'logger'
const log = create('auth')

export interface AuthResponse {
  at_hash: string
  aud: string
  email: string
  email_verified: boolean
  exp: number
  family_name: string
  gender: string
  given_name: string
  iat: number
  iss: string
  locale: string
  name: string
  nickname: string
  nonce: string
  picture: string
  sub: string
  updated_at: string
}

export const verifyToken = async token => {
  log('authenticating ' + token)
  const decoded = decode(token, { complete: true }) as {
    header: {
      typ: string
      alg: string
      kid: string,
    }
    [key: string]: any,
  }

  if(!decoded
  || !decoded.header
  || !decoded.header.kid
  )
    throw new Error('Unable to retrieve key identifier from token')

  if (decoded.header.alg !== 'RS256')
    throw new Error(`Wrong signature algorithm, expected RS256, got ${decoded.header.alg}`)

  const jkwsClient = jwk({
    cache: true,
    jwksUri: `https://${config.auth0.domain}/.well-known/jwks.json`,
  })

  return new Promise<AuthResponse>((resolve, reject) => {
    // Retrieve the JKWS's signing key using the decode token's key identifier (kid)
    jkwsClient.getSigningKey(decoded.header.kid, (err, key) => {
      if (err)
        return reject(err)

      const signingKey = key.publicKey || key.rsaPublicKey

      // Validate the token against the JKWS's signing key
      verify(
        token,
        signingKey,
        {
          algorithms: ['RS256'],
          ignoreExpiration: false,
          issuer: `https://${config.auth0.domain}/`,
          // audience: `https://nox.eu.auth0.com/userinfo`,
        },
        (err, decoded: AuthResponse) => {
          if (err) return reject(err)
          resolve(decoded)
        },
      )
    })
  })
}

export interface Identity {
  provider: string
  access_token: string
  expires_in: number
  user_id: string
  connection: string
  isSocial: boolean
}

export const fetchApiAccess = async (user: AuthResponse) => {
  const json = await fetch('https://nox.eu.auth0.com/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: '7ApU6S4NqCvTIOknW5LV8JeQ6enGXf5M',
      client_secret: 'xTQCj8aXgIRjAcgHNuSSTvI8CAdVICyTxU-1U1urdZgJHKqpm7xFF7RcmrztL1EH',
      audience: 'https://nox.eu.auth0.com/api/v2/',
      grant_type: 'client_credentials',
    }),
  }).then(res => res.json())

  log(json)

  // const token = decode(json) as { [key: string]: any }

  // log(token)

  const headers = {
    'content-type': 'application/json',
    'authorization': `Bearer ${json.access_token}`,
  }

  const data = await fetch(`https://nox.eu.auth0.com/api/v2/users/${user.sub}`, {
    method: 'GET',
    headers,
  }).then(res => res.json())

  return data.identities as Identity[]
}
