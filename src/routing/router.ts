export const ROUTES_KEY = Symbol('routes');

export function defineRoute(target: any, method: string, path: string, handler: string) {
  const routes = Reflect.getMetadata(ROUTES_KEY, target.constructor) || [];
  routes.push({ method, path, handler });
  Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);
}

export function getRoutes(target: any) {
  return Reflect.getMetadata(ROUTES_KEY, target.constructor) || [];
}