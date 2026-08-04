import type { CampaignId, UserId } from "@tmrpg/schemas";
import { RealtimeEvent } from "@tmrpg/schemas";
import type { Context, Hono } from "hono";
import type { UpgradeWebSocket, WSContext } from "hono/ws";
import { verifyAccessToken } from "../auth.js";

const rooms = new Map<string, Set<WSContext>>();

function joinRoom(campaignId: string, ws: WSContext) {
  const room = rooms.get(campaignId) ?? new Set<WSContext>();
  room.add(ws);
  rooms.set(campaignId, room);
}

function leaveRoom(campaignId: string, ws: WSContext) {
  rooms.get(campaignId)?.delete(ws);
}

function broadcast(campaignId: string, event: RealtimeEvent, exclude?: WSContext) {
  const payload = JSON.stringify(event);
  for (const peer of rooms.get(campaignId) ?? []) {
    if (peer !== exclude) {
      peer.send(payload);
    }
  }
}

// Live-play gateway: one WebSocket room per campaign. Every inbound
// message is validated against the RealtimeEvent discriminated union
// before being rebroadcast, so a malformed client can't corrupt the
// session state of everyone else in the room.
export function registerSessionGateway(app: Hono, upgradeWebSocket: UpgradeWebSocket) {
  app.get(
    "/campaigns/:campaignId/live",
    upgradeWebSocket((c: Context) => {
      const campaignId = c.req.param("campaignId");
      if (!campaignId) {
        throw new Error("campaignId param is required");
      }
      const token = c.req.query("token");
      let userId = "";

      return {
        onOpen: async (_evt, ws) => {
          const payload = token ? await verifyAccessToken(token).catch(() => null) : null;
          if (!payload) {
            ws.close(4001, "Unauthorized");
            return;
          }
          userId = payload.sub;
          joinRoom(campaignId, ws);
          broadcast(campaignId, {
            type: "presence",
            campaignId: campaignId as CampaignId,
            userId: userId as UserId,
            status: "joined",
          });
        },
        onMessage: (evt, ws) => {
          const raw = typeof evt.data === "string" ? evt.data : evt.data.toString();
          const parsed = RealtimeEvent.safeParse(JSON.parse(raw));
          if (!parsed.success) {
            ws.send(JSON.stringify({ type: "validation_error", issues: parsed.error.issues }));
            return;
          }
          broadcast(campaignId, parsed.data, ws);
        },
        onClose: (_evt, ws) => {
          leaveRoom(campaignId, ws);
          broadcast(campaignId, {
            type: "presence",
            campaignId: campaignId as CampaignId,
            userId: userId as UserId,
            status: "left",
          });
        },
      };
    }),
  );
}
