import asyncio
import httpx

async def main():
    api_key = "dbbe65832f894cf3be97a0f6ab0582f7db5cf07069a34d1294d1d39278d04d2b"
    url = "https://sdk.nimbleway.com/v2/extract"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "url": "https://www.google.com/search?q=supplier+packaging+india",
        "render": False
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        print("Status:", response.status_code)
        if response.status_code == 200:
            print("Response length:", len(response.text))
        else:
            print("Error:", response.text)

asyncio.run(main())
