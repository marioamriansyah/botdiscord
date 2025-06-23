/**
 * Copyright (c) 2023-2025 Cortex Realm | Made by Friday
 * Join Support Server: https://discord.gg/EWr3GgP6fe
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import Channel from '../models/Channel.js';

export const data = new SlashCommandBuilder()
  .setName('setup-channel')
  .setDescription('Set up a channel for AI interactions')
  .addChannelOption(option => 
    option.setName('channel')
      .setDescription('The channel to set up for AI (defaults to current channel)')
      .setRequired(false)
      .addChannelTypes(ChannelType.GuildText))
  .addStringOption(option =>
    option.setName('model')
      .setDescription('Select AI model to use in this channel')
      .setRequired(false)
      .addChoices(
        { name: 'Llama-3 70B (Default)', value: 'llama3-70b-8192' },
        { name: 'Llama-3 8B (Faster)', value: 'llama3-8b-8192' },
        { name: 'Mixtral 8x7B', value: 'mixtral-8x7b-32768' }
      ))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  try {
    // Defer reply to give time for processing
    await interaction.deferReply();
    
    // Get options
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const model = interaction.options.getString('model');
    
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
    
    // Create settings object with only provided options
    const settings = {};
    if (model) settings.aiModel = model;
    
    // Set up the channel
    const aiChannel = await Channel.findOrCreateChannel(
      interaction.guild.id,
      targetChannel.id,
      interaction.user.id
    );
    
    // Update settings if any were provided
    if (Object.keys(settings).length > 0) {
      await aiChannel.updateSettings(settings);
    }
    
    // Create success embed
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('AI Channel Setup')
      .setDescription(`✅ <#${targetChannel.id}> has been successfully set up as an AI channel.`)
      .addFields(
        { name: 'AI Model', value: aiChannel.settings.aiModel, inline: true },
        { name: 'Usage', value: 'The bot will respond to all messages in this channel.', inline: true },
      )
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
              .setColor('#5865F2')
              .setTitle('AI Channel Activated')
              .setDescription(`This channel has been set up for AI interactions by <@${interaction.user.id}>.\n\nThe AI will automatically respond to all messages in this channel.`)
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
    console.error('Error in setup-channel command:', error);
    
    await interaction.editReply({
      content: `❌ Failed to set up AI channel: ${error.message}`,
      ephemeral: true
    });
  }
} 