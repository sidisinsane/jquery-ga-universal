/*
Usage:
    <script src="/assets/js/jquery.gaUniversal.js"></script>
    <script>
    $.gaUniversalCode({
        'trackingId'      : 'UA-XXXXXXXX-XX',
        'anonymizeIp'     : true,
        'pageview'        : true,
        'displayfeatures' : true,
        'cookieDomain'    : 'none',
        'test'            : false,
        'debug'           : true
    });
    </script>
    <script>
    (function($) { 
        $('form').gaUniversalEventSubmit({
            eventCategory   : false,
            eventLog        : true
        });
        $('a').gaUniversalEventClick({
            eventCategory   : false,
            eventLog        : true
        });
    })(jQuery);
    </script>
*/
;(function ( $, window, document, undefined ) {
    'use strict';

    // ie console.log fallback
    typeof console     == 'undefined' && (console = {});
    typeof console.log == 'undefined' && (console.log = function(){});

    
    $.gaUniversalCode = function( options ) {

        var defaults = {
            trackingId     : 'UA-XXXXXXXX-XX',
            anonymizeIp    : true,
            pageview       : true,
            displayfeatures: true,
            cookieDomain   : 'none',
            test           : false,
            debug          : true
        };
        var options = $.extend( {}, defaults, options );

        // Set trackingId and status globally
        window.trackingId = options.trackingId;
        window.trackingDisabled = hasCookie( gaBuildDisableString( window.trackingId ) );


        // 1. Disable tracking if the opt-out cookie exists.
        gaDisableTracking( window.trackingId, options.debug );

        // 2. Load GA Universal code
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ 
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), 
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) 
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        // 3. Settings
        if( options.test ) {
            ga( 'create', window.trackingId, 'auto' );
        }else{
            ga( 'create', window.trackingId, {
                'cookieDomain': options.cookieDomain
            });
        }
        if(options.displayfeatures) {
            ga('require', 'displayfeatures');
        }
        if( options.anonymizeIp ) {
            ga( 'set', 'anonymizeIp', true );
        }
        if( options.pageview ) {
            ga( 'send', 'pageview' );
        }

    }


    $.fn.extend({
        gaUniversalEventSubmit: function( options ) {

            var defaults = {
                eventCategory   : false,
                debug           : true
            };
            var options = $.extend( {}, defaults, options );

            return this.each(function() {
                $( this ).on( 'submit', function( event ) {
                    var eventType = event.type;

                    var target = $( this ).attr( 'action' );
                    var eventCategory = ( !options.eventCategory ) ? 'submitted' : options.eventCategory;

                    var pageUrl = $( location ).attr( 'href' );
                    var eventAction = (typeof target != 'undefined') ? pageUrl + ' > ' + target : pageUrl;
                    
                    ga( 'send', 'event', eventCategory, eventAction );

                    if ( options.debug ) {
                        console.log( 'send', 'event', eventCategory, eventAction );
                    }
                });

            });

        }
    });

    $.fn.extend({
        gaUniversalEventClick: function( options ) {

            var defaults = {
                eventCategory   : false,
                debug           : true
            };
            var options = $.extend( {}, defaults, options );

            return this.each(function() {
                $( this ).on( 'click', function( event ) {
                    var eventType = event.type;

                    var target = $( this ).attr( 'href' );
                    var eventCategory = ( !options.eventCategory ) ? 'clicked' : options.eventCategory;

                    var pageUrl = $( location ).attr( 'href' );
                    var eventAction = (typeof target != 'undefined') ? pageUrl + ' > ' + target : pageUrl;
                    
                    ga( 'send', 'event', eventCategory, eventAction );

                    if ( options.debug ) {
                        console.log( 'send', 'event', eventCategory, eventAction );
                    }
                });

            });

        }
    });

    $.fn.extend({
        gaUniversalOpt: function( options ) {

            var defaults = {
                optOutText      : '<b>Disable</b> Google Analytics Tracking!',
                optInText       : '<b>Enable</b> Google Analytics Tracking!',
                debug           : true
            };
            var options = $.extend( {}, defaults, options );

            return this.each(function() {
                // Set Opt-in/out text according to detected status
                if ( window.trackingDisabled ) {
                    $( this ).html( options.optInText );
                } else {
                    $( this ).html( options.optOutText );
                }

                $( this ).on( 'click', function() {
                    if ( window.trackingDisabled ) {
                        gaOptin( window.trackingId, options.debug );
                    } else {
                        gaOptout( window.trackingId, options.debug );
                    }
                });

            });

        }
    });

    // Build disable string.
    function gaBuildDisableString( trackingId ) {
        return 'ga-disable-' + trackingId;
    }

    // Disables tracking if the opt-out cookie exists.
    function gaDisableTracking( trackingId, debug ) {
        debug = typeof debug !== 'undefined' ? debug : true;

        var disableStr = gaBuildDisableString( trackingId );
        // Check opt-out cookie is set to true
        if ( hasCookie( disableStr ) ) {
            window[disableStr] = true;
            if ( debug ) {
                console.log( 'Is GA Tracking disabled? Yes!' );
            }
        } else {
            window[disableStr] = false;
            if ( debug ) {
                console.log( 'Is GA Tracking disabled? No!' );
            }
        }
    }

    // Sets opt-out cookie and reloads page.
    function gaOptout( trackingId, debug ) {
        debug = typeof debug !== 'undefined' ? debug : true;

        var disableStr = gaBuildDisableString( trackingId );
        // Set cookie
        createCookie( disableStr, 'true', (10 * 365), debug );
        window[disableStr] = true;
        // Reload page
        window.location.reload();
    }

    // Removes opt-out cookie and reloads page.
    function gaOptin( trackingId, debug ) {
        debug = typeof debug !== 'undefined' ? debug : true;

        var disableStr = gaBuildDisableString( trackingId );
        // Delete cookie
        eraseCookie( disableStr, debug );
        window[disableStr] = false;
        // Reload page
        window.location.reload();
    }

    function hasCookie( name ) {
        var cookie = readCookie( name );
        return ( cookie )  ?  true : false;
    }

    function eraseCookie( name, debug ) {
        debug = typeof debug !== 'undefined' ? debug : true;

        createCookie( name, '', -1 );
        if ( debug ) {
            console.log( 'Cookie ' + name + ' erased!' );
        }
    }

    function createCookie( name, value, days, debug ) {
        debug = typeof debug !== 'undefined' ? debug : true;

        if ( days ) {
            var date = new Date();
            date.setTime( date.getTime() + ( days * 24 * 60 * 60 * 1000 ) );
            var expires = '; expires=' + date.toGMTString();
        } else {
            var expires = '';
        }
        document.cookie = name + '=' + value + expires + '; path=/';
        if ( debug ) {
            console.log( 'Cookie ' + name + ' created!' );
        }
    }

    function readCookie( name ) {
        var nameEq = name + '=';
        var ca = document.cookie.split( ';' );
        for ( var i=0; i < ca.length; i++ ) {
            var c = ca[i];
            while ( c.charAt(0) == ' ' ) c = c.substring( 1, c.length );
            if ( c.indexOf( nameEq ) == 0 ) return c.substring( nameEq.length, c.length );
        }
        return null;
    }

})( jQuery, window, document );
