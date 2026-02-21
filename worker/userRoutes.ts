import { Hono } from "hono";
import { Env } from './core-utils';
import type { GameSession, GameType } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'Ananse Arcade API' }}));
    app.post('/api/games/create', async (c) => {
        const body = await c.req.json() as { gameType: GameType, state: any };
        const id = Math.random().toString(36).substring(2, 8).toUpperCase();
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        // Ensure state is correctly shaped for the storage
        const cleanState = {
            ...body.state,
            oware: body.state.oware ? {
                ...body.state.oware,
                captured: body.state.oware.captured as [number, number]
            } : undefined
        };
        const session: GameSession = {
            id,
            gameType: body.gameType,
            status: 'playing',
            state: cleanState,
            playerCount: 1,
            lastActionTimestamp: Date.now(),
            updatedAt: Date.now()
        };
        const result = await stub.createGameSession(session);
        return c.json({ success: true, data: result });
    });
    app.get('/api/games/:id', async (c) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const result = await stub.getGameSession(id);
        if (!result) return c.json({ success: false, error: 'Room not found' }, 404);
        return c.json({
            success: true,
            data: { ...result, serverTime: Date.now() }
        });
    });
    app.post('/api/games/:id/join', async (c) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const session = await stub.getGameSession(id);
        if (!session) return c.json({ success: false, error: 'Room not found' }, 404);
        const updatedSession: GameSession = {
            ...session,
            playerCount: (session.playerCount || 1) + 1,
            updatedAt: Date.now()
        };
        const result = await stub.createGameSession(updatedSession);
        return c.json({ success: true, data: result });
    });
    app.post('/api/games/:id/sync', async (c) => {
        const id = c.req.param('id');
        const body = await c.req.json() as { state: any };
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        // Final sanity check on types before DO storage
        const cleanState = {
            ...body.state,
            oware: body.state.oware ? {
                ...body.state.oware,
                captured: body.state.oware.captured as [number, number]
            } : undefined
        };
        const result = await stub.updateGameSession(id, cleanState);
        return c.json({ success: true, data: result });
    });
    app.get('/api/demo', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const items = await stub.getDemoItems();
        return c.json({ success: true, data: items });
    });
}