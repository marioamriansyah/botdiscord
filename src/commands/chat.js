import { SlashCommandBuilder } from 'discord.js';
import { createLoadingEmbed, createErrorEmbed, createActionButtons } from '../utils/embedUtils.js';
import { generateChatCompletion } from '../services/groqService.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';

export const data = new SlashCommandBuilder()
  .setName('chat')
  .setDescription('Chat with the AI assistant')
  .addStringOption(option =>
    option.setName('message')
      .setDescription('Your message to the AI')
      .setRequired(true));

export async function execute(interaction) {
  // Defer reply to give time for AI processing
  await interaction.deferReply();

  try {
    const userMessage = interaction.options.getString('message');
    const userId = interaction.user.id;
    const channelId = interaction.channelId;
    const username = interaction.user.username;

    // Get or create user in database
    const user = await User.findOrCreateUser(userId, username);
    
    // Get or create conversation
    const conversation = await Conversation.getOrCreateConversation(userId, channelId);
    
    // Add the user's message to the conversation
    await conversation.addMessage('user', userMessage);
    
    // Generate AI response using formatted messages without MongoDB _id fields
    const aiResponse = await generateChatCompletion(conversation.getFormattedMessages(), {
      model: user.settings.aiModel,
      temperature: user.settings.temperature,
      maxTokens: user.settings.maxTokens,
    });
    
    // Add the AI's response to the conversation
    await conversation.addMessage('assistant', aiResponse);
    
    // Create action buttons
    const actionRow = createActionButtons();
    
    // Send the response
    await interaction.editReply({
      content: aiResponse,
      components: [actionRow],
    });
  } catch (error) {
    console.error('Error in chat command:', error);
    
    const errorEmbed = createErrorEmbed(`Failed to process your request: ${error.message}`);
    
    await interaction.editReply({
      embeds: [errorEmbed],
    });
  }
} 