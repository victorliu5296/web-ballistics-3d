// VectorUpdateEvent.ts
import { UIVectorType } from '../types/UIVectorTypes';
import * as THREE from 'three';

export class UIVectorUpdateEvent {
    constructor(
        public vectorType: UIVectorType,
        public vectors: THREE.Vector3[]
    ) {}
}