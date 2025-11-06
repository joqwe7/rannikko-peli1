import { NetworkManager } from './NetworkManager';
import { GameUI } from './GameUI';
import { SoundManager } from './SoundManager';
import { AnimationController } from './AnimationController';

export class GameClient {
    private network: NetworkManager;
    private ui: GameUI;
    private sound: SoundManager;
    private animations: AnimationController;
    private gameState: any;
    private eventListeners: Map<string, Function[]>;
    private currentPlayer: any;
    private specialAbilityCooldowns: Map<string, number>;

    constructor() {
        this.network = new NetworkManager();
        this.ui = new GameUI();
        this.sound = new SoundManager();
        this.animations = new AnimationController();
        this.eventListeners = new Map();
        this.specialAbilityCooldowns = new Map();
        this.setupEventListeners();
    }

    public join(name: string, role: string): void {
        this.network.sendAction('joinGame', { name, role });
        this.ui.showLoadingState('Joining game...');
    }

    public getCurrentPlayer(): any {
        return this.currentPlayer;
    }




    public build(buildingType: string, position: { x: number, y: number }): void {
        this.network.sendAction('gameAction', {
            type: 'BUILD',
            payload: {
                actionType: buildingType,
                position
            }
        });
    }

    public startMinigame(type: string, data: any): void {
        this.network.sendAction('gameAction', {
            type: 'MINIGAME_ACTION',
            payload: {
                actionType: type,
                data
            }
        });
    }

    public useSpecialAbility(role: string): void {
        if (this.canUseSpecialAbility(role)) {
            this.network.sendAction('gameAction', {
                type: 'SPECIAL_ABILITY',
                payload: { role }
            });
            this.setSpecialAbilityCooldown(role);
        }
    }

    private canUseSpecialAbility(role: string): boolean {
        const cooldown = this.specialAbilityCooldowns.get(role);
        return !cooldown || Date.now() >= cooldown;
    }

    private setSpecialAbilityCooldown(role: string): void {
        const cooldownTime = 300000; // 5 minutes
        this.specialAbilityCooldowns.set(role, Date.now() + cooldownTime);
        this.updateSpecialAbilityUI(role);
    }

    private updateSpecialAbilityUI(role: string): void {
        const cooldown = this.specialAbilityCooldowns.get(role);
        if (cooldown) {
            const remaining = Math.max(0, cooldown - Date.now());
            const percentage = 100 - (remaining / 300000 * 100);
            const cooldownEl = document.getElementById('abilityCooldown');
            if (cooldownEl) {
                cooldownEl.style.width = `${percentage}%`;
            }
        }
    }

    public on(event: string, callback: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)?.push(callback);
    }

    private emit(event: string, data: any): void {
        this.eventListeners.get(event)?.forEach(callback => callback(data));
    }

    private setupEventListeners(): void {
        this.network.on('gameStateUpdate', (state) => {
            this.gameState = state;
            this.ui.updateGameState(state);
        });

        this.network.on('minigameStart', (data) => {
            this.sound.play('minigame_start');
            this.ui.startMinigame(data.type);
        });
    }

    public handleAction(action: string, data: any): void {
        this.sound.play('button_click');
        this.animations.playEffect(action);
        this.network.sendAction(action, data);
    }
}
