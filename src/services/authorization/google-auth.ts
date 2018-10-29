import config from 'config'

import { fetchApiAccess, verifyToken } from 'authorization'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import fetch from 'node-fetch'
import { create } from 'services/logger'

const log = create('auth', 'google')

const oauth2Client = new google.auth.OAuth2(config.google.clientId, config.google.secret, config.google.redirectUri)
google.options({
  auth: oauth2Client,
})

const createOAuthClient = (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2(config.google.clientId, config.google.secret, config.google.redirectUri)
  oauth2Client.setCredentials({
    access_token: accessToken,
  })
  return oauth2Client
}

const userLoginAuth0 = async (input: GQL.IAUTHPROVIDERAUTH0) => {
  const { idToken } = input
  console.log('IDTPKLEN:', idToken)
  const user = await verifyToken(idToken).catch(() => null)
  console.log('user:', user)
  if (!user) throw new Error('invalid id token')

  log(user)
  const access = await fetchApiAccess(user)
  log(access)

  return createOAuthClient(access[0].access_token)
}

export const getMail = async (auth: OAuth2Client) => {
  // google.auth
  const x = await google.gmail('v1').users.messages.list({
    auth,
    userId: 'me',
  })

  return x.data
}

export const getCalendar = async (auth: OAuth2Client) => {
  const x = await google.calendar({ version: 'v3', auth }).events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  })
  return x.data
}

export const getLocation = async (auth: OAuth2Client) => {
  const x = await google
    .mirror({
      version: 'v1',
      auth,
    })
    .locations.list()

  return x.data
}

export const getFitness = async (idToken: string) => {
  return fetch('https://www.googleapis.com/fitness/v1/users/me/dataSources', {
    method: 'GET',
    headers: {
      Authorization: `Bearer: ${idToken}`,
      'content-type': 'application/json',
    },
  }).then(res => res.json())
}

