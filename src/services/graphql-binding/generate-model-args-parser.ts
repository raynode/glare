import { Dictionary, reduce } from 'lodash'
import { BuildConfiguration, Model } from './types'
import { create } from 'services/logger'
import { Sequelize } from 'services/db'

const Op = Sequelize.Op

type ModifierMapper = (modifier: string, field: string, value: any) => Dictionary<any>

const basicModifierMapper: ModifierMapper = (modifier, field, value) => {
  switch (modifier) {
    case 'eq':
      return { [Op.eq]: value }
    case 'in':
      return { [Op.in]: value }
    case 'not_in':
      return { [Op.notIn]: value }
    case 'not':
      return { [Op.ne]: value }
    case 'lt':
      return { [Op.lt]: value }
    case 'lte':
      return { [Op.lte]: value }
    case 'gt':
      return { [Op.gt]: value }
    case 'gte':
      return { [Op.gte]: value }
    case 'contains':
      return { [Op.like]: `%${value}%` }
    // case 'not_contains': return { [Op.not]: { [Op.like]: `%${value}%` } }
    case 'starts_with':
      return { [Op.like]: `${value}%` }
    // case 'not_starts_with': return { [Op.not]: { [Op.like]: `${value}%` } }
    case 'ends_with':
      return { [Op.like]: `%${value}` }
    // case 'not_ends_with': return { [Op.not]: { [Op.like]: `%${value}` } }
  }
  throw new Error('unkown modifier: ' + modifier)
}

const argsParserLog = create('where')
export const generateModelArgsParser = (config: BuildConfiguration, model: Model) => {
  return (args: Dictionary<any>) => {
    argsParserLog('in:', args)
    const where = reduce(
      args,
      (where, value, key) => {
        const splitIndex = key.indexOf('_')
        const [field, modifier] =
          splitIndex === -1 ? [key, 'eq'] : [key.substr(0, splitIndex), key.substr(splitIndex + 1)]
        where[field] = basicModifierMapper(modifier, field, value)
        return where
      },
      {},
    )
    argsParserLog('out:', where)
    return where
  }
}

// const query = {
//   [`state_in`]: ['test_in', 'test_in'],
//   [`state_not_in`]: ['member', 'admin'],
//   [`name_not`]: 'test_not',
//   [`name_lt`]: 'test_lt',
//   [`name_lte`]: 'test_lte',
//   [`name_gt`]: 'test_gt',
//   [`name_gte`]: 'test_gte',
//   [`name_contains`]: 'test_contains',
//   // [`name_not_contains`]: 'test_not_contains',
//   [`name_starts_with`]: 'test_starts_with',
//   // [`name_not_starts_with`]: 'test_not_starts_with',
//   [`name_ends_with`]: 'test_ends_with',
//   // [`name_not_ends_with`]: 'test_not_ends_with',
// }

// import { User } from 'models/user'
// import { convertToModel } from './convert-to-model'
// const m = convertToModel(User)

// const config: any = {}

// const parser = generateModelArgsParser(config, m)

// const result = parser(query)

// console.log('result:', result)

// const main = async () => {
//   console.log('trying to fetch: ', result)
//   const users = await User.findAll({ where: result })
//   console.log(users.length)
// }

// main()
// .catch(err => console.error(err))
