import { Constructor } from "../registry.js";

export type ControllerInstance = {
  constructor: Constructor;
  [key: string]: any;
};