import { gameSettings } from "../../simulation/components/gameSettings";

export class GameControlRenderer {
    private static instance: GameControlRenderer;
    private container: HTMLElement;
    private gameParametersSection!: HTMLElement;
    private applyButton!: HTMLButtonElement;
    private timeScaleInput!: HTMLInputElement;
    private volumeInput!: HTMLInputElement; // Volume input
    private volumeValueDisplay!: HTMLElement; // Volume value display

    private constructor(container: HTMLElement) {
        this.container = container;
        this.initialize();
    }

    public static getInstance(container: HTMLElement): GameControlRenderer {
        if (!GameControlRenderer.instance) {
            GameControlRenderer.instance = new GameControlRenderer(container);
        }
        return GameControlRenderer.instance;
    }

    private initialize(): void {
        this.gameParametersSection = document.getElementById('gameParameters')!;
        
        if (!this.gameParametersSection) {
            this.gameParametersSection = document.createElement('div');
            this.gameParametersSection.id = 'gameParameters';
            this.gameParametersSection.style.display = 'none';

            const header = document.createElement('h3');
            header.textContent = 'Game Parameters';
            this.gameParametersSection.appendChild(header);

            const timeScaleLabel = document.createElement('label');
            timeScaleLabel.setAttribute('for', 'time-scale');
            timeScaleLabel.textContent = 'Time Scale:';
            this.gameParametersSection.appendChild(timeScaleLabel);

            this.timeScaleInput = document.createElement('input');
            this.timeScaleInput.type = 'number';
            this.timeScaleInput.id = 'time-scale';
            this.timeScaleInput.value = '1.0';
            this.timeScaleInput.step = '0.05';
            this.timeScaleInput.min = '0.01';
            this.gameParametersSection.appendChild(this.timeScaleInput);

            const volumeLabel = document.createElement('label');
            volumeLabel.setAttribute('for', 'volume');
            volumeLabel.textContent = 'Volume:';
            this.gameParametersSection.appendChild(volumeLabel);

            this.volumeInput = document.createElement('input');
            this.volumeInput.type = 'range';
            this.volumeInput.id = 'volume';
            this.volumeInput.min = '0';
            this.volumeInput.max = '1';
            this.volumeInput.step = '0.01';
            this.volumeInput.value = '1.0';
            this.volumeInput.addEventListener('input', this.updateVolumeDisplay.bind(this));
            this.gameParametersSection.appendChild(this.volumeInput);

            this.volumeValueDisplay = document.createElement('span');
            this.volumeValueDisplay.id = 'volume-value';
            this.volumeValueDisplay.textContent = this.volumeInput.value;
            this.gameParametersSection.appendChild(this.volumeValueDisplay);

            this.applyButton = document.createElement('button');
            this.applyButton.id = 'apply-parameters';
            this.applyButton.textContent = 'Apply';
            this.applyButton.addEventListener('click', this.applyParameters.bind(this));
            this.gameParametersSection.appendChild(this.applyButton);

            this.container.appendChild(this.gameParametersSection);
        }
    }

    private updateVolumeDisplay(): void {
        this.volumeValueDisplay.textContent = this.volumeInput.value;
    }

    private applyParameters(): void {
        const timeScale = parseFloat(this.timeScaleInput.value);
        if (isNaN(timeScale) || timeScale <= 0) {
            alert('Please enter a valid time scale greater than 0.');
            return;
        }

        const volume = parseFloat(this.volumeInput.value);
        if (isNaN(volume) || volume < 0 || volume > 1) {
            alert('Please enter a valid volume between 0 and 1.');
            return;
        }

        // Update the global game settings
        gameSettings.timeScale = timeScale;
        gameSettings.volume = volume;
    }

    public show(): void {
        this.gameParametersSection.style.display = 'block';
    }

    public hide(): void {
        this.gameParametersSection.style.display = 'none';
    }
}