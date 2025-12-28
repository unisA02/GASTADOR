
// --- STATE ---
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let sinkingFunds = JSON.parse(localStorage.getItem("sinkingFunds")) || [];
let assets = JSON.parse(localStorage.getItem("assets")) || [];
let liabilities = JSON.parse(localStorage.getItem("liabilities")) || [];
let banks = JSON.parse(localStorage.getItem("banks")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || ["Meals", "Travel", "Laundry", "Academics", "Groceries", "Social"];
let monthlyBudget = parseFloat(localStorage.getItem("monthlyBudget")) || 5000;
let efData = JSON.parse(localStorage.getItem("emergencyFund")) || { active: false, balance: 0, target: 0, contribution: 0 };

let transactionType = "expense";
let currentFilter = null;
let budgetChart = null;
let growthChart = null;
let activeFundId = null;

// --- PERSISTENCE ---
function save() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("sinkingFunds", JSON.stringify(sinkingFunds));
    localStorage.setItem("assets", JSON.stringify(assets));
    localStorage.setItem("liabilities", JSON.stringify(liabilities));
    localStorage.setItem("banks", JSON.stringify(banks));
    localStorage.setItem("monthlyBudget", monthlyBudget.toString());
    localStorage.setItem("emergencyFund", JSON.stringify(efData));
}

// --- UTILS ---
const formatCurrency = (amt) => "₱" + Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2 });
const getDaysLeft = (date) => {
    const diff = new Date(date) - new Date();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Goal Reached";
};

// --- THEME ---
function applyTheme() {
    const theme = localStorage.getItem("theme");
    const isDark = theme === "dark" || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
        document.documentElement.classList.add("dark");
        document.getElementById("theme-toggle").innerHTML = `<i class="fas fa-sun"></i>`;
    } else {
        document.documentElement.classList.remove("dark");
        document.getElementById("theme-toggle").innerHTML = `<i class="fas fa-moon"></i>`;
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.getElementById("theme-toggle").innerHTML = isDark ? `<i class="fas fa-sun"></i>` : `<i class="fas fa-moon"></i>`;
}

// --- DASHBOARD RENDER ---
function renderDashboard() {
    monthlyBudget = parseFloat(localStorage.getItem("monthlyBudget")) || 5000;
    const username = localStorage.getItem('username') || 'Gastador';
    document.getElementById("user-display-name").innerText = username;

    const inflow = transactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
    const outflow = Math.abs(transactions.filter(t => t.amount < 0).reduce((a, t) => a + t.amount, 0));
    
    // Total savings committed (optional advanced logic)
    const committedSavings = sinkingFunds.reduce((a, f) => a + f.saved, 0) + efData.balance;
    const remainingBudget = monthlyBudget - outflow;

    document.getElementById("display-budget").innerText = formatCurrency(monthlyBudget);
    document.getElementById("income").innerText = formatCurrency(inflow);
    document.getElementById("expense").innerText = formatCurrency(outflow);
    document.getElementById("remaining-budget").innerText = formatCurrency(remainingBudget);
    
    const progress = Math.min((outflow / monthlyBudget) * 100, 100);
    const progBar = document.getElementById("budget-progress-bar");
    if (progBar) {
        progBar.style.width = `${progress}%`;
        progBar.className = `h-full transition-all duration-700 ${remainingBudget < 0 ? 'bg-red-500' : 'bg-green-500'}`;
    }
    
    const statusEl = document.getElementById("budget-status");
    if (statusEl) {
        statusEl.innerHTML = remainingBudget < 0 
            ? `<span class="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">OVER</span>`
            : `<span class="text-[9px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">OK</span>`;
    }

    renderHistory();
    updateBudgetChart();
}

