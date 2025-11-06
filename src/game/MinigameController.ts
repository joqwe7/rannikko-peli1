import { MiniGameManager } from './MiniGameManager';

export class MinigameController {
    private miniGameManager: MiniGameManager;
    private activeMinigames: Map<string, any> = new Map();

    constructor() {
        this.miniGameManager = new MiniGameManager();
    }

    public async startMinigame(type: string, playerId: string): Promise<boolean> {
        const gameConfig = this.getGameConfig(type);
        this.activeMinigames.set(playerId, {
            type,
            startTime: Date.now(),
            config: gameConfig
        });
        return true;
    }

    private getGameConfig(type: string): any {
        switch (type) {
            case 'coastlineDraw':
                return {
                    timeLimit: 30000,
                    successThreshold: 0.8,
                    points: 100
                };
            case 'currentFlow':
                return {
                    timeLimit: 20000,
                    arrowCount: 8,
                    points: 80
                };
            // Add other minigame configs
        }
    }

    public validateMinigameResult(playerId: string, result: any): number {
        const game = this.activeMinigames.get(playerId);
        if (!game) return 0;

        switch (game.type) {
            case 'coastlineDraw':
                return this.miniGameManager.validateCoastalDraw(result);
            case 'currentFlow':
                return this.miniGameManager.validateCurrentFlow(result) ? 100 : 0;
        }
        return 0;
    }
}
