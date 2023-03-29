/* eslint-disable */

import { Fragment, createElement as reactCreateElement } from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Signal, signal } from '@preact/signals-core';
import { createReactSignalsAdapter } from '../src/index';

const delay = (ms = 0) => new Promise((r) => setTimeout(r, ms));

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

  it('pass through signals as props and render & update as text', async () => {
    let renderCount = 0;
    function App({ name }: any) {
      return (
        <div>
          Hello {name}! {++renderCount}
        </div>
      );
    }

    const s = signal('World');
    act(() => {
      render(<App name={s} />, scratch);
    });
    expect(scratch.innerHTML).toBe('<div>Hello World! 1</div>');

    await act(async () => {
      s.value = 'Preact';
      await delay();
    });

    expect(scratch.innerHTML).toBe('<div>Hello Preact! 1</div>');
  });

  it('should update DOM props', async () => {
    let renderCount = 0;
    function App({ name }: any) {
      return <div className={name}>Hello {++renderCount}</div>;
    }

    const s = signal('World');
    render(<App name={s} />, scratch);
    expect(scratch.innerHTML).toBe('<div class="World">Hello 1</div>');

    await act(async () => {
      s.value = 'Valtio';
      await delay();
    });

    expect(scratch.innerHTML).toBe('<div class="Valtio">Hello 1</div>');
  });
});
