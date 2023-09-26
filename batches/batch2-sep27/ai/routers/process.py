from fastapi import APIRouter, HTTPException
from langchain_core.messages import HumanMessage
from langchainConfig import graph
from pydantic import BaseModel

class PromptRequest(BaseModel):
    prompt: str
    thread_id: str

class PromptResponse(BaseModel):
    response: str
    status: str = "success"

router = APIRouter()

@router.post("/api/process-prompt", response_model=PromptResponse)
async def process_prompt(request: PromptRequest):
    try:
        if not request.thread_id:
            raise HTTPException(status_code=400, detail="thread_id is required")
            
        config = {"configurable": {"thread_id": request.thread_id}}
        input_messages = [HumanMessage(content=request.prompt)]
        output = await graph.ainvoke({"messages": input_messages}, config)
        response = output["messages"][-1]
        
        return PromptResponse(
            response=response.content,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))