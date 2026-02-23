"""
Maps KMeans cluster centroids to named marketing personas.
"""
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

FEATURE_COLS = ["log_Recency", "log_Frequency", "log_Monetary", "log_UniqueProducts"]


def _classify_persona(recency, frequency, monetary):
    """Heuristic RFM-based persona classification."""
    if frequency >= 10 and monetary >= 1000 and recency <= 30:
        return "Champion"
    elif frequency >= 5 and monetary >= 500:
        return "Loyal Customer"
    elif recency <= 30 and frequency <= 2:
        return "New Customer"
    elif recency >= 90 and frequency >= 5:
        return "At-Risk Customer"
    elif recency >= 180:
        return "Lost Customer"
    elif monetary >= 800 and frequency < 5:
        return "High-Value Occasional"
    else:
        return "Potential Loyalist"


PERSONA_META = {
    "Champion": {
        "icon": "Trophy",
        "color": "#f59e0b",
        "campaign": "Reward with exclusive early access, loyalty points, VIP programs.",
        "description": "Bought recently, buy often, and spend the most.",
    },
    "Loyal Customer": {
        "icon": "Heart",
        "color": "#10b981",
        "campaign": "Upsell higher-value products, ask for reviews and referrals.",
        "description": "Frequent buyers with consistent spend.",
    },
    "New Customer": {
        "icon": "Sparkles",
        "color": "#6366f1",
        "campaign": "Welcome series, onboarding offers, first-purchase discounts.",
        "description": "Recently acquired, low purchase history.",
    },
    "At-Risk Customer": {
        "icon": "AlertTriangle",
        "color": "#ef4444",
        "campaign": "Win-back emails with special offers, personalized recommendations.",
        "description": "Used to buy frequently but haven't purchased recently.",
    },
    "Lost Customer": {
        "icon": "UserX",
        "color": "#94a3b8",
        "campaign": "Reactivation campaigns with aggressive discounts.",
        "description": "Long inactive — haven't purchased in months.",
    },
    "High-Value Occasional": {
        "icon": "Star",
        "color": "#8b5cf6",
        "campaign": "Target with premium products and curated collections.",
        "description": "Spend a lot but purchase infrequently.",
    },
    "Potential Loyalist": {
        "icon": "TrendingUp",
        "color": "#06b6d4",
        "campaign": "Loyalty programs, bundle deals to increase frequency.",
        "description": "Recent customers with medium frequency.",
    },
}


def generate_personas(rfm: pd.DataFrame, k: int = 4) -> list:
    scaler = StandardScaler()
    X = scaler.fit_transform(rfm[FEATURE_COLS].fillna(0))
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X)
    rfm = rfm.copy()
    rfm["cluster"] = labels

    personas = []
    for c in range(k):
        sub = rfm[rfm["cluster"] == c]
        avg_r = float(sub["Recency"].mean())
        avg_f = float(sub["Frequency"].mean())
        avg_m = float(sub["Monetary"].mean())

        name = _classify_persona(avg_r, avg_f, avg_m)
        meta = PERSONA_META.get(name, PERSONA_META["Potential Loyalist"])

        personas.append({
            "cluster": int(c),
            "name": name,
            "size": int(len(sub)),
            "percentage": round(len(sub) / len(rfm) * 100, 1),
            "avg_recency": round(avg_r, 1),
            "avg_frequency": round(avg_f, 1),
            "avg_monetary": round(avg_m, 1),
            "icon": meta["icon"],
            "color": meta["color"],
            "campaign": meta["campaign"],
            "description": meta["description"],
            "radar": [
                {"metric": "Recency Score", "value": max(0, min(100, round(100 - avg_r / 3.65, 0)))},
                {"metric": "Frequency", "value": min(100, round(avg_f * 10, 0))},
                {"metric": "Monetary", "value": min(100, round(avg_m / 50, 0))},
                {"metric": "Diversity", "value": min(100, round(float(sub["UniqueProducts"].mean()), 0))},
                {"metric": "Basket Size", "value": min(100, round(float(sub["AvgBasketSize"].mean()) * 5, 0))},
            ],
        })
    return personas
