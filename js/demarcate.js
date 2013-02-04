/*************************************************************************
*      DemarcateJS v1.1.4dev is an in-place Markdown editor and decoder  *
*                                                                        *
*      It was written by William Hart (http://www.williamhart.info) to   *
*      run on "textr" (http://to-textr.com/) a new Markdown enabled      *
*      platform to allow writing and sharing of online text              *
*                                                                        *
*                                                                        *
*      This code is provided under a GPLv3 License                       *
*               http://www.gnu.org/licenses/gpl-3.0.html                 *
*      It is also hosted on github:                                      *
*               http://will-hart.github.com/demarcate                    *
*      Contributions welcome!                                            *
*                                                                        *
*************************************************************************/

// global namespace
var demarcate = {};

/*
 * Dictionary of tags to include
 */
var _tag_dict = {
    'div': {
        editable: false, 
        markdownable: true, 
        prefix: '',
        postfix: '',
        post_newline: false,
        childprefix: '',
        allow_newline: false,
        force_prefix: false,
        selector_type: ' > '
    },
    'span': {
        editable: false,
        markdownable: true,
        prefix: '',
        postfix: '',
        post_newline: false,
        childprefix: '',
        allow_newline: false,
        force_prefix: false,
        selector_type: ' > '
    },
    'h1': {
        editable: true, 
        markdownable: true, 
        prefix: '# ', 
        postfix: '\n', 
        post_newline: true, 
        childprefix: '', 
        allow_newline: false, 
        force_prefix: false, 
        selector_type: ' > '
    },
    'h2': {
        editable: true, 
        markdownable: true, 
        prefix: '## ', 
        postfix: '\n', 
        post_newline: true, 
        childprefix: '', 
        allow_newline: false, 
        force_prefix: false, 
        selector_type: ' > '},
    'h3': {
        editable: true, 
        markdownable: true, 
        prefix: '### ', 
        postfix: '\n', 
        post_newline: true, 
        childprefix: '', 
        allow_newline: false, 
        force_prefix: false, 
        selector_type: ' > '
    },
    'h4': {
        editable: true,
        markdownable: true,
        prefix: '#### ',
        postfix: '\n',
        post_newline: true,
        childprefix: '',
        allow_newline: false,
        force_prefix: false,
        selector_type: ' > '
    },
    'h5': {
        editable: true,
        markdownable: true,
        prefix: '##### ',
        postfix: '\n',
        post_newline: true,
        childprefix: '',
        allow_newline: false,
        force_prefix: false,
        selector_type: ' > '
    },
    'h6': {
        editable: true,
        markdownable: true,
        prefix: '###### ',
        postfix: '\n',
        post_newline: true,
        childprefix: '',
        allow_newline: false,
        force_prefix: false,
        selector_type: ' > '
    },
    'li': {
        editable: true,
        markdownable: true,
        prefix: '- ',
        postfix: '\n',
        post_newline: false,
        childprefix: '',
        allow_newline: false,
        force_prefix: true ,
        selector_type: ' > '
    },
    'ul': {
        editable: true,
        markdownable: true,
        prefix: '',
        postfix: '\n',
        post_newline: true,
        childprefix: '',
        allow_newline: true,
        force_prefix: false,
        selector_type: ' > '
    },
    'ol': {
        editable: true,
        markdownable: true,
        prefix: '',
        postfix: '\n',
        post_newline: true,
        childprefix: '',
        allow_newline: true,
        force_prefix: false,
        selector_type: ' > '
    },
    'blockquote': {
        editable: true,
        markdownable: true,
        prefix: '>',
        postfix: '\n',
        post_newline: true,
        childprefix: '',
        allow_newline: false,
        force_prefix: false,
        selector_type: ' > '
    },
    'pre': {
        editable: true,
        markdownable: true,
        prefix: '    ',
        postfix: '\n',
        post_newline: true,
        childprefix: '    ',
        allow_newline: true,
        force_prefix: false,
        selector_type: ' > '
    },
    'code': {
        editable: true,
        markdownable: true,
        prefix: ' `',
        postfix: '` ',
        post_newline: false,
        childprefix: '',
        allow_newline: false,
        force_prefix: true ,
        selector_type: ' > '
    },
    'a': {
        editable: false,
        markdownable: true,
        prefix: ' [',
        postfix: ']',
        post_newline: false,
        childprefix: '',
        allow_newline: false,
        force_prefix: true ,
        selector_type: ' > '
    },
    'hr': {
        editable: true,
        markdownable: true,
        prefix: '------',
        postfix: '\n',
        post_newline: true,
        childprefix: '',
        allow_newline: false,
        force_prefix: true ,
        selector_type: ' > '
    },
    'em': {
        editable: false,
        markdownable: true,
        prefix: ' *',
        postfix: '* ',
        post_newline: false,
        childprefix: '',
        allow_newline: false,
        force_prefix: true ,
        selector_type: ' > '
    },
    'strong': {
        editable: false,
        markdownable: true,
        prefix: ' **',
        postfix: '** ',
        post_newline: false,
        childprefix: '',
        allow_newline: false,
        force_prefix: true ,
        selector_type: ' > '
    },
    'p': {
        editable: true,
        markdownable: true,
        prefix: '',
        postfix: '\n',
        post_newline: true,
        childprefix: '',
        allow_newline: false,
        force_prefix: false,
        selector_type: ' > '
    },
    'table': {
        editable: false,
        markdownable: true,
        prefix: '',
        postfix: '\n',
        post_newline: true,
        childprefix: '',
        allow_newline: false,
        force_prefix: false,
        selector_type: ' > '
    },
    'th': {
        editable: true,
        markdownable: true, 
        prefix: '',
        postfix: '',
        post_newline: false,
        childprefix: '',
        allow_newline: false,
        force_prefix: false,
        selector_type: ' '
    },
    'td': {
        editable: true,  
        markdownable: true, 
        prefix: '',       
        postfix: '',    
        post_newline: false, 
        childprefix: '',     
        allow_newline: false, 
        force_prefix: false, 
        selector_type: ' '  
    },
    'br': {
        editable: false, 
        markdownable: true, 
        prefix: '    \n', 
        postfix: '',    
        post_newline: false, 
        childprefix: '',     
        allow_newline: false, 
        force_prefix: true,  
        selector_type: ' '
    },
    'img': {
        editable: false,
        markdownable: true, 
        prefix: '', 
        postfix: '', 
        post_newline: false, 
        childprefix: '',     
        allow_newline: false, 
        force_prefix: true,  
        selector_type: ' '  },
    '_text': {
        editable: false, 
        markdownable: true, 
        prefix: '', 
        postfix: '', 
       post_newline: false, 
       childprefix: '', 
       allow_newline: false, 
       force_prefix: false, 
       selector_type: ' '
   },
};

