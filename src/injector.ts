
const injector = <T extends NodeModule>(module: string): Promise<T> => import(module)

export default injector
