import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import { CameraOperator } from '../core/CameraOperator';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader  } from 'three/examples/jsm/shaders/FXAAShader';

import { Stats } from '../../lib/utils/Stats';
import * as GUI from '../../lib/utils/dat.gui';
import { CannonDebugRenderer } from '../../lib/cannon/CannonDebugRenderer';

import { InputManager } from '../core/InputManager';
import * as Utils from '../core/FunctionLibrary';
import { LoadingManager } from '../core/LoadingManager';
import { InfoStack } from '../core/InfoStack';
import { UIManager } from '../core/UIManager';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { IUpdatable } from '../interfaces/IUpdatable';
import { Character } from '../characters/Character';
import { Path } from './Path';
import { CollisionGroups } from '../enums/CollisionGroups';
import { BoxCollider } from '../physics/colliders/BoxCollider';
import { TrimeshCollider } from '../physics/colliders/TrimeshCollider';
import { Vehicle } from '../vehicles/Vehicle';
import { Helicopter } from '../vehicles/Helicopter';
import { Airplane } from '../vehicles/Airplane';
import { Car } from '../vehicles/Car';
import { Scenario } from './Scenario';
import { newSky } from './Sky';
import { Ocean } from './Ocean';


export class World
{
    public renderer: THREE.WebGLRenderer;
    public camera: THREE.PerspectiveCamera;
    public composer: any;
    public stats: Stats;
    public scene: THREE.Scene;
    public sky: newSky;
    public physicsWorld: CANNON.World;
    public parallelPairs: any[];
    public physicsFrameRate: number;
    public physicsFrameTime: number;
    public physicsMaxPrediction: number;
    public clock: THREE.Clock;
    public renderDelta: number;
    public logicDelta: number;
    public requestDelta: number;
    public sinceLastFrame: number;
    public justRendered: boolean;
    public params: any;
    public inputManager: InputManager;
    public cameraOperator: CameraOperator;
    public timeScaleTarget: number = 1;
    public console: InfoStack;
    public cannonDebugRenderer: CannonDebugRenderer;
    public scenarios: Scenario[] = [];
    public characters: Character[] = [];
    public vehicles: Vehicle[] = [];
    public cars: Car[] = [];
    public helicopters: Helicopter[] = [];
    public airplanes: Airplane[] = [];
    public paths: Path[] = [];
    public scenarioGUIFolder: any;
    public updatables: IUpdatable[] = [];
    public paused: boolean;
    public prevControls: any;

    private lastScenarioID: string;

    constructor(worldScenePath?: any)
    {
        const scope = this;

        this.paused = false;

        // Renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.needsUpdate = true;

        document.body.appendChild(this.renderer.domElement);
        this.renderer.domElement.id = 'canvas';

        // Auto window resize
        function onWindowResize(): void
        {
            scope.camera.aspect = window.innerWidth / window.innerHeight;
            scope.camera.updateProjectionMatrix();
            scope.renderer.setSize(window.innerWidth, window.innerHeight);
            // fxaaPass.uniforms['resolution'].value.set(1 / (window.innerWidth * pixelRatio), 1 / (window.innerHeight * pixelRatio));
            // scope.composer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
        }
        window.addEventListener('resize', onWindowResize, false);

		document.addEventListener('keydown', (evt) => {
            if (evt.code === 'KeyP') {
                this.toggle_pause();
            }
        }, false);

        this.scene = new THREE.Scene();
        this.scene.castShadow = true;
        this.scene.receiveShadow = true;

        this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1010);

        // // Passes
        // let renderPass = new RenderPass( this.scene, this.camera );
        // let fxaaPass = new ShaderPass( FXAAShader );

        // // FXAA
        // let pixelRatio = this.renderer.getPixelRatio();
        // fxaaPass.material['uniforms'].resolution.value.x = 1 / ( window.innerWidth * pixelRatio );
        // fxaaPass.material['uniforms'].resolution.value.y = 1 / ( window.innerHeight * pixelRatio );

        // Composer
        // this.composer = new EffectComposer( this.renderer );
        // this.composer.addPass( renderPass );
        // this.composer.addPass( fxaaPass );

        // Physics
        this.physicsWorld = new CANNON.World();
        this.physicsWorld.gravity.set(0, -9.81, 0);
        this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
        //this.physicsWorld.solver.iterations = 10; NOW DEFAULT for GSSolver
        this.physicsWorld.allowSleep = true;

        this.parallelPairs = [];
        this.physicsFrameRate = 60;
        this.physicsFrameTime = 1 / this.physicsFrameRate;
        this.physicsMaxPrediction = this.physicsFrameRate;

