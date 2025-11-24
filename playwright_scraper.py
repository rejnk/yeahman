#!/usr/bin/env python3
"""
Complete website scraper using Playwright to capture JavaScript-rendered content
"""

from playwright.sync_api import sync_playwright
import os
import json
import shutil
from datetime import datetime
from urllib.parse import urljoin, urlparse
import time
import asyncio

def scrape_complete_site():
    """Scrape complete site with all assets using Playwright"""
    url = "https://flowus.tech/"
    output_dir = "playwright_output"
    assets_dir = os.path.join(output_dir, "assets")
    
    # Create output directories
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)
    
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        )
        page = context.new_page()
        
        # Track all requests and responses
        requests_data = []
        responses_data = []
        assets_downloaded = []
        
        def handle_request(request):
            requests_data.append({
                'url': request.url,
                'method': request.method,
                'resource_type': request.resource_type
            })
        
        def handle_response(response):
            try:
                content_type = response.headers.get('content-type', '')
                responses_data.append({
                    'url': response.url,
                    'status': response.status,
                    'content_type': content_type
                })
            except:
                pass
        
        page.on("request", handle_request)
        page.on("response", handle_response)
        
        print(f"Loading {url}...")
        try:
            page.goto(url, wait_until='networkidle', timeout=90000)
        except:
            page.goto(url, wait_until='domcontentloaded', timeout=90000)
        
        # Wait for content to fully render
        print("Waiting for content to render...")
        time.sleep(8)
        
        # Scroll to trigger lazy loading
        print("Scrolling page to load all content...")
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(2)
        
        # Get fully rendered HTML
        print("Extracting rendered HTML...")
        html_content = page.content()
        
        # Get page title and metadata
        title = page.title()
        
        # Extract all text content
        print("Extracting text content...")
        try:
            text_content = page.evaluate("""
                () => {
                    const body = document.body;
                    if (!body) return '';
                    
                    // Remove script and style elements
                    const scripts = body.querySelectorAll('script, style, noscript');
                    scripts.forEach(el => el.remove());
                    
                    return body.innerText || body.textContent || '';
                }
            """)
        except:
            text_content = ""
        
        # Extract all links
        try:
            links = page.evaluate("""
                () => {
                    const links = Array.from(document.querySelectorAll('a[href]'));
                    return links.map(link => ({
                        text: link.innerText.trim(),
                        href: link.href
                    })).filter(link => link.href);
                }
            """)
        except:
            links = []
        
        # Extract all images
        try:
            images = page.evaluate("""
                () => {
                    const images = Array.from(document.querySelectorAll('img'));
                    return images.map(img => ({
                        src: img.src || img.getAttribute('data-src') || '',
                        alt: img.alt || '',
                        width: img.naturalWidth || img.width || 0,
                        height: img.naturalHeight || img.height || 0
                    })).filter(img => img.src);
                }
            """)
        except:
            images = []
        
        # Extract all headings
        try:
            headings = page.evaluate("""
                () => {
                    const headings = {};
                    for (let i = 1; i <= 6; i++) {
                        const hElements = Array.from(document.querySelectorAll(`h${i}`));
                        headings[`h${i}`] = hElements.map(h => h.innerText.trim()).filter(h => h);
                    }
                    return headings;
                }
            """)
        except:
            headings = {}
        
        # Download all assets
        print("Downloading assets...")
        downloaded_count = 0
        
        # Download images
        for img in images[:50]:  # Limit to first 50 images
            try:
                img_url = img['src']
                if img_url and img_url.startswith('http'):
                    parsed = urlparse(img_url)
                    ext = os.path.splitext(parsed.path)[1] or '.png'
                    filename = f"img_{downloaded_count}{ext}"
                    filepath = os.path.join(assets_dir, filename)
                    
                    # Download with page.request.get
                    response = page.request.get(img_url)
                    if response.ok:
                        with open(filepath, 'wb') as f:
                            f.write(response.body())
                        assets_downloaded.append({
                            'url': img_url,
                            'type': 'image',
                            'local_path': filepath,
                            'size': os.path.getsize(filepath)
                        })
                        downloaded_count += 1
                        if downloaded_count % 10 == 0:
                            print(f"  Downloaded {downloaded_count} assets...")
            except Exception as e:
                pass
        
        # Download CSS and JS files
        print("Downloading CSS and JS files...")
        for response in responses_data:
            try:
                url = response['url']
                content_type = response.get('content_type', '')
                
                if 'text/css' in content_type or 'javascript' in content_type or url.endswith('.css') or url.endswith('.js'):
                    parsed = urlparse(url)
                    filename = os.path.basename(parsed.path) or ('style.css' if '.css' in url else 'script.js')
                    filepath = os.path.join(assets_dir, filename)
                    
                    # Skip if already exists
                    if os.path.exists(filepath):
                        continue
                    
                    resp = page.request.get(url)
                    if resp.ok:
                        mode = 'w' if 'text' in content_type else 'wb'
                        encoding = 'utf-8' if 'text' in content_type else None
                        with open(filepath, mode, encoding=encoding) as f:
                            f.write(resp.body() if not encoding else resp.text())
                        assets_downloaded.append({
                            'url': url,
                            'type': 'css' if '.css' in url else 'js',
                            'local_path': filepath
                        })
                        downloaded_count += 1
            except:
                pass
        
        # Save main HTML
        html_file = os.path.join(output_dir, 'index.html')
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # Save JSON data
        scraped_data = {
            'url': url,
            'timestamp': datetime.now().isoformat(),
            'title': title,
            'text_content': text_content,
            'headings': headings,
            'links': links,
            'images': images,
            'requests_count': len(requests_data),
            'responses_count': len(responses_data),
            'assets_downloaded': assets_downloaded
        }
        
        json_file = os.path.join(output_dir, 'scraped_data.json')
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(scraped_data, f, indent=2, ensure_ascii=False)
        
        # Save text content separately
        text_file = os.path.join(output_dir, 'text_content.txt')
        with open(text_file, 'w', encoding='utf-8') as f:
            f.write(text_content)
        
        print(f"\n✓ Scraping completed!")
        print(f"  HTML saved to: {html_file}")
        print(f"  Data saved to: {json_file}")
        print(f"  Text saved to: {text_file}")
        print(f"  Assets saved to: {assets_dir}")
        print(f"\nSummary:")
        print(f"  Title: {title}")
        print(f"  Text length: {len(text_content)} characters")
        print(f"  Headings found: {sum(len(v) for v in headings.values())}")
        print(f"  Links found: {len(links)}")
        print(f"  Images found: {len(images)}")
        print(f"  Requests made: {len(requests_data)}")
        print(f"  Assets downloaded: {len(assets_downloaded)}")
        
        browser.close()

if __name__ == '__main__':
    scrape_complete_site()
