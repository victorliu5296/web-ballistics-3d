import * as THREE from 'three';
import { eventBus } from '../../../communication/EventBus';
import { CollisionEvent } from '../../../communication/events/entities/CollisionEvent';
import { gameSettings } from '../../components/gameSettings'; // Import gameSettings

export class ExplosionHandler {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private particleSystem: THREE.Points;
    private particleLife: number[];
    private audioLoader: THREE.AudioLoader;
    private listener: THREE.AudioListener;
    private baseUrl: string; // Base URL for assets

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;
        eventBus.subscribe(CollisionEvent, this.handleExplosion.bind(this));
        this.particleSystem = this.initParticleSystem();
        this.particleLife = new Array(1000).fill(0);
        this.audioLoader = new THREE.AudioLoader();
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener); // Add listener to the camera

        // Determine the base URL for assets
        this.baseUrl = this.getBaseUrl();
    }

    private getBaseUrl(): string {
        const url = window.location.href;
        const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
        return baseUrl;
    }

    private initParticleSystem(): THREE.Points {
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            velocities[i * 3] = (Math.random() - 0.5) * 2;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 2;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffaa00,
            size: 0.2,
            transparent: true,
            opacity: 0.8,
        });

        return new THREE.Points(particles, material);
    }

    private handleExplosion(event: CollisionEvent): void {
        const projectile = event.projectile;
        const position = projectile.position;

        this.triggerExplosion(position);
        this.playExplosionSound(position);
    }

    private triggerExplosion(position: THREE.Vector3): void {
        const particlePositions = this.particleSystem.geometry.attributes.position.array;
        const particleVelocities = this.particleSystem.geometry.attributes.velocity.array;

        for (let i = 0; i < particlePositions.length; i += 3) {
            particlePositions[i] = position.x;
            particlePositions[i + 1] = position.y;
            particlePositions[i + 2] = position.z;

            this.particleLife[i / 3] = Math.random() * 2; // random lifetime for particles
        }

        this.scene.add(this.particleSystem);
        this.animateParticles();
    }

    private animateParticles(): void {
        const particlePositions = this.particleSystem.geometry.attributes.position.array;
        const particleVelocities = this.particleSystem.geometry.attributes.velocity.array;

        const animate = () => {
            let aliveParticles = false;

            for (let i = 0; i < particlePositions.length; i += 3) {
                if (this.particleLife[i / 3] > 0) {
                    particlePositions[i] += particleVelocities[i] * 0.1;
                    particlePositions[i + 1] += particleVelocities[i + 1] * 0.1;
                    particlePositions[i + 2] += particleVelocities[i + 2] * 0.1;

                    this.particleLife[i / 3] -= 0.1;
                    aliveParticles = true;
                }
            }

            this.particleSystem.geometry.attributes.position.needsUpdate = true;

            if (aliveParticles) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(this.particleSystem);
            }
        };

        animate();
    }

    private playExplosionSound(position: THREE.Vector3): void {
        const sound = new THREE.PositionalAudio(this.listener);
        const soundPath = `${this.baseUrl}assets/sounds/mixkit-bomb-distant-explotion-2772.mp3`;
        this.audioLoader.load(soundPath, (buffer) => {
            sound.setBuffer(buffer);
            sound.setRefDistance(20);
            sound.setVolume(gameSettings.volume); // Use the volume from gameSettings
            sound.play();
        });

        const soundObject = new THREE.Object3D();
        soundObject.position.copy(position);
        soundObject.add(sound);
        this.scene.add(soundObject);

        // Remove soundObject from the scene after the sound has played
        sound.onEnded = () => {
            this.scene.remove(soundObject);
        };

        // Adjust volume based on distance from the camera
        const cameraPosition = new THREE.Vector3();
        this.camera.getWorldPosition(cameraPosition);
        const distance = cameraPosition.distanceTo(position);
        const maxDistance = 100; // Maximum distance for volume attenuation
        const adjustedVolume = Math.max(0, gameSettings.volume * (1 - distance / maxDistance));
        sound.setVolume(adjustedVolume);
    }
}