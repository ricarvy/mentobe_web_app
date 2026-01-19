import json
import urllib.request
import urllib.parse

def fetch_json(url):
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode())

def get_files(path):
    url = f"https://api.github.com/repos/ricarvy/tarot_source/contents/{path}?ref=main"
    data = fetch_json(url)
    if isinstance(data, list):
        return [item for item in data if item.get('type') == 'file']
    return []

def main():
    print("Fetching Major Arcana images...")
    major_files = get_files('result/Major')
    print(f"Found {len(major_files)} Major Arcana images")

    print("Fetching Minor Arcana images...")
    minor_files = get_files('result/Minor')
    print(f"Found {len(minor_files)} Minor Arcana images")

    all_files = major_files + minor_files
    image_data = {}

    for file in all_files:
        name = file['name'].replace('.png', '')
        image_data[name] = file['download_url']

    output_path = '/tmp/tarot-image-urls.json'
    with open(output_path, 'w') as f:
        json.dump(image_data, f, indent=2)

    print(f"\nImage URLs saved to {output_path}")
    print(f"Total images: {len(image_data)}")

    # 输出所有图片名称
    print("\nAll image names:")
    for name in sorted(image_data.keys()):
        print(f"  {name}")

if __name__ == "__main__":
    main()
