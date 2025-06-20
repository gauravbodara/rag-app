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

## Project Structure

- `index.js`: Main entry, sets up Express and mounts API routers.
- `routes/api/`: Contains separated route handlers for `/upload` and `/query` endpoints.
- `service/`: Business logic for PDF parsing, embeddings, and LLM calls.
- `utils/logger.js`: Winston-based logger for production-grade logging.

## API Endpoints

### 1. POST /upload
- Upload a PDF file (form field: `file`).
- Parses the PDF, splits it into chunks, generates embeddings, and stores them in the vector store.
- Returns the number of chunks embedded.

**Example using curl:**
```bash
curl -F "file=@/path/to/your/file.pdf" http://localhost:3001/upload
```

### 2. POST /query
- Send a JSON body with a `query` field.
- Embeds the query, searches the vector store for relevant chunks, and uses the LLM to answer based on the most relevant document chunks.
- Returns the answer and references.

**Example using curl:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"query": "What is RAG?"}' http://localhost:3001/query
```

## Logging

- All requests, errors, and key operations are logged using Winston. Logs are output to the console by default.
- Log level is set by `NODE_ENV` (debug for development, info for production).

## Production Readiness

- Centralized error handling and robust logging.
- Modular code structure for maintainability and scalability. 