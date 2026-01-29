import { eq } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';
import bcrypt from 'bcryptjs';
import { users, insertUserSchema, type User, type InsertUser } from './shared/schema';

export class UserManager {
  async createUser(data: InsertUser): Promise<User> {
    const db = await getDb();
    const validated = insertUserSchema.parse(data);
    
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(validated.password, 10);
    
    const [user] = await db.insert(users).values({
      ...validated,
      password: hashedPassword,
    }).returning();
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | null> {
    const db = await getDb();
    const updateData: Partial<InsertUser> & { updatedAt: Date; password?: string } = { ...data, updatedAt: new Date() };
    
    // Hash password if it's being updated
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      console.log('[UserManager] Verifying password for email:', email);
      const db = await getDb();
      const [user] = await db.select().from(users).where(eq(users.email, email));

      if (!user) {
        console.log('[UserManager] User not found:', email);
        return null;
      }

      console.log('[UserManager] User found, comparing password');
      const isValid = await bcrypt.compare(password, user.password);
      console.log('[UserManager] Password valid:', isValid);

      return isValid ? user : null;
    } catch (error) {
      console.error('[UserManager] Error verifying password:', error);
      console.error('[UserManager] Error stack:', error instanceof Error ? error.stack : 'No stack');
      return null;
    }
  }
}

export const userManager = new UserManager();
