import redis from "../services/redis.js";
async function clearCache() {
    try {
        await redis.flushall();
        console.log("✅ Redis cache cleared successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to clear cache:", err);
        process.exit(1);
    }
}

clearCache();
