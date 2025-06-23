/**
 * Copyright (c) 2023-2025 Cortex Realm | Made by Friday
 * Join Support Server: https://discord.gg/EWr3GgP6fe
 */

import { Client, Collection, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import { BOT_CONFIG, CLIENT_OPTIONS, MONGODB_CONFIG } from './config.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new client instance
const client = new Client(CLIENT_OPTIONS);

// Create collections for commands and buttons
client.commands = new Collection();
client.buttons = new Collection();

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_CONFIG.uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

// Load commands
async function loadCommands() {
  try {
    const commandsPath = path.join(__dirname, 'commands');
    
    // Check if the commands directory exists
    if (!fs.existsSync(commandsPath)) {
      console.warn('Commands directory does not exist. Skipping command loading.');
      return [];
    }
    
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const commandsData = [];
    
    console.log(`Found ${commandFiles.length} command files to load...`);
    
    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        const command = await import(`file://${filePath}`);
        
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          commandsData.push(command.data.toJSON());
          console.log(`✅ Loaded command: ${command.data.name}`);
        } else {
          console.warn(`⚠️ The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
      } catch (error) {
        console.error(`❌ Error loading command file ${file}:`, error);
      }
    }
    
    console.log(`Successfully loaded ${client.commands.size} commands.`);
    return commandsData;
  } catch (error) {
    console.error('Error loading commands:', error);
    return [];
  }
}

// Load button handlers
async function loadButtons() {
  try {
    const buttonsPath = path.join(__dirname, 'buttons');
    
    // Check if the buttons directory exists
    if (!fs.existsSync(buttonsPath)) {
      console.warn('Buttons directory does not exist. Skipping button loading.');
      return;
    }
    
    const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
    
    console.log(`Found ${buttonFiles.length} button files to load...`);
    
    for (const file of buttonFiles) {
      try {
        const filePath = path.join(buttonsPath, file);
        const button = await import(`file://${filePath}`);
        
        if ('customId' in button && 'execute' in button) {
          client.buttons.set(button.customId, button);
          console.log(`✅ Loaded button handler: ${button.customId}`);
        } else {
          console.warn(`⚠️ The button handler at ${filePath} is missing a required "customId" or "execute" property.`);
        }
      } catch (error) {
        console.error(`❌ Error loading button file ${file}:`, error);
      }
    }
    
    console.log(`Successfully loaded ${client.buttons.size} button handlers.`);
  } catch (error) {
    console.error('Error loading buttons:', error);
  }
}

// Load events
async function loadEvents() {
  try {
    const eventsPath = path.join(__dirname, 'events');
    
    // Check if the events directory exists
    if (!fs.existsSync(eventsPath)) {
      console.warn('Events directory does not exist. Skipping event loading.');
      return;
    }
    
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    console.log(`Found ${eventFiles.length} event files to load...`);
    
    for (const file of eventFiles) {
      try {
        const filePath = path.join(eventsPath, file);
        const event = await import(`file://${filePath}`);
        
        if (!event.name) {
          console.warn(`⚠️ The event at ${filePath} is missing a required "name" property.`);
          continue;
        }
        
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args));
          console.log(`✅ Loaded one-time event: ${event.name}`);
        } else {
          client.on(event.name, (...args) => event.execute(...args));
          console.log(`✅ Loaded event: ${event.name}`);
        }
      } catch (error) {
        console.error(`❌ Error loading event file ${file}:`, error);
      }
    }
    
    console.log(`Successfully loaded all events.`);
  } catch (error) {
    console.error('Error loading events:', error);
  }
}

// Deploy slash commands to Discord
async function deployCommands(commandsData) {
  try {
    if (!commandsData || commandsData.length === 0) {
      console.error('No commands to deploy.');
      return 0;
    }
    
    console.log(`Started refreshing ${commandsData.length} application (/) commands...`);
    
    // Prepare REST instance
    const rest = new REST().setToken(BOT_CONFIG.token);
    
    // Deploy commands globally
    const data = await rest.put(
      Routes.applicationCommands(BOT_CONFIG.clientId),
      { body: commandsData },
    );
    
    console.log(`✅ Successfully registered ${data.length} global application (/) commands.`);
    return data.length;
  } catch (error) {
    console.error('Error deploying commands:', error);
    return 0;
  }
}

// Load command handlers and register them
async function registerCommands() {
  try {
    // Load all commands
    const commandsToRegister = await loadCommands();
    
    // Deploy commands
    return await deployCommands(commandsToRegister);
  } catch (error) {
    console.error('Error registering commands:', error);
    return 0;
  }
}

// Initialize bot
async function initializeBot() {
  console.log('Starting Mario Discord Bot...');
  
  await connectToDatabase();
  
  if (process.argv.includes('--deploy')) {
    await registerCommands();
    console.log('Command deployment completed. Exiting...');
    process.exit(0);
  }

  if (process.argv.includes('--register')) {
    await registerCommands();
    console.log('Command registration completed. Continuing with bot startup...');
  }
  
  // Automatically deploy commands unless --no-deploy flag is present
  if (!process.argv.includes('--no-deploy') && 
      !process.argv.includes('--register')) {
    console.log('Auto-deploying commands on startup...');
    await registerCommands();
    console.log('Command registration completed. Continuing with bot startup...');
  }
  
  // Load commands, buttons, and events
  await loadCommands();
  await loadButtons();
  await loadEvents();
  
  // Log in to Discord
  await client.login(BOT_CONFIG.token);
  
  console.log('┌──────────────────────────────────────┐');
  console.log('│     M AI Bot Online!      │');
  console.log('└──────────────────────────────────────┘');
}

// Process command line arguments
if (process.argv.includes('--deploy')) {
  // Register commands and exit
  console.log('Command registration mode activated...');
  registerCommands().then((count) => {
    if (count > 0) {
      console.log(`┌──────────────────────────────────────┐`);
      console.log(`│  Registered ${count.toString().padStart(2, ' ')} commands successfully!  │`);
      console.log(`└──────────────────────────────────────┘`);
    } else {
      console.error('Failed to register commands.');
    }
    process.exit(count > 0 ? 0 : 1);
  }).catch(error => {
    console.error('Error during command registration:', error);
    process.exit(1);
  });
} else if (process.argv.includes('--register')) {
  // Register commands then start the bot
  console.log('Register and start mode activated...');
  registerCommands().then(() => {
    initializeBot();
  }).catch(error => {
    console.error('Error during command registration:', error);
    process.exit(1);
  });
} else {
  // Start the bot normally
  initializeBot();
} 