        // RenderLoop
        this.clock = new THREE.Clock();
        this.renderDelta = 0;
        this.logicDelta = 0;
        this.sinceLastFrame = 0;
        this.justRendered = false;

        // Stats (FPS, Frame time, Memory)
        this.stats = Stats();
        // Create right panel GUI
        this.createParamsGUI(scope);

        // Initialization
        this.inputManager = new InputManager(this, this.renderer.domElement);
        this.cameraOperator = new CameraOperator(this, this.camera, this.params.Mouse_Sensitivity);
        this.sky = new newSky(this);
        
        // Load scene if path is supplied
        if (worldScenePath !== undefined)
        {
            let loadingManager = new LoadingManager(this);
            loadingManager.onFinishedCallback = () =>
            {
                this.update(1, 1);
                this.setTimeScale(1);
                UIManager.setUserInterfaceVisible(true);
            };
            loadingManager.loadGLTF(worldScenePath, (gltf) =>
                {
                    this.loadScene(loadingManager, gltf);
                }
            );
        }
        else
        {
            UIManager.setUserInterfaceVisible(true);
            UIManager.setLoadingScreenVisible(false);
        }

        this.render(this);
    }

    public toggle_pause() {
        this.paused = !this.paused;
    }

    // Update
    // Handles all logic updates.
    public update(timeStep: number, unscaledTimeStep: number): void
    {
        this.updatePhysics(timeStep);

        // Update registred objects
        this.updatables.forEach((entity) => {
            entity.update(timeStep, unscaledTimeStep);
        });

        // Lerp time scale
        this.params.Time_Scale = THREE.MathUtils.lerp(this.params.Time_Scale, this.timeScaleTarget, 0.2);

        // Physics debug
        if (this.params.Debug_Physics) this.cannonDebugRenderer.update();
    }

    public updatePhysics(timeStep: number): void
    {
        // ADD PRE-STEPS for all characters and vehicles
        this.characters.forEach((char) => {
            if (typeof char.physicsPreStep == "function")
            {
                char.physicsPreStep(char.characterCapsule.body, char)
            }
        })

        this.vehicles.forEach((vehicle) => {
            if (vehicle instanceof Car)
            {
                vehicle.physicsPreStep(vehicle.collision, vehicle)
            } else if (vehicle instanceof Helicopter)
            {
                vehicle.physicsPreStep(vehicle.collision, vehicle)
            } else if (vehicle instanceof Airplane)
            {
                vehicle.physicsPreStep(vehicle.collision, vehicle)
            }
        })
        
        // Step the physics world
        this.physicsWorld.step(this.physicsFrameTime, timeStep);

        this.characters.forEach((char) => {
            if (typeof char.physicsPostStep == "function")
            {
                char.physicsPostStep(char.characterCapsule.body, char)
            }

            if (this.isOutOfBounds(char.characterCapsule.body.position))
            {
                this.outOfBoundsRespawn(char.characterCapsule.body);
            }
        });

        this.vehicles.forEach((vehicle) => {

            if (this.isOutOfBounds(vehicle.rayCastVehicle.chassisBody.position))
            {
                let worldPos = new THREE.Vector3();
                vehicle.spawnPoint.getWorldPosition(worldPos);
                //worldPos.setComponent(1, worldPos.getComponent(1) + 1);
                let worldPos_CANNON = new CANNON.Vec3(worldPos.x, worldPos.y+1, worldPos.z)
                //worldPos.y += 1;
                this.outOfBoundsRespawn(vehicle.rayCastVehicle.chassisBody, worldPos_CANNON);
            }
        });
    }

    public isOutOfBounds(position: CANNON.Vec3): boolean
    {
        let inside = position.x > -211.882 && position.x < 211.882 &&
                    position.z > -169.098 && position.z < 153.232 &&
                    position.y > 0.107;
        let belowSeaLevel = position.y < 14.989;

        return !inside && belowSeaLevel;
    }

    public outOfBoundsRespawn(body: CANNON.Body, position?: CANNON.Vec3): void
    {
        let newPos = position || new CANNON.Vec3(0, 16, 0);
        let newQuat = new CANNON.Quaternion(0, 0, 0, 1);

        body.position.copy(newPos);
        body.interpolatedPosition.copy(newPos);
        body.quaternion.copy(newQuat);
        body.interpolatedQuaternion.copy(newQuat);
        body.velocity.setZero();
        body.angularVelocity.setZero();
    }

    /**
     * Rendering loop.
     * Implements fps limiter and frame-skipping
     * Calls world's "update" function before rendering.
     * @param {World} world 
     */
    public render(world: World): void
    {
        this.requestDelta = this.clock.getDelta();

        requestAnimationFrame(() =>
        {
            world.render(world);
        });

        if (this.paused) {
            return;
        }

        // Getting timeStep
        let unscaledTimeStep = (this.requestDelta + this.renderDelta + this.logicDelta) ;
        let timeStep = unscaledTimeStep * this.params.Time_Scale;
        timeStep = Math.min(timeStep, 1 / 30);    // min 30 fps

        // Logic
        world.update(timeStep, unscaledTimeStep);

        // Measuring logic time
        this.logicDelta = this.clock.getDelta();

        // Frame limiting
        let interval = 1 / 60;
        this.sinceLastFrame += this.requestDelta + this.renderDelta + this.logicDelta;
        this.sinceLastFrame %= interval;

        // Stats end
        this.stats.end();
        this.stats.begin();

        // Actual rendering with a FXAA ON/OFF switch
        // if (this.params.FXAA) this.composer.render();
        // else 
        this.renderer.render(this.scene, this.camera);

        // Measuring render time
        this.renderDelta = this.clock.getDelta();
    }

    public setTimeScale(value: number): void
    {
        this.params.Time_Scale = value;
        this.timeScaleTarget = value;
    }

    public add(worldEntity: IWorldEntity): void
    {
        worldEntity.addToWorld(this);
        this.registerUpdatable(worldEntity);
    }

    public registerUpdatable(registree: IUpdatable): void
    {
        this.updatables.push(registree);
        this.updatables.sort((a, b) => (a.updateOrder > b.updateOrder) ? 1 : -1);
    }

    public remove(worldEntity: IWorldEntity): void
    {
        worldEntity.removeFromWorld(this);
        this.unregisterUpdatable(worldEntity);
    }

    public unregisterUpdatable(registree: IUpdatable): void
    {
        this.updatables.splice(this.updatables.indexOf(registree), 1);
    }

    public loadScene(loadingManager: LoadingManager, gltf: any): void
    {
        gltf.scene.traverse((child) => {
            if (child.hasOwnProperty('userData'))
            {
                if (child.type === 'Mesh')
                {
                    child.geometry = child.geometry.toNonIndexed();
                    Utils.setupMeshProperties(child);
                    // this.sky.csm.setupMaterial(child.material);

                    if (child.material.name === 'ocean')
                    {
                        this.registerUpdatable(new Ocean(child, this));
                    }
                }

                if (child.userData.hasOwnProperty('data'))
                {
                    if (child.userData.data === 'physics')
                    {
                        if (child.userData.hasOwnProperty('type')) 
                        {
                            //child.geometry = child.geometry.toNonIndexed();

                            // Convex doesn't work! Stick to boxes!
                            if (child.userData.type === 'box')
                            {
                                let phys = new BoxCollider({size: new THREE.Vector3(child.scale.x, child.scale.y, child.scale.z)});
                                phys.body.position.copy(new CANNON.Vec3(child.position.x, child.position.y, child.position.z));
                                phys.body.quaternion.copy(new CANNON.Quaternion(child.quaternion.x, child.quaternion.y, child.quaternion.z, child.quaternion.w));
                                phys.body.updateAABB();

                                phys.body.shapes.forEach((shape) => {
                                    shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
                                });

                                //console.log("Box: ");
                                //console.log(phys.body);

                                this.physicsWorld.addBody(phys.body);
                            }
                            else if (child.userData.type === 'trimesh')
                            {
                                let phys = new TrimeshCollider(child, {});

                                //console.log("TriMesh: ");
                                //console.log(phys.body);

                                this.physicsWorld.addBody(phys.body);
                            }

                            child.visible = false;
                        }
                    }

                    if (child.userData.data === 'path')
                    {
                        this.paths.push(new Path(child));
                    }

                    if (child.userData.data === 'scenario')
                    {
                        this.scenarios.push(new Scenario(child, this));
                    }
                }
            }
        });

        this.scene.add(gltf.scene);

        // Launch default scenario
        let defaultScenarioID: string;
        for (const scenario of this.scenarios) {
            if (scenario.default) {
                defaultScenarioID = scenario.id;
                break;
            }
        }
        if (defaultScenarioID !== undefined) this.launchScenario(defaultScenarioID, loadingManager);
    }
    
    public launchScenario(scenarioID: string, loadingManager?: LoadingManager): void
    {
        this.lastScenarioID = scenarioID;

        this.clearEntities();

        // Launch default scenario
        if (!loadingManager) loadingManager = new LoadingManager(this);
        for (const scenario of this.scenarios) {
            if (scenario.id === scenarioID || scenario.spawnAlways) {
                scenario.launch(loadingManager, this);
            }
        }
    }

    public restartScenario(): void
    {
        if (this.lastScenarioID !== undefined)
        {
            document.exitPointerLock();
            this.launchScenario(this.lastScenarioID);
        }
        else
        {
            console.warn('Can\'t restart scenario. Last scenarioID is undefined.');
        }
    }

    public clearEntities(): void
    {
        for (let i = 0; i < this.characters.length; i++) {
            this.remove(this.characters[i]);
            i--;
        }

        for (let i = 0; i < this.vehicles.length; i++) {
            this.remove(this.vehicles[i]);
            i--;
        }
    }

    public scrollTheTimeScale(scrollAmount: number): void
    {
        // Changing time scale with scroll wheel
        const timeScaleBottomLimit = 0.003;
        const timeScaleChangeSpeed = 1.3;
    
        if (scrollAmount > 0)
        {
            this.timeScaleTarget /= timeScaleChangeSpeed;
            if (this.timeScaleTarget < timeScaleBottomLimit) this.timeScaleTarget = 0;
        }
        else
        {
            this.timeScaleTarget *= timeScaleChangeSpeed;
            if (this.timeScaleTarget < timeScaleBottomLimit) this.timeScaleTarget = timeScaleBottomLimit;
            this.timeScaleTarget = Math.min(this.timeScaleTarget, 1);
        }
    }

    public updateControls(controls: any): void
    {
        this.prevControls = controls;
        let html = '<h2 class="controls-title">Controls:</h2>';

        controls.forEach((row) =>
        {
            html += '<div class="ctrl-row">';
            row.keys.forEach((key) => {
                if (key === '+' || key === 'and' || key === 'or' || key === '&') html += '&nbsp;' + key + '&nbsp;';
                else html += '<span class="ctrl-key">' + key + '</span>';
            });

            html += '<span class="ctrl-desc">' + row.desc + '</span></div>';
        });

        document.getElementById('controls').innerHTML = html;
    }

    private createParamsGUI(scope: World): void
    {
        this.params = {
            Pointer_Lock: true,
            Mouse_Sensitivity: 0.3,
            Time_Scale: 1,
            Shadows: false,
            FXAA: true,
            Debug_Physics: false,
            Debug_FPS: true,
            Sun_Elevation: 50,
            Sun_Rotation: 145,
        };

        const gui = new GUI.GUI();

        // Scenario
        this.scenarioGUIFolder = gui.addFolder('Scenarios');
        this.scenarioGUIFolder.open();

        // World
        let worldFolder = gui.addFolder('World');
        worldFolder.add(this.params, 'Time_Scale', 0, 1).listen()
            .onChange((value) =>
            {
                scope.timeScaleTarget = value;
            });
        worldFolder.add(this.params, 'Sun_Elevation', 0, 180).listen()
            .onChange((value) =>
            {
                scope.sky.phi = value;
            });
        worldFolder.add(this.params, 'Sun_Rotation', 0, 360).listen()
            .onChange((value) =>
            {
                scope.sky.theta = value;
            });

        // Input
        let settingsFolder = gui.addFolder('Settings');
        settingsFolder.add(this.params, 'FXAA');
        settingsFolder.add(this.params, 'Shadows')
            .onChange((enabled) =>
            {
                if (enabled)
                {
                    this.sky.csm.lights.forEach((light) => {
                        light.castShadow = true;
                    });
                }
                else
                {
                    this.sky.csm.lights.forEach((light) => {
                        light.castShadow = false;
                    });
                }
            });
        settingsFolder.add(this.params, 'Pointer_Lock')
            .onChange((enabled) =>
            {
                scope.inputManager.setPointerLock(enabled);
            });
        settingsFolder.add(this.params, 'Mouse_Sensitivity', 0, 1)
            .onChange((value) =>
            {
                scope.cameraOperator.setSensitivity(value, value * 0.8);
            });
        settingsFolder.add(this.params, 'Debug_Physics')
            .onChange((enabled) =>
            {
                if (enabled)
                {
                    this.cannonDebugRenderer = new CannonDebugRenderer( this.scene, this.physicsWorld );
                }
                else
                {
                    this.cannonDebugRenderer.clearMeshes();
                    this.cannonDebugRenderer = undefined;
                }

                scope.characters.forEach((char) =>
                {
                    char.raycastBox.visible = enabled;
                });
            });
        settingsFolder.add(this.params, 'Debug_FPS')
            .onChange((enabled) =>
            {
                UIManager.setFPSVisible(enabled);
            });
        if (this.params.Debug_FPS) {
            UIManager.setFPSVisible(true);
        }

        gui.open();
    }
}
