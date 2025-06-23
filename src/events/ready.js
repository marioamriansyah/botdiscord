
import { Events, ActivityType } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export function execute(client) {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  client.user.setActivity('with 𝕷𝖆 𝕮𝖗𝖔𝖈𝖎𝖆𝖙𝖆 𝕹𝖊𝖗𝖆', { type: ActivityType.Playing });
  
  // Log server count
  console.log(`Bot is active in ${client.guilds.cache.size} servers`);
} 