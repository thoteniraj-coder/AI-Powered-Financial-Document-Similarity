#!/usr/bin/env python3
import time
import requests
import statistics
import os

BASE_URL_BACKEND = "http://localhost:8080/api"
BASE_URL_EMBEDDING = "http://localhost:5000"

def benchmark_embedding():
    print("--- Benchmarking Embedding Service ---")
    latencies = []
    texts = {"texts": ["This is a sample financial document text for benchmarking."] * 10}
    
    # Warmup
    try:
        requests.post(f"{BASE_URL_EMBEDDING}/embed-batch", json=texts)
    except Exception as e:
        print(f"Failed to reach embedding service: {e}")
        return

    for i in range(50):
        start = time.time()
        resp = requests.post(f"{BASE_URL_EMBEDDING}/embed-batch", json=texts)
        latencies.append((time.time() - start) * 1000)
        
    print(f"Processed 50 batch requests (10 chunks each).")
    print(f"Average latency: {statistics.mean(latencies):.2f} ms")
    print(f"Min latency: {min(latencies):.2f} ms")
    print(f"Max latency: {max(latencies):.2f} ms")
    print()

def benchmark_backend_health():
    print("--- Benchmarking Backend Health Check ---")
    latencies = []
    
    try:
        requests.get(f"{BASE_URL_BACKEND}/health")
    except Exception as e:
        print(f"Failed to reach backend service: {e}")
        return

    for i in range(100):
        start = time.time()
        requests.get(f"{BASE_URL_BACKEND}/health")
        latencies.append((time.time() - start) * 1000)
        
    print(f"Processed 100 requests.")
    print(f"Average latency: {statistics.mean(latencies):.2f} ms")
    print(f"Min latency: {min(latencies):.2f} ms")
    print(f"Max latency: {max(latencies):.2f} ms")
    print()

if __name__ == "__main__":
    benchmark_embedding()
    benchmark_backend_health()
    print("Benchmarking complete.")
