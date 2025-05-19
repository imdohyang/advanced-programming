import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
export declare class ExamService {
    private prisma;
    constructor(prisma: PrismaService);
    create(exam: CreateExamDto): Promise<{
        message: string;
        data: any;
    }>;
    findByUser(userId: string): Promise<{
        userId: string;
        exams: any;
    }>;
    findLatestByUserId(userId: string): Promise<any>;
}
