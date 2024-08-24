// projectileSettings.ts
export const projectileSettings = {
    indexToMinimize: 1,
    fallbackIntersectionTime: 3.0
};

export enum ProjectileSetting {
    IndexToMinimize = 'indexToMinimize',
    FallbackIntersectionTime = 'fallbackIntersectionTime'
}

export function setProjectileSetting(key: keyof typeof projectileSettings, value: number) : void {
    if (key in projectileSettings) {
        projectileSettings[key] = value;
        return;
    }
    console.error(`Attempted to update non-existing setting: ${key}`);
}

export function getProjectileSetting(key: keyof typeof projectileSettings) : number {
    if (key in projectileSettings) {
        return projectileSettings[key];
    }
    console.error(`Attempted to access non-existing setting: ${key}`);
    return NaN;
}