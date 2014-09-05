(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var editor = null,
    dirtyCounter = 0,
    timeoutId = 0,
    event = null,
    originalOutline = "",
    markdownParser = require('./markdown').markdownParser;

 function fireEvent(name, detail) {
    var evt; 
    
    if (document.createEventObject != undefined) { // IE
        // Custom events in IE are totally broken and are currently unsupported
        // sorry IE
    } else { // other browsers
        evt = new CustomEvent(name, detail);
        editor.dispatchEvent(evt);
    }
}

function setDirty() {
    dirtyCounter++;
    
    clearTimeout(timeoutId);
    
    if (dirtyCounter > 10) {
        editorUpdated();
    } else { 
        timeoutId = setTimeout(function () { 
            editorUpdated(); 
        }, 5000);
    }
}

function editorUpdated() { 
    dirtyCounter = 0;
    clearTimeout(timeoutId);
    
    // notify subscribers
    fireEvent("demarcateEditorUpdated", {
        "detail": { 
            "editor": editor
        },
        bubbles: true,
        cancelable: true
    });
}

function openEditor(hideMenu) {           
    // create the editor and set 
    editor.contentEditable = true;
    
    // create the menu if requested
    if (hideMenu === undefined || !hideMenu) createEditorMenu();
    
    // bind the "input" event
    if (editor.addEventListener) {
        editor.addEventListener("input", setDirty); // Everybody else
    } else {
        // IE custom events make my eyes bleed
        // http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/
    }
    
    // raise the opened event
    fireEvent("demarcateEditorEnabled", {
            "detail": { 
                "editor": editor
            }
        });

    demarcate.parse.editor = editor;
    
    // remove "outline" on the editr cos its gross
    originalOutline = editor.style.outline;
    editor.style.outline = "none";
    
    // focus on the editor
    focusEditor();
}

/*
 * closes the editor, unbinding events.  If "true" is passed as an 
 * argument then it will also return the markdown from the editor
 */
function closeEditor(getMarkdown) { 
    var md = "",
        menus = document.getElementsByClassName("demarcate-menu");
    
    // turn off the editor
    editor.contentEditable = false;
    
    // get the markdown if requested
    if (getMarkdown !== undefined && getMarkdown) {
        md = parse(editor);
    }
    
    // raise editor closed event
    fireEvent("demarcateEditorClosed", {
            "detail": { 
                "editor": editor
            }
        })
    
    // remove the menu
    if (menus.length > 0) menus[0].remove();
    
    // reset the outline style
    editor.style.outline = originalOutline;
    
    // unset variables
    editor = null;
    demarcate.parse.editor = null;
    return md;
}

/*
 * Sets the focus on the editor and scrolls the caret into view
 */
function focusEditor() {
    // handle a closed editor
    if (editor === null) return;
    
    editor.focus();
    var elem = window.getSelection().baseNode;
    if (elem.nodeType === 3) {
        for (elem = elem.parentNode; elem.nodeType === 3; elem = elem.parentElement) {}
    }
    elem.scrollIntoView(true);
}

function createMenuButton(text, action, tooltip) {
    var button = document.createElement("a");
    
    button.href = "#";
    button.innerHTML = text;
    button.title = tooltip;
    button.className = "demarcate-menu-button";
    button.onclick = function (e) { 
        e.preventDefault();
        action();
        focusEditor();
    };
    
    return button;
}

/*
 * creates a menu for the demarcate editor
 */
function createEditorMenu() {
    var menu = document.createElement("div"),
        body = document.getElementsByTagName("body")[0];
    
    // set up the menu styles and buttons
    menu.className = "demarcate-menu";
    
    menu.appendChild(createMenuButton("X", function () { 
        demarcate.disable();
    }, "Stop editing"));
    menu.appendChild(createMenuButton("B", function () { 
        demarcate.apply("bold"); 
    }, "Makes text bold (CTRL+B)"));
    menu.appendChild(createMenuButton("I", function () { 
        demarcate.apply("italic");
    }, "Makes text italic (CTRL+I)"));;
    menu.appendChild(createMenuButton("H1", function () { 
        demarcate.heading(1);
    }, "Set heading level 1 (CTRL+SHIFT+1)"));
    menu.appendChild(createMenuButton("H2", function () { 
        demarcate.heading(2);
    }, "Set heading level 2(CTRL+SHIFT+2)"));
    menu.appendChild(createMenuButton("H3", function () { 
        demarcate.heading(3);
    }, "Set heading level 3(CTRL+SHIFT+3)"));
    menu.appendChild(createMenuButton("H4", function () { 
        demarcate.heading(4);
    }, "Set heading level 4(CTRL+SHIFT+4)"));
    menu.appendChild(createMenuButton("P", function () { 
        demarcate.transform("p");
    }, "Makes text a plain paragraph (CTRL+SHIFT+SPACE)"));
    menu.appendChild(createMenuButton("OL", function () { 
        demarcate.insert("p");
        demarcate.insert("ol"); 
    }, "Inserts an ordered list (CTRL+SHIFT+L)"));
    menu.appendChild(createMenuButton("UL", function () { 
        demarcate.insert("p");
        demarcate.insert("ul"); 
    }, "Inserts an unordered list (CTRL+SHIFT+U)"));
    menu.appendChild(createMenuButton("CDE", function () { 
        demarcate.transform("code"); 
    }, "Makes text a code block"));
    menu.appendChild(createMenuButton("QTE", function () { 
        demarcate.transform("blockquote"); 
    }, "Makes paragraph a quote (CTRL+SHIFT+Q)"));
    menu.appendChild(createMenuButton("CLR", function () { 
        demarcate.clearFormats();
    }, "Clears formatting from the selected text"));
    
    
    // add to the dom
    body.appendChild(menu);
}

// create a demarcate object
function demarcate() {};
demarcate.parse = markdownParser;

/* 
 * Sets up a demarcate editor on the given HTML DOM element.  If true is passed as
 * an optional second argument, then no menu will be created.  This is useful for 
 * using demarcate "silently" as an HTML to Markdown convertor.
 */
demarcate.enable = function (elem, hideMenu) { 
    if (editor !== null) {
        demarcate.disable();
    }
    
    editor = elem;
    openEditor(hideMenu);
}

/* 
 * Closes a markdown editor
 */
demarcate.disable = function () { 
    closeEditor();
}

/* 
 * Applies the given formatting or command
 */
demarcate.apply = function (fmt, val) {
    document.execCommand(fmt, false, val);
    focusEditor();
}

/* 
 * Returns the HTML from the editor 
 */
demarcate.html = function () { 
    return editor.innerHTML;
}

/*
 * DEPRECATED METHOD - use demarcate.parse(elem) intead
 */
demarcate.demarcate = function(elem) {
    console.warn("demarcate.demarcate is deprecated. Use demarcate.parse(elem) instead");

    // check we have jQuery
    if ($ === undefined) {
        console.log("Unable to parse using demarcate.demarcate() - jQuery not installed.  Note demacate.demarcate is deprecated, refer to the docs for demarcate.parse()");
        return "";
    }
    
    if (elem === undefined) {
        return demarcate.parse();
    }
    
    return demarcate.parse(elem.get(0));
}

/*
 * Returns true if the editor has been enabled, false otherwise
 */
demarcate.isEnabled = function() {
    return editor === null || editor.contentEditable === false;
}

/* 
 * Gathers the inner HTML of the current tag and wraps it inside 
 * a new tag of the given type. As an example, this could be used to
 * switch a <h1> tag to a <p> tag.
 */
demarcate.transform = function (tag) {
    demarcate.apply("formatblock", "<" + tag + ">");
}

/*
 * Inserts a list or paragraph at the current cursor position
 */
demarcate.insert = function (tag) {
    if (tag === "ul") {
        demarcate.apply("insertUnorderedList");
    } else if (tag === "ol") {
        demarcate.apply("insertOrderedList");
    } else if (tag === "hr") {
        demarcate.apply("insertHTML", "<hr />");
    } else {
        console.log("demarcate.insert could not insert unknown tag - " + tag);
    }
}

/*
 * Sets heading level for the given text
 */
demarcate.heading = function (level) {
    // rough validation
    if (level < 1 || level > 6) return;
    demarcate.transform("H" + level);
}

demarcate.clearFormats = function () {
    demarcate.apply("removeFormat");
}

/*
 * add shortcut keys (only if requirement "keys.js" is satisfied)
 */
if (typeof key !== 'undefined') {
    
    // setup commands for formatting
    key("ctrl+shift+b", function (e, h) { 
        e.preventDefault();
        demarcate.apply("bold"); 
    });
    key("ctrl+shift+i",function (e, h) { 
        e.preventDefault();
        demarcate.apply("italic"); 
    });

    // set up command for block types
    key("ctrl+shift+1", function (e, h) { 
        e.preventDefault();
        demarcate.heading(1); 
    });
    key("ctrl+shift+2", function (e, h) { 
        e.preventDefault();
        demarcate.heading(2); 
    });
    key("ctrl+shift+3", function (e, h) { 
        e.preventDefault();
        demarcate.heading(3); 
    });
    key("ctrl+shift+4", function (e, h) { 
        e.preventDefault();
        demarcate.heading(4); 
    });
    key("ctrl+shift+5", function (e, h) { 
        e.preventDefault();
        demarcate.heading(5); 
    });
    key("ctrl+shift+6", function (e, h) { 
        e.preventDefault();
        demarcate.heading(6); 
    });
    key("ctrl+shift+space", function (e, h) { 
        e.preventDefault();
        demarcate.transform("p"); 
    });
    key("ctrl+shift+u", function(e, h) {
        e.preventDefault(); 
        demarcate.insert("ul"); 
    });
    key("ctrl+shift+l", function(e, h) { 
        e.preventDefault();
        demarcate.insert("ol"); 
    });
    key("ctrl+shift+h", function(e, h) { 
        e.preventDefault();
        demarcate.insert("hr"); 
    });
    key("ctrl+shift+q", function(e, h) { 
        e.preventDefault();
        demarcate.transform("blockquote"); 
    });
}
exports.demarcate = demarcate;
},{"./markdown":3}],2:[function(require,module,exports){
(function (global){
var demarcate = require('./demarcate').demarcate;
global.window.demarcate = demarcate;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./demarcate":1}],3:[function(require,module,exports){
function parse(elem) { 
    // if an element is passed demarcate this, otherwise we use the editor
    if (elem === undefined) elem = parse.editor;

    // get the tag name and parse approppriately 
    var tagName = elem.nodeType == 3 ? "_text" : elem.tagName.toLowerCase();

    // check we are allowed to parse this type
    if (!(tagName in tagDict)) return "";

    // "demarkdown" the selected element through recursive dom traversal
    return tagDict[tagName].process(elem);
}

/* 
 * A dictionary of tags used by the parser
 */
var tagDict = {
    'div': {
        markdownable: true, 
        process: function(elem) {
            return process(elem, '\n', '\n');
        }
    },
    'span': {
        markdownable: true,
        process: function(elem) {
            return process(elem, '', '');
        }
    },
    'h1': {
        markdownable: true, 
        process: function(elem) {
            return process(elem, '# ', '\n');
        }
    },
    'h2': {
        markdownable: true, 
        process: function(elem) {
            return process(elem, '## ', '\n');
        }
    },
    'h3': {
        markdownable: true, 
        process: function(elem) {
            return process(elem, '### ', '\n');
        }
    },
    'h4': {
        markdownable: true,
        process: function(elem) {
            return process(elem, '#### ', '\n');
        }
    },
    'h5': {
        markdownable: true,
        process: function(elem) {
            return process(elem, '##### ', '\n');
        }
    },
    'h6': {
        markdownable: true,
        process: function(elem) {
            return process(elem, '###### ', '\n');
        }
    },
    'li': {
        markdownable: true,
        process: function(elem) {
            return process(elem);
        }
    },
    'ul': {
        markdownable: true,
        process: function(elem) {
            return list(elem, 'unordered');
        }
    },
    'ol': {
        markdownable: true,
        process: function(elem) {
            return list(elem, 'ordered');
        }
    },
    'blockquote': {
        markdownable: true,
        process: function(elem) {
            return process(elem, '\n> ', '\n');
        }
    },
    'pre': {
        markdownable: true,
        process: function(elem) {
            return code(elem);
        }
    },
    'code': {
        markdownable: true,
        process: function(elem) {
            return code(elem);
        }
    },
    'a': {
        markdownable: true,
        process: function(elem) {
            return link(elem);
        }
    },
    'hr': {
        markdownable: true,
        process: function(elem) {
            return process(elem, '------', '\n');
        }
    },
    'em': {
        markdownable: true,
        process: function(elem) {
            return process(elem, ' *', '* ');
        }
    },
    'i': {
        markdownable: true,
        process: function(elem) {
            return process(elem, ' *', '* ');
        }
    },
    'strong': {
        markdownable: true,
        process: function(elem) {
            return process(elem, ' **', '** ');
        }
    },
    'b': {
        markdownable: true,
        process: function(elem) {
            return process(elem, ' **', '** ');
        }
    },
    'p': {
        markdownable: true,
        process: function(elem) {
            return process(elem, '\n', '\n');
        }
    },
    'table': {
        markdownable: true,
        process: function(elem) {
            return table(elem);
        }
    },
    'th': {
        markdownable: true,
        process: function(elem) { 
            return "";
        }
    },
    'td': {
        markdownable: true,
        process: function(elem) {
            return "";
        }
    },
    'br': {
        markdownable: true,
        process: function(elem) {
            return process(elem, '    \n', '');
        }
    },
    'img': {
        markdownable: true,
        process: function(elem) {
            return image(elem);
        }
    },
    'sup': {
        markdownable: true,
        process: function(elem) {
            return footnote(elem);
        }
    },
    '_text': {
        markdownable: true,
        process: function(elem) {
            return elem === undefined ? "" : getTextFromNode(elem);
        }
   }
};

/*
 * takes a node and returns all text within it - replaces jquery .text()
 */
function getTextFromNode(elem, allowNewlines, preserveWhitespace) {
    var txt = elem.innerText || elem.textContent;
    txt = txt.trim();
    if (allowNewlines === undefined || !allowNewlines) {
        txt = txt.replace(/\n/g, " ");
    }
    if (preserveWhitespace === undefined || !preserveWhitespace) {
        txt = txt.replace(/\s{2,}/g, ' ');
    }
    
    return txt;
}

/*
 * Check if an element has a given class name
 */
function hasClass(elem, cls) {
    // adapted from http://stackoverflow.com/a/5085587/233608
    return (" " + elem.className + " ").replace(/[\n\t]/g, " ").indexOf(" " + cls + " ") > -1;
}

/* 
 * The basic demarkdown function - takes an element, 
 * wraps it with a prefix and postfix and recursively 
 * calls a demarkdown on the innerHTML
 *
 *   "elem" is a DOM element
 *   "prefix", "postfix" are strings to be appended to the demarkdown
 *
 */
function process(elem, prefix, postfix) {
    return prefix + parseChildren(elem) + postfix;
}

/* 
 * Generates a link tag from a link element
 */
function link(elem) {
    // check if we have a footnote backref
    if (hasClass(elem, "footnote-backref")) return "";

    // otherwise parse the link as usual
    var result = " [";
    result += parseChildren(elem);
    return result + "](" + elem.getAttribute("href") + ") ";
}

/* 
 * Generats an ordered or unordered list from the elements.
 * Uses 'parseChildren' to parse list elements.
 */
function list(elem, type) {
    var count = 1,
        result = "\n",
        children = elem.getElementsByTagName("li");

    for (var i = 0; i < children.length; ++i) {
        // add the list item
        if (type == 'ordered') {
            result += count + ". ";
            count++;
        } else {
            result += "- ";
        }

        // add the child elements
        result += parseChildren(children[i]) + "\n";
    }
    
    return result + "\n";
}

/* 
 * Intelligently parses code blocks - either single tag or larger
 * div > pre > code style blocks, removing syntax highlighting span tags
 * where appropriate whilst maintaining whitespace.
 */
function code(elem) {
    // work out what kind of tag we have
    var tagName = elem.nodeType == 3 ? '_text' : elem.tagName.toLowerCase();
    var result = "";

    // first check if it is just a single "<code>my code</code>" 
    // style code block, or a code block in a <pre> with no span 
    // style formatting
    if (elem.childNodes.length == 1) {
        if (tagName == "code") {
            return " `" + getTextFromNode(elem, true, true) + "` ";
        }
    }

    // otherwise we need to parse the text, stripping all element tags 
    // inside that are used for formatting.  Each line should be indented
    // by four spaces and whitespace should be maintained
    return "\n" + 
                ("    " + getTextFromNode(elem, true, true)).replace(/\n/g, "\n    ") + "\n";
}

/* 
 * Table generator - build up a parser table from the HTML.
 * Colspan and Rowspan not currently supported
 */
function table(elem) {

    /* 
     * Extend string prototype to easily manage table padding
     */
    var repeatStr = function(str, num)
    {
        return new Array(num + 1).join(str);
    }
    
    // store column lengths
    var maxColLen = [],
        rowLen = 0,
        cells = [],
        op = "",
        headerRow = true,
        col = 0,
        rows = elem.getElementsByTagName("tr"),
        children;

    // build up the cell array in memory and track max cell length
    // first traverse each row
    for (var i = 0; i < rows.length; ++i) {
        cells[i] = [];
        col = 0,
        children = rows[i].childNodes;

        // then each cell in each row
        for (var j = 0; j < children.length; ++j) {
            // get the text
            var contents = getTextFromNode(children[j]);
            var contentLen = contents.length;

            // store max length
            if (maxColLen.length <= j) {
                maxColLen.push(contentLen);
            } else {
                if (contentLen > maxColLen[j]) {
                    maxColLen[j] = contentLen;
                }
            }

            // store the contents
            cells[i][j] = parseChildren(children[j]);
        }
    }

    // calculate the row length
    for (var r = 0; r < maxColLen.length; r++) {
        rowLen += maxColLen[r] + 1; // "pipe character column delimiter"
    }

    // now build up the output MD
    for (var r = 0; r < cells.length; r++) {
        // write the cell contents
        var row = cells[r];
        for (var c = 0; c < row.length; c++) {
            var cellLen = row[c].length;
            var padding = maxColLen[c] - cellLen;
            op += row[c] + repeatStr(" ", padding) + "|";
        }
        
        // write the '=' signs under the top row
        if (headerRow) {
            op += "\n";
            for (var i = 0; i < maxColLen.length; i++) {
                op += repeatStr("-", maxColLen[i]) + "|";
            }
            headerRow = false;
        }
        op += "\n";
    }
    return op + "\n";
}

/*
 * Handle creating parser from images
 *   Typical format - ![alt](url "optional title")
 */
function image(elem) {
    var alt = elem.getAttribute("alt");
    var title = elem.getAttribute("title");
    var url = elem.getAttribute("src");
    var op = " ![" + alt + "](" + url;

    if (title != "") {
        op += " \"" + title + "\"";
    }

    return op + ") ";
}

/* 
 * Processes a footnote into parser.  This is READONLY
 * New footnotes cannot be directly created (although you can
 * write the correct footnote code to paragraphs).  This just
 * ensures that footnotes aren't gobbled when demarcate parses
 * the parser from HTML
 */
function footnote(elem) {
    // get the id, should be in the form "fnref:{FootNoteName}"
    var id = elem.id;

    // split out the footnote name
    var fn_name = id.split(":");

    // check we have two components and the first is "fnref"
    if (fn_name.length !== 2 || fn_name[0] !== "fnref") return "";

    // build the footnote tag
    return " [^" + fn_name[1] + "] ";
}

/* 
 * Takes a footnote list (a list of footnote details usually included
 * at the bottom of the document) and builds up a line separated
 * Markdown representation of this list.
 */
function footnoteList(elem) {
    var result = "",
        children = elem.getElementsByTagName("ol"),
        subchildren = [],
        tmp;
        
    for (var i = 0; i < children.length; ++i) {
        tmp = children[i].getElementsByTagName("li");
        
        for (var j = 0; j < tmp.length; ++j) {
            subchildren.push(tmp[j]);
        }               
    }

    // loop through each child li element and build up a 
    // footnote detail section in Markdown
    for (var i = 0; i < subchildren.length; ++i) {
        
        // get the footnote id, checking for errors
        var fn_name = subchildren[i].id.split(":");
        if (fn_name.length !== 2 || fn_name[0] !== "fn") continue;

        // next we build up the tag leader
        result += "[^" + fn_name[1] + "]: ";

        // parse the remainder of the result
        result += parseChildren(subchildren[i]);
        result += "\n";
    }

    return result;
}

/* 
 * parseChildren takes an element and selects the correct
 * processor function from the tagDict to return Markdown
 * from these child dom elements
 *
 *   "elem" is a jQuery DOM element
 */
function parseChildren(elem) {
    // set up a result object
    var result = "",
        children = elem.childNodes;

    // traverse the contents, converting each using its "process"
    // function defined in the tagDict
    for (var i = 0; i < children.length; ++i) {
        // get the tag name
        var node = children[i];
        var node_type = node.nodeType;

                var tagName;

                if (node_type == 3) {
                        tagName = '_text';
                } else {
                        // No tag name, nothing to convert.
                        if(!node.tagName) continue;
                        tagName = node.tagName.toLowerCase();
                }
        
        // if this is not a plain text node perform ssome additional
        // checks such as looking for a TOC, checking if our tag name
        // is specified in the tagDict and if it is allowed to be 
        // returned as Markdown ("markdownable")
        if (tagName != "_text") {
            // do not parse temporary dom elements
            if (hasClass(node, "demarcate_temporary") ||
                node.id == "demarcate_toolbar") {
                continue;
            }

            // check if the element is in the tagDict
            if (!(tagName in tagDict)) continue;

            // check we are allowed to decode the tag
            if ((! tagDict[tagName].markdownable)) continue;

            // check if it is a special tag (i.e. TOC)
            if (tagName == 'div') {
                if (hasClass(node, "toc")) {
                    result += "\n[TOC]\n";
                    continue;
                } else if (hasClass(node, "footnote")) {
                    result += footnoteList(node);
                    continue;
                }
            }
        }

        // process the node and return the result
        result += tagDict[tagName].process(node);
    }

    return result;
}

parse.editor = null;


exports.markdownParser = parse;
},{}]},{},[2]);
