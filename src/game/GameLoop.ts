import { GameState } from './GameState';

export class GameLoop {
    private gameState: GameState;
    private lastUpdate: number = Date.now();
    private tickRate: number = 1000; // 1 second tick rate
    private isRunning: boolean = false;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    public start(): void {
        this.isRunning = true;
        this.tick();
    }

    public stop(): void {
        this.isRunning = false;
    }

    private tick(): void {
        if (!this.isRunning) return;

        const now = Date.now();
        const delta = now - this.lastUpdate;

        if (delta >= this.tickRate) {
            this.gameState.updateResources();
            this.gameState.calculateScores();
            this.lastUpdate = now;
        }

        requestAnimationFrame(() => this.tick());
    }
}
