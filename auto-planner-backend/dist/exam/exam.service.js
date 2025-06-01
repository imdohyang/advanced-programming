"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExamService = class ExamService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(exam) {
        const user = await this.prisma.user.findUnique({ where: { userId: exam.userId } });
        if (!user)
            throw new Error(`User with userId '${exam.userId}' not found`);
        if (!exam.chapters || exam.chapters.length === 0) {
            throw new Error(`챕터 정보가 누락되었습니다.`);
        }
        for (const ch of exam.chapters) {
            if (!ch.chapterTitle || ch.contentVolume === undefined || ch.difficulty === undefined) {
                throw new Error(`각 챕터에는 chapterTitle, contentVolume, difficulty가 포함되어야 합니다.`);
            }
        }
        const created = await this.prisma.exam.create({
            data: {
                subject: exam.subject,
                startDate: new Date(exam.startDate),
                endDate: new Date(exam.endDate),
                importance: exam.importance,
                userId: user.id,
                chapters: {},
            },
            include: { chapters: true },
        });
        return {
            message: '시험 정보 등록 완료',
            data: created,
        };
    }
    async findByUser(userId) {
        const user = await this.prisma.user.findUnique({ where: { userId } });
        if (!user)
            return { userId, exams: [] };
        const exams = await this.prisma.exam.findMany({
            where: { userId: user.id },
            include: { chapters: true },
        });
        return { userId, exams };
    }
    async findLatestByUserId(userId) {
        const user = await this.prisma.user.findUnique({ where: { userId } });
        if (!user)
            return null;
        return await this.prisma.exam.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            include: { chapters: true },
        });
    }
    async deleteExamWithChaptersByUser(userId, subject) {
        const user = await this.prisma.user.findUnique({ where: { userId } });
        if (!user)
            throw new Error('사용자를 찾을 수 없습니다.');
        const exam = await this.prisma.exam.findFirst({
            where: { userId: user.id, subject },
        });
        if (!exam) {
            return { message: '해당 과목의 시험 정보가 없습니다.' };
        }
        await this.prisma.$transaction([
            this.prisma.chapter.deleteMany({ where: { examId: exam.id } }),
            this.prisma.exam.delete({ where: { id: exam.id } })
        ]);
        return {
            message: `과목 "${subject}"에 대한 시험과 챕터가 삭제되었습니다.`,
        };
    }
    async deleteAllExamsByUser(userId) {
        const user = await this.prisma.user.findUnique({ where: { userId } });
        if (!user)
            throw new Error('사용자를 찾을 수 없습니다.');
        const exams = await this.prisma.exam.findMany({
            where: { userId: user.id },
            select: { id: true },
        });
        const examIds = exams.map((e) => e.id);
        if (examIds.length === 0) {
            return { message: '삭제할 시험이 없습니다.' };
        }
        await this.prisma.$transaction([
            this.prisma.chapter.deleteMany({ where: { examId: { in: examIds } } }),
            this.prisma.exam.deleteMany({ where: { id: { in: examIds } } }),
        ]);
        return {
            message: `${examIds.length}개의 시험과 모든 챕터가 삭제되었습니다.`,
        };
    }
};
exports.ExamService = ExamService;
exports.ExamService = ExamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExamService);
//# sourceMappingURL=exam.service.js.map