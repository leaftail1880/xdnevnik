import { Subject, Total } from "@/services/net-school/entities";

export function removeNonExistentLessons(totals: Total[], subjects: Subject[]) {
  return totals.filter(e => subjects.some(s => s.id === e.subjectId))
}
