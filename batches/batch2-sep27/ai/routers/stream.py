import re
from typing import AsyncGenerator
from langchain_core.messages import AIMessage
from fastapi.responses import StreamingResponse
from fastapi import APIRouter, HTTPException
from langchainConfig import graph


router = APIRouter()

async def clean_chunk_content(chunk) -> str:
    """Clean and validate chunk content"""
    if not chunk:
        return ""
    
    # Handle different chunk formats
    if isinstance(chunk, dict):
        content = chunk.get('text', '')
    elif isinstance(chunk, str):
        content = chunk
    else:
        content = str(chunk)  # Convert non-string/dict chunks to string
    
    # Remove any special tokens
    special_tokens = [
        "<|start_header_id|>",
        "<|end_header_id|>",
        "<|start|>",
        "<|end|>",
    ]
    
    for token in special_tokens:
        content = content.replace(token, "")
    
    # Remove ANSI escape sequences
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    content = ansi_escape.sub('', content)
    
    return content

@router.get("/api/stream-prompt")
async def stream_prompt(thread_id: str, prompt: str):
    try:
        if not thread_id:
            raise HTTPException(status_code=400, detail="thread_id is required")
        
        if not prompt:
            raise HTTPException(status_code=400, detail="prompt is required")
        
        config = {"configurable": {"thread_id": thread_id}}
        
        async def message_stream() -> AsyncGenerator[str, None]:
            try:
                async for chunk, metadata in graph.astream(
                    {"messages": [{"role": "user", "content": prompt}]},  # Fixed: proper message format
                    config,
                    stream_mode="messages"  # Changed from "values" to "messages"
                ):
                    if isinstance(chunk, AIMessage):
                        try:
                            content = chunk.content
                            if isinstance(content, list):
                                for item in content:
                                    cleaned_text = await clean_chunk_content(item)
                                    if cleaned_text:
                                        yield f"data: {cleaned_text}\n\n"
                            else:
                                cleaned_text = await clean_chunk_content(content)
                                if cleaned_text:
                                    yield f"data: {cleaned_text}\n\n"
                        except Exception as e:
                            continue
                
                yield "event: done\ndata: \n\n"
            except Exception as e:
                yield f"event: error\ndata: {str(e)}\n\n"
        
        return StreamingResponse(
            message_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))