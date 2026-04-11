from fastapi import FastAPI
from routes.summarize import router

app = FastAPI()
app.include_router(router)