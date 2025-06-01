import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
export declare class ExamService {
    private prisma;
    constructor(prisma: PrismaService);
    create(exam: CreateExamDto): Promise<{
        message: string;
        data: {
            chapters: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                examId: number;
                chapterTitle: string;
                difficulty: number;
                contentVolume: number;
            }[];
        } & {
            id: number;
            subject: string;
            startDate: Date;
            endDate: Date;
            importance: number;
            userId: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    findByUser(userId: string): Promise<{
        userId: string;
        exams: ({
            chapters: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                examId: number;
                chapterTitle: string;
                difficulty: number;
                contentVolume: number;
            }[];
        } & {
            id: number;
            subject: string;
            startDate: Date;
            endDate: Date;
            importance: number;
            userId: number;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    findLatestByUserId(userId: string): Promise<({
        chapters: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            examId: number;
            chapterTitle: string;
            difficulty: number;
            contentVolume: number;
        }[];
    } & {
        id: number;
        subject: string;
        startDate: Date;
        endDate: Date;
        importance: number;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    deleteExamWithChaptersByUser(userId: string, subject: string): Promise<{
        message: string;
    }>;
    deleteAllExamsByUser(userId: string): Promise<{
        message: string;
    }>;
}