/* 
 * Enables a given dom element and its children for editing using demarcate
 */
demarcate.enable = function(elem) {

    // disable the previous editor if required
    if (demarcate.dom_root != null) {
        demarcate.disable(demarcate.dom_root);
    }
    demarcate.dom_root = elem;

    // save access to the editor and element
    if (demarcate.current_editor != null) {
        demarcate.close_editor();
    }
    demarcate.current_editor = null;
    demarcate.current_element = null;

    /*
     * Maps an editor keypress to a specific action
     */
    var mapKeyPress = function(e) {
        if (e.keyCode == 13) { // enter  >>  save, save and add or newline
            e.preventDefault();
            if (e.shiftKey) { // shift key held - save and exit
                demarcate.close_editor();
            } else if (e.ctrlKey) { // ctrl key held - save and create new
                demarcate.close_editor(true, true);
            } else { // new line if editing elem allows newlines, otherwise save and new
                if (_tag_dict[demarcate.current_element.get(0).tagName.toLowerCase()].allow_newline) {
                    demarcate.current_editor.insertAtCaret("\n");
                } else {
                    demarcate.close_editor(true, true);
                }
            }

        } else if (e.keyCode == 32) { // ctrl+space  >>  cycle element types
            // check for control space
            if (e.ctrlKey) {
                e.preventDefault();
                var next_style = $("div#demarcate_toolbar a.active").next().filter(".demarcate_style");
                if (next_style.length != 0) { // escape  >>  cancel editing
                    next_style.click();
                } else {
                    $("div#demarcate_toolbar a.demarcate_style").first().click();
                }
            }

        } else if (e.keyCode == 27) { //escape
            e.preventDefault();
            demarcate.close_editor(false);

        } else if (e.keyCode == 9) { // tab - add four spaces
            e.preventDefault();
            demarcate.current_editor.insertAtCaret("    ");

        } else if (e.keyCode == 40) { // down arrow - navigate to the next editable area
            if (e.altKey) {
                var next = $("#demarcate_toolbar").next(".demarcate_editable");
                if (next.length > 0) {
                    demarcate.close_editor();
                    next.first().click();
                }
            } else if (e.ctrlKey) { // ctrl+up move the block up
                $("#demarcate_up").click();
            }

        } else if (e.keyCode == 38) { // up arrow - navigate to the next editable area
            if (e.altKey) {
                var previous = demarcate.current_element.prev(".demarcate_editable");
                if (previous.length > 0) {
                    demarcate.close_editor();
                    previous.first().click();
                }
            } else if (e.ctrlKey) { // ctrl+down move the block down
                $("#demarcate_down").click();
            }
        }
    };

    /*
     * Replaces the element with the new type
     */
    var replaceTag = function (id) {
        var new_elem = $("<" + id + "/>");
        demarcate.current_element.after(new_elem);
        demarcate.current_element.remove();
        demarcate.current_element = new_elem;

        // currently cannot 'cancel' once the tag has changed 
        // therefore lets hide the cancel button
        $("a#demarcate_cancel").fadeOut('fast',function() { this.remove(); });

        // update the editor css
        demarcate.current_editor.css("font", demarcate.current_element.css("font"))
                .css("lineHeight", elem.css("lineHeight"))
                .css("margin", demarcate.current_element.css("margin"))
                .css("textAlign", demarcate.current_element.css("textAlign"));

        // hook up jquery.autosize.js if present
        if (typeof demarcate.current_editor != undefined) {
            demarcate.current_editor.autosize({'append': '\n'});
        }

        // set the current button classes and focus back on the editor
        demarcate.toolbarSetActive();
        demarcate.current_editor.focus();
    }

    /* 
     * Connect all the demarcate_toolbar button events
     */
    var enableDemarcateToolbarHandlers = function () {

        // handle hitting the return key inside the editor - saves it
        $(document).on('keydown', '#demarcate', mapKeyPress);

        // handle clicking outside the div
        $(document).bind('mousedown', demarcate.clickElsewhereSave);

        // cancel button
        $(document).on('click', '#demarcate_cancel', function(e) {
            e.preventDefault();
            demarcate.close_editor(false);
            $(document).trigger('demarcate_editor_closed', [demarcate.current_element]);
        });

        // save button
        $(document).on('click', '#demarcate_save', function(e) {
            demarcate.close_editor();
        });

        // hover events for toolbars
        $(document).on('mouseover', '.demarcate_style', function(e) {
            var bg_pos = $(e.target).css('backgroundPosition').split(' ');
            $(e.target).css('backgroundPosition', bg_pos[0] + " " + (parseInt(bg_pos[1]) - 72)+ "px") ;
        });

        // hover events for toolbars
        $(document).on('mouseout', '.demarcate_style', function(e) {
            var bg_pos = $(e.target).css('backgroundPosition').split(' ');
            $(e.target).css('backgroundPosition', bg_pos[0] + " " + (parseInt(bg_pos[1]) + 72) + "px");
        });

        // handle clicking of style selection buttons
        $(document).on('click', '.demarcate_style', function(e) {
            e.preventDefault();
            var target_tag = $(this).attr('id').replace("demarcate_", "");

            // check this is an allowable tag
            if (target_tag in _tag_dict) {
                // handle lists
                var current_tag = demarcate.current_element.get(0).tagName.toLowerCase();
                var parent_tag = demarcate.current_element.parent().get(0).tagName.toLowerCase();

                if (current_tag == 'li' && target_tag != 'ul') {
                    // moving a list item out of a list
                    par = demarcate.current_element.parent();
                    demarcate.current_element.detach().insertAfter(par);
                    replaceTag(target_tag);

                } else if (current_tag != 'li' && target_tag == 'ul') {
                    var list = $("<" + target_tag + "/>");
                    list.insertBefore(demarcate.current_element);
                    demarcate.current_element.appendTo(list);
                    replaceTag('li');
                } else {
                    replaceTag(target_tag);
                }
            } else {
                if (target_tag == 'help') {
                    alert(
                        "SHIFT+ENTER - save your changes\nESCAPE - cancel your changes\n" + 
                        "CTRL+ENTER - save your changes, insert a new section\n" + 
                        "ENTER - save your changes (or add new line in a code block)\n" + 
                        "ALT+UP/DOWN - navigate up and down through elemnts"
                    );
                }
            }
        });

        // handle clicking "move down" button
        $(document).on('click', '#demarcate_down', function(e) {
            e.preventDefault();
            var next = $("#demarcate_toolbar").next(".demarcate_editable");
            if (next.length > 0) {
                next.insertBefore(demarcate.current_element);
            }
            demarcate.current_editor.focus();
        });

        // handle clicking "move up" button
        $(document).on('click', '#demarcate_up', function(e) {
            e.preventDefault();
            var previous = demarcate.current_element.prev(".demarcate_editable");
            if (previous.length > 0) {
                previous.insertAfter($("#demarcate_toolbar"));
            }
            demarcate.current_editor.focus();
        });
    };

    // finally add permanent event handlers for clicking editable elements
    var elem_id = elem.attr('id');
    for (var tag_name in _tag_dict) {
        if (_tag_dict[tag_name].editable) {
            live_selector = "#" + elem_id + 
                    _tag_dict[tag_name].selector_type + tag_name;

            $(document).on('click', live_selector, function(e) {
                // avoid trying to edit toolbar items
                if ($("#demarcate_toolbar").has(e.target).length > 0 ||
                        $("#demarcate_toolbar").is(e.target) ||
                        $(elem).attr('id') === 'demarcate') {

                    return;
                }

                // display an editor
                demarcate.edit($(this));
            });

            $(live_selector).addClass("demarcate_editable");

            // add a DOMNodeInserted event - not supported in all browsers
            // deprecated in some!
            // TODO: Why not just do this in the "save / add new" functions???
            $(document).on('DOMNodeInserted', live_selector, function(e) {
                $(e.target).addClass("demarcate_editable");
            });
        }
    }

    // set up the editor
    enableDemarcateToolbarHandlers();
    demarcate.addEditPlaceholder();
    elem.trigger("demarcate_editor_enabled");
};


