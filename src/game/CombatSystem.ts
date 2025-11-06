import { Team, Player } from '../types/GameTypes';

export class CombatSystem {
    private cooldowns: Map<string, number> = new Map();
    private readonly ATTACK_COOLDOWN = 90000; // 90 seconds

    public async handleAttack(
        attacker: Player,
        targetTeam: Team,
        attackType: string,
        minigameResult: number
    ): Promise<boolean> {
        if (!this.validateAttack(attacker, attackType)) return false;

        const damage = this.calculateDamage(attackType, minigameResult);
        this.applyDamage(targetTeam, damage, attackType);
        this.setCooldown(attacker.id, attackType);

        return true;
    }

    private validateAttack(attacker: Player, attackType: string): boolean {
        const lastAttack = this.cooldowns.get(attacker.id) || 0;
        return Date.now() - lastAttack >= this.ATTACK_COOLDOWN;
    }

    private calculateDamage(attackType: string, minigameResult: number): number {
        const baseDamage = {
            'stormManipulation': 50,
            'sedimentAttack': 30,
            'pollutionAttack': 2,
            'infrastructureAttack': 1
        }[attackType] || 0;

        return baseDamage * (minigameResult / 100);
    }

    private applyDamage(team: Team, damage: number, type: string): void {
        switch (type) {
            case 'stormManipulation':
                team.players.forEach(p => p.resources.environmentPoints -= damage);
                break;
            case 'infrastructureAttack':
                if (team.buildings.length > 0) {
                    team.buildings.pop();
                }
                break;
        }
    }
}
