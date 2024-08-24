import { MenuToggle } from "../MenuToggle";
import { UIMenuSelector } from "../VectorControl/UIMenuSelector";

function getMaxZIndex(): number {
    const elements = document.getElementsByTagName('*');
    let maxZIndex = 0;

    for (let i = 0; i < elements.length; i++) {
        const zIndex = parseInt(window.getComputedStyle(elements[i]).zIndex);
        if (!isNaN(zIndex)) {
            maxZIndex = Math.min(Math.max(maxZIndex, zIndex), 10000); // Limit max z-index
        }
    }

    return maxZIndex;
}

export interface TutorialStep {
    element: string;
    text: string;
    beforeStep?: () => void;
    onClick?: () => void;
}

class TutorialManager {
    private steps: TutorialStep[];
    private currentStep: number;
    private originalZIndexes: Map<HTMLElement, string>;
    private targetObserver: MutationObserver | null = null;
    private menuToggle: MenuToggle;

    constructor(steps: TutorialStep[], menuToggle: MenuToggle) {
        this.steps = steps;
        this.currentStep = 0;
        this.originalZIndexes = new Map();
        this.menuToggle = menuToggle;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        document.getElementById("tutorial-next")!.addEventListener("click", () => this.nextStep());
        document.getElementById("tutorial-prev")!.addEventListener("click", () => this.prevStep());
        document.getElementById("tutorial-button")!.addEventListener("click", () => this.toggleTutorial());
    }

    private updateStepPosition(): void {
        if (this.currentStep >= 0 && this.currentStep < this.steps.length) {
            this.showStep(this.currentStep);
        }
    }

    private showStep(stepIndex: number): void {
        const overlayId = "dynamic-tutorial-overlay";
        let overlay = document.getElementById(overlayId);

        const popup = document.getElementById("tutorial-popup")!;
        const text = document.getElementById("tutorial-text")!;
        const tutorialButton = document.getElementById("tutorial-button")!;
        const tutorialControls = document.getElementById("tutorial-controls")!;

        if (stepIndex < 0 || stepIndex >= this.steps.length) {
            if (overlay) {
                overlay.style.display = "none";
            }
            return;
        }

        const step = this.steps[stepIndex];

        // Execute the beforeStep function if it exists
        if (step.beforeStep) {
            step.beforeStep();
        }

        const targetElement = document.querySelector(step.element) as HTMLElement;

        if (!targetElement) {
            console.error(`Element not found: ${step.element}`);
            return;
        }

        // Store the original z-index of the target element
        if (!this.originalZIndexes.has(targetElement)) {
            this.originalZIndexes.set(targetElement, targetElement.style.zIndex);
        }

        // Remove highlight from previous element
        const previousHighlight = document.querySelector('.tutorial-highlight');
        if (previousHighlight) {
            previousHighlight.classList.remove('tutorial-highlight');
        }

        const rect = targetElement.getBoundingClientRect();
        const maxZIndex = getMaxZIndex();

        // Append the overlay to the parent of the target element
        const parentElement = targetElement.parentElement;
        if (parentElement) {
            // Store the original z-index
            if (!this.originalZIndexes.has(parentElement)) {
                this.originalZIndexes.set(parentElement, parentElement.style.zIndex);
            }

            if (!overlay) {
                overlay = document.createElement("div");
                overlay.id = overlayId;
                overlay.className = "tutorial-overlay";
            } else {
                // Remove overlay from previous parent
                overlay.parentElement?.removeChild(overlay);
            }

            parentElement.style.zIndex = (maxZIndex + 1).toString();
            parentElement.appendChild(overlay);
            overlay.style.zIndex = (maxZIndex + 2).toString();
            overlay.style.display = "block";
        }

        text.textContent = step.text;
        popup.style.display = "block";
        this.setPosition(targetElement, popup);
        popup.style.zIndex = (maxZIndex + 3).toString();

        tutorialButton.style.zIndex = (maxZIndex + 5).toString();
        tutorialControls.style.zIndex = (maxZIndex + 5).toString();

        targetElement.style.zIndex = (maxZIndex + 4).toString();
        // Apply highlight to the current element
        targetElement.classList.add('tutorial-highlight');

        // Observe the target element for changes
        if (this.targetObserver) {
            this.targetObserver.disconnect();
        }

        this.targetObserver = new MutationObserver(() => {
            this.updatePopupPosition(targetElement, popup);
        });

        this.targetObserver.observe(targetElement, { attributes: true, childList: true, subtree: true });

        // Add onClick event listener if provided
        if (step.onClick) {
            const handleClick = () => {
                step.onClick!();
                targetElement.removeEventListener('click', handleClick);
            };
            targetElement.addEventListener('click', handleClick);
        }

        // Continuously update the position during animation
        this.updatePopupDuringAnimation(targetElement, popup);
    }

    private setPosition(targetElement: HTMLElement, popup: HTMLElement): void {
        const rect = targetElement.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();

        let top = rect.bottom + 10 + window.scrollY;
        let left = rect.left + window.scrollX;
        let isFallbackPosition = false;

        // Check if there's enough space below
        if (top + popupRect.height > window.innerHeight) {
            // Try positioning above the target
            top = rect.top - popupRect.height - 10 + window.scrollY;
        }

        // If still out of bounds, check for space on the right
        if (top < 0 || top + popupRect.height > window.innerHeight) {
            top = rect.top + window.scrollY;
            left = rect.right + 10 + window.scrollX;

            // If not enough space on the right, check for space on the left
            if (left + popupRect.width > window.innerWidth) {
                left = rect.left - popupRect.width - 10 + window.scrollX;
            }
        }

        // If the popup is still out of bounds, ensure it stays within the viewport
        if (top < 0) {
            top = 10; // Add some margin from the top
        }
        if (left < 0) {
            left = 10; // Add some margin from the left
        }

        // Final fallback: center the popup in the viewport if no space is available around the target element
        if (top + popupRect.height > window.innerHeight || left + popupRect.width > window.innerWidth) {
            top = (window.innerHeight - popupRect.height) / 2 + window.scrollY;
            left = (window.innerWidth - popupRect.width) / 2 + window.scrollX;
            isFallbackPosition = true;
            popup.style.zIndex = (targetElement.style.zIndex + 1).toString();
        }

        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;
    }

