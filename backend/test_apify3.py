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
    print("Run Object Attributes:", dir(run))
    dataset_id = getattr(run, "default_dataset_id", getattr(run, "defaultDatasetId", None))
    if dataset_id:
        dataset_items = await client.dataset(dataset_id).list_items()
        print("Items count:", len(dataset_items.items))
        if dataset_items.items:
            print("First item keys:", dataset_items.items[0].keys())

asyncio.run(main())
