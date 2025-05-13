export class Mode {
    constructor () {
        this.mode = null;
    }
    
    getMode() {
        return this.mode;
    }

    setMode(mode) {
        this.mode = mode;
    }

    initMode() {
        this.mode = null;
    }
}