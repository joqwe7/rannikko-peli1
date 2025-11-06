import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { GameState } from '../game/GameState';
import { Player, PlayerRole, GameAction } from '../types/GameTypes';
import path from 'path';

export class GameServer {
    private app: express.Application;
    private server: ReturnType<typeof createServer>;
    private io: Server;
    private gameState: GameState;
    private activeSessions: Map<string, Socket> = new Map();
    private readonly maxPlayersPerTeam = 3;

    constructor(port: number = 3000) {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.setupExpress();
        this.gameState = new GameState();
        this.setupEventHandlers();
        
        this.server.listen(port, () => {
            console.log(`Game server running on port ${port}`);
        });
    }
    
    private setupExpress(): void {
        // Serve static files from the dist directory
        this.app.use(express.static(path.join(__dirname, '../../dist/client')));
        
        // Send the main HTML file for all routes
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
        });
    }

    private setupEventHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.on('joinGame', (data: { name: string, role: PlayerRole }) => {
                this.handlePlayerJoin(socket, data);
            });

            socket.on('gameAction', (action: any) => {
                this.handleGameAction(socket, action);
            });

            socket.on('disconnect', () => {
                this.handlePlayerDisconnect(socket);
            });
        });
    }

    private handlePlayerJoin(socket: Socket, data: { name: string, role: PlayerRole }): void {
        try {
            console.log(`Player joining: ${data.name} as ${data.role}`);
            
            // Validate input
            if (!data.name || !data.role) {
                socket.emit('error', { message: 'Invalid player data' });
                return;
            }

            // Add player to game state
            const player = this.gameState.addPlayer(socket.id, data.name, data.role);
            this.activeSessions.set(socket.id, socket);
            
            console.log(`Player ${data.name} joined successfully`);
            
            // Send join confirmation to the player
            socket.emit('joinConfirmed', {
                playerId: socket.id,
                player: player
            });
            
            // Broadcast updated game state to all players
            this.broadcastGameState();
        } catch (error) {
            console.error('Error handling player join:', error);
            socket.emit('error', { message: 'Failed to join game' });
        }
    }

    private broadcastGameState(): void {
        const state = this.gameState.getPublicState();
        this.io.emit('gameStateUpdate', state);
    }

    private handleGameAction(socket: Socket, action: GameAction): void {
        const playerId = socket.id;
        const player = this.gameState.getPlayer(playerId);
        
        if (!player) return;

        switch (action.type) {
            case 'BUILD':
                this.handleBuildAction(player, action.payload);
                break;
            case 'RESEARCH':
                this.handleResearchAction(player, action.payload);
                break;
            case 'MINIGAME_ACTION':
                this.handleMinigameAction(player, action.payload);
                break;
            case 'TEAM_ACTION':
                this.handleTeamAction(player, action.payload);
                break;
        }

        this.broadcastGameState();
    }

    private handleBuildAction(player: Player, payload: GameAction['payload']): void {
        if (!payload.position || !payload.actionType) return;
        this.gameState.addBuilding(player.team, {
            type: payload.actionType as 'Aallonmurtaja' | 'Tutkimuskeskus' | 'Ympäristöasema',
            position: payload.position,
            health: 100,
            owner: player.team,
            level: 1
        });
    }

    private handleResearchAction(player: Player, payload: GameAction['payload']): void {
        if (!payload.actionType) return;
        this.gameState.progressResearch(player.team, payload.actionType as any);
    }

    private handleMinigameAction(player: Player, payload: GameAction['payload']): void {
        // Delegate to MinigameController
        this.gameState.handleMinigameAction(player, payload);
    }

    private handleTeamAction(player: Player, payload: GameAction['payload']): void {
        if (!payload.actionType) return;
        switch (payload.actionType) {
            case 'SABOTAGE':
                if (payload.targetId) {
                    this.gameState.handleSabotage(player, payload.targetId);
                }
                break;
            case 'DEFEND':
                this.gameState.handleDefense(player);
                break;
        }
    }

    private handlePlayerDisconnect(socket: Socket): void {
        const playerId = socket.id;
        this.gameState.removePlayer(playerId);
        this.activeSessions.delete(playerId);
        this.broadcastGameState();
    }
}
