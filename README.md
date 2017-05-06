mobile-first
============

The `mobile-first` custom element takes "Mobile First" to a whole new level.
If viewed on a desktop or tablet, it will embed its content within a mock image of a mobile device.
This will allow your users to experience your site as you originally intended.
[Show me a demo!](http://samthor.github.io/mobile-first/)

The device can be rotated through mouse gestures, to view your site in landscape on the contained mock device.

## Why?

Why not?

## Usage

You can check out this code, and then include this element like this:

```html
<script src="mobile-first.js"></script>
<script type="module">
  // or using ES6 modules...
  import './mobile-first.js';
</script>
<mobile-first>
  <h5>Your Page!</h5>
</mobile-first>
```

Alternatively, you might contain a mobile-only site:

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

There are a few attributes that can be modified.

* `device` controls the mock device used: currently, this supports "nexus5" and "iphone5". By default, `mobile-first` chooses a random device from its available devices.

* `width` may be set to explicitly control the width at which the `mobile-first` element shows a mock device.
  Below this width, this element will act as a boring `div` that just contains its content—ideal for your users who are already on a mobile device!

### Bower

This is also available via Bower:

    $ bower install mobile_first

You can then include it from `bower_components`:

```html
<script src="bower_components/mobile-first/mobile-first.js"></script>
```

## Support

Tested on Chrome 58+ and Safari 10.1 (without animations), may work on other browsers that support Custom Elements and Shadow DOM.
