import { IncomingMessage } from "http";
import { Request } from "./types/httpTypes.js";

export async function enhanceRequest(req: IncomingMessage): Promise<Request> {
  const enhanced = req as Request;
  if (!enhanced.url) {
    enhanced.path = "/";
    enhanced.query = {};
  } else {
    const [path, queryString] = enhanced.url.split("?");
    enhanced.path = path;
    enhanced.query = Object.fromEntries(new URLSearchParams(queryString));
  }
  
  if (enhanced.method !== "GET" && enhanced.method !== "HEAD") {
    const chunks = [];
    for await (const chunk of enhanced) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString();
    try {
      enhanced.body = JSON.parse(rawBody);
    } catch {
      enhanced.body = rawBody;
    }
  }

  return enhanced;
}