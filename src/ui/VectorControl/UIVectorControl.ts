import { UIVectorModel } from './UIVectorModel';
import { UIVectorControlRenderer } from './UIVectorControlRenderer';
import { UIVectorControlEventHandler } from './UIVectorControlEventHandler';
import { UIVectorType } from './types/UIVectorTypes';
import * as THREE from 'three';

export class UIVectorControl {
    private model: UIVectorModel;
    private renderer: UIVectorControlRenderer;
    private eventHandler: UIVectorControlEventHandler;

    constructor(
        private container: HTMLElement, 
        private vectorType: UIVectorType, 
        private label: string, 
        private randomCount = 3, 
        private randomRange: number = 1, 
        private readonlyIndices: number[] = [],
        private shooterPosition?: THREE.Vector3
    ) {
        this.model = new UIVectorModel(vectorType, randomCount, randomRange, shooterPosition);
        this.renderer = new UIVectorControlRenderer(container, label, this.model, vectorType, readonlyIndices);
        this.eventHandler = new UIVectorControlEventHandler(this.container, this.model, this.renderer);
        this.renderer.render();
    }

    public show(): void {
        this.container.style.display = 'block';
        this.renderer.render();
    }

    public hide(): void {
        this.container.style.display = 'none';
    }

    public getVectorValues(): THREE.Vector3[] {
        return this.model.getVectors();
    }
}