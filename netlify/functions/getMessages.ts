import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const stationId = url.searchParams.get("stationId");

  if (!stationId) {
    return new Response(JSON.stringify({ error: "Missing stationId" }), { status: 400 });
  }

  try {
    const chats = getStore("station_chats");
    const data = await chats.get(stationId, { type: "json" });
    return new Response(JSON.stringify(data || []), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, messages: [] }), {
      headers: { "Content-Type": "application/json" },
      status: 200 // Return empty array on failure so frontend doesn't crash
    });
  }
};
