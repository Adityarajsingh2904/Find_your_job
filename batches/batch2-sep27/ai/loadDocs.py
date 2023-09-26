import shutil
import os
import glob
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from dotenv import load_dotenv
from embeddings import DATA_PATH, CHROMA_DB_DIR, vector_store, embeddings

# Load environment variables
load_dotenv()

# Function to clear the existing Chroma DB
def clear_chroma_db(db_directory: str):
    if os.path.exists(db_directory):
        try:
            shutil.rmtree(db_directory)
            print(f"Existing Chroma database at '{db_directory}' has been cleared.")
        except PermissionError:
            print(f"Warning: Could not delete the database at '{db_directory}' because it is being used by another process.")
            print("You may need to close other applications or restart your computer to release the lock.")
            print("Proceeding with creating a new vector store...")
            # Alternative: Use a different database path
            # return False
    return True

# Function to load all PDF documents from a directory
def load_docs(directory_path: str):
    all_documents = []
    pdf_files = glob.glob(os.path.join(directory_path, "*.pdf"))
    
    if not pdf_files:
        print(f"No PDF files found in {directory_path}")
        return all_documents
    
    for pdf_file in pdf_files:
        print(f"Processing: {pdf_file}")
        loader = PyPDFLoader(pdf_file)
        documents = loader.load()
        all_documents.extend(documents)
    
    print(f"Loaded {len(all_documents)} documents from {len(pdf_files)} PDF files.")
    return all_documents

# Function to split text into chunks
def split_text(documents: list[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,     # Overlap to maintain context between chunks
        length_function=len,   # Function to calculate the length of each chunk
        add_start_index=True,  # Optionally add start index to keep track of chunk order
    )
    chunks = text_splitter.split_documents(documents=documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")
    return chunks

# Clear existing Chroma DB
clear_chroma_db(CHROMA_DB_DIR)

# Load and process documents
documents = load_docs(DATA_PATH)
chunks = split_text(documents=documents)

# Add documents to the vector store
try:
    # Using embeddings imported from embeddings.py instead of AWS
    document_ids = vector_store.add_documents(documents=chunks)
    print("New data has been saved to the Chroma database.")
    print(f"Added {len(document_ids)} document chunks to the vector store.")
except Exception as e:
    print(f"An error occurred: {e}")