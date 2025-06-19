import { OpenAI } from '@langchain/openai';

export async function callLLMWithContext(query, context, openAIApiKey) {
  const llm = new OpenAI({ openAIApiKey, model: 'gpt-4o-mini' });
  const prompt = `Answer the question based on the context below.\n\nContext:\n${context}\n\nQuestion: ${query}`;
  return await llm.invoke(prompt);
} 