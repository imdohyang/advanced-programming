import { AiPlannerService } from './ai-planner.service';
export declare class AiPlannerController {
    private readonly aiPlannerService;
    constructor(aiPlannerService: AiPlannerService);
    generatePlan(body: {
        userId: string;
        databaseId?: string;
    }): Promise<any[]>;
    getStudyPlans(userId: string): Promise<any[]>;
}
