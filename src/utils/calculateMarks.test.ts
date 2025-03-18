import { Assignment } from '@/services/net-school/entities'
import { calculateMarks } from './calculateMarks'

describe('calculateMarks', () => {
	it('should calculate empty marks', () => {
		expect(
			calculateMarks({
				totals: {
					averageMark: 5,
					classmeetingsStats: { passed: 1, scheduled: 2 },
					results: [],
				},
			}),
		).toMatchInlineSnapshot(`
{
  "avgMark": 5,
  "maxWeight": -Infinity,
  "minWeight": Infinity,
  "toGetTarget": undefined,
  "totalsAndSheduledTotals": [],
}
`)
	})

	it('should calculate marks', () => {
		expect(
			calculateMarks({
				totals: {
					averageMark: 4.5,
					classmeetingsStats: { passed: 1, scheduled: 2 },
					results: [mark(3, 10), mark(4, 10), mark(5, 10)],
				},
			}),
		).toMatchInlineSnapshot(`
{
  "avgMark": 4.5,
  "maxWeight": 10,
  "minWeight": 10,
  "toGetTarget": undefined,
  "totalsAndSheduledTotals": [
    {
      "answerFilesCount": 0,
      "assignmentDate": "1970-01-01",
      "assignmentId": 1,
      "assignmentName": "",
      "assignmentTypeAbbr": "",
      "assignmentTypeId": 0,
      "assignmentTypeName": "",
      "attachmentsExists": false,
      "canAnswer": false,
      "classAssignment": true,
      "classmeetingId": 0,
      "comment": "",
      "date": "1970-01-01",
      "dueDate": "1970-01-01",
      "duty": false,
      "extraActivity": false,
      "hasFileAnswers": false,
      "hasTextAnswer": false,
      "result": 3,
      "resultDate": "1970-01-01",
      "subjectId": 0,
      "subjectName": "",
      "weight": 10,
    },
    {
      "answerFilesCount": 0,
      "assignmentDate": "1970-01-01",
      "assignmentId": 1,
      "assignmentName": "",
      "assignmentTypeAbbr": "",
      "assignmentTypeId": 0,
      "assignmentTypeName": "",
      "attachmentsExists": false,
      "canAnswer": false,
      "classAssignment": true,
      "classmeetingId": 0,
      "comment": "",
      "date": "1970-01-01",
      "dueDate": "1970-01-01",
      "duty": false,
      "extraActivity": false,
      "hasFileAnswers": false,
      "hasTextAnswer": false,
      "result": 4,
      "resultDate": "1970-01-01",
      "subjectId": 0,
      "subjectName": "",
      "weight": 10,
    },
    {
      "answerFilesCount": 0,
      "assignmentDate": "1970-01-01",
      "assignmentId": 1,
      "assignmentName": "",
      "assignmentTypeAbbr": "",
      "assignmentTypeId": 0,
      "assignmentTypeName": "",
      "attachmentsExists": false,
      "canAnswer": false,
      "classAssignment": true,
      "classmeetingId": 0,
      "comment": "",
      "date": "1970-01-01",
      "dueDate": "1970-01-01",
      "duty": false,
      "extraActivity": false,
      "hasFileAnswers": false,
      "hasTextAnswer": false,
      "result": 5,
      "resultDate": "1970-01-01",
      "subjectId": 0,
      "subjectName": "",
      "weight": 10,
    },
  ],
}
`)
	})
})

const date = new Date(0).toNetSchool()

function mark(result: number, weight: number): Assignment & { date: string } {
	return {
		result,
		weight,
		date,
		answerFilesCount: 0,
		assignmentDate: date,
		assignmentId: 1,
		assignmentName: '',
		assignmentTypeAbbr: '',
		assignmentTypeId: 0,
		assignmentTypeName: '',
		attachmentsExists: false,
		canAnswer: false,
		classAssignment: true,
		classmeetingId: 0,
		comment: '',
		dueDate: date,
		duty: false,
		extraActivity: false,
		hasFileAnswers: false,
		hasTextAnswer: false,
		resultDate: date,
		subjectId: 0,
		subjectName: '',
	}
}
