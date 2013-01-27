/*************************************************************************
*      DemarcateJS is an in-place Markdown editor and decoder            *
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
 * Bash in an 'indexOf' function if not available
 * (looking at IE I think!)
 */
if(!Array.indexOf){
    Array.prototype.indexOf = function(obj){
        for (var i=0; i<this.length; i++){
            if (this[i]==obj){
                return i;
            }
        }
        return -1;
    }
}

/*
 * Now make a handy 'contains' function which returns true
 * if the element is in the array and false otherwise
 */
Array.prototype.contains = function(obj) {
    return this.indexOf(obj) >= 0;
}

/*
 * Whitelist of tags to include
 */
var demarcate_whitelist = [
    'DIV',
    'SPAN',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'LI',
    'BLOCKQUOTE',
    'PRE',
    'CODE',
    'A',
    'P',
    'UL',
    'OL',
    'HR',
];

var editor_whitelist = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'li',
    'blockquote',
    'pre',
    'code',
    'p',
]

/*
 * Lookup table for line starts
 */
var line_starts = {
    'H1': '# ',
    'H2': '## ',
    'H3': '### ',
    'H4': '#### ',
    'H5': '##### ',
    'H6': '###### ',
    'LI': ' - ',
    'BLOCKQUOTE': '> ',
    'PRE': '    ',
    'CODE': '    ',
    'A': '[',
    'HR': '\n---------------------\n\n'
};

/*
 * Lookup table for line ends
 */
var line_ends = {
    'H1': '\n\n',
    'H2': '\n\n',
    'H3': '\n\n',
    'H4': '\n\n',
    'H5': '\n\n',
    'H6': '\n\n',
    'LI': '\n',
    'BLOCKQUOTE': '\n\n',
    'PRE': '\n\n',
    'CODE': '\n\n',
    'A': ']',
    'P': '\n\n',
    'DIV': '\n\n',
};

/*
 * A list of elements which have their internal
 * HTML added to the markdown document
 */
var include_internal = [
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'P',
    'BLOCKQUOTE',
    'A', //- not included here as requires special treatment
];

/*
 * Performs a number of manipulations on the edited string before adding 
 * it back into the DOM.  For instance:
 *   - Strips html tags from the textareas to prevent injection
 *   - Restores links from []() syntax to <a></a> syntax
 */
function modifyHtml(str){
    // remove HTML tags
    var strippedText = $("<div/>").html(str).text();

    // restore links to HTML.  
    var full_regex = new RegExp("\\[(.*?)\\]\\((.*?)\\)", "gi");
    strippedText = strippedText.replace(full_regex, "<a href='$2'>$1</a>");

    // all done!
    return strippedText;
}

/*
 * Recursively reverse the markdown of the element
 * and its child objects
 */
function demarkdown(elem, ignore_extras) {

    // check if ignore_extras was defined. Default is true
    ignore_extras = ignore_extras || false;

    // work out what we are looking at
    var node = elem.get(0);
    var tag_name = node.tagName;
    var node_type = node.nodeType;
    var result = "";

    // do not parse temporary dom elements
    if (elem.hasClass("demarcate_temporary")) return "";
    
    // check we are allowed to decode the tag
    if (! demarcate_whitelist.contains(tag_name) && node_type != 3) {
        return "";
    }

    // open the tag
    if (! ignore_extras || tag_name == 'A') {
        result = line_starts[tag_name] == undefined ? "" : line_starts[tag_name];
    }
    
    // add any inner html
    if (node_type == 3) {
        result += $.trim(node.nodeValue);
    }

    // add child elements
    $.each(elem.contents(), function(index, value) {
        result += demarkdown($(value), ignore_extras);
    });

    // close the tag
    if (! ignore_extras || tag_name == 'A') {
        result += line_ends[elem.get(0).tagName] == undefined ? "" : line_ends[tag_name];
    }

    // apply special behaviour for <a> tags
    if (tag_name == 'A') {
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
    toolbar.append($("<a />", {id: 'demarcate_h1', class: 'demarcate_style', text: 'H1', href:"#" }));
    toolbar.append($("<a />", {id: 'demarcate_h2', class: 'demarcate_style', text: 'H2', href:"#" }));
    toolbar.append($("<a />", {id: 'demarcate_h3', class: 'demarcate_style', text: 'H3', href:"#" }));
    toolbar.append($("<a />", {id: 'demarcate_h4', class: 'demarcate_style', text: 'H4', href:"#" }));
    toolbar.append($("<a />", {id: 'demarcate_h5', class: 'demarcate_style', text: 'H5', href:"#" }));
    toolbar.append($("<a />", {id: 'demarcate_h6', class: 'demarcate_style', text: 'H6', href:"#" }));
    toolbar.append($("<a />", {id: 'demarcate_p', class: 'demarcate_style', text: 'P', href:"#" }));
    toolbar.append($("<a />", {id: 'demarcate_code', class: 'demarcate_style', text: 'CODE', href:"#" }));
    toolbar.append($("<a />", {id: 'demarcate_cancel', text: 'Cancel', href:"#" }));
    toolbar.append($("<a />", {id: 'demarcate_save', text: 'Save', href:"#" }));
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
        tag_name = current_demarcate_element.get(0).tagName;
    }

    // remove old active tags
    $(".demarcate_style").removeClass("active");

    // apply new active tags
    $("#demarcate_" + tag_name.toLowerCase()).addClass("active");
}

