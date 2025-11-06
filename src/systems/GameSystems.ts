import { Player, Team } from '../types/GameTypes';

export class CombatSystem {
    private cooldowns: Map<string, number> = new Map();
    private readonly ATTACK_COOLDOWN = 90000; // 90 seconds

    public executeSabotage(attacker: Player, targetTeam: Team): boolean {
        if (!this.validateAttack(attacker)) {
            return false;
        }

        // Apply sabotage effects
        targetTeam.buildings.forEach(building => {
            building.health = Math.max(0, building.health - 20);
        });

        this.setCooldown(attacker.id);
        return true;
    }

    public executeDefense(team: Team): void {
        team.buildings.forEach(building => {
            building.health = Math.min(100, building.health + 10);
        });
    }

    private validateAttack(attacker: Player): boolean {
        const lastAttack = this.cooldowns.get(attacker.id) || 0;
        return Date.now() - lastAttack >= this.ATTACK_COOLDOWN;
    }

    private setCooldown(playerId: string): void {
        this.cooldowns.set(playerId, Date.now());
    }
}

export class MinigameController {
    public handleAction(player: Player, payload: any): void {
        // Handle minigame actions
        switch (payload.type) {
            case 'COASTLINE_DRAW':
                this.handleCoastlineDraw(player, payload.data);
                break;
            case 'WAVE_TIMING':
                this.handleWaveTiming(player, payload.data);
                break;
            case 'SEDIMENT_SORT':
                this.handleSedimentSort(player, payload.data);
                break;
        }
    }

    private handleCoastlineDraw(player: Player, data: any): void {
        const accuracy = this.calculateDrawingAccuracy(data.points);
        player.resources.researchPoints += Math.floor(accuracy * 10);
    }

    private handleWaveTiming(player: Player, data: any): void {
        const success = Math.abs(data.clickTime - data.targetTime) < 200;
        if (success) {
            player.resources.environmentPoints += 5;
        }
    }

    private handleSedimentSort(player: Player, data: any): void {
        const correct = this.validateSedimentOrder(data.order);
        if (correct) {
            player.resources.money += 10;
        }
    }

    private calculateDrawingAccuracy(points: Array<{x: number, y: number}>): number {
        // Simplified accuracy calculation
        return 0.8; // 80% accuracy for example
    }

    private validateSedimentOrder(order: string[]): boolean {
        const correctOrder = ['Clay', 'Silt', 'Sand', 'Gravel', 'Pebbles'];
        return JSON.stringify(order) === JSON.stringify(correctOrder);
    }
}