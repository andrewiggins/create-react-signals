/* eslint-disable */

import { Fragment, createElement as reactCreateElement } from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Signal, signal } from '@preact/signals-core';
import { createReactSignalsAdapter } from '../src/index';

describe('React integration', () => {
  // const { inject, getSignal } = createReactSignals<any>(
  //   function createSignal(wrapped) {
  //     const s = signal(wrapped.value);
  //     return [
  //       (cb) => s.subscribe(cb),
  //       () => s.value,
  //       (_, value) => {
  //         s.value = value as any;
  //       },
  //     ];
  //   },
  //   false,
  //   'value',
  // );

  const { inject } = createReactSignalsAdapter<Signal>(() => [
    // @ts-expect-error - Typescript doesn't see this function as a type predicate
    /*isSignal:*/ (value) => value != null && value instanceof Signal,
    /*subscribe:*/ (signal, cb) => signal.subscribe(cb),
    /*getValue:*/ (signal) => signal.value,
    /*setValue:*/ (signal, value) => {
      signal.value = value;
    },
  ]);

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
    let renderCount = 0;
    function App({ name }: any) {
      return (
        <div>
          Hello {name}! {++renderCount}
        </div>
      );
    }

    const s = signal('World');
    render(<App name={s} />, scratch);
    expect(scratch.innerHTML).toBe('<div>Hello World! 1</div>');

    act(() => {
      s.value = 'Preact';
    });

    expect(scratch.innerHTML).toBe('<div>Hello Preact! 2</div>');
  });
});
