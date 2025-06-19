# RAG Backend (rag-be)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in `rag-be/` with your OpenAI API key:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   ```

3. Start the server:
   ```bash
   npm run dev
   # or
   npm start
   ```

## API Endpoints

### 1. POST /upload
- Upload a PDF file (form field: `file`).
- Parses the PDF, splits it into chunks, generates embeddings using OpenAI, and stores them in an in-memory vector store.
- Returns the number of chunks embedded.

**Example using curl:**
```bash
curl -F "file=@/path/to/your/file.pdf" http://localhost:3001/upload
```

### 2. POST /query
- Send a JSON body with a `query` field.
- Embeds the query, searches the vector store for relevant chunks, and uses OpenAI LLM (via LangChain) to answer based on the most relevant document chunks.
- Returns the answer and references.

**Example using curl:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"query": "What is RAG?"}' http://localhost:3001/query
``` 