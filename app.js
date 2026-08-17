"use strict";

/*
 * Pi Monthly Spending
 *
 * Initial frontend foundation.
 *
 * This version stores expenses locally in the browser.
 * Later versions will connect this UI to:
 *
 * - Pi authentication
 * - Vercel API routes
 * - Neon PostgreSQL
 * - User-specific cloud data
 */

const STORAGE_KEY = "pi-monthly-spending-expenses";
const BUDGET_KEY = "pi-monthly-spending-budget";

const monthSelector = document.getElementById("monthSelector");

const totalSpentElement = document.getElementById("totalSpent");
const monthlyBudgetElement = document.getElementById("monthlyBudget");
const remainingBudgetElement = document.getElementById("remainingBudget");
const transactionCountElement = document.getElementById("transactionCount");

const expenseList = document.getElementById("expenseList");
const categoryList = document.getElementById("categoryList");

const addExpenseButton = document.getElementById("addExpenseButton");
const closeModalButton = document.getElementById("closeModalButton");
const cancelExpenseButton = document.getElementById("cancelExpenseButton");

const expenseModal = document.getElementById("expenseModal");
const expenseForm = document.getElementById("expenseForm");

const expenseDate = document.getElementById("expenseDate");


const categories = [
  "Food",
  "Housing",
  "Utilities",
  "Transportation",
  "Shopping",
  "Family",
  "Technology",
  "Entertainment",
  "Bills",
  "Other"
];


function getToday() {
  const date = new Date();

  return date.toISOString().split("T")[0];
}


function getCurrentMonth() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}


function loadExpenses() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const expenses = JSON.parse(stored);

    return Array.isArray(expenses) ? expenses : [];

  } catch (error) {

    console.error("Unable to load expenses:", error);

    return [];
  }
}


function saveExpenses(expenses) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(expenses)
  );
}


function loadBudget() {
  try {
    const stored = localStorage.getItem(BUDGET_KEY);

    if (!stored) {
      return 0;
    }

    const budget = Number(stored);

    return Number.isFinite(budget) ? budget : 0;

  } catch (error) {

    console.error("Unable to load budget:", error);

    return 0;
  }
}


function formatCurrency(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(amount);
}


function getSelectedMonth() {
  return monthSelector.value || getCurrentMonth();
}


function getMonthlyExpenses() {
  const selectedMonth = getSelectedMonth();

  return loadExpenses().filter((expense) => {
    return expense.date.startsWith(selectedMonth);
  });
}


function updateDashboard() {

  const expenses = getMonthlyExpenses();

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const budget = loadBudget();

  const remaining = budget - total;

  totalSpentElement.textContent = formatCurrency(total);

  monthlyBudgetElement.textContent =
    budget > 0 ? formatCurrency(budget) : "Not set";

  remainingBudgetElement.textContent =
    budget > 0 ? formatCurrency(remaining) : "—";

  transactionCountElement.textContent = expenses.length;

  renderExpenses(expenses);
  renderCategories(expenses);
}


function renderExpenses(expenses) {

  if (expenses.length === 0) {

    expenseList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">₱</div>

        <h3>No expenses yet</h3>

        <p>
          Add your first expense to start tracking your monthly spending.
        </p>
      </div>
    `;

    return;
  }

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  expenseList.innerHTML = sortedExpenses
    .map((expense) => {

      const description =
        expense.description?.trim() ||
        expense.category;

      return `
        <div class="expense-item">

          <div class="expense-info">

            <div class="expense-description">
              ${escapeHtml(description)}
            </div>

            <div class="expense-meta">
              ${escapeHtml(expense.category)}
              ·
              ${escapeHtml(expense.date)}
              ·
              ${escapeHtml(expense.paymentMethod)}
            </div>

          </div>

          <div>
            <div class="expense-amount">
              ${formatCurrency(Number(expense.amount))}
            </div>

            <button
              type="button"
              class="delete-expense"
              data-id="${escapeHtml(expense.id)}"
            >
              Delete
            </button>
          </div>

        </div>
      `;

    })
    .join("");

  document
    .querySelectorAll(".delete-expense")
    .forEach((button) => {

      button.addEventListener("click", () => {
        deleteExpense(button.dataset.id);
      });

    });
}


function renderCategories(expenses) {

  if (expenses.length === 0) {

    categoryList.innerHTML = `
      <div class="empty-state small">
        <p>No category data yet.</p>
      </div>
    `;

    return;
  }

  const totals = {};

  categories.forEach((category) => {
    totals[category] = 0;
  });

  expenses.forEach((expense) => {

    const category = expense.category;

    if (!totals[category]) {
      totals[category] = 0;
    }

    totals[category] += Number(expense.amount);
  });

  const totalSpent = Object.values(totals).reduce(
    (sum, amount) => sum + amount,
    0
  );

  const sortedCategories = Object.entries(totals)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  categoryList.innerHTML = sortedCategories
    .map(([category, amount]) => {

      const percentage =
        totalSpent > 0
          ? (amount / totalSpent) * 100
          : 0;

      return `
        <div class="category-item">

          <div class="category-header">

            <span class="category-name">
              ${escapeHtml(category)}
            </span>

            <span class="category-total">
              ${formatCurrency(amount)}
            </span>

          </div>

          <div class="category-bar">
            <div
              class="category-bar-fill"
              style="width: ${percentage}%"
            ></div>
          </div>

        </div>
      `;

    })
    .join("");
}


function openModal() {

  expenseModal.classList.remove("hidden");

  expenseModal.setAttribute(
    "aria-hidden",
    "false"
  );

  expenseDate.value = getToday();

  document
    .getElementById("expenseAmount")
    .focus();
}


function closeModal() {

  expenseModal.classList.add("hidden");

  expenseModal.setAttribute(
    "aria-hidden",
    "true"
  );

  expenseForm.reset();

  expenseDate.value = getToday();
}


function addExpense(event) {

  event.preventDefault();

  const formData = new FormData(expenseForm);

  const amount = Number(
    formData.get("amount")
  );

  if (!Number.isFinite(amount) || amount <= 0) {

    alert("Please enter a valid expense amount.");

    return;
  }

  const expense = {

    id:
      crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,

    amount,

    category:
      formData.get("category"),

    description:
      formData.get("description"),

    date:
      formData.get("date"),

    paymentMethod:
      formData.get("paymentMethod"),

    createdAt:
      new Date().toISOString()

  };

  const expenses = loadExpenses();

  expenses.push(expense);

  saveExpenses(expenses);

  closeModal();

  updateDashboard();
}


function deleteExpense(id) {

  const confirmed = window.confirm(
    "Delete this expense?"
  );

  if (!confirmed) {
    return;
  }

  const expenses = loadExpenses().filter(
    (expense) => expense.id !== id
  );

  saveExpenses(expenses);

  updateDashboard();
}


function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* Event listeners */

addExpenseButton.addEventListener(
  "click",
  openModal
);

closeModalButton.addEventListener(
  "click",
  closeModal
);

cancelExpenseButton.addEventListener(
  "click",
  closeModal
);

expenseForm.addEventListener(
  "submit",
  addExpense
);

monthSelector.addEventListener(
  "change",
  updateDashboard
);

document
  .querySelector(".modal-backdrop")
  .addEventListener(
    "click",
    closeModal
  );


/* Initial state */

monthSelector.value = getCurrentMonth();

expenseDate.value = getToday();

updateDashboard();
