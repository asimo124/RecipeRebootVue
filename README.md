# Recipe Book Frontend (Vue)

Vue 3 + Vite SPA for the Recipe Book. Talks to the Laravel API in `recipes_laravel`.

## Pages

- `/recipes` — recipe CRUD + ingredient manager
- `/inventory` — pantry inventory
- `/proteins` — protein lookup CRUD
- `/meal-styles` — meal style lookup CRUD

## Setup

```bash
npm install
cp .env.example .env   # optional; defaults to http://localhost:8080/api
npm run dev
```

Open **http://127.0.0.1:5173/** — you’ll be redirected to `/login`.

Default login (from Laravel `.env`):

- Email: `alex@recipes.local`
- Password: `recipes`

Ensure the Laravel API is running (`docker compose up` in `recipes_laravel`).

## Env

```
VITE_API_URL=http://localhost:8080/api
```

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
# RecipeRebootVue
