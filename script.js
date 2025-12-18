// Expense Elements
const tableBody = document.getElementById("expense-table-body");
const totalAmountEl = document.getElementById("total-amount");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Modal Elements
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const modal = document.getElementById("modal");

const categorySelectModal = document.getElementById("modal-category-select");
const amountInputModal = document.getElementById("modal-amount-input");
const dateInputModal = document.getElementById("modal-date-input");
const addBtnModal = document.getElementById("modal-add-btn");

// Open Modal
openModalBtn.addEventListener("click", () => modal.classList.remove("hidden"));

// Close Modal
closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));

// Add Transaction
addBtnModal.addEventListener("click", () => {
    const category = categorySelectModal.value;
    const amount = parseFloat(amountInputModal.value);
    const date = dateInputModal.value;

    if (category === "Select" || !amount || amount <= 0 || !date) {
        alert("Please fill all fields correctly.");
        return;
    }

    expenses.push({ id: Date.now(), category, amount, date });
    saveAndRender();

    // Reset
    categorySelectModal.value = "Select";
    amountInputModal.value = "";
    dateInputModal.value = "";

    // Close modal
    modal.classList.add("hidden");
});

// Render Expenses
function renderExpenses() {
    tableBody.innerHTML = "";
    let total = 0;

    expenses.forEach(expense => {
        total += expense.amount;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="td">${expense.category}</td>
            <td class="td">₱${expense.amount.toFixed(2)}</td>
            <td class="td">${expense.date}</td>
            <td class="td">
                <button class="delete-btn" onclick="deleteExpense(${expense.id})">✕</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    totalAmountEl.textContent = `₱${total.toFixed(2)}`;
}

// Delete Expense
function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    saveAndRender();
}

// Save & Render
function saveAndRender() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();
}

// Initial render
renderExpenses();

// Dark / Light Mode Toggle
const themeToggleBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    themeToggleBtn.innerHTML = '<i class="fas fa-moon text-orange-500"></i>';
}

themeToggleBtn.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun text-orange-500"></i>';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon text-orange-500"></i>';
    }
});
