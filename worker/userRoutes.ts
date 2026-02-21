import { Hono } from "hono";
import { Env } from './core-utils';
import type { DemoItem, ApiResponse, GameSession, GameType } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'Ananse Arcade API' }}));
    // Online Multiplayer Endpoints
    app.post('/api/games/create', async (c) => {
        const body = await c.req.json() as { gameType: GameType, state: any };
        const id = Math.random().toString(36).substring(2, 8).toUpperCase();
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const session: GameSession = {
            id,
            gameType: body.gameType,
            status: 'playing',
            state: body.state,
            updatedAt: Date.now()
        };
        const data = await stub.createGameSession(session);
        return c.json({ success: true, data } satisfies ApiResponse<GameSession>);
    });
    app.get('/api/games/:id', async (c) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getGameSession(id);
        if (!data) return c.json({ success: false, error: 'Room not found' }, 404);
        return c.json({ success: true, data } satisfies ApiResponse<GameSession>);
    });
    app.post('/api/games/:id/sync', async (c) => {
        const id = c.req.param('id');
        const body = await c.req.json() as { state: any };
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.updateGameSession(id, body.state);
        return c.json({ success: true, data } satisfies ApiResponse<GameSession>);
    });
    // Demo Endpoints
    app.get('/api/demo', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getDemoItems();
        return c.json({ success: true, data } satisfies ApiResponse<DemoItem[]>);
    });
}