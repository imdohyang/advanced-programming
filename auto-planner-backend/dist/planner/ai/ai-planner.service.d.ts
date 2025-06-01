import { PrismaService } from '../../prisma/prisma.service';
import { LlmClientService } from './server/llm-client.service';
import { SyncToNotionDto } from '../../notion/dto/sync-to-notion.dto';
export declare class AiPlannerService {
    private readonly prisma;
    private readonly llmClient;
    constructor(prisma: PrismaService, llmClient: LlmClientService);
    generateStudyPlan(userId: string, databaseId?: string): Promise<SyncToNotionDto[]>;
    private createPromptFromUserData;
}
