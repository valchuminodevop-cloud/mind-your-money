/* ==========================================
   MIND YOUR MONEY
   PERSONAL FINANCE DASHBOARD
========================================== */

/* ==========================================
   1. SELECT HTML ELEMENTS
========================================== */

const salaryInput = document.getElementById("salary");
const extraIncomeInput = document.getElementById("extra-income");
const otherIncomeInput = document.getElementById("other-income");

const savingGoalInput = document.getElementById("saving-goal");

const expenseNameInput = document.getElementById("expense-name");
const expenseAmountInput = document.getElementById("expense-amount");
const expenseCategoryInput = document.getElementById("expense-category");
const expenseTypeInput = document.getElementById("expense-type");
const expenseSavingInput = document.getElementById("expense-saving");

const incomeForm = document.getElementById("income-form");
const expenseForm = document.getElementById("expense-form");

const monthSelector = document.getElementById("month-selector");

const expenseList = document.getElementById("expense-list");

const totalIncomeElement = document.getElementById("total-income");
const totalExpensesElement = document.getElementById("total-expenses");
const totalBalanceElement = document.getElementById("total-balance");
const potentialSavingsElement = document.getElementById("potential-savings");

const progressFill = document.querySelector(".progress-fill");
const savingPercentage = document.getElementById("saving-percentage");
const savingProgressText = document.getElementById("saving-progress-text");

const chartTotalElement = document.getElementById("chart-total");
const recommendationContainer = document.querySelector(
    ".recommendation-placeholder"
);

/* ==========================================
   2. MONTHLY DATA
========================================== */

// Returns the current month in YYYY-MM format.

function getCurrentMonth() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
}

// Creates an empty financial record.

function createEmptyMonth() {
    return {
        salary: 0,
        extraIncome: 0,
        otherIncome: 0,
        savingGoal: 0,
        expenses: [],
    };
}

// Current selected month.

let currentMonth = getCurrentMonth();

// Stores all monthly records.

let monthlyRecords = {};

// Data for the selected month.

let financialData = createEmptyMonth();

// Chart instance.

let expenseChart = null;

/* ==========================================
   3. MONEY FORMAT
========================================== */

function formatMoney(amount) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
}

// Converts input values into valid numbers.

function getInputNumber(input) {
    const value = Number(input.value);

    if (!Number.isFinite(value) || value < 0) {
        return 0;
    }

    return value;
}

/* ==========================================
   4. SAVE DATA
========================================== */

function saveData() {
    // Save the selected month in the monthly records.

    monthlyRecords[currentMonth] = financialData;

    try {
        localStorage.setItem(
            "mindYourMoneyHistory",
            JSON.stringify(monthlyRecords)
        );
    } catch (error) {
        console.error("Could not save financial data:", error);

        alert(
            "No se pudieron guardar los datos. " +
                "Revisá el almacenamiento disponible en tu navegador."
        );
    }
}

/* ==========================================
   5. LOAD DATA
========================================== */

function loadData() {
    const savedHistory = localStorage.getItem("mindYourMoneyHistory");

    if (savedHistory) {
        try {
            const parsedHistory = JSON.parse(savedHistory);

            if (
                typeof parsedHistory !== "object" ||
                parsedHistory === null ||
                Array.isArray(parsedHistory)
            ) {
                throw new Error("Invalid history format");
            }

            monthlyRecords = parsedHistory;
        } catch (error) {
            console.error("Error loading history:", error);

            monthlyRecords = {};
        }
    } else {
        // Migration from the previous version of the project.

        const oldData = localStorage.getItem("mindYourMoneyData");

        if (oldData) {
            try {
                const parsed = JSON.parse(oldData);

                if (
                    parsed &&
                    typeof parsed === "object" &&
                    Array.isArray(parsed.expenses)
                ) {
                    monthlyRecords[currentMonth] = {
                        salary: Number(parsed.salary) || 0,

                        extraIncome: Number(parsed.extraIncome) || 0,

                        otherIncome: Number(parsed.otherIncome) || 0,

                        savingGoal: Number(parsed.savingGoal) || 0,

                        expenses: parsed.expenses,
                    };
                }
            } catch (error) {
                console.error("Could not migrate previous data:", error);
            }
        }
    }

    // Load the selected month's data.

    financialData = monthlyRecords[currentMonth] || createEmptyMonth();

    // Make sure the expenses property is an array.

    if (!Array.isArray(financialData.expenses)) {
        financialData.expenses = [];
    }
}

/* ==========================================
   6. RESTORE FORM INPUTS
========================================== */

