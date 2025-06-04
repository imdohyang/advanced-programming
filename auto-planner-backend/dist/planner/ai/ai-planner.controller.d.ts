import { AiPlannerService } from './ai-planner.service';
import { AiGeneratePlanDto } from './generate-plan.dto';
export declare class AiPlannerController {
    private readonly aiPlannerService;
    constructor(aiPlannerService: AiPlannerService);
    generatePlan(generatePlanDto: AiGeneratePlanDto): Promise<any[]>;
    getStudyPlans(userId: string): Promise<any[]>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        llmConnection: boolean;
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        llmConnection: boolean;
        error: any;
    }>;
}
