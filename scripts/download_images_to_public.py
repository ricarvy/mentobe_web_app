import os
import json
import urllib.request
import time
import ssl

# Create unverified context to bypass SSL errors
ssl_context = ssl._create_unverified_context()

BASE_URL = "https://api.github.com/repos/ricarvy/tarot_source/contents"
PUBLIC_DIR = "public/tarot-cards/result"

def fetch_json(url):
    try:
        with urllib.request.urlopen(url, context=ssl_context) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []

def download_file(url, path):
    try:
        with urllib.request.urlopen(url, context=ssl_context) as response, open(path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded: {path}")
    except Exception as e:
        print(f"Error downloading {url} to {path}: {e}")

def process_folder(folder_name):
    print(f"Processing {folder_name}...")
    target_dir = os.path.join(PUBLIC_DIR, folder_name)
    os.makedirs(target_dir, exist_ok=True)
    
    url = f"{BASE_URL}/result/{folder_name}?ref=main"
    files = fetch_json(url)
    
    for item in files:
        if item.get('type') == 'file' and item['name'].endswith('.png'):
            download_url = item['download_url']
            file_path = os.path.join(target_dir, item['name'])
            if not os.path.exists(file_path):
                download_file(download_url, file_path)
                time.sleep(0.2) # Be nice to GitHub
            else:
                print(f"Skipping existing: {file_path}")

def main():
    process_folder('Major')
    process_folder('Minor')

if __name__ == "__main__":
    main()
