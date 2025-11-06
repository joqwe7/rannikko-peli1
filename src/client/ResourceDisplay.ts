import { Resources } from '../types/GameTypes';

export class ResourceDisplay {
    private container: HTMLElement;
    private displays: {[key: string]: HTMLElement} = {};

    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'resource-display';
        this.initializeDisplays();
    }

    private initializeDisplays(): void {
        const resources = ['money', 'researchPoints', 'environmentPoints'];
        resources.forEach(resource => {
            const display = document.createElement('div');
            display.className = `resource-item ${resource}`;
            this.displays[resource] = display;
            this.container.appendChild(display);
        });
    }

    public updateResources(resources: Resources): void {
        Object.entries(resources).forEach(([key, value]) => {
            if (this.displays[key]) {
                this.displays[key].textContent = `${key}: ${value}`;
            }
        });
    }
}
