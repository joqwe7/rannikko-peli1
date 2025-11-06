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
    private gameStatus: 'waiting' | 'in-progress' | 'finished' = 'waiting';

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
            this.calculateScores();
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
                this.calculateScores();
            }
        }
    }

    public handleMinigameAction(player: Player, payload: any): void {
        this.minigameController.handleAction(player, payload);
        this.calculateScores();
    }

    public handleSabotage(player: Player, targetId: string): void {
        const targetTeam = this.teams.get(Number(targetId));
        if (targetTeam) {
            this.combatSystem.executeSabotage(player, targetTeam);
            this.calculateScores();
        }
    }

    public handleDefense(player: Player): void {
        const team = this.teams.get(player.team);
        if (team) {
            this.combatSystem.executeDefense(team);
            this.calculateScores();
        }
    }

    public getPublicState(): any {
        return {
            teams: Array.from(this.teams.entries()),
            gameTime: this.gameTime,
            gameStatus: this.gameStatus
        };
    }

    public calculateScores(): void {
        this.teams.forEach((team) => {
            const infrastructureScore = this.calculateInfrastructureScore(team);
            const researchScore = this.calculateResearchScore(team);
            const environmentScore = this.calculateEnvironmentScore(team);
            team.score = Math.min(1000, infrastructureScore + researchScore + environmentScore);
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

    private calculateEnvironmentScore(team: Team): number {
        return team.players.reduce((acc, player) => 
            acc + Math.floor(player.resources.environmentPoints / 10), 0
        );
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
                    { type: 'Eroosiomallit', level: 1, progress: 0, completed: false },
                    { type: 'Biodiversiteetti', level: 1, progress: 0, completed: false },
                    { type: 'Infrastruktuuriteknologia', level: 1, progress: 0, completed: false }
                ]
            });
        }
        
        this.gameStatus = 'waiting';
        this.gameTime = 0;
    }

    public addPlayer(id: string, name: string, role: PlayerRole): void {
        const player: Player = {
            id,
            name,
            role,
            resources: { money: 100, researchPoints: 50, environmentPoints: 50 },
            team: this.assignPlayerToTeam(),
            elo: 1000
        };
        this.players.set(id, player);
        
        const team = this.teams.get(player.team);
        if (team) {
            team.players.push(player);
            if (this.checkTeamsReady()) {
                this.startGame();
            }
        }
    }

    private assignPlayerToTeam(): number {
        // Find team with fewest players
        let minPlayers = Infinity;
        let targetTeam = 0;
        
        this.teams.forEach((team, id) => {
            if (team.players.length < minPlayers) {
                minPlayers = team.players.length;
                targetTeam = id;
            }
        });
        
        return targetTeam;
    }

    private checkTeamsReady(): boolean {
        let allTeamsHaveEnoughPlayers = true;
        this.teams.forEach(team => {
            if (team.players.length < 1) { // Change to 3 for full game
                allTeamsHaveEnoughPlayers = false;
            }
        });
        return allTeamsHaveEnoughPlayers;
    }

    private startGame(): void {
        this.gameStatus = 'in-progress';
        this.startGameLoop();
    }

    private startGameLoop(): void {
        setInterval(() => {
            if (this.gameStatus === 'in-progress') {
                this.handleGameTick();
            }
        }, 1000);
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
                        player.resources.researchPoints = Math.floor(player.resources.researchPoints * 1.25);
                        break;
                    case 'Ympäristönsuojelija':
                        player.resources.environmentPoints = Math.floor(player.resources.environmentPoints * 1.25);
                        break;
                    case 'Kehittäjä':
                        player.resources.money = Math.floor(player.resources.money * 1.25);
                        break;
                }
            });
        });
    }

    public handleGameTick(): void {
        if (this.gameStatus !== 'in-progress') return;

        this.gameTime++;
        this.updateResources();
        this.calculateScores();
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
        this.gameStatus = 'finished';
        this.calculateScores();
        if (winningTeamId !== undefined) {
            this.calculateEloChanges(winningTeamId);
        }
    }

    private calculateEloChanges(winningTeamId: number): void {
        const winningTeam = this.teams.get(winningTeamId);
        if (!winningTeam) return;

        this.teams.forEach((team, teamId) => {
            if (teamId === winningTeamId) return;
            
            const expectedScore = this.calculateExpectedScore(winningTeam.score, team.score);
            const K = 32;
            
            winningTeam.players.forEach(player => {
                player.elo += Math.round(K * (1 - expectedScore));
            });
            
            team.players.forEach(player => {
                player.elo += Math.round(K * (0 - (1 - expectedScore)));
            });
        });
    }

    private calculateExpectedScore(ratingA: number, ratingB: number): number {
        return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    }
}
