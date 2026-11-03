import asyncio
import httpx
import json

async def main():
    api_key = "dbbe65832f894cf3be97a0f6ab0582f7db5cf07069a34d1294d1d39278d04d2b"
    url = "https://sdk.nimbleway.com/v2/search"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "query": "supplier packaging india"
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print(json.dumps(response.json(), indent=2))
        else:
            print("Error:", response.text)

asyncio.run(main())