/*
 * Disconnects all demarcate event handlers from the given element
 * to allow toggling of editing functionality
 */
demarcate.disable = function () {

    // Clear out the element tags
    if (demarcate.current_editor != null) {
        demarcate.close_editor();
    }
    demarcate.current_editor = null;
    demarcate.current_element = null;
    
    // unbind event handlers
    $(document).off('keydown', '#demarcate');
    $(document).unbind('mousedown', demarcate.clickElsewhereSave);
    $(document).off('click', '#demarcate_cancel');
    $(document).off('click', '#demarcate_save');
    $(document).off('mouseover', '.demarcate_style');
    $(document).off('mouseout', '.demarcate_style');
    $(document).off('click', '.demarcate_style');
    $(document).off('click', '#demarcate_down');
    $(document).off('click', '#demarcate_up');

    // unbind all 'edit' click events
    var elem_id = demarcate.dom_root.attr("id");
    for (var tag_name in _tag_dict) {
        if (_tag_dict[tag_name].editable) {
            var selector = "#" + elem_id + _tag_dict[tag_name].selector_type + tag_name;
            $(document).off('click', selector);
        }
    }

    // remove editable classes
    $(".demarcate_editable").removeClass("demarcate_editable");

    // remove any temporary elements
    $(".demarcate_temporary").remove();

    // clear the DOM element
    demarcate.dom_root = null;
};


