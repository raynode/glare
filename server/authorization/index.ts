
import config from 'config'
import { decode, verify } from 'jsonwebtoken'
import * as jwk from 'jwks-rsa'

import { create } from 'logger'
const log = create('auth')

export interface AuthResponse {
  given_name: string
  family_name: string
  nickname: string
  name: string
  picture: string
  gender: string
  locale: string
  updated_at: string
  email: string
  email_verified: boolean
  iss: string
  sub: string
  aud: string
  iat: number
  exp: number
  at_hash: string
  nonce: string
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

  log(decoded)

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

// //Retrieves the Graphcool user record using the Auth0 user id
// const getGraphcoolUser = (auth0UserId, api) =>
//   api
//     .request(
//       `
//         query getUser($auth0UserId: String!){
//           User(auth0UserId: $auth0UserId){
//             id
//           }
//         }
//       `,
//       { auth0UserId }
//     )
//     .then(queryResult => queryResult.User)

// //Creates a new User record.
// const createGraphCoolUser = (auth0UserId, email, api) =>
//   api
//     .request(
//       `
//         mutation createUser($auth0UserId: String!, $email: String) {
//           createUser(
//             auth0UserId: $auth0UserId
//             email: $email
//           ){
//             id
//           }
//         }
//       `,
//       { auth0UserId, email }
//     )
//     .then(queryResult => queryResult.createUser)

// export default async event => {
//   if (!process.env.AUTH0_DOMAIN) {
//     return { error: 'Missing AUTH0_DOMAIN environment variable' }
//   }
//   if (!process.env.AUTH0_CLIENT_ID) {
//     return { error: 'Missing AUTH0_CLIENT_ID environment variable' }
//   }

//   try {
//     const { idToken } = event.data
//     const graphcool = fromEvent(event)
//     const api = graphcool.api('simple/v1')

//     const decodedToken = await verifyToken(idToken)
//     let graphCoolUser = await getGraphcoolUser(decodedToken.sub, api)

//     //If the user doesn't exist, a new record is created.
//     if (graphCoolUser === null) {
//       graphCoolUser = await createGraphCoolUser(
//         decodedToken.sub,
//         decodedToken.email,
//         api
//       )
//     }

//     // custom exp does not work yet, see https://github.com/graphcool/graphcool-lib/issues/19
//     const token = await graphcool.generateNodeToken(
//       graphCoolUser.id,
//       'User',
//       decodedToken.exp
//     )

//     return { data: { id: graphCoolUser.id, token } }
//   } catch (err) {
//     return { error: err }
//   }
// }
