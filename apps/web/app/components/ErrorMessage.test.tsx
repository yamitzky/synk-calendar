import React from 'react';
import { render } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders correctly with title and message', () => {
    const { asFragment } = render(
      <ErrorMessage title="Error Occurred" message="Something went wrong" />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with only title', () => {
    const { asFragment } = render(
      <ErrorMessage title="Error Occurred" />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
