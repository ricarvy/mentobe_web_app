import { pgTable, text, varchar, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createSchemaFactory } from 'drizzle-zod';
import { z } from 'zod';

// 用户表
export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    username: varchar('username', { length: 100 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    usernameIdx: index('users_username_idx').on(table.username),
  })
);

// 塔罗解读记录表
export const tarotInterpretations = pgTable(
  'tarot_interpretations',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar('user_id', { length: 36 }).notNull(),
    question: text('question').notNull(),
    spreadType: varchar('spread_type', { length: 50 }).notNull(),
    cards: text('cards').notNull(), // JSON 字符串存储牌面数据
    interpretation: text('interpretation').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('tarot_interpretations_user_id_idx').on(table.userId),
    createdAtIdx: index('tarot_interpretations_created_at_idx').on(table.createdAt),
  })
);

// 用户每日限额表
export const dailyQuotas = pgTable(
  'daily_quotas',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar('user_id', { length: 36 }).notNull(),
    date: varchar('date', { length: 10 }).notNull(), // 格式: YYYY-MM-DD
    count: integer('count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  (table) => ({
    userIdDateIdx: index('daily_quotas_user_id_date_idx').on(table.userId, table.date),
  })
);

// 使用 createSchemaFactory 配置 date coercion
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// Zod schemas for validation
export const insertUserSchema = createCoercedInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertTarotInterpretationSchema = createCoercedInsertSchema(tarotInterpretations).pick({
  userId: true,
  question: true,
  spreadType: true,
  cards: true,
  interpretation: true,
});

export const insertDailyQuotaSchema = createCoercedInsertSchema(dailyQuotas).pick({
  userId: true,
  date: true,
  count: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TarotInterpretation = typeof tarotInterpretations.$inferSelect;
export type InsertTarotInterpretation = z.infer<typeof insertTarotInterpretationSchema>;

export type DailyQuota = typeof dailyQuotas.$inferSelect;
export type InsertDailyQuota = z.infer<typeof insertDailyQuotaSchema>;
