import { render } from '@testing-library/react-native';

import { Size } from './Size';

describe('<HomeScreen />', () => {
  test('Text renders correctly on HomeScreen', () => {
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
  byte
</Text>
`)
  });
});
