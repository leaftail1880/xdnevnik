import { calculateMarks } from './calculateMarks';

describe('t', () => {
  it('should calc', () => {
    expect(calculateMarks({ totals: { 'averageMark': 5, 'classmeetingsStats': {passed: 1, 'scheduled': 2}, 'results': [] } })).toMatchInlineSnapshot(`
{
  "avgMark": 5,
  "maxWeight": -Infinity,
  "minWeight": Infinity,
  "toGetTarget": undefined,
  "totalsAndSheduledTotals": [],
}
`)
  })
})