import { Request, Response } from "../../routing/types/httpTypes.js";

export type Middleware = (
  req: Request,
  res: Response,
  next: () => Promise<void> | void
) => any;

export type Next = () => Promise<void> | void;