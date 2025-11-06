export type PlayerRole = 'Tutkija' | 'Ympäristönsuojelija' | 'Kehittäjä';
export type GameStatus = 'waiting' | 'in-progress' | 'finished';

export interface Resources {
    money: number;
    researchPoints: number;
    environmentPoints: number;
}

export interface Player {
    id: string;
    role: PlayerRole;
    resources: Resources;
    name: string;
    team: number;
    elo: number;
}

export interface Team {
    id: number;
    players: Player[];
    score: number;
    buildings: Building[];
    researches: Research[];
}

export interface Building {
    type: 'Aallonmurtaja' | 'Tutkimuskeskus' | 'Ympäristöasema';
    position: { x: number; y: number };
    health: number;
    owner: number; // Team ID
    level: number;
}

export type ResearchType = 'Eroosiomallit' | 'Biodiversiteetti' | 'Infrastruktuuriteknologia';

export interface Research {
    type: ResearchType;
    level: number;
    progress: number;
    completed: boolean;
}

export interface Research {
    type: 'Eroosiomallit' | 'Biodiversiteetti' | 'Infrastruktuuriteknologia';
    progress: number;
    completed: boolean;
}

export interface GameAction {
    type: 'BUILD' | 'RESEARCH' | 'MINIGAME_ACTION' | 'TEAM_ACTION';
    payload: {
        actionType: string;
        targetId?: string;
        position?: { x: number; y: number };
        data?: any;
    };
}
