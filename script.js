// ... existing constants ...
const form = document.getElementById("transaction-form");
const list = document.getElementById("list");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");

const expenseBtn = document.getElementById("type-expense");
const incomeBtn = document.getElementById("type-income");

let transactionType = "expense";
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

/* 🔄 TOGGLE TYPE */
expenseBtn.onclick = () => setType("expense");
incomeBtn.onclick = () => setType("income");

function setType(type) {
    transactionType = type;
    if (type === "expense") {
        expenseBtn.className = "flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold transition-all";
        incomeBtn.className = "flex-1 py-2 rounded-lg text-gray-500 dark:text-gray-400 font-semibold transition-all";
    } else {
        incomeBtn.className = "flex-1 py-2 rounded-lg bg-green-500 text-white font-semibold transition-all";
        expenseBtn.className = "flex-1 py-2 rounded-lg text-gray-500 dark:text-gray-400 font-semibold transition-all";
    }
}

/* ➕ ADD TRANSACTION */
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!categoryInput.value || !amountInput.value || !dateInput.value) {
        alert("Please fill all fields");
        return;
    }

    const amount = transactionType === "expense" ? -Math.abs(amountInput.value) : Math.abs(amountInput.value);

    transactions.push({
        id: Date.now(),
        category: categoryInput.value,
        amount: +amount,
        date: dateInput.value,
    });

    saveAndRender();
    form.reset();
});

/* 🔁 RENDER */
function render() {
    list.innerHTML = "";
    if (transactions.length === 0) {
        list.innerHTML = `<p class="text-center text-gray-400 py-8">No transactions yet.</p>`;
        updateTotals();
        return;
    }

    transactions.forEach(t => {
        const isExpense = t.amount < 0;
        const colorClass = isExpense ? "border-red-500" : "border-green-500";
        const textClass = isExpense ? "text-red-500" : "text-green-500";

        const li = document.createElement("li");
        li.className = `flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 border-l-4 ${colorClass} rounded-2xl transition-all`;

        li.innerHTML = `
            <div class="flex flex-col">
                <span class="font-bold dark:text-white text-gray-800">${t.category}</span>
                <small class="text-gray-400">${t.date}</small>
            </div>
            <span class="font-bold text-lg ${textClass}">${isExpense ? '-' : '+'}₱${Math.abs(t.amount).toFixed(2)}</span>
        `;
        list.appendChild(li);
    });

    updateTotals();
}

function updateTotals() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((a, b) => a + b, 0);
    const income = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0);
    const expense = amounts.filter(a => a < 0).reduce((a, b) => a + b, 0);

    balanceEl.textContent = `₱${total.toFixed(2)}`;
    incomeEl.textContent = `+₱${income.toFixed(2)}`;
    expenseEl.textContent = `-₱${Math.abs(expense).toFixed(2)}`;
}

function saveAndRender() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    render();
}

/* 🌙 THEME LOGIC FIXED */
const toggle = document.getElementById("theme-toggle");
const icon = toggle.querySelector("i");

function updateThemeUI(isDark) {
    if (isDark) {
        document.documentElement.classList.add("dark");
        icon.className = "fas fa-moon text-blue-400";
    } else {
        document.documentElement.classList.remove("dark");
        icon.className = "fas fa-sun text-orange-500";
    }
}

// Init theme
const savedTheme = localStorage.getItem("theme") || "light";
updateThemeUI(savedTheme === "dark");

toggle.addEventListener("click", () => {
    const isNowDark = !document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isNowDark ? "dark" : "light");
    updateThemeUI(isNowDark);
});

render();