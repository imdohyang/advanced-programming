import { CreateExamDto } from './dto/create-exam.dto';
import { ExamService } from './exam.service';
export declare class ExamController {
    private readonly examService;
    constructor(examService: ExamService);
    create(createExamDto: CreateExamDto): Promise<{
        message: string;
        data: {
            chapters: {
                id: number;
                createdAt: Date;
                chapterTitle: string;
                difficulty: string;
                contentVolume: number;
                updatedAt: Date;
                examId: number;
            }[];
        } & {
            userId: number;
            id: number;
            createdAt: Date;
            subject: string;
            startDate: Date;
            endDate: Date;
            importance: number;
            updatedAt: Date;
        };
    }>;
    findByUser(userId: string): Promise<{
        userId: string;
        exams: ({
            chapters: {
                id: number;
                createdAt: Date;
                chapterTitle: string;
                difficulty: string;
                contentVolume: number;
                updatedAt: Date;
                examId: number;
            }[];
        } & {
            userId: number;
            id: number;
            createdAt: Date;
            subject: string;
            startDate: Date;
            endDate: Date;
            importance: number;
            updatedAt: Date;
        })[];
    }>;
    deleteExamBySubject(userId: string, subject: string): Promise<{
        message: string;
    }>;
    deleteAllExams(userId: string): Promise<{
        message: string;
    }>;
}
