"""
Dimensionality reduction: PCA and LDA using scikit-learn on real RFM features.
"""
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

FEATURE_COLS = ["log_Recency", "log_Frequency", "log_Monetary", "log_UniqueProducts", "AvgBasketSize"]


def _scale(rfm: pd.DataFrame):
    scaler = StandardScaler()
    X = scaler.fit_transform(rfm[FEATURE_COLS].fillna(0))
    return X


def run_pca(rfm: pd.DataFrame, n_components: int = 3) -> dict:
    X = _scale(rfm)
    pca = PCA(n_components=min(n_components, len(FEATURE_COLS)), random_state=42)
    coords = pca.fit_transform(X)

    # Get cluster labels (using KMeans=4 for coloring)
    km = KMeans(n_clusters=4, random_state=42, n_init=10)
    labels = km.fit_predict(X)

    explained = [round(float(v), 4) for v in pca.explained_variance_ratio_]
    cumulative = [round(float(sum(explained[:i+1])), 4) for i in range(len(explained))]

    # Component loadings
    loadings = []
    for i, comp in enumerate(pca.components_):
        loadings.append({
            "component": f"PC{i+1}",
            "loadings": {FEATURE_COLS[j]: round(float(comp[j]), 4) for j in range(len(FEATURE_COLS))}
        })

    # Scatter points
    scatter_2d, scatter_3d = [], []
    for i in range(len(coords)):
        pt = {"cluster": int(labels[i])}
        pt["x"] = round(float(coords[i][0]), 4)
        pt["y"] = round(float(coords[i][1]), 4)
        scatter_2d.append(pt)
        if n_components >= 3:
            scatter_3d.append({
                "x": round(float(coords[i][0]), 4),
                "y": round(float(coords[i][1]), 4),
                "z": round(float(coords[i][2]), 4),
                "cluster": int(labels[i]),
            })

    # Sample
    if len(scatter_2d) > 800:
        import random; random.seed(42)
        idxs = random.sample(range(len(scatter_2d)), 800)
        scatter_2d = [scatter_2d[i] for i in idxs]
        scatter_3d = [scatter_3d[i] for i in idxs] if scatter_3d else []

    return {
        "explained_variance": [{"component": f"PC{i+1}", "variance": explained[i], "cumulative": cumulative[i]} for i in range(len(explained))],
        "loadings": loadings,
        "scatter_2d": scatter_2d,
        "scatter_3d": scatter_3d,
        "total_variance_explained": cumulative[-1],
    }


def run_lda(rfm: pd.DataFrame, n_components: int = 2) -> dict:
    X = _scale(rfm)

    # LDA requires labels — use KMeans
    km = KMeans(n_clusters=4, random_state=42, n_init=10)
    labels = km.fit_predict(X)

    max_comp = min(n_components, len(set(labels)) - 1, len(FEATURE_COLS))
    lda = LinearDiscriminantAnalysis(n_components=max_comp)
    coords = lda.fit_transform(X, labels)

    explained = [round(float(v), 4) for v in lda.explained_variance_ratio_] if hasattr(lda, "explained_variance_ratio_") else []

    scatter = []
    for i in range(len(coords)):
        pt = {"cluster": int(labels[i]), "x": round(float(coords[i][0]), 4)}
        if max_comp >= 2:
            pt["y"] = round(float(coords[i][1]), 4)
        scatter.append(pt)

    if len(scatter) > 800:
        import random; random.seed(42)
        scatter = random.sample(scatter, 800)

    return {
        "n_components": max_comp,
        "scatter": scatter,
        "explained_variance": [{"component": f"LD{i+1}", "variance": v} for i, v in enumerate(explained)],
    }
