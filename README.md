# jquery-ga-universal

## install package and add it to bower.json dependencies

`bower install jquery-ga-universal --save`

Or alternatively, grab the jquery.ga-universal.js and include it in your project.

## example

```js
jQuery(document).ready(function($) {
  $.gaUniversalCode({
      'trackingId'      : 'UA-XXXXXXXX-XX',
      'anonymizeIp'     : true,
      'pageview'        : true,
      'displayfeatures' : true,
      'cookieDomain'    : 'none',
      'test'            : true,
      'debug'           : true
  });

  $('form').gaUniversalEventSubmit({
    eventCategory   : false,
    eventLog        : true
  });

  $('a').gaUniversalEventClick({
    eventCategory   : false,
    eventLog        : true
  });
});
```

