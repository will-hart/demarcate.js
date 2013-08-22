# demarcate.js

**Version 2.0**

In short:
	
> demarcate.js allows you to edit an HTML document "in place", using the CSS styles of your page.  Users
are not required to know markdown, instead they just click on a DOM element and start typing! When finished
you can access the edited markdown through javascript.

**VERSION 2.0 will result in a couple of API changes which are detailed below.**

demarcate.js is an in-place Markdown Editor under development by 
[William Hart](http://www.williamhart.info) for [http://to-textr.com/](http://to-textr.com/) 
and released under an MIT license.  As of version 2.0, a complete redesign was undertaken with
the following goals:
	
1. Remove `jQuery` dependency
2. Support mobile browsers
3. Provide a richer, more "desktop" like UI
4. Improve modularity of the parser so additional markup languages can be supported (RST?!)

Demarcate uses the [showdown js library](https://github.com/coreyti/showdown) to render markdown 
in the browser once it has been entered.


## LIMITATIONS

Currently not all Markdown syntax is supported.  In particular:

- Mathjax equations in the HTML halt rendering. [[#8](https://github.com/will-hart/demarcate.js/issues/8)].

## VERSION 2.0 BREAKING CHANGES

A number of API changes were made.  The most important of these is that now demarcate expects all DOM 
elements received in function arguments to be native DOM elements, not jQuery ones.  In some cases
CSS selectors can now be passed instead of jQuery elements:
	
	// no longer supported:
	demarcate.enable($("#any_element"));
	
	// instead use
	demarcate.enable(document.getElementById("any_element"));
	

jQuery helper functions no longer work: 
	
	// the following jQuery style function calls are deprecated and have been removed
	$("#any_element").demarcate();
	$("#any_element").disable_demarcate();
	
The `isActive` function call is no longer relevant and has been removed. `isEnabled` still returns `true` if 
the editor is enabled and false otherwise.

To better reflect the modularity of decoding, (i.e. as other formats could be supported in the future)
	
	// The following is deprecated and will be removed in the future.
	demarcate.demarcate()
	
	// instead use:
	demarcate.parse()

Events have also been renamed to reflect javascript code standards:
	
	demarcate_editor_closed >> demarcateEditorClosed
    demarcate_editor_enabled >> demarcateEditorEnabled

The editor object in events can be accessed as follows:
	
	document.addEventListener('demarcateEditorEnabled', function(e) {
		var editor = e.detail.editor;
		
		// do something with the editor
	});
	
Or using jQuery:
	
	$(window).on('demarcateEditorEnabled', '#demarcate', function (e) {
		var editor = e.detail.editor;
		
		// do something with the editor
	});


## USAGE

** NOTE THIS SECTION STILL RELATES TO 1.1.4 - UPDATES TO 2.0 WILL FOLLOW**

**For developers, API documentation is available:**    
- [v1.1.4 - stable](http://www.williamhart.info/static/demarcate/docs/)    
- [develop branch](http://will-hart.github.com/demarcate.js/docs) 

The `editor.html` file shows a sample implementation of demarcate. It can be seen
running at [http://will-hart.github.com/demarcate.js/](http://will-hart.github.com/demarcate.js/).  

In short, two files need to be included in order to use demarcate - one js and 
one CSS file.  Also make sure you have the required images in and `img` directory.

    <link rel="stylesheet" href="css/demarcate.css">
    <script src="js/demarcate.min.js" type="text/javascript"></script>

> **NOTE** the minified version of demarcate.js includes all js dependencies

Next you need to add a script tag to the bottom of your page.  Use a jquery
selector to pick an DOM tree section to act as the in-place editor.  This is 
done as follows:

    $('#container').enable_demarcate();

Alternative javascript syntax is available which performs the same task:

    demarcate.enable($("#container"));

Every valid object (specified in the `editor_whitelist` array) within the 
`#container` DOM element will have the in place editing behaviour attached to 
it (i.e. click to edit).

To get the markdown from the elements, you can use the `demarcate()` function:

    // use this for any element
    $("#any_element").demarcate();
        
    // or
    var markdown = demarcate.demarcate($("#any_element"));
    
    // or for the Markdown from the current editor
    var markdown = demarcate.demarcate();
    

Demarcate provides a number of events that can be subscribed to, enabling your 
application to respond to editor actions.  In particular the 
`demarcate_editor_closed` event which is fired whenever an editor is successfully
closed and the changes are saved.  You can listen to this event using `bind` 
and automatically push the changes up to your server using ajax.  For instance:

    $(document).bind('demarcate_editor_closed', function(e, elem) {
        var md = demarcate.demarcate();
        $.post('http://my/api/url/', md});
    });

View the [API documentation](http://will-hart.github.com/demarcate.js/docs)  for
more details.

## LICENSE

This software is now released under an MIT license.  

-----------

Copyright (C) 2013 William Hart (http://www.williamhart.info/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## CONTRIBUTING

Contributions and suggestions are welcome - fill out an issue or submit a pull request.


##CHANGE LOG 

`+` new feature         
`~` revised feature        
`-` removed feature        
`*` bug fix

### Version 1.1.4

`+` Support syntax highlighted (e.g. pygments) source code          
`+` Support `<ol>` tags         
`+` Partial support for footnotes - can be created and are present in generated markdown but not rendered in place       
`+` Provide gzipped versions of CSS and javascript         
`+` Use `ctrl + up arrow` and `ctrl + down arrow` to reorder the current block up or down      
`+` Add `isActive()` and `isEnabled()` methods to check editor state     
`~` Add "version since" to API documentation         
`*` Edit box autosizes correctly on changing style type        
`*` Fix white space around `<a>` and `<code>` tags      
`*` Editing caret now placed correctly after newline insertion

### Version 1.1.3


`+` Released under the MIT license       
`+` Support image tags             
`+` [Documentation](http://will-hart.github.com/demarcate.js/doc/index.html) launched     
`+` Improved [github pages](http://will-hart.github.com/demarcate.js) to have a 'pretty' and a 'technical' demo         
`+` Allow disabling of an editor so editing can be toggled on and off        
`~` Scroll editor to near the top of the screen so you can write forever without using the mouse             
`~` Complete refactor of the code to maintain separation from other js libraries       
`*` Various minor changes and improvements        




### Version 1.1.2


`+` Added support for editing and converting tables.  Currently new rows cannot be added      
`+` Added support for `<br>` tags, by ending a line with four or more spaces      
`+` Use `alt + up arrow` and `alt + down arrow` to navigate between blocks being edited      
`+` Deployment Python script to make minifying js easier      
`~` Update example page - its ugly but shows demarcate's capablities      
`~` Shift editor underneath text area      
`~` Minor style updates to toolbar      
`~` Preformat textarea to match format of block being edited      
`*` Unknown tags errors not correctly trapped      
`*` Textarea now resizes correctly when first editing      

### Version 1.1.1

Initial "production" version for [http://to-textr.com/](http://to-textr.com/)
