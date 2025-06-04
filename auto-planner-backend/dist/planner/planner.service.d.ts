import { ConfirmPlanDto } from './dto/confirm-plan.dto';
import { NotionService } from 'src/notion/notion.service';
export declare class PlannerService {
    private readonly notionService;
    constructor(notionService: NotionService);
    confirmPlan(id: string, dto: ConfirmPlanDto): Promise<{
        message: string;
        daysAdded: number;
    }>;
}
