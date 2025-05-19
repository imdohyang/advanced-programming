import { CreateExamDto } from './dto/create-exam.dto';
import { ExamService } from './exam.service';
export declare class ExamController {
    private readonly examService;
    constructor(examService: ExamService);
    create(createExamDto: CreateExamDto): Promise<{
        message: string;
        data: any;
    }>;
    findByUser(userId: string): Promise<{
        userId: string;
        exams: any;
    }>;
}
