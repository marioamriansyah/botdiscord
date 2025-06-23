/**
 * Copyright (c) 2023-2025 Cortex Realm | Made by Friday
 * Join Support Server: https://discord.gg/EWr3GgP6fe
 */

import dotenv from 'dotenv';
import { GatewayIntentBits, Partials } from 'discord.js';

// Load environment variables
dotenv.config();

// Bot configuration
export const BOT_CONFIG = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
};

// Groq configuration (replaces OpenAI)
export const GROQ_CONFIG = {
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.3-70b-versatile', // Default model
  temperature: 1,
  maxTokens: 1024,
  stream: true,
};

// MongoDB configuration
export const MONGODB_CONFIG = {
  uri: process.env.MONGODB_URI,
};

// Discord.js client configuration
export const CLIENT_OPTIONS = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
  ],
}; 