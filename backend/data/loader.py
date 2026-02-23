"""
Data loading and feature engineering for the Online Retail II dataset (UCI id=502).
RFM + extended features are computed from real transaction data.
"""
import os
import pandas as pd
import numpy as np
from datetime import datetime

CACHE_PATH = os.path.join(os.path.dirname(__file__), "online_retail_clean.csv")
RFM_CACHE_PATH = os.path.join(os.path.dirname(__file__), "rfm_features.csv")


def _download_and_clean() -> pd.DataFrame:
    """Download raw dataset directly from UCI archive and apply basic cleaning."""
    import io
    import requests

    # Direct download URL for the Online Retail II xlsx from UCI archive
    url = "https://archive.ics.uci.edu/static/public/502/online+retail+ii.zip"
    print("⬇️  Downloading Online Retail II dataset from UCI archive...")
    try:
        resp = requests.get(url, timeout=120)
        resp.raise_for_status()
    except Exception as e:
        raise RuntimeError(f"Could not download dataset from UCI archive: {e}")

    import zipfile

    with zipfile.ZipFile(io.BytesIO(resp.content)) as z:
        # Find the xlsx file inside the zip
        xlsx_names = [n for n in z.namelist() if n.lower().endswith(".xlsx")]
        if not xlsx_names:
            raise RuntimeError("No .xlsx file found inside downloaded zip.")
        with z.open(xlsx_names[0]) as f:
            xlsx_bytes = f.read()

    # The workbook has two sheets: "Year 2009-2010" and "Year 2010-2011"
    xl = pd.ExcelFile(io.BytesIO(xlsx_bytes))
    frames = []
    for sheet in xl.sheet_names:
        frames.append(xl.parse(sheet))
    df = pd.concat(frames, ignore_index=True)

    # Standardise column names
    df.columns = [c.strip() for c in df.columns]
    rename = {
        "Invoice": "InvoiceNo",
        "StockCode": "StockCode",
        "Description": "Description",
        "Quantity": "Quantity",
        "InvoiceDate": "InvoiceDate",
        "Price": "UnitPrice",
        "Customer ID": "CustomerID",
        "Country": "Country",
    }
    df = df.rename(columns={k: v for k, v in rename.items() if k in df.columns})

    # Drop rows with missing CustomerID or Description
    df = df.dropna(subset=["CustomerID", "Description"])
    df["CustomerID"] = df["CustomerID"].astype(int)

    # Remove cancelled orders (InvoiceNo starts with 'C')
    df = df[~df["InvoiceNo"].astype(str).str.startswith("C")]

    # Remove negative quantities and price
    df = df[(df["Quantity"] > 0) & (df["UnitPrice"] > 0)]

    # Parse date
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])
    df["TotalPrice"] = df["Quantity"] * df["UnitPrice"]

    df.to_csv(CACHE_PATH, index=False)
    return df


def load_raw() -> pd.DataFrame:
    """Load or download the raw cleaned dataset."""
    if os.path.exists(CACHE_PATH):
        df = pd.read_csv(CACHE_PATH, parse_dates=["InvoiceDate"])
    else:
        df = _download_and_clean()
    return df


def compute_rfm(df: pd.DataFrame | None = None) -> pd.DataFrame:
    """Compute RFM + extended customer-level features."""
    if os.path.exists(RFM_CACHE_PATH):
        return pd.read_csv(RFM_CACHE_PATH)

    if df is None:
        df = load_raw()

    reference_date = df["InvoiceDate"].max() + pd.Timedelta(days=1)

    rfm = df.groupby("CustomerID").agg(
        Recency=("InvoiceDate", lambda x: (reference_date - x.max()).days),
        Frequency=("InvoiceNo", "nunique"),
        Monetary=("TotalPrice", "sum"),
        AvgOrderValue=("TotalPrice", "mean"),
        TotalItems=("Quantity", "sum"),
        UniqueProducts=("StockCode", "nunique"),
        Country=("Country", "first"),
    ).reset_index()

    rfm["AvgBasketSize"] = rfm["TotalItems"] / rfm["Frequency"]

    # Log-transform skewed features
    for col in ["Recency", "Frequency", "Monetary", "TotalItems", "UniqueProducts"]:
        rfm[f"log_{col}"] = np.log1p(rfm[col])

    rfm.to_csv(RFM_CACHE_PATH, index=False)
    return rfm


def get_dataset_stats() -> dict:
    """Return summary statistics about the loaded dataset."""
    df = load_raw()
    rfm = compute_rfm(df)
    return {
        "total_transactions": int(len(df)),
        "total_customers": int(rfm["CustomerID"].nunique()),
        "total_products": int(df["StockCode"].nunique()),
        "date_range": {
            "start": str(df["InvoiceDate"].min().date()),
            "end": str(df["InvoiceDate"].max().date()),
        },
        "total_revenue": round(float(df["TotalPrice"].sum()), 2),
        "avg_order_value": round(float(df["TotalPrice"].mean()), 2),
        "countries": int(df["Country"].nunique()),
    }
