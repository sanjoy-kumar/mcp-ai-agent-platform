import requests

MCP_URL = "http://localhost:3000/agent"


def call_mcp_agent(query: str):
    payload = {"query": query}

    response = requests.post(MCP_URL, json=payload)
    if response.status_code != 200:
        print(f"Bridge Error: {response.status_code} - {response.text}")

    return response.json()
