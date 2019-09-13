[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/web-url-input.svg)](https://www.npmjs.com/package/@advanced-rest-client/web-url-input)

[![Build Status](https://travis-ci.org/advanced-rest-client/web-url-input.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/web-url-input)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/web-url-input)

# web-url-input

An element to display a dialog to enter an URL with auto hints

## Usage

### Installation
```
npm install --save @advanced-rest-client/web-url-input
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import './node_modules/@advanced-rest-client/web-url-input/web-url-input.js';
    </script>
  </head>
  <body>
    <web-url-input></web-url-input>
  </body>
</html>
```

### In a LitElement template

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/web-url-input/web-url-input.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <web-url-input @open-web-url="${this._openHandler}"></web-url-input>
    `;
  }

  _openHandler(e) {
    console.log(e.detail.value);
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/web-url-input
cd api-url-editor
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
