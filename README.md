# ShipShape API demo — ITMGT 45.03, Oct 14

A small Express server and one page that calls it with `fetch`. It is the Git-build storefront with the hardcoded product file replaced by an API.

## Run it

You need Node.js installed (`node --version` should print a version number).

```bash
npm install
```

```bash
npm start
```

Then open **http://localhost:4000**. Stop the server with `Ctrl + C`.

If port 4000 is taken, run `PORT=4001 npm start` (PowerShell: `$env:PORT=4001; npm start`).

## Routes

| Method | Route | What it does | Success | Errors |
|---|---|---|:-:|---|
| GET | `/api/products` | List every product | 200 | |
| GET | `/api/products/:sku` | One product, e.g. `/api/products/0093` | 200 | 404 unknown SKU |
| POST | `/api/orders` | Save an order | 201 | 400 bad body · 404 unknown SKU · 409 not enough stock |
| GET | `/api/orders/:id` | Read one saved order back | 200 | 404 unknown id |
| GET | `/api/orders` | List every saved order | 200 | |

Body for `POST /api/orders`:

```json
{ "customerName": "Ana Cruz", "sku": "0093", "quantity": 2 }
```

## Files

```
server.js          the API: data, routes, validation
public/index.html  the page
public/app.js      fetch → render, and the Order button
public/styles.css
```

## What is missing on purpose

The products and orders live in the server's memory. **Restart the server and every order is gone, and stock resets.** A real store needs a database, which is the next step.