    private updatePopupPosition(targetElement: HTMLElement, popup: HTMLElement): void {
        this.setPosition(targetElement, popup);
    }

    private updatePopupDuringAnimation(targetElement: HTMLElement, popup: HTMLElement): void {
        const update = () => {
            this.setPosition(targetElement, popup);
            if (this.menuToggle.getIsAnimating()) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    }

    private addResizeAndScrollListeners(): void {
        window.addEventListener("resize", this.updateStepPosition);
        window.addEventListener("scroll", this.updateStepPosition);
    }

    private removeResizeAndScrollListeners(): void {
        window.removeEventListener("resize", this.updateStepPosition);
        window.removeEventListener("scroll", this.updateStepPosition);
    }

    public nextStep(): void {
        if (this.currentStep < this.steps.length - 1) {
            this.restoreOriginalZIndexes();
            this.currentStep++;
            this.showStep(this.currentStep);
        } else {
            this.close(); // Close the tutorial if it's the last step
        }
    }

    public prevStep(): void {
        if (this.currentStep > 0) {
            this.restoreOriginalZIndexes();
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    private restoreOriginalZIndexes(): void {
        const step = this.steps[this.currentStep];
        const targetElement = document.querySelector(step.element) as HTMLElement;
        const parentElement = targetElement.parentElement;

        // Restore the z-index of the target element
        if (this.originalZIndexes.has(targetElement)) {
            targetElement.style.zIndex = this.originalZIndexes.get(targetElement) || '';
            this.originalZIndexes.delete(targetElement);
        }

        // Restore the z-index of the parent element
        if (parentElement && this.originalZIndexes.has(parentElement)) {
            parentElement.style.zIndex = this.originalZIndexes.get(parentElement) || '';
            this.originalZIndexes.delete(parentElement);
        }
    }

    public close(): void {
        if (this.targetObserver) {
            this.targetObserver.disconnect();
        }
        const overlay = document.getElementById("dynamic-tutorial-overlay");
        if (overlay) {
            overlay.remove();
        }
        const highlightedElement = document.querySelector('.tutorial-highlight');
        if (highlightedElement) {
            highlightedElement.classList.remove('tutorial-highlight');
        }
        const tutorialButton = document.getElementById("tutorial-button")!;
        const tutorialControls = document.getElementById("tutorial-controls")!;
        const popup = document.getElementById("tutorial-popup")!;
        tutorialButton.textContent = "Start Tutorial";
        tutorialControls.style.display = "none";
        popup.style.display = "none";

        this.removeResizeAndScrollListeners();
        this.restoreOriginalZIndexes();
    }

    public start(): void {
        this.currentStep = 0;
        this.showStep(this.currentStep);
        const tutorialButton = document.getElementById("tutorial-button")!;
        const tutorialControls = document.getElementById("tutorial-controls")!;
        tutorialButton.textContent = "Close Tutorial";
        tutorialControls.style.display = "flex";
        this.addResizeAndScrollListeners();
    }

    public toggleTutorial(): void {
        const tutorialButton = document.getElementById("tutorial-button")!;
        if (tutorialButton.textContent === "Start Tutorial") {
            this.start();
        } else {
            this.close();
        }
    }
}

export function setupTutorial(menuToggle: MenuToggle, menuSelector: UIMenuSelector): void {
    const tutorialSteps: TutorialStep[] = [
        {
            element: "#menuSelector",
            text: "Select the parameters to adjust: Target, Shooter, Projectile, or Game Parameters.",
            beforeStep: () => {
                menuToggle.openMenu(); // Ensure the menu is open before starting this step
            }
        },
        {
            element: "#targetVectors",
            text: "These are the projectile derivatives of the target. They are used to calculate the target's trajectory.",
            beforeStep: () => {
                menuToggle.openMenu(); // Ensure the menu is open before starting this step
                menuSelector.changeToType("target");
            }
        },
        { element: "#spawn-target", text: "Click here to spawn a new target based on the parameters in the menu." },
        { element: "#spawn-random-target", text: "Click here to spawn a new target with random parameters." },
        { element: "#fire-projectile", text: "Click here to fire a projectile. The projectile does not fire if there is no available target. If it does fire, it tracks the oldest spawned target." },
        {
            element: "#projectile-parameters-container",
            text: "These are the parameters of the projectile. Click on the help buttons for more details.",
            beforeStep: () => {
                menuToggle.openMenu(); // Ensure the menu is open before starting this step
                menuSelector.changeToType("projectile");
            }
        },
        {
            element: "#gameParameters",
            text: "Adjust the game parameters here.",
            beforeStep: () => {
                menuToggle.openMenu(); // Ensure the menu is open before starting this step
                menuSelector.changeToType("gameParameters");
            }
        },
        {
            element: "#scene-container canvas",
            text: "You can scroll or pinch to zoom out and in, left-drag to rotate, right-drag to move.",
        },
    ];
    const tutorialManager = new TutorialManager(tutorialSteps, menuToggle);
}