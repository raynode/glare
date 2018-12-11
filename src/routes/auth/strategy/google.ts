// code copied and started by passport-google-auth

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Riptide Cloud
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Request } from 'express'
import { google as gapi, plus_v1 } from 'googleapis'
import { Strategy } from 'passport-strategy'

export interface GoogleOAuth2StrategyBaseOptions {
  // identifies the client to the service provider **Required**
  clientId: string
  // secret used to establish ownershup of the client identifier **Required**
  clientSecret: string
  // URL to which the service provider will redirect the user after obtaining authorization. **Required**
  callbackURL: string
  // Type of access to be requested from the service provider. (`online` = default; `offline` = gets refresh_token)
  accessType?: 'offline' | 'online'
  // or `Array` representing the permission scopes to request access to.
  scope?: string | string[]
  // If set to false, profile information will be retrieved from Google+. (default: `true`)
  skipUserProfile?: boolean
  // When `true`, `req` is the first argument to the verify callback (default: `false`)
  passReqToCallback?: boolean
}

export interface GoogleOAuth2StrategyOptionsWithReq extends GoogleOAuth2StrategyBaseOptions {
  passReqToCallback: true
}
export interface GoogleOAuth2StrategyOptionsWithoutReq extends GoogleOAuth2StrategyBaseOptions {
  passReqToCallback: false
}

export type GooglePlusPerson = plus_v1.Schema$Person

export interface ProviderObject {
  provider?: string
}

export type DoneFn<User extends ProviderObject = any> = (err: Error | null, user: User, info: any) => void

export type GoogleOAuth2StrategyVerifierWithReq = (
  res: Request,
  accessToken: string,
  refreshToken: string,
  profile: GooglePlusPerson,
  done: DoneFn,
) => void

export type GoogleOAuth2StrategyVerifierWithoutReq = (
  accessToken: string,
  refreshToken: string,
  profile: GooglePlusPerson,
  done: DoneFn,
) => void

export type GoogleOAuth2StrategyVerifier = GoogleOAuth2StrategyVerifierWithReq | GoogleOAuth2StrategyVerifierWithoutReq

export const toStringArray = (value: string | string[]) => (typeof value === 'string' ? [value] : value)

const { plus, auth } = gapi

/**
 * Creates an instance of `GoogleOAuth2Strategy`.
 *
 * The Google OAuth 2.0  authentication strategy authenticates requests by delegating
 * to Google's OAuth 2.0 authentication implementation in their Node.JS API.
 *
 * OAuth 2.0 provides a facility for delegated authentication, whereby users can
 * authenticate using a third-party service such as Facebook.  Delegating in
 * this manner involves a sequence of events, including redirecting the user to
 * the third-party service for authorization.  Once authorization has been
 * granted, the user is redirected back to the application and an authorization
 * code can be used to obtain credentials.
 *
 * Applications must supply a `verify` callback, for which the function
 * signature is:
 *
 *   function(accessToken, refreshToken, profile, done) { ... }
 *
 * The verify callback is responsible for finding or creating the user, and
 * invoking `done` with the following arguments:
 *
 *   done(err, user, info)
 *
 * `user` should be set to `false` to indicate an authentication failure.
 * Additional `info` can optionally be passed as a third argument, typically
 * used to display informational messages.  If an exception occured, `err`
 * should be set.
 *
 * Examples:
 *   passport.use(new GoogleOAuth2Strategy({
 *     clientID: '123-456-789',
 *     clientSecret: 'shhh-its-a-secret',
 *     callbackURL: 'https://www.example.com/auth/example/callback'
 *     },
 *     function(accessToken, refreshToken, profile, done) {
 *     User.findOrCreate(..., function (err, user) {
 *       done(err, user)
 *     })
 *     }
 *   ))
 *
 * @constructor
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
class GoogleOAuth2Strategy<
  WithoutRequest extends boolean = true,
  Options extends GoogleOAuth2StrategyBaseOptions = WithoutRequest extends true
    ? GoogleOAuth2StrategyOptionsWithReq
    : GoogleOAuth2StrategyOptionsWithoutReq,
  Verifier extends GoogleOAuth2StrategyVerifier = WithoutRequest extends true
    ? GoogleOAuth2StrategyVerifierWithReq
    : GoogleOAuth2StrategyVerifierWithoutReq
> extends Strategy {
  private options: Options
  private readonly name: string = 'google'
  private scope: string[]
  private googlePlus: plus_v1.Plus

  constructor(options: Options, private verify: Verifier) {
    super()
    this.options = {
      passReqToCallback: false,
      skipUserProfile: false,
      scope: 'https://www.googleapis.com/auth/userinfo.email',
      accessType: 'online',
      ...options,
    }

    const x = options

    this.scope = toStringArray(this.options.scope)

    if (!this.options.skipUserProfile) this.googlePlus = plus('v1')
  }

  /**
   * Authenticate request by delegating to Google service provider using OAuth 2.0.
   *
   * @param {Object} req
   * @param {Object} options
   * @api protected
   */
  public authenticate(req: Request, options: Partial<Options> = {}) {
    const scope = options.scope ? toStringArray(options.scope) : this.options.scope
    const accessType = options.accessType || this.options.accessType
    const oauth2Client = new auth.OAuth2(this.options.clientId, this.options.clientSecret, this.options.callbackURL)

    const code = req.query && req.query.code

    if (code)
      // If we are handling a callback with an auth code.
      return oauth2Client.getToken(req.query.code, (err, tokens) => {
        if (err) return this.error(new Error(`Failed to obtain access token ${err.message}`))

        return this.loadUserProfile(tokens.access_token, tokens.refresh_token, (err, profile) => {
          if (err) return this.error(new Error(`Failed to retrieve user profile ${err.message}`))

          const verified: DoneFn = (err, user, info) => {
            if (err) return this.error(err)
            if (!user) return this.fail(info)
            user.provider = this.name
            return this.success(user, info)
          }

          try {
            // ugly typescript conversion, this should make typescript know the intention we had when
            // creating the class
            if (this.options.passReqToCallback)
              return (this.verify as GoogleOAuth2StrategyVerifierWithReq)(
                req,
                tokens.access_token,
                tokens.refresh_token,
                profile,
                verified,
              )
            return (this.verify as GoogleOAuth2StrategyVerifierWithoutReq)(
              tokens.access_token,
              tokens.refresh_token,
              profile,
              verified,
            )
          } catch (err) {
            return this.error(err)
          }
        })
      })
    // If we haven't yet delegated the user to Google's authentication do so.
    const url = oauth2Client.generateAuthUrl({ access_type: accessType, scope })
    return this.redirect(url)
  }

  /**
   * Load user profile, contingent upon options.
   *
   * @param accessToken
   * @param refreshToken
   * @param done
   * @api private
   */
  private loadUserProfile(
    accessToken: string,
    refreshToken: string,
    done: (err: Error | null, profile?: GooglePlusPerson) => void,
  ) {
    const oauth2Client = new auth.OAuth2(this.options.clientId, this.options.clientSecret, this.options.callbackURL)
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })

    if (this.options.skipUserProfile) return done(null)

    this.googlePlus.people.get({ userId: 'me', auth: oauth2Client }, (err, response) =>
      done(err, response as GooglePlusPerson),
    )
  }
}

export { GoogleOAuth2Strategy }
