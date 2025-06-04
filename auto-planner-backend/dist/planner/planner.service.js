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
exports.PlannerService = void 0;
const common_1 = require("@nestjs/common");
const notion_service_1 = require("../notion/notion.service");
const date_fns_1 = require("date-fns");
let PlannerService = class PlannerService {
    notionService;
    constructor(notionService) {
        this.notionService = notionService;
    }
    async confirmPlan(id, dto) {
        for (const entry of dto.dailyPlan) {
            const [date, content] = entry.split(':').map((v) => v.trim());
            const parsed = (0, date_fns_1.parse)(date, 'M/d', new Date(dto.startDate));
            const formattedDate = (0, date_fns_1.format)(parsed, 'yyyy-MM-dd');
            await this.notionService.addPlanEntry({
                userId: dto.userId,
                subject: dto.subject,
                date: formattedDate,
                content,
                databaseId: dto.databaseId,
            });
        }
        return {
            message: '공부 계획이 Notion에 연동되었습니다.',
            daysAdded: dto.dailyPlan.length,
        };
    }
};
exports.PlannerService = PlannerService;
exports.PlannerService = PlannerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notion_service_1.NotionService])
], PlannerService);
//# sourceMappingURL=planner.service.js.map