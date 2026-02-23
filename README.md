<div align="center">

# 🧠 SegmentIQ — Customer Intelligence Platform

**Unsupervised Machine Learning platform for e-commerce customer segmentation,  
powered by real UCI transaction data.**

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 📌 Project Overview

**SegmentIQ** is a full-stack, production-ready analytics platform that applies unsupervised machine learning algorithms to real e-commerce transaction data, enabling businesses to understand and segment their customer base.

The platform ingests the **UCI Online Retail II dataset** (541,909 real transactions from a UK-based online retailer, 2009–2011), engineers **RFM (Recency, Frequency, Monetary)** features, and exposes them through **5 interactive ML analysis modules** — all visualized in a modern React dashboard.

---

## 🗂️ Project Structure

```
CustomerSegmentation/
├── backend/                          # FastAPI Python backend
│   ├── main.py                       # App entry point, all API routes
│   ├── requirements.txt              # Python dependencies
│   ├── data/
│   │   ├── loader.py                 # Dataset download, cleaning & RFM pipeline
│   │   ├── online_retail_clean.csv   # Cached cleaned data (auto-generated)
│   │   └── rfm_features.csv          # Cached RFM features (auto-generated)
│   └── ml/
│       ├── clustering.py             # K-Means, Hierarchical, DBSCAN
│       ├── dimensionality.py         # PCA & LDA
│       ├── market_basket.py          # Apriori association rules
│       └── personas.py              # Cluster persona generation
│
└── frontend/                         # React + Vite frontend
    ├── src/
    │   ├── pages/
    │   │   ├── Landing.jsx           # Hero landing page with 3D animation
    │   │   ├── Dashboard.jsx         # KPI overview + charts
    │   │   ├── Segmentation.jsx      # All 3 clustering algorithms
    │   │   ├── DimReduction.jsx      # PCA & LDA visualizations
    │   │   ├── MarketBasket.jsx      # Association rules & heatmap
    │   │   └── Reports.jsx           # Persona profiles & recommendations
    │   ├── components/
    │   │   ├── Sidebar.jsx           # Collapsible navigation
    │   │   ├── Navbar.jsx            # Top bar with breadcrumb
    │   │   ├── three/
    │   │   │   ├── HeroBackground.jsx  # Three.js particle animation
    │   │   │   └── Scatter3D.jsx       # 3D cluster scatter plot
    │   │   └── ui/
    │   │       ├── StatCard.jsx        # Animated KPI card
    │   │       ├── ChartCard.jsx       # Recharts wrapper
    │   │       ├── TabSwitcher.jsx     # Animated tab component
    │   │       └── SliderControl.jsx   # ML parameter slider
    │   ├── hooks/useAPI.js            # Data fetching hook
    │   ├── services/api.js            # Axios API client
    │   └── layouts/MainLayout.jsx     # App shell (sidebar + navbar)
    └── tailwind.config.js
```

---

## 🧠 ML Algorithms & Features

### 1. RFM Feature Engineering

All clustering algorithms operate on **customer-level RFM features** derived from raw invoice data:

| Feature            | Description                          |
| ------------------ | ------------------------------------ |
| **Recency**        | Days since last purchase             |
| **Frequency**      | Number of unique invoices            |
| **Monetary**       | Total spend (£)                      |
| **AvgOrderValue**  | Mean spend per invoice               |
| **TotalItems**     | Total quantity purchased             |
| **UniqueProducts** | Number of distinct SKUs              |
| **AvgBasketSize**  | Items per invoice                    |

> Features are **log-transformed** (`log1p`) to handle skewness, then **StandardScaler-normalized** before clustering.

---

### 2. K-Means Clustering — `/api/kmeans`

- **Algorithm**: Lloyd's algorithm, `n_init=10`, `random_state=42`
- **Parameters**: `k` (2–10 clusters)
- **Outputs**: Elbow curve · Silhouette scores · Cluster summary · 2D PCA scatter (up to 1,000 points)

### 3. Hierarchical Clustering — `/api/hierarchical`

- **Algorithm**: Agglomerative clustering, Ward linkage
- **Parameters**: `n_clusters` (2–8)
- **Outputs**: Full dendrogram tree · Cluster summary · 2D PCA scatter

### 4. DBSCAN — `/api/dbscan`

- **Algorithm**: Density-Based Spatial Clustering of Applications with Noise
- **Parameters**: `eps` (0.1–5.0), `min_samples` (2–20)
- **Outputs**: Discovered cluster count · Noise point rate · Cluster summary · 2D scatter with noise highlighted

### 5. PCA — Principal Component Analysis — `/api/pca`

- **Parameters**: `n_components` (2–5)
- **Outputs**: % explained variance · Cumulative variance curve · Feature loadings matrix · 2D scatter coordinates

### 6. LDA — Linear Discriminant Analysis — `/api/lda`

- **Supervised** dimensionality reduction using K-Means cluster labels as class targets
- **Parameters**: `n_components` (1–3)
- **Outputs**: Discriminant axis coordinates · LDA vs PCA comparison data

### 7. Market Basket Analysis — `/api/market-basket`

- **Algorithm**: Apriori (via `mlxtend`)
- **Parameters**: `min_support` (0.5%–50%), `min_confidence` (10%–100%)
- **Outputs**: Top 30 association rules by lift · Support / Confidence / Lift · 20×20 co-occurrence heatmap · Top 20 product frequency bar chart

### 8. Cluster Persona Reports — `/api/reports`

- Runs K-Means (default k=4) and maps each cluster to a **named marketing persona**
- Each persona includes: description, RFM profile, revenue potential, and marketing campaign recommendations

---

## 📊 Dataset

