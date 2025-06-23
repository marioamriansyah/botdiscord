/**
 * Copyright (c) 2023-2025 Cortex Realm | Made by Friday
 * Join Support Server: https://discord.gg/EWr3GgP6fe
 */

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

/**
 * Create a styled embed for AI responses
 * @param {string} content - The message content
 * @param {Object} options - Optional parameters
 * @returns {EmbedBuilder} - A Discord embed
 */
export function createResponseEmbed(content, options = {}) {
  const embed = new EmbedBuilder()
    .setColor(options.color || '#5865F2')
    .setDescription(content)
    .setFooter({
      text: options.footer || 'Cortex Realm AI Assistant | Join Support Server',
      iconURL: options.footerIcon,
    });
  
  if (options.title) {
    embed.setTitle(options.title);
  }
  
  if (options.thumbnail) {
    embed.setThumbnail(options.thumbnail);
  }
  
  if (options.image) {
    embed.setImage(options.image);
  }
  
  if (options.author) {
    embed.setAuthor({
      name: options.author.name,
      iconURL: options.author.icon,
      url: options.author.url,
    });
  }
  
  if (options.timestamp) {
    embed.setTimestamp();
  }
  
  return embed;
}

/**
 * Create a styled embed for errors
 * @param {string} errorMessage - The error message
 * @returns {EmbedBuilder} - A Discord embed
 */
export function createErrorEmbed(errorMessage) {
  return new EmbedBuilder()
    .setColor('#ED4245')
    .setTitle('Error')
    .setDescription(errorMessage)
    .setFooter({
      text: 'AI Assistant', 
    })
    .setTimestamp();
}

/**
 * Create a loading embed
 * @returns {EmbedBuilder} - A Discord embed
 */
export function createLoadingEmbed() {
  return new EmbedBuilder()
    .setColor('#5865F2')
    .setDescription('⏳ Processing your request...')
    .setFooter({
      text: 'Cortex Realm AI Assistant',
    });
}

/**
 * Create navigation buttons for long responses
 * @returns {ActionRowBuilder} - A row of buttons
 */
export function createNavigationButtons() {
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('prev_page')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⬅️'),
      new ButtonBuilder()
        .setCustomId('next_page')
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('➡️'),
      new ButtonBuilder()
        .setCustomId('delete_message')
        .setLabel('Delete')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
    );
  
  return row;
}

/**
 * Create action buttons for AI responses
 * @returns {ActionRowBuilder} - A row of buttons
 */
export function createActionButtons() {
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('regenerate')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔄')
    );
  
  return row;
} 