const form = document.getElementById("transaction-form");
const list = document.getElementById("list");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const expenseBtn = document.getElementById("type-expense");
const incomeBtn = document.getElementById("type-income");

// Budget tracking elements
const budgetEl = document.getElementById("display-budget");
const remainingEl = document.getElementById("remaining-budget");
const remainingCard = document.getElementById("remaining-card");

let transactionType = "expense";
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Load Initial Budget from localStorage
let monthlyBudget = parseFloat(localStorage.getItem("monthlyBudget")) || 0;

// 🔄 INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today's local date
    const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
    dateInput.value = today;

    // Safety check: if no budget is found, send back to welcome
    if (monthlyBudget === 0 && transactions.length === 0) {
        window.location.href = 'welcome.html';
    }

    render();
});

/* 🔄 TYPE TOGGLE LOGIC */
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
    
    const val = parseFloat(amountInput.value);
    if (!categoryInput.value || isNaN(val) || val <= 0 || !dateInput.value) {
        alert("Please provide a valid category, amount, and date.");
        return;
    }

    // Force negative for expenses, positive for income
    const amount = transactionType === "expense" ? -Math.abs(val) : Math.abs(val);

    const newTransaction = {
        id: Date.now(),
        category: categoryInput.value,
        amount: amount,
        date: dateInput.value,
    };

    transactions.push(newTransaction);
    saveAndRender();
    
    // Reset inputs but keep the current date
    form.reset();
    dateInput.value = new Date().toLocaleDateString('en-CA');
});

/* 🗑 DELETE TRANSACTION */
function deleteTransaction(id) {
    if(confirm("Delete this transaction?")) {
        transactions = transactions.filter(t => t.id !== id);
        saveAndRender();
    }
}

/* 🔁 RENDER UI */
function render() {
    list.innerHTML = "";
    
    if (transactions.length === 0) {
        list.innerHTML = `<p class="text-center text-gray-400 py-8 italic">No transactions recorded yet.</p>`;
        updateTotals();
        return;
    }

    // Sort: Newest date first
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedTransactions.forEach(t => {
        const isExpense = t.amount < 0;
        const colorClass = isExpense ? "border-red-500" : "border-green-500";
        const textClass = isExpense ? "text-red-500" : "text-green-600 dark:text-green-400";

        const li = document.createElement("li");
        li.className = `group flex justify-between items-center bg-gray-50 dark:bg-gray-900/40 p-4 border-l-4 ${colorClass} rounded-2xl transition-all hover:shadow-md`;

        li.innerHTML = `
            <div class="flex flex-col">
                <span class="font-bold text-gray-800 dark:text-gray-100">${t.category}</span>
                <small class="text-gray-500 dark:text-gray-400">${t.date}</small>
            </div>
            <div class="flex items-center gap-4">
                <span class="font-bold text-lg ${textClass}">
                    ${isExpense ? '-' : '+'}₱${Math.abs(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
                <button onclick="deleteTransaction(${t.id})" class="text-gray-300 hover:text-red-500 transition-colors p-2">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        list.appendChild(li);
    });

    updateTotals();
}

/* 📊 CALCULATE TOTALS */
function updateTotals() {
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
    const totalSpent = Math.abs(expense);
    
    const remaining = monthlyBudget - totalSpent;

    // Update displays
    budgetEl.textContent = `₱${monthlyBudget.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    incomeEl.textContent = `+₱${income.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    expenseEl.textContent = `-₱${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    remainingEl.textContent = `₱${remaining.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

    // Alert UI: Red if budget is exceeded
    if (remaining < 0) {
        remainingCard.className = "bg-red-600 p-5 rounded-3xl shadow-sm border border-red-700 text-white transition-all scale-105 md:scale-100";
        remainingEl.className = "text-2xl font-black text-white";
    } else {
        remainingCard.className = "bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all";
        remainingEl.className = "text-2xl font-black text-indigo-600 dark:text-indigo-400";
    }
}

function saveAndRender() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    render();
}

/* 🌙 THEME SWITCHER */
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = themeToggle.querySelector("i");

const applyTheme = (isDark) => {
    document.documentElement.classList.toggle("dark", isDark);
    themeIcon.className = isDark ? "fas fa-moon text-blue-400" : "fas fa-sun text-orange-500";
};

// Init theme
applyTheme(localStorage.getItem("theme") === "dark");

themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    applyTheme(isDark);
});