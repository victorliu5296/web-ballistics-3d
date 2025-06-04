import * as THREE from 'three';
import { UIVectorType } from './types/UIVectorTypes';
import { HelpMessageService } from './helpButtons/HelpMessageService';
import { HelpButton } from './helpButtons/HelpButton';
import { UIVectorUpdateEvent } from './events';
import { eventBus } from '../../communication/EventBus';

export class UIVectorElementFactory {
    public static createHelpButton(vectorElement: HTMLElement, vectorType: UIVectorType, index: number, readOnly: boolean, removeDisabled: boolean): void {
        const helpMessage = HelpMessageService.getHelpMessage(vectorType, index, readOnly, removeDisabled);
        if (helpMessage) {
            new HelpButton(vectorElement, helpMessage);
        }
    }

    public static createVectorElement(
        vector: THREE.Vector3,
        index: number,
        vectorType: UIVectorType,
        readonlyIndices?: number[],
    ): HTMLDivElement {
        const vectorElement = document.createElement('div');
        vectorElement.className = 'vector-controls';
        const readOnly = UIVectorElementFactory.isReadOnly(readonlyIndices, index);
        const removeDisabled = UIVectorElementFactory.isRemoveDisabled(readonlyIndices, index);
        const buttonDisabledAttribute = readOnly || removeDisabled ? ' disabled' : '';
        const buttonClass = readOnly || removeDisabled ? 'button-disabled' : '';

        vectorElement.innerHTML = `
            <label>Order ${index} position derivative: </label>
            <input type="number" value="${vector.x.toFixed(2)}" step="0.01" data-index="${index}" data-component="x" ${readOnly ? 'readonly' : ''}>
            <input type="number" value="${vector.y.toFixed(2)}" step="0.01" data-index="${index}" data-component="y" ${readOnly ? 'readonly' : ''}>
            <input type="number" value="${vector.z.toFixed(2)}" step="0.01" data-index="${index}" data-component="z" ${readOnly ? 'readonly' : ''}>
            <button class="${buttonClass}" data-index="${index}"${buttonDisabledAttribute}>Remove</button>
        `;

        UIVectorElementFactory.createHelpButton(vectorElement, vectorType, index, readOnly, removeDisabled);

        return vectorElement;
    }

    private static isReadOnly(readonlyIndices: number[] | undefined, index: number): boolean {
        if (!readonlyIndices) {
            return false;
        }
        
        return readonlyIndices.includes(index);
    }

    private static isRemoveDisabled(readonlyIndices: number[] | undefined, index: number): boolean {
        if (index === 0) {
            return true;
        }

        if (!readonlyIndices) {
            return false;
        }
        
        return (index < Math.max(...readonlyIndices));
    }
}