/* 
 * Display an editor textarea
 */
function display_editor(elem) {
    elem = $(elem);
    var tag_name = elem.get(0).tagName;

    // double check we are allowed to edit this
    if (editor_whitelist.contains(tag_name.toLowerCase())) {

        // create the new text editor - ignore front matter
        var md = demarkdown(elem, true);
        var ed = $("<textarea id='demarcate'></textarea>");
        var tb = generate_toolbar();

        elem.after(ed);
        elem.after(tb);
        elem.addClass("demarcate_hide");

        // store the element currently being edited
        current_demarcate_element = elem;
        current_demarcate_editor = ed;

        // insert the markdown into the editor and focus 
        // on the last character. Set toolbar buttons to active
        toolbar_set_active();
        
        // hook up jquery.autosize.js if present
        if (typeof elem.autosize != undefined) {
            ed.autosize({'append': '\n'});
        }
        ed.focus().val($.trim(md)).trigger('autosize');
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
    if (current_demarcate_element.html() === "") {
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
 * Connect all the demarcate_toolbar button events
 */
function enable_demarcate_toolbar_handlers() {

    // handle hitting the return key inside the editor - saves it
    $(document).on('keydown', '#demarcate', function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            if (e.shiftKey) {
                $("#demarcate_save").click();
            } else {
                var new_elem = $("<p/>");
                new_elem.insertAfter(current_demarcate_element);
                $("#demarcate_save").click();

                // add the class after saving to prevent it being immediately pruned
                new_elem.addClass("demarcate_temporary");
                new_elem.click();
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
        current_demarcate_element.html(modifyHtml(current_demarcate_editor.val()));
        current_demarcate_element.removeClass("demarcate_temporary");
        hide_editor(e)
        $(document).trigger('demarcate_editor_closed', [current_demarcate_element]);
    });

    $(document).on('click', '.demarcate_style', function(e) {
        e.preventDefault();
        var id = $(this).attr('id').replace("demarcate_", "");

        // check this is an allowable tag
        if (editor_whitelist.contains(id)) {
            // replace the element with the new type
            var new_elem = $("<" + id + "></" + id + ">");
            current_demarcate_element.after(new_elem);
            current_demarcate_element.remove();
            current_demarcate_element = new_elem;

            // currently cannot 'cancel' once the tag has changed 
            // therefore lets hide the cancel button
            $("a#demarcate_cancel").fadeOut('fast',function() { this.remove(); });

            // set the current button classes and focus back on the editor
            toolbar_set_active()
            current_demarcate_editor.focus();
        } else {
            console.log("Unknown or disallowed tag type - " + id + ". Aborting tag change.");
        }
    });
};

/*
 * Hook up the 'demarcate' function as a jQuery plugin
 */
(function( $ ){
    $.fn.demarcate = function() {
        result = demarkdown(this);
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

        len = editor_whitelist.length
        for (var i = 0; i < len; i++) {
            live_selector = "#" + this.attr('id') + " " + editor_whitelist[i];
            
            $(document).on('click', live_selector, function() {
                display_editor(this);
            });

            $(document).on('mouseenter', live_selector, function() {
                $(this).addClass("demarcate_hover_editable");
            });
            
            $(document).on('mouseleave', live_selector, function() {
                $(this).removeClass("demarcate_hover_editable");
            });
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

