#!/usr/bin/env python3
"""
Web scraper for https://flowus.tech/
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import sys

def scrape_flowus_tech():
    """Scrape content from flowus.tech website"""
    url = "https://flowus.tech/"
    
    # Headers to mimic a real browser request
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
    }
    
    try:
        print(f"Fetching {url}...")
        response = requests.get(url, headers=headers, timeout=30, verify=True)
        response.raise_for_status()
        
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract various elements
        scraped_data = {
            'url': url,
            'timestamp': datetime.now().isoformat(),
            'status_code': response.status_code,
            'title': soup.title.string if soup.title else 'No title found',
            'meta_description': '',
            'meta_keywords': '',
            'headings': {},
            'links': [],
            'images': [],
            'text_content': '',
            'scripts': [],
            'stylesheets': [],
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
            scraped_data['links'].append({
                'text': link.get_text(strip=True),
                'href': link['href'],
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
        for script in soup(['script', 'style']):
            script.decompose()
        
        scraped_data['text_content'] = soup.get_text(separator='\n', strip=True)
        
        # Save to JSON file
        output_file = 'scraped_data.json'
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
        print(f"  Text length: {len(scraped_data['text_content'])} characters")
        
        # Also save raw HTML
        html_file = 'scraped_page.html'
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        print(f"  Raw HTML saved to: {html_file}")
        
        return scraped_data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching the website: {e}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Error processing the website: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    scrape_flowus_tech()


