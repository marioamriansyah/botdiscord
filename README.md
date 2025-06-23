# 🤖 Groq AI Bot

<div align="center">

![Cortex Realm](https://img.shields.io/badge/Cortex%20Realm-AI%20Bot-blue?style=for-the-badge)
[![Discord](https://img.shields.io/discord/936698651257548904?color=5865F2&label=Discord&logo=discord&logoColor=white&style=for-the-badge)](https://discord.gg/EWr3GgP6fe)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-16+-green?style=for-the-badge&logo=node.js)

A powerful Discord bot with AI capabilities featuring a sleek, modern UI and an elegantly organized codebase.

</div>

---

## ✨ Features

- 🧠 **Advanced AI Conversations** - Powered by Groq API for lightning-fast responses
- 🔌 **Modular Architecture** - Clean command and event handler system
- 💾 **Database Integration** - MongoDB for storing user preferences and conversation history
- 🎨 **Beautiful UI** - Rich embeds and interactive components for optimal user experience
- 🛠️ **Customizable Settings** - Users can personalize their AI experience
- 🔄 **Interactive Responses** - Regenerate, continue, and manage AI responses with buttons
- 🤖 **AI Channels** - Set up dedicated channels for automatic AI responses to messages

## 📋 Prerequisites

- Node.js 16.9.0 or higher
- MongoDB database
- Discord bot token
- Groq API key

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/friday2su/groq-ai.git
   cd groq-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment variables**
   ```bash
   cp .env.example .env
   # Edit the .env file with your credentials
   ```

4. **Start the bot (automatically deploys commands)**
   ```bash
   npm start
   ```

## 💬 Commands

| Command | Description |
| ------- | ----------- |
| `/chat [message]` | Start a conversation with the AI |
| `/help` | Show available commands and info |
| `/settings` | Configure your AI preferences |
| `/clear` | Reset your conversation history |
| `/setup-channel` | Set up a channel for AI auto-responses |
| `/remove-channel` | Remove AI from a channel |
| `/list-channels` | List all AI channels in this server |

## ⚙️ Configuration

Configure your bot by setting these environment variables:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here

# Groq Configuration (Free AI API)
GROQ_API_KEY=your_groq_api_key_here

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here
```

## 📁 Project Structure

```
/
├── src/                    # Source code
│   ├── commands/           # Bot commands
│   ├── events/             # Discord.js event handlers
│   ├── models/             # Database models
│   ├── services/           # External service integrations
│   ├── utils/              # Utility functions
│   ├── config.js           # Configuration management
│   └── index.js            # Entry point & command deployment
├── .env                    # Environment variables
└── package.json            # Dependencies
```

## 🧩 Advanced Usage

### Run Commands

The bot provides several npm scripts for various operations:

```bash
npm start             # Start the bot with automatic command deployment
npm run start-only    # Start the bot without deploying commands (faster startup)
npm run dev           # Run in development mode with auto-restart
npm run deploy-and-run # Explicitly deploy commands and start the bot
```

### AI Channels

You can set up special AI channels where the bot will automatically respond to messages:

1. Use `/setup-channel` to configure a channel for AI responses
2. Set response chance (0-100%) to control how often the AI responds
3. Messages in this channel may receive automatic AI responses
4. Use `/remove-channel` to disable this feature
5. Server admins can view all AI channels with `/list-channels`

### Message Handling

The bot intelligently handles long AI responses by:
- Automatically splitting messages that exceed Discord's 2000 character limit
- Preserving formatting and structure in split messages
- Adding interactive buttons only to the final part of a split message

### Custom AI Models

The bot supports multiple Groq AI models:
- Llama-3 70B (Most capable)
- Llama-3 8B (Faster responses)
- Mixtral 8x7B (Alternative model)

Users can change models using the `/settings` command.

## 📝 Extending the Bot

Want to add new commands? It's easy:

1. Create a new file in the `src/commands` directory
2. Export `data` (SlashCommandBuilder) and `execute` (function)
3. The bot will automatically register your commands on next startup

Example:
```javascript
// src/commands/example.js
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('example')
  .setDescription('An example command');

export async function execute(interaction) {
  await interaction.reply('This is an example command!');
}
```

## ❓ Troubleshooting

- **Commands not showing up?** They should deploy automatically on startup, or manually run `npm run deploy-and-run`
- **MongoDB connection issues?** Verify your connection string in .env
- **API errors?** Check your Groq API key and quota limits
- **Want faster startup after commands are registered?** Use `npm run start-only`

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Support

Join our Discord server for support, feature requests, and updates:
[https://discord.gg/EWr3GgP6fe](https://discord.gg/EWr3GgP6fe)

---

<div align="center">

**Made with ❤️ by [Friday](https://github.com/friday2su)**  
© 2023-2025 Cortex Realm. All Rights Reserved.

</div> 