import { ChapterInfoDto } from './chapter-info.dto';
export declare class CreateExamDto {
    subject: string;
    startDate: string;
    endDate: string;
    importance: number;
    chapters: ChapterInfoDto[];
    userId: string;
}
