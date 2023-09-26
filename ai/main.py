from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from contextlib import asynccontextmanager
from routers import process, stream
import os
import json

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the credentials from the environment variable
    service_account_info = json.loads(os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON", "{}"))
    
    if service_account_info:
        # Save the credentials to a file
        with open("service_account.json", "w") as f:
            json.dump(service_account_info, f)

        # Set the path to the credentials file (applies globally)
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "service_account.json"

    # Startup complete
    yield
    # Cleanup if necessary

api = FastAPI(lifespan=lifespan)

# Middleware to allow CORS for your frontend
api.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-project.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routers
api.include_router(process.router)
api.include_router(stream.router)

# Health check endpoint
@api.get("/")
async def health_check():
    return {"status": "healthy"}
