import { createErrorEmbed, createActionButtons } from '../utils/embedUtils.js';
import { generateChatCompletion } from '../services/groqService.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';

export const customId = 'regenerate';

export async function execute(interaction) {
  await interaction.deferUpdate();
  
  try {
    const userId = interaction.user.id;
    const channelId = interaction.channelId;
    const username = interaction.user.username;
    
    const user = await User.findOrCreateUser(userId, username);
    const conversation = await Conversation.getOrCreateConversation(userId, channelId);
    
    if (conversation.messages.length > 0 && conversation.messages[conversation.messages.length - 1].role === 'assistant') {
      conversation.messages.pop();
      await conversation.save();
    }
    
    const aiResponse = await generateChatCompletion(conversation.getFormattedMessages(), {
      model: user.settings.aiModel,
      temperature: user.settings.temperature + 0.2,
      maxTokens: user.settings.maxTokens,
    });
    
    await conversation.addMessage('assistant', aiResponse);
    
    const actionRow = createActionButtons();
    
    await interaction.editReply({
      content: aiResponse,
      components: [actionRow],
      embeds: []
    });
  } catch (error) {
    console.error('Error in regenerate button:', error);
    
    const errorEmbed = createErrorEmbed(`Failed to generate new response: ${error.message}`);
    
    await interaction.editReply({
      embeds: [errorEmbed],
      components: [],
    });
  }
}
