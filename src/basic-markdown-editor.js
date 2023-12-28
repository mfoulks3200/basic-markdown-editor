
class BasicMarkdownEditor {


    container;
    preview;
    toolbar;
    textArea;
    isPreviewMode = false;
    currentValue = "";

    constructor(textArea) {
        this.textArea = textArea;
        this.container = document.createElement("div");
        this.textArea.insertAdjacentElement("afterend", this.container);
        this.container.id = this.textArea.id;
        this.container.classList.add("basic-markdown-editor-container");
        this.container.setAttribute("mode", "edit");

        this.container.insertAdjacentElement("beforeend", this.getToolbar());
        
        this.textArea.id = "";
        this.textArea.classList.add("basic-markdown-editor-edit");
        this.textArea.style.width = "100%";
        this.textArea.style.height = "calc( 100% - 40px )";
        this.textArea.style.boxSizing = "border-box";
        this.textArea.resizable = false;
        this.textArea.remove();
        this.container.insertAdjacentElement("beforeend", this.textArea);
        const thisEditor = this;
        this.textArea.addEventListener("input", (e) => {
            thisEditor.handleTextAreaInput(thisEditor, e);
        });

        this.preview = document.createElement("div");
        this.preview.classList.add("basic-markdown-editor-preview");
        this.preview.style.width = "100%";
        this.preview.style.height = "100%";
        this.container.insertAdjacentElement("beforeend", this.preview);
    }

    getToolbar(){
        this.toolbar = document.createElement("div");
        this.toolbar.classList.add("basic-markdown-editor-toolbar");
        this.toolbar.style.width = "100%";
        this.toolbar.style.height = "40px";
        this.toolbar.style.display = "flex";
        this.toolbar.style.gap = "5px";
        this.toolbar.style.padding = "5px";
        this.toolbar.style.boxSizing = "border-box";
        this.toolbar.style.background = "rgba(0,0,0,0.05)";
        this.toolbar.insertAdjacentElement("beforeend", this.makeButton("H1", () => {}));
        this.toolbar.insertAdjacentElement("beforeend", this.makeButton("H2", () => {}));
        this.toolbar.insertAdjacentElement("beforeend", this.makeButton("H3", () => {}));
        this.toolbar.insertAdjacentElement("beforeend", this.makeButton("H4", () => {}));
        this.toolbar.insertAdjacentElement("beforeend", this.makeButton("H5", () => {}));
        this.toolbar.insertAdjacentElement("beforeend", this.makeButton("H6", () => {}));
        this.toolbar.insertAdjacentElement("beforeend", this.makeButton("B", () => {}));
        this.toolbar.insertAdjacentElement("beforeend", this.makeButton("I", () => {}));

        let modeButton = this.makeButton("M", () => {
            console.log("Mode button");
            this.isPreviewMode = !this.isPreviewMode;
            this.render();
        });
        modeButton.style.marginLeft = "auto";
        this.toolbar.insertAdjacentElement("beforeend", modeButton);
        return this.toolbar;
    }

    makeButton(text, callback){
        let button = document.createElement("button");
        button.style.height = "30px";
        button.style.width = "30px";
        button.style.border = "0";
        button.style.borderRadius = "3px";
        button.style.background = "rgba(0,0,0,0.1)";
        button.textContent = text;
        button.addEventListener("click", callback);
        return button;
    }

    handleTextAreaInput(thisInstance, e){
        console.log(e, thisInstance);
        if(thisInstance.preview){
            thisInstance.currentValue = thisInstance.textArea.value;
        }
    }

    render(){
        this.preview.innerHTML = this.toHtml(this.currentValue);
        if(this.isPreviewMode){
            this.container.setAttribute("mode", "preview");
        }else{
            this.container.setAttribute("mode", "edit");
        }
    }

    toHtml(str){
        str = this.parseHtmlEntities(str);
        str = this.parseHeaders(str);
        str = this.parseBold(str);
        str = this.parseItalic(str);
        str = this.parseLink(str);
        str = this.parseBreak(str);
        str = this.parseCode(str);
        str = this.parseInlinePre(str);
        str = this.parseList(str);
        str = this.parseOrderedList(str);
        str = this.parseQuote(str);


        str = this.parseNewLine(str);
        return str;
    }

    parseHtmlEntities(str){
        str = str.replaceAll(/</gm, "&lt;");
        str = str.replaceAll(/>/gm, "&gt;");
        return str;
    }

