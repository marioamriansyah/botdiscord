/**
 * Copyright (c) 2023-2025 Cortex Realm | Made by Friday
 * Join Support Server: https://discord.gg/EWr3GgP6fe
 */

import { Groq } from 'groq-sdk';
import { GROQ_CONFIG } from '../config.js';

// Initialize Groq client
const groq = new Groq({
  apiKey: GROQ_CONFIG.apiKey,
});

/**
 * Generate a chat completion using Groq's API
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Optional parameters for the API call
 * @returns {Promise<string>} - The AI response text
 */
export async function generateChatCompletion(messages, options = {}) {
  try {
    const response = await groq.chat.completions.create({
      model: options.model || GROQ_CONFIG.model,
      messages: messages,
      temperature: options.temperature || GROQ_CONFIG.temperature,
      max_tokens: options.maxTokens || GROQ_CONFIG.maxTokens,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}

export default {
  generateChatCompletion,
}; 