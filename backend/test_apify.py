import os
import asyncio
from apify_client import ApifyClientAsync
from bs4 import BeautifulSoup

async def main():
    api_key = os.getenv("APIFY_API_KEY", "")
    client = ApifyClientAsync(api_key)
    
    url = "https://www.google.com/"
    run_input = {
        "startUrls": [{"url": url}],
        "useApifyProxy": True,
    }
    
    run = await client.actor("apify/cheerio-scraper").call(run_input=run_input)
    dataset_items = await client.dataset(run["defaultDatasetId"]).list_items()
    
    for item in dataset_items.items:
        html = item.get("html", "")
        if html:
            soup = BeautifulSoup(html, "html.parser")
            print("Title:", soup.title.string if soup.title else "No title")

asyncio.run(main())
