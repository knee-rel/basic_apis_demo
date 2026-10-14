// =====================================================================
// ShipShape API — the "kitchen" behind the storefront page.
//
//   GET  /api/products        list every product          (Browse)
//   GET  /api/products/:sku   one product by its SKU      (Select)
//   POST /api/orders          save an order               (Confirm + Save)
//   GET  /api/orders/:id      read one saved order back
//   GET  /api/orders          list every saved order
//
// Run it:  npm install   then   npm start   →  http://localhost:4000
// =====================================================================
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json()); // lets the server read a JSON request body
app.use(express.static(path.join(__dirname, "public"))); // serves the page

// ---- The data (same SKU objects as data/products.js in the Git build) ------
// It lives in memory: restart the server and every order is gone.
const products = [
  { sku: "0091", name: "Mailer Box (S)",        price: 25,  qty: 3,  emoji: "📦" },
  { sku: "0092", name: "Mailer Box (L)",        price: 40,  qty: 12, emoji: "📦" },
  { sku: "0093", name: "Bubble Wrap Roll",      price: 350, qty: 8,  emoji: "🫧" },
  { sku: "0094", name: "Packing Tape (3-pack)", price: 120, qty: 40, emoji: "📼" },
  { sku: "0095", name: "Kraft Paper Roll",      price: 180, qty: 0,  emoji: "📜" },
];
const orders = [];

// ---- GET: read ------------------------------------------------------------
app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:sku", (req, res) => {
  const product = products.find((p) => p.sku === req.params.sku);
  if (!product) {
    return res.status(404).json({ error: "No product with SKU " + req.params.sku });
  }
  res.json(product);
});

// ---- POST: create ---------------------------------------------------------
// Expects a JSON body:  { "customerName": "Ana Cruz", "sku": "0093", "quantity": 2 }
app.post("/api/orders", (req, res) => {
  const { customerName, sku, quantity } = req.body || {};

  // 1. Never trust the browser: check the body before using it.
  if (!customerName || !sku || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: "Send customerName, sku and a quantity of 1 or more." });
  }

  const product = products.find((p) => p.sku === sku);
  if (!product) {
    return res.status(404).json({ error: "No product with SKU " + sku });
  }
  if (quantity > product.qty) {
    return res.status(409).json({ error: "Only " + product.qty + " left of " + product.name });
  }

  // 2. The server computes the total. The browser never sends a price.
  const order = {
    id: orders.length + 1,
    customerName,
    sku,
    name: product.name,
    quantity,
    total: product.price * quantity,
    createdAt: new Date().toISOString(),
  };

  // 3. Saving changes something: stock goes down.
  product.qty -= quantity;
  orders.push(order);

  res.status(201).json(order);
});

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.get("/api/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) {
    return res.status(404).json({ error: "No order with id " + req.params.id });
  }
  res.json(order);
});

// A body that is not valid JSON (a missing quote, a trailing comma) lands here.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "The request body is not valid JSON." });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log("ShipShape API running at http://localhost:" + PORT);
});
