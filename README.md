# 📚 Goodreads Review Calendar Enhancer

A lightweight Tampermonkey userscript that enhances the Goodreads review page by adding configurable, user-friendly calendar date pickers for "Date Started" and "Date Finished" fields.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Features

* **Interactive Calendar Pickers**: Select dates using visual calendar grids or compact HTML5 inputs instead of wrestling with individual drop-down menus.
* **Multi-Row Support**: Automatically detects when you add multiple reading sessions ("Add read date") and injects custom calendar controls for every session.
* **React State Synchronization**: Directly updates Goodreads' underlying React form state so your dates save correctly every time.
* **No-Code Configuration Menu**: Easily toggle settings directly from the Tampermonkey extension menu without editing code.

---

## 🚀 Installation

1. Install a userscript manager extension if you haven't already:
   * [Tampermonkey for Chrome / Edge / Firefox / Safari](https://www.tampermonkey.net/)
2. Click on the direct script link below:
   * **[Install Goodreads Review Calendar Enhancer](https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/main/goodreads-calendar-enhancer.user.js)** *(Update this link with your actual repo details)*
3. Tampermonkey will open an installation prompt. Click **Install**.

---

## ⚙️ Configuration & Options

You can customize the script layout and theme directly from Tampermonkey without opening the code editor:

1. Click the **Tampermonkey extension icon** in your browser toolbar while on any Goodreads review page.
2. Under the script menu, click to toggle options:
   * **Toggle Dark Theme**: Switch between light background (`#F4F1EA`) and dark background (`#1E1E1E`).
   * **Toggle Layout Style**: Switch between the **Full Grid Calendar** (Flatpickr) and **Compact HTML5** date inputs.
3. The page will refresh automatically to apply your selected settings.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
