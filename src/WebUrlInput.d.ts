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
import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { ArcOverlayMixin } from '@advanced-rest-client/arc-overlay-mixin/arc-overlay-mixin.js';
import { AnypointInput } from '@anypoint-web-components/anypoint-input';
import { AnypointAutocomplete } from '@anypoint-web-components/anypoint-autocomplete';
import { UrlHistoryModel } from '@advanced-rest-client/arc-models';

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
 */
export class WebUrlInput {
  static readonly styles: CSSResult;
  render(): TemplateResult;

  // Current URL value.
  value: string;
  /**
   * Input target for the `anypoint-autocomplete` element.
   */
  _autocompleteTarget: AnypointInput;
  // True when a suggestion box for the URL is opened.
  suggestionsOpened: boolean;
  /**
   * A value to be set in the detail object of `open-web-url` custom event.
   * The editor can server different purposes. Re-set the purpose to inform
   * the application about purpose of the event.
   */
  purpose?: string;
  /**
   * Enables compatibility with Anypoint platform
   */
  compatibility: boolean;
  /**
   * Enables Material Design Outlined inputs
   */
  outlined: boolean;

  readonly _autocomplete: AnypointAutocomplete;

  readonly _model: UrlHistoryModel

  constructor();

  connectedCallback(): void;

  disconnectedCallback(): void;

  firstUpdated(): void;

  /**
   * Handler for the query event coming from the aitocomplete.
   * It makes the query to the data store for history data.
   */
  _autocompleteQuery(e: CustomEvent): void;

  /**
   * Dispatches `open-web-url` custom event and returns it.
   * @return {CustomEvent} Dispatched event
   */
  _dispatchOpenEvent(): CustomEvent;

  /**
   * Queries the model for history data.
   * @param q User query from the input field
   */
  _makeQuery(q: string): Promise<void>;

  /**
   * A handler for keyboard key down event bubbling through this element.
   * If the target is the input and the key is Enter key then it calls
   * `_onEnter()` function
   */
  _keyDownHandler(e: KeyboardEvent): void;

  /**
   * A handler called when the user press "enter" in any of the form fields.
   * This will send an `open-web-url` event.
   */
  _onEnter(): void;

  /**
   * Sets value of the control when input value changes
   */
  _inputChanged(e: CustomEvent): void;

  /**
   * Overrides from ArcOverlayMixin
   */
  _onCaptureEsc(e: Event): void;

  /**
   * Handler for `opened-changed` event dispatched from the autocomplete.
   */
  _suggestionsOpenedHandler(e: CustomEvent): void;
}

export interface WebUrlInput extends ArcOverlayMixin, LitElement {
}
