import { Realtime } from "ably";

export function publishEvent(uid: string, event: string, data: any) {
  const client = new Realtime({ key: Deno.env.get("ABLY_API_KEY")! });
  const channel = client.channels.get(`user:${uid}`);
  channel.publish({ name: event, data });
}