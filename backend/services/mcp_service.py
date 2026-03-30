import requests

MCP_URL = "http://localhost:3000/agent"


def call_mcp_agent(query: str):
    response = requests.post(MCP_URL, json={"query": query})

    data = response.json()

    text = ""
    tools = []

    if "content" in data:
        text = data["content"][0]["text"]
    elif "result" in data:
        text = data["result"]

    if "tools_used" in data:
        tools = data["tools_used"]

    return {
        "result": text,
        "tools": tools
    }
