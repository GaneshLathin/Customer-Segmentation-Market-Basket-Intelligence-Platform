import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000",
    timeout: 60000,
});

export const fetchDatasetStats = () => API.get("/api/dataset/stats").then((r) => r.data);
export const fetchKMeans = (k) => API.get(`/api/kmeans?k=${k}`).then((r) => r.data);
export const fetchHierarchical = (n) => API.get(`/api/hierarchical?n_clusters=${n}`).then((r) => r.data);
export const fetchDBSCAN = (eps, minSamples) =>
    API.get(`/api/dbscan?eps=${eps}&min_samples=${minSamples}`).then((r) => r.data);
export const fetchPCA = (n) => API.get(`/api/pca?n_components=${n}`).then((r) => r.data);
export const fetchLDA = (n) => API.get(`/api/lda?n_components=${n}`).then((r) => r.data);
export const fetchMarketBasket = (support, confidence) =>
    API.get(`/api/market-basket?min_support=${support}&min_confidence=${confidence}`).then((r) => r.data);
export const fetchReports = (k) => API.get(`/api/reports?k=${k}`).then((r) => r.data);
