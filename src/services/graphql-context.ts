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
  systemId: string | null
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

export const createAuthContext = async (rawContext: RawContext) => {
  const token = decode(rawContext.authentication) as GoogleTokenData // for now, add others later
  if (!token || typeof token === 'string') return { auth: false, user: null, systemId: rawContext.system }
  return { auth: true, user: await upsertUser(token), systemId: rawContext.system }
}

interface RawContext {
  authentication: string | null
  system: string | null
}

export const createContextFromContext = (ctx: Koa.Context): RawContext => {
  const authHeader = ctx.headers.authentication
  return {
    authentication: !authHeader || !/^Bearer /.test(authHeader) ? authHeader.substr(7) : null,
    system: ctx.headers.system,
  }
}

export const createContextFromConnection = (connection: any) => connection.context as RawContext

export const createContext = async ({ ctx, connection }: CreateContext) =>
  createAuthContext(
    ctx
      ? createContextFromContext(ctx)
      : connection
      ? createContextFromConnection(connection)
      : { authentication: null, system: null },
  )