function renderHistory() {
    const list = document.getElementById("list");
    if (!list) return;

    let filtered = transactions.filter(t => transactionType === "expense" ? t.amount < 0 : t.amount > 0);
    if (currentFilter) filtered = filtered.filter(t => t.category === currentFilter);

    const filterBtn = document.getElementById("clear-filter");
    if (filterBtn) filterBtn.classList.toggle("hidden", !currentFilter);

    list.innerHTML = filtered.length === 0 ? `<li class="py-10 text-center text-gray-400 text-xs italic">No activity found</li>` : "";
    
    filtered.sort((a,b) => b.id - a.id).slice(0, 20).forEach(t => {
        const li = document.createElement("li");
        li.className = `flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 border-l-4 rounded-2xl transition-all group ${t.amount < 0 ? 'border-red-500' : 'border-green-500'}`;
        li.innerHTML = `
            <div>
                <p class="font-bold text-sm">${t.category}</p>
                <small class="text-gray-400 text-[10px] uppercase font-bold tracking-widest">${t.date}</small>
            </div>
            <div class="flex items-center gap-4">
                <span class="font-black text-sm ${t.amount < 0 ? 'text-red-500' : 'text-green-500'}">${t.amount < 0 ? '-' : '+'}${formatCurrency(t.amount)}</span>
                <button onclick="deleteTx(${t.id})" class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"><i class="fas fa-trash-alt text-xs"></i></button>
            </div>`;
        list.appendChild(li);
    });
}

