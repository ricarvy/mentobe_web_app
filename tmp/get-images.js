import https from 'node:https';
import fs from 'node:fs';

function fetchJson(url) {
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

async function getFiles(path) {
  const url = `https://api.github.com/repos/ricarvy/tarot_source/contents/${path}?ref=main`;
  const data = await fetchJson(url);

  if (Array.isArray(data)) {
    return data.filter(item => item.type === 'file');
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
  const imageData = {};

  allFiles.forEach(file => {
    const name = file.name.replace('.png', '');
    imageData[name] = file.download_url;
  });

  const outputPath = '/tmp/tarot-image-urls.json';
  fs.writeFileSync(outputPath, JSON.stringify(imageData, null, 2));
  console.log(`\nImage URLs saved to ${outputPath}`);
  console.log(`Total images: ${Object.keys(imageData).length}`);

  // 输出前10个作为示例
  console.log('\nSample images:');
  Object.keys(imageData).slice(0, 10).forEach(key => {
    console.log(`  ${key}: ${imageData[key]}`);
  });
}

main().catch(console.error);
