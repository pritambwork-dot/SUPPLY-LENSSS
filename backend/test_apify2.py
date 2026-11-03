import os
import asyncio
from apify_client import ApifyClientAsync

async def main():
    api_key = os.getenv("APIFY_API_KEY", "")
    client = ApifyClientAsync(api_key)
    
    url = "https://example.com"
    run_input = {
        "startUrls": [{"url": url}],
        "useApifyProxy": True,
    }
    
    run = await client.actor("apify/website-content-crawler").call(run_input=run_input)
    dataset_items = await client.dataset(run["defaultDatasetId"]).list_items()
    
    for item in dataset_items.items:
        print(item.get("text", "")[:100])

asyncio.run(main())
