const { getDb } = require('./src/storage/database/shared/db');
const { tarotInterpretations } = require('./src/storage/database/shared/schema');
const { desc } = require('drizzle-orm');

async function checkData() {
  const db = await getDb();
  const records = await db
    .select()
    .from(tarotInterpretations)
    .limit(5);

  console.log('Total records:', records.length);
  if (records.length > 0) {
    const first = records[0];
    console.log('First record:');
    console.log('- ID:', first.id);
    console.log('- userId:', first.userId);
    console.log('- question:', first.question);
    console.log('- spreadType:', first.spreadType);
    console.log('- interpretation length:', first.interpretation?.length || 0);
    console.log('- interpretation preview:', first.interpretation?.substring(0, 100) || 'N/A');
    console.log('- cards length:', first.cards?.length || 0);
  }
}

checkData().catch(console.error);
