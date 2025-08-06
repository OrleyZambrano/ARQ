export declare class HealthController {
    getHealth(): {
        status: string;
        message: string;
        timestamp: string;
        environment: string;
    };
    getReady(): {
        status: string;
        checks: {
            database: string;
            memory: string;
        };
    };
}
