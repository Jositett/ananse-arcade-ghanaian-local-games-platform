import { DurableObject } from "cloudflare:workers";
import type { DemoItem, GameSession } from '@shared/types';
import { MOCK_ITEMS } from '@shared/mock-data';
export class GlobalDurableObject extends DurableObject {
    // Demo Methods
    async getCounterValue(): Promise<number> {
      const value = (await this.ctx.storage.get("counter_value")) || 0;
      return value as number;
    }
    async increment(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value += amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async getDemoItems(): Promise<DemoItem[]> {
      const items = await this.ctx.storage.get("demo_items");
      if (items) return items as DemoItem[];
      await this.ctx.storage.put("demo_items", MOCK_ITEMS);
      return MOCK_ITEMS;
    }
    async addDemoItem(item: DemoItem): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = [...items, item];
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    async updateDemoItem(id: string, updates: Partial<Omit<DemoItem, 'id'>>): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = items.map(item => item.id === id ? { ...item, ...updates } : item);
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    async deleteDemoItem(id: string): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = items.filter(item => item.id !== id);
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    // Phase 2: Online Multiplayer Logic
    async createGameSession(session: GameSession): Promise<GameSession> {
      await this.ctx.storage.put(`session_${session.id}`, session);
      return session;
    }
    async getGameSession(id: string): Promise<GameSession | undefined> {
      return await this.ctx.storage.get(`session_${id}`);
    }
    async updateGameSession(id: string, state: any): Promise<GameSession> {
      const session = await this.getGameSession(id);
      if (!session) throw new Error("Session not found");
      const updated = { ...session, state, updatedAt: Date.now() };
      await this.ctx.storage.put(`session_${id}`, updated);
      return updated;
    }
}