import { safeFetch } from '../utils/fetch.js';
import { z } from 'zod';
import { validate } from '../utils/validator.js';

const schema = z.object({
    latitude: z.number(),
    longitude: z.number()
});

export const definition = {
    name: "get_weather",
    description: "Get current weather using latitude and longitude",
    inputSchema: {
        type: "object",
        properties: {
            latitude: { type: "number" },
            longitude: { type: "number" }
        },
        required: ["latitude", "longitude"]
    }
};


export async function handler(args) {
    try {
        const { latitude, longitude } = validate(schema, args);
        // Use the new Open-Meteo 2026 parameter format for better reliability
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`;

        const data = await safeFetch(url);

        if (!data.current) {
            throw new Error("Weather data not available for these coordinates.");
        }

        const temp = data.current.temperature_2m;
        const wind = data.current.wind_speed_10m;

        return {
            content: [{
                type: "text",
                text: `Location: ${latitude}, ${longitude} | Temp: ${temp}°C | Wind: ${wind} km/h`
            }]
        };
    } catch (error) {
        // This prevents the whole MCP server from crashing
        return {
            content: [{ type: "text", text: `Weather Tool Error: ${error.message}` }],
            isError: true
        };
    }
}
