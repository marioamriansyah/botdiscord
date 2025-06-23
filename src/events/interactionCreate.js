import { Events, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fetch from 'node-fetch';
import User from '../models/User.js';
import imageCache from '../cache/imageCache.js';

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction) {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return console.error(`❌ Command ${interaction.commandName} not found.`);
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`Error executing ${interaction.commandName}:`, err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Error executing command.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Error executing command.', ephemeral: true });
      }
    }
  }

  // Handle buttons
  else if (interaction.isButton()) {
    const [customId] = interaction.customId.split(':');
    const button = interaction.client.buttons.get(customId);
    if (!button) return console.error(`❌ Button ${customId} not found.`);
    try {
      await button.execute(interaction);
    } catch (err) {
      console.error(`Error executing button ${customId}:`, err);
      await interaction.reply({ content: 'Error executing button.', ephemeral: true });
    }
  }

  // Handle select menu
  else if (interaction.isStringSelectMenu()) {
    const userId = interaction.user.id;
    const customId = interaction.customId;
    const selectedValue = interaction.values[0];
    await interaction.deferUpdate();

    const user = await User.findOne({ userId });
    if (!user) return;

    try {
      if (customId === 'select_model') {
        await user.updateSettings({ aiModel: selectedValue });
        await interaction.followUp({ content: `✅ Model updated to ${selectedValue}`, ephemeral: true });
      } else if (customId === 'select_temperature') {
        await user.updateSettings({ temperature: parseFloat(selectedValue) });
        await interaction.followUp({ content: `✅ Temperature set to ${selectedValue}`, ephemeral: true });
      }
    } catch (err) {
      console.error('Error updating user:', err);
      await interaction.followUp({ content: '❌ Failed to update settings.', ephemeral: true });
    }
  }

  // Handle modal submit
  else if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith('ssrp-modal:')) {
      const key = interaction.customId.split(':')[1];
      const imageUrl = imageCache.get(key);
      const userText = interaction.fields.getTextInputValue('teks');

      if (!imageUrl) {
        return interaction.reply({ content: '❌ Gambar tidak ditemukan atau sudah kadaluarsa.', ephemeral: true });
      }

      await interaction.deferReply();

      try {
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        const image = await loadImage(Buffer.from(buffer));

        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');

        // Gambar dulu background gambar
        ctx.drawImage(image, 0, 0);

        // Styling teks
        ctx.font = '28px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;

        // Multi-line support
        const lines = userText.split('\n');
        const x = 200;
        let y = image.height - 300 - (lines.length - 1) * 35;

        for (const line of lines) {
          const isAsteriskLine = line.trim().startsWith('*');

          ctx.fillStyle = isAsteriskLine ? '#d481d4' : 'white';
          ctx.strokeStyle = isAsteriskLine ? '#000000' : 'black';

          const renderedLine = isAsteriskLine ? line.replace(/^\*\s*/, '') : line;
          ctx.strokeText(renderedLine, x, y);
          ctx.fillText(renderedLine, x, y);
          y += 35;
        }

        const bufferOut = canvas.toBuffer('image/png');
        const filename = `hasil-${Date.now()}.png`;

        const attachmentOut = new AttachmentBuilder(bufferOut, { name: filename });
        const embed = new EmbedBuilder()
          .setTitle('🖼️ Here is your generated image')
          .setDescription('**ChatLog:**\n```' + userText + '```')
          .setImage(`attachment://${filename}`)
          .setColor('#181818')
          .setFooter({
            text: 'Command executed by ' + interaction.user.username,
            iconURL: interaction.client.user.displayAvatarURL()
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed], files: [attachmentOut] });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: '❌ Failed load image.' });
      } finally {
        imageCache.delete(key);
      }
    }
  }
}