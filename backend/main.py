"""
FastAPI main application with all ML API routes.
"""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from data.loader import load_raw, compute_rfm, get_dataset_stats
from ml.clustering import run_kmeans, run_hierarchical, run_dbscan
from ml.dimensionality import run_pca, run_lda
from ml.market_basket import run_market_basket
from ml.personas import generate_personas

app = FastAPI(title="Customer Segmentation API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pre-load data at startup to avoid repeated downloads
_raw_df: pd.DataFrame = None
_rfm_df: pd.DataFrame = None


@app.on_event("startup")
def startup():
    global _raw_df, _rfm_df
    print("🔄 Loading dataset...")
    _raw_df = load_raw()
    _rfm_df = compute_rfm(_raw_df)
    print(f"✅ Loaded {len(_raw_df):,} transactions, {len(_rfm_df):,} customers")


# ─────────────────────────────
# Dataset stats
# ─────────────────────────────
@app.get("/api/dataset/stats")
def dataset_stats():
    return get_dataset_stats()


# ─────────────────────────────
# Clustering
# ─────────────────────────────
@app.get("/api/kmeans")
def kmeans(k: int = Query(default=4, ge=2, le=10)):
    return run_kmeans(_rfm_df, k=k)


@app.get("/api/hierarchical")
def hierarchical(n_clusters: int = Query(default=4, ge=2, le=8)):
    return run_hierarchical(_rfm_df, n_clusters=n_clusters)


@app.get("/api/dbscan")
def dbscan(eps: float = Query(default=0.5, ge=0.1, le=5.0),
           min_samples: int = Query(default=5, ge=2, le=20)):
    return run_dbscan(_rfm_df, eps=eps, min_samples=min_samples)


# ─────────────────────────────
# Dimensionality Reduction
# ─────────────────────────────
@app.get("/api/pca")
def pca(n_components: int = Query(default=3, ge=2, le=5)):
    return run_pca(_rfm_df, n_components=n_components)


@app.get("/api/lda")
def lda(n_components: int = Query(default=2, ge=1, le=3)):
    return run_lda(_rfm_df, n_components=n_components)


# ─────────────────────────────
# Market Basket
# ─────────────────────────────
@app.get("/api/market-basket")
def market_basket(
    min_support: float = Query(default=0.02, ge=0.005, le=0.5),
    min_confidence: float = Query(default=0.3, ge=0.1, le=1.0)
):
    return run_market_basket(_raw_df, min_support=min_support, min_confidence=min_confidence)


# ─────────────────────────────
# Cluster Reports / Personas
# ─────────────────────────────
@app.get("/api/reports")
def reports(k: int = Query(default=4, ge=2, le=10)):
    return {"personas": generate_personas(_rfm_df, k=k)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
