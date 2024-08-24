import * as THREE from 'three';
import { gameLoop } from './simulation/systems/GameLoop';
import { setupUI } from './ui/setupUI';
import { setupScene } from './simulation/systems/rendering/setupScene';

export let globalScene: THREE.Scene; // Global scene reference

// Initialize the application
function initializeApp(): void {
    globalScene = setupScene();
    setupUI();
    setPositionRelativeIfStatic();
    gameLoop.start();
}

// Properly handle the document's readiness state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function setPositionRelativeIfStatic() {
    const allElements = document.querySelectorAll('*') as NodeListOf<HTMLElement>;
    allElements.forEach(element => {
        if (element === document.body || element === document.head || element === document.documentElement) {
            return;
        }
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.position === 'static') {
            element.style.position = 'relative';
        }
    });
}