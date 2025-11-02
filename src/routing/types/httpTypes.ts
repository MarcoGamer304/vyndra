import { IncomingMessage, ServerResponse } from "node:http";

export interface Request extends IncomingMessage {
  body?: any;
  query?: Record<string, string>;
  path?: string;
}

export interface Response extends ServerResponse {
  status: (code: number) => Response;
  json: (body: any) => void;
  send: (body: any) => void;
  sendHtml: (body: any) => void;
}