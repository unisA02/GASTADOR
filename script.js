const form = document.getElementById("transaction-form");
const list = document.getElementById("list");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const budgetEl = document.getElementById("display-budget");
const remainingEl = document.getElementById("remaining-budget");
const remainingCard = document.getElementById("remaining-card");
const categorySelect = document.getElementById("category");
const dateInput = document.getElementById("date");
const amountInput = document.getElementById("amount");

let transactionType = "expense";
let myChart = null;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let monthlyBudget = parseFloat(localStorage.getItem("monthlyBudget")) || 0;
let categories = JSON.parse(localStorage.getItem("categories")) || 
    ["Travel", "Laundry", "Meals", "Groceries", "Academics", "Rent & utilities", "Gym"];

// --- ADDED THIS HELPER FUNCTION TO FIX THE ERROR ---
function formatCurrency(amount) {
    return "₱" + Math.abs(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

document.addEventListener('DOMContentLoaded', () => {
    dateInput.value = new Date().toISOString().split('T')[0];
    updateCategoryUI();
    render();
});

function updateCategoryUI() {
    categorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

document.getElementById("add-cat-btn").onclick = () => {
    const val = document.getElementById("new-category").value.trim();
    if (val && !categories.includes(val)) {
        categories.push(val);
        localStorage.setItem("categories", JSON.stringify(categories));
        updateCategoryUI();
        document.getElementById("new-category").value = "";
    }
};

document.getElementById("delete-cat-btn").onclick = () => {
    if (confirm(`Remove "${categorySelect.value}"?`)) {
        categories = categories.filter(c => c !== categorySelect.value);
        localStorage.setItem("categories", JSON.stringify(categories));
        updateCategoryUI();
    }
};

// Hamburger Menu Logic
const menuToggle = document.getElementById("menu-toggle");
const sideMenu = document.getElementById("side-menu");
const closeMenu = document.getElementById("close-menu");
const menuBackdrop = document.getElementById("menu-backdrop");

const toggleMenu = () => sideMenu.classList.toggle("open");
menuToggle.onclick = toggleMenu;
closeMenu.onclick = toggleMenu;
menuBackdrop.onclick = toggleMenu;

// Transaction Type Toggling
const expenseBtn = document.getElementById("type-expense");
const incomeBtn = document.getElementById("type-income");
const expenseFields = document.getElementById("expense-fields");
const incomeFields = document.getElementById("income-fields");

function setMode(mode) {
    transactionType = mode;
    const title = document.getElementById("history-title");
    expenseBtn.className = mode === "expense" ? "flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold" : "flex-1 py-2 rounded-lg text-gray-500 font-semibold";
    incomeBtn.className = mode === "income" ? "flex-1 py-2 rounded-lg bg-green-500 text-white font-semibold" : "flex-1 py-2 rounded-lg text-gray-500 font-semibold";
    expenseFields.classList.toggle("hidden", mode !== "expense");
    incomeFields.classList.toggle("hidden", mode !== "income");
    title.innerText = mode === "expense" ? "Expense History" : "Income Tracker";
    render();
}

expenseBtn.onclick = () => setMode("expense");
incomeBtn.onclick = () => setMode("income");

function render() {
    const filtered = transactions.filter(t => t.type === transactionType);
    list.innerHTML = filtered.length === 0 ? `<p class="text-center text-gray-400 py-10 italic">No ${transactionType} history.</p>` : "";
    
    filtered.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(t => {
        const li = document.createElement("li");
        li.className = `flex justify-between items-center bg-gray-50 dark:bg-gray-900/40 p-4 border-l-4 ${t.amount < 0 ? 'border-red-500' : 'border-green-500'} rounded-2xl`;
        li.innerHTML = `<div><p class="font-bold dark:text-white text-sm">${t.category}</p><small class="text-gray-400">${t.date}</small></div>
                        <div class="flex items-center gap-3"><span class="font-bold text-sm ${t.amount < 0 ? 'text-red-500' : 'text-green-500'}">${formatCurrency(t.amount)}</span>
                        <button onclick="deleteTransaction(${t.id})" class="text-gray-300 hover:text-red-500"><i class="fas fa-trash-alt text-xs"></i></button></div>`;
        list.appendChild(li);
    });
    updateTotals();
    updateChart(filtered);
}

function updateChart(data) {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    const totals = {};
    data.forEach(t => totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount));
    
    const labels = Object.keys(totals);
    const values = Object.values(totals);

    const expenseShades = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#f87171', '#fca5a5'];
    const incomeShades = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#4ade80', '#86efac'];

    const activeColors = transactionType === "expense" ? expenseShades : incomeShades;

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: activeColors.slice(0, labels.length),
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: { 
            maintainAspectRatio: false,
            cutout: '85%', 
            plugins: { 
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => ` ${context.label}: ${formatCurrency(context.raw)}`
                    }
                }
            } 
        }
    });

    const legendEl = document.getElementById("chart-legend");
    legendEl.innerHTML = labels.map((l, i) => `
        <div class="flex justify-between items-center p-1 border-b border-gray-50 dark:border-gray-700/50 pb-2">
            <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full" style="background:${activeColors[i % activeColors.length]}"></span>
                <span class="text-gray-500 dark:text-gray-400 truncate w-24">${l}</span>
            </div>
            <span class="font-bold dark:text-white">${formatCurrency(totals[l])}</span>
        </div>
    `).join('');
}

function updateTotals() {
    const inc = transactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
    const exp = transactions.filter(t => t.amount < 0).reduce((a, t) => a + t.amount, 0);
    const rem = monthlyBudget - Math.abs(exp);
    budgetEl.textContent = formatCurrency(monthlyBudget);
    incomeEl.textContent = formatCurrency(inc);
    expenseEl.textContent = formatCurrency(exp);
    remainingEl.textContent = formatCurrency(rem);
    remainingCard.className = rem < 0 ? "bg-red-500 p-5 rounded-3xl text-white shadow-lg" : "bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700";
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    transactions.push({
        id: Date.now(),
        category: transactionType === "expense" ? categorySelect.value : document.getElementById("income-source").value || "Income",
        amount: transactionType === "expense" ? -Math.abs(amountInput.value) : Math.abs(amountInput.value),
        date: dateInput.value,
        type: transactionType
    });
    localStorage.setItem("transactions", JSON.stringify(transactions));
    form.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
    render();
});

window.deleteTransaction = (id) => {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    render();
};

const themeToggle = document.getElementById("theme-toggle");
themeToggle.onclick = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggle.querySelector("i").className = isDark ? "fas fa-moon text-blue-400" : "fas fa-sun text-orange-500";
};
if (localStorage.getItem("theme") === "dark") document.documentElement.classList.add("dark");