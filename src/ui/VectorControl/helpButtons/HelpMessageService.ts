import { UIVectorType, UIVectorTypes } from "../types/UIVectorTypes";

// HelpMessageService.ts
export class HelpMessageService {
    static getHelpMessage(vectorType: UIVectorType, index: number, readOnly: boolean, removeDisabled: boolean): string {
        // Only show the help message for the projectile vectors
        if (vectorType !== UIVectorTypes.Projectile) { return ''; }
        
        if (index === 0) {
            return 'The projectile is always fired from the shooter, so it has the same position as it.';
        } else if (readOnly) {
            return 'This is the derivative that will be minimized according to the objective function, so it is readonly.';
        } else if (removeDisabled) {
            return 'You cannot remove vectors before the read-only derivative.';
        }
        return '';
    }
}