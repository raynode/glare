
import { DataTypeAbstract, DefineAttributeColumnOptions } from 'sequelize'

declare global {
  type SequelizeAttributes<Attributes extends { [key: string]: any }> = {
    [Key in keyof Attributes]: string | DataTypeAbstract | DefineAttributeColumnOptions
  }
}
