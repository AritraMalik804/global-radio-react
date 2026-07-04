import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { stationId, message, username } = await req.json();

    if (!stationId || !message || !username) {
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
      // Blobs store might be empty for this station, that's fine
    }

    // Append new message (limit to last 100 messages to prevent blob from growing indefinitely)
    messages.push({
      id: crypto.randomUUID(),
      text: message,
      username: username,
      timestamp: Date.now()
    });
    
    if (messages.length > 100) {
      messages = messages.slice(messages.length - 100);
    }

    await chats.setJSON(stationId, messages);

    return new Response(JSON.stringify({ success: true, messages }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
