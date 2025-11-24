#!/usr/bin/env python3
"""
Enhanced web scraper for https://flowus.tech/ using Selenium for JavaScript-rendered content
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json
from datetime import datetime
import time
import sys

def scrape_flowus_tech_with_selenium():
    """Scrape content from flowus.tech website using Selenium for JavaScript rendering"""
    url = "https://flowus.tech/"
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in background
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    driver = None
    
    try:
        print(f"Launching browser and fetching {url}...")
        driver = webdriver.Chrome(options=chrome_options)
        driver.get(url)
        
        # Wait for content to load (wait for root element or specific content)
        print("Waiting for page to load...")
        wait = WebDriverWait(driver, 30)
        
        # Wait a bit for JavaScript to render content
        time.sleep(5)
        
        # Try to wait for any content in the root div
        try:
            wait.until(lambda d: d.find_element(By.ID, "root").get_attribute("innerHTML").strip() != "")
        except:
            print("Warning: Root element may be empty, continuing anyway...")
        
        # Additional wait for dynamic content
        time.sleep(3)
        
        # Get page source after JavaScript execution
        html = driver.page_source
        
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract various elements
        scraped_data = {
            'url': url,
            'timestamp': datetime.now().isoformat(),
            'title': driver.title,
            'meta_description': '',
            'meta_keywords': '',
            'headings': {},
            'links': [],
            'images': [],
            'text_content': '',
            'scripts': [],
            'stylesheets': [],
            'urls_in_page': [],
        }
        
        # Extract meta tags
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            scraped_data['meta_description'] = meta_desc.get('content', '')
        
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        if meta_keywords:
            scraped_data['meta_keywords'] = meta_keywords.get('content', '')
        
        # Extract headings
        for level in range(1, 7):
            headings = soup.find_all(f'h{level}')
            scraped_data['headings'][f'h{level}'] = [h.get_text(strip=True) for h in headings]
        
        # Extract links
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True)
            if href and href not in [l['href'] for l in scraped_data['links']]:
                scraped_data['links'].append({
                    'text': text,
                    'href': href,
                })
        
        # Extract images
        for img in soup.find_all('img'):
            scraped_data['images'].append({
                'alt': img.get('alt', ''),
                'src': img.get('src', ''),
            })
        
        # Extract scripts
        for script in soup.find_all('script', src=True):
            scraped_data['scripts'].append(script['src'])
        
        # Extract stylesheets
        for link in soup.find_all('link', rel='stylesheet'):
            href = link.get('href', '')
            if href:
                scraped_data['stylesheets'].append(href)
        
        # Extract main text content (without scripts and styles)
        for script in soup(['script', 'style', 'noscript']):
            script.decompose()
        
        main_text = soup.get_text(separator='\n', strip=True)
        scraped_data['text_content'] = main_text
        
        # Extract all URLs mentioned in the page
        import re
        url_pattern = r'https?://[^\s<>"\'{}|\\^`\[\]]+'
        urls_found = re.findall(url_pattern, html)
        scraped_data['urls_in_page'] = list(set(urls_found))
        
        # Save to JSON file
        output_file = 'scraped_data_selenium.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(scraped_data, f, indent=2, ensure_ascii=False)
        
        print(f"\nScraping completed successfully!")
        print(f"Data saved to: {output_file}")
        print(f"\nSummary:")
        print(f"  Title: {scraped_data['title']}")
        print(f"  Headings found: {sum(len(v) for v in scraped_data['headings'].values())}")
        print(f"  Links found: {len(scraped_data['links'])}")
        print(f"  Images found: {len(scraped_data['images'])}")
        print(f"  Scripts found: {len(scraped_data['scripts'])}")
        print(f"  URLs found: {len(scraped_data['urls_in_page'])}")
        print(f"  Text length: {len(scraped_data['text_content'])} characters")
        
        # Also save raw HTML
        html_file = 'scraped_page_selenium.html'
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"  Raw HTML saved to: {html_file}")
        
        return scraped_data
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return None
    finally:
        if driver:
            driver.quit()

if __name__ == '__main__':
    scrape_flowus_tech_with_selenium()


