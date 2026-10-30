import { fireEvent, render, screen } from '@testing-library/react-native';
import { Segmented } from '@/components/segmented';
import { getPalette } from '@/constants/theme';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

describe('Segmented', () => {
  it('reports a new choice', async () => {
    const onChange = jest.fn();
    await render(<Segmented palette={getPalette('light')} options={options} value="a" onChange={onChange} />);
    await fireEvent.press(screen.getByLabelText('Option B'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  // Magic Square deals a new puzzle on change, so this must not fire on a re-tap.
  it('ignores a tap on the option already selected', async () => {
    const onChange = jest.fn();
    await render(<Segmented palette={getPalette('light')} options={options} value="a" onChange={onChange} />);
    await fireEvent.press(screen.getByLabelText('Option A'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
