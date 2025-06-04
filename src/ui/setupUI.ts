import { MenuToggle } from './MenuToggle';
import { createMenuSelector } from './VectorControl/UIMenuSelector';
import { UIVectorType } from './VectorControl/types/UIVectorTypes';
import { eventBus } from '../communication/EventBus';
import { SpawnRandomTargetEvent } from '../communication/events/entities/spawning/SpawnRandomTargetEvent';
import { SpawnTargetEvent } from '../communication/events/entities/spawning/SpawnTargetEvent';
import { SpawnProjectileEvent } from '../communication/events/entities/spawning/SpawnProjectileEvent';
import { entityManager } from '../simulation/systems/EntityManager';
import { vectorControlManager } from './VectorControl/UIVectorControlManager';
import { getProjectileSetting, ProjectileSetting } from '../simulation/components/projectileSettings';
import { setupTutorial } from './tutorial/TutorialManager';

// Setup UI interactions and button click handlers
export function setupUI() {
    const menuToggleButton = document.getElementById('menu-toggle')!;
    const interfaceContainer = document.getElementById('interface-container')!;
    const spawnTargetButton = document.getElementById('spawn-target');
    const spawnRandomTargetButton = document.getElementById('spawn-random-target');
    const fireProjectileButton = document.getElementById('fire-projectile');

    const menuToggle = new MenuToggle(menuToggleButton, interfaceContainer);
    
    const menuSelectorElement = document.getElementById('menuSelector')! as HTMLSelectElement;
    
    const menuSelector = createMenuSelector(menuSelectorElement, handleVectorTypeChange);
    vectorControlManager.showInitialVectorControl();
    
    setupTutorial(menuToggle, menuSelector);

    // Event listeners for spawning targets and projectiles
    spawnTargetButton?.addEventListener('click', () => {
        const uiVectors = vectorControlManager.getAllVectorValues();
        eventBus.emit(SpawnTargetEvent, new SpawnTargetEvent(uiVectors.target, uiVectors.shooter));
        // console.log('Spawn target event triggered with vectors:', uiVectors.target, uiVectors.shooter);
    });

    spawnRandomTargetButton?.addEventListener('click', () => {
        eventBus.emit(SpawnRandomTargetEvent, new SpawnRandomTargetEvent());
        // console.log('Spawn random target event triggered');
    });

    fireProjectileButton?.addEventListener('click', () => {
        const target = entityManager.getOldestUnengagedTarget();
        if (!target) {
            console.log('No unengaged target available. Skipping projectile spawn.');
            return;
        }

        const uiVectors = vectorControlManager.getAllVectorValues();
        eventBus.emit(SpawnProjectileEvent, new SpawnProjectileEvent(
            uiVectors.target,
            uiVectors.shooter,
            uiVectors.projectile,
            getProjectileSetting(ProjectileSetting.IndexToMinimize),
            getProjectileSetting(ProjectileSetting.FallbackIntersectionTime),
            target
        ));

        // const targetDetails = {
        //     target: JSON.stringify(uiVectors.target),
        //     shooter: JSON.stringify(uiVectors.shooter),
        //     projectile: JSON.stringify(uiVectors.projectile),
        //     indexToMinimize: getProjectileSetting(ProjectileSetting.IndexToMinimize),
        //     fallbackIntersectionTime: getProjectileSetting(ProjectileSetting.FallbackIntersectionTime),
        //     targetObject: target ? {
        //         scaledTargetDerivatives: JSON.stringify(target.getScaledPositionDerivatives()),
        //         position: JSON.stringify(target.position),
        //         lifetime: target.lifeTime
        //     } : null,
        // };
        // console.log(`Projectile spawn event triggered with ${JSON.stringify(targetDetails)}`);
    });
}
// Handle vector type selection change
function handleVectorTypeChange(selectedType: UIVectorType | 'gameParameters'): void {
    vectorControlManager.handleVectorTypeChange(selectedType);
}