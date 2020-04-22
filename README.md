The `mobile-first` custom element takes "Mobile First" to a whole new level.
If viewed on a desktop or tablet, it will embed its content within a mock image of a mobile device.
This will allow your users to experience your site as you originally intended.
[Play with the demo!](https://samthor.github.io/mobile-first/)

The device can be rotated through mouse gestures, to view your site in landscape on the contained mock device.

## Why?

Why not?

Maybe you can use this for mobile demos.

## Usage

Install via `mobile-first-element` and include the element:

```html
<script type="module">
  import './node-modules/mobile-first-element/mobile-first.js';
  // or possibly...
  import 'mobile-first-element';
</script>
<mobile-first>
  <h5>Your Page!</h5>
</mobile-first>
```

Alternatively, include an `<iframe>` to another site:

```html
<style type="text/css">
  /** Include this CSS for iframes so they fit the mock device. */
  mobile-first > iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
  }
</style>
<mobile-first>
  <iframe src="mobile-site.html"></iframe>
</mobile-first>
```

(A lot of major site use [`X-Frame-Options`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) to prevent this, though—maybe just contain your own content.)

### Configuration

There are a few attributes that can be modified.

* `device` controls the mock device used: currently, this supports "nexus5" and "iphone5". By default, `mobile-first` chooses a random device from its available devices.

* `width` may be set to explicitly control the width at which the `mobile-first` element shows a mock device.
  Below this width, this element will act as a boring `div` that just contains its content—ideal for your users who are _already_ on a mobile device!

## Support

Tested on Chrome 58+ and Safari 10.1 (without animations), may work on other browsers that support Custom Elements and Shadow DOM.
