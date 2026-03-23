import { queries, pool } from '../services/db.js';

export const definition = {
    name: "query_db",
    description: "Run predefined DB queries",
    inputSchema: {
        type: "object",
        properties: {
            queryName: { type: "string" }
        },
        required: ["queryName"]
    }
};

export async function handler(args) {
    const sql = queries[args.queryName];

    if (!sql) {
        throw new Error("Invalid query name");
    }

    const result = await pool.query(sql);

    return {
        content: [{
            type: "text",
            text: JSON.stringify(result.rows, null, 2)
        }]
    };
}

