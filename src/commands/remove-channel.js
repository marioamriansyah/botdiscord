/**
 * Copyright (c) 2023-2025 Cortex Realm | Made by Friday
 * Join Support Server: https://discord.gg/EWr3GgP6fe
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import Channel from '../models/Channel.js';

export const data = new SlashCommandBuilder()
  .setName('remove-channel')
  .setDescription('Remove AI auto-responses from a channel')
  .addChannelOption(option => 
    option.setName('channel')
      .setDescription('The channel to remove AI from (defaults to current channel)')
      .setRequired(false)
      .addChannelTypes(ChannelType.GuildText))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  try {
    // Defer reply to give time for processing
    await interaction.deferReply();
    
    // Get options
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    
    // Check permissions
    const member = interaction.member;
    const channel = interaction.guild.channels.cache.get(targetChannel.id);
    
    if (!channel) {
      return await interaction.editReply({
        content: '❌ Cannot find the specified channel.',
        ephemeral: true
      });
    }
    
    if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return await interaction.editReply({
        content: '❌ You need the "Manage Channels" permission to use this command.',
        ephemeral: true
      });
    }
    
    // Check if the channel is an AI channel
    const isAIChannel = await Channel.isAIChannel(interaction.guild.id, targetChannel.id);
    
    if (!isAIChannel) {
      return await interaction.editReply({
        content: `❌ <#${targetChannel.id}> is not set up as an AI channel.`,
        ephemeral: true
      });
    }
    
    // Remove the channel
    const success = await Channel.removeChannel(interaction.guild.id, targetChannel.id);
    
    if (!success) {
      return await interaction.editReply({
        content: `❌ Failed to remove AI from <#${targetChannel.id}>.`,
        ephemeral: true
      });
    }
    
    // Create success embed
    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('AI Channel Removed')
      .setDescription(`✅ <#${targetChannel.id}> has been successfully removed as an AI channel.`)
      .setFooter({ 
        text: 'Cortex Realm AI Assistant | Made by Friday',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();
    
    // Send the response
    await interaction.editReply({ embeds: [embed] });
    
    // Send a message to the channel if it's not the current channel
    if (targetChannel.id !== interaction.channelId) {
      try {
        await targetChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#ED4245')
              .setTitle('AI Channel Deactivated')
              .setDescription(`This channel's AI functionality has been removed by <@${interaction.user.id}>.`)
              .setFooter({ 
                text: 'Cortex Realm AI Assistant | Made by Friday',
                iconURL: interaction.client.user.displayAvatarURL()
              })
          ]
        });
      } catch (error) {
        console.error('Error sending confirmation to target channel:', error);
      }
    }
    
  } catch (error) {
    console.error('Error in remove-channel command:', error);
    
    await interaction.editReply({
      content: `❌ Failed to remove AI channel: ${error.message}`,
      ephemeral: true
    });
  }
} 