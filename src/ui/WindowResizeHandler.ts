export class WindowResizeHandler {
    private width: number = window.innerWidth;
    private height: number = window.innerHeight;

    constructor(private onSizeChange: () => void) {
        this.initialize();
    }

    private initialize(): void {
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    private handleResize(): void {
        if (window.innerWidth !== this.width || window.innerHeight !== this.height) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.onSizeChange();
        }
    }
}