import { Path } from './Path';
import * as THREE from 'three';
export declare class PathNode {
    object: THREE.Object3D;
    path: Path;
    nextNode: PathNode;
    previousNode: PathNode;
    constructor(child: THREE.Object3D, path: Path);
}
