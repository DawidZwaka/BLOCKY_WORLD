import { Mesh, Vector3, ShadowGenerator, StandardMaterial, Texture } from '@babylonjs/core';
import Directions from '../../../util/directions/directionsEnum';
import World, { } from '../../../worldSetup/World';
import Coords from '../../../util/coords/coordsInterface';

interface wallProps {
	side: Directions,
	coords: Coords
};

class Wall {
	private props: wallProps;

	constructor(props: wallProps) {
		this.props = props;
	}

	private setPlanePosition(plane: Mesh, side: Directions, coords: Coords) {
		const { x, y, z } = coords;

		switch (side) {
			case Directions.TOP: {
				plane.position = new Vector3(x, y + 0.5, z);
				plane.rotation.x = Math.PI / 2;
				break;
			}
			case Directions.BOTTOM: {
				plane.position = new Vector3(x, y - 0.5, z);
				plane.rotation.x = -Math.PI / 2;
				break;
			}
			case Directions.RIGHT: {
				plane.position = new Vector3(x + 0.5, y, z);
				plane.rotation.y = -Math.PI / 2;
				break;
			}
			case Directions.LEFT: {
				plane.position = new Vector3(x - 0.5, y, z);
				plane.rotation.y = Math.PI / 2;
				break;
			}
			case Directions.FRONT: {
				plane.position = new Vector3(x, y, z - 0.5);
				break;
			}
			case Directions.BACK: {
				plane.position = new Vector3(x, y, z + 0.5);
				plane.rotation.y = Math.PI;
				break;
			}
			default:
				break;
		}
	}

	private createWallTag(side: Directions, coords: Coords): string {
		const { x, y, z } = coords;

		return `${side}x${x}y${y}z${z}`;
	};

	public generateWall(): Mesh {
		const {
			props: {
				side,
				coords,
			},
		} = this;

		const scene = new World().getScene(),
			wallTag = this.createWallTag(side, coords),
			wall: Mesh = Mesh.CreatePlane(wallTag, 1, scene);

		wall.checkCollisions = true;
		wall.receiveShadows = true;

		const lgt: any = scene;
		//console.log(lgt, scene);
		wall.material = new World().getMat()!;


		//var shadowGenerator = new ShadowGenerator(1024, lgt);
		//shadowGenerator.getShadowMap()!.renderList!.push(wall);

		this.setPlanePosition(wall, side, coords);

		//if (this.props.color)
		//newWall.material = material();

		return wall;
	}
}

export default Wall;
