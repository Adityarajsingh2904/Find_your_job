import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from google.cloud import aiplatform  # Make sure to import this

# Load environment variables from .env file
load_dotenv()
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "D:\\dev\\AI\\RAG\\FastAPI\\blue-collar-connect-1378c-42e629d16ba2.json"

# Initialize Vertex AI
aiplatform.init(
    project=os.getenv("GOOGLE_CLOUD_PROJECT"),  # Your Project ID from .env
    location="us-central1",                     # Your preferred region
)

# Initialize chat model
model = init_chat_model(
    os.getenv("GOOGLE_MODEL_ID"),               # Your model ID from .env (e.g., "chat-bison")
    model_provider="google_vertexai"
)
