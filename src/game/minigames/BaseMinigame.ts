export abstract class BaseMinigame {
    protected timeLimit: number;
    protected score: number = 0;
    protected isCompleted: boolean = false;

    constructor(timeLimit: number) {
        this.timeLimit = timeLimit;
    }

    abstract start(): void;
    abstract validate(input: any): number;
    
    public getScore(): number {
        return this.score;
    }

    protected calculateTimeBonus(timeLeft: number): number {
        return Math.floor((timeLeft / this.timeLimit) * 20);
    }
}
