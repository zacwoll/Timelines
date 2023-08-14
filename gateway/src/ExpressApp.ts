import express, { Express } from "express";


export interface ExpressAppConfig {
    port: string;
    setupRoutes: (app: Express) => void;
}

export class ExpressApp {
    private app: Express;
    private port: string;

    constructor(config: ExpressAppConfig) {
        this.app = express();
        this.app.use(express.json());
        config.setupRoutes(this.app);
        this.port = config.port;
        // this.start(config.port);
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(`Server is now listening at http://localhost:${this.port}`);
        });
    }

}