"""
Real clustering algorithms using scikit-learn on RFM customer data.
"""
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler
from scipy.cluster.hierarchy import linkage, to_tree
import json

FEATURE_COLS = ["log_Recency", "log_Frequency", "log_Monetary", "log_UniqueProducts"]


def _scale(rfm: pd.DataFrame):
    scaler = StandardScaler()
    X = scaler.fit_transform(rfm[FEATURE_COLS].fillna(0))
    return X


def run_kmeans(rfm: pd.DataFrame, k: int = 4, max_k: int = 10) -> dict:
    X = _scale(rfm)

    # Elbow + Silhouette
    inertias, silhouettes = [], []
    for ki in range(2, max_k + 1):
        km = KMeans(n_clusters=ki, random_state=42, n_init=10)
        labels = km.fit_predict(X)
        inertias.append(float(km.inertia_))
        sil = silhouette_score(X, labels) if ki > 1 else 0.0
        silhouettes.append(round(float(sil), 4))

    # Final model
    km_final = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km_final.fit_predict(X)

    rfm = rfm.copy()
    rfm["cluster"] = labels

    # Cluster summary
    summary = []
    for c in range(k):
        mask = rfm["cluster"] == c
        sub = rfm[mask]
        summary.append({
            "cluster": int(c),
            "size": int(mask.sum()),
            "avg_recency": round(float(sub["Recency"].mean()), 1),
            "avg_frequency": round(float(sub["Frequency"].mean()), 1),
            "avg_monetary": round(float(sub["Monetary"].mean()), 1),
        })

    # 2D PCA for scatter
    from sklearn.decomposition import PCA
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X)

    scatter_data = []
    for i, row in enumerate(coords):
        scatter_data.append({
            "x": round(float(row[0]), 4),
            "y": round(float(row[1]), 4),
            "cluster": int(labels[i]),
        })

    # Sample for speed (max 1000 points)
    if len(scatter_data) > 1000:
        import random
        random.seed(42)
        scatter_data = random.sample(scatter_data, 1000)

    return {
        "k": k,
        "elbow": [{"k": i + 2, "inertia": round(inertias[i], 2)} for i in range(len(inertias))],
        "silhouette": [{"k": i + 2, "score": silhouettes[i]} for i in range(len(silhouettes))],
        "cluster_summary": summary,
        "scatter": scatter_data,
        "total_silhouette": round(float(silhouette_score(X, labels)), 4),
    }


def run_hierarchical(rfm: pd.DataFrame, n_clusters: int = 4, method: str = "ward") -> dict:
    X = _scale(rfm)

    # Sample for linkage (max 500 for dendrogram performance)
    if X.shape[0] > 500:
        idx = np.random.RandomState(42).choice(X.shape[0], 500, replace=False)
        X_sample = X[idx]
    else:
        X_sample = X
        idx = np.arange(X.shape[0])

    model = AgglomerativeClustering(n_clusters=n_clusters, linkage=method)
    labels_full = model.fit_predict(X)

    # Linkage matrix for dendrogram
    Z = linkage(X_sample, method=method)

    def build_dendrogram_node(node, n_leaves):
        if node.is_leaf():
            return {"id": node.id, "count": 1}
        left = build_dendrogram_node(node.left, n_leaves)
        right = build_dendrogram_node(node.right, n_leaves)
        return {
            "id": node.id,
            "height": round(float(node.dist), 4),
            "count": node.count,
            "left": left,
            "right": right,
        }

    tree_root, _ = to_tree(Z, rd=True)
    dend = build_dendrogram_node(tree_root, X_sample.shape[0])

    # Cluster summary
    rfm2 = rfm.copy()
    rfm2["cluster"] = labels_full
    summary = []
    for c in range(n_clusters):
        mask = rfm2["cluster"] == c
        sub = rfm2[mask]
        summary.append({
            "cluster": int(c),
            "size": int(mask.sum()),
            "avg_recency": round(float(sub["Recency"].mean()), 1),
            "avg_frequency": round(float(sub["Frequency"].mean()), 1),
            "avg_monetary": round(float(sub["Monetary"].mean()), 1),
        })

    from sklearn.decomposition import PCA
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X)
    scatter_data = [{"x": round(float(r[0]), 4), "y": round(float(r[1]), 4), "cluster": int(labels_full[i])}
                    for i, r in enumerate(coords)]
    if len(scatter_data) > 1000:
        import random; random.seed(42)
        scatter_data = random.sample(scatter_data, 1000)

    return {
        "n_clusters": n_clusters,
        "dendrogram": dend,
        "cluster_summary": summary,
        "scatter": scatter_data,
    }


def run_dbscan(rfm: pd.DataFrame, eps: float = 0.5, min_samples: int = 5) -> dict:
    X = _scale(rfm)
    model = DBSCAN(eps=eps, min_samples=min_samples)
    labels = model.fit_predict(X)

    n_clusters = int(len(set(labels)) - (1 if -1 in labels else 0))
    noise_count = int((labels == -1).sum())
    noise_rate = round(noise_count / len(labels) * 100, 2)

    rfm2 = rfm.copy()
    rfm2["cluster"] = labels
    summary = []
    for c in sorted(set(labels)):
        mask = rfm2["cluster"] == c
        sub = rfm2[mask]
        summary.append({
            "cluster": int(c),
            "label": "Noise" if c == -1 else f"Cluster {c}",
            "size": int(mask.sum()),
            "avg_recency": round(float(sub["Recency"].mean()), 1),
            "avg_frequency": round(float(sub["Frequency"].mean()), 1),
            "avg_monetary": round(float(sub["Monetary"].mean()), 1),
        })

    from sklearn.decomposition import PCA
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X)
    scatter_data = [{"x": round(float(r[0]), 4), "y": round(float(r[1]), 4), "cluster": int(labels[i]), "noise": bool(labels[i] == -1)}
                    for i, r in enumerate(coords)]
    if len(scatter_data) > 1000:
        import random; random.seed(42)
        scatter_data = random.sample(scatter_data, 1000)

    return {
        "eps": eps,
        "min_samples": min_samples,
        "n_clusters": n_clusters,
        "noise_count": noise_count,
        "noise_rate": noise_rate,
        "cluster_summary": summary,
        "scatter": scatter_data,
    }
