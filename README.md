# Sakamoto's conversion to modern Node.js + PostgreSQL

This repository keeps the original coffee-shop design and flows while replacing the legacy PHP/MySQL/PHPMailer implementation with a modern Express API backed by PostgreSQL and external email/storage services.

## Architecture

- Frontend: static HTML/CSS/JS served from the `client` folder, designed to stay visually aligned with the original PHP project.
- Backend: Node.js + Express API under `server/`.
- Database: PostgreSQL via `DATABASE_URL`.
- Email: Resend API (or any equivalent transactional provider).
- File storage: Cloudinary/S3-compatible object storage.
- Authentication: secure HTTP-only cookie session using server-side session tokens.

## GitHub Pages compatibility

The frontend can be hosted on GitHub Pages or any static hosting platform. The PHP backend, Node.js server, PostgreSQL database, and email API credentials remain server-side and are not exposed to the browser.

## Conversion map

| PHP file / original use | Original purpose | New location | New API |
| --- | --- | --- | --- |
| `User/index.php` | Protected user portal | `client/` + `server/routes` | `GET /api/products`, `GET /api/auth/me` |
| `User/home.php` | Product landing page | `client/index.html` | `GET /api/products` |
| `User/menu.php` | Category & menu listing | `client/menu.html` | `GET /api/products` |
| `User/cart.php` | Cart management | `client/cart.html` | `GET /api/cart`, `POST /api/cart` |
| `User/orders.php` | User order history | `client/orders.html` | `GET /api/orders` |
| `User/Log-in.php` | Login | `client/login.html` + `server/routes/auth.js` | `POST /api/auth/login` |
| `User/Recover.php` | Password recovery | `server/services/emailService.js` | `POST /api/auth/reset` |
| `User/Forgot.php` | Reset email flow | `client/login.html` + server email service | `POST /api/auth/forgot` |
| `User/Verification.php` | Email verification | `server/services/emailService.js` | `POST /api/auth/verify` |
| `Admin/` pages | Admin dashboard and product management | `client/admin` or protected API routes | `GET /api/admin/**` |
| `sakamoto.sql` | Legacy MySQL schema | `database/schema.sql` | PostgreSQL schema |
| `PHPMailer` usage | Emails | `server/services/emailService.js` | `Resend` API |

## Environment setup

1. Copy `.env.example` to `.env`.
2. Supply a PostgreSQL connection string in `DATABASE_URL`.
3. Add email credentials and file storage credentials if you want email and uploads enabled.
4. Install dependencies:

```bash
npm install
```

5. Create the database and run the schema:

```bash
psql "$DATABASE_URL" -f database/schema.sql
```

6. Start the API:

```bash
npm run dev
```

## Local development

- Frontend served at: `http://localhost:3000/`
- API base URL: `http://localhost:3000/api`
- Health endpoint: `http://localhost:3000/api/health`

## Required external services

- PostgreSQL database provider
- Email API provider such as Resend, SendGrid, or Brevo
- Object storage provider such as Cloudinary or S3-compatible storage

## Data safety

- No secrets are committed to the repository.
- All credentials use environment variables.
- The frontend never receives private API keys.

## Notes

The legacy PHP application was preserved in place for reference. The new system does not delete or replace the original source; it adds the modern Node.js/PostgreSQL equivalent alongside it.
