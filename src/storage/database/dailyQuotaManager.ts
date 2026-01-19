import { eq, and, sql } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';
import { dailyQuotas, insertDailyQuotaSchema, type DailyQuota, type InsertDailyQuota } from './shared/schema';
import { appConfig } from '@/config';
import { DEMO_ACCOUNT } from '@/config/demo-account';

export class DailyQuotaManager {
  private get MAX_DAILY_INTERPRETATIONS(): number {
    return appConfig.features.dailyQuota.free;
  }

  // 检查是否为演示账号
  private isDemoUser(userId: string): boolean {
    return userId === DEMO_ACCOUNT.id;
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
    // 演示账号无限制
    if (this.isDemoUser(userId)) {
      return 999999;
    }

    const today = new Date().toISOString().split('T')[0];
    const quota = await this.getOrCreateQuota(userId, today);
    return Math.max(0, this.MAX_DAILY_INTERPRETATIONS - quota.count);
  }

  async canInterpret(userId: string): Promise<boolean> {
    // 演示账号无限制
    if (this.isDemoUser(userId)) {
      return true;
    }

    const remaining = await this.getRemainingQuota(userId);
    return remaining > 0;
  }

  async useQuota(userId: string): Promise<{ success: boolean; remaining: number }> {
    // 演示账号无限制，不消耗配额
    if (this.isDemoUser(userId)) {
      return { success: true, remaining: 999999 };
    }

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
