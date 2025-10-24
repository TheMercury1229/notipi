import { createClient } from "redis";

const client = createClient({ url: "redis://localhost:6379" });

await client.connect();
await client.flushAll();
console.log("✅ Redis cache cleared!");
await client.quit();
