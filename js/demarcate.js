/*************************************************************************
*      DemarcateJS v1.1.2dev is an in-place Markdown editor and decoder  *
*                                                                        *
*      It was written by William Hart (http://www.williamhart.info) to   *
*      run on "textr" (http://to-textr.com/) a new Markdown enabled      *
*      platform to allow writing and sharing of online text              *
*                                                                        *
*                                                                        *
*      This code is provided under a GPLv3 License                       *
*               http://www.gnu.org/licenses/gpl-3.0.html                 *
*      It is also hosted at github:                                      *
*               http://will-hart.github.com/demarcate                    *
*      Contributions welcome.                                            *
*                                                                        *
*************************************************************************/

/* 
 * Extend string prototype to easily manage table padding
 */
String.prototype.repeat = function(num)
{
    return new Array(num + 1).join(this);
}

/*
 * Whitelist of tags to include
 */
var tag_dict = {
    'div':        {editable: false, markdownable: true, prefix: '',       postfix: '',    post_newline: false, childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' > '},
    'span':       {editable: false, markdownable: true, prefix: '',       postfix: '',    post_newline: false, childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' > '},
    'h1':         {editable: true,  markdownable: true, prefix: '# ',     postfix: '\n',  post_newline: true,  childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' > '},
    'h2':         {editable: true,  markdownable: true, prefix: '## ',    postfix: '\n',  post_newline: true,  childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' > '},
    'h3':         {editable: true,  markdownable: true, prefix: '### ',   postfix: '\n',  post_newline: true,  childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' > '},
    'h4':         {editable: true,  markdownable: true, prefix: '#### ',  postfix: '\n',  post_newline: true,  childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' > '},
    'h5':         {editable: true,  markdownable: true, prefix: '##### ', postfix: '\n',  post_newline: true,  childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' > '},
    'h6':         {editable: true,  markdownable: true, prefix: '###### ',postfix: '\n',  post_newline: true,  childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' > '},
    'li':         {editable: true,  markdownable: true, prefix: '- ',     postfix: '\n',  post_newline: false, childprefix: '',     allow_newline: false, force_prefix: true , selector_type: ' > '},
    'ul':         {editable: true,  markdownable: true, prefix: '',       postfix: '\n',  post_newline: true,  childprefix: '',     allow_newline: true,  force_prefix: false, selector_type: ' > '},
    'ol':         {editable: true,  markdownable: true, prefix: '',       postfix: '\n',  post_newline: true,  childprefix: '',     allow_newline: true,  force_prefix: false, selector_type: ' > '},
    'blockquote': {editable: true,  markdownable: true, prefix: '>',      postfix: '\n',  post_newline: true,  childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' > '},
    'pre':        {editable: true,  markdownable: true, prefix: '    ',   postfix: '\n',  post_newline: true,  childprefix: '    ', allow_newline: true , force_prefix: false, selector_type: ' > '},
    'code':       {editable: true,  markdownable: true, prefix: ' `',     postfix: '` ',  post_newline: false, childprefix: '',     allow_newline: false, force_prefix: true , selector_type: ' > '},
    'a':          {editable: false, markdownable: true, prefix: ' [',     postfix: ']',   post_newline: false, childprefix: '',     allow_newline: false, force_prefix: true , selector_type: ' > '},
    'hr':         {editable: true,  markdownable: true, prefix: '------', postfix: '\n',  post_newline: true,  childprefix: '',     allow_newline: false, force_prefix: true , selector_type: ' > '},
    'em':         {editable: false, markdownable: true, prefix: ' *',     postfix: '* ',  post_newline: false, childprefix: '',     allow_newline: false, force_prefix: true , selector_type: ' > '},
    'strong':     {editable: false, markdownable: true, prefix: ' **',    postfix: '** ', post_newline: false, childprefix: '',     allow_newline: false, force_prefix: true , selector_type: ' > '},
    'p':          {editable: true,  markdownable: true, prefix: '',       postfix: '\n',  post_newline: true,  childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' > '},
    'table':      {editable: false, markdownable: true, prefix: '',       postfix: '\n',  post_newline: true,  childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' > '},
    'th':         {editable: false, markdownable: true, prefix: '',       postfix: '',    post_newline: false, childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' '  },
    'td':         {editable: false, markdownable: true, prefix: '',       postfix: '',    post_newline: false, childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' '  },
    '_text':      {editable: false, markdownable: true, prefix: '',       postfix: '',    post_newline: false, childprefix: '',     allow_newline: false, force_prefix: false, selector_type: ' '   },
};

