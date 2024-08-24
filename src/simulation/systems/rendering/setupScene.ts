import * as THREE from 'three'; 
import { getRenderingSystem } from './RenderingSystem';
import { WindowResizeHandler } from '../../../ui/WindowResizeHandler';
import { createRandomTargetSpawner } from '../spawners/RandomTargetSpawner';
import { Shooter } from '../../entities/implementations/Shooter';
import { createTargetSpawner } from '../spawners/TargetSpawner';
import { createProjectileSpawner } from '../spawners/ProjectileSpawner';
import { ExplosionHandler } from '../collision/ExplosionHandler';

const renderingSystem = getRenderingSystem();

// Setup scene rendering and spawners
export function setupScene(): THREE.Scene {
    const scene = renderingSystem.getScene();

    createTargetSpawner(scene);
    createRandomTargetSpawner(scene);
    createProjectileSpawner(scene);

    const shooter = new Shooter();
    shooter.addToScene(scene);

    renderingSystem.animate();

    new WindowResizeHandler(resizeScene);

    // Initialize ExplosionHandler with the scene and camera
    new ExplosionHandler(scene, renderingSystem.getCamera());

    return scene;
}

// Resize the scene container based on window size
export function resizeScene(): void {
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) {
        sceneContainer.style.width = `${window.innerWidth}px`;
        sceneContainer.style.height = `${window.innerHeight}px`;
    }
    renderingSystem.resizeRenderer();
}