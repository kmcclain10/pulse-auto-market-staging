#!/usr/bin/env python3
"""
Debug DealerCarSearch scraper to find real dealer photos
"""
import sys
import os
import asyncio
import logging

# Add backend to path
sys.path.append('/app/backend')

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from playwright.async_api import async_playwright

async def debug_dealercarsearch():
    """Debug Memory Motors specifically"""
    print("🔍 DEBUG: Memory Motors DealerCarSearch Platform")
    
    try:
        playwright = await async_playwright().start()
        browser = await playwright.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        )
        
        page = await browser.new_page()
        
        # Set user agent
        await page.set_user_agent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Go to Memory Motors inventory
        inventory_url = "https://memorymotorstn.com/newandusedcars?clearall=1"
        print(f"📄 Loading: {inventory_url}")
        
        await page.goto(inventory_url, timeout=45000)
        print("✅ Page loaded")
        
        # Wait for dynamic content
        await page.wait_for_timeout(5000)
        print("⏳ Waited for content to load")
        
        # Check page title
        title = await page.title()
        print(f"📰 Page title: {title}")
        
        # Look for DealerCarSearch image pattern
        images = await page.query_selector_all('img')
        print(f"🖼️ Found {len(images)} total images")
        
        dealercarsearch_images = []
        for img in images:
            src = await img.get_attribute('src')
            if src and 'imagescdn.dealercarsearch.com/Media/' in src:
                dealercarsearch_images.append(src)
        
        print(f"🎯 Found {len(dealercarsearch_images)} DealerCarSearch images:")
        for i, img_url in enumerate(dealercarsearch_images[:5]):
            print(f"   {i+1}. {img_url}")
        
        # Look for vehicle containers
        vehicle_containers = await page.query_selector_all('[class*="vehicle"], [class*="car"], [class*="listing"], [class*="inventory"]')
        print(f"🚗 Found {len(vehicle_containers)} potential vehicle containers")
        
        # Check if there are any vehicle links
        vehicle_links = await page.query_selector_all('a[href*="vdp"], a[href*="vehicle"], a[href*="details"]')
        print(f"🔗 Found {len(vehicle_links)} potential vehicle detail links")
        
        # Sample some vehicle links
        if vehicle_links:
            for i, link in enumerate(vehicle_links[:3]):
                href = await link.get_attribute('href')
                text = await link.inner_text()
                print(f"   {i+1}. {href} - {text[:50]}...")
        
        # Check page source for DealerCarSearch specific content
        content = await page.content()
        if 'dealercarsearch' in content.lower():
            print("✅ DealerCarSearch platform detected")
            
            # Look for specific DealerCarSearch patterns
            import re
            media_urls = re.findall(r'imagescdn\.dealercarsearch\.com/Media/[^"\']+', content)
            print(f"📸 Found {len(set(media_urls))} unique media URLs in source")
            
            # Sample URLs
            for i, url in enumerate(list(set(media_urls))[:3]):
                print(f"   {i+1}. https://{url}")
        else:
            print("❌ DealerCarSearch platform not detected")
        
        # Try to find vehicles in a different way
        await page.evaluate("""
            window.scrollTo(0, document.body.scrollHeight / 2);
        """)
        await page.wait_for_timeout(3000)
        
        # Re-check for images after scrolling
        images_after_scroll = await page.query_selector_all('img[src*="imagescdn.dealercarsearch.com/Media/"]')
        print(f"🔄 After scrolling: {len(images_after_scroll)} DealerCarSearch images")
        
        await browser.close()
        await playwright.stop()
        
        return len(dealercarsearch_images) > 0
        
    except Exception as e:
        print(f"❌ Debug error: {e}")
        return False

async def test_direct_image_download():
    """Test downloading DealerCarSearch images directly"""
    print("\n🔄 Testing direct image download...")
    
    # Known DealerCarSearch image URLs from previous successful scrapes
    test_urls = [
        "https://imagescdn.dealercarsearch.com/Media/19529/22705547/638859419280744011.jpg",
        "https://imagescdn.dealercarsearch.com/Media/19529/22705548/638859419281586503.jpg"
    ]
    
    import aiohttp
    import base64
    
    async with aiohttp.ClientSession() as session:
        for i, url in enumerate(test_urls):
            try:
                print(f"🔍 Testing image {i+1}: {url}")
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        content = await response.read()
                        print(f"✅ Downloaded {len(content)} bytes")
                        
                        # Convert to base64
                        base64_data = base64.b64encode(content).decode('utf-8')
                        base64_url = f"data:image/jpeg;base64,{base64_data}"
                        print(f"📸 Base64 length: {len(base64_url)} characters")
                        
                        if len(base64_url) > 100000:
                            print("✅ Image is large enough to be a real dealer photo")
                        else:
                            print("⚠️ Image might be too small")
                    else:
                        print(f"❌ Failed to download: {response.status}")
            except Exception as e:
                print(f"❌ Error downloading {url}: {e}")

async def main():
    print("🎯 DEBUGGING DEALERCARSEARCH REAL PHOTO EXTRACTION")
    print("=" * 60)
    
    # Test browser access to Memory Motors
    has_images = await debug_dealercarsearch()
    
    # Test direct image download
    await test_direct_image_download()
    
    print("\n" + "=" * 60)
    print(f"🎯 DealerCarSearch images found: {'✅' if has_images else '❌'}")

if __name__ == "__main__":
    asyncio.run(main())