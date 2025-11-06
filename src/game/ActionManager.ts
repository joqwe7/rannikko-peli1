import { Player, Building, Research } from '../types/GameTypes';
import { MiniGameManager } from './MiniGameManager';

export class ActionManager {
    private miniGameManager: MiniGameManager;
    
    constructor() {
        this.miniGameManager = new MiniGameManager();
    }

    public async handleBuildAction(player: Player, buildingType: string, position: { x: number, y: number }): Promise<boolean> {
        if (!this.validateResources(player, 'build')) return false;
        
        const drawResult = await this.miniGameManager.validateCoastalDraw([]); // Add actual drawing data
        if (drawResult < 80) return false;

        // Deduct resources and add building
        player.resources.money -= 50;
        return true;
    }

    public async handleResearch(player: Player, researchType: string): Promise<boolean> {
        if (!this.validateResources(player, 'research')) return false;

        // Validate through minigame
        const success = await this.miniGameManager.validateCurrentFlow([]);
        if (!success) return false;

        player.resources.researchPoints -= 30;
        return true;
    }

    private validateResources(player: Player, actionType: string): boolean {
        switch (actionType) {
            case 'build':
                return player.resources.money >= 50;
            case 'research':
                return player.resources.researchPoints >= 30;
            default:
                return false;
        }
    }
}
