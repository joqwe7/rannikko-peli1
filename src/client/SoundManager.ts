export class SoundManager {
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private volume: number = 0.5;

    constructor() {
        this.loadSounds();
    }

    private loadSounds(): void {
        const soundFiles = {
            'button_click': '/assets/sounds/click.mp3',
            'minigame_start': '/assets/sounds/minigame.mp3',
            'build_complete': '/assets/sounds/build.mp3',
            'attack_launch': '/assets/sounds/attack.mp3',
            'research_complete': '/assets/sounds/research.mp3'
        };

        Object.entries(soundFiles).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.volume = this.volume;
            this.sounds.set(key, audio);
        });
    }

    public play(soundName: string): void {
        const sound = this.sounds.get(soundName);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(console.error);
        }
    }
}
