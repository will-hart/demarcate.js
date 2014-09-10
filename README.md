**Version 2.0.2**

Master: [![Master Build Status](https://travis-ci.org/will-hart/demarcate.js.svg?branch=master)](https://travis-ci.org/will-hart/demarcate.js)

Develop: [![Develop Build Status](https://travis-ci.org/will-hart/demarcate.js.svg?branch=develop)](https://travis-ci.org/will-hart/demarcate.js)

TLDR:
	
> demarcate.js allows you to edit an HTML document "in place", using the CSS styles of your page.  Users
are not required to know markdown, instead they just click on a DOM element and start typing! When finished
you can access the edited markdown through javascript.

**VERSION 2.0 was a complete rewrite with some breaking changes. These are detailed below.**

demarcate.js is an in-place Markdown Editor developed by 
[William Hart](http://www.williamhart.info) and released under an MIT license.  As of version 2.0, 
a complete redesign was undertaken with the following goals:
	
1. Remove `jQuery` dependency
2. Remove `showdown.js` dependency
3. Support mobile browsers
4. Provide a richer, more "desktop" like UI
5. Improve modularity of the parser so additional markup languages can be supported as plugins

Demarcate has one *optional* dependency - [keymaster.js](https://github.com/madrobby/keymaster).  This 
is automatically detected and used if installed and provides shortcut keys for formatting options.

## LIMITATIONS

Support for custom events in  IE was pretty patchy and not very thoroughly tested. 

## INSTALLATION

### bower

There are two options - as of version 2.0.0 you can install through bower:

    bower install demarcate

Then include the standalone files in your browser,

    <script src="bower_components/demarcate/bin/demarcate.js"></script>

A minified version is also available, `demarcate.min.js`. You can also build
from source by downloading the repository and running it through node's browserify. 

Install browserify with:

    npm install -g browserify

Then build demarcate with 

    cd /unzipped/demarcate/repo/path/
    browserify src/main.js > bin/demarcate.js
    
### Directly

You can also download the repository directly, copy one of the files from the `bin` 
directory - `demacate.js` or `demarcate.min.js` - to your javascript assets directly
and include as normal. For example:

    <script src="static/js/demarcate.min.js"></script>

## UPGRADING TO 2.0 FROM 1.x.x

A number of API changes were made. The most important of these is that now demarcate expects all DOM 
elements received in function arguments to be native DOM elements, not jQuery ones. In some cases
CSS selectors can now be passed instead of jQuery elements:

	// no longer supported:
	//     demarcate.enable($("#any_element"));
	// use
	demarcate.enable(document.getElementById("any_element_id"));
	
	// or 
	demarcate.enable($("#any_element").get(0));

jQuery helper functions no longer work: 
	
	// the following jQuery style function calls are deprecated and have been removed
	// $("#any_element").demarcate();
	// $("#any_element").disable_demarcate();
	
The `isActive` function call is no longer relevant and has been removed. `isEnabled` still returns `true` if 
the editor is enabled and false otherwise.

To better reflect the modularity of decoding, (i.e. as other formats could be supported in the future)
	
	// The following is deprecated.
	// demarcate.demarcate()
	
	// use:
	demarcate.parse()

Events have also been renamed to reflect javascript code standards (naming was a result of too much Python):
	
	demarcate_editor_closed >> demarcateEditorClosed
    demarcate_editor_enabled >> demarcateEditorEnabled

The editor object in events can be accessed as follows:
	
	document.addEventListener('demarcateEditorEnabled', function(e) {
		var editor = e.detail.editor;
		
		// do something with the editor
	});
	
Or optionally using jQuery:
	
	$(window).on('demarcateEditorEnabled', '#demarcate', function (e) {
		var editor = e.detail.editor;
		
		// do something with the editor
	});


## USAGE

The `editor.html` file shows a sample implementation of demarcate. It can be seen
running at [http://will-hart.github.com/demarcate.js/](http://will-hart.github.com/demarcate.js/).  

Only one file needs to be included in order to use demarcate - the demarcate.js file. You may 
*optionally* include some CSS to style the menu. Crappy samples are available in the css directory.

    <script src="bower_components/demarcate/bin/demarcate.min.js" type="text/javascript"></script>

Next you need to add a script tag to the bottom of your page to enable the editor. For example:

    <script type="text/javascript>
        demarcate.enable(document.getElementById("any_element_id"));
        // or with jQuery: demarcate.enable($("#any_element_id").get(0));
    </script>

To get the markdown from the editor, you can use the `demarcate.parse()` function. You may
want to link this to the `demarcateEditorUpdated` event to get live updates:

    $(document).on('demarcateEditorUpdated', function(e, elem) {
        var markdown = demarcate.parse();
        console.log(markdown);
    });

## CONTRIBUTING

Contributions and suggestions are welcome - fill out an issue or submit a pull request. As of v2.0.0 
contributions should have passing unit tests added in the `test/` folder before they can be merged.

Contributions have been received from:

 - @dvetten, who improved `nodeType` handling

Thanks!

## TESTING

Let's face it I was a bit slack with testing in the initial versions of demarcate. With the release of 2.0.0 I decided 
to get myself into gear and have implemented some basic unit tests for the parser and editor. There are a number
of specs for `Markdown >> HTML`, however as yet there is no spec for `HTML >> Markdown`. 

Tests are built using `mocha` and `chai`. Tests also require `jsdom`. This can be problematic installing on Windows, as you require both Visual Studio and Python 2.7 installed. Luckily I have both, and managed to install JSDom by specifying my Visual Studio version: 

    npm install -g jsdom --msvs_version=2012

You can run the tests by typing the following into the command line:

    mocha
    
Or alternatively 

    npm test

## ROADMAP

There are some vague ideas I have. I make no guarantees about timing or even if they will ever land.
Suggestions / improvements / contributions welcome.

- Improve the slightly shoddy menu
- Add the ability to specify options to the editor
- Convert the parser to a "plugin" system, with parser specified in options
- Investigate different parsers

## CHANGE LOG 

`+` new feature         
`~` revised feature        
`-` removed feature        
`*` bug fix

### Version 2.0.3
`+` Improve new line handling after headings    

### Version 2.0.2

`*` Fix image tags with no title showing `"null"`    
`*` Fix incorrect reference in technical editor demo    
`+` Some `mocha` unit tests at last    
`~` Minor changes to new lines and whitespace due to unit tests    

### Version 2.0.1

`+` Add to bower.io

### Version 2.0.0

`+` Complete rewrite to remove all required dependencies
`+` Optional (terrible and crappy) CSS for styling the menu and editor
`+` Supports mobile browsers

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

Initial "production" version



## LICENSE

This software is now released under an MIT license.  

-----------

Copyright (C) 2013 William Hart (http://www.williamhart.info/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
