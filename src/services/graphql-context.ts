import { decode } from 'jsonwebtoken'
import * as Koa from 'koa'

import { single } from 'db'
import { User, Users } from 'db/models'
import { pubsub } from 'services/pubsub'

export interface CreateContext {
  ctx: Koa.Context
  connection: any
}

export interface GoogleTokenData {
  given_name: string
  family_name: string
  nickname: string
  name: string
  picture: string
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

export interface GraphQLContext {
  auth: boolean
  user: User
}

export const upsertUser = async (token: GoogleTokenData) => {
  const user = await single(Users.find({ where: query => query.where({ email: token.email }) }))
  if (!user)
    return single(
      Users.create({
        data: {
          givenName: token.given_name,
          familyName: token.family_name,
          nickname: token.nickname,
          name: token.name,
          picture: token.picture,
          state: 'guest',
          locale: token.locale,
          email: token.email,
          googleID: token.sub,
          emailVerified: token.email_verified,
        },
      }),
    )
  return single(
    Users.update({
      data: {
        givenName: token.given_name,
        familyName: token.family_name,
        nickname: token.nickname,
        name: token.name,
        picture: token.picture,
        locale: token.locale,
        googleID: token.sub, // not sure about this??
        emailVerified: token.email_verified,
      },
      where: query => query.where({ email: token.email }),
    }),
  )
}

export const createAuthContext = async (accessToken: string) => {
  const token = decode(accessToken) as GoogleTokenData // for now, add others later
  if (!token || typeof token === 'string') return { auth: false, user: null }
  const user = await upsertUser(token)
  return { auth: true, user }
}

export const createContext = async ({ ctx, connection }: CreateContext) => {
  if (ctx) {
    const authHeader = ctx.headers.authentication
    if (!authHeader || !/^Bearer /.test(authHeader)) return { auth: false, user: null }
    return createAuthContext(authHeader.substr(7))
  }
  if (connection && connection.context && connection.context.authorization)
    return createAuthContext(connection.context.authorization)
  return { auth: false, user: null }
}
