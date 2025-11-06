import { io, Socket } from 'socket.io-client';
import { GameState } from '../game/GameState';

import { EventEmitter } from 'events';
import { GameState } from '../game/GameState';
import { GameAction } from '../types/GameTypes';

export class NetworkManager extends EventEmitter {
    private socket: Socket;
    private gameState: GameState;

    constructor(serverUrl: string = 'http://localhost:3000') {
        super();
        this.socket = io(serverUrl);
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.socket.on('connect', () => {
            this.emit('connected');
        });

        this.socket.on('joinConfirmed', (data: { playerId: string, player: any }) => {
            this.emit('joinConfirmed', data);
        });

        this.socket.on('gameStateUpdate', (state: any) => {
            this.emit('gameStateUpdate', state);
        });

        this.socket.on('minigameStart', (data: any) => {
            this.emit('minigameStart', data);
        });

        this.socket.on('minigameEnd', (data: any) => {
            this.emit('minigameEnd', data);
        });

        this.socket.on('error', (error: any) => {
            console.error('Socket error:', error);
            this.emit('error', error);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.emit('disconnect');
        });
    }

    public sendAction(type: string, data: any): void {
        console.log(`Sending action: ${type}`, data);
        if (type === 'gameAction') {
            this.socket.emit('gameAction', {
                type: data.type,
                payload: data.payload
            } as GameAction);
        } else {
            this.socket.emit(type, data);
        }
    }
}
