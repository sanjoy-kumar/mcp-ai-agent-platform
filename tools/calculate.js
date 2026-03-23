import { z } from "zod";
import { validate } from '../utils/validator.js';

const schema = z.object({
    a: z.number(),
    b: z.number(),
    operator: z.enum(["add", "subtract", "multiply", "divide"])
});

export const definition = {
    name: "calculate",
    description: "Perform basic math operations(add, subtract, multiply, divide)",
    inputSchema: {
        type: "object",
        properties: {
            a: { type: "number" },
            b: { type: "number" },
            operator: { type: "string" }
        },
        required: ["a", "b", "operator"]
    }
};

export async function handler(args) {
    const { a, b, operator } = validate(schema, args);

    let result;

    switch (operator) {
        case "add": result = a + b; break;
        case "subtract": result = a - b; break;
        case "multiply": result = a * b; break;
        case "divide":
            if (b === 0) throw new Error("Cannot divide by zero");
            result = a / b;
            break;
    }

    return {
        content: [{ type: "text", text: `Result: ${result}` }]
    };
}

