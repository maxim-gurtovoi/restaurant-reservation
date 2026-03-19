Restaurant Reservation System
1. Scopul proiectului

Scopul acestui proiect este dezvoltarea unui sistem informațional web pentru gestionarea rezervărilor în restaurante. Sistemul permite utilizatorilor să vizualizeze restaurante, să selecteze mese pe baza unui plan interactiv al sălii și să creeze rezervări în timp real, cu verificarea disponibilității.

De asemenea, sistemul include funcționalități pentru personalul restaurantului, precum confirmarea rezervărilor prin scanarea unui cod QR și gestionarea rezervărilor existente.

2. Tehnologii și instrumente utilizate
Frontend:

Next.js (App Router)

React

TypeScript

Tailwind CSS

Backend:

Next.js Server Components & API Routes

Node.js

Bază de date:

PostgreSQL

Prisma ORM

Alte tehnologii:

JWT (autentificare)

QR code (pentru confirmarea rezervărilor și check-in)

Docker (opțional, pentru rulare)

3. Instrucțiuni de rulare

Clonarea repository-ului:

git clone <repository_url>
cd project-folder

Instalarea dependențelor:

npm install

Configurarea fișierului .env:

NEXT_PUBLIC_APP_URL=http://localhost:3000

Migrarea bazei de date:

npx prisma migrate dev

Pornirea aplicației:

npm run dev

Aplicația va fi disponibilă la:

http://localhost:3000
4. Structura aplicației

Proiectul este organizat conform unei arhitecturi de tip modular (feature-based):

src/app/ — rutele aplicației (Next.js App Router)

src/features/ — module funcționale (restaurants, reservations, manager etc.)

src/components/ — componente UI reutilizabile

src/lib/ — utilitare și configurări (Prisma, auth, helpers)

src/server/ — logică server-side comună

prisma/ — schema bazei de date și migrații

5. Funcționalități principale

Vizualizarea restaurantelor disponibile

Selectarea meselor pe planul sălii

Verificarea disponibilității în timp real

Crearea rezervărilor

Vizualizarea rezervărilor utilizatorului

Anularea rezervărilor

Generarea codului QR pentru fiecare rezervare

Check-in realizat de manager prin scanarea codului QR

Panou manager pentru vizualizarea rezervărilor

## Demo credentials (local seed)

After running `npm run db:seed`, you can log in with:

- **Shared password**: `Demo12345!`
- **Manager**: `manager.alice@example.com`
- **Regular user**: `bob@example.com`
- **Admin (optional)**: `admin@example.com`

6. Perspective de dezvoltare

Integrarea notificărilor (email/SMS)

Sistem de recenzii pentru restaurante

Integrarea plăților online

Suport pentru mai multe limbi

Optimizarea experienței mobile




































This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
