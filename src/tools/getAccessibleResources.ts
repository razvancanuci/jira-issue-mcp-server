import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from "zod";
import {redisClient} from "../infrastructure/redis.js";
import {CacheData} from "../models/index.js";
import {decompress} from "../utils/compression.js";


export function getAccessibleResourcesTool(server: McpServer) {
    server.tool('get_accessible_resources',
        'Fetches a list of resources the user has access to.',
        {
            userEmail: z.string().email().describe("The email of the user accessing the resources.")
        },
        async ({ userEmail }) => {
            const cacheStr = await redisClient.get(userEmail);

            const userDetails: CacheData = await decompress(cacheStr as string);

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(userDetails.resources),
                    },
                ],
            }
        });
}