# rag-appAdd commentMore actions

## Setup Instructions

Before starting the application, add your `OPENAI_API_KEY` to the `rag-be` service in `docker-compose.yml`:

```yaml
environment:
  - OLLAMA_URL=http://ollama:11434
  - QDRANT_URL=http://qdrant:6333
  - OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

After setting the API key, start the application using the following command:

```sh
docker-compose up -d
```

This will start all services in detached mode.