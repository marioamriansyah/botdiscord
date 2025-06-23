/**
 * Copyright (c) 2023-2025 Cortex Realm | Made by Friday
 * Join Support Server: https://discord.gg/EWr3GgP6fe
 */

import { Events, EmbedBuilder } from 'discord.js';
import { generateChatCompletion } from '../services/groqService.js';
import { createActionButtons } from '../utils/embedUtils.js';
import Channel from '../models/Channel.js';
import Conversation from '../models/Conversation.js';

export const name = Events.MessageCreate;
export const once = false;

// Discord message character limit
const DISCORD_MESSAGE_LIMIT = 2000;

// Helper function to split long messages
function splitMessage(content) {
  if (content.length <= DISCORD_MESSAGE_LIMIT) {
    return [content];
  }

  const parts = [];
  let currentPart = '';
  
  // First try to split by double line breaks to preserve formatting
  const paragraphs = content.split('\n\n');
  
  for (const paragraph of paragraphs) {
    // If a single paragraph is too long, we'll need to split it further
    if (paragraph.length > DISCORD_MESSAGE_LIMIT) {
      // If current part isn't empty, push it
      if (currentPart.length > 0) {
        parts.push(currentPart);
        currentPart = '';
      }
      
      // Split the paragraph by single line breaks
      const lines = paragraph.split('\n');
      for (const line of lines) {
        // If a single line is too long, split it into chunks
        if (line.length > DISCORD_MESSAGE_LIMIT) {
          // If current part isn't empty, push it
          if (currentPart.length > 0) {
            parts.push(currentPart);
            currentPart = '';
          }
          
          // Split the line into chunks of DISCORD_MESSAGE_LIMIT characters
          let remainingLine = line;
          while (remainingLine.length > 0) {
            const chunk = remainingLine.slice(0, DISCORD_MESSAGE_LIMIT);
            parts.push(chunk);
            remainingLine = remainingLine.slice(DISCORD_MESSAGE_LIMIT);
          }
        }
        // If adding the line would exceed the limit, start a new part
        else if (currentPart.length + line.length + 1 > DISCORD_MESSAGE_LIMIT) {
          parts.push(currentPart);
          currentPart = line;
        }
        // Otherwise, add the line to the current part
        else {
          currentPart = currentPart.length > 0 ? `${currentPart}\n${line}` : line;
        }
      }
    }
    // If adding the paragraph would exceed the limit, start a new part
    else if (currentPart.length + paragraph.length + 2 > DISCORD_MESSAGE_LIMIT) {
      parts.push(currentPart);
      currentPart = paragraph;
    }
    // Otherwise, add the paragraph to the current part
    else {
      currentPart = currentPart.length > 0 ? `${currentPart}\n\n${paragraph}` : paragraph;
    }
  }
  
  // Add the last part if it's not empty
  if (currentPart.length > 0) {
    parts.push(currentPart);
  }
  
  return parts;
}

export async function execute(message) {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Ignore direct messages
  if (!message.guild) return;
  
  try {
    // Check if the channel is an AI channel
    const aiChannel = await Channel.findOne({ 
      guildId: message.guild.id, 
      channelId: message.channel.id 
    });
    
    // If not an AI channel, ignore the message
    if (!aiChannel) return;
    
    // Get or create conversation
    const conversation = await Conversation.getOrCreateConversation(
      message.author.id,
      message.channel.id
    );

    // Remove buttons from previous message if it exists
    if (conversation.lastMessageId) {
      try {
        const previousMessage = await message.channel.messages.fetch(conversation.lastMessageId);
        if (previousMessage && previousMessage.editable) {
          await previousMessage.edit({ components: [] });
        }
      } catch (error) {
        console.error('Error removing buttons from previous message:', error);
        // Continue execution even if button removal fails
      }
    }
    
    // Add user message to conversation history
    await conversation.addMessage('user', message.content);
    
    // Show typing indicator
    await message.channel.sendTyping();
    
    // Generate AI response using properly formatted messages
    const aiResponse = await generateChatCompletion(
      conversation.getFormattedMessages(),
      { model: aiChannel.settings.aiModel }
    );
    
    // Add AI response to conversation history
    await conversation.addMessage('assistant', aiResponse);
    
    // Create simplified action buttons
    const actionRow = createActionButtons();
    
    let sentMessage;
    
    // Check if the response needs to be split
    const responseParts = splitMessage(aiResponse);
    
    if (responseParts.length === 1) {
      // Send as a single message if it's within the limit
      sentMessage = await message.reply({
        content: aiResponse,
        components: [actionRow],
      });
    } else {
      // Send the first part as a reply
      sentMessage = await message.reply({
        content: responseParts[0],
        components: [], // No buttons on multi-part messages until the last part
      });
      
      // Send the middle parts as follow-ups
      for (let i = 1; i < responseParts.length - 1; i++) {
        await message.channel.send({
          content: responseParts[i],
          components: [],
        });
      }
      
      // Send the last part with the action buttons
      const lastMessage = await message.channel.send({
        content: responseParts[responseParts.length - 1],
        components: [actionRow],
      });
      
      // Update the sentMessage to be the last one (with buttons)
      sentMessage = lastMessage;
    }
    
    // Update the conversation with the new message ID (the last one with buttons)
    await conversation.updateLastMessageId(sentMessage.id);
    
  } catch (error) {
    console.error('Error in message event handler:', error);
    
    // Try to send a simplified error message if possible
    try {
      await message.reply({
        content: "I'm sorry, I encountered an error while processing your message. Please try again with a shorter message or different query.",
      });
    } catch (replyError) {
      console.error('Failed to send error message:', replyError);
    }
  }
} 