function updateBudgetChart() {
    const canvas = document.getElementById('budgetChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const relevantData = transactions.filter(t => transactionType === "expense" ? t.amount < 0 : t.amount > 0);
    const catTotals = {};
    relevantData.forEach(t => catTotals[t.category] = (catTotals[t.category] || 0) + Math.abs(t.amount));

    if (budgetChart) budgetChart.destroy();
    const sortedEntries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const labels = sortedEntries.map(e => e[0]);
    const values = sortedEntries.map(e => e[1]);

    budgetChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: ['#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#64748b', '#14b8a6', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: { cutout: '80%', plugins: { legend: { display: false } }, maintainAspectRatio: false }
    });

    const legend = document.getElementById("chart-legend");
    if (legend) {
        legend.innerHTML = labels.length === 0 ? `<p class="text-center text-gray-400 italic">No data to display</p>` : "";
        labels.forEach((l, i) => {
            const item = document.createElement("div");
            item.className = "flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded-lg transition-colors";
            item.onclick = () => { currentFilter = l; renderDashboard(); };
            item.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" style="background:${budgetChart.data.datasets[0].backgroundColor[i % 9]}"></div>
                    <span class="font-semibold text-gray-600 dark:text-gray-400">${l}</span>
                </div>
                <span class="font-black">${formatCurrency(values[i])}</span>`;
            legend.appendChild(item);
        });
    }
}

// --- TABS ---
window.switchTab = (tabId) => {
    // Handle about tab
    if (tabId === 'about') {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
        document.getElementById('about').classList.remove('hidden');
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('nav-about').classList.add('active');
        return;
    }
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    const target = document.getElementById(tabId);
    if (target) target.classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const navBtn = document.getElementById(`nav-${tabId}`);
    if (navBtn) navBtn.classList.add('active');

    if (tabId === 'dashboard') renderDashboard();
    if (tabId === 'emergency') renderEmergency();
    if (tabId === 'sinking') renderSinking();
    if (tabId === 'assets') renderAssets();
    if (tabId === 'banks') renderBanks();
    if (tabId === 'growth') renderGrowth();
};

// --- EMERGENCY ---
function renderEmergency() {
    const setup = document.getElementById("ef-setup-view");
    const tracker = document.getElementById("ef-tracker-view");
    if (!setup || !tracker) return;

    if (!efData.active) {
        setup.classList.remove("hidden");
        tracker.classList.add("hidden");
    } else {
        setup.classList.add("hidden");
        tracker.classList.remove("hidden");
        const perc = efData.target > 0 ? (efData.balance / efData.target) * 100 : 0;
        document.getElementById("ef-balance-display").innerText = formatCurrency(efData.balance);
        document.getElementById("ef-progress-bar").style.width = `${Math.min(perc, 100)}%`;
        document.getElementById("ef-percent-display").innerText = `${perc.toFixed(1)}% funded`;
        const remaining = Math.max(0, efData.target - efData.balance);
        const months = efData.contribution > 0 ? Math.ceil(remaining / efData.contribution) : 0;
        document.getElementById("ef-timeline-display").innerText = months > 0 ? `~${months} months left` : "Safety Net Secured!";
    }
}

// --- SINKING ---
function renderSinking() {
    const grid = document.getElementById("funds-grid");
    if (!grid) return;
    grid.innerHTML = sinkingFunds.length === 0 ? `<div class="col-span-full py-10 text-center text-gray-400">No active goals</div>` : "";
    sinkingFunds.forEach(f => {
        const perc = Math.min((f.saved / f.target) * 100, 100);
        const card = document.createElement("div");
        card.className = "bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-4 flex flex-col";
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-black text-lg">${f.name}</h4>
                    <span class="text-[9px] bg-orange-100 dark:bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded-full font-black uppercase">${f.category}</span>
                </div>
                <button onclick="deleteFund(${f.id})" class="text-gray-300 hover:text-red-500 transition-colors"><i class="fas fa-trash-alt text-xs"></i></button>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between text-[10px] font-black uppercase">
                    <span class="text-orange-500">${formatCurrency(f.saved)}</span>
                    <span class="text-gray-400">Goal: ${formatCurrency(f.target)}</span>
                </div>
                <div class="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div class="bg-orange-500 h-full transition-all duration-1000" style="width: ${perc}%"></div>
                </div>
                <div class="flex justify-between items-center text-[9px] text-gray-400 font-bold">
                    <span>${getDaysLeft(f.deadline)}</span>
                    <span>${perc.toFixed(1)}%</span>
                </div>
            </div>
            <button onclick="openFundAdd(${f.id})" class="mt-auto w-full py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">+ Add Money</button>`;
        grid.appendChild(card);
    });
}

function openFundAdd(id) {
    activeFundId = id;
    document.getElementById("fund-add-modal").classList.remove("hidden");
}

// --- ASSETS & NET WORTH ---
function renderAssets() {
    const list = document.getElementById("asset-list-display");
    const liabList = document.getElementById("liability-list-display");
    if (!list || !liabList) return;

    let assetTotal = 0;
    list.innerHTML = "";
    assets.forEach((a, i) => {
        assetTotal += parseFloat(a.value);
        const div = document.createElement("div");
        div.className = "flex justify-between items-center p-5 bg-white dark:bg-gray-900 rounded-3xl border border-gray-50 dark:border-gray-800 group";
        div.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-xl"><i class="fas fa-cube"></i></div>
                <div>
                    <span class="font-black text-sm block">${a.name}</span>
                    <span class="text-[9px] text-gray-400 font-bold uppercase">${a.category || 'Other'}${a.date ? ' • ' + a.date : ''}</span>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <span class="font-black">${formatCurrency(a.value)}</span>
                <button onclick="deleteAsset(${i})" class="text-gray-300 hover:text-red-500 transition-all"><i class="fas fa-trash-alt text-xs"></i></button>
            </div>`;
        list.appendChild(div);
    });

    let liabTotal = 0;
    liabList.innerHTML = "";
    liabilities.forEach((l, i) => {
        liabTotal += parseFloat(l.value);
        const div = document.createElement("div");
        div.className = "flex justify-between items-center p-5 bg-white dark:bg-gray-900 rounded-3xl border border-gray-50 dark:border-gray-800 group";
        div.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl"><i class="fas fa-hand-holding-usd"></i></div>
                <div>
                    <span class="font-black text-sm block">${l.name}</span>
                    ${l.date ? `<span class="text-[9px] text-gray-400 font-bold uppercase">${l.date}</span>` : ''}
                </div>
            </div>
            <div class="flex items-center gap-4">
                <span class="font-black text-red-500">${formatCurrency(l.value)}</span>
                <button onclick="deleteLiability(${i})" class="text-gray-300 hover:text-red-500 transition-all"><i class="fas fa-trash-alt text-xs"></i></button>
            </div>`;
        liabList.appendChild(div);
    });

    const bankTotal = banks.reduce((a, b) => a + b.balance, 0);
    const sinkingSaved = sinkingFunds.reduce((a, f) => a + f.saved, 0);
    const efBalance = efData.balance;

    const netWorth = (assetTotal + bankTotal + sinkingSaved + efBalance) - liabTotal;

    document.getElementById("total-net-worth").innerText = formatCurrency(netWorth);
    document.getElementById("assets-count").innerText = `${assets.length} asset(s) tracked`;
}

// --- BANKS ---
function renderBanks() {
    const list = document.getElementById("bank-list-display");
    if (!list) return;
    list.innerHTML = banks.length === 0 ? `<div class="col-span-full py-10 text-center text-gray-300">No bank accounts added</div>` : "";
    banks.forEach((b, i) => {
        const div = document.createElement("div");
        div.className = "bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border-l-8 border-orange-500 shadow-sm border border-gray-100 dark:border-gray-800 group relative";
        div.innerHTML = `
            <button onclick="deleteBank(${i})" class="absolute top-6 right-6 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"><i class="fas fa-trash-alt text-xs"></i></button>
            <div class="flex justify-between items-start mb-6">
                <div><h4 class="text-xl font-black">${b.name}</h4><span class="text-[9px] bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-black uppercase">${b.interest}% p.a.</span></div>
                <i class="fas fa-university text-orange-100 dark:text-orange-500/20 text-3xl"></i>
            </div>
            <h3 class="text-3xl font-black mb-4">${formatCurrency(b.balance)}</h3>
            <div class="flex gap-2 mt-4">
                <button onclick="openBankDeposit(${i})" class="flex-1 py-3 bg-green-500 text-white rounded-xl font-black text-sm hover:bg-green-600 transition-all">+ Deposit</button>
                <button onclick="openBankWithdraw(${i})" class="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 transition-all">- Withdraw</button>
            </div>`;
        list.appendChild(div);
    });
}

let activeBankIndex = null;

function openBankDeposit(index) {
    activeBankIndex = index;
    const amount = prompt(`Deposit amount to ${banks[index].name}:`, "");
    if (amount && parseFloat(amount) > 0) {
        banks[index].balance += parseFloat(amount);
        save();
        renderBanks();
    }
}

function openBankWithdraw(index) {
    activeBankIndex = index;
    const amount = prompt(`Withdraw amount from ${banks[index].name}:`, "");
    if (amount && parseFloat(amount) > 0) {
        banks[index].balance = Math.max(0, banks[index].balance - parseFloat(amount));
        save();
        renderBanks();
    }
}

// --- GROWTH ---
function renderGrowth() {
    const canvas = document.getElementById('monthlyBarChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const now = new Date();
    const months = [];
    const inflows = [];
    const outflows = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mKey = d.toISOString().substring(0, 7);
        months.push(d.toLocaleString('default', { month: 'short' }));
        const mTx = transactions.filter(t => t.date.startsWith(mKey));
        inflows.push(mTx.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0));
        outflows.push(Math.abs(mTx.filter(t => t.amount < 0).reduce((a, t) => a + t.amount, 0)));
    }

    if (growthChart) growthChart.destroy();
    growthChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                { label: 'Inflow', data: inflows, backgroundColor: '#22c55e', borderRadius: 8 },
                { label: 'Outflow', data: outflows, backgroundColor: '#ef4444', borderRadius: 8 }
            ]
        },
        options: { maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }, plugins: { legend: { display: true, position: 'bottom' } } }
    });
}

