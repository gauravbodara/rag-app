import { ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/ollama';

export async function callLLMWithContext(query, context, openAIApiKey) {
  const llm = new ChatOpenAI({ openAIApiKey, model: 'o1-mini-2024-09-12' });
  const prompt = `Answer the question based on the context below.\n\nContext:\n${context}\n\nQuestion: ${query}`;
  // console.log("LLM Prompt:", prompt);
  const result = await llm.invoke(prompt);
  // console.log("LLM Result:", result);
  return result;
} 

export async function callLLMWithContextLLaMA(query, context, openAIApiKey) {
  const llm = new ChatOllama({ model: 'llama3.2' });
  const prompt = `Answer the question based on the context below.\n\nContext:\n${context}\n\nQuestion: ${query}`;
  // console.log("LLM Prompt:", prompt);
  const result = await llm.invoke(prompt);
  console.log("LLM Result:", result);
  return result;
}