import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('System-3-Web', () => {
  it('renders application title', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /System 3 Web/i })
    ).toBeInTheDocument();
  });
});
