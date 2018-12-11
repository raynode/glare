import * as Koa from 'koa'
import * as passport from 'koa-passport'
// import the koa router as it enhances the Request object
import * as Router from 'koa-router'
import * as session from 'koa-session'
import { Strategy as GoogleStrategy } from 'passport-google-auth'

import { Op } from 'sequelize'
import { sequelize } from 'services/db'

import { config } from 'config'
import { Token } from 'models/token'
import { User, UserInstance } from 'models/user'
import { create } from 'services/logger'

import { plus_v1 } from 'googleapis'
export type GooglePlusProfile = plus_v1.Schema$Person

const log = create('routes', 'assets')

const sessionConfig = {
  key: config.session.key,
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
}

export const connect = async (router: Router, app: Koa) => {
  log('connecting authentication routes')

  app.keys = config.session.keys

  const googleAuthInfo = {
    accessType: 'offline',
    clientId: config.google.clientId,
    clientSecret: config.google.secret,
    callbackURL: `http://localhost:${config.port}/auth/google/callback`,
  }

  passport.serializeUser<UserInstance, any>((user, done) => {
    // serialize user to its Id
    done(null, user.id)
  })

  passport.deserializeUser(async (id: string, done) => {
    // fetch the user from the database by its Id
    try {
      const user = await User.findById(id)
      done(null, user)
    } catch (err) {
      done(err)
    }
  })

  const findUserByProfile = async (profile: GooglePlusProfile) => {
    const userById = await User.findOne({ where: { googleID: profile.id } })
    if (userById) return userById
    const userByEmail = await User.findOne({
      where: { email: { [Op.in]: profile.emails.map(email => email.value) } },
    })
    if (userByEmail) return userByEmail
    return null
  }

  const findOrCreateUser = async (profile: GooglePlusProfile) => {
    const user = await findUserByProfile(profile)
    const userData = {
      email: profile.emails[0].value,
      emailVerified: true,
      familyName: profile.name.familyName,
      gender: profile.gender,
      givenName: profile.name.givenName,
      googleID: profile.id,
      name: profile.nickname || profile.displayName,
      picture: profile.image.url,
    }
    console.log(userData)
    if (!user) return User.create(userData)
    user.googleID = profile.id
    return user.save()
  }

  passport.use(
    new GoogleStrategy(
      googleAuthInfo,
      async (
        accessToken: string,
        refreshToken: string,
        profile: GooglePlusProfile,
        done: (err: null | Error, data?: boolean | UserInstance) => void,
      ) => {
        try {
          const user = await findOrCreateUser(profile)
          const userId = user.id
          await sequelize.transaction(async () => {
            const type = 'google'
            await Token.destroy({ where: { type, userId } })
            await Token.create({ accessToken, refreshToken, type, userId })
          })
          done(null, user)
        } catch (err) {
          log(err)
          done(err)
        }
      },
    ),
  )

  app.use(session(sessionConfig, app))
  app.use(passport.initialize())
  app.use(passport.session())

  app.use(async (ctx, next) => {
    log('checking if authenticated: ', ctx.req.url, ctx.isAuthenticated())
    log('SESSION:', ctx.session)
    log(ctx.cookies.get(sessionConfig.key))
    const p = 'user'
    log('USER:', !!ctx.req[p], ctx.req[p] && ctx.req[p].dataValues)
    await next()
    log('next is done')
  })

  router.post('/login', ctx => ctx.redirect('/auth/google'))

  router.post('/logout', ctx => {
    ctx.logout()
    ctx.redirect('/')
  })

  router.get(
    '/auth/google',
    async (ctx, next) => {
      ctx.session.returnTo = ctx.query.redirect_uri
      return next()
    },
    passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/plus.profile.emails.read',
        'https://www.googleapis.com/auth/tasks',
      ],
    }),
  )

  router.get(
    '/auth/google/callback',
    passport.authenticate('google', {
      successReturnToOrRedirect: '/',
    }),
  )
}
