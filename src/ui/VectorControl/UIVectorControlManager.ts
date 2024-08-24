import { UIVectorType, UIVectorTypes } from './types/UIVectorTypes';
import { UIVectorControl } from './UIVectorControl';
import { UIVectorControlFactory } from './UIVectorControlFactory';
import { eventBus } from '../../communication/EventBus';
import { UIVectorUpdateEvent } from './events/UIVectorUpdateEvent';
import { updateScaledDisplacementDerivatives } from '../../simulation/utils/MovementUtils';
import * as THREE from 'three';
import { ProjectileSetting, getProjectileSetting } from '../../simulation/components/projectileSettings';
import { GameControlRenderer } from '../controls/GameControlRenderer';

class UIVectorControlManager {
    private vectorControls: Record<UIVectorType | 'gameParameters', UIVectorControl | GameControlRenderer>;

    constructor() {
        const shooterControl = UIVectorControlFactory.createVectorControl(UIVectorTypes.Shooter);

        this.vectorControls = {
            target: UIVectorControlFactory.createVectorControl(UIVectorTypes.Target) as UIVectorControl,
            shooter: shooterControl as UIVectorControl,
            projectile: UIVectorControlFactory.createVectorControl(UIVectorTypes.Projectile, 3, 3, [0, getProjectileSetting(ProjectileSetting.IndexToMinimize)], shooterControl.getVectorValues()[0]) as UIVectorControl,
            gameParameters: GameControlRenderer.getInstance(document.getElementById('vectorControlsContainer')!),
        };

        this.subscribeToEvents();
        this.hideAllVectorControls();
    }

    private subscribeToEvents(): void {
        eventBus.subscribe(UIVectorUpdateEvent, this.handleVectorUpdate.bind(this));
    }

    private handleVectorUpdate(event: UIVectorUpdateEvent): void {
        this.updateBackendValues();
    }

    private hideAllVectorControls(): void {
        Object.values(this.vectorControls).forEach(control => {
            if (control instanceof UIVectorControl || GameControlRenderer) {
                control.hide();
            }
        });
    }

    private updateBackendValues(): void {
        const vectors = this.getAllVectorValues();
        updateScaledDisplacementDerivatives(vectors.target, vectors.shooter, vectors.projectile);
    }

    public handleVectorTypeChange(selectedType: UIVectorType | 'gameParameters'): void {
        if (selectedType === 'gameParameters') {
            this.hideAllVectorControls();
            (this.vectorControls.gameParameters as GameControlRenderer).show();
            document.getElementById('vectorControlsContainer')!.style.display = 'block';
            return;
        }

        if (!this.vectorControls[selectedType]) {
            console.error(`Invalid vector type selected: ${selectedType}`);
            return;
        }

        this.hideAllVectorControls();
        const selectedControl = this.vectorControls[selectedType];
        selectedControl.show();
        document.getElementById('vectorControlsContainer')!.style.display = 'block';
    }

    public showInitialVectorControl(): void {
        this.hideAllVectorControls();
        this.vectorControls.target.show();
        document.getElementById('vectorControlsContainer')!.style.display = 'block';
    }

    public getAllVectorValues(): Record<UIVectorType, THREE.Vector3[]> {
        return {
            shooter: (this.vectorControls.shooter as UIVectorControl).getVectorValues(),
            projectile: (this.vectorControls.projectile as UIVectorControl).getVectorValues(),
            target: (this.vectorControls.target as UIVectorControl).getVectorValues(),
        };
    }
}

export const vectorControlManager = new UIVectorControlManager();