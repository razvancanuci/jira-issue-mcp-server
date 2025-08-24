import { gzip, gunzip } from "node:zlib";
import { promisify } from "node:util";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export async function compress(json: string): Promise<string> {
    const compressed = await gzipAsync(Buffer.from(json, "utf-8"));
    return compressed.toString("base64");
}

export async function decompress(compressed: string): Promise<any> {
    const buffer = Buffer.from(compressed, "base64");
    const decompressed = await gunzipAsync(buffer);
    return decompressed.toString("utf-8");
}
