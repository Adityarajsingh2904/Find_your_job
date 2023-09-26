import os
from langchain_chroma import Chroma
from dotenv import load_dotenv
from langchain_google_vertexai import VertexAIEmbeddings
from google.cloud import aiplatform

load_dotenv()
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "D:\\dev\\AI\\RAG\\FastAPI\\blue-collar-connect-1378c-42e629d16ba2.json"

# Initialize Vertex AI
aiplatform.init(
    project=os.getenv("GOOGLE_CLOUD_PROJECT"),  # Add your project ID to .env file
    location="us-central1",                     # or your preferred region
)

DATA_PATH = "./docs/"
CHROMA_DB_DIR = "./my_chroma_db" 

embeddings = VertexAIEmbeddings(model=os.getenv("EMBEDDINGS_MODEL_ID"))

vector_store = Chroma(embedding_function=embeddings, persist_directory=CHROMA_DB_DIR)
