export const createObjectGuard = <Type>(property: string) => (obj: Record<string, any>): obj is Type =>
  obj && obj.hasOwnProperty(property)
