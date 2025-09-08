import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App
      tableId={101010}
      width={500}
      height={300}
      backgroundColor="rgba(210,147,63,0.1)"
  />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
