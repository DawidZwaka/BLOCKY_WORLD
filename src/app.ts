import { Engine, Scene } from '@babylonjs/core';
import World from './modules/worldSetup/World';

class Main {
    static canvas: any;
    static engine: Engine;
    static world: World;
    static scene: Scene;

    static resizeWindowHandler(): void {
        Main.engine.resize();
    }

    static renderLoop(): void {
        Main.engine.runRenderLoop(function () {
            Main.scene.render();
        });
    }

    static prepareEnv(): void {
        Main.canvas = document.querySelector('#renderCanvas');
        Main.engine = new Engine(Main.canvas);
        Main.world = new World({ engine: Main.engine, canvas: Main.canvas });
        Main.scene = Main.world.getScene();

    }

    static init(): void {
        document.addEventListener('DOMContentLoaded', () => {
            Main.prepareEnv();

            Main.renderLoop();

            // development render debug line
            setTimeout(() => Main.engine.resize(), 250);
        });

        window.addEventListener('resize', Main.resizeWindowHandler);
    }
}

Main.init();
