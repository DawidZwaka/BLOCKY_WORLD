
class PointerLock {
    private canvas: any;
    private isLocked: boolean = false;

    constructor(canvas: HTMLElement) {
        this.canvas = canvas;

        this.init();
    }

    private pointerLockChangeHandler(): void {
        const doc: any = document;

        const controlEnabled =
            doc.mozPointerLockElement ||
            doc.webkitPointerLockElement ||
            doc.msPointerLockElement ||
            doc.pointerLockElement || null;

        // If the user is already locked
        if (!controlEnabled) {
            //camera.detachControl(canvas);
            this.isLocked = false;
        } else {
            //camera.attachControl(canvas);
            this.isLocked = true;
        }
    }

    private init(): void {
        const { pointerLockChangeHandler } = this;

        document.addEventListener("pointerlockchange", pointerLockChangeHandler, false);
        document.addEventListener("mspointerlockchange", pointerLockChangeHandler, false);
        document.addEventListener("mozpointerlockchange", pointerLockChangeHandler, false);
        document.addEventListener("webkitpointerlockchange", pointerLockChangeHandler, false);
    }

    public pointerDownHandler = (evt: PointerEvent): void => {
        const { canvas } = this;

        //true/false check if we're locked, faster than checking pointerlock on each single click.
        if (!this.isLocked) {
            canvas.requestPointerLock =
                canvas.requestPointerLock ||
                canvas.msRequestPointerLock ||
                canvas.mozRequestPointerLock ||
                canvas.webkitRequestPointerLock;

            if (canvas.requestPointerLock)
                canvas.requestPointerLock();

        }

        //continue with shooting requests or whatever :P
        //if (evt === 0) { console.log('left click'); }; //(left mouse click)
        //evt === 1 (mouse wheel click (not scrolling))
        //evt === 2 (right mouse click)
    };
}

export default PointerLock;