"""
Market basket analysis using real transaction data and Apriori algorithm (mlxtend).
"""
import pandas as pd
import numpy as np
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

CACHE_PATH = None  # computed each call unless cached at app level


def run_market_basket(df: pd.DataFrame, min_support: float = 0.02, min_confidence: float = 0.3) -> dict:
    """
    Run Apriori on real invoice data.
    df: raw Online Retail dataframe
    """
    # Build basket: one row per invoice, columns = products (bool)
    # Use top 50 products for tractability
    top_products = df["Description"].value_counts().head(50).index.tolist()
    df_top = df[df["Description"].isin(top_products)]

    basket = (
        df_top.groupby(["InvoiceNo", "Description"])["Quantity"]
        .sum()
        .unstack()
        .reset_index()
        .fillna(0)
        .set_index("InvoiceNo")
    )
    basket = basket.applymap(lambda x: x > 0)

    # Apriori
    frequent_items = apriori(basket, min_support=min_support, use_colnames=True)
    if frequent_items.empty:
        frequent_items = apriori(basket, min_support=0.01, use_colnames=True)

    rules = association_rules(frequent_items, metric="confidence", min_threshold=min_confidence)
    rules = rules.sort_values("lift", ascending=False)

    top_rules = []
    for _, row in rules.head(30).iterrows():
        top_rules.append({
            "antecedents": ", ".join(list(row["antecedents"])),
            "consequents": ", ".join(list(row["consequents"])),
            "support": round(float(row["support"]), 4),
            "confidence": round(float(row["confidence"]), 4),
            "lift": round(float(row["lift"]), 4),
        })

    # Co-occurrence matrix (top 20 products)
    top20 = df["Description"].value_counts().head(20).index.tolist()
    df20 = df[df["Description"].isin(top20)]
    b20 = (
        df20.groupby(["InvoiceNo", "Description"])["Quantity"]
        .sum()
        .unstack()
        .fillna(0)
        .applymap(lambda x: x > 0)
        .astype(int)
    )
    cooc = b20.T.dot(b20)
    np.fill_diagonal(cooc.values, 0)

    heatmap = []
    for r in cooc.index:
        for c in cooc.columns:
            heatmap.append({"row": str(r)[:25], "col": str(c)[:25], "value": int(cooc.loc[r, c])})

    # Item frequency
    item_freq = df["Description"].value_counts().head(20)
    item_freq_list = [{"item": str(k)[:25], "count": int(v)} for k, v in item_freq.items()]

    return {
        "top_rules": top_rules,
        "heatmap": heatmap,
        "item_frequency": item_freq_list,
        "total_rules": int(len(rules)),
        "total_frequent_itemsets": int(len(frequent_items)),
    }
