import asyncio
import httpx

async def main():
    api_key = "dbbe65832f894cf3be97a0f6ab0582f7db5cf07069a34d1294d1d39278d04d2b"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    endpoints = [
        "https://sdk.nimbleway.com/v2/search",
        "https://sdk.nimbleway.com/v2/serp",
        "https://sdk.nimbleway.com/v2/agents/google_search",
        "https://api.nimbleway.com/api/v1/search",
        "https://api.nimble.com/api/v1/search",
    ]
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        for url in endpoints:
            try:
                response = await client.post(url, json={"query": "supplier packaging india"}, headers=headers)
                print(f"{url} -> Status: {response.status_code}")
                if response.status_code not in (404, 401, 403, 405):
                    print(response.text[:200])
            except Exception as e:
                print(f"{url} -> Error: {e}")

asyncio.run(main())
