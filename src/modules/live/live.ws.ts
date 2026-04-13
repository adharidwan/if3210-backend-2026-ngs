import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { verifyToken } from "../../shared/auth/jwt";
import * as liveService from "./live.service";
import { WsMessageEnvelope } from "./live.dto";
import { LiveRateLimitServiceError, LiveValidationServiceError } from "./live.error";

export const liveRouter = new Hono();

liveRouter.get(
  "/ws/live",
  upgradeWebSocket(async (c) => {
    const header = c.req.header("Authorization");
    const queryToken = c.req.query("token");
    const rawToken = header?.startsWith("Bearer ") ? header.slice(7) : header ?? queryToken;

    let userId: number | null = null;
    if (rawToken) {
      try {
        const payload = await verifyToken(rawToken);
        userId = payload.sub;
      } catch {
      }
    }

    return {
      async onOpen(_evt, ws) {
        if (userId === null) {
          ws.close(4001, "Unauthorized");
          return;
        }
        await liveService.registerConnection(userId, ws);
      },
      async onMessage(evt, ws) {
        if (userId === null) return;
        try {
          const raw = JSON.parse(typeof evt.data === "string" ? evt.data : evt.data.toString());
          const envelope = WsMessageEnvelope.safeParse(raw);
          if (!envelope.success) {
            ws.send(JSON.stringify({ type: "error", payload: { message: "Invalid message envelope" }, timestamp: new Date().toISOString() }));
            return;
          }
          const { type, payload } = envelope.data;
          if (type === "ping") {
            liveService.handlePing(ws);
          } else if (type === "update_presence") {
            await liveService.handleUpdatePresence(userId, payload);
          }
        } catch (e) {
          const message = e instanceof LiveRateLimitServiceError || e instanceof LiveValidationServiceError ? e.message : "Invalid message";
          ws.send(JSON.stringify({ type: "error", payload: { message }, timestamp: new Date().toISOString() }));
        }
      },
      onClose() {
        if (userId !== null) liveService.removeConnection(userId);
      },
    };
  })
);