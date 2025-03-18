import { render } from '@testing-library/react-native';

import { Size } from './Size';

describe('<Size />', () => {
	test('string bytes', () => {
		expect(render(<Size t={'not a number'} />).toJSON()).toMatchInlineSnapshot(`
<Text
  style={
    [
      {
        "textAlign": "left",
      },
      {
        "color": "rgba(28, 27, 31, 1)",
        "fontFamily": "System",
        "fontWeight": "400",
        "letterSpacing": 0,
      },
      {
        "writingDirection": "ltr",
      },
      {
        "fontWeight": "bold",
      },
    ]
  }
>
  0.01
  KB
</Text>
`)
	})

	test('object bytes', () => {
		expect(render(<Size t={{ value: 'not a number' }} />).toJSON())
			.toMatchInlineSnapshot(`
<Text
  style={
    [
      {
        "textAlign": "left",
      },
      {
        "color": "rgba(28, 27, 31, 1)",
        "fontFamily": "System",
        "fontWeight": "400",
        "letterSpacing": 0,
      },
      {
        "writingDirection": "ltr",
      },
      {
        "fontWeight": "bold",
      },
    ]
  }
>
  0.02
  KB
</Text>
`)
	})

	test('undefined bytes', () => {
		expect(render(<Size t={undefined} />).toJSON()).toMatchInlineSnapshot(
			`"empty"`
		)
	})

	test('null bytes', () => {
		expect(render(<Size t={null} />).toJSON()).toMatchInlineSnapshot(`"empty"`)
	})

	test('10 bytes', () => {
		expect(render(<Size t={10} />).toJSON()).toMatchInlineSnapshot(`
<Text
  style={
    [
      {
        "textAlign": "left",
      },
      {
        "color": "rgba(28, 27, 31, 1)",
        "fontFamily": "System",
        "fontWeight": "400",
        "letterSpacing": 0,
      },
      {
        "writingDirection": "ltr",
      },
      {
        "fontWeight": "bold",
      },
    ]
  }
>
  10.00
  B
</Text>
`)
	})

	test('100 bytes', () => {
		expect(render(<Size t={100} />).toJSON()).toMatchInlineSnapshot(`
<Text
  style={
    [
      {
        "textAlign": "left",
      },
      {
        "color": "rgba(28, 27, 31, 1)",
        "fontFamily": "System",
        "fontWeight": "400",
        "letterSpacing": 0,
      },
      {
        "writingDirection": "ltr",
      },
      {
        "fontWeight": "bold",
      },
    ]
  }
>
  0.10
  KB
</Text>
`)
	})

	test('1024 bytes', () => {
		expect(render(<Size t={1024} />).toJSON()).toMatchInlineSnapshot(`
<Text
  style={
    [
      {
        "textAlign": "left",
      },
      {
        "color": "rgba(28, 27, 31, 1)",
        "fontFamily": "System",
        "fontWeight": "400",
        "letterSpacing": 0,
      },
      {
        "writingDirection": "ltr",
      },
      {
        "fontWeight": "bold",
      },
    ]
  }
>
  1.00
  KB
</Text>
`)
	})

	test('1024 * 1024 * 2 bytes', () => {
		expect(render(<Size t={1024 * 1024 * 2} />).toJSON())
			.toMatchInlineSnapshot(`
<Text
  style={
    [
      {
        "textAlign": "left",
      },
      {
        "color": "rgba(28, 27, 31, 1)",
        "fontFamily": "System",
        "fontWeight": "400",
        "letterSpacing": 0,
      },
      {
        "writingDirection": "ltr",
      },
      {
        "fontWeight": "bold",
      },
    ]
  }
>
  2.00
  MB
</Text>
`)
	})

	test('-10 bytes', () => {
		expect(render(<Size t={-10} />).toJSON()).toMatchInlineSnapshot(`
<Text
  style={
    [
      {
        "textAlign": "left",
      },
      {
        "color": "rgba(28, 27, 31, 1)",
        "fontFamily": "System",
        "fontWeight": "400",
        "letterSpacing": 0,
      },
      {
        "writingDirection": "ltr",
      },
      {
        "fontWeight": "bold",
      },
    ]
  }
>
  -10
  chars
</Text>
`)
	})
})








