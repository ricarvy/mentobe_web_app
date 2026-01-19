import { SearchClient, Config } from 'coze-coding-dev-sdk';

async function scrapeTarotCards() {
  try {
    console.log('Starting to search tarot cards data...');

    const config = new Config();
    const client = new SearchClient(config);

    // 搜索塔罗牌相关的网站
    const response = await client.advancedSearch('fatemaster.ai tarot cards complete deck images meanings', {
      searchType: 'web',
      count: 10,
      needContent: true,
      needUrl: true,
      sites: 'fatemaster.ai',
      needSummary: true
    });

    console.log('Search results:', response.web_items?.length);

    if (response.web_items && response.web_items.length > 0) {
      for (const item of response.web_items) {
        console.log('\n=== Result ===');
        console.log('Title:', item.title);
        console.log('URL:', item.url);
        console.log('Summary:', item.summary?.substring(0, 500));

        if (item.content) {
          console.log('Content preview:', item.content.substring(0, 1000));

          // 尝试提取塔罗牌数据
          // 这里需要根据实际的HTML结构来解析
          // 由于我们需要具体的图片URL和牌的信息，可能需要更复杂的解析逻辑
        }
      }
    }

    return response;
  } catch (error) {
    console.error('Error scraping tarot cards:', error);
    throw error;
  }
}

// 运行脚本
scrapeTarotCards()
  .then(() => {
    console.log('Scraping completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Scraping failed:', error);
    process.exit(1);
  });
