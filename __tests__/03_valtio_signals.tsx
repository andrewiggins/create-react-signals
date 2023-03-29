/* eslint-disable */

import { Fragment, createElement as reactCreateElement } from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { proxy, snapshot, subscribe } from 'valtio/vanilla';
import { createReactSignals } from '../src/index';

const { getSignal, inject } = createReactSignals(
  function createSignal(proxyObject: object) {
    const sub = (callback: () => void) => subscribe(proxyObject, callback);
    const get = () => snapshot(proxyObject);
    const set = (path: (string | symbol)[], value: unknown) => {
      let current: any = proxyObject;
      for (let i = 0; i < path.length - 1; ++i) {
        current = current[path[i] as string | symbol];
      }
      current[path[path.length - 1] as string | symbol] = value;
    };

    return [sub, get, set];
  },
  true,
  'value',
);

function $<T extends object>(proxyObject: T): any {
  return getSignal(proxyObject);
}

const createElement = inject(reactCreateElement);

const delay = (ms = 0) => new Promise((r) => setTimeout(r, ms));

describe('React integration', () => {
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

  it('pass through signals as props and render as text', async () => {
    let renderCount = 0;
    function App({ name }: any) {
      return (
        <div>
          Hello {$(name).name}! {++renderCount}
        </div>
      );
    }

    const s = proxy({ name: 'World' });
    render(<App name={s} />, scratch);
    expect(scratch.innerHTML).toBe('<div>Hello World! 1</div>');

    act(() => {
      s.name = 'Valtio';
    });
    await delay();

    expect(scratch.innerHTML).toBe('<div>Hello Valtio! 1</div>');
  });
});
