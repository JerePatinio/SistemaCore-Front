# SistemaCore-Front

Angular (standalone components, signals) client for the SistemaCore-Back task API.

## Run

```bash
npm install
npm start                  # ng serve on http://localhost:4200
```

`/api` is proxied to `http://localhost:8080` (see `proxy.conf.json`), so start SistemaCore-Back first.

## Pages

- `/` Dashboard: totals, completion rate, tasks by category, priority and status.
- `/board` Kanban board with drag and drop (Angular CDK). Moves are applied optimistically and reverted with an error message if the API call fails.
- `/tasks` Task list with filters, create, edit, delete.
- `/categories` Category management.
