from fastapi import APIRouter
from models.schemas import SummarizeRequest, SummarizeResponse
from services.llm_service import generate_summary

router = APIRouter()

"""Post route to create a new summary"""
@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(request: SummarizeRequest):
    summary = await generate_summary(request.text)
    return SummarizeResponse(summary=summary)