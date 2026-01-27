import { eq, and, desc, sql } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';
import { tarotInterpretations, insertTarotInterpretationSchema, type TarotInterpretation, type InsertTarotInterpretation } from './shared/schema';

export class TarotInterpretationManager {
  async createInterpretation(data: InsertTarotInterpretation): Promise<TarotInterpretation> {
    const db = await getDb();
    const validated = insertTarotInterpretationSchema.parse(data);
    const [interpretation] = await db.insert(tarotInterpretations).values(validated).returning();
    return interpretation;
  }

  async updateInterpretation(id: string, interpretation: string): Promise<void> {
    const db = await getDb();
    await db
      .update(tarotInterpretations)
      .set({ interpretation })
      .where(eq(tarotInterpretations.id, id));
  }

  async getInterpretationsByUserId(userId: string, limit: number = 10): Promise<TarotInterpretation[]> {
    const db = await getDb();
    return db
      .select()
      .from(tarotInterpretations)
      .where(eq(tarotInterpretations.userId, userId))
      .orderBy(desc(tarotInterpretations.createdAt))
      .limit(limit);
  }

  async getInterpretationById(id: string): Promise<TarotInterpretation | null> {
    const db = await getDb();
    const [interpretation] = await db
      .select()
      .from(tarotInterpretations)
      .where(eq(tarotInterpretations.id, id));
    return interpretation || null;
  }

  async getTodayInterpretationsCount(userId: string): Promise<number> {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(tarotInterpretations)
      .where(
        and(
          eq(tarotInterpretations.userId, userId),
          sql`DATE(${tarotInterpretations.createdAt}) = ${today}`
        )
      );

    return Number(result[0]?.count || 0);
  }
}

export const tarotInterpretationManager = new TarotInterpretationManager();
