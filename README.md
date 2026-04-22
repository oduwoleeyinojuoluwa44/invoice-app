# Invoice App

React + TypeScript invoice management app with `localStorage` persistence.

## Stack

- React
- TypeScript
- Vite
- LocalStorage for data persistence

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## How Data Is Stored

Invoices are seeded from the bundled Figma-style data on first load and then saved in `localStorage` under the `invoice-app-invoices` key.

This means:

- creating an invoice updates browser storage immediately
- editing an invoice persists after refresh
- deleting an invoice removes it from storage
- marking an invoice as paid updates the saved record

## Project Structure

- `src/pages/dashboard` - invoice list and filtering
- `src/pages/invoice` - invoice detail page
- `src/components/offCanvas` - create and edit invoice drawers
- `src/components/modal` - delete confirmation modal
- `src/services/storage` - localStorage-backed invoice CRUD
- `src/services/api` - thin compatibility wrappers around storage access

## Deployment

This app is ready for static hosting on Vercel or Netlify.

### Vercel

1. Push the repository to GitHub.
2. Import the repo in Vercel.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist`.
5. Deploy.

## Notes

- The app keeps the original visual design and routing structure from the starter repo.
- Theme preference is also persisted locally.
- No backend or external API is required.
