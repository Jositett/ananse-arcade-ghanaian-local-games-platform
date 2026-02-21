# Cloudflare Workers React Template

[![[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Jositett/ananse-arcade-ghanaian-local-games-platform)]](https://developers.cloudflare.com/workers/)

A production-ready full-stack template for Cloudflare Workers with React frontend, Hono backend, Durable Objects for stateful data, Tailwind CSS, shadcn/ui components, and TanStack Query. Perfect for building scalable, edge-deployed applications.

## Features

- **Full-Stack Ready**: React 18 frontend with Vite + Cloudflare Workers backend using Hono.
- **Stateful Storage**: Cloudflare Durable Objects for counters, lists, and persistent data (SQLite-backed).
- **Modern UI**: shadcn/ui with Tailwind CSS, dark mode, responsive design, and animations.
- **API Routes**: Pre-built endpoints for CRUD operations (`/api/demo`, `/api/counter`) with CORS and logging.
- **Type-Safe**: Full TypeScript support across frontend, backend, and shared types.
- **Developer Experience**: Hot reload, error boundaries, TanStack Query caching, theme toggle.
- **Production Optimized**: ES modules, tree-shaking, Cloudflare assets handling for SPA.
- **Extensible**: Easy to add routes in `worker/userRoutes.ts`, pages in `src/pages/`.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS 3, shadcn/ui, Lucide icons, Framer Motion, TanStack Query, React Router, Sonner toasts.
- **Backend**: Hono 4, Cloudflare Workers, Durable Objects (SQLite).
- **Data & Utils**: Zod validation, Immer, Zustand, UUID.
- **Dev Tools**: Bun, TypeScript 5, ESLint, Wrangler.
- **Other**: Radix UI primitives, React Hook Form, Recharts.

## Quick Start

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) (or your configured port).

## Installation

1. **Prerequisites**:
   - [Bun](https://bun.sh/) v1.1+
   - [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/install/) CLI
   - Cloudflare account (free tier works)

2. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd <project-name>
   bun install
   ```

3. **Type Generation** (for Workers env types):
   ```bash
   bun run cf-typegen
   ```

## Development

- **Local Server**: `bun run dev` (frontend on `:3000`, API on same origin).
- **Build**: `bun run build` (outputs to `dist/` for Workers/Pages).
- **Lint**: `bun run lint`.
- **Preview**: `bun run preview`.
- **API Testing**: Routes available at `/api/health`, `/api/demo`, `/api/counter`.
- **Custom Routes**: Add to `worker/userRoutes.ts` and restart dev server.

Hot reload works for both frontend and worker. Durable Objects persist data across restarts.

### Project Structure

```
├── src/              # React app (pages, components, hooks)
├── worker/           # Hono API + Durable Objects (edit userRoutes.ts)
├── shared/           # Shared types & mock data
├── public/           # Static assets
└── wrangler.jsonc    # Cloudflare config
```

## Deployment

Deploy to Cloudflare Workers (free, global edge network):

1. **Login**:
   ```bash
   npx wrangler login
   ```

2. **Configure** (edit `wrangler.jsonc`):
   - Set `name` to your Worker name.
   - Add `account_id` from Cloudflare dashboard.

3. **Deploy**:
   ```bash
   bun run deploy
   ```

Your app will be live at `https://your-worker.your-subdomain.workers.dev`.

[![[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Jositett/ananse-arcade-ghanaian-local-games-platform)]](https://developers.cloudflare.com/workers/)

**Assets/SPA**: Handled automatically – API routes (`/api/*`) proxied to Worker, frontend served as SPA.

## Environment Variables

Add secrets via Wrangler:
```bash
npx wrangler secret put YOUR_SECRET
```

Access in Worker: `env.YOUR_SECRET`.

## Customization

- **Frontend**: Edit `src/pages/HomePage.tsx` or add routes in `src/main.tsx`.
- **Backend**: Extend `worker/userRoutes.ts` or `worker/durableObject.ts`.
- **UI**: Install shadcn components: `bunx shadcn@latest add <component>`.
- **Theme**: Modify `tailwind.config.js` and `src/index.css`.

## Troubleshooting

- **Worker Errors**: Check `wrangler tail` or Cloudflare dashboard logs.
- **CORS Issues**: Pre-configured for `*` on `/api/*`.
- **Types**: Run `bun run cf-typegen` after `wrangler publish`.
- **Bun Issues**: Ensure Bun is up-to-date: `bun upgrade`.

## Contributing

1. Fork the repo.
2. Create a feature branch.
3. Commit changes.
4. Open a PR.

## License

MIT – see [LICENSE](LICENSE) for details.

---

⭐ **Star on GitHub** · 💬 **Issues** · 🐛 **Bugs** · 📖 **Docs**