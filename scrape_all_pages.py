#!/usr/bin/env python3
"""
Scrape all sub-pages from flowus.tech
"""

from playwright.sync_api import sync_playwright
import os
import json
from datetime import datetime
from urllib.parse import urljoin, urlparse
import time
import re

def scrape_page(browser, url, output_dir, assets_dir, base_url):
    """Scrape a single page"""
    page = browser.new_page()
    
    try:
        print(f"  Loading {url}...")
        page.goto(url, wait_until='networkidle', timeout=90000)
        time.sleep(5)
        
        # Scroll to load content
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(2)
        
        # Get HTML
        html_content = page.content()
        
        # Fix paths in HTML
        html_content = html_content.replace('/static/', './assets/')
        html_content = re.sub(r'src="https://flowus\.tech/static/', 'src="./assets/', html_content)
        html_content = re.sub(r'href="https://flowus\.tech/static/', 'href="./assets/', html_content)
        
        # Disable React
        html_content = html_content.replace(
            '<script defer="defer" src="./assets/main.85a525c4.js"></script>',
            '<!-- React disabled -->\n<script>\nwindow.addEventListener("DOMContentLoaded", function() {\n    console.log("Content preserved");\n});\n</script>'
        )
        
        # Create filename from URL
        path = urlparse(url).path
        if path == '/' or path == '':
            filename = 'index.html'
        else:
            filename = path.strip('/').replace('/', '_') + '.html'
        
        # Save HTML
        html_file = os.path.join(output_dir, filename)
        os.makedirs(os.path.dirname(html_file), exist_ok=True)
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"    ✓ Saved to {filename}")
        
        # Download missing images
        images = page.evaluate("""
            () => {
                const images = Array.from(document.querySelectorAll('img'));
                return images.map(img => ({
                    src: img.src || img.getAttribute('data-src') || '',
                    alt: img.alt || ''
                })).filter(img => img.src && img.src.startsWith('http'));
            }
        """)
        
        for img in images:
            try:
                img_url = img['src']
                if 'flowus.tech' in img_url:
                    parsed = urlparse(img_url)
                    filename = os.path.basename(parsed.path) or 'image.png'
                    filepath = os.path.join(assets_dir, filename)
                    
                    if not os.path.exists(filepath):
                        response = page.request.get(img_url)
                        if response.ok:
                            with open(filepath, 'wb') as f:
                                f.write(response.body())
                            print(f"    ✓ Downloaded {filename}")
            except:
                pass
        
        return True
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return False
    finally:
        page.close()

def scrape_all_pages():
    """Scrape all pages from flowus.tech"""
    base_url = "https://flowus.tech"
    output_dir = "playwright_output"
    assets_dir = os.path.join(output_dir, "assets")
    
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)
    
    # Pages to scrape
    pages_to_scrape = [
        "/",
        "/template",
        "/pricing",
        "/download",
        "/ai",
        "/firm",
        "/page",
        "/bitable",
        "/folder",
        "/cooperation",
    ]
    
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        )
        
        browser = context
        
        scraped_pages = []
        for page_path in pages_to_scrape:
            url = urljoin(base_url, page_path)
            print(f"\nScraping {page_path}...")
            if scrape_page(browser, url, output_dir, assets_dir, base_url):
                scraped_pages.append(url)
            time.sleep(2)  # Be nice to the server
        
        browser.close()
        
        print(f"\n✓ Scraped {len(scraped_pages)} pages successfully!")
        print(f"  Pages saved to: {output_dir}/")
        print(f"  Assets saved to: {assets_dir}/")

if __name__ == '__main__':
    scrape_all_pages()








