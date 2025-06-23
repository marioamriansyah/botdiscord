/**
 * Copyright (c) 2023-2025 Cortex Realm | Made by Friday
 * Join Support Server: https://discord.gg/EWr3GgP6fe
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import Channel from '../models/Channel.js';

export const data = new SlashCommandBuilder()
  .setName('list-channels')
  .setDescription('List all AI channels in this server')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  try {
    // Defer reply to give time for processing
    await interaction.deferReply();
    
    // Get all AI channels for the guild
    const channels = await Channel.getGuildChannels(interaction.guild.id);
    
    if (!channels || channels.length === 0) {
      return await interaction.editReply({
        content: '❌ No AI channels have been set up in this server.',
        ephemeral: true
      });
    }
    
    // Create embed with channel list
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('AI Channels')
      .setDescription(`This server has ${channels.length} AI ${channels.length === 1 ? 'channel' : 'channels'}:`)
      .setFooter({ 
        text: 'Cortex Realm AI Assistant | Made by Friday',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();
    
    // Add fields for each channel
    for (const channel of channels) {
      try {
        // Try to get channel information
        const discordChannel = interaction.guild.channels.cache.get(channel.channelId);
        const channelName = discordChannel ? discordChannel.name : 'Unknown Channel';
        
        embed.addFields({
          name: `#${channelName}`,
          value: `• **Model**: ${channel.settings.aiModel}\n• **Setup by**: <@${channel.createdBy}>`
        });
      } catch (error) {
        console.error(`Error getting channel info for ${channel.channelId}:`, error);
        embed.addFields({
          name: `Channel ID: ${channel.channelId}`,
          value: `• **Model**: ${channel.settings.aiModel}\n• **Setup by**: <@${channel.createdBy}>`
        });
      }
    }
    
    // Add note about usage
    embed.addFields({
      name: 'How It Works',
      value: 'The AI will automatically respond to all messages in these channels.'
    });
    
    // Send the response
    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error in list-channels command:', error);
    
    await interaction.editReply({
      content: `❌ Failed to list AI channels: ${error.message}`,
      ephemeral: true
    });
  }
} 