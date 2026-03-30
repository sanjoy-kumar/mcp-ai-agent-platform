import { queries, pool } from '../services/db.js';


// Map natural language → query names
function mapQueryToName(query) {
    if (!query) return null;

    const q = query.toLowerCase();

    if (
        q.includes("user") ||
        q.includes("users") ||
        q.includes("user list")
    ) return "get_users";

    if (
        q.includes("chat") ||
        q.includes("message") ||
        q.includes("messages")
    ) return "get_chats";

    if (
        q.includes("session") ||
        q.includes("sessions")
    ) return "get_sessions";

    return null;
}


export const definition = {
    name: "query_db",
    description: "Run predefined database queries using a query name or natural language",
    inputSchema: {
        type: "object",
        properties: {
            queryName: { type: "string" }
        },
        required: ["queryName"]
    }
};


export async function handler(args) {
    try {
        let queryName = args.queryName;

        // fallback if missing
        if (!queryName && args.query) {
            queryName = mapQueryToName(args.query);
        }

        // extra safety
        if (!queryName) {
            queryName = mapQueryToName(JSON.stringify(args));
        }

        if (!queryName) {
            return {
                content: [{
                    type: "text",
                    text: "Could not determine database query."
                }]
            };
        }

        const sql = queries[queryName];

        if (!sql) {
            return {
                content: [{
                    type: "text",
                    text: `Invalid query name: ${queryName}`
                }]
            };
        }

        const result = await pool.query(sql);

        return {
            content: [{
                type: "text",
                text: JSON.stringify(result.rows, null, 2)
            }]
        };

    } catch (err) {
        console.error("DB Error:", err);

        return {
            content: [{
                type: "text",
                text: "Database query failed."
            }]
        };
    }
}

