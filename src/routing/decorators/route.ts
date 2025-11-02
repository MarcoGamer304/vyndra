import { defineRoute } from "../router.js";

function makeRoute(method: string) {
  return (path: string) => (target: any, key: string) => {
    defineRoute(target, method, path, key);
  };
}

export const Get = makeRoute("GET");
export const Post = makeRoute("POST");
export const Delete = makeRoute("DELETE");
export const Patch = makeRoute("PATCH");
export const Put = makeRoute("PUT");
export const Head = makeRoute("HEAD");
export const Options = makeRoute("OPTIONS");