/*
 * Performs a number of manipulations on the edited string before adding 
 * it back into the DOM.  For instance:
 *   - Strips html tags from the textareas to prevent injection
 *   - Restores links from []() syntax to <a></a> syntax
 */
function modifyHtml(str){
    // remove HTML tags
    var strippedText = $("<div/>").html(str).text();

    // convert using showdown
    var convertor = new Showdown.converter();
    var op = convertor.makeHtml(strippedText);
    return op;
}

/* 
 * Table generator - build up a markdown table from the HTML.
 * Colspan and Rowspan not currently supported
 */
function demarkdown_table(elem) {

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
            op += row[c] + " ".repeat(padding) + "|";
        }
        
        // write the '=' signs under the top row
        if (headerRow) {
            op += "\n";
            for (var i = 0; i < maxColLen.length; i++) {
                op += "-".repeat(maxColLen[i]) + "|";
            }
            headerRow = false;
        }
        op += "\n";
    }
    return op + "\n\n";
}

/*
 * Recursively reverse the md
 markdown of the element
 * and its child objects
 */
function demarkdown(elem, ignore_extras, child_prefix) {

    // work out what we are looking at
    var node = elem.get(0);
    var node_type = node.nodeType;
    var tag_name = node_type == 3 ? '_text' : node.tagName.toLowerCase();
    var result = "";

    // do not parse temporary dom elements
    if (elem.hasClass("demarcate_temporary")) return result;

    // check if the element is in the tag_dict
    if (!(tag_name in tag_dict)) return result;

    // check we are allowed to decode the tag
    if ((! tag_dict[tag_name].markdownable) && node_type != 3) {
        return result;
    }

    // check if it is a special tag (i.e. TOC)
    if (tag_name == 'div' && elem.hasClass("toc")) {
        return "\n[TOC]\n\n";
    } else if ( tag_name == 'table' ) {
        return demarkdown_table(elem);
    }

    // open the tag
    if (! ignore_extras || tag_dict[tag_name].force_prefix) {
        result += tag_dict[tag_name].prefix;
    }

    // add any text inside text nodes
    if (node_type == 3) {
        if ($.trim(node.nodeValue) == "") {
            return "";
        }
        result += $.trim(node.nodeValue);
    }

    // add child elements
    result += tag_dict[tag_name].childprefix;
    $.each(elem.contents(), function(index, value) {
        result += demarkdown($(value), ignore_extras, "");
    });

    // close the tag
    if (! ignore_extras || tag_dict[tag_name].force_prefix) {
        result += tag_dict[tag_name].postfix;
    }

    // apply a new line if required
    if (tag_dict[tag_name].post_newline) {
        result += '\n';
    }

    // apply special behaviour for <a> tags
    if (tag_name == 'a') {
        result = " " + result + "(" + elem.attr('href') + ") ";
    }

    // return the result
    return result;
}

/* 
 * generate a toolbar for setting the type of node
 * and saving or cancelling the results
 */
