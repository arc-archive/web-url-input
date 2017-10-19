[![Build Status](https://travis-ci.org/advanced-rest-client/web-url-input.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/web-url-input)  

# web-url-input

`<web-url-input>` An element to display a dialog to enter an URL with auto hints

### Example
```
<web-url-input purpose="open-browser"></web-url-input>
```

### Styling
`<web-url-input>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--web-url-input` | Mixin applied to the element | `{}`
`--web-url-input-background-color` | Background color of the element | `#fff`
`--web-url-input-input` | Mixin applied to the paper input element | `{}`
`--web-url-input-button` | Mixin applied to the paper button element | `{}`



### Events
| Name | Description | Params |
| --- | --- | --- |
| open-web-url | Fired when the URL has been accepted | url **String** - The URL to open |
purpose **String** - Value of the `purpose` property. |