function restoreInputs() {
    salaryInput.value = financialData.salary || "";

    extraIncomeInput.value = financialData.extraIncome || "";

    otherIncomeInput.value = financialData.otherIncome || "";

    savingGoalInput.value = financialData.savingGoal || "";
}

/* ==========================================
   7. MONTH SELECTOR
========================================== */

function updateMonth() {
    monthSelector.value = currentMonth;
}

function switchMonth(month) {
    // Validate YYYY-MM.

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        return;
    }

    // Save the month before switching.

    saveData();

    // Change selected month.

    currentMonth = month;

    // Load its data or create an empty record.

    financialData = monthlyRecords[currentMonth] || createEmptyMonth();

    // Update the page.

    restoreInputs();

    updateMonth();

    updateDashboard();

    // Save the new month if it is empty.

    saveData();
}

monthSelector.addEventListener("change", function () {
    switchMonth(this.value);
});

/* ==========================================
   8. FINANCIAL CALCULATIONS
========================================== */

function calculateIncome() {
    return (
        Number(financialData.salary) +
        Number(financialData.extraIncome) +
        Number(financialData.otherIncome)
    );
}

function calculateExpenses() {
    return financialData.expenses.reduce(function (total, expense) {
        return total + Number(expense.amount);
    }, 0);
}

// Sum of expenses marked as reducible.
// This is an opportunity to review spending,
// not money already saved.

function calculatePotentialSavings() {
    return financialData.expenses.reduce(function (total, expense) {
        if (expense.saving === "yes") {
            return total + Number(expense.amount);
        }

        return total;
    }, 0);
}

function calculateBalance() {
    return calculateIncome() - calculateExpenses();
}

/* ==========================================
   9. UPDATE DASHBOARD
========================================== */

function updateDashboard() {
    const income = calculateIncome();

    const expenses = calculateExpenses();

    const balance = calculateBalance();

    const potentialSavings = calculatePotentialSavings();

    // Update summary cards.

    totalIncomeElement.textContent = formatMoney(income);

    totalExpensesElement.textContent = formatMoney(expenses);

    totalBalanceElement.textContent = formatMoney(balance);

    potentialSavingsElement.textContent = formatMoney(potentialSavings);

    // Change balance color depending on the result.

    if (balance < 0) {
        totalBalanceElement.style.color = "#f9c6d0";
    } else {
        totalBalanceElement.style.color = "#fde68a";
    }

    // Update the other sections.

    updateSavingsProgress();

    renderExpenses();

    updateExpenseChart();

    generateRecommendations();
}

/* ==========================================
   10. SAVE INCOME
========================================== */

incomeForm.addEventListener("submit", function (event) {
    event.preventDefault();

    financialData.salary = getInputNumber(salaryInput);

    financialData.extraIncome = getInputNumber(extraIncomeInput);

    financialData.otherIncome = getInputNumber(otherIncomeInput);

    saveData();

    updateDashboard();

    alert("¡Ingresos guardados correctamente!");
});

/* ==========================================
   11. SAVINGS GOAL
========================================== */

savingGoalInput.addEventListener("change", function () {
    financialData.savingGoal = getInputNumber(savingGoalInput);

    saveData();

    updateDashboard();
});

function updateSavingsProgress() {
    const goal = Number(financialData.savingGoal) || 0;

    const balance = calculateBalance();

    // Only a positive balance counts toward this indicator.

    const availableBalance = Math.max(0, balance);

    let percentage = 0;

    if (goal > 0) {
        percentage = (availableBalance / goal) * 100;
    }

    // Cap the visual progress at 100%.

    const visualPercentage = Math.min(percentage, 100);

    progressFill.style.width = visualPercentage + "%";

    savingPercentage.textContent = Math.round(visualPercentage) + "%";

    savingProgressText.textContent = formatMoney(availableBalance);
}

/* ==========================================
   12. ADD EXPENSE
========================================== */

expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = expenseNameInput.value.trim();

    const amount = Number(expenseAmountInput.value);

    // Validate the expense.

    if (!name) {
        alert("Ingresá una descripción para el gasto.");

        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Ingresá un importe válido mayor que cero.");

        return;
    }

    // Create the expense object.

    const newExpense = {
        id: Date.now() + Math.random(),

        name: name,

        amount: amount,

        category: expenseCategoryInput.value,

        type: expenseTypeInput.value,

        saving: expenseSavingInput.value,
    };

    // Add expense to the selected month.

    financialData.expenses.push(newExpense);

    saveData();

    updateDashboard();

    // Clear the form.

    expenseForm.reset();

    expenseNameInput.focus();
});

