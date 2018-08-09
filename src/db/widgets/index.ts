
import { Document, model, Schema, Types } from 'mongoose'
import { Widget } from '../models'

const WidgetSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})

export const Widgets = model('Widget', WidgetSchema)

export const Actions = {
  widgets: async () => (await Widgets.find()) as Widget[],
}
