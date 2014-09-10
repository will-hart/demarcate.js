var md = require('../src/markdown').markdownParser,
    expect = require('chai').expect,
    dom = require('jsdom').jsdom;
 
function getMarkdown(rawHtml, tag) {
    var result = dom(rawHtml),
        doc = result.parentWindow.document;
 
    // how to get root node without passing a tag???
    return md(doc.getElementsByTagName(tag)[0]);
}
 
function markdownSpecTest(raw, expected, tag) {
    var processed = getMarkdown(raw, tag);
    expect(processed).to.equal(expected);
}
 
describe(md, function() {
    it("should be a function", function() {
        expect(typeof md).to.equal('function');
    });
 
    it("should convert H1 headings to hashes with newline", function() {
        markdownSpecTest("<h1>Heading 1</h1>", "# Heading 1\n\n", "h1");
    });

    it("should convert H2 headings to hashes with newline", function() {
        markdownSpecTest("<h2>Heading 2</h2>", "## Heading 2\n\n", "h2");
    });

    it("should convert H3 headings to hashes with newline", function() {
        markdownSpecTest("<h3>Heading 3</h3>", "### Heading 3\n\n", "h3");
    });

    it("should convert H4 headings to hashes with newline", function() {
        markdownSpecTest("<h4>Heading 4</h4>", "#### Heading 4\n\n", "h4");
    });

    it("should convert H5 headings to hashes with newline", function() {
        markdownSpecTest("<h5>Heading 5</h5>", "##### Heading 5\n\n", "h5");
    });

    it("should convert H6 headings to hashes with newline", function() {
        markdownSpecTest("<h6>Heading 6</h6>", "###### Heading 6\n\n", "h6");
    });

    it("should convert links to markdown", function () {
        markdownSpecTest("<a href='#'>Link</a>", " [Link](#) ", "a");
    });

    it("should handle nested formatting in links", function() {
        markdownSpecTest("<a href='index.html'>Link <strong>Formatted</strong></a>", 
            " [Link **Formatted** ](index.html) ", 
            "a");
    });
 
    it("should convert strong to double stars", function () {
        markdownSpecTest("<strong>Something strong</strong>", " **Something strong** ", "strong");
    });
 
    it("should convert b to double stars", function () {
        markdownSpecTest("<b>Something strong</b>", " **Something strong** ", "b");
    });

    it("should treat underline as bold", function() {
        markdownSpecTest("<u>Something strong</u>", " **Something strong** ", "u");
    });

    it("should convert em to single stars", function() { 
        markdownSpecTest("<i>Something em</i>", " *Something em* ", "i");
    });

    it("should maintain case", function() {
        var md = getMarkdown("<p>AsSuMe NothING</p>", "p");
        expect(md).to.contain("AsSuMe NothING");
    });

    it("should ignore extra whitespace", function() {
        var md = getMarkdown("<p>ignore    whitespace</p>", "p");
        expect(md).to.contain("ignore whitespace");
    });

    it("should convert ol to numbered list", function() {
        markdownSpecTest("<ol>\n\t<li>One</li>\n\t<li>Two</li>\n</ol>",
            "\n1. One\n2. Two\n\n", "ol");
    });

    it("should convert ul to dashed list", function() {
        markdownSpecTest("<ul>\n\t<li>One</li>\n\t<li>Two</li>\n</ul>",
            "\n- One\n- Two\n\n", "ul");
    });

    it("should handle mixed list types nested", function() {
        markdownSpecTest("<ul>\n\t<li>Items:\n\t\t<ol>\n\t\t\t<li>Nested One</li>\n\t\t" + 
            "</ol>\n\t</li>\n\t<li>Two</li>\n</ul>",
            "\n- Items:\n1. Nested One\n\n\n- Nested One\n- Two\n\n", "ul");
    });

    it("should ignore divs", function () {
        markdownSpecTest("<div>Some Text</div>", "Some Text", "div");
    });

    it("should ignore spans", function() {
        markdownSpecTest("<span>Some Text</span>", "Some Text", "span");
    });

    it("should handle multiple paragraphs in a div", function() {
        markdownSpecTest("<div><p>One</p><p>Two</p></div>",
            "\nOne\n\nTwo\n", "div");
    });

    it("should handle multiple paragraphs outside div", function() {
        // have to include span to get jsdom to work
        // TODO work out how to get JS DOM to return proper root node
        markdownSpecTest("<span><p>One</p><p>Two</p></span>",
            "\nOne\n\nTwo\n", "span");

    });

    it("should handle blockquotes", function() {
        markdownSpecTest("<blockquote>Test quote</blockquote>",
            "\n> Test quote\n", "blockquote");
    });

    it("should handle hrs by inserting dashes", function() {
        markdownSpecTest("<div><p>Test</p><hr><p>Second paragraph</p></div>",
            "\nTest\n\n------\n\nSecond paragraph\n", "div");
    });

    it("should handle hrs in paragraphs", function() {
        markdownSpecTest("<div><p>Test<hr>Second paragraph</p></div>",
            "\nTest\n\n------\nSecond paragraph\n\n", "div");
    });

    it("should handle code tags", function() {
        markdownSpecTest("<code>some code</code>", " `some code` ", "code");
    });

    it("should handle code in a paragraph", function() {
        markdownSpecTest("<p>Some Text with <code>code</code></p>", 
            "\nSome Text with `code` \n", "p");
    });

    it("should space indent preformatted blocks", function() {
        markdownSpecTest("<pre>My pre</pre>", "\n    My pre\n", "pre");
    });

    it("should keep whitespace in preformatted blocks", function() {
        markdownSpecTest("<pre>  My pre\n    line</pre>", 
            "\n    My pre\n        line\n", "pre");
    });

    it("should handle breaks", function() {
        markdownSpecTest("<p>A test<br>of breaks</p>", "\nA test    \nof breaks\n", "p");
    });

    it("should handle unclosed tags", function() {
        markdownSpecTest("<p>Unclosed tag", "\nUnclosed tag\n", "p");
    });

    it("should handle image tags", function() {
        markdownSpecTest("<img src='123.png' alt='test'>", " ![test](123.png) ", "img");
    });

    it("should use image name as alt where none supplied", function() {
        markdownSpecTest("<img src='123.png'>", " ![123.png](123.png) ", "img");
    });

    it("should handle title tags", function() {
        markdownSpecTest("<img src='123.png' alt='123' title='456' />", 
            " ![123](123.png \"456\") ", "img");
    });

    it("should handle simple tables", function() {
        markdownSpecTest("<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Body</td></tr></tbody></table>",
            "Header|\n------|\nBody  |\n\n", "table");
    });
});