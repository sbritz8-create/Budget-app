let transactions = JSON.parse(localStorage.getItem("tx")) || [];
let goals = JSON.parse(localStorage.getItem("goals")) || [];

let rate = 18; // fallback

// Fetch live exchange rate
fetch("https://api.exchangerate-api.com/v4/latest/USD")
  .then(res => res.json())
  .then(data => rate = data.rates.ZAR)
  .catch(() => console.log("Using fallback rate"));

function save() {
  localStorage.setItem("tx", JSON.stringify(transactions));
  localStorage.setItem("goals", JSON.stringify(goals));
}

function addTransaction() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const currency = document.getElementById("currency").value;

  if (!desc || !amount) return alert("Fill all fields");

  transactions.push({
    id: Date.now(),
    desc,
    amount,
    currency
  });

  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";

  save();
  render();
}

function deleteTx(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  save();
  render();
}

function addGoal() {
  const name = prompt("Goal name:");
  const target = parseFloat(prompt("Target amount:"));

  if (!name || !target) return;

  goals.push({
    id: Date.now(),
    name,
    target,
    saved: 0
  });

  save();
  render();
}

function addToGoal(id) {
  const value = parseFloat(prompt("Add amount:"));
  if (!value) return;

  goals = goals.map(g =>
    g.id === id ? { ...g, saved: g.saved + value } : g
  );

  save();
  render();
}

function convertToUSD(amount, currency) {
  return currency === "USD" ? amount : amount / rate;
}

function render() {
  const list = document.getElementById("list");
  const goalsEl = document.getElementById("goals");
  const totalEl = document.getElementById("total");

  list.innerHTML = "";
  goalsEl.innerHTML = "";

  let total = 0;

  transactions.forEach(tx => {
    const usd = convertToUSD(tx.amount, tx.currency);
    total += usd;

    const div = document.createElement("div");
    div.className = "transaction";
    div.innerHTML = `
      <span>${tx.desc} (${tx.amount} ${tx.currency})</span>
      <button onclick="deleteTx(${tx.id})">❌</button>
    `;
    list.appendChild(div);
  });

  goals.forEach(g => {
    const percent = Math.min((g.saved / g.target) * 100, 100);

    const div = document.createElement("div");
    div.className = "goal";
    div.innerHTML = `
      <strong>${g.name}</strong><br>
      ${g.saved}/${g.target}
      <div style="background:#334155; border-radius:6px; overflow:hidden;">
        <div style="width:${percent}%; background:#22c55e; height:8px;"></div>
      </div>
      <button onclick="addToGoal(${g.id})">+ Save</button>
    `;
    goalsEl.appendChild(div);
  });

  totalEl.innerText = total.toFixed(2);
}

render();
