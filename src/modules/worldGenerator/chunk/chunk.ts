import { EffectWrapper, Mesh } from '@babylonjs/core';
import simplexNoise from 'simplex-noise';
import Block from '../block/block';
import Coords from '../../util/coords/coordsInterface';
import Directions from '../../util/directions/directionsEnum';

//TEMPORARY 
const simplex = new simplexNoise('12');

interface ChunkProps {
	chunkSize?: number,
	chunkDepth?: number,
	xOffset?: number,
	zOffset?: number,
	//prevChunks: { z: Chunk | null, x: Chunk | null },
}

interface AssocChunks {
	prevX: null | Chunk,
	nextX: null | Chunk,
	prevZ: null | Chunk,
	nextZ: null | Chunk,
}

const defaultProps: Partial<ChunkProps> = {
	chunkSize: 16,
	chunkDepth: 100,
	xOffset: 0,
	zOffset: 0
};

class Chunk {
	//it is a three dimensional array which is a mathematical representation of actual world chunk
	private chunk: null[][][] | string[][][];
	private chunkStructure: null[][][] | Block[][][];
	private props: ChunkProps;
	private blockSize: number;
	private assocChunks: AssocChunks | null = null;

	constructor(props: ChunkProps) {
		this.chunk = [];
		this.chunkStructure = [];
		this.props = { ...defaultProps, ...props };
		this.blockSize = 1;

		this.initGeneration();
	}

	private initGeneration(): void {
		const {
			props: { chunkSize, chunkDepth },
			chunk,
		} = this;

		let x: number,
			y: number,
			z: number,
			noise;


		//fill in all three dimiensional array with null value
		for (x = 0; x < chunkSize!; x++) {
			this.chunk[x] = [];
			for (y = 0; y < chunkDepth!; y++) {
				this.chunk[x][y] = [];
				for (z = 0; z < chunkSize!; z++) this.chunk[x][y][z] = null;
			}
		}

		//generate outside layer of the chunk with perlin noise and assign it to the three dimiensional array
		for (z = 0; z < chunkSize!; z++) {
			for (x = 0; x < chunkSize!; x++) {
				noise = simplex.noise2D(
					(x + this.props.xOffset!) / 80,
					(z + this.props.zOffset!) / 80
				);
				y = Math.floor((noise + 1) * 2) + 10;

				chunk[x][y][z] = 'grass';
			}
		}
	}

	private isNullBlock(
		coords: Coords,
		chunk: null[][][] | string[][][] = this.chunk): boolean {

		const {
			props: { chunkSize, chunkDepth },
			assocChunks
		} = this;
		const { x, y, z } = coords;

		if (
			x >= 0 &&
			x < chunkSize! &&
			y >= 0 &&
			y < chunkDepth! &&
			z >= 0 &&
			z < chunkSize!
		)
			return chunk[x][y][z] === null;
		else if (
			assocChunks?.prevZ &&
			z === -1 &&
			x >= 0 &&
			x < chunkSize! &&
			y >= 0 &&
			y < chunkDepth!
		)
			return this.isNullBlock({ x, y, z: chunkSize! - 1 }, assocChunks.prevZ.getChunkStructure());
		else if (
			assocChunks?.prevX &&
			x === -1 &&
			z >= 0 &&
			z < chunkSize! &&
			y >= 0 &&
			y < chunkDepth!
		)
			return this.isNullBlock({ x: chunkSize! - 1, y, z }, assocChunks.prevX.getChunkStructure());
		else if (
			assocChunks?.nextX &&
			x === chunkSize &&
			z >= 0 &&
			z < chunkSize! &&
			y >= 0 &&
			y < chunkDepth!
		)
			return this.isNullBlock({ x: 0, y, z }, assocChunks.nextX.getChunkStructure());
		else if (
			assocChunks?.nextZ &&
			z === chunkSize &&
			x >= 0 &&
			x < chunkSize! &&
			y >= 0 &&
			y < chunkDepth!
		)
			return this.isNullBlock({ x, y, z: 0 }, assocChunks.nextZ.getChunkStructure());
		else
			return false;
	}

	private getWallsToGenerate(coords: Coords): Array<Directions> {
		const { x, y, z } = coords;
		const sides = [];

		if (this.isNullBlock({ x, y: y + 1, z })) sides.push(Directions.TOP);
		if (this.isNullBlock({ x, y: y - 1, z })) sides.push(Directions.BOTTOM);
		if (this.isNullBlock({ x: x + 1, y, z })) sides.push(Directions.RIGHT);
		if (this.isNullBlock({ x: x - 1, y, z })) sides.push(Directions.LEFT);
		if (this.isNullBlock({ x, y, z: z + 1 })) sides.push(Directions.BACK);
		if (this.isNullBlock({ x, y, z: z - 1 })) sides.push(Directions.FRONT);

		return sides;
	}

	public generate(): void {
		const {
			props: { chunkSize, chunkDepth },
			blockSize,
			chunk,
		} = this;

		let sides: Array<Directions>,
			coords;


		for (let x = 0; x < chunkSize!; x++) {
			this.chunkStructure[x] = [];
			for (let y = 0; y < chunkDepth!; y++) {
				this.chunkStructure[x][y] = [];
				for (let z = 0; z < chunkSize!; z++) {
					let structVal: Block | null = null;

					if (this.chunk[x][y][z]) {
						const coords: Coords = {
							x: x + this.props.xOffset!,
							y,
							z: z + this.props.zOffset!
						},
							sides: Array<Directions> = this.getWallsToGenerate({ x, y, z }),
							cube: Block = new Block({ sides, coords });

						cube.initializeBlock();

						structVal = cube;
					}

					this.chunkStructure[x][y][z] = structVal;
				};
			}
		}
	}

	public regenerateEdges(assocChunks: AssocChunks) {
		const {
			props: { chunkSize, chunkDepth },
			blockSize,
			chunk,
		} = this;
		this.assocChunks = assocChunks;

		console.log(assocChunks);

		for (let x = 0; x < chunkSize!; x++)
			for (let y = 0; y < chunkDepth!; y++)
				for (let z = 0; z < chunkSize!; z++) {
					if (z === 1 && (x !== 0 && x !== chunkSize! - 1))
						z = chunkSize! - 1;

					const block: Block | null = this.chunkStructure[x][y][z];

					if (!block) continue;

					const sides: Array<Directions> = this.getWallsToGenerate({ x, y, z });
					const prevSides: Array<Directions> = block.getSides();
					const reducedArr: Array<Directions> = [];

					sides.forEach((direction, index) => {
						if (!prevSides.includes(direction))
							reducedArr.push(direction);
					});

					if (reducedArr.length)
						console.log(sides, prevSides, reducedArr, x, y, z);

					reducedArr.forEach(direction => {
						block.initializeWall(direction);
					});
				}

	}

	public attachToWorld(): Mesh {
		const {
			props: { chunkSize, chunkDepth },
			blockSize,
			chunk,
		} = this;
		const blocks: Array<Mesh> = [];

		for (let x = 0; x < chunkSize!; x++)
			for (let y = 0; y < chunkDepth!; y++)
				for (let z = 0; z < chunkSize!; z++) {
					const block: Block | null = this.chunkStructure[x][y][z];

					if (block) {
						const generatedBlock = block?.generateBlock();

						blocks.push(generatedBlock);
					}
				}

		return Mesh.MergeMeshes(blocks)!;
	}

	public getChunkStructure(): null[][][] | string[][][] {
		return this.chunk;
	}
}

export default Chunk;
