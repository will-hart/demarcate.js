demarcate.js
============

Demarcate is an in-place Markdown Editor developed by 
[William Hart](http://www.williamhart.info) for [textr](http://to-textr.com/).

The editor works directly on the DOM, replacing a whitelist of tags with a 
textarea editor when activated 


USAGE
===========

The `index.html` file in the editor shows a sample implementation of demarcate. 
It can be [viewed here](http://will-hart.github.com/demarcate.js/).  

Two files need to be included in order to use demarcate - one js and one CSS file:

    <link rel="stylesheet" href="css/demarcate.css">
    <script src="js/demarcate.js" type="text/javascript"></script>

Optionally, you may wish to use a plugin like [jquery.autosize.js](http://www.jacklmoore.com/autosize)
to allow the text editor fields to resize as you type.  (This is not a requirement)

Next you need to add a script tag to the bottom of your page.  Use a jquery selector 
to pick an DOM tree section to act as the in-place editor.  This is done as follows:

    $('#container').enable_demarcate();

Every valid object (specified in the `editor_whitelist` array) within the `#container` 
DOM element will have the in place editing behaviour attached to it (i.e. click to edit).

To get the markdown from the elements, you can use the `demarcate()` function:

    var markdown = demarcate_dom_root.demarcate();

Note that the `demarcate_dom_root` variable is automatically set to whatever you specified
when you called `enable_demarcate`.  You can then use this markdown in an ajax call or 
however you want to utilise it.  

Demarcate provides a `demarcate_editor_closed` event which is fired whenever an editor 
is successfully closed and the changes are saved.  You can listen to this event using 
`bind` and automatically push the changes up to your server using ajax.  For instance:

    $(document).bind('demarcate_editor_closed', function(e, elem) {
        var md = demarcate_dom_root.demarcate();
        $.post('http://my/api/url/', md});
    });


LICENSE
==========

Currently the software is only available under GPLv3 - whilst I'm not the biggest 
fan of this license as it is quite restrictive, whilst demarcate is being put together
I would like to keep this license so that any contributions can improve the editor.

If the software reaches sufficient maturity it will also be released under a BSD license.


CONTRIBUTING
===============

Contributions and suggestions are welcome - fill out an issue or submit a pull request.