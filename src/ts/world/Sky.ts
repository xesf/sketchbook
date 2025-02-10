import { Sky } from 'three/examples/jsm/objects/Sky.js';
import * as THREE from 'three';
import { World } from './World';
import { EntityType } from '../enums/EntityType';
import { IUpdatable } from '../interfaces/IUpdatable';
import { default as CSM } from 'three-csm';
// import { CSM } from 'three/examples/jsm/csm/CSM.js';

export class newSky extends THREE.Object3D implements IUpdatable
{
    public updateOrder: number = 5;

    public sunPosition: THREE.Vector3 = new THREE.Vector3();
    public csm: CSM;

    set theta(value: number) {
        this._theta = value;
        this.refreshSunPosition();
    }

    set phi(value: number) {
        this._phi = value;
        this.refreshSunPosition();
        this.refreshHemiIntensity();
    }

    private _phi: number = 50;
    private _theta: number = 145;

    private hemiLight: THREE.HemisphereLight;
    private maxHemiIntensity: number = 0.9;
    private minHemiIntensity: number = 0.3;
    private directionalLight: THREE.DirectionalLight;

    private sky: Sky;
    private skyMesh: THREE.Mesh;
    private skyMaterial: THREE.ShaderMaterial;

    private world: World;

    constructor(world: World)
    {
        super();

        this.world = world;

        // Create sky for material
        const sky = new Sky();
        sky.scale.setScalar( 450000 );
        //sky.material.uniforms['turbidity'].value = 10;
        //sky.material.uniforms['rayleigh'].value = 5;
        //sky.material.uniforms['mieCoefficient'].value = 0.08;
        //sky.material.uniforms['mieDirectionalG'].value = 0.8;
        sky.visible = true;
        
        // Sky material
        this.skyMaterial = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(sky.material.uniforms),
            fragmentShader: sky.material.fragmentShader,
            vertexShader: sky.material.vertexShader,
            side: THREE.BackSide
        });

        // Mesh
        this.skyMesh = new THREE.Mesh(
            new THREE.SphereGeometry(1000, 24, 12),
            this.skyMaterial
        );
        this.attach(this.skyMesh);

        // Ambient light
        this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.0 );
        this.refreshHemiIntensity();
        this.hemiLight.color.setHSL( 0.59, 0.4, 0.6 );
        this.hemiLight.groundColor.setHSL( 0.095, 0.2, 0.75 );
        this.hemiLight.position.set( 0, 50, 0 );
        this.world.scene.add( this.hemiLight );

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
        this.directionalLight.color.setHSL( 0.59, 0.4, 0.6 );
        this.directionalLight.position.set(0, 50, 0);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -100;
        this.directionalLight.shadow.camera.right = 100;
        this.directionalLight.shadow.camera.top = 100;
        this.world.scene.add(this.directionalLight);


        // CSM
        // New version
        // let splitsCallback = (amount, near, far, target) =>
        // {
        // 	for (let i = amount - 1; i >= 0; i--)
        // 	{
        // 		target.push(Math.pow(1 / 3, i));
        // 	}
        // };

        // Legacy
        let splitsCallback = (amount, near, far) =>
        {
            let arr = [];

            for (let i = amount - 1; i >= 0; i--)
            {
                arr.push(Math.pow(1 / 4, i));
            }

            return arr;
        };

        // this.csm = new CSM({
        //     maxFar: world.camera.far,
        //     lightIntensity: 1.5,
        //     cascades: 4,
        //     shadowMapSize: 512,
        //     lightDirection: new THREE.Vector3(-this.sunPosition.x, -this.sunPosition.y, -this.sunPosition.z).normalize(),
        //     camera: world.camera,
        //     parent: world.scene,
        //     mode: 'custom',
        //     customSplitsCallback: splitsCallback
        // });
        // this.csm.fade = false;
        // this.csm.lights.forEach((light) => {
        //     light.castShadow = false;
        // });

        this.refreshSunPosition();
        
        world.scene.add(this);
        world.registerUpdatable(this);
    }

    public update(timeScale: number): void
    {
        this.position.copy(this.world.camera.position);
        this.refreshSunPosition();

        // this.csm.update(); // Removed argument
    }
    
    public refreshSunPosition(): void
    {
        const sunDistance = 10;
        
        this.sunPosition.x = sunDistance * Math.sin(this._theta * Math.PI / 180) * Math.cos(this._phi * Math.PI / 180);
        this.sunPosition.y = sunDistance * Math.sin(this._phi * Math.PI / 180);
        this.sunPosition.z = sunDistance * Math.cos(this._theta * Math.PI / 180) * Math.cos(this._phi * Math.PI / 180);
        
        this.skyMaterial.uniforms.sunPosition.value.copy(this.sunPosition);
        //this.skyMaterial.uniforms.cameraPos.value.copy(this.world.camera.position);
        // Line above throws error. Also does not appear to be called again.
        
        // this.csm.lightDirection = new THREE.Vector3(-this.sunPosition.x, -this.sunPosition.y, -this.sunPosition.z).normalize();
        // this.csm.lightDirection.x = -this.sunPosition.x;
        // this.csm.lightDirection.y = -this.sunPosition.y;
        // this.csm.lightDirection.z = -this.sunPosition.z;
    }

    public refreshHemiIntensity(): void
    {
        this.hemiLight.intensity = this.minHemiIntensity + Math.pow(1 - (Math.abs(this._phi - 90) / 90), 0.25) * (this.maxHemiIntensity - this.minHemiIntensity);
    }
}
