import { Hono } from "hono";
import { Env } from './core-utils';
import type { GameSession, GameType } from '@shared/types';
export function userRoutes(app: any) {
    app.get('/api/test', (c: any) => c.json({ success: true, data: { name: 'Ananse Arcade API' }}));
    app.post('/api/games/create', async (c: any) => {
        const body = await c.req.json() as { gameType: GameType, state: any };
        const id = Math.random().toString(36).substring(2, 8).toUpperCase();
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const session: GameSession = {
            id,
            gameType: body.gameType,
            status: 'playing',
            state: body.state,
            playerCount: 1,
            lastActionTimestamp: Date.now(),
            updatedAt: Date.now()
        };
        const result = await stub.createGameSession(session);
        return c.json({ success: true, data: result } as any);
    });
    app.get('/api/games/:id', async (c: any) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const result = await stub.getGameSession(id);
        if (!result) return c.json({ success: false, error: 'Room not found' } as any, 404);
        return c.json({ success: true, data: result } as any);
    });
    app.post('/api/games/:id/join', async (c: any) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const session = await stub.getGameSession(id);
        if (!session) return c.json({ success: false, error: 'Room not found' } as any, 404);
        const updatedSession = { ...session, playerCount: (session.playerCount || 1) + 1, updatedAt: Date.now() };
        const result = await stub.createGameSession(updatedSession);
        return c.json({ success: true, data: result } as any);
    });
    app.post('/api/games/:id/sync', async (c: any) => {
        const id = c.req.param('id');
        const body = await c.req.json() as { state: any };
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const result = await stub.updateGameSession(id, body.state);
        return c.json({ success: true, data: result } as any);
    });
    app.get('/api/demo', async (c: any) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const items = await stub.getDemoItems();
        return c.json({ success: true, data: items } as any);
    });
}