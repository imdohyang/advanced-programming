import { PrismaService } from '../../prisma/prisma.service';
import { LlmClientService } from './server/llm-client.service';
export declare class AiPlannerService {
    private readonly prisma;
    private readonly llmClient;
    constructor(prisma: PrismaService, llmClient: LlmClientService);
    generateStudyPlan(userId: string, databaseId?: string): Promise<any[]>;
    private createPromptFromUserData;
}
