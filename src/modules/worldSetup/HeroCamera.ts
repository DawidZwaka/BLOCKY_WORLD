import { Scene, UniversalCamera, Vector3, Animation, CircleEase, EasingFunction } from '@babylonjs/core';
import CAMERAS from './ENUMS/cameras';
import KEYMAP from './ENUMS/keymap';

interface HeroCameraProps {
    scene: Scene,
    fov?: number,
    speed?: number,
    angularSensibilityX?: number,
    angularSensibilityY?: number,
    applyGravity?: boolean,
    checkCollisions?: boolean,
}

const defaultProps: Partial<HeroCameraProps> = {
    fov: 140,
    speed: .2,
    angularSensibilityX: 10,
    angularSensibilityY: 10,
    applyGravity: true,
    checkCollisions: true,
}

class HeroCamera {
    private instance: HeroCamera | undefined = undefined;
    private props: HeroCameraProps;
    private camera: UniversalCamera;

    constructor(props: HeroCameraProps) {
        this.props = { ...defaultProps, ...props };

        this.camera = new UniversalCamera(
            CAMERAS.HeroCamera,
            new Vector3(0, 17, 5),
            props.scene
        );

        this.init();

        this.getInstance();
    }

    public getInstance(): HeroCamera {
        if (this.instance) {
            return this.instance;
        }

        return this.instance = this;
    }

    private getJumpAnim(): Animation {
        const anim = new Animation(
            "camera_jump",
            "position.y",
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE),
            animKeys = [],
            easingFunction = new CircleEase();

        animKeys.push({ frame: 0, value: this.camera.position.y });
        animKeys.push({ frame: 60, value: this.camera.position.y + 2 });

        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

        anim.setKeys(animKeys);
        anim.setEasingFunction(easingFunction);

        return anim;
    }

    private setCameraControls() {
        const { camera } = this;

        //setting controls to WASD
        camera.keysUp.push(KEYMAP.W);
        camera.keysDown.push(KEYMAP.S);
        camera.keysRight.push(KEYMAP.D);
        camera.keysLeft.push(KEYMAP.A);

        const speedMultiplier = .17;

        const basicSpeed = this.camera.speed;
        const maxSpeed = basicSpeed + speedMultiplier;

        window.addEventListener('keydown', (ev) => {
            const { code } = ev;
            switch (code) {
                case 'Space': {
                    this.props.scene.beginDirectAnimation(this.camera, [this.getJumpAnim()], 0, 60, false, 3);
                    break;
                }
                case 'ShiftLeft': {
                    if (maxSpeed !== this.camera.speed)
                        this.camera.speed = this.camera.speed += speedMultiplier;
                    break;
                }
            }
        });

        window.addEventListener('keyup', (ev) => {
            const { code } = ev;

            switch (code) {
                case 'ShiftLeft': {
                    if (basicSpeed !== this.camera.speed)
                        this.camera.speed = this.camera.speed -= speedMultiplier;
                    break;
                }
            }
        });
    }

    private applySettingsToCamera(): void {
        const { camera } = this;

        camera.fov = 140;
        camera.speed = .2;
        camera.angularSensibility = 4000;
        camera.applyGravity = true;
        camera.checkCollisions = true;
    }

    private init(): void {
        const { props: { scene }, camera } = this;
        const engine = scene.getEngine();
        const canvas = engine.getRenderingCanvas();

        camera.ellipsoid = new Vector3(0.6, 1.1, 0.6);
        camera.attachControl(canvas, true);
        camera.cameraDirection.add(new Vector3(0, 1, 0));

        this.applySettingsToCamera();
        this.setCameraControls();
    }
}

export default HeroCamera;