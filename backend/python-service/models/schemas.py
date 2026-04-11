from pydantic import BaseModel

class SummariseRequest(BaseModel):
    text: str

class SummariseResponse(BaseModel):
    summary: str