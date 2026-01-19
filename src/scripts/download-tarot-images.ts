import { S3Storage } from 'coze-coding-dev-sdk';
import { allTarotCards } from '../lib/tarot-cards';
import * as https from 'https';
import * as http from 'http';

/**
 * 从URL下载图片
 */
async function downloadImage(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.error(`Failed to download ${url}: Status ${res.statusCode}`);
        resolve(null);
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    }).on('error', (err) => {
      console.error(`Error downloading ${url}:`, err.message);
      resolve(null);
    });
  });
}

/**
 * 下载并上传塔罗牌图片到对象存储
 */
async function downloadAndUploadTarotImages() {
  try {
    console.log('Starting tarot cards image download...');

    // 初始化对象存储
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    let successCount = 0;
    let failCount = 0;
    const results: { id: number; name: string; success: boolean; key?: string }[] = [];

    for (const card of allTarotCards) {
      console.log(`\nProcessing card ${card.id}: ${card.nameEn}`);

      if (!card.imageUrl) {
        console.log(`  No image URL for card ${card.id}`);
        failCount++;
        results.push({ id: card.id, name: card.name, success: false });
        continue;
      }

      try {
        // 下载图片
        console.log(`  Downloading from: ${card.imageUrl}`);
        const imageBuffer = await downloadImage(card.imageUrl);

        if (!imageBuffer) {
          console.log(`  Failed to download image for card ${card.id}`);
          failCount++;
          results.push({ id: card.id, name: card.name, success: false });
          continue;
        }

        console.log(`  Downloaded ${imageBuffer.length} bytes`);

        // 上传到对象存储
        const fileName = `tarot-cards/${card.id}-${card.nameEn.toLowerCase().replace(/\s+/g, '-')}.jpg`;
        console.log(`  Uploading as: ${fileName}`);

        const key = await storage.uploadFile({
          fileContent: imageBuffer,
          fileName: fileName,
          contentType: 'image/jpeg',
        });

        console.log(`  Uploaded successfully. Key: ${key}`);
        successCount++;
        results.push({ id: card.id, name: card.name, success: true, key });
      } catch (error) {
        console.error(`  Error processing card ${card.id}:`, error);
        failCount++;
        results.push({ id: card.id, name: card.name, success: false });
      }

      // 添加延迟以避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 输出结果摘要
    console.log('\n=== Download Summary ===');
    console.log(`Total cards: ${allTarotCards.length}`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log('\n=== Results ===');
    results.forEach(result => {
      console.log(`${result.id}. ${result.name}: ${result.success ? '✓' : '✗'}`);
      if (result.success && result.key) {
        console.log(`   Key: ${result.key}`);
      }
    });

    // 生成映射配置
    console.log('\n=== Configuration ===');
    const mapping: { [key: number]: string } = {};
    results.forEach(result => {
      if (result.success && result.key) {
        mapping[result.id] = result.key;
      }
    });
    console.log(JSON.stringify(mapping, null, 2));

  } catch (error) {
    console.error('Error in downloadAndUploadTarotImages:', error);
    throw error;
  }
}

// 运行脚本
downloadAndUploadTarotImages()
  .then(() => {
    console.log('\nDownload completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nDownload failed:', error);
    process.exit(1);
  });