/*
 * Returns Markdown from the html of a given element
 */
demarcate.demarcate = function (elem, ignore_extras, child_prefix) {

    /* 
     * Extend string prototype to easily manage table padding
     */
    var repeatStr = function(str, num)
    {
        return new Array(num + 1).join(str);
    }

    /* 
     * Table generator - build up a markdown table from the HTML.
     * Colspan and Rowspan not currently supported
     */
    var demarkdownTable = function (elem) {

        // store column lengths
        var maxColLen = [];
        var rowLen = 0;
        var cells = [];
        var op = "";
        var headerRow = true;
        var col = 0;
        var row = 0;

        // build up the cell array in memory and track max cell length
        // first traverse each row
        elem.find("tr").each( function() {
            cells[row] = [];
            col = 0;

            // then each cell in each row
            $(this).children().each( function() {
                // get the text
                var contents = $(this).text();
                var contentLen = contents.length;

                // store max length
                if (maxColLen.length <= col) {
                    maxColLen.push(contentLen);
                } else {
                    if (contentLen > maxColLen[col]) {
                        maxColLen[col] = contentLen;
                    }
                }

                // store the contents
                cells[row][col] = demarkdown($(this));

                col++;
            });
            row++;
        });

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
        return op + "\n\n";
    }

    /*
     * Handle creating markdown from images
     *   Typical format - ![alt](url "optional title")
     */
    var demarkdownImage = function(elem) {
        var alt = elem.attr("alt");
        var title = elem.attr("title");
        var url = elem.attr("src");
        var op = " ![" + alt + "](" + url;

        if (title != "") {
            op += " \"" + title + "\"";
        }

        return op + ") ";
    }

    /*
     * Recursively reverse the md
     markdown of the element
     * and its child objects
     */
    var demarkdown = function (elem, ignore_extras, child_prefix) {

        // work out what we are looking at
        var node = elem.get(0);
        var node_type = node.nodeType;
        var tag_name = node_type == 3 ? '_text' : node.tagName.toLowerCase();
        var result = "";

        // do not parse temporary dom elements
        if (elem.hasClass("demarcate_temporary")) return result;

        // check if the element is in the _tag_dict
        if (!(tag_name in _tag_dict)) return result;

        // check we are allowed to decode the tag
        if ((! _tag_dict[tag_name].markdownable) && node_type != 3) {
            return result;
        }

        // check if it is a special tag (i.e. TOC)
        if (tag_name == 'div' && elem.hasClass("toc")) {
            return "\n[TOC]\n\n";
        } else if ( tag_name == 'table' ) {
            return demarkdownTable(elem);
        } else if ( tag_name == 'img' ) {
            return demarkdownImage(elem);
        }

        // open the tag
        if (! ignore_extras || _tag_dict[tag_name].force_prefix) {
            result += _tag_dict[tag_name].prefix;
        }

        // add any text inside text nodes
        if (node_type == 3) {
            if ($.trim(node.nodeValue) == "") {
                return "";
            }
            result += $.trim(node.nodeValue);
        }

        // add child elements
        result += _tag_dict[tag_name].childprefix;
        $.each(elem.contents(), function(index, value) {
            result += demarkdown($(value), ignore_extras, "");
        });

        // close the tag
        if (! ignore_extras || _tag_dict[tag_name].force_prefix) {
            result += _tag_dict[tag_name].postfix;
        }

        // apply a new line if required
        if (_tag_dict[tag_name].post_newline) {
            result += '\n';
        }

        // apply special behaviour for <a> tags
        if (tag_name == 'a') {
            result = " " + result + "(" + elem.attr('href') + ") ";
        }

        // return the result
        return result;
    }
    
    if (elem === undefined) {
        elem = demarcate.dom_root;
    }
    return demarkdown(elem, ignore_extras, child_prefix);
};


