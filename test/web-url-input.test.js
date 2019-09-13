import { fixture, assert, nextFrame, aTimeout } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../web-url-input.js';

describe('<anypoint-button>', function() {
  async function basicFixture() {
    return (await fixture(`<web-url-input purpose="test"></web-url-input>`));
  }

  describe('basic', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('`web-url-input` is hidden by default', function() {
      assert.equal(element.style.display, 'none');
    });

    it('Computes _autocompleteTarget', function() {
      const input = element.shadowRoot.querySelector('anypoint-input');
      assert.isTrue(element._autocompleteTarget === input);
    });

    it('has model in shadow dom by default', () => {
      const node = element.shadowRoot.querySelector('url-history-model');
      assert.ok(node);
    });

    it('Calls query() on the model', async () => {
      const model = element._model;
      const spy = sinon.spy(model, 'query');
      element.opened = true;
      const input = element.shadowRoot.querySelector('anypoint-input');
      element.value = 'h';
      await nextFrame();
      MockInteractions.keyEventOn(input.inputElement, 'input', 97, [], 'a');
      assert.isTrue(spy.called);
    });

    it('Dispatches open-web-url event', async () => {
      const value = 'https://test.com';
      element.value = value;
      element.opened = true;
      await nextFrame();
      let eventData;
      element.addEventListener('open-web-url', function clb(e) {
        element.removeEventListener('open-web-url', clb);
        eventData = e.detail;
      });
      const button = element.shadowRoot.querySelector('anypoint-button');
      MockInteractions.tap(button);
      assert.typeOf(eventData, 'object');
      assert.equal(eventData.url, value);
      assert.equal(eventData.purpose, 'test');
    });

    // This should be tested at the end
    it('Accepts selection on enter', async () => {
      element.opened = true;
      let called = false;
      element._onEnter = function() {
        called = true;
      };
      element.value = 'abc';
      await nextFrame();
      const input = element.shadowRoot.querySelector('anypoint-input');
      MockInteractions.pressAndReleaseKeyOn(input.inputElement, 13, [], 'Enter');
      assert.isTrue(called);
    });

    it('Opens suggestions after query', async () => {
      element._model.query = () => {
        return Promise.resolve([{
          url: 'url1'
        }, {
          url: 'url2'
        }]);
      };
      element.opened = true;
      const input = element.shadowRoot.querySelector('anypoint-input');
      element.value = 'u';
      await nextFrame();
      MockInteractions.keyEventOn(input.inputElement, 'input', 114, [], 'r');
      await nextFrame();
      assert.isTrue(element.suggestionsOpened);
    });

    it('Closes overlay when ESC key', async () => {
      element.opened = true;
      await nextFrame();
      MockInteractions.keyEventOn(document.body, 'keydown', 27, [], 'Escape');
      assert.isFalse(element.opened);
    });

    it('Do not closes overlay when suggestions are opened', async () => {
      element.opened = true;
      element.suggestionsOpened = true;
      await nextFrame();
      MockInteractions.keyEventOn(document.body, 'keydown', 27, [], 'Escape');
      assert.isTrue(element.opened);
    });
  });

  describe('_keyDownHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    function addInput(element) {
      const input = document.createElement('input');
      element.shadowRoot.appendChild(input);
      return input;
    }

    it('Calls _onEnter() when is Enter', () => {
      const input = addInput(element);
      const spy = sinon.spy(element, '_onEnter');
      MockInteractions.keyEventOn(input, 'keydown', 13, [], 'Enter');
      assert.isTrue(spy.called);
    });

    it('Ignores other letters', () => {
      const input = addInput(element);
      const spy = sinon.spy(element, '_onEnter');
      MockInteractions.keyEventOn(input, 'keydown', 114, [], 'r');
      assert.isFalse(spy.called);
    });

    it('Ignores when target is not input', () => {
      const spy = sinon.spy(element, '_onEnter');
      MockInteractions.keyEventOn(element, 'keydown', 114, [], 'r');
      assert.isFalse(spy.called);
    });
  });

  describe('_dispatchOpenEvent()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Dispatches open-web-url event', () => {
      element.value = 'https://';
      const spy = sinon.spy();
      element.addEventListener('open-web-url', spy);
      element._dispatchOpenEvent();
      assert.deepEqual(spy.args[0][0].detail, {
        url: 'https://',
        purpose: 'test'
      });
    });

    it('Returns an event', () => {
      const result = element._dispatchOpenEvent();
      assert.typeOf(result, 'customevent');
    });
  });

  describe('_makeQuery()', () => {
    const query = 'test-query';
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets autocomplete source', async () => {
      element._model.query = () => {
        return Promise.resolve([{
          url: 'url1'
        }, {
          url: 'url2'
        }]);
      };

      await element._makeQuery(query);
      assert.deepEqual(element._autocomplete.source, ['url1', 'url2']);
    });

    it('Sets autocomplete when error', async () => {
      element._model.query = () => {
        return Promise.reject(new Error('test'));
      };
      await element._makeQuery(query);
      assert.deepEqual(element._autocomplete.source, []);
    });
  });

  describe('_autocompleteQuery()', () => {
    let element;
    let ev;
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
      ev = {
        stopPropagation: () => {},
        preventDefault: () => {},
        detail: {},
        target: element._autocomplete
      };
    });

    it('Stops propagation of the event', () => {
      const spy = sinon.spy(ev, 'stopPropagation');
      element._autocompleteQuery(ev);
      assert.isTrue(spy.called);
    });

    it('Prevent\'s event default', () => {
      const spy = sinon.spy(ev, 'preventDefault');
      element._autocompleteQuery(ev);
      assert.isTrue(spy.called);
    });

    it('Sets autocomplete source when no value', async () => {
      element._autocompleteQuery(ev);
      await aTimeout();
      assert.deepEqual(element._autocomplete.source, []);
    });

    it('Calls _makeQuery() when detail has value', () => {
      ev.detail.value = 'test';
      const spy = sinon.spy(element, '_makeQuery');
      element._autocompleteQuery(ev);
      assert.equal(spy.args[0][0], 'test');
    });
  });

  describe('_onEnter()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.opened = true;
      await nextFrame();
    });

    it('Closes the overlay', () => {
      element._onEnter();
      assert.isFalse(element.opened);
    });

    it('Calls _dispatchOpenEvent()', () => {
      const spy = sinon.spy(element, '_dispatchOpenEvent');
      element._onEnter();
      assert.isTrue(spy.called);
    });

    it('Ignores the call when suggestions are opened', () => {
      element.suggestionsOpened = true;
      element._onEnter();
      assert.isTrue(element.opened);
    });
  });

  describe('a11y', () => {
    it('is accessible in normal state', async () => {
      const input = await fixture(`<web-url-input purpose="test"></web-url-input>`);
      await assert.isAccessible(input);
    });

    it('is accessible in opened state', async () => {
      const input = await fixture(`<web-url-input opened></web-url-input>`);
      await assert.isAccessible(input);
    });
  });
});
