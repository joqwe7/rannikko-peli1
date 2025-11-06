export class MinigameUI {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;
        this.setupCanvas();
    }

    public startMinigame(type: string): void {
        switch (type) {
            case 'coastlineDraw':
                this.setupCoastlineDraw();
                break;
            case 'waveTiming':
                this.setupWaveTiming();
                break;
            case 'sedimentSort':
                this.setupSedimentSort();
                break;
        }
    }

    private setupCoastlineDraw(): void {
        let drawing = false;
        const points: Array<{x: number, y: number}> = [];

        this.canvas.onmousedown = (e) => {
            drawing = true;
            points.push(this.getMousePos(e));
            this.drawLine(points);
        };

        this.canvas.onmouseup = () => {
            drawing = false;
            this.validateDrawing(points);
        };
    }

    private validateDrawing(points: Array<{x: number, y: number}>): void {
        // Send to server for validation
    }
}
