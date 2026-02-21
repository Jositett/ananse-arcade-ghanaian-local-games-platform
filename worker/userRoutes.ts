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
            playerCount: 1,
            lastActionTimestamp: Date.now(),
            updatedAt: Date.now()
        };
        const data = await stub.createGameSession(session) as GameSession;
        return c.json({ success: true, data } as ApiResponse<GameSession>);
    });
    app.get('/api/games/:id', async (c) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getGameSession(id) as GameSession | undefined;
        if (!data) return c.json({ success: false, error: 'Room not found' } as ApiResponse<never>, 404);
        return c.json({ success: true, data } as ApiResponse<GameSession>);
    });
    app.post('/api/games/:id/join', async (c) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const session = await stub.getGameSession(id) as GameSession | undefined;
        if (!session) return c.json({ success: false, error: 'Room not found' } as ApiResponse<never>, 404);
        const updatedSession: GameSession = {
            ...session,
            playerCount: (session.playerCount || 1) + 1,
            updatedAt: Date.now()
        };
        await stub.createGameSession(updatedSession);
        return c.json({ success: true, data: updatedSession } as ApiResponse<GameSession>);
    });
    app.post('/api/games/:id/sync', async (c) => {
        const id = c.req.param('id');
        const body = await c.req.json() as { state: any };
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.updateGameSession(id, body.state) as GameSession;
        return c.json({ success: true, data } as ApiResponse<GameSession>);
    });
    // Demo Endpoints
    app.get('/api/demo', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getDemoItems() as DemoItem[];
        return c.json({ success: true, data } as ApiResponse<DemoItem[]>);
    });
}