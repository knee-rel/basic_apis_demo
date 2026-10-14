// =====================================================================
// ShipShape page — Fetch → Transform → Render.
//
//   loadProducts()  GET  /api/products      → render the cards
//   placeOrder()    POST /api/orders        → save, then
//                   GET  /api/orders/:id    → read the saved order back
//
// Watch every request in DevTools → Network (filter: Fetch/XHR).
// =====================================================================

const grid = document.querySelector("#productGrid");
const statusLine = document.querySelector("#status");
const confirmation = document.querySelector("#confirmation");
const nameInput = document.querySelector("#customerName");

// "₱1,234.00"
function formatPeso(amount) {
  return "₱" + Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function renderProductCard(p) {
  const soldOut = p.qty === 0;
  return `
    <article class="card" data-sku="${p.sku}">
      <div class="emoji" aria-hidden="true">${p.emoji}</div>
      <h3>${p.name}</h3>
      <p class="stock">${soldOut ? "Out of stock" : p.qty + " in stock"}</p>
      <p class="price">${formatPeso(p.price)}</p>
      <input class="quantity" type="number" min="1" value="1" aria-label="Quantity" ${soldOut ? "disabled" : ""}>
      <button class="btn order" ${soldOut ? "disabled" : ""}>Order</button>
    </article>`;
}

// ---- GET: load the catalog -------------------------------------------------
async function loadProducts() {
  statusLine.textContent = "Loading products…"; // state 1: loading

  try {
    const res = await fetch("/api/products");
    if (!res.ok) {
      // fetch does NOT throw on 404 or 500, so we check ourselves
      throw new Error("Server answered " + res.status);
    }
    const products = await res.json();

    if (products.length === 0) {
      statusLine.textContent = "No products yet."; // state 2: empty
      grid.innerHTML = "";
      return;
    }

    statusLine.textContent = "";
    grid.innerHTML = products.map(renderProductCard).join("");
  } catch (err) {
    statusLine.textContent = "Products unavailable. Please retry."; // state 3: error
    console.error("loadProducts failed:", err);
  }
}

// ---- POST: save an order ---------------------------------------------------
async function placeOrder(sku, quantity) {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: nameInput.value, sku, quantity }),
    });
    const data = await res.json();

    if (!res.ok) {
      statusLine.textContent = data.error; // the server's own message (400, 404, 409)
      return;
    }

    // Read the order back by its id: proof that the server saved it.
    const saved = await fetch("/api/orders/" + data.id).then((r) => r.json());
    confirmation.hidden = false;
    confirmation.innerHTML = `
      <h2>Order #${saved.id} saved</h2>
      <p>${saved.quantity} × ${saved.name} for ${saved.customerName}</p>
      <p class="price">Total: ${formatPeso(saved.total)}</p>`;

    loadProducts(); // stock changed on the server, so fetch the list again
  } catch (err) {
    // The request never got an answer: server stopped, or no connection.
    statusLine.textContent = "Order not sent. Check your connection and retry.";
    console.error("placeOrder failed:", err);
  }
}

// One listener on the grid handles every Order button (event delegation).
grid.addEventListener("click", (event) => {
  if (!event.target.matches(".order")) return;

  const card = event.target.closest(".card");
  const quantity = Number(card.querySelector(".quantity").value);
  placeOrder(card.dataset.sku, quantity);
});

loadProducts();
