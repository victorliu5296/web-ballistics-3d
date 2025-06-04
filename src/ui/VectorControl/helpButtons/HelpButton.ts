// HelpButton.ts
export class HelpButton {
    private button: HTMLButtonElement;
    private tooltip: HTMLDivElement;

    constructor(private container: HTMLElement, private description: string) {
        this.button = document.createElement('button');
        this.button.className = 'help-button';
        this.button.textContent = '?';
        this.button.setAttribute('data-help-button', 'true'); // Add data attribute
        this.button.addEventListener('click', this.toggleTooltip.bind(this));

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        this.tooltip.textContent = description;
        this.tooltip.style.display = 'none';

        this.container.appendChild(this.button);
        this.container.appendChild(this.tooltip);
    }

    private toggleTooltip(): void {
        this.tooltip.style.display = this.tooltip.style.display === 'none' ? 'block' : 'none';
    }
}