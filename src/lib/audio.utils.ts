import { sound } from "@/lib/notification.base64";

export class NotificationSound {
  private static instance: HTMLAudioElement | null = null;
  private static readonly SOUND_URL = sound;

  private static createAudio(): HTMLAudioElement {
    const audio = new Audio();
    audio.preload = 'auto';
    return audio;
  }

  public static async init(): Promise<void> {
    try {
      if (!this.instance) {
        this.instance = this.createAudio();
        this.instance.src = this.SOUND_URL;

        // Pre-load the audio
        await this.instance.load();
      }
    } catch (error) {
      console.warn('Failed to initialize notification sound:', error);
    }
  }

  public static async play(): Promise<void> {
    try {
      if (!this.instance) {
        await this.init();
      }

      if (this.instance) {
        // Create and play a new audio instance to allow for rapid successive plays
        const tempAudio = this.createAudio();
        tempAudio.src = this.SOUND_URL;

        const playPromise = tempAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
      // Fallback to standard notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New notification');
      }
    }
  }

  // Check if audio playback is supported
  public static isSupported(): boolean {
    try {
      const audio = document.createElement('audio');
      return audio.canPlayType('audio/mpeg') !== '' ||
             audio.canPlayType('audio/wav') !== '';
    } catch {
      return false;
    }
  }
}