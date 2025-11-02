import { ServerResponse } from "http";
import { Response } from "./types/httpTypes.js";

export function enhanceResponse(res: ServerResponse): Response {
  const enhanced = res as Response;

  enhanced.status = function (code: number) {
    this.statusCode = code;
    return this;
  };

  enhanced.json = function (data: any) {
    this.setHeader("Content-Type", "application/json");
    this.end(JSON.stringify(data));
  };

  enhanced.send = function (data: any) {
    if (typeof data === "object") {
      this.setHeader("Content-Type", "application/json");
      this.end(JSON.stringify(data));
    } else {
      this.end(data);
    }
  };

  enhanced.sendHtml = function (data: any) {
    this.setHeader("Content-Type", "text/html");
    this.end(data);
  };

  return enhanced;
}