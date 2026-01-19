// Discord Service for SocialFlyAI
import axios, { AxiosRequestConfig } from 'axios';

// Read from environment at module level, not in constructor
const DISCORD_API_BASE = process.env.DISCORD_API_BASE || 'https://discord.com/api/v10';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

export interface DiscordMessageData {
  channelId: string;
  content?: string;
  embeds?: any[];
  components?: any[];
}

export interface DiscordMediaMessageData extends DiscordMessageData {
  files: File[];
}

// Helper function to make Discord API requests (similar to NovaLink_Discord)
const discordRequest = async (method: string, endpoint: string, data: any = null) => {
  try {
    const url = `${DISCORD_API_BASE}${endpoint}`;
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
      },
    };

    if (data) {
      config.data = data;
    }

    console.log('Discord Request:', {
      method,
      endpoint,
      url,
      hasToken: !!DISCORD_BOT_TOKEN,
      tokenLength: DISCORD_BOT_TOKEN.length,
      tokenPreview: DISCORD_BOT_TOKEN.substring(0, 20) + '...'
    });

    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    console.error('Discord API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      endpoint,
      url: `${DISCORD_API_BASE}${endpoint}`
    });
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
      details: error.response?.data
    };
  }
};

export class DiscordService {
  async sendMessage(data: DiscordMessageData) {
    const { channelId, content, embeds, components } = data;

    if (!channelId || !content) {
      throw new Error('channelId and content are required');
    }

    if (!DISCORD_BOT_TOKEN) {
      throw new Error('Discord bot token is not configured. Please set DISCORD_BOT_TOKEN in .env file');
    }

    const messageData: any = { content };
    if (embeds) messageData.embeds = embeds;
    if (components) messageData.components = components;

    const result = await discordRequest(
      'POST',
      `/channels/${channelId}/messages`,
      messageData
    );

    return result;
  }

  async sendMessageWithMedia(channelId: string, content: string, files: File[]) {
    if (!DISCORD_BOT_TOKEN) {
      throw new Error('Discord bot token is not configured. Please set DISCORD_BOT_TOKEN in .env file');
    }

    if (!channelId) {
      throw new Error('channelId is required');
    }

    if (!files || files.length === 0) {
      throw new Error('At least one file is required');
    }

    const FormData = require('form-data');
    const formData = new FormData();

    // Add message payload
    const payload: any = {};
    if (content) payload.content = content;
    formData.append('payload_json', JSON.stringify(payload));

    // Add files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = await file.arrayBuffer();
      formData.append(`files[${i}]`, Buffer.from(buffer), {
        filename: file.name,
        contentType: file.type,
      });
    }

    try {
      const url = `${DISCORD_API_BASE}/channels/${channelId}/messages`;
      const response = await axios.post(url, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Discord API Error (Media):', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw {
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }

  async deleteMessage(channelId: string, messageId: string) {
    await discordRequest('DELETE', `/channels/${channelId}/messages/${messageId}`);
    return { success: true };
  }

  async editMessage(channelId: string, messageId: string, content: string) {
    const result = await discordRequest(
      'PATCH',
      `/channels/${channelId}/messages/${messageId}`,
      { content }
    );
    return result;
  }
}

export const discordService = new DiscordService();
