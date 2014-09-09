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
            return process(elem, '', '');
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
            return process(elem, '\n------', '\n');
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
    'u': {
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

    if (alt === null) {
        alt = url;
    }
    
    var op = " ![" + alt + "](" + url;

    if (title !== null) {
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