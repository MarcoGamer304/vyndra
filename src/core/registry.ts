export type Constructor<T = any> = new (...args: any[]) => T;

export const globalRegistry = {
  controllers: new Map<string, Constructor<any>>(),
  services: new Map<string, Constructor<any>>(),
  listeners: new Map<string, Constructor<any>>(),
};