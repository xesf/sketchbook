import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CameraOperator } from '../core/CameraOperator';
import { Stats } from '../../lib/utils/Stats';
import { CannonDebugRenderer } from '../../lib/cannon/CannonDebugRenderer';
import { InputManager } from '../core/InputManager';
import { LoadingManager } from '../core/LoadingManager';
import { InfoStack } from '../core/InfoStack';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { IUpdatable } from '../interfaces/IUpdatable';
import { Character } from '../characters/Character';
import { Path } from './Path';
import { Vehicle } from '../vehicles/Vehicle';
import { Helicopter } from '../vehicles/Helicopter';
import { Airplane } from '../vehicles/Airplane';
import { Car } from '../vehicles/Car';
import { Scenario } from './Scenario';
import { newSky } from './Sky';
export declare class World {
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    composer: any;
    stats: Stats;
    scene: THREE.Scene;
    sky: newSky;
    physicsWorld: CANNON.World;
    parallelPairs: any[];
    physicsFrameRate: number;
    physicsFrameTime: number;
    physicsMaxPrediction: number;
    clock: THREE.Clock;
    renderDelta: number;
    logicDelta: number;
    requestDelta: number;
    sinceLastFrame: number;
    justRendered: boolean;
    params: any;
    inputManager: InputManager;
    cameraOperator: CameraOperator;
    timeScaleTarget: number;
    console: InfoStack;
    cannonDebugRenderer: CannonDebugRenderer;
    scenarios: Scenario[];
    characters: Character[];
    vehicles: Vehicle[];
    cars: Car[];
    helicopters: Helicopter[];
    airplanes: Airplane[];
    paths: Path[];
    scenarioGUIFolder: any;
    updatables: IUpdatable[];
    paused: boolean;
    prevControls: any;
    private lastScenarioID;
    constructor(worldScenePath?: any);
    toggle_pause(): void;
    update(timeStep: number, unscaledTimeStep: number): void;
    updatePhysics(timeStep: number): void;
    isOutOfBounds(position: CANNON.Vec3): boolean;
    outOfBoundsRespawn(body: CANNON.Body, position?: CANNON.Vec3): void;
    /**
     * Rendering loop.
     * Implements fps limiter and frame-skipping
     * Calls world's "update" function before rendering.
     * @param {World} world
     */
    render(world: World): void;
    setTimeScale(value: number): void;
    add(worldEntity: IWorldEntity): void;
    registerUpdatable(registree: IUpdatable): void;
    remove(worldEntity: IWorldEntity): void;
    unregisterUpdatable(registree: IUpdatable): void;
    loadScene(loadingManager: LoadingManager, gltf: any): void;
    launchScenario(scenarioID: string, loadingManager?: LoadingManager): void;
    restartScenario(): void;
    clearEntities(): void;
    scrollTheTimeScale(scrollAmount: number): void;
    updateControls(controls: any): void;
    private createParamsGUI;
}
