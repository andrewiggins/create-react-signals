import { createElement as reactCreateElement } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Route, Routes, MemoryRouter } from 'react-router-dom';
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

// Not supported by create-react-signals :(
describe.skip('react-router-dom integration tests', () => {
  let scratch: HTMLDivElement;

  beforeEach(() => {
    scratch = document.createElement('div');
  });

  afterEach(() => {
    if (scratch) {
      act(() => {
        unmountComponentAtNode(scratch);
      });
      scratch.remove();
    }
  });

  it('Route component should render', () => {
    const name = proxy({ name: 'World' });
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/page1" element={<div>Page 1</div>} />
          <Route
            path="*"
            id={$(name).name}
            element={<div>Hello {$(name).name}!</div>}
          />
        </Routes>
      </MemoryRouter>,
      scratch,
    );

    expect(scratch.innerHTML).toEqual('<div>Hello World!</div>');
  });
});
