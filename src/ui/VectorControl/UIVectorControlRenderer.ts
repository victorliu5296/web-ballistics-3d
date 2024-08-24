import * as THREE from 'three';
import { vectorControlManager } from './UIVectorControlManager';
import { UIVectorUpdateEvent } from './events';
import { eventBus } from '../../communication/EventBus';
import { UIVectorType } from './types/UIVectorTypes';
import { UIVectorElementFactory } from './UIVectorElementFactory';
import { UIVectorModel } from './UIVectorModel';
import { HelpButton } from './helpButtons/HelpButton';
import { ProjectileSetting, projectileSettings, setProjectileSetting } from '../../simulation/components/projectileSettings';

export class UIVectorControlRenderer {

    constructor(
        private container: HTMLElement,
        private label: string,
        private uiVectorModel: UIVectorModel,
        private vectorType: UIVectorType,
        private readOnlyIndices?: number[],
    ) {}

    public render(): void {
        this.container.innerHTML = `<h3>${this.label} Position Derivatives</h3>`;
        if (this.vectorType === 'projectile') {
            this.renderProjectileSpecificControls();
        }
        this.renderTopButtons();
        this.renderVectorsList();
        this.renderBottomButtons();
    }

    private renderProjectileSpecificControls(): void {
        const settingsContainer = document.createElement('div');
        settingsContainer.id = 'projectile-parameters-container';

        // Create and append the 'Index to Minimize' setting
        const indexInput = createSettingInput('Index to Minimize:',
                                                projectileSettings.indexToMinimize,
                                                ProjectileSetting.IndexToMinimize,
                                                "The index of the vector whose magnitude is the objective function to minimize.");
        settingsContainer.appendChild(indexInput);

        // Create and append the 'Fallback Intersection Time' setting
        const timeInput = createSettingInput('Fallback Intersection Time (seconds):',
                                                projectileSettings.fallbackIntersectionTime,
                                                ProjectileSetting.FallbackIntersectionTime,
                                                "Sometimes, there are no solutions to minimize the norm of the initial movement vector. For example, if the target only moves away from the shooter, it will attempt to fire towards infinity parallel to it; because if it is 0.001% faster than the target, it will in theory eventually reach it, but this is unreasonable in practice."
                                                +"\n\n"+
                                                "The fallback intersection time parameter, in seconds, is used in these cases. Instead of minimizing the vector magnitude, it will simply calculate the required initial value to make the projectile hit the target after this amount of time has passed since the firing of the projectile.");
        settingsContainer.appendChild(timeInput);

        this.container.appendChild(settingsContainer);
        
        function createSettingInput(labelText: string, value: number, settingKey: keyof typeof projectileSettings, helpMessage: string): HTMLElement {
            const label = document.createElement('label');
            label.textContent = labelText;
            const input = document.createElement('input');
            input.type = 'number';
            input.value = value.toString();
            input.step = '0.1';
            input.addEventListener('change', (e) => {
                const newValue = parseFloat((e.target as HTMLInputElement).value);
                setProjectileSetting(settingKey, newValue);
            });
        
            // Create help button and pass the label as the container
            new HelpButton(label, helpMessage); // The HelpButton appends itself to the label

            // Combine label and input into a container
            const inputContainer = document.createElement('div');
            inputContainer.appendChild(label);
            inputContainer.appendChild(input);
        
            return inputContainer;
        }
    }

    private renderTopButtons(): void {
        const clearAllButton = this.createButton('Clear All Vectors', () => {
            this.uiVectorModel.clearAllVectors();
            this.render();
        });
        const randomizeAllButton = this.createButton('Randomize All Vectors', () => {
            this.uiVectorModel.randomizeAllVectors();
            this.render();
        });

        this.container.appendChild(clearAllButton);
        this.container.appendChild(randomizeAllButton);
    }

    private renderVectorsList(): void {
        const vectorsList = document.createElement('div');

        this.uiVectorModel.getVectors().forEach((vector, index) => {
            const vectorElement = UIVectorElementFactory.createVectorElement(
                vector,
                index,
                this.vectorType,
                this.readOnlyIndices,
            );
            vectorsList.appendChild(vectorElement);
        });

        this.container.appendChild(vectorsList);
    }

    private renderBottomButtons(): void {
        const addZeroButton = this.createButton('Add Zero Vector', () => {
            this.uiVectorModel.addZeroVector();
            this.render();
        });
        const addRandomButton = this.createButton('Add Random Vector', () => {
            this.uiVectorModel.addRandomVector();
            this.render();
        });

        this.container.appendChild(addZeroButton);
        this.container.appendChild(addRandomButton);
    }

    private createButton(label: string, onClick: () => void): HTMLButtonElement {
        const button = document.createElement('button');
        button.textContent = label;
        button.onclick = onClick;
        return button;
    }
}