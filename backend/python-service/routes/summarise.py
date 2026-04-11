from fastapi import APIRouter
from models.schemas import SummariseRequest, SummariseResponse
from services.llm_service import generate_summary

router = APIRouter()

"""Post route to create a new summary"""
@router.post("/summarise", response_model=SummariseResponse)
async def summarise(request: SummariseRequest):
    summary = await generate_summary(request.text)
    return SummariseResponse(summary=summary)