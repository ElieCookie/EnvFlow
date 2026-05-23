from fastapi import FastAPI
import os

app = FastAPI(title="EnvFlow Python API")


@app.get("/")
def root():
    return {"hello": "envflow", "lang": "python", "pid": os.getpid()}


@app.get("/health")
def health():
    return {"status": "ok"}