    parseHeaders(str){
        str = str.replaceAll(/^((?:&gt; )?)(?:#{6}\s)(.*)/gm, "$1<h6>$2</h6>");
        str = str.replaceAll(/^((?:&gt; )?)(?:#{5}\s)(.*)/gm, "$1<h5>$2</h5>");
        str = str.replaceAll(/^((?:&gt; )?)(?:#{4}\s)(.*)/gm, "$1<h4>$2</h4>");
        str = str.replaceAll(/^((?:&gt; )?)(?:#{3}\s)(.*)/gm, "$1<h3>$2</h3>");
        str = str.replaceAll(/^((?:&gt; )?)(?:#{2}\s)(.*)/gm, "$1<h2>$2</h2>");
        str = str.replaceAll(/^((?:&gt; )?)(?:#{1}\s)(.*)/gm, "$1<h1>$2</h1>");
        return str;
    }

    parseBold(str){
        str = str.replaceAll(/(?:\*\*|__)(?!   )([^\*|_|\n]*)(?:\*\*|__)/gm, "<strong>$1</strong>");
        return str;
    }

    parseItalic(str){
        str = str.replaceAll(/(?:\*|_)(?!   )([^\*|_|\n]*)(?:\*|_)/gm, "<i>$1</i>");
        return str;
    }

    parseLink(str){
        console.log(str);
        str = str.replaceAll(/\[([^\]]*)\]\(([^\)]*)\)/gm, "<a href=\"$2\">$1</a>");
        return str;
    }

    parseInlinePre(str){
        str = str.replaceAll(/`([^`|$]*)`/gm, "<pre>$1</pre>");
        return str;
    }

    parseCode(str){
        str = str.replaceAll(/```\n([^`]*)\n```/gm, "<pre>$1</pre>");
        return str;
    }

    parseBreak(str){
        str = str.replaceAll(/[-]{3,6}/gm, "<hr />");
        return str;
    }

    parseNewLine(str){
        str = str.replaceAll(/(\n|\r){2,}/gm, "<br />");
        return str;
    }


    parseList(str){
        let lines = str.split("\n");
        let output = "";
        const regex = /(&gt; )?( *)(?:\*|\+|\-)   (.*)/gm
        let level = -1;
        for(let line of lines){
            if(line.match(regex)){
                let m = regex.exec(line);
                let newLevel = parseInt(m[2].length/4);
                if(m[1]){
                    output += m[1];
                }
                if(newLevel > level){
                    output += "<ul>"
                }
                if(newLevel < level){
                    output += "</ul>"
                }
                output += "<li>"+m[3]+"</li>\n";
                level = newLevel;
            }else{
                if(level > -1){
                    output = output.slice(0, -1);
                    for(let i = level; i > 0; i--){
                        output += "</ul>";
                    }
                    output += "</ul>\n";
                }
                level = -1;
                output += line+"\n";
            }
        }
        return output;
    }

    parseOrderedList(str){
        let lines = str.split("\n");
        let output = "";
        const regex = /(&gt; )?( *)(?:[0-9]\.) {1,3}(.*)/gm
        let level = -1;
        for(let line of lines){
            if(line.match(regex)){
                let m = regex.exec(line);
                let newLevel = parseInt(m[2].length/4);
                if(m[1]){
                    output += m[1];
                }
                if(newLevel > level){
                    output += "<ol>"
                }
                if(newLevel < level){
                    output += "</ol>"
                }
                output += "<li>"+m[3]+"</li>\n";
                level = newLevel;
            }else{
                if(level > -1){
                    output = output.slice(0, -1);
                    for(let i = level; i > 0; i--){
                        output += "</ol>";
                    }
                    output += "</ol>\n";
                }
                level = -1;
                output += line+"\n";
            }
        }
        return output;
    }

    parseQuote(str){
        console.log(str)
        let lines = str.split("\n");
        let output = "";
        const regex = /^((?:&gt; ?)+)(.*)/gm
        let level = -1;
        for(let line of lines){
            if(line.match(regex)){
                let m = regex.exec(line);
                let newLevel = parseInt(m[1].length/4);
                if(newLevel > level){
                    output += "<div class=\"block-quote\">"
                }
                if(newLevel < level){
                    output += "</div>"
                }
                output += m[2]+"\n";
                level = newLevel;
            }else{
                if(level > -1){
                    for(let i = level; i > 0; i--){
                        output += "</div>";
                    }
                    output += "</div>";
                }
                level = -1;
                output += line+"\n";
            }
        }
        return output;
    }

}

document.querySelectorAll("textarea[type='markdown']").forEach((editor) => {
    console.log(editor);
    new BasicMarkdownEditor(editor);
});