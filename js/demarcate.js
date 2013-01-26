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
        for(var i=0; i<this.length; i++){
            if(this[i]==obj){
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
    'BODY',
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

    // check we are allowed to decode the tag
    if (! demarcate_whitelist.contains(tag_name) && node_type != 3) {
        return "";
    }

    // open the tag
    if (! ignore_extras) {
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
    if (! ignore_extras) {
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
    toolbar.append($("<a />", {id: 'demarcate_save', text: 'Save', href:"#" }));
    toolbar.append($("<a />", {id: 'demarcate_cancel', text: 'Cancel', href:"#" }));
    return toolbar;
}

/* 
 * Display an editor textarea
 */
function display_editor(elem) {
    elem = $(elem);
    var tag_name = elem.get(0).tagName;
    console.log(tag_name);
    // double check we are allowed to edit this
    if (editor_whitelist.contains(tag_name.toLowerCase())) {
        console.log("Displaying editor for " + tag_name);

        // create the new text editor - ignore front matter
        var md = demarkdown(elem, true);
        var ed = $("<textarea id='demarcate'>" + $.trim(md) + "</textarea>");
        var tb = generate_toolbar();

        elem.after(ed);
        elem.after(tb);
        elem.addClass("demarcate_hide");

        // hook up jquery.autosize.js if present
        if (typeof elem.autosize != undefined) {
            ed.autosize({'append': '\n'});
        }

        // store the element currently being edited
        window.current_demarcate_element = elem;
        window.current_demarcate_editor = ed;

        // connect handlers
        restore_demarcate_toolbar_handlers()
    }
    else 
    {
        console.log("darn");
    }
}

/* 
 * Hides the editor textarea and restores the hidden div
 */
function hide_editor(e) {
    e.preventDefault();
    $("div#demarcate_toolbar").remove();
    current_demarcate_editor.remove();
    current_demarcate_editor = null;
    current_demarcate_element.removeClass("demarcate_hide");
    current_demarcate_element = null;
    $(document).unbind('mouseup', demarcate_click_elsewhere_save);
}

/* 
 * A mouseup handler that checks if the toolbar or editor was clicked.
 * If not, it hides the editor.  Implemented as a separate function so
 * it can be unbound.
 */
function demarcate_click_elsewhere_save(e) {
    var tb = $("#demarcate_toolbar");
    if (! current_demarcate_editor.is(e.target) && 
        ! tb.is(e.target) && tb.has(e.target).length === 0) {
        $("#demarcate_save").click();
    }
}

/* 
 * Connect all the demarcate_toolbar button events
 */
function restore_demarcate_toolbar_handlers() {

    // handle hitting the return key inside the editor - saves it
    current_demarcate_editor.keydown(function(key) {
        if (key.keyCode == 13) {
            $("#demarcate_save").click();
        }
    });

    // handle clicking outside the div
    $(document).bind('mouseup', demarcate_click_elsewhere_save);

    // cancel button
    $("#demarcate_cancel").on('click', function(e) {
        hide_editor(e);
        $(document).trigger('demarcate_editor_closed', [current_demarcate_element]);
    });

    // save button
    $("#demarcate_save").on('click', function(e) {
        current_demarcate_element.html(current_demarcate_editor.val());
        hide_editor(e)
        $(document).trigger('demarcate_editor_closed', [current_demarcate_element]);
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
        // give global access to the demarcate_editor object
        window.demarcate_dom_root = $(this);

        len = editor_whitelist.length
        for (var i = 0; i < len; i++) {
            live_selector = "#" + this.attr('id') + " " + editor_whitelist[i];
            $(live_selector).on('click', function() {
                display_editor(this);
            });
        }
    };
})( jQuery );


