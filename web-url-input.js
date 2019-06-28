/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html, css } from 'lit-element';
import { ArcOverlayMixin } from '@advanced-rest-client/arc-overlay-mixin/arc-overlay-mixin.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@advanced-rest-client/paper-autocomplete/paper-autocomplete.js';
import '@advanced-rest-client/arc-models/url-history-model.js';
/**
 * An element to display a dialog to enter an URL with auto hints
 *
 * ### Example
 *
 * ```html
 * <web-url-input purpose="open-browser"></web-url-input>
 * ```
 *
 * ### Styling
 *
 * `<web-url-input>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--web-url-input` | Mixin applied to the element | `{}`
 * `--web-url-input-background-color` | Background color of the element | `#fff`
 * `--web-url-input-input` | Mixin applied to the paper input element | `{}`
 * `--web-url-input-button` | Mixin applied to the paper button element | `{}`
 *
 * @customElement
 * @memberof UiElements
 * @appliesMixin ArcOverlayMixin
 */
class WebUrlInput extends ArcOverlayMixin(LitElement) {
  static get styles() {
    return css`
    :host {
      background-color: var(--web-url-input-background-color, #fff);
      padding: 20px;
      top: 20px;
      max-width: 90%;
      width: 100%;
      box-shadow: var(--box-shadow-6dp);
    }

    .inputs {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .editor {
      position: relative;
    }

    .main-input {
      flex: 1;
      flex-basis: 0.000000001px;
    }

    .action-button {
      background-color: var(--action-button-background-color);
      background-image: var(--action-button-background-image);
      color: var(--action-button-color);
      transition: var(--action-button-transition);
    }

    .action-button:hover,
    .action-button:focus {
      background-color: var(--action-button-hover-background-color);
      color: var(--action-button-hover-color);
    }

    .action-button[disabled] {
      background: var(--action-button-disabled-background-color);
      color: var(--action-button-disabled-color);
      cursor: auto;
      pointer-events: none;
    }`;
  }

  render() {
    let { suggestionsOpened, _autocompleteTarget, value } = this;
    const actionDisabled = !value;
    if (value === undefined) {
      value = '';
    }
    return html`
    <div class="editor">
      <div class="inputs">
        <paper-input
          label="Enter URL"
          .value="${value}"
          @input="${this._inputChanged}"
          class="main-input"
          type="url"
          required
          auto-validate
          error-message="The URL is required"></paper-input>
        <paper-button
          class="action-button"
          @click="${this._onEnter}"
          ?disabled="${actionDisabled}">Open</paper-button>
      </div>
      <paper-autocomplete loader open-on-focus
        @query="${this._autocompleteQuery}"
        .target="${_autocompleteTarget}"
        .opened="${suggestionsOpened}"
        @opened-changed="${this._suggestionsOpenedHandler}"></paper-autocomplete>
    </div>`;
  }

  static get properties() {
    return {
      // Current URL value.
      value: { type: String },
      /**
       * Input target for the `paper-autocomplete` element.
       *
       * @type {HTMLElement}
       */
      _autocompleteTarget: Object,
      // True when a suggestion box for the URL is opened.
      suggestionsOpened: { type: Boolean },
      /**
       * A value to be set in the detail object of `open-web-url` custom event.
       * The editor can server different purposes. Re-set the purpose to inform
       * the application about purpose of the event.
       */
      purpose: String
    };
  }

  get value() {
    return this._value;
  }

  set value(value) {
    const old = this._value;
    if (old === value) {
      return;
    }
    this._value = value;
    this.requestUpdate('value', old);
    this.dispatchEvent(new CustomEvent('value-changed', {
      composed: true,
      detail: {
        value
      }
    }));
  }

  get suggestionsOpened() {
    return this._suggestionsOpened;
  }

  set suggestionsOpened(value) {
    const old = this._suggestionsOpened;
    if (old === value) {
      return;
    }
    this._suggestionsOpened = value;
    this.requestUpdate('suggestionsOpened', old);
    this.dispatchEvent(new CustomEvent('suggestionsOpened-changed', {
      composed: true,
      detail: {
        value
      }
    }));
  }

  get _autocomplete() {
    return this.shadowRoot.querySelector('paper-autocomplete');
  }

  get _model() {
    if (!this.__model) {
      this.__model = document.createElement('url-history-model');
      this.__model.eventsTarget = this;
      this.shadowRoot.appendChild(this.__model);
    }
    return this.__model;
  }

  constructor() {
    super();
    this._keyDownHandler = this._keyDownHandler.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._keyDownHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._keyDownHandler);
  }

  firstUpdated() {
    this._autocompleteTarget = this.shadowRoot.querySelector('.main-input');
  }
  /**
   * Handler for the query event coming from the aitocomplete.
   * It makes the query to the data store for history data.
   * @param {CustomEvent} e
   */
  _autocompleteQuery(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!e.detail.value) {
      e.target.source = [];
      return;
    }
    this._makeQuery(e.detail.value);
  }
  /**
   * Dispatches `open-web-url` custom event and returns it.
   * @return {CustomEvent} Dispatched event
   */
  _dispatchOpenEvent() {
    const e = new CustomEvent('open-web-url', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        url: this.value,
        purpose: this.purpose
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Queries the model for history data.
   * @param {String} q User query from the input field
   * @return {[type]} [description]
   */
  _makeQuery(q) {
    const model = this._model;
    return model.query(q)
        .then((result) => {
          result = result.map((item) => item.url);
          this._autocomplete.source = result;
        })
        .catch((cause) => {
          console.warn(cause);
          this._autocomplete.source = [];
        });
  }
  /**
   * A handler for keyboard key down event bubbling through this element.
   * If the target is the input and the key is Enter key then it calls
   * `_onEnter()` function
   * @param {KeyboardEvent} e
   */
  _keyDownHandler(e) {
    if (e.composedPath()[0].nodeName !== 'INPUT') {
      return;
    }
    if (e.key === 'Enter' || e.keyCode === 13) {
      this._onEnter();
    }
  }
  /**
   * A handler called when the user press "enter" in any of the form fields.
   * This will send an `open-web-url` event.
   */
  _onEnter() {
    if (this.suggestionsOpened) {
      return;
    }
    this._dispatchOpenEvent();
    this.opened = false;
  }
  /**
   * Sets value of the control when input value changes
   * @param {!Event} e
   */
  _inputChanged(e) {
    this.value = e.target.value;
  }
  /**
   * Overrides from ArcOverlayMixin
   * @param {!Event} e
   */
  _onCaptureEsc(e) {
    if (this.suggestionsOpened) {
      return;
    }
    super._onCaptureEsc(e);
  }
  /**
   * Handler for `opened-changed` event dispatched from the autocomplete.
   * @param {CustomEvent} e
   */
  _suggestionsOpenedHandler(e) {
    this.suggestionsOpened = e.detail.value;
  }

  _openedChanged(opened) {
    super._openedChanged(opened);
    if (opened) {
      setTimeout(() => {
        this._autocompleteTarget.focus();
      });
    }
  }
  /**
   * Fired when the URL has been accepted
   *
   * @event open-web-url
   * @param {String} url The URL to open
   * @param {String} purpose Value of the `purpose` property.
   */
}
window.customElements.define('web-url-input', WebUrlInput);
