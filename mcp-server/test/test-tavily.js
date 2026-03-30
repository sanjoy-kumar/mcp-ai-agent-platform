import 'dotenv/config';

async function testSearch() {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
        console.error("❌ Error: TAVILY_API_KEY is not defined in your .env file.");
        return;
    }

    console.log("🚀 Testing Tavily with query: 'Who is the current Prime Minister of Bangladesh?'");

    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                query: "Who is the current Prime Minister of Bangladesh?",
                search_depth: "advanced",
                include_answer: true,
                max_results: 3
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Success!");
            console.log("--- AI Summary ---");
            console.log(data.answer);
            console.log("\n--- Top Source ---");
            console.log(data.results[0]?.url);
        } else {
            console.error("❌ API Error:", data);
        }
    } catch (err) {
        console.error("❌ Network Error:", err.message);
    }
}

testSearch();
