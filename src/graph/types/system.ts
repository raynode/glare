import { GQLBuild, GQLSchemaBuilder } from 'graph/builder'

const toNode = <T>(obj: T, id: string = null) => ({
  ...obj,
  id,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
})

const findOneSystem = (systemId: string) =>
  toNode(
    {
      screenView: toNode({
        style: {
          background: 'linear-gradient(#f00, #5f0)',
        },
        screenObjects: [
          toNode({
            type: 'block',
            style: {
              gridRowStart: 2,
              gridColumnStart: 2,
              width: '100%',
              height: '100%',
              background: 'blue',
            },
          }),
          toNode({
            type: 'block',
            style: {
              gridRowStart: 1,
              gridColumnStart: 1,
              width: '50%',
              height: '50%',
              background: 'green',
              alignSelf: 'center',
              margin: '0 auto',
            },
          }),
        ],
      }),
    },
    systemId,
  )

export const systemBuilder = (builder: GQLSchemaBuilder) => {
  const system = builder.model('System')
  const screenView = builder.model('ScreenView', {
    findOne: async (args, context) => findOneSystem(context.systemId).screenView,
  })
  const screenObject = builder.model('ScreenObject')

  system.attr('screenView', 'ScreenView')

  screenView.attr('screenObjects', '[ScreenObject!]!')
  screenView.attr('style', 'JSON')

  screenObject.attr('style', 'JSON')
  screenObject.attr('type', 'String!')
}

export const systemBuild = (build: GQLBuild) => {
  build.addQuery('system', 'System', { resolver: (_, args, context) => findOneSystem(context.systemId) })
}
