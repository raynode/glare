import { create } from 'services/logger'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

// import { Widget } from 'models/wi'
// import { Widgets } from 'db/widgets'

const log = create('types', 'widget')

// query function to find all accounts
const store = []

export const widget: TypeDef<Widget> = {
  name: 'Widget',
  typeDefs: loadTypeDefs(__dirname)('widget'),
  Query: {
    widgets: () => store,
  },
}