function generate_toolbar() {
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
 * Sets an 'active' class for the toolbar item that matches the 
 * current editing class
 */
function toolbar_set_active() {
    var tag_name = "";

    // get the type of tag we are editing
    if (current_demarcate_element == null) {
        return;
    } else {
        tag_name = current_demarcate_element.get(0).tagName.toLowerCase();
    }

    // remove old active tags
    $(".demarcate_style").removeClass("active");

    // apply new active tags
    $("#demarcate_" + tag_name).addClass("active");
}

/* 
 * Display an editor textarea
 */
function display_editor(elem) {

    // Check if we have a current editor - if yes, exit
    if (current_demarcate_editor != null) {
        return;
    }

    elem = $(elem);
    var tag_name = elem.get(0).tagName.toLowerCase();

    // double check we are allowed to edit this
    if (tag_name in tag_dict) {

        // create the new text editor - ignore front matter
        var md = demarkdown(elem, true, "");
        var ed = $("<textarea />", {
            id: 'demarcate'
        }).css("font", elem.css("font"))
            .css("outline", "none")
            .css("border", elem.css("border"))
            .css("margin", elem.css("margin"))
            .css("textAlign", elem.css("textAlign"));
        var tb = generate_toolbar();

        elem.after(tb).slideDown();
        elem.after(ed).slideDown();
        elem.addClass("demarcate_hide");

        // store the element currently being edited
        current_demarcate_element = elem;
        current_demarcate_editor = ed;

        // insert the markdown into the editor and focus 
        // on the last character. Set toolbar buttons to active
        toolbar_set_active();

        // set the value of the textarea
        ed.val($.trim(md));

        // hook up jquery.autosize.js if present
        if (typeof elem.autosize != undefined) {
            ed.autosize({'append': '\n'});
        }
        ed.focus();
    }
}

/* 
 * Hides the editor textarea and restores the hidden div
 */
function hide_editor(e) {
    e.preventDefault();

    // remove the toolbar and editor
    $("div#demarcate_toolbar").remove();
    current_demarcate_editor.remove();
    current_demarcate_editor = null;

    // prune empty elements
    if (current_demarcate_element.html() === "" && 
            current_demarcate_element.get(0).tagName != "HR") {
        current_demarcate_element.remove();
    } else {
        current_demarcate_element.removeClass("demarcate_hide");
    }
    current_demarcate_element = null;

    // prune any unsaved temporary elements. The save method 
    // removes this class to prevent new elements from being 
    // removed.
    $(".demarcate_temporary").remove();
}

/* 
 * A mouseup handler that checks if the toolbar or editor was clicked.
 * If not, it hides the editor.  
 */
function demarcate_click_elsewhere_save(e) {
    if (current_demarcate_editor == null) return;
    var tb = $("#demarcate_toolbar");
    if (! current_demarcate_editor.is(e.target) && 
        ! tb.is(e.target) && tb.has(e.target).length === 0) {
        $("#demarcate_save").click();
    }
}

/*
 * Replaces the element with the new type
 */
function replace_tag(id) {
    var new_elem = $("<" + id + "/>");
    current_demarcate_element.after(new_elem);
    current_demarcate_element.remove();
    current_demarcate_element = new_elem;

    // currently cannot 'cancel' once the tag has changed 
    // therefore lets hide the cancel button
    $("a#demarcate_cancel").fadeOut('fast',function() { this.remove(); });

    // update the editor css
    current_demarcate_editor.css("font", current_demarcate_element.css("font"))
            .css("border", current_demarcate_element.css("border"))
            .css("margin", current_demarcate_element.css("margin"))
            .css("textAlign", current_demarcate_element.css("textAlign"));
    
    // set the current button classes and focus back on the editor
    toolbar_set_active()
    current_demarcate_editor.focus();
}

/* 
 * Saves an existing editor area and creates a new one of the same type
 * immediately below it
 */
function save_and_new_editor_area() {
    // create another element of the same type after this one
    var tag_name = current_demarcate_element.get(0).tagName.toLowerCase();
    var new_elem = $("<" + tag_name + "/>");
    new_elem.insertAfter(current_demarcate_element);

    // force a save on the previous element
    $("#demarcate_save").click();

    // add the class after saving to prevent it being immediately pruned
    new_elem.addClass("demarcate_temporary");
    new_elem.click();   
}

/* 
 * Connect all the demarcate_toolbar button events
 */
function enable_demarcate_toolbar_handlers() {

    // handle hitting the return key inside the editor - saves it
    $(document).on('keydown', '#demarcate', function(e) {
        if (e.keyCode == 13) { // enter  >>  save, save and add or newline
            e.preventDefault();
            if (e.shiftKey) { // shift key held - save and exit
                $("#demarcate_save").click();
            } else if (e.ctrlKey) { // ctrl key held - save and create new
                save_and_new_editor_area();
            } else { // new line if editing elem allows newlines, otherwise save and new
                if (tag_dict[current_demarcate_element.get(0).tagName.toLowerCase()].allow_newline) {
                    current_demarcate_editor.insertAtCaret("\n");
                } else {
                    save_and_new_editor_area();
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
            $("#demarcate_cancel").click();
        } else if (e.keyCode == 9) { // tab - add four spaces
            e.preventDefault();
            current_demarcate_editor.insertAtCaret("    ");
        } else if (e.keyCode == 40) { // down arrow - navigate to the next editable area
            if (e.altKey) {
                var next = $("#demarcate_toolbar").next(".demarcate_editable");
                if (next.length > 0) {
                    $("#demarcate_save").click();
                    next.first().click();
                }
            }
        } else if (e.keyCode == 38) { // up arrow - navigate to the next editable area
            if (e.altKey) {
                var previous = current_demarcate_element.prev(".demarcate_editable");
                if (previous.length > 0) {
                    $("#demarcate_save").click();
                    previous.first().click();
                }
            }
        }
    });

    // handle clicking outside the div
    $(document).bind('mousedown', demarcate_click_elsewhere_save);

    // cancel button
    $(document).on('click', '#demarcate_cancel', function(e) {
        hide_editor(e);
        $(document).trigger('demarcate_editor_closed', [current_demarcate_element]);
    });

    // save button
    $(document).on('click', '#demarcate_save', function(e) {
        // get the current editor and wrap in the correct outer tag
        var tag_name = current_demarcate_element.get(0).tagName.toLowerCase();
        var curr_value = current_demarcate_editor.val(); 

        if (curr_value != "") {
            if (tag_name != "hr") {
                curr_value = tag_dict[tag_name].prefix + tag_dict[tag_name].childprefix +
                        curr_value + tag_dict[tag_name].postfix;
            }
        }
        var new_elem = $(modifyHtml(curr_value));

        // update the html element and save a reference to the new elem
        new_elem.insertBefore(current_demarcate_element);
        current_demarcate_element.remove();
        current_demarcate_element = new_elem;

        // close the editor and send the update event
        hide_editor(e)
        $(document).trigger('demarcate_editor_closed', [current_demarcate_element]);
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
        if (target_tag in tag_dict) {
            // handle lists
            var current_tag = current_demarcate_element.get(0).tagName.toLowerCase();
            var parent_tag = current_demarcate_element.parent().get(0).tagName.toLowerCase();

            if (current_tag == 'li' && target_tag != 'ul') {
                // moving a list item out of a list
                par = current_demarcate_element.parent();
                current_demarcate_element.detach().insertAfter(par);
                replace_tag(target_tag);

            } else if (current_tag != 'li' && target_tag == 'ul') {
                var list = $("<" + target_tag + "/>");
                list.insertBefore(current_demarcate_element);
                current_demarcate_element.appendTo(list);
                replace_tag('li');
            } else {
                replace_tag(target_tag);
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
            next.insertBefore(current_demarcate_element);
        }
        current_demarcate_editor.focus();
    });

    // handle clicking "move up" button
    $(document).on('click', '#demarcate_up', function(e) {
        e.preventDefault();
        var previous = current_demarcate_element.prev(".demarcate_editable");
        if (previous.length > 0) {
            previous.insertAfter($("#demarcate_toolbar"));
        }
        current_demarcate_editor.focus();
    });
};

/*
 * Hook up the 'demarcate' function as a jQuery plugin
 */
(function( $ ){
    $.fn.demarcate = function() {
        result = demarkdown(this, false, "");
        $(document).trigger("demarcation_complete", [result]);
        return result;
    };
})( jQuery );

/* 
 * Now hookup whitelisted elements for auto-edit.
 */
(function( $ ){
    $.fn.enable_demarcate = function() {
        // give global access to the demarcate_editor object and other elements
        window.demarcate_dom_root = $(this);
        window.current_demarcate_editor = null;
        window.current_demarcate_element = null;

        // add permanent event handlers for clicking editable elements
        for (var tag_name in tag_dict) {
            if (tag_dict[tag_name].editable) {
                live_selector = "#" + this.attr('id') + 
                        tag_dict[tag_name].selector_type + tag_name;

                $(document).on('click', live_selector, function(e) {
                    // avoid trying to edit toolbar items
                    if ($("#demarcate_toolbar").has(e.target).length > 0 ||
                            $("#demarcate_toolbar").is(e.target) ||
                            $(this).attr('id') === 'demarcate') {

                        return;
                    }

                    // display an editor
                    display_editor(this);
                });

                $(live_selector).addClass("demarcate_editable");

                // add a DOMNodeInserted event - not supported in all browsers
                // deprecated in some!
                $(document).on('DOMNodeInserted', live_selector, function(e) {
                    $(e.target).addClass("demarcate_editable");
                });
            }
        }

        enable_demarcate_toolbar_handlers();

        // if our editor box is empty, add an initial 'edit me' paragraph
        // add a class to ensure this isn't parsed by the demarkdown function
        if (demarcate_dom_root.is(":empty") ||
                $.trim(demarcate_dom_root.html()) == "") {

            demarcate_dom_root.append(
                $('<p />', {
                        class: 'demarcate_temporary',
                        text: 'Click me to start editing'
                })
            );
        }
    };
})( jQuery );

(function( $ ){
    // a jquery extension for textrarea elements which inserts some
    // text at the caret position.
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
})( jQuery );
