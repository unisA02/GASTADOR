# 💸 GASTADOR

*A student-first fintech platform for smarter budgeting, savings, and financial resilience.*

---

## 💡 Inspiration

College students often manage their finances with **irregular income cycles**, typically receiving allowances or stipends on a monthly basis. Without structured tools, this leads to inconsistent spending, financial stress, and poor long-term habits.

Gastador was inspired by a real, recurring problem: money runs out not because students spend too much once—but because they lack **visibility and planning over time**. This project began as a personal solution and evolved into a **scalable fintech concept** aimed at helping students build sustainable financial behavior early.

---

## 🚀 What It Does

Gastador is an **all-in-one personal finance dashboard** designed for students and early earners. It allows users to:

* Define flexible budget periods (monthly, weekly, or custom)
* Track expenses and income with customizable categories
* Monitor remaining budget and spending velocity in real time
* Create **sinking funds** for goal-based savings (tuition, devices, travel)
* Build an **emergency fund** aligned with financial best practices
* Track assets and calculate total net worth

At its core, Gastador transforms raw spending data into **actionable financial awareness**.

---

## 📊 Financial Logic & Modeling

Gastador applies simple but effective financial models to guide decision-making:

**Remaining Budget**
[
\text{Remaining} = \text{Total Budget} - \sum \text{Expenses}
]

**Emergency Fund Recommendation**
[
\text{Emergency Target} = \text{Monthly Expenses} \times (3 \text{ to } 6)
]

**Sinking Fund Progress**
[
\text{Progress (%)} = \frac{\text{Saved Amount}}{\text{Target Amount}} \times 100
]

These formulas power real-time progress bars and insights throughout the platform.

---

## 🛠️ How It Was Built

Gastador is a **fully client-side fintech MVP**, built with:

* **HTML, JavaScript, and Tailwind CSS** for performance and rapid iteration
* **Chart.js** for real-time financial visualizations
* **localStorage** for authentication flow, onboarding, and persistent financial state

The UI and user flows were designed in **Figma** before implementation. Development was accelerated using AI-assisted tools like **Cursor**, **ChatGPT**, and **Gemini**, enabling rapid prototyping while maintaining code clarity.

---

## ⚙️ Challenges

The primary challenge was managing **external dependencies and build tooling**, particularly configuring Tailwind CSS with NPM and ensuring compatibility with **Netlify deployment**. Solving these issues required a deeper understanding of modern front-end pipelines and production environments.

---

## 🏆 Key Accomplishments

* Shipped a **production-quality fintech MVP** within a solo hackathon
* Designed and deployed a complete financial system without a backend
* Built a modular architecture capable of future feature expansion
* Published and managed a first-ever GitHub repository independently

This validated the feasibility of a **lightweight, offline-capable finance platform**.

---

## 📚 What I Learned

This project strengthened my skills in:

* Front-end system design and state management
* Translating financial concepts into scalable software logic
* UX-driven product development
* Shipping and deploying real-world applications end to end

More importantly, it reinforced the importance of **product-market empathy** in fintech.

---

## 🔮 What’s Next for Gastador

The next phase focuses on scalability and monetization:

* Secure authentication and cloud synchronization
* Multi-device support
* Predictive analytics (spending forecasts, alerts)
* Personalized financial recommendations
* Potential partnerships with **student banks and digital wallets**

Long-term, Gastador aims to become a **financial operating system for students**, helping users transition from allowance-based budgeting to independent financial management.


## ⚙️ Installation & Setup
To run this project locally:
1. Clone the repo: `git clone https://github.com/unisA02/GASTADOR.git`
2. Install dependencies: `npm install` 
3. Start the app: `npm start`

## 👥 The Team
- **Eunice Almeyda** - BS Computer Science Student (UPLB)

---
*This repository has been archived for hackathon judging purposes.*