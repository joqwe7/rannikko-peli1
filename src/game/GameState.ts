import { Team, Player, Resources, PlayerRole, Building, Research } from '../types/GameTypes';
import { CombatSystem, MinigameController } from '../systems/GameSystems';

export class GameState {
    private teams: Map<number, Team> = new Map();
    private players: Map<string, Player> = new Map();
    private gameTime: number = 0;
    private readonly GAME_DURATION = 1800; // 30 minutes in seconds
    private readonly MAX_TEAMS = 2;
    private combatSystem: CombatSystem;
    private minigameController: MinigameController;

    constructor() {
        this.initGame();
        this.combatSystem = new CombatSystem();
        this.minigameController = new MinigameController();
    }

    public getPlayer(id: string): Player | undefined {
        return this.players.get(id);
    }

    public removePlayer(id: string): void {
        const player = this.players.get(id);
        if (player) {
            const team = this.teams.get(player.team);
            if (team) {
                team.players = team.players.filter(p => p.id !== id);
                this.teams.set(player.team, team);
            }
            this.players.delete(id);
        }
    }

    public addBuilding(teamId: number, building: Building): void {
        const team = this.teams.get(teamId);
        if (team) {
            team.buildings.push(building);
            this.teams.set(teamId, team);
        }
    }

    public progressResearch(teamId: number, researchType: string): void {
        const team = this.teams.get(teamId);
        if (team) {
            const research = team.researches.find(r => r.type === researchType);
            if (research && !research.completed) {
                research.progress += 10;
                if (research.progress >= 100) {
                    research.completed = true;
                }
            }
        }
    }

    public handleMinigameAction(player: Player, payload: any): void {
        this.minigameController.handleAction(player, payload);
    }

    public handleSabotage(player: Player, targetId: string): void {
        const targetTeam = this.teams.get(Number(targetId));
        if (targetTeam) {
            this.combatSystem.executeSabotage(player, targetTeam);
        }
    }

    public handleDefense(player: Player): void {
        const team = this.teams.get(player.team);
        if (team) {
            this.combatSystem.executeDefense(team);
        }
    }

    public getPublicState(): any {
        return {
            teams: Array.from(this.teams.entries()),
            gameTime: this.gameTime,
            gameStatus: this.gameTime >= this.GAME_DURATION ? 'finished' : 'in-progress'
        };
    }

    private calculateScores(): void {
        this.teams.forEach((team, teamId) => {
            let score = 0;
            score += this.calculateInfrastructureScore(team);
            score += this.calculateResearchScore(team);
            team.score = score;
            this.teams.set(teamId, team);
        });
    }

    private calculateInfrastructureScore(team: Team): number {
        return team.buildings.reduce((acc, building) => {
            switch (building.type) {
                case 'Aallonmurtaja': return acc + 10;
                case 'Tutkimuskeskus': return acc + 15;
                case 'Ympäristöasema': return acc + 12;
                default: return acc;
            }
        }, 0);
    }

    private calculateResearchScore(team: Team): number {
        return team.researches.reduce((acc, research) => {
            return acc + (research.completed ? 20 : (research.progress / 100) * 10);
        }, 0);
    }

    private initGame(): void {
        // Initialize teams
        for (let i = 0; i < this.MAX_TEAMS; i++) {
            this.teams.set(i, {
                id: i,
                players: [],
                score: 0,
                buildings: [],
                researches: [
                    { type: 'Eroosiomallit', progress: 0, completed: false },
                    { type: 'Biodiversiteetti', progress: 0, completed: false },
                    { type: 'Infrastruktuuriteknologia', progress: 0, completed: false }
                ]
            });
        }

        // Initialize base resources for teams
        const baseResources: Resources = {
            money: 100,
            researchPoints: 50,
            environmentPoints: 50
        };
    }

    public addPlayer(id: string, name: string, role: PlayerRole): void {
        const player: Player = {
            id,
            name,
            role,
            resources: { money: 0, researchPoints: 0, environmentPoints: 0 },
            team: -1,
            elo: 1000
        };
        this.players.set(id, player);
    }

    public updateResources(): void {
        this.teams.forEach(team => {
            team.players.forEach(player => {
                // Base income
                player.resources.money += 5;
                player.resources.researchPoints += 2;
                player.resources.environmentPoints += 1;

                // Role bonuses
                switch (player.role) {
                    case 'Tutkija':
                        player.resources.researchPoints *= 1.25;
                        break;
                    case 'Ympäristönsuojelija':
                        player.resources.environmentPoints *= 1.25;
                        break;
                    case 'Kehittäjä':
                        player.resources.money *= 1.25;
                        break;
                }
            });
        });
    }

    public calculateScores(): void {
        this.teams.forEach(team => {
            let score = 0;
            score += this.calculateEnvironmentScore(team);
            score += this.calculateInfrastructureScore(team);
            score += this.calculateResearchScore(team);
            team.score = Math.min(1000, score);
        });
    }

    private calculateEnvironmentScore(team: Team): number {
        // ...implementation
        return 0;
    }

    public getPublicState(): any {
        return {
            teams: Array.from(this.teams.values()).map(team => ({
                id: team.id,
                score: team.score,
                buildings: team.buildings,
                researches: team.researches
            })),
            gameTime: this.gameTime
        };
    }

    public addBuilding(teamId: number, building: Building): void {
        const team = this.teams.get(teamId);
        if (team) {
            team.buildings.push(building);
            this.calculateScores();
        }
    }

    public addResearch(teamId: number, research: Research): void {
        const team = this.teams.get(teamId);
        if (team) {
            team.researches.push(research);
            this.calculateScores();
        }
    }

    public handleGameTick(): void {
        this.gameTime++;
        this.updateResources();
        this.checkWinConditions();
        
        if (this.gameTime >= this.GAME_DURATION) {
            this.endGame();
        }
    }

    private checkWinConditions(): void {
        this.teams.forEach(team => {
            if (team.score >= 1000 || 
                (this.gameTime <= 1200 && team.score >= 250)) {
                this.endGame(team.id);
            }
        });
    }

    private endGame(winningTeamId?: number): void {
        // Handle game end logic
        this.calculateFinalScores();
        this.updatePlayerElo(winningTeamId);
    }

    private updatePlayerElo(winningTeamId?: number): void {
        // Implement ELO calculation from documentation
    }

    public async handleAttack(
        attackerId: string,
        targetTeamId: number,
        attackType: string,
        minigameResult: number
    ): Promise<boolean> {
        const attacker = this.players.get(attackerId);
        const targetTeam = this.teams.get(targetTeamId);
        
        if (!attacker || !targetTeam) return false;
        
        return this.combatSystem.handleAttack(
            attacker,
            targetTeam,
            attackType,
            minigameResult
        );
    }

    public async startMinigame(playerId: string, type: string): Promise<boolean> {
        return this.minigameController.startMinigame(type, playerId);
    }
}
