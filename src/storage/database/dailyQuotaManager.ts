import { eq, and, sql } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';
import { dailyQuotas, insertDailyQuotaSchema, type DailyQuota, type InsertDailyQuota } from './shared/schema';
import { appConfig } from '@/config';

export class DailyQuotaManager {
  private get MAX_DAILY_INTERPRETATIONS(): number {
    return appConfig.features.dailyQuota.free;
  }

  async getOrCreateQuota(userId: string, date: string): Promise<DailyQuota> {
    const db = await getDb();
    const [quota] = await db
      .select()
      .from(dailyQuotas)
      .where(and(eq(dailyQuotas.userId, userId), eq(dailyQuotas.date, date)));

    if (quota) {
      return quota;
    }

    const newQuota: InsertDailyQuota = {
      userId,
      date,
      count: 0,
    };
    const validated = insertDailyQuotaSchema.parse(newQuota);
    const [createdQuota] = await db.insert(dailyQuotas).values(validated).returning();
    return createdQuota;
  }

  async incrementQuota(userId: string, date: string): Promise<DailyQuota> {
    const db = await getDb();
    const [quota] = await db
      .update(dailyQuotas)
      .set({
        count: sql`${dailyQuotas.count} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(dailyQuotas.userId, userId), eq(dailyQuotas.date, date)))
      .returning();

    return quota;
  }

  async getRemainingQuota(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const quota = await this.getOrCreateQuota(userId, today);
    return Math.max(0, this.MAX_DAILY_INTERPRETATIONS - quota.count);
  }

  async canInterpret(userId: string): Promise<boolean> {
    const remaining = await this.getRemainingQuota(userId);
    return remaining > 0;
  }

  async useQuota(userId: string): Promise<{ success: boolean; remaining: number }> {
    const today = new Date().toISOString().split('T')[0];
    const remaining = await this.getRemainingQuota(userId);

    if (remaining <= 0) {
      return { success: false, remaining: 0 };
    }

    await this.incrementQuota(userId, today);
    const newRemaining = await this.getRemainingQuota(userId);

    return { success: true, remaining: newRemaining };
  }

  async getTodayQuota(userId: string): Promise<DailyQuota | null> {
    const today = new Date().toISOString().split('T')[0];
    const db = await getDb();
    const [quota] = await db
      .select()
      .from(dailyQuotas)
      .where(and(eq(dailyQuotas.userId, userId), eq(dailyQuotas.date, today)));

    return quota || null;
  }
}

export const dailyQuotaManager = new DailyQuotaManager();