/* ==========================================
   13. RENDER EXPENSES
========================================== */

function renderExpenses() {
    expenseList.innerHTML = "";

    // Show an empty message if there are no expenses.

    if (financialData.expenses.length === 0) {
        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 6;

        cell.className = "empty-row";

        cell.textContent = "Todavía no registraste gastos en este mes.";

        row.appendChild(cell);

        expenseList.appendChild(row);

        return;
    }

    // Create one table row for each expense.

    financialData.expenses.forEach(function (expense) {
        const row = document.createElement("tr");

        // Description.

        const nameCell = document.createElement("td");

        nameCell.textContent = expense.name;

        // Amount.

        const amountCell = document.createElement("td");

        amountCell.textContent = formatMoney(expense.amount);

        // Category.

        const categoryCell = document.createElement("td");

        categoryCell.textContent = expense.category;

        // Type.

        const typeCell = document.createElement("td");

        typeCell.textContent = expense.type;

        // Reducible.

        const savingCell = document.createElement("td");

        savingCell.textContent = expense.saving === "yes" ? "Sí" : "No";

        savingCell.className =
            expense.saving === "yes" ? "reducible-yes" : "reducible-no";

        // Actions.

        const actionsCell = document.createElement("td");

        // Edit button.

        const editButton = document.createElement("button");

        editButton.type = "button";

        editButton.className = "table-action edit-action";

        editButton.textContent = "✎";

        editButton.title = "Editar gasto";

        editButton.setAttribute("aria-label", "Editar " + expense.name);

        editButton.addEventListener("click", function () {
            editExpense(expense.id);
        });

        // Delete button.

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className = "table-action delete-action";

        deleteButton.textContent = "×";

        deleteButton.title = "Eliminar gasto";

        deleteButton.setAttribute("aria-label", "Eliminar " + expense.name);

        deleteButton.addEventListener("click", function () {
            deleteExpense(expense.id);
        });

        // Add buttons to the actions cell.

        actionsCell.appendChild(editButton);

        actionsCell.appendChild(deleteButton);

        // Add all cells to the row.

        row.appendChild(nameCell);

        row.appendChild(amountCell);

        row.appendChild(categoryCell);

        row.appendChild(typeCell);

        row.appendChild(savingCell);

        row.appendChild(actionsCell);

        // Add row to the table.

        expenseList.appendChild(row);
    });
}

/* ==========================================
   14. EDIT EXPENSE
========================================== */

function editExpense(id) {
    const expense = financialData.expenses.find(function (item) {
        return item.id === id;
    });

    if (!expense) {
        return;
    }

    const newName = prompt("Editar descripción:", expense.name);

    // Cancelled.

    if (newName === null) {
        return;
    }

    const cleanedName = newName.trim();

    if (!cleanedName) {
        alert("La descripción no puede estar vacía.");

        return;
    }

    const newAmount = prompt("Editar importe:", expense.amount);

    // Cancelled.

    if (newAmount === null) {
        return;
    }

    const parsedAmount = Number(newAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        alert("Ingresá un importe válido mayor que cero.");

        return;
    }

    expense.name = cleanedName;

    expense.amount = parsedAmount;

    saveData();

    updateDashboard();
}

/* ==========================================
   15. DELETE EXPENSE
========================================== */

function deleteExpense(id) {
    const confirmed = confirm(
        "¿Estás segura de que querés eliminar este gasto?"
    );

    if (!confirmed) {
        return;
    }

    financialData.expenses = financialData.expenses.filter(function (expense) {
        return expense.id !== id;
    });

    saveData();

    updateDashboard();
}

/* ==========================================
   16. EXPENSE CHART
========================================== */

