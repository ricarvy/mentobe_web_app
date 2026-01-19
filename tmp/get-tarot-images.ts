import { writeFileSync } from 'fs';
import https from 'https';

interface GitHubFile {
  name: string;
  download_url: string;
}

async function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getFiles(path: string): Promise<GitHubFile[]> {
  const url = `https://api.github.com/repos/ricarvy/tarot_source/contents/${path}?ref=main`;
  const data = await fetchJson(url);

  if (Array.isArray(data)) {
    return data.filter((item: any) => item.type === 'file') as GitHubFile[];
  }
  return [];
}

async function main() {
  console.log('Fetching Major Arcana images...');
  const majorFiles = await getFiles('result/Major');
  console.log(`Found ${majorFiles.length} Major Arcana images`);

  console.log('Fetching Minor Arcana images...');
  const minorFiles = await getFiles('result/Minor');
  console.log(`Found ${minorFiles.length} Minor Arcana images`);

  const allFiles = [...majorFiles, ...minorFiles];
  const imageData: Record<string, string> = {};

  allFiles.forEach(file => {
    const name = file.name.replace('.png', '');
    imageData[name] = file.download_url;
  });

  const outputPath = '/tmp/tarot-image-urls.json';
  writeFileSync(outputPath, JSON.stringify(imageData, null, 2));
  console.log(`\nImage URLs saved to ${outputPath}`);
  console.log(`Total images: ${Object.keys(imageData).length}`);
}

main().catch(console.error);
