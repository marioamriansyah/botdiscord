import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import imageCache from '../cache/imageCache.js';
import crypto from 'crypto';

export const data = new SlashCommandBuilder()
  .setName('ssrp')
  .setDescription('Images to SSRP.')
  .addAttachmentOption(option =>
    option.setName('images')
      .setDescription('Images to SSRP.')
      .setRequired(true)
  );

export async function execute(interaction) {
  const attachment = interaction.options.getAttachment('images');

  if (!attachment || !attachment.contentType.startsWith('image/')) {
    return interaction.reply({ content: '❌ Send images is valid!', ephemeral: true });
  }

  const imageUrl = attachment.url;

  // Buat ID unik untuk customId modal
  const uniqueKey = crypto.randomBytes(8).toString('hex');

  // Simpan ke cache
  imageCache.set(uniqueKey, imageUrl, 300); // kadaluarsa dalam 5 menit

  const modal = new ModalBuilder()
    .setCustomId(`ssrp-modal:${uniqueKey}`)
    .setTitle('Add text to image');

  const input = new TextInputBuilder()
    .setCustomId('teks')
    .setLabel('Chatlog')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(4000);

  const row = new ActionRowBuilder().addComponents(input);
  modal.addComponents(row);

  await interaction.showModal(modal);
}
