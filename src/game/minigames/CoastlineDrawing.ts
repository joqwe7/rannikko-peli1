import { BaseMinigame } from './BaseMinigame';

export class CoastlineDrawing extends BaseMinigame {
    private optimalPath: Array<{x: number, y: number}>;
    
    constructor() {
        super(30000); // 30 seconds
        this.optimalPath = this.generateOptimalPath();
    }

    public start(): void {
        // Initialize drawing canvas
    }

    public validate(playerPath: Array<{x: number, y: number}>): number {
        const accuracy = this.calculatePathAccuracy(playerPath);
        this.score = Math.floor(accuracy * 100);
        return this.score;
    }

    private calculatePathAccuracy(playerPath: Array<{x: number, y: number}>): number {
        // Compare player path to optimal path
        // Return value between 0-1
        return 0;
    }

    private generateOptimalPath(): Array<{x: number, y: number}> {
        // Generate optimal coastline path
        return [];
    }
}
