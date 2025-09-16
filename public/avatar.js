// Avatar HeyGen Integration
import StreamingAvatar, { AvatarQuality, StreamingEvents } from '@heygen/streaming-avatar';

class SandraAvatar {
  constructor() {
    this.avatar = null;
    this.sessionToken = null;
    this.isConnected = false;
    this.avatarId = null;
    this.voiceId = null;
  }

  async initialize() {
    try {
      // Get session token
      const tokenResponse = await fetch('/api/avatar-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get session token');
      }

      const tokenData = await tokenResponse.json();
      this.sessionToken = tokenData.token;

      // Get available avatars
      const avatarsResponse = await fetch('/api/avatar-list');
      const avatarsData = await avatarsResponse.json();
      
      if (avatarsData.success && avatarsData.avatars.length > 0) {
        // Use first available avatar or configured one
        this.avatarId = process.env.HEYGEN_AVATAR_ID || avatarsData.avatars[0].avatar_id;
        this.voiceId = avatarsData.avatars[0].default_voice;
      }

      console.log('Avatar initialized successfully');
      return true;
    } catch (error) {
      console.error('Avatar initialization failed:', error);
      return false;
    }
  }

  async createSession() {
    if (!this.sessionToken || !this.avatarId) {
      console.error('Missing session token or avatar ID');
      return false;
    }

    try {
      this.avatar = new StreamingAvatar({ token: this.sessionToken });

      // Setup event listeners
      this.avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log('Avatar started talking');
        this.onAvatarStartTalking();
      });

      this.avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log('Avatar stopped talking');
        this.onAvatarStopTalking();
      });

      this.avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Avatar stream disconnected');
        this.onStreamDisconnected();
      });

      // Create and start avatar
      const sessionInfo = await this.avatar.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: this.avatarId,
        voice: {
          voiceId: this.voiceId,
          rate: 1.0
        }
      });

      this.isConnected = true;
      console.log('Avatar session created:', sessionInfo);
      return true;
    } catch (error) {
      console.error('Failed to create avatar session:', error);
      return false;
    }
  }

  async speak(text) {
    if (!this.avatar || !this.isConnected) {
      console.error('Avatar not connected');
      return false;
    }

    try {
      await this.avatar.speak({
        text: text,
        task_type: 'REPEAT',
        task_mode: 'SYNC'
      });
      return true;
    } catch (error) {
      console.error('Avatar speak failed:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.avatar && this.isConnected) {
      try {
        await this.avatar.stopAvatar();
        this.isConnected = false;
        this.avatar = null;
        console.log('Avatar disconnected');
      } catch (error) {
        console.error('Error disconnecting avatar:', error);
      }
    }
  }

  // Event handlers
  onAvatarStartTalking() {
    const indicator = document.getElementById('avatar-status');
    if (indicator) indicator.textContent = '🗣️ Hablando...';
  }

  onAvatarStopTalking() {
    const indicator = document.getElementById('avatar-status');
    if (indicator) indicator.textContent = '👤 Esperando...';
  }

  onStreamDisconnected() {
    this.isConnected = false;
    const indicator = document.getElementById('avatar-status');
    if (indicator) indicator.textContent = '❌ Desconectado';
  }
}

// Global avatar instance
window.SandraAvatar = SandraAvatar;