// --- INITIALIZE ---
document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

    updateCategorySelect();
    const dateIn = document.getElementById("date");
    if (dateIn) dateIn.value = new Date().toISOString().split('T')[0];

    switchTab('dashboard');

    // Transactions
    document.getElementById("transaction-form").onsubmit = (e) => {
        e.preventDefault();
        const amtInput = document.getElementById("amount");
        const amt = parseFloat(amtInput.value);
        const cat = transactionType === "expense" ? document.getElementById("category").value : (document.getElementById("income-source").value || "Income");
        
        // Pay Yourself First Prompt for Inflow
        if (transactionType === "income") {
            const savingsAmt = prompt(`Income logged! How much of this ₱${amt} are you giving to your future self today?`);
            if (savingsAmt && !isNaN(savingsAmt)) {
                const sAmt = parseFloat(savingsAmt);
                // Simple logic: add a balancing expense for "Future Self"
                transactions.push({ id: Date.now() + 1, category: "Savings", amount: -sAmt, date: document.getElementById("date").value });
            }
        }

        transactions.push({ id: Date.now(), category: cat, amount: transactionType === "expense" ? -amt : amt, date: document.getElementById("date").value });
        save(); 
        currentFilter = null; 
        renderDashboard(); 
        e.target.reset(); 
        document.getElementById("date").value = new Date().toISOString().split('T')[0];
    };

    document.getElementById("type-expense").onclick = () => {
        transactionType = "expense";
        currentFilter = null;
        document.getElementById("type-expense").className = "flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm shadow-md transition-all";
        document.getElementById("type-income").className = "flex-1 py-3 rounded-xl text-gray-500 font-bold text-sm transition-all";
        document.getElementById("expense-fields").classList.remove("hidden");
        document.getElementById("income-fields").classList.add("hidden");
        renderDashboard();
    };

    document.getElementById("type-income").onclick = () => {
        transactionType = "income";
        currentFilter = null;
        document.getElementById("type-income").className = "flex-1 py-3 rounded-xl bg-green-500 text-white font-bold text-sm shadow-md transition-all";
        document.getElementById("type-expense").className = "flex-1 py-3 rounded-xl text-gray-500 font-bold text-sm transition-all";
        document.getElementById("expense-fields").classList.add("hidden");
        document.getElementById("income-fields").classList.remove("hidden");
        renderDashboard();
    };

    document.getElementById("add-cat-btn").onclick = () => {
        const val = document.getElementById("new-category").value.trim();
        if (val && !categories.includes(val)) { categories.push(val); localStorage.setItem("categories", JSON.stringify(categories)); updateCategorySelect(); document.getElementById("category").value = val; document.getElementById("new-category").value = ""; }
    };

    // Emergency Fund Handlers
    document.getElementById("ef-start-btn").onclick = () => { 
        efData = { 
            active: true, 
            balance: 0, 
            target: parseFloat(document.getElementById("ef-target-input").value) || 0, 
            contribution: parseFloat(document.getElementById("ef-monthly-input").value) || 0 
        }; 
        save(); renderEmergency(); 
    };

    document.getElementById("ef-deposit-btn").onclick = () => { 
        const amtInput = document.getElementById("ef-deposit-amount");
        const amt = parseFloat(amtInput.value) || efData.contribution; 
        if (amt > 0) { efData.balance += amt; save(); renderEmergency(); amtInput.value = ""; } 
    };

    document.getElementById("ef-withdraw-btn").onclick = () => { 
        const amtInput = document.getElementById("ef-deposit-amount");
        const amt = parseFloat(amtInput.value) || efData.contribution; 
        if (amt > 0) { efData.balance = Math.max(0, efData.balance - amt); save(); renderEmergency(); amtInput.value = ""; } 
    };

    document.getElementById("ef-edit-btn").onclick = () => { efData.active = false; renderEmergency(); };
    document.getElementById("ef-reset-btn").onclick = () => { if(confirm("Reset emergency fund?")) { efData.active = false; efData.balance = 0; save(); renderEmergency(); } };

    // Sinking Fund logic
    document.getElementById("open-fund-modal").onclick = () => document.getElementById("fund-modal").classList.remove("hidden");
    document.getElementById("close-fund-modal").onclick = () => document.getElementById("fund-modal").classList.add("hidden");
    document.getElementById("fund-category").onchange = () => {
        const category = document.getElementById("fund-category").value;
        const customDiv = document.getElementById("fund-custom-category");
        if (category === "Other") {
            customDiv.classList.remove("hidden");
            document.getElementById("fund-custom-category-input").required = true;
        } else {
            customDiv.classList.add("hidden");
            document.getElementById("fund-custom-category-input").required = false;
            document.getElementById("fund-custom-category-input").value = "";
        }
    };

    document.getElementById("fund-form").onsubmit = (e) => { 
        e.preventDefault(); 
        const category = document.getElementById("fund-category").value;
        const finalCategory = category === "Other" ? document.getElementById("fund-custom-category-input").value.trim() : category;
        if (!finalCategory) {
            alert("Please enter a custom category name");
            return;
        }
        sinkingFunds.push({ 
            id: Date.now(), 
            name: document.getElementById("fund-name").value, 
            target: parseFloat(document.getElementById("fund-target").value), 
            deadline: document.getElementById("fund-deadline").value, 
            category: finalCategory,
            saved: 0 
        }); 
        save(); document.getElementById("fund-modal").classList.add("hidden"); renderSinking(); e.target.reset(); 
        document.getElementById("fund-custom-category").classList.add("hidden");
    };

    // Incremental Add money for sinking fund
    document.getElementById("fund-add-cancel").onclick = () => document.getElementById("fund-add-modal").classList.add("hidden");
    document.getElementById("fund-add-confirm").onclick = () => {
        const amt = parseFloat(document.getElementById("fund-add-amount").value);
        if (amt && activeFundId) {
            const fund = sinkingFunds.find(f => f.id === activeFundId);
            if (fund) { fund.saved += amt; save(); renderSinking(); }
        }
        document.getElementById("fund-add-modal").classList.add("hidden");
        document.getElementById("fund-add-amount").value = "";
    };

    // Asset logic
    document.getElementById("toggle-asset-form").onclick = () => document.getElementById("asset-form").classList.toggle("hidden");
    document.getElementById("cancel-asset-btn").onclick = () => document.getElementById("asset-form").classList.add("hidden");
    document.getElementById("asset-form").onsubmit = (e) => { 
        e.preventDefault(); 
        assets.push({ 
            name: document.getElementById("asset-name").value, 
            value: parseFloat(document.getElementById("asset-value").value),
            category: document.getElementById("asset-category").value,
            date: document.getElementById("asset-date").value || ""
        }); 
        save(); renderAssets(); e.target.reset(); document.getElementById("asset-form").classList.add("hidden"); 
    };

    document.getElementById("toggle-liability-form").onclick = () => document.getElementById("liability-form").classList.toggle("hidden");
    document.getElementById("liability-form").onsubmit = (e) => {
        e.preventDefault();
        liabilities.push({ 
            name: document.getElementById("debt-name").value, 
            value: parseFloat(document.getElementById("debt-value").value),
            date: document.getElementById("debt-date").value || ""
        });
        save(); renderAssets(); e.target.reset(); document.getElementById("liability-form").classList.add("hidden");
    };

    document.getElementById("bank-form").onsubmit = (e) => { 
        e.preventDefault(); 
        banks.push({ 
            name: document.getElementById("bank-name").value, 
            balance: parseFloat(document.getElementById("bank-balance").value), 
            interest: document.getElementById("bank-interest").value 
        }); 
        save(); renderBanks(); e.target.reset(); 
    };

    document.getElementById("clear-filter").onclick = () => { currentFilter = null; renderDashboard(); };
});

window.deleteTx = (id) => { if(confirm("Delete entry?")) { transactions = transactions.filter(t => t.id !== id); save(); renderDashboard(); } };
window.deleteFund = (id) => { if(confirm("Remove goal?")) { sinkingFunds = sinkingFunds.filter(f => f.id !== id); save(); renderSinking(); } };
window.deleteAsset = (idx) => { if(confirm("Remove asset?")) { assets.splice(idx, 1); save(); renderAssets(); } };
window.deleteLiability = (idx) => { if(confirm("Remove debt?")) { liabilities.splice(idx, 1); save(); renderAssets(); } };
window.deleteBank = (idx) => { if(confirm("Remove bank?")) { banks.splice(idx, 1); save(); renderBanks(); } };
function updateCategorySelect() { const select = document.getElementById("category"); if (select) select.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join(''); }
