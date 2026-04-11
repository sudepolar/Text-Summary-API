from fastapi import FastAPI
from routes.summarise import router

app = FastAPI()
app.include_router(router)