/*
 * Opens the demarcate editor on the given element
 */
demarcate.edit = function(elem) {

    /* 
     * generate a toolbar for setting the type of node
     * and saving or cancelling the results
     */
    var generateToolbar = function () {
        var toolbar = $("<div />", {id: 'demarcate_toolbar'});
        toolbar.append($("<a />",  {id: 'demarcate_h1',         class: 'demarcate_style', href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_h2',         class: 'demarcate_style', href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_h3',         class: 'demarcate_style', href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_h4',         class: 'demarcate_style', href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_h5',         class: 'demarcate_style', href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_h6',         class: 'demarcate_style', href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_p',          class: 'demarcate_style', href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_code',       class: 'demarcate_style', href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_pre',        class: 'demarcate_style', href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_blockquote', class: 'demarcate_style', href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_ul',         class: 'demarcate_style', href:"#" }));
        toolbar.append($("<p/>"));
        toolbar.append($("<a />",  {id: 'demarcate_up',         class: 'demarcate_style', href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_down',       class: 'demarcate_style', href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_help',       class: 'demarcate_style', href:"#" }));
        toolbar.append($("<p/>"));
        toolbar.append($("<a />",  {id: 'demarcate_cancel',                               href:"#" }));
        toolbar.append($("<a />",  {id: 'demarcate_save',                                 href:"#" }));
        return toolbar;
    }

    /* 
     * Display an editor textarea
     */
    var display_editor = function (elem) {

        // Check if we have a current editor - if yes, exit
        if (demarcate.current_editor != null) {
            return;
        }

        elem = $(elem);
        var tag_name = elem.get(0).tagName.toLowerCase();

        // double check we are allowed to edit this
        if (tag_name in _tag_dict) {

            // create the new text editor - ignore front matter
            var md = demarcate.demarcate(elem, true, "");
            var ed = $("<textarea />", {
                id: 'demarcate'
            }).css("font", elem.css("font"))
                .css("outline", "none")
                .css("margin", elem.css("margin"))
                .css("lineHeight", elem.css("lineHeight"))
                .css("textAlign", elem.css("textAlign"));
            var tb = generateToolbar();

            elem.after(tb).slideDown();
            elem.after(ed).slideDown();
            elem.addClass("demarcate_hide");

            // store the element currently being edited
            demarcate.current_element = elem;
            demarcate.current_editor = ed;

            // insert the markdown into the editor and focus 
            // on the last character. Set toolbar buttons to active
            demarcate.toolbarSetActive();

            // set the value of the textarea
            ed.val($.trim(md));

            // hook up jquery.autosize.js if present
            if (typeof elem.autosize != undefined) {
                ed.autosize({'append': '\n'});
            }
            ed.focus();
            
            // scroll the top of the editor to the middle of the screen
            $("html, body").scrollTop(demarcate.current_editor.offset().top);
        }
    }

    display_editor(elem);
};