function updateExpenseChart() {
    const canvas = document.getElementById("expenseChart");

    if (!canvas || typeof Chart === "undefined") {
        console.error("Chart.js was not loaded.");

        return;
    }

    // Group expenses by category.

    const categories = {};

    financialData.expenses.forEach(function (expense) {
        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }

        categories[expense.category] += Number(expense.amount);
    });

    const labels = Object.keys(categories);

    const values = Object.values(categories);

    // Chart colors.

    const colors = [
        "#F9C6D0",
        "#FDE68A",
        "#B9E7D0",
        "#BFD7F5",
        "#D8C5F2",
        "#FB923C",
        "#A5F3FC",
        "#FCA5A5",
        "#C4B5FD",
        "#86EFAC",
    ];

    const total = calculateExpenses();

    // Update chart total.

    chartTotalElement.textContent = formatMoney(total);

    // Create chart only once.

    if (!expenseChart) {
        expenseChart = new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: labels,

                datasets: [
                    {
                        data: values,

                        backgroundColor: colors,

                        borderColor: "#29363d",

                        borderWidth: 4,

                        hoverOffset: 15,
                    },
                ],
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                cutout: "65%",

                animation: {
                    animateRotate: true,

                    duration: 800,
                },

                plugins: {
                    legend: {
                        position: "bottom",

                        labels: {
                            color: "#f4f2e9",

                            padding: 18,

                            usePointStyle: true,

                            pointStyle: "circle",

                            font: {
                                family: "DM Sans",

                                size: 11,
                            },
                        },
                    },

                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const value = context.raw;

                                const percentage =
                                    total > 0
                                        ? ((value / total) * 100).toFixed(1)
                                        : 0;

                                return (
                                    context.label +
                                    ": " +
                                    formatMoney(value) +
                                    " (" +
                                    percentage +
                                    "%)"
                                );
                            },
                        },
                    },
                },
            },
        });
    } else {
        // Update the existing chart.

        expenseChart.data.labels = labels;

        expenseChart.data.datasets[0].data = values;

        expenseChart.update();
    }
}

/* ==========================================
   17. AUTOMATIC RECOMMENDATIONS
========================================== */

function generateRecommendations() {
    recommendationContainer.innerHTML = "";

    const income = calculateIncome();

    const expenses = calculateExpenses();

    const balance = calculateBalance();

    const potentialSavings = calculatePotentialSavings();

    const recommendations = [];

    // No financial information.

    if (income === 0 && expenses === 0) {
        recommendations.push(
            "Comenzá registrando tus ingresos y gastos para obtener un análisis de tu situación mensual."
        );
    }

    // Expenses are greater than income.

    if (income > 0 && expenses > income) {
        recommendations.push(
            "Tus gastos superan tus ingresos. Revisá cuáles son necesarios y cuáles podrías reducir."
        );
    }

    // Expenses are a large part of income.

    if (income > 0 && expenses <= income && expenses / income >= 0.8) {
        recommendations.push(
            "Tus gastos representan el 80% o más de tus ingresos. Podrías revisar algunos gastos variables."
        );
    }

    // Positive balance.

    if (balance > 0 && income > 0) {
        recommendations.push(
            "Tu balance es positivo. Podés evaluar destinar una parte a tu objetivo de ahorro."
        );
    }

    // Negative balance.

    if (balance < 0) {
        recommendations.push(
            "Tu balance es negativo. Antes de fijar una meta de ahorro, intentá equilibrar ingresos y gastos."
        );
    }

    // Reducible expenses.

    if (potentialSavings > 0) {
        recommendations.push(
            "Marcaste " +
                formatMoney(potentialSavings) +
                " en gastos reducibles. Revisalos para decidir si realmente podés disminuirlos."
        );
    }

    // No expenses.

    if (income > 0 && expenses === 0) {
        recommendations.push(
            "Todavía no registraste gastos. Agregalos para obtener un análisis más completo."
        );
    }

    // Savings goal.

    if (financialData.savingGoal > 0) {
        if (balance >= financialData.savingGoal) {
            recommendations.push(
                "¡Tu balance positivo alcanza o supera tu objetivo de ahorro mensual!"
            );
        } else {
            const difference = financialData.savingGoal - Math.max(0, balance);

            recommendations.push(
                "Para alcanzar tu objetivo de ahorro, necesitás disponer de " +
                    formatMoney(difference) +
                    " adicionales."
            );
        }
    }

    // Add recommendations to the page.

    recommendations.forEach(function (message) {
        addRecommendation(message);
    });
}

/* ==========================================
   18. ADD RECOMMENDATION TO HTML
========================================== */

function addRecommendation(message) {
    const item = document.createElement("div");

    item.className = "recommendation-item";

    const icon = document.createElement("span");

    icon.className = "recommendation-icon";

    icon.textContent = "✦";

    const paragraph = document.createElement("p");

    paragraph.textContent = message;

    item.appendChild(icon);

    item.appendChild(paragraph);

    recommendationContainer.appendChild(item);
}

/* ==========================================
   19. INITIALIZE APPLICATION
========================================== */

function initializeApp() {
    // Load saved monthly data.

    loadData();

    // Display selected month.

    updateMonth();

    // Restore form values.

    restoreInputs();

    // Update all dashboard sections.

    updateDashboard();

    console.log("MIND YOUR MONEY initialized!");
}

// Start the application.

initializeApp();
