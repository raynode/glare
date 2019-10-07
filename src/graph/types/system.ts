import { CreateArgs, FindOneArgs, NodeType, Service } from 'gram'

import { ScreenObject, ScreenObjects, ScreenObjectTypes } from 'db/models/screen-object'
import { createService, ExtendedService } from 'graph/base-service'
import { GQLBuild, GQLSchemaBuilder } from 'graph/builder'
import { GraphQLContext } from 'services/graphql-context'

export const screenObjectService = createService(ScreenObjects)

export interface SystemType {
  id: string | null
}

screenObjectService.create({ data: { type: 'block' } }, { systemId: 'test', auth: null, user: null })

export const systemBuilder = (builder: GQLSchemaBuilder) => {
  const screenObject = builder.model('ScreenObject', screenObjectService)
  screenObject.attr('configuration', 'JSON!')
  screenObject.attr('style', 'JSON!')
  screenObject.attr('type', 'String!')

  const system = builder.model('System')
}

export const systemBuild = (build: GQLBuild) => {
  build.addQuery('system', 'System', {
    resolver: (_, args, context) =>
      context.systemId && {
        id: context.systemId,
      },
  })

  build.extendType<SystemType>('System', {
    resolver: {
      screenObjects: (system, args, context) =>
        screenObjectService.find(
          {
            order: args.order || 'id_ASC',
            where: {
              ...(args.where || null),
              screenId: system.id,
            },
            page: args.page || { offset: 0, limit: 9999 },
          },
          context,
        ),
    },
    fields: {
      screenObjects: {
        args: {
          order: 'ScreenObjectSortOrder',
          page: 'ScreenObjectPage',
          where: 'ScreenObjectWhere',
        },

        type: '[ScreenObject!]!',
      },
    },
  })
}
