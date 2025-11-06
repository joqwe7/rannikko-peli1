import { Team, Player } from '../types/GameTypes';

export class ScoreManager {
    private readonly MAX_SCORE = 1000;
    private readonly WEIGHTS = {
        environment: 0.4,
        infrastructure: 0.3,
        research: 0.3
    };

    public calculateTeamScore(team: Team): number {
        const envScore = this.calculateEnvironmentScore(team) * this.WEIGHTS.environment;
        const infraScore = this.calculateInfrastructureScore(team) * this.WEIGHTS.infrastructure;
        const researchScore = this.calculateResearchScore(team) * this.WEIGHTS.research;

        return Math.min(this.MAX_SCORE, envScore + infraScore + researchScore);
    }

    public updatePlayerElo(player: Player, gameResult: number): void {
        const K = 32;
        const expectedScore = this.calculateExpectedScore(player.elo);
        player.elo += Math.round(K * (gameResult - expectedScore));
    }

    private calculateExpectedScore(playerElo: number): number {
        // ELO calculation formula
        return 1 / (1 + Math.pow(10, (playerElo - 1500) / 400));
    }
}
