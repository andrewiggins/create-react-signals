/* eslint-disable */

import { createElement as reactCreateElement } from 'react';
import { render } from 'react-dom';
import { signal } from '@preact/signals-core';
import { createReactSignals } from '../src/index';

describe('React integration', () => {
  const { inject, getSignal } = createReactSignals<any>(
    function createSignal(wrapped) {
      const s = signal(wrapped.value);
      return [
        (cb) => s.subscribe(cb),
        () => s.value,
        (_, value) => {
          s.value = value as any;
        },
      ];
    },
    false,
    'value',
  );

  const createElement = inject(reactCreateElement);

  let scratch: HTMLElement;
  beforeEach(() => {
    scratch = document.createElement('div');
    document.body.appendChild(scratch);
  });

  afterEach(() => {
    if (scratch) {
      scratch.remove();
    }
  });

  it('should work', () => {
    render(createElement('div', {}, 'Hello World'), scratch);
    expect(scratch.innerHTML).toBe('<div>Hello World</div>');
  });

  it('pass through signals as props and render as text', () => {
    function App({ name }: any) {
      return <div>Hello {name}</div>;
    }

    const s = getSignal('World');
    render(<App name={s} />, scratch);
    expect(scratch.innerHTML).toBe('<div>Hello World</div>');
  });
});
