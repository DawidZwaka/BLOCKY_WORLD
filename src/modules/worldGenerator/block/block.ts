import Wall from './blockWall/blockWall';
import { Mesh, Vector3, MeshBuilder } from '@babylonjs/core';
import Directions from '../../util/directions/directionsEnum';
import Coords from '../../util/coords/coordsInterface';

interface BlockProps {
	sides: Array<Directions>,
	coords: Coords
};

class Block {
	private props: BlockProps;
	private blockStructure: Map<Directions, Wall | null> = new Map();

	constructor(props: BlockProps) {
		this.props = props;

		/*this.blocksStruct = {
			grass: { TOP: 'grass', SIDES: 'grassSide', BOTTOM: 'ground' },
			ground: 'ground',
			stone: 'stone',
		};*/
		this.init();
	}

	/*getWallType(blockType, side) {
		const { blocksStruct } = this;
		const blockStruct = blocksStruct[blockType];
		let wallType;
		
		if (typeof blockStruct !== Object) wallType = blockStruct;
		else {
			if (blockStruct[side]) wallType = blockStruct[side];
			else wallType = blockStruct.SIDES;
		}
		
		return wallType;
	}*/
	private initBlockStructureVal() {
		Object.keys(Directions).forEach((key: any) => {
			this.blockStructure.set(key, null);
		});
	}

	private init() {
		this.initBlockStructureVal();
	}

	public initializeBlock(): void {
		const {
			props: { sides, coords },
		} = this;

		sides.forEach((side: Directions) => {
			//wallType = this.getWallType(blockType, side);
			const wallInstance = new Wall({ side, coords });

			this.blockStructure.set(side, wallInstance);
		});
	}

	public initializeWall(side: Directions): void {
		const { coords } = this.props;
		console.log(coords);

		const wallInstance = new Wall({ side, coords });
		this.blockStructure.set(side, wallInstance);

		//debug tube
		/*let tube = MeshBuilder.CreateTube(
			`tube${coords.x}${coords.y}${coords.z}_${side}`,
			{
				path: [
					new Vector3(coords.x, coords.y - 5, coords.z),
					new Vector3(coords.x, coords.y + 5, coords.z)],
				updatable: true,
				radius: 0.2
			});*/
	}

	public generateBlock(): Mesh {
		const block: Array<Mesh> = [];

		this.blockStructure.forEach(wall => {
			block.push(wall?.generateWall()!);
		});

		return Mesh.MergeMeshes(block)!;
	}

	public getStructure(): Map<Directions, Wall | null> {
		return this.blockStructure;
	}

	public getSides(): Array<Directions> {
		return this.props.sides;
	}
}

export default Block;
