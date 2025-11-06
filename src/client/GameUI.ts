import { Player, Building, Research } from '../types/GameTypes';

import { type Team } from '../types/GameTypes';

export interface GameState {
    teams: Team[];
    gameTime: number;
    gameStatus: 'in-progress' | 'finished';
}

export class GameUI {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private resourceDisplay: HTMLElement;
    private miniGameCanvas: HTMLCanvasElement;
    private miniGameCtx: CanvasRenderingContext2D;
    private buildingSprites: Map<string, HTMLImageElement>;
    private researchSprites: Map<string, HTMLImageElement>;
    private currentTeam: Team | null = null;
    private selectedEntity: { type: 'building' | 'research', data: any } | null = null;
    private loadingElement: HTMLElement | null = null;
    private gameUIElement: HTMLElement | null = null;

    public showLoadingState(message: string): void {
        if (!this.loadingElement) {
            this.loadingElement = document.createElement('div');
            this.loadingElement.id = 'loading';
            document.body.appendChild(this.loadingElement);
        }
        this.loadingElement.innerHTML = message;
    }

    public hideLoadingState(): void {
        if (this.loadingElement?.parentElement) {
            this.loadingElement.parentElement.removeChild(this.loadingElement);
            this.loadingElement = null;
        }
    }

    public showGameUI(): void {
        if (!this.gameUIElement) {
            this.gameUIElement = document.createElement('div');
            this.gameUIElement.id = 'gameUI';
            document.body.appendChild(this.gameUIElement);
        }
        this.gameUIElement.style.display = 'block';
    }

    public updateGameState(state: GameState): void {
        this.currentTeam = state.teams.find(team => team.id === this.currentTeam?.id) || null;
        this.renderGameState(state);
    }

    private renderGameState(state: GameState): void {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render teams
        state.teams.forEach(team => {
            this.renderTeam(team);
        });
        
        // Render UI elements
        this.renderUI(state);
    }

    private renderTeam(team: Team): void {
        // Render buildings
        team.buildings.forEach(building => {
            this.renderBuilding(building);
        });
    }

    private renderBuilding(building: Building): void {
        const sprite = this.buildingSprites.get(building.type);
        if (!sprite || !this.ctx) return;
        
        this.ctx.drawImage(
            sprite,
            building.position.x - sprite.width / 2,
            building.position.y - sprite.height / 2
        );
    }

    private renderUI(state: GameState): void {
        if (this.currentTeam) {
            this.renderResourceDisplay(this.currentTeam);
        }
    }

