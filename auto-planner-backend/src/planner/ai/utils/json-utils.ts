export function extractJsonBlock(text: string): string {
  const match = text.match(/\[\s*{[\s\S]*?}\s*\]/);  // ✅ 첫 번째 전체 JSON 배열만 추출
  return match ? match[0] : '[]';
}
