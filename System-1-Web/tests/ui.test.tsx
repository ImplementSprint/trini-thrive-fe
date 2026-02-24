import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('System-1-Web', () => {
  it('renders application title', () => {
    render(<App />);
    expect(screen.getByText('System 1 Web')).toBeInTheDocument();
  });
});