    private renderResourceDisplay(team: Team): void {
        if (!this.resourceDisplay) return;
        
        const resources = team.players[0]?.resources; // Show first player's resources for now
        if (!resources) return;
        
        this.resourceDisplay.innerHTML = `
            <div>Money: ${resources.money}</div>
            <div>Research Points: ${resources.researchPoints}</div>
            <div>Environment Points: ${resources.environmentPoints}</div>
        `;
    }

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.resourceDisplay = document.getElementById('resourceDisplay')!;
        this.miniGameCanvas = document.getElementById('minigameCanvas') as HTMLCanvasElement;
        this.miniGameCtx = this.miniGameCanvas.getContext('2d')!;
        this.buildingSprites = new Map();
        this.researchSprites = new Map();
        this.loadSprites();
        this.initializeUI();
    }

    private loadSprites(): void {
        const buildingTypes = ['Aallonmurtaja', 'Tutkimuskeskus', 'Ympäristöasema'];
        const researchTypes = ['Eroosiomallit', 'Biodiversiteetti', 'Infrastruktuuriteknologia'];

        buildingTypes.forEach(type => {
            const img = new Image();
            img.src = `/assets/buildings/${type.toLowerCase()}.png`;
            this.buildingSprites.set(type, img);
        });

        researchTypes.forEach(type => {
            const img = new Image();
            img.src = `/assets/research/${type.toLowerCase()}.png`;
            this.researchSprites.set(type, img);
        });
    }

    private initializeUI(): void {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.setupEventListeners();
        this.startRenderLoop();
    }

    private startRenderLoop(): void {
        const render = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.currentTeam) {
                this.renderBackground();
                this.renderBuildings(this.currentTeam.buildings);
                this.renderPlayers(this.currentTeam.players);
                this.renderResearch(this.currentTeam.researches);
            }
            requestAnimationFrame(render);
        };
        render();
    }

    private renderBackground(): void {
        // Draw coastline
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height * 0.6);
        // Create a natural-looking coastline using bezier curves
        this.ctx.bezierCurveTo(
            this.canvas.width * 0.3, this.canvas.height * 0.5,
            this.canvas.width * 0.6, this.canvas.height * 0.7,
            this.canvas.width, this.canvas.height * 0.6
        );
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.closePath();
        
        // Create a gradient for the water
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#a3d5ff');
        gradient.addColorStop(1, '#0066cc');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Add some wave details
        this.ctx.strokeStyle = '#ffffff33';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    private renderBuildings(buildings: Team['buildings']): void {
        buildings.forEach(building => {
            const sprite = this.buildingSprites.get(building.type);
            if (sprite) {
                const size = 40;
                this.ctx.drawImage(
                    sprite,
                    building.position.x - size/2,
                    building.position.y - size/2,
                    size,
                    size
                );

                // Health bar
                const healthBarWidth = 40;
                const healthBarHeight = 4;
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(
                    building.position.x - healthBarWidth/2,
                    building.position.y + size/2 + 5,
                    healthBarWidth,
                    healthBarHeight
                );
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillRect(
                    building.position.x - healthBarWidth/2,
                    building.position.y + size/2 + 5,
                    healthBarWidth * (building.health / 100),
                    healthBarHeight
                );
            }
        });
    }

    public startMinigame(type: string): void {
        const overlay = document.getElementById('minigameOverlay')!;
        const title = document.getElementById('minigameTitle')!;
        overlay.style.display = 'flex';
        title.textContent = this.getMinigameTitle(type);
        this.setupMinigame(type);
    }

    private getMinigameTitle(type: string): string {
        switch (type) {
            case 'coastlineDraw': return 'Draw the Coastline';
            case 'waveTiming': return 'Time the Waves';
            case 'sedimentSort': return 'Sort the Sediments';
            default: return 'Minigame';
        }
    }

    private setupMinigame(type: string): void {
        this.miniGameCanvas.width = 400;
        this.miniGameCanvas.height = 300;
        
        switch (type) {
            case 'coastlineDraw':
                this.setupCoastlineDrawGame();
                break;
            case 'waveTiming':
                this.setupWaveTimingGame();
                break;
            case 'sedimentSort':
                this.setupSedimentSortGame();
                break;
        }
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    private handleMouseMove(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Update hover effects
    }

    private handleCanvasClick(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Handle interactions
    }

    private handleResize(): void {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    private renderPlayers(players: Team['players']): void {
        players.forEach((player, index) => {
            const y = 50 + index * 30;
            this.ctx.font = '16px Arial';
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(`${player.name} (${player.role})`, 10, y);
            
            // Resource indicators
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#666';
            this.ctx.fillText(
                `€${player.resources.money} | TP${player.resources.researchPoints} | YP${player.resources.environmentPoints}`,
                10,
                y + 15
            );
        });
    }

    private renderResearch(researches: Team['researches']): void {
        researches.forEach((research, index) => {
            const sprite = this.researchSprites.get(research.type);
            if (sprite) {
                const x = this.canvas.width - 60;
                const y = 50 + index * 70;
                const size = 50;

                // Research icon
                this.ctx.drawImage(sprite, x, y, size, size);

                // Progress bar
                const barWidth = 100;
                const barHeight = 10;
                this.ctx.fillStyle = '#ddd';
                this.ctx.fillRect(x, y + size + 5, barWidth, barHeight);
                this.ctx.fillStyle = research.completed ? '#4CAF50' : '#2196F3';
                this.ctx.fillRect(x, y + size + 5, barWidth * (research.progress / 100), barHeight);

                // Label
                this.ctx.font = '12px Arial';
                this.ctx.fillStyle = '#000';
                this.ctx.fillText(research.type, x, y - 5);
            }
        });
    }

    private setupCoastlineDrawGame(): void {
        let isDrawing = false;
        const points: Array<{x: number, y: number}> = [];

        const draw = () => {
            this.miniGameCtx.clearRect(0, 0, this.miniGameCanvas.width, this.miniGameCanvas.height);
            
            // Draw background
            this.miniGameCtx.fillStyle = '#e6f3ff';
            this.miniGameCtx.fillRect(0, 0, this.miniGameCanvas.width, this.miniGameCanvas.height);
            
            // Draw points
            if (points.length > 1) {
                this.miniGameCtx.beginPath();
                this.miniGameCtx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    this.miniGameCtx.lineTo(points[i].x, points[i].y);
                }
                this.miniGameCtx.strokeStyle = '#000';
                this.miniGameCtx.lineWidth = 2;
                this.miniGameCtx.stroke();
            }
        };

        const addPoint = (e: MouseEvent) => {
            if (!isDrawing) return;
            const rect = this.miniGameCanvas.getBoundingClientRect();
            points.push({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
            draw();
        };

        this.miniGameCanvas.onmousedown = () => {
            isDrawing = true;
            points.length = 0;
        };

        this.miniGameCanvas.onmousemove = addPoint;
        this.miniGameCanvas.onmouseup = () => {
            isDrawing = false;
            if (points.length > 0) {
                this.validateCoastline(points);
            }
        };

        draw();
    }

    private setupWaveTimingGame(): void {
        let wave = { x: 0, speed: 2 };
        let score = 0;
        let attempts = 0;
        const maxAttempts = 5;

        const animate = () => {
            if (attempts >= maxAttempts) return;

            this.miniGameCtx.clearRect(0, 0, this.miniGameCanvas.width, this.miniGameCanvas.height);
            
            // Draw water
            this.miniGameCtx.fillStyle = '#0066cc';
            this.miniGameCtx.fillRect(0, this.miniGameCanvas.height/2, this.miniGameCanvas.width, this.miniGameCanvas.height/2);
            
            // Draw wave
            this.miniGameCtx.beginPath();
            this.miniGameCtx.moveTo(wave.x - 30, this.miniGameCanvas.height/2);
            this.miniGameCtx.quadraticCurveTo(
                wave.x, this.miniGameCanvas.height/2 - 20,
                wave.x + 30, this.miniGameCanvas.height/2
            );
            this.miniGameCtx.strokeStyle = '#fff';
            this.miniGameCtx.lineWidth = 3;
            this.miniGameCtx.stroke();

            // Move wave
            wave.x += wave.speed;
            if (wave.x > this.miniGameCanvas.width) {
                wave.x = 0;
                attempts++;
            }

            requestAnimationFrame(animate);
        };

        this.miniGameCanvas.onclick = () => {
            // Check if click was close to shore
            if (Math.abs(wave.x - this.miniGameCanvas.width/2) < 20) {
                score += 20;
            }
        };

        animate();
    }

    private setupSedimentSortGame(): void {
        const sediments = [
            { type: 'Sand', size: 2 },
            { type: 'Gravel', size: 4 },
            { type: 'Silt', size: 1 },
            { type: 'Clay', size: 0.5 },
            { type: 'Pebbles', size: 8 }
        ].sort(() => Math.random() - 0.5);

        let draggingIndex = -1;

        const drawSediments = () => {
            this.miniGameCtx.clearRect(0, 0, this.miniGameCanvas.width, this.miniGameCanvas.height);
            
            sediments.forEach((sediment, i) => {
                const y = 50 + i * 40;
                this.miniGameCtx.fillStyle = this.getSedimentColor(sediment.type);
                this.miniGameCtx.fillRect(50, y, 300, 30);
                this.miniGameCtx.fillStyle = '#000';
                this.miniGameCtx.font = '16px Arial';
                this.miniGameCtx.fillText(sediment.type, 60, y + 20);
            });
        };

        this.miniGameCanvas.onmousedown = (e) => {
            const rect = this.miniGameCanvas.getBoundingClientRect();
            const y = e.clientY - rect.top;
            draggingIndex = Math.floor((y - 50) / 40);
        };

        this.miniGameCanvas.onmousemove = (e) => {
            if (draggingIndex < 0) return;
            const rect = this.miniGameCanvas.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const newIndex = Math.floor((y - 50) / 40);
            
            if (newIndex !== draggingIndex && newIndex >= 0 && newIndex < sediments.length) {
                const temp = sediments[draggingIndex];
                sediments[draggingIndex] = sediments[newIndex];
                sediments[newIndex] = temp;
                draggingIndex = newIndex;
                drawSediments();
            }
        };

        this.miniGameCanvas.onmouseup = () => {
            if (draggingIndex >= 0) {
                this.validateSedimentOrder(sediments);
            }
            draggingIndex = -1;
        };

        drawSediments();
    }

    private validateCoastline(points: Array<{x: number, y: number}>): void {
        // Implementation would compare player's drawn line with optimal coastline
        const result = { score: Math.random() * 100 };
        this.emit('minigameComplete', result);
    }

    private validateSedimentOrder(order: Array<{type: string, size: number}>): void {
        const isCorrect = order.every((sediment, i) => 
            i === 0 || order[i-1].size >= sediment.size
        );
        const result = { score: isCorrect ? 100 : 0 };
        this.emit('minigameComplete', result);
    }

    private getSedimentColor(type: string): string {
        switch (type) {
            case 'Sand': return '#f4d03f';
            case 'Gravel': return '#808b96';
            case 'Silt': return '#d0d3d4';
            case 'Clay': return '#935116';
            case 'Pebbles': return '#5d6d7e';
            default: return '#000000';
        }
    }

    public setTeam(team: Team): void {
        this.currentTeam = team;
    }

    private emit(event: string, data: any): void {
        const customEvent = new CustomEvent(event, { detail: data });
        this.canvas.dispatchEvent(customEvent);
    }
}
