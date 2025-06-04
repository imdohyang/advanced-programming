import { eachDayOfInterval, format, parseISO } from 'date-fns';

const dayMap: Record<string, number> = {
  '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6,
};

export function getValidStudyDates(
  start: string,
  end: string,
  studyDays: string[],
): string[] {
  try {
    const studyDayNumbers = studyDays.map(day => dayMap[day]).filter(num => num !== undefined);
    
    const allDates = eachDayOfInterval({
      start: parseISO(start),
      end: parseISO(end),
    });

    return allDates
      .filter(date => studyDayNumbers.includes(date.getDay()))
      .map(date => format(date, 'M/d'));
  } catch (error) {
    console.error('날짜 생성 오류:', error);
    return [];
  }
}