/*************************************************************************
*      DemarcateJS is an in-place Markdown editor and decoder            *
*                                                                        *
*      This is a RestructuredText plugin that allows demarcate.js to     *
*      generate RestructuredText from HTML.                              *
*                                                                        *
*      It supports demarcate.js 1.1.5 or greater                         *
*                                                                        *
*************************************************************************/

/* Add an entry point which generates RST from HTML */
demarcate.rst = {};

/* 
 * The basic rst function - takes an element, 
 * wraps it with a prefix and postfix and recursively 
 * calls a demarkdown on the innerHTML
 *
 *   "elem" is a jQuery DOM element
 *   "prefix", "postfiX" are strings to be appended to the demarkdown
 *
 */
demarcate.rst.base = function(elem, prefix, postfix) {

    /* 
     * Heading postfixes
     */
    var headings = {
        1: "=",
        2: "-",
        3: "+",
        4: "~",
        5: "*",
        6: "^"
    };
    
    /* 
     * Helper function to easily manage table rendering
     */
    var repeatStr = function(str, num)
    {
        return new Array(num + 1).join(str);
    }

    // set up the result variable and get the body
    var result = "";
    var body = demarcate.rst.parseChildren(elem);
    
    // headings are handled differently in rest
    if (prefix[0] == "#") {
        // HEADING MODE!! Start by counting the number of #s in the prefix
        var hdrNum = prefix.length - 1;
        result = body + "\n" + repeatStr(headings[hdrNum], body.length);
    } else {
        result = prefix + body;
    }

    // add the postfix
    return result + postfix;
};

/* 
 * Generates a link tag from a link element
 */
demarcate.rst.link = function(elem) {
    // check if we have a footnote backref
    if (elem.hasClass("footnote-backref")) return "";

    // otherwise parse the link as usual
    var result = " `";
    result += demarcate.markdown.parseChildren(elem);
    return result + " <" + elem.attr("href") + ">`_ ";
};

/* 
 * Generats an ordered or unordered list from the elements.
 * Uses 'parseChildren' to parse list elements.
 */
demarcate.rst.list = function(elem, type) {
    var count = 1;
    var result = "";

    $(elem).children("li").each( function() { 
        // add the list item
        if (type == 'ordered') {
            result += count + ". ";
            count++;
        } else {
            result += "- ";
        }

        // add the child elements
        result += demarcate.markdown.parseChildren($(this)) + "\n";
    });
    return result + "\n";
};

/* 
 * Intelligently parses code blocks - either single tag or larger
 * div > pre > code style blocks, removing syntax highlighting span tags
 * where appropriate whilst maintaining whitespace.
 */
demarcate.rst.code = function(elem) {
    // work out what kind of tag we have
    var tag_name = elem.get(0).nodeType == 3 ? '_text' : elem.get(0).tagName.toLowerCase();
    var result = "";

    // first check if it is just a single "<code>my code</code>" 
    // style code block, or a code block in a <pre> with no span 
    // style formatting
    if (elem.children().length == 0) {
        if (tag_name == "code") {
            return " `" + elem.text() + "` ";
        }
    }

    // otherwise we need to parse the text, stripping all element tags 
    // inside that are used for formatting.  Each line should be indented
    // by four spaces and whitespace should be maintained
    return "::\n\n" + 
                ("    " + elem.text()).replace(/\n/g, "\n    ") + "\n\n";
};

/* 
 * Table generator - build up a markdown table from the HTML.
 * Colspan and Rowspan not currently supported
 */
demarcate.rst.table = function (elem) {

    /* 
     * Extend string prototype to easily manage table padding
     */
    var repeatStr = function(str, num)
    {
        return new Array(num + 1).join(str);
    }
    
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
            cells[row][col] = demarcate.markdown.parseChildren($(this));

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
};

/*
 * Handle creating markdown from images
 *   Typical format - ![alt](url "optional title")
 */
demarcate.rst.image = function(elem) {
    var alt = elem.attr("alt");
    var title = elem.attr("title");
    var url = elem.attr("src");
    var op = " ![" + alt + "](" + url;

    if (title != "") {
        op += " \"" + title + "\"";
    }

    return op + ") ";
};

/* 
 * Processes a footnote into markdown.  This is READONLY
 * New footnotes cannot be directly created (although you can
 * write the correct footnote code to paragraphs).  This just
 * ensures that footnotes aren't gobbled when demarcate parses
 * the markdown from HTML
 */
demarcate.rst.footnote = function(elem) {
    // get the id, should be in the form "fnref:{FootNoteName}"
    var id = elem.attr("id");

    // split out the footnote name
    var fn_name = id.split(":");

    // check we have two components and the first is "fnref"
    if (fn_name.length !== 2 || fn_name[0] !== "fnref") return "";

    // build the footnote tag
    return " [^" + fn_name[1] + "] ";
};

/* 
 * Takes a footnote list (a list of footnote details usually included
 * at the bottom of the document) and builds up a line separated
 * Markdown representation of this list.
 */
demarcate.rst.footnote_list = function(elem) {
    var result = "";

    // loop through each child li element and build up a 
    // footnote detail section in Markdown
    elem.children("ol").children("li").each( function(idx, val) {
        // get the footnote id, checking for errors
        var fn_name = $(val).attr("id").split(":");
        if (fn_name.length !== 2 || fn_name[0] !== "fn") return;

        // next we build up the tag leader
        result += "[^" + fn_name[1] + "]: ";

        // parse the remainder of the result
        result += demarcate.markdown.parseChildren($(val));
        result += "\n\n";
    });

    return result;
};

/* 
 * parseChildren takes an element and selects the correct
 * processor function from the tag_dict to return Markdown
 * from these child dom elements
 *
 *   "elem" is a jQuery DOM element
 */
demarcate.rst.parseChildren = function(elem) {
    // set up a result object
    var result = "";

    // traverse the contents, converting each using its "process"
    // function defined in the _tag_dict
    $.each(elem.contents(), function(index, value) {
        // get the tag name
        var node = $(value);
        var node_type = node.get(0).nodeType;
        var tag_name = node_type == 3 ? '_text' : node.get(0).tagName.toLowerCase();

        // if this is not a plain text node perform ssome additional
        // checks such as looking for a TOC, checking if our tag name
        // is specified in the _tag_dict and if it is allowed to be 
        // returned as Markdown ("markdownable")
        if (tag_name != "_text") {
            // do not parse temporary dom elements
            if (node.hasClass("demarcate_temporary")) return;

            // check if the element is in the _tag_dict
            if (!(tag_name in _tag_dict)) return;

            // check we are allowed to decode the tag
            if ((! _tag_dict[tag_name].markdownable) ) {
                return;
            }

            // check if it is a special tag (i.e. TOC)
            if (tag_name == 'div') {
                if (node.hasClass("toc")) {
                    result += "\n[TOC]\n\n";
                    return;
                } else if (node.hasClass("footnote")) {
                    result += demarcate.markdown.footnote_list(node);
                    return;
                }
            }
        }

        // process the node and return the resultss
        result += _tag_dict[tag_name].process(node);
    });

    return result;
};