/* 
 * Closes the demarcate editor
 */
demarcate.close_editor = function(save_changes, open_new) {

    // save changes by default
    if (save_changes === undefined || save_changes === null) {
        save_changes = true;
    }

    // do not open a new editor by default
    if (open_new === undefined || open_new === null) {
        open_new = false;
    }

    /*
     * Performs a number of manipulations on the edited string before adding 
     * it back into the DOM.  For instance:
     *   - Strips html tags from the textareas to prevent injection
     *   - Restores links from []() syntax to <a></a> syntax
     */
    var modifyHtml = function (str){
        // remove HTML tags
        var strippedText = $("<div/>").html(str).text();

        // convert using showdown
        var convertor = new Showdown.converter();
        var op = convertor.makeHtml(strippedText);
        return op;
    }

    /* 
     * Replaces the element being edited with a new element composed
     * of the relevant tag type and inner contents from the textarea
     * rendered by showdown to HTML
     */
    var doSave = function () { 
        
        // get the current editor and wrap in the correct outer tag
        var tag_name = demarcate.current_element.get(0).tagName.toLowerCase();
        var curr_value = demarcate.current_editor.val(); 

        if (curr_value != "") {
            if (tag_name != "hr") {
                curr_value = _tag_dict[tag_name].prefix + _tag_dict[tag_name].childprefix +
                        curr_value + _tag_dict[tag_name].postfix;
            }
        }

        var new_elem = $(modifyHtml(curr_value));

        // update the html element and save a reference to the new elem
        if (tag_name == "th" || tag_name == "td") {
            demarcate.current_element.html(new_elem.html());
        } else {
            new_elem.insertBefore(demarcate.current_element);
            demarcate.current_element.remove();
            demarcate.current_element = new_elem;
        }
    }

    /* 
     * Hides the editor textarea and restores the hidden div
     */
    var hideEditor = function () {

        // remove the toolbar and editor
        $("div#demarcate_toolbar").remove();
        demarcate.current_editor.remove();
        demarcate.current_editor = null;

        // prune empty elements
        if (demarcate.current_element.html() === "" && 
                demarcate.current_element.get(0).tagName != "HR") {
            demarcate.current_element.remove();
        } else {
            demarcate.current_element.removeClass("demarcate_hide");
        }
        demarcate.current_element = null;

        // prune any unsaved temporary elements. The save method 
        // removes this class to prevent new elements from being 
        // removed.
        $(".demarcate_temporary").remove();
        demarcate.addEditPlaceholder();
    }

    /* 
     * Find the next editable table cell in a table and returns it
     */
    var getNextTableCell = function (elem) {
        var next_td = elem.nextAll("td, th");
        if (next_td.length == 0) {
            var next_tr = elem.parent("tr").nextAll("tr");
            if (next_tr.length == 0) {
                return null;
            } else {
                return next_tr.find("th, td").first();
            }
        }
        return next_td;
    }

    /* 
     * Saves an existing editor area and creates a new one of the same type
     * immediately below it
     */
    var createNewEditor = function () {
        // create another element of the same type after this one
        var tag_name = demarcate.current_element.get(0).tagName.toLowerCase();
        var new_elem = null;

        // handle table rows differently
        if (tag_name == "td" || tag_name == "th") {
            new_elem = getNextTableCell(demarcate.current_element);

        } else {
            new_elem = $("<" + tag_name + "/>");
            new_elem.insertAfter(demarcate.current_element);
        }

        // force a save on the previous element
        doSave();
        hideEditor();
        $(".demarcate_temporary").remove();

        // add the class after saving to prevent it being immediately pruned
        if (tag_name != "td" && tag_name != "th") {
            new_elem.addClass("demarcate_temporary");
        }

        if (new_elem !== null) {
            new_elem.click();
        }
    }

    /*
     * Handle the various types of saving:
     *    --> CANCEL meaning no changes are saved
     *    --> SAVE AND NEW meaning changes are saved and a new editor is opened
     *    --> SAVE meaning changes are saved and all editors are closed
    */
    if (save_changes) {
        if (open_new) {
            createNewEditor();
        } else {
            doSave();
            hideEditor();
        }
    } else {
        hideEditor()
    }

    // raise an event so markdown can be pushed back to server if required
    $(document).trigger('demarcate_editor_closed', [demarcate.current_element]);
};


/* 
 * Ensures users always have a "click me to edit" box 
 * at the end of the demarate editable region
 */
demarcate.addEditPlaceholder = function () {
    demarcate.dom_root.append(
        $('<p />', {
                class: 'demarcate_temporary',
                text: 'Click to add a new block'
        })
    );
};


/* 
 * Sets an 'active' class for the toolbar item that matches the 
 * current editing class
 */
demarcate.toolbarSetActive = function () {
    var tag_name = "";

    // get the type of tag we are editing
    if (demarcate.current_element == null) {
        return;
    } else {
        tag_name = demarcate.current_element.get(0).tagName.toLowerCase();
    }

    // remove old active tags
    $(".demarcate_style").removeClass("active");

    // apply new active tags
    $("#demarcate_" + tag_name).addClass("active");
};


/*
 * Returns 'true' if the a demarcate editor is currently
 * enabled and false otherwise
 */
demarcate.isEnabled = function() {
    return !(demarcate.dom_root === null);
}


/* 
 * Returns true if demarcate is currently editing a block
 * and false otherwise
 */
demarcate.isActive = function() { 
    return !(demarcate.current_element === null);
}

/* 
 * A mouseup handler that checks if the toolbar or editor was clicked.
 * If not, it hides the editor.  
 */
demarcate.clickElsewhereSave = function (e) {
    if (demarcate.current_editor == null) return;
    var tb = $("#demarcate_toolbar");
    if (!demarcate.current_editor.is(e.target) && 
            !tb.is(e.target) && 
            tb.has(e.target).length === 0) {
        demarcate.close_editor();
    }
};

/* 
 * a jquery extension for textrarea elements which inserts some
 * text at the caret position.
 */
(function( $ ) {
    $.fn.insertAtCaret = function(my_value) {

        // get the selection parameters
        var orig_val = this.val().replace(/\r\n/g, "\n");
        var start_repl = this.get(0).selectionStart;
        var end_repl = this.get(0).selectionEnd;

        // cut up the substring
        var new_val = orig_val.substring(0, start_repl) + my_value + orig_val.substring(end_repl);

        // set the new value
        this.val(new_val.replace(/\n/g, "\r\n"));
    }
})(jQuery);

/*************************************
 *************************************
 * jQuery hooks into demarcate 
 * Also allows backwards compatibility
 * (with version <= 1.1.2)
 *************************************
 ************************************/
/*
 * Hook up the 'demarcate' function as a jQuery plugin
 */
(function ( $ ) {
    $.fn.demarcate = function() {
        return demarcate.demarcate(this);
    };
})(jQuery);

/*
 * Hook up the "enable" as an enable_demarcate function
 */
(function ( $ ) {
    $.fn.enable_demarcate = function() {
        demarcate.enable(this);
    }
})(jQuery);

/*
 * Hook up the "disable" as a disable_demarcate function
 */
(function ( $ ) {
    $.fn.disable_demarcate = function() {
        demarcate.disable();
    }
})(jQuery);
