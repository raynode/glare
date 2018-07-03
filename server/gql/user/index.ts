
import { fetchApiAccess, verifyToken } from 'authorization'

import { DBResolverMap, UserActions, Users } from 'db'
import { User } from 'db/models'

import { loadTypeDefs } from 'gql/utils/typeDefs'
import { create } from 'logger'

import config from 'config'
import { google } from 'googleapis'

const log = create('db', 'model', 'user')

const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.secret,
  config.google.redirectUri,
)
google.options({
  auth: oauth2Client,
})

const createOAuthClient = (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2(
    config.google.clientId,
    config.google.secret,
    config.google.redirectUri,
  )
  oauth2Client.setCredentials({
    access_token: accessToken,
  })
  return oauth2Client
}

export const typeDefs = loadTypeDefs(__dirname)('user')

// import { t, test } from 'authorization/google-auth'
// console.log('TESTING')
// test(t)

const userLoginAuth0 = async (obj, args: { input: GQL.IAUTHPROVIDERAUTH0 }, context) => {
  const { input: { idToken }} = args
  const user = await verifyToken(idToken).catch(() => null)

  if(!user)
    throw new Error('invalid id token')

  // log(user)
  // const access = await fetchApiAccess(user)
  // log(access)

  test(idToken)

  // const auth = createOAuthClient(access[0].access_token)
  // // google.auth
  // const x = google.gmail('v1').users.messages.list({
  //   auth,
  //   userId: 'me',
  // })
  // console.log(x)

  // search for the user with the user.sub, as this is the id auth0 will give the user
  // @see https://auth0.com/docs/user-profile/normalized/oidc
  const entry = await Users.findOne({ auth0UserId: user.sub })
  const modelData = {
    auth0UserId: user.sub,
    email: user.email,
    emailVerified: user.email_verified,
    familyName: user.family_name,
    gender: user.gender,
    givenName: user.given_name,
    locale: user.locale,
    name: user.name,
    nickname: user.nickname,
    picture: user.picture,
  }
  if(entry)
    return entry.set(modelData).save()

  const model = new Users(modelData)
  return model.save()
}

// a resolver is expected to export these four fields:
// Mutations { [string]: Resolver<User> }
// Query { [string]: Resolver<User> }
// Resolver { [string]: Resolver<User-fields> }
// Attachments { [other: Resolver]: { [string]: Resolver<User> } }

export const Mutations = {
  userLoginAuth0,
}

export const Query = {
  findUserByEmail: (obj, args, context) => UserActions.findUserByEmail(args.input.email),
  user: (obj, args, context) => UserActions.findUserByEmail(args.input.email),
  users : (obj, args, context) => UserActions.users(),
  me : (obj, args, context) => context.user && UserActions.findUserByEmail(context.user.email),
}

export const Resolver: DBResolverMap<User> = {
  // id needs to be mapped to the mongodb-id
  id: user => user._id,
}
