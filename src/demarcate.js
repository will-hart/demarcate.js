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