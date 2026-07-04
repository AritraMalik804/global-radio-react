import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { stationId, messageId, username } = await req.json();

    if (!stationId || !messageId || !username) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    const chats = getStore("station_chats");
    let messages: any[] = [];
    try {
      const data = await chats.get(stationId, { type: "json" });
      if (Array.isArray(data)) {
        messages = data;
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: "No messages found" }), { status: 404 });
    }

    // Filter out the message only if the username matches (basic authorization)
    const initialLength = messages.length;
    messages = messages.filter(msg => !(msg.id === messageId && msg.username === username));

    if (messages.length === initialLength) {
      return new Response(JSON.stringify({ error: "Message not found or unauthorized" }), { status: 403 });
    }

    await chats.setJSON(stationId, messages);

    return new Response(JSON.stringify({ success: true, messages }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