| Property         | Value                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| **Source**       | [UCI ML Repository — Online Retail II (id=502)](https://archive.ics.uci.edu/dataset/502/online+retail+ii)      |
| **Retailer**     | UK-based online gift shop                                                                                       |
| **Period**       | December 2009 – December 2011                                                                                   |
| **Transactions** | ~541,909 raw invoice lines                                                                                      |
| **Customers**    | ~4,300 unique (after cleaning)                                                                                  |
| **Products**     | ~3,900 unique SKUs                                                                                              |
| **Countries**    | 40+                                                                                                             |
| **Revenue**      | £9.7M+ total                                                                                                    |

**Cleaning pipeline** (`loader.py`):
1. Download zip directly from UCI archive (auto on first run)
2. Combine both Excel sheets (Year 2009–2010 + Year 2010–2011)
3. Drop rows with missing `CustomerID` or `Description`
4. Remove cancelled orders (InvoiceNo starting with `C`)
5. Remove negative quantities and zero/negative prices
6. Cache to `data/online_retail_clean.csv` for fast subsequent loads

---

## 🖥️ Tech Stack

### Backend

| Technology    | Version | Purpose                                                         |
| ------------- | ------- | --------------------------------------------------------------- |
| Python        | 3.11    | Runtime                                                         |
| FastAPI       | 0.111   | REST API framework                                              |
| Uvicorn       | 0.29    | ASGI server                                                     |
| pandas        | 2.2     | Data manipulation                                               |
| NumPy         | 1.26    | Numerical operations                                            |
| scikit-learn  | 1.4     | ML algorithms (K-Means, DBSCAN, PCA, LDA, Hierarchical)        |
| SciPy         | 1.13    | Hierarchical linkage & dendrogram                               |
| mlxtend       | 0.23    | Apriori & association rules                                     |
| openpyxl      | 3.1     | Excel file parsing                                              |

### Frontend

| Technology                      | Purpose                              |
| ------------------------------- | ------------------------------------ |
| React 18                        | UI framework                         |
| Vite 5                          | Build tool & dev server              |
| Tailwind CSS                    | Utility-first styling                |
| Framer Motion                   | Page & component animations          |
| GSAP                            | Hero text entrance animations        |
| Three.js + @react-three/fiber   | WebGL 3D background animation        |
| Recharts                        | Charts (scatter, bar, pie, line)     |
| Lucide React                    | Icon library                         |
| Axios                           | HTTP client                          |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### 1. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```

> **First run only:** The server will automatically download the UCI Online Retail II dataset (~40 MB zip), extract and clean it, and cache it to `data/online_retail_clean.csv`. This takes ~30–60 seconds depending on your internet speed. Subsequent starts load from cache instantly.

- API: **http://localhost:8000**
- Interactive docs: **http://localhost:8000/docs**

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

- App: **http://localhost:5173**

---

## 🔌 API Reference

| Endpoint               | Method | Parameters                      | Description                          |
| ---------------------- | ------ | ------------------------------- | ------------------------------------ |
| `/api/dataset/stats`   | GET    | —                               | Dataset summary (KPIs)               |
| `/api/kmeans`          | GET    | `k` (2–10)                      | K-Means clustering results           |
| `/api/hierarchical`    | GET    | `n_clusters` (2–8)              | Hierarchical clustering + dendrogram |
| `/api/dbscan`          | GET    | `eps`, `min_samples`            | DBSCAN clustering + noise detection  |
| `/api/pca`             | GET    | `n_components` (2–5)            | PCA dimensionality reduction         |
| `/api/lda`             | GET    | `n_components` (1–3)            | LDA dimensionality reduction         |
| `/api/market-basket`   | GET    | `min_support`, `min_confidence` | Association rules (Apriori)          |
| `/api/reports`         | GET    | `k` (2–10)                      | Cluster persona profiles             |

---

## 📱 Pages & Features

| Page               | Route            | Features                                                                                         |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------------------ |
| **Landing**        | `/`              | 3D animated hero, feature overview, live stats                                                   |
| **Dashboard**      | `/dashboard`     | 6 live KPI cards, pie chart, algorithm comparison bar chart                                      |
| **Segmentation**   | `/segmentation`  | K-Means (elbow + silhouette + scatter), Hierarchical (dendrogram + scatter), DBSCAN — with sliders |
| **Dim. Reduction** | `/dimensionality`| PCA explained variance, component loadings, LDA vs PCA comparison                               |
| **Market Basket**  | `/market-basket` | Top 30 association rules table, product co-occurrence heatmap, item frequency chart              |
| **Reports**        | `/reports`       | Customer persona cards with RFM profiles, revenue potential, campaign recommendations            |

---

## 💡 Key Design Decisions

| Decision                  | Rationale                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| **Real data, no mocks**   | Every chart and number is computed live from UCI Online Retail II                            |
| **On-demand computation** | ML runs server-side on each API call; parameters are user-controlled via sliders             |
| **RFM log-transform**     | Skewed monetary/frequency distributions are `log1p`-transformed before clustering           |
| **PCA-based scatter**     | All clustering algorithms project results to 2D via PCA for consistent visualization        |
| **DBSCAN with noise**     | Discovers cluster count automatically and isolates anomalous customers (cluster = -1)        |
| **Persona mapping**       | Centroids ranked by RFM composites to assign human-readable names (Champions, Loyal, etc.)  |

---

## 📸 Screenshots

> Launch the app at `http://localhost:5173` to explore all modules interactively.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

*Built with ❤️ using FastAPI, React & scikit-learn · Dataset: [UCI Machine Learning Repository](https://archive.ics.uci.edu/dataset/502/online+retail+ii)*

</div>