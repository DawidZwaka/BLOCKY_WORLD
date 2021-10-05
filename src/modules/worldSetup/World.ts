import { Engine, Scene, AxesViewer, Vector3, PointLight, Texture, StandardMaterial } from '@babylonjs/core';
import '@babylonjs/inspector';
import Chunk from '../worldGenerator/chunk/chunk';
import HeroCamera from './HeroCamera';
import PointerLock from '../Input/PointerLock';

interface WorldProps {
	chunksInLine?: number,
	chunkSize?: number,
	chunkDepth?: number,
	engine: Engine,
	canvas: HTMLElement
}

const defaultProps: Partial<WorldProps> = {
	chunksInLine: 10,
	chunkSize: 16,
	chunkDepth: 128,
}

class World {
	private instance: World | undefined = undefined;
	private props: WorldProps | undefined = undefined;
	private scene: Scene | undefined = undefined;
	private generatedChunks: Chunk[][] = [];
	private mat: StandardMaterial | undefined;

	constructor(props?: WorldProps) {
		if (props) {
			this.props = { ...defaultProps, ...props };
			this.scene = new Scene(props.engine!);

			this.mat = new StandardMaterial("grass", this.scene!);
			this.mat.diffuseTexture = new Texture("./grass.png", this.scene!);

			this.init();
		}

		return this.getInstance();
	}

	private setupScene(): void {
		const { scene, props } = this;

		scene!.gravity = new Vector3(0, -.15, 0);
		scene!.collisionsEnabled = true;
		scene!.enablePhysics(scene!.gravity);

		//init pointer lock and connect to the scene
		const Pointer: PointerLock = new PointerLock(props!.canvas!);

		scene!.onPointerDown = Pointer.pointerDownHandler;
	}


	private getInstance(): World {
		if (this.instance) {
			return this.instance;
		}

		return this.instance = this;
	}

	public getScene(): Scene { return this.scene! };

	public generateVisibileWorld(): void {
		const { chunkDepth, chunkSize, chunksInLine } = this.props!;

		//generate all visible chunks
		for (let x: number = 0; x < chunksInLine!; x++) {
			this.generatedChunks.push([]);

			for (let z: number = 0; z < chunksInLine!; z++) {
				//let prevChunks: { z: null | Chunk, x: null | Chunk } = { z: null, x: null };

				/*if (x !== 0 && z !== 0) {
					if (z > 0)
						prevChunks.z = this.generatedChunks[x][z - 1];
					if (x > 0)
						prevChunks.x = this.generatedChunks[x - 1][z];
				}*/

				const chunk: Chunk = new Chunk({
					chunkSize, chunkDepth,
					xOffset: chunkSize! * x,
					zOffset: chunkSize! * z
				});

				chunk.generate();

				this.generatedChunks[x].push(chunk);
			}
		}

		//correct edges between chunks
		for (let x: number = 0; x < chunksInLine!; x++)
			for (let z: number = 0; z < chunksInLine!; z++) {
				const assocChunks = {
					prevX: (x - 1 >= 0) ? this.generatedChunks[x - 1][z] : null,
					nextX: (x + 1 < chunksInLine!) ? this.generatedChunks[x + 1][z] : null,
					prevZ: (z - 1 >= 0) ? this.generatedChunks[x][z - 1] : null,
					nextZ: (z + 1 < chunksInLine!) ? this.generatedChunks[x][z + 1] : null,
				};

				this.generatedChunks[x][z].regenerateEdges(assocChunks);
			}


		//attach all this chunks to scene
		for (let x: number = 0; x < chunksInLine!; x++)
			for (let z: number = 0; z < chunksInLine!; z++) {
				const initialzedChunk = this.generatedChunks[x][z];

				initialzedChunk.attachToWorld();
			}
	}

	public enableDebugging(): void {
		this.scene!.debugLayer.show({ embedMode: true });
		const axes = new AxesViewer(this.scene!);
		axes.update(new Vector3(16 * 0, 12, 16 * 2), new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1));
	}

	private init(): void {
		this.setupScene();

		// Add a hero camera to the scene and attach it to the canvas
		//const camera = new BABYLON.ArcRotateCamera('freeflycamera', Math.PI / 2, Math.PI / 2, 2, BABYLON.Vector3(0, 20, 0), this.scene);
		//camera.attachControl(this.canvas, true);
		const camera = new HeroCamera({ scene: this.scene! });

		// Add sun light to the scene
		/*const sunlight = new HemisphericLight(
			'sunlight',
			new Vector3(1, 1, 0),
			this.scene!
		);*/
		const sunlight2 = new PointLight(
			'sunlight2',
			new Vector3(0, 40, 0),
			this.scene!
		);


		this.generateVisibileWorld();

		this.enableDebugging();
	};

	getMat() {
		return this.mat;
	}
}


export default World;
