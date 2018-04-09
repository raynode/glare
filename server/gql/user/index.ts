
import { fetchApiAccess, verifyToken } from 'authorization'
import Users from 'db/user'
import { loadTypeDefs } from 'gql/utils/typeDefs'
import { create } from 'logger'
import { Document } from 'mongoose'

const log = create('db', 'model', 'user')

export const typeDefs = loadTypeDefs(__dirname)('user')

const userLoginAuth0 = async (obj, args: { input: GQL.IAUTHPROVIDERAUTH0 }, context) => {
  const { input: { idToken }} = args
  const user = await verifyToken(idToken).catch(() => null)

  if(!user)
    throw new Error('invalid id token')

  log(user)
  const access = await fetchApiAccess(user)
  log(access[0].access_token)

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

// fetches all users from the mongo database
const users = () => Users.find()
const findUserByEmail = (email: string) => Users.findOne({ email })

// a resolver is expected to export these four fields:
// Mutations { [string]: Resolver<User> }
// Query { [string]: Resolver<User> }
// Resolver { [string]: Resolver<User-fields> }
// Attachments { [other: Resolver]: { [string]: Resolver<User> } }

export const Mutations = {
  userLoginAuth0,
}

export const Query = {
  findUserByEmail: (obj, args, context) => findUserByEmail(args.input.email),
  user: (obj, args, context) => findUserByEmail(args.input.email),
  users : (obj, args, context) => users(),
  me : (obj, args, context) => context.user && findUserByEmail(context.user.email),
}

export const Resolver = {
  // id needs to be mapped to the mongodb-id
  ID: user => user._id,
}
