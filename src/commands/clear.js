import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Conversation from '../models/Conversation.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Clear your conversation history with the AI assistant');

export async function execute(interaction) {
  try {
    const userId = interaction.user.id;
    const channelId = interaction.channelId;
    
    // Get active conversation
    const conversation = await Conversation.getOrCreateConversation(userId, channelId);
    
    // Clear the conversation history (except system messages)
    await conversation.clearHistory();
    
    // Create success embed
    const successEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('Conversation Cleared')
      .setDescription('Your conversation history has been cleared. The AI will no longer remember your previous messages in this channel.')
      .setFooter({ 
        text: 'AI Assistant',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();
    
    await interaction.reply({
      embeds: [successEmbed],
      ephemeral: true,
    });
  } catch (error) {
    console.error('Error in clear command:', error);
    
    await interaction.reply({
      content: 'There was an error while clearing your conversation history!',
      ephemeral: true,
    });
  }
} 