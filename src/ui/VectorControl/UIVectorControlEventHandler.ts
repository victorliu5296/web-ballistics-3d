// UIVectorControlEventHandler.ts
import { UIVectorModel } from './UIVectorModel';
import { UIVectorControlRenderer } from './UIVectorControlRenderer';

export class UIVectorControlEventHandler {
    constructor(private container: HTMLElement, private model: UIVectorModel, private renderer: UIVectorControlRenderer) {
        this.attachEventListeners();
    }

    private attachEventListeners(): void {
        // Handle input changes
        this.container.addEventListener('change', this.handleEvent.bind(this));
        // Handle button clicks
        this.container.addEventListener('click', this.handleButtonClick.bind(this));
    }

    private handleEvent(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (target.tagName === 'INPUT' && target.type === 'number' && !target.readOnly) {
            const index = parseInt(target.dataset.index!);
            const component = target.dataset.component as 'x' | 'y' | 'z';
            const value = parseFloat(target.value);
            this.model.updateVector(index, component, value);
            this.renderer.render();
        }
    }

    private handleButtonClick(event: Event): void {
        const target = event.target as HTMLButtonElement;
        if (target.tagName === 'BUTTON' && !target.disabled) {
            // Check if the button is a help button
            if (target.getAttribute('data-help-button') === 'true') {
                return; // Do nothing, let the HelpButton handle its own logic
            }

            // Handle vector deletion logic
            const index = parseInt(target.dataset.index!);
            if (!isNaN(index)) {
                this.model.removeVector(index);
                this.renderer.render();
            }
        }
    }
}