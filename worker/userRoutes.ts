import { Hono } from "hono";
import { Env } from './core-utils';
import type { GameSession, GameType } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'Ananse Arcade API' }}));
    app.post('/api/games/create', async (c) => {
        const body = await c.req.json() as { gameType: GameType, state: any };
        const id = Math.random().toString(36).substring(2, 8).toUpperCase();
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const cleanState: GameSession['state'] = {
            winner: body.state.winner || null,
            battleLog: body.state.battleLog || [],
            lastActionTimestamp: Date.now(),
        };
        if (body.gameType === 'ludo' && body.state.ludo) {
            cleanState.ludo = body.state.ludo;
        } else if (body.gameType === 'oware' && body.state.oware) {
            cleanState.oware = {
                ...body.state.oware,
                captured: [body.state.oware.captured[0] || 0, body.state.oware.captured[1] || 0]
            };
        }
        const session: GameSession = {
            id,
            gameType: body.gameType,
            status: 'playing',
            state: cleanState,
            playerCount: 1,
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
        const cleanState: GameSession['state'] = {
            winner: body.state.winner,
            battleLog: body.state.battleLog,
            lastActionTimestamp: Date.now(),
        };
        if (body.state.ludo) cleanState.ludo = body.state.ludo;
        if (body.state.oware) {
            cleanState.oware = {
                ...body.state.oware,
                captured: [body.state.oware.captured[0] || 0, body.state.oware.captured[1] || 0]
            };
        }
        const result = await stub.updateGameSession(id, cleanState);
        return c.json({ success: true, data: result });
    });
    app.get('/api/demo', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const items = await stub.getDemoItems();
        return c.json({ success: true, data: items });
    });
}