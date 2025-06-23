const { ChatOpenAI } = require('@langchain/openai');
const { ChatOllama } = require('@langchain/ollama');
const opentracing = require('opentracing');

// Call LLM with context
 async function callLLMWithContext(query, context, openAIApiKey, parentSpan = null) {
  const tracer = opentracing.globalTracer();
  const span = tracer.startSpan('llm_call', parentSpan ? { childOf: parentSpan } : {});
  const llmStart = Date.now();
  const llm = new ChatOpenAI({ openAIApiKey, model: 'o1-mini-2024-09-12' });
  const prompt = `Answer the question based on the context below.\n\nContext:\n${context}\n\nQuestion: ${query}`;
  const result = await llm.invoke(prompt);
  const llmEnd = Date.now();
  span.log({ event: 'llm_time', value: llmEnd - llmStart });
  span.finish();
  return result;
} 

// Call LLM with context using LLaMA
 async function callLLMWithContextLLaMA(query, context, openAIApiKey, parentSpan = null) {
  const tracer = opentracing.globalTracer();
  const span = tracer.startSpan('llm_call_llama', parentSpan ? { childOf: parentSpan } : {});
  const llmStart = Date.now();
  const llm = new ChatOllama({ model: 'llama3.2' });
  const prompt = `Answer the question based on the context below.\n\nContext:\n${context}\n\nQuestion: ${query}`;
  const result = await llm.invoke(prompt);
  const llmEnd = Date.now();
  span.log({ event: 'llm_llama_time', value: llmEnd - llmStart });
  span.finish();
  return result;
}

module.exports = { callLLMWithContext, callLLMWithContextLLaMA };