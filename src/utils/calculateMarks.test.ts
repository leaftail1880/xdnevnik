import { Assignment } from '@/services/net-school/entities'
import { calculateAvg, calculateMarks, CalculateTotals } from './calculateMarks'

describe('calculateMarks', () => {
	it('should calculate empty marks', () => {
		expect(
			calculateMarks({
				totals: {
					averageMark: 5,
					classmeetingsStats: { passed: 1, scheduled: 2 },
					results: [],
				},
				markRoundAdd: -0.1,
			}),
		).toMatchInlineSnapshot(`
		{
		  "avgMark": 5,
		  "maxWeight": -Infinity,
		  "minWeight": Infinity,
		  "toGetMarks": [],
		  "totalsAndSheduledTotals": [],
		}
	`)
	})

	it('should calculate 1 mark', () => {
		expect(
			calculateMarks({
				totals: {
					averageMark: 5,
					classmeetingsStats: { passed: 1, scheduled: 2 },
					results: [mark(5, 10)],
				},
				targetMark: 5,
				defaultMark: 5,
				defaultMarkWeight: 10,
				markRoundAdd: -0.1,
			}),
		).toMatchInlineSnapshot(`
		{
		  "avgMark": 5,
		  "maxWeight": 10,
		  "minWeight": 10,
		  "toGetMarks": [],
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

	it('should calculate marks', () => {
		const totals: CalculateTotals = {
			averageMark: 0,
			classmeetingsStats: { passed: 1, scheduled: 15 },
			results: [mark(4, 10), mark(5, 10), mark(2, 15)],
		}

		totals.averageMark = calculateAvg([], totals)

		expect(
			calculateMarks({
				totals: totals,
				targetMark: 5,
				defaultMark: 5,
				defaultMarkWeight: 10,
				markRoundAdd: -0.1,
			}),
		).toMatchInlineSnapshot(`
		{
		  "avgMark": 3.43,
		  "maxWeight": 15,
		  "minWeight": 10,
		  "toGetMarks": [
		    {
		      "amount": 11,
		      "highest": true,
		      "target": 5,
		    },
		    {
		      "amount": 1,
		      "highest": false,
		      "target": 4,
		    },
		  ],
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
		      "result": 2,
		      "resultDate": "1970-01-01",
		      "subjectId": 0,
		      "subjectName": "",
		      "weight": 15,
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
