// UIVectorTypes.ts
export const UIVectorTypes = {
    Target: 'target',
    Shooter: 'shooter',
    Projectile: 'projectile'
} as const;

// Define a type based on the const object values
export type UIVectorType = typeof UIVectorTypes[keyof typeof UIVectorTypes];