// tslint:disable
export const t =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6ImRhZDQ0NzM5NTc2NDg1ZWMzMGQyMjg4NDJlNzNhY2UwYmMzNjdiYzQifQ.eyJhenAiOiI3OTI4NTI0NTA1OTgtYjF2NHM5bDFibG1ubXNjYmYyM2Viczd0MjhkbGJ1bWEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3OTI4NTI0NTA1OTgtYjF2NHM5bDFibG1ubXNjYmYyM2Viczd0MjhkbGJ1bWEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDUyMTI0NDYyNDU1NzE1MTQxMjUiLCJlbWFpbCI6ImtvcGVsa2VAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJqN0lYemF3aEZFd0FhSTBmUHRxNmh3IiwiZXhwIjoxNTI5NTIzNTgyLCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwianRpIjoiOTFkODJkY2FjMDU2N2M2MWE3N2IyZDBlYWU0ZjZiYTg5ODk3YzQ4MCIsImlhdCI6MTUyOTUxOTk4MiwibmFtZSI6IlRvYmlhcyBLb3BlbGtlIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS8tT0czTXpsZE9PSncvQUFBQUFBQUFBQUkvQUFBQUFBQUFJbjAvSFdGUVNETlBhQ28vczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IlRvYmlhcyIsImZhbWlseV9uYW1lIjoiS29wZWxrZSIsImxvY2FsZSI6ImVuLUdCIn0.GmFqmRcsx4efay0SnD3eMHnJyMZkWqVAoRhugaHue6qLJyISR5M0-F_5PG-l_FidJHNYwZi3whbGx8Jqwm6KWjUk2kmzv0CSejOSKwp-wH1ZhBcpMgQM7bj1r9MNiABi3jDO4TJHSMKampkOdHDkS2ewd0Q8c5Plg7yjGMMFcr5gZQ0erRUoJo5YqnDt-6bqT9Sl_roxpoaHuGoxsM7J2S_s6aqAP3--e2HCtND4Q4AxazETnu_FsMRXm_CNUocY1ncRfRsK02ppQ-XI4fueOajUeKr5NY2totSldxqPEl9TPfIFV0lBY5hd1-PP21Wu7DvnTj-dfqGLOHXNRU6S0A'
// 'ya29.GlzgBXgFCCwxIEEe-WabpzWDmjahqqR5qTLVWphdvxf6B8gkgEjkUK1cBnwdoRgk4LdoK0JH2n-sp4XONUbGuvlqubP6oJBuO5z7znBFOVI61tZ5pvFFvrdW8J4YTg'
// 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImRhZDQ0NzM5NTc2NDg1ZWMzMGQyMjg4NDJlNzNhY2UwYmMzNjdiYzQifQ.eyJhenAiOiI3OTI4NTI0NTA1OTgtYjF2NHM5bDFibG1ubXNjYmYyM2Viczd0MjhkbGJ1bWEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3OTI4NTI0NTA1OTgtYjF2NHM5bDFibG1ubXNjYmYyM2Viczd0MjhkbGJ1bWEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDUyMTI0NDYyNDU1NzE1MTQxMjUiLCJlbWFpbCI6ImtvcGVsa2VAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJwVFpQcTlRSGhrVVFxNXRIMWRYT2RBIiwiZXhwIjoxNTI5NTIyOTY1LCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwianRpIjoiYjFhNGNiYjQ3NTFhMjQyYzhiOGE0ZDY2NjU5NmY1MjUyNWJjNDYyNiIsImlhdCI6MTUyOTUxOTM2NSwibmFtZSI6IlRvYmlhcyBLb3BlbGtlIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS8tT0czTXpsZE9PSncvQUFBQUFBQUFBQUkvQUFBQUFBQUFJbjAvSFdGUVNETlBhQ28vczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IlRvYmlhcyIsImZhbWlseV9uYW1lIjoiS29wZWxrZSIsImxvY2FsZSI6ImVuLUdCIn0.Gf8jGFfqfOXykNreOX9eHyvvlKHFTtEG9H_N3s40RJEZnN5jY7uvBiK8rLdjFAeac7Ls0o9ORPQ0IHsbqWuv1bnWT_BcnZmnZMb-b5GBHYpMc2DXW5dRnshAEiIbsR_seq6gL056G-EwfhvVRCKwYKptguymBR54i8ZZg4cRjNmrrt36YEN_bP3XYjsrYbNYUq-P7J1bZGDE9doKv1yGsUEh707atAv_NFQyCDx_UoxEm0L6s-QFiIeWvIeOgZVi5eHP97GQPyy0lNkqGj-sN2-oYH2rv6lyNei2dlB7nPVaIktcnuRnXVhydolQVYVX5o1wweBheX94B8EQuJ_UcQ'
// 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImRhZDQ0NzM5NTc2NDg1ZWMzMGQyMjg4NDJlNzNhY2UwYmMzNjdiYzQifQ.eyJhenAiOiI3OTI4NTI0NTA1OTgtYjF2NHM5bDFibG1ubXNjYmYyM2Viczd0MjhkbGJ1bWEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3OTI4NTI0NTA1OTgtYjF2NHM5bDFibG1ubXNjYmYyM2Viczd0MjhkbGJ1bWEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDUyMTI0NDYyNDU1NzE1MTQxMjUiLCJlbWFpbCI6ImtvcGVsa2VAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJnaVBXMjN5cG1kblBVcFR2SEVjTXlRIiwiZXhwIjoxNTI5NTA4NTIzLCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwianRpIjoiMjI0OTIzZmE4MmNkYWRkZTUzMDBlODQyOTRkOThlZjFmMjQ1MDA2ZSIsImlhdCI6MTUyOTUwNDkyMywibmFtZSI6IlRvYmlhcyBLb3BlbGtlIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS8tT0czTXpsZE9PSncvQUFBQUFBQUFBQUkvQUFBQUFBQUFJbjAvSFdGUVNETlBhQ28vczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IlRvYmlhcyIsImZhbWlseV9uYW1lIjoiS29wZWxrZSIsImxvY2FsZSI6ImVuLUdCIn0.jfdti5T1cCDsfyheFQkQdBUJEsCcWvL55OLVhY8D58WshvUadQKGvOoFq8Lls3iM-PRRW3suVrozoEjitv6iwYqR97Fi_-N9jB8bwelKpQJzmzXTW3zb-pzpHyAoHkeZWA5KItIYXwDx-TxTk0Ugt17rl6JdYJUAnSJHENEjvseEMLSPhv4CtgbyAmZyM2UHUmeZbnpJJPBa2x55nHJtSyMNo0rLxws8fZQEXzszeYf16N8U5EnP5I6yJIQK4y54YgW5ho-NZKS3H4hKBmzqz1iz-8PJf-8Z3sfTqjJDjbH6qeHyws0eiKELXB6X7lLOcMMPc0sUtpCEQh5hN5nUWA'
// tslint:enable

export const test = async (idToken: string) => {
  console.log('VERIFY TOKEN:')
  const auth = await userLoginAuth0({ idToken })
  console.log('client:', auth)
  console.log(await getFitness(idToken))
  // const mails = await getMail(auth)
  // console.log('You have ' + mails.messages.length + ' mails')

  // mails.messages.map(mail => {
  //   console.log('==========================')
  //   console.log(mail.id)
  //   console.log(mail.payload)
  //   console.log(mail.payload)
  // })

  // console.log(await auth.getTokenInfo(idToken))
  // try {
  //   const fitness = await getFitness(auth)
  //   console.log(fitness)
  // } catch(e) {
  //   console.log('some error: ', e)
  // }
  // const cal = await getCalendar(auth)
  // console.log(cal.items.map(item => item.start.dateTime + ' > ' + item.summary))
}
