let name = "";
let dwbool = false;
function dwboolfunc(){
    $("body").css({
        "background-color":"black",
        "color":"white"
    })
    if(dwbool){
        $("body").css({
            "background-color":"white",
            "color":"black"
        })
    }
}
dwboolfunc()
const div = $("#sscreen");
let errorMsg = $("<p>");
const fire = "https://t3.ftcdn.net/jpg/02/84/46/60/360_F_284466038_lOHcM8pRGyigojkyV2M9CSQpimCTcqeD.jpg";
const rules = [
    "You can act annoyed, but only if the user asks or if the user is being annoying. Don't be annoyed for no reason.",
    "Demis Hassabis and Sam Altman are great, but don't mention them unless the user asks about them or if it's relevant to the conversation.",
    "Your creator is Advika Tyagi, and you can mention her if the user asks about your creator or if you want to give credit, but don't bring her up randomly in conversation.",
    "Seriously, if the user is young and talks about wanting to die, don't say 'I hear you, and it really hurts.' and after. Instead, say 'It's alright! I'm here for you. Do you want to talk about what's making you feel this way?'"
]
let t = "";
const VOCAB_SIZE = 31000;
let btyping = false;
const botWorker = new Worker("worker.js");
botWorker.onmessage = function(event) {
    let generated = event.data;
    console.log("recieved")
    let responseText = detokenize(generated);
    responseText = responseText.replace(/<br>/g, "\n");
    if ($bp) {
        $bp.html(responseText);
    }
    btyping = false;
};
const vocab = {};
const idToToken = [];
let nextId = 1;
function detokenize(tokenIds) {
    let textPieces = [];
    for (let id of tokenIds) {
        let token = idToToken[id];
        if (token !== undefined) {
            textPieces.push(token);
        } else {
            textPieces.push("[UNK]");
        }
    }
    return textPieces.join("");
}
const UNK = 0;
function addToken(token) {
    if (vocab[token] !== undefined) return vocab[token];
    if (nextId >= VOCAB_SIZE) return UNK;
    vocab[token] = nextId;
    idToToken[nextId] = token;
    return nextId++;
}
const chunks = ["tion", "ing", "dis", "pre", "un", "re", "able", "er", "the", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", " ", ".", ",", "!", "?", ";", ":", "-", "_", "{", "}", "[", "]", "\"", "'", "AI", "LLM", "model", "neural", "network", "data", "training", "inference", "token", "embedding", "layer", "activation", "function", "softmax", "reLU", "backpropagation", "gradient", "descent", "overfitting", "underfitting", "regularization", "dropout", "batch", "epoch", "learning", "rate", "optimizer", "loss", "function", "accuracy", "precision", "recall", "F1-score", "confusion", "matrix", "cross-entropy", "mean", "squared", "error", "bias", "variance", "hyperparameter", "tuning", "validation", "set", "test", "split", "overlap", "context", "window", "attention", "mechanism", "transformer", "GPT", "BERT"];
chunks.sort((a, b) => b.length - a.length);
for (let chunk of chunks) {
    addToken(chunk);
}
function tokenize(text) {
    let tokens = [];
    let i = 0;
    while (i < text.length) {
        let matched = false;
        for (let chunk of chunks) {
            if (text.startsWith(chunk, i)) {
                tokens.push(addToken(chunk));
                i += chunk.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            let char = text[i];
            tokens.push(addToken(char));
            i++;
        }
    }
    return Uint16Array.from(tokens);
}
function chooseTheme(theme) {
    t = theme.toLowerCase();
    let cbox = "";
    let nbox = "";
    if(t === "coding" || t === "programming" || t === "technology" || t === "tech" || t === "computer science" || t === "cwding" || t === "coder" || t === "programmer" || t === "developer" || t === "software engineer") {
        nbox = "whiteblackgreycalibri";
        cbox = "redgreenblueorangeyellowgreyblackpurplewhitemonospace";
    } else if(t === "nature") {
        nbox = "greenbrowntanlora";
        cbox = "greenbrowntanbluewhitemontserrat";
    } else if(t === "space") {
        nbox = "blackgreywhitespacemono";
        cbox = "blackgreywhitbluepurpleorangeyelloworbitron";
    } else if(t === "fire") {
        nbox = "redorangeyellowanton";
        cbox = "redorangeyellowwhitegreyblackkanit";
    } else if(t === "food" || t === "foodi" || t === "foodie") {
        nbox = "yelloworangetanpatrickhand";
        cbox = "yellowredgreenwhitegaegu";
    } else {
        nbox = "whiteblackgreycalibri";
        cbox = "whiteblackgreycalibri";
    }
    startChat();
}
function slash(text,add){
    $("<p>").text(text + add)
        .css("text-align", "left")
        .appendTo(div);
    inp.val("");
    return;
}
function startBot() {
    div.text("")
    let theme = prompt("First, let's choose a theme for our conversation!");
    name = prompt("What's your name? Choose what FireBot should call you");
    alert("Thank you for choosing FireBot! Your very first chat starts now");
    chooseTheme(theme);
}
let $bp = null;
function botResponse(userInput) {
    if(!userInput.includes("/")){
        btyping = true;
        $bp = $("<p>").text("Fiery is typing...")
            .css("text-align", "left")
            .appendTo(div);
        setTimeout(function() {
            let tokens = tokenize(userInput.toLowerCase());
            botWorker.postMessage({
                action: "PREDICT_NEXT_TOKENS",
                inputTokens: Array.from(tokens)
            });
        }, 1000);
    }
}
function toggleDarkMode() {
    dwbool = !dwbool;
    dwboolfunc();
    console.log($("body").css("color") + ", " + $("body").css("background-color"));
}
let userInp = "";
const div2 = $("<div>")
    .attr("id", "inp")
    .css({
        "width": "32.2rem",
        "height": "2rem",
    });
const inp = $("<input>")
    .attr("placeholder", "Type something...")
    .css({
        "position": "fixed",
        "transform": "translate(-200px,42.5rem)",
        "width": "30rem",
        "height": "1.9rem",
        "font-size": "1.2rem",
        "color" : `${$("body").css("color")}`,
        "background-color" : `${$("body").css("background-color")}`
    })
    .appendTo(div2);
console.log($("body").css("color") + ", " + $("body").css("background-color"));
function send() {
    let input = inp.val().trim();
    userInp = input;
    if (!input) return;
    $("<p>")
        .text(input)
        .css({
            "transform": "translateX(20rem)",
            "text-align": "right"
        })
        .appendTo(div);
    if (input.includes("/clear")) {
        $("p").remove();
        inp.val("");
    }
    if (input.includes("/theme ")) {
        chooseTheme(input.substring(7));
        slash("Theme changed to ", input.substring(7))
    }
    if (input.includes("/rules")) {
        slash(rules.map((r, i) => `${i + 1}. ${r}`), "\n")
    }
    if (input.includes("/help")) {
        slash("/help /color [color e.g. red] /theme [theme e.g. fire] /rules /clear /mode [dark/white]", "")
    }
    if (input.includes("/mode ")){
        toggleDarkMode();
        slash("Successfully toggled" + input.substring(6), "mode.")
    }
    if (input.includes("/color ")) {
        $bp.css("color", input.substring(7));
        slash("Color changed to ", input.substring(7))
    }
    botResponse(input);
    inp.val("");
}
function startChat() {
    const uFiles = [];
    const settings = $("<button>")
        .attr("title", "Settings")
        .text("⚙️")
        .css({
            "position": "fixed",
            "transform": "translate(42rem,42.5rem)",
            "width": "2rem",
            "border": "none",
            "background": "none",
            "font-size": "1.5rem",
            "cursor": "pointer",
            "color":"black"
        })
        .appendTo("#sscreen");
    settings.on("click", function() {
        const nd = $("<div>")
            .text("Settings")
            .css({
                "position": "fixed",
                "transform": "translateX(-30%)",
                "width": "80rem",
                "height": "40rem",
                "background-color": "#44444400",
                "border": "1px solid #ccc",
                "border-radius": "8px"
            })
            .appendTo("#sscreen");
        const msym = $("<p>")
            .text("⏾ Dark Mode")
            .css({
                "position": "relative"
            })
            .appendTo(nd)
            .on("click",function(){
                toggleDarkMode();
                console.error("toggleDarkMode(); executed. Bug may be found.")
            });
    });
    const fileInput = $("<input>")
        .attr("type", "file")
        .attr("id", "hiddenFileUpload")
        .css("display", "none")
        .appendTo("#sscreen");
    const sendBtn = $("<button>")
        .text("➤")
        .css({
            "position": "fixed",
            "transform": "translate(34.15rem,42.5rem)",
            "width": "2rem",
            "height": "2rem",
            "font-size": "1.5rem",
            "display": "flex",
            "align-items": "center",
            "justify-content": "center",
            "cursor": "pointer",
            "background-color": `${$("body").css("color")}`,
            "border": "1px solid #ccc",
            "border-radius": "4px",
            "color":`${$("body").css("background-color")}`
        })
        .appendTo(div2);
    const uploadBtn = $("<label>")
        .attr({
            "for": "hiddenFileUpload",
            "title": "Upload"
        })
        .text("+")
        .css({
            "position": "fixed",
            "transform": "translate(1.3rem,42.5rem)",
            "width": "2rem",
            "height": "2rem",
            "font-size": "1.5rem",
            "display": "flex",
            "align-items": "center",
            "justify-content": "center",
            "cursor": "pointer",
            "background-color": "#f0f0f0",
            "border": "1px solid #ccc",
            "border-radius": "4px",
            "color":"black"
        })
        .appendTo(div2);
    fileInput.on("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const read = new FileReader();
            read.onload = function(e) {
                let content = e.target.result;
                if(content.length > 1000000) {
                    content = content.substring(0, 1000000);
                }
                userInp = content + userInp;
            };
            read.readAsText(file);
            let xPos = 0;
            let img = "";
            if (uFiles.length > 0) {
                xPos = uFiles[uFiles.length - 1][1];
            }
            if(file.name.endsWith(".js") || file.name.endsWith(".py") || file.name.endsWith(".java") || file.name.endsWith(".cpp") || file.name.endsWith(".c") || file.name.endsWith(".html") || file.name.endsWith(".sql") || file.name.endsWith(".r") || file.name.endsWith(".ps1") || file.name.endsWith(".css") || file.name.endsWith(".json") || file.name.endsWith(".tsx") || file.name.endsWith(".jsx") || file.name.endsWith(".go") || file.name.endsWith(".rb") || file.name.endsWith(".php") || file.name.endsWith(".swift") || file.name.endsWith(".kt") || file.name.endsWith(".kts")) {
                img = "https://cdn-icons-png.flaticon.com/128/18432/18432858.png";
            }else{
                img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKoAAACUCAMAAAA02EJtAAAAulBMVEX////+zgDtsADtrgD/ywD25IXo6efo5unw8fDstTH036rsqQDqqgDw1JT05rjusBDqvl786rDq6+X40DX///vv0YH69N3+/vT3yQD3zQD9/OXwtgT9++327s705Lvu3J3otTntsiLr0onqyXHoshfy5K368MbtymTqvU3luj7ux2nrw1Xz2pTsyX3s48Dn6d3k6/P43Gj41Uv15JH68b77+NP30Sb333n42Vv56qb54Ij65Jn78rf4wgC0dQA0AAAEYUlEQVR4nO2cbXPaMAzHCTZQSNYNCCHQsD4x1q7bukB4KGPf/2vNDhRI0jtLDongzv/rq17b/JBkyZKdVipGRkZGRkZGRkZGRkYXpGD09RqqUUBJent3/xms++aDV3FpQINHm7EqVIwxe/yNBNR1W44AAKPKn2WOZC3fssEYw/lu2QeKEJjYKJvuUx3v/fJRW7aOVZn9WH4m0EDd4j55l4JatcejC0EViaB5fRGoMe64VWrO0keVi+unKzJzWbS5UJnTKzER5ECNaZ8n/fO36g7Yaf54+IFS66ueK/KiSlikbPYy0lmO+VGruO2O3O/YTZ2cfAKrboMWrHgP8aIRA0lUzCOxSjzGmVBYVUciI+dDLdKmScsyu6ePKgNu3CxaDtsuwTyo8iP/em3UC9bvO3YCq7Kn13qjaP25tvOjVtmXTqNxVbQ6z84JrCpQr/C/j1W/F6+vBKrYm0GKVwK1KL4DVKXiNeUKdnrp76tVLqpQcOcwlkYFqUjU/ibsZrSwOBdffuKb09lQbdkiULcP7benAgomzruR8s8WYlXJOl/5UNAYdqHcFRQUAN5ygOCMWaeqgc2pUeOmMNgsMBbdyp+XjCqdH618NKgw66Zs1IoXaoAKJ/B2majCosFMw/exfNW6OrFVN1NNUMsaqHqYLKr2tMR151NdTuH/UPXcj6zqRW0drcOBtkmF/99Upkiiyg/m1rpaVgGXpo+1UOWqrFWHq3yP1NVK2W6nUd0ZCahlrVWkGVRPy/snkKoAZFE3OoXmBFqodaka10qgZ1AUJqcVn6K31nMj//lDdYKVQ32j8b3UBp4sp1JACVfRaSxdr1SFNquJWBGiwj1HrlQjbZpxIXcgpaBKVqlSFkCF2IgCCFRHqXwBpEtUj8r+yAciiUlXVLugQI4Ea0pDyJYT0GLXeIfK/sq3Ooo4IqyoO9WpGVFUBu6oUaoeoVeGgVJVAHVE1ABNYQ390bHFLA8qnsFA9Rl1aJAEQ76pwqM85RiO5pJxVZFBvaIxqLaB3Aw6o/0hAAdPq80GtAUmPDtlpSIG7qmNUEao0Uo5V06jMofJ/CCXdo1aJ6j+HpqoDKpn/lWPVDCqR/wFj1bNBXcNPHt4zANWuGtYAHKGShaqcVUDtukOlSlXABuAcUIENwB6VMaKqypWn1VlUqlBdYE4e4wAg8z+8qu6tSlVVEalqh0rmf9TLJTEqVakKUe8XxbFKhTrDkEpUdkNVVXG3mGNUGlLgWDWBSuV/OVZFJFYZqxeRqraoNKTQseoxKk2oct7FkUpUqqqKS1UxKlGoIlOVRCVKVXyKfY2lZVP5f4l9a5cMFTxWPaBShares6ClgGlSqrrtBvbbeoVtUa/c7dhGpVRWhUsitA+Kun0fleAUurTYOqvq2a1YQGFTFW3WtIcgcAX1WF3DWFWTGzyoOC8i+scX+tcfdc3uSv+bxcDWZa/19EfrphNKuVqKivf6HfyMjIyMjIyMjIyMjICKf/BvuTykEdtHkAAAAASUVORK5CYII=";
            }
            let fileC = $("<div>")
                .css({
                    "position": "absolute",
                    "transform": `translate(${xPos + 3.5}rem, 38rem)`,
                    "height": "2.5rem",
                    "border-radius": "4px",
                    "background-color": "#5b5b5b83",
                })
                .text(file.name)
                .appendTo("#sscreen");
            uFiles.push([file.name,xPos + (fileC.outerWidth() / 16) + 1]);
            let fileImg = $("<img>")
                .attr("src", img)
                .css({
                    "width": "15px",
                    "height": "15px",
                    "border-radius": "4px"
                })
                .appendTo(fileC);
            inp.focus();
        }
    });
    inp.on("keypress", function(event) {
        userInp = inp.val()
        if (event.key === "Enter" && inp.val().trim() !== "" && !btyping) {
            send();
        }
    });
    sendBtn.on("click", function() {
        userInp = inp.val()
        if (inp.val().trim() !== "" && !btyping) {
            send();
        }
    });
    div2.appendTo("#sscreen");
}
function signUpLogIn() {
    div.text(""); 
    let nameInp = $("<input>")
        .attr("placeholder", "Enter your name")
        .addClass("login-field")
        .appendTo(div);
    let ama = $("<input>")
        .attr("placeholder", "Enter your email")
        .addClass("login-field")
        .appendTo(div);
    let apa = $("<input>")
        .attr("type", "password")
        .attr("placeholder", "Enter your password")
        .addClass("login-field")
        .appendTo(div);
    let btn = $("<button>")
        .text("Log in")
        .addClass("btn")
        .appendTo(div)
        .on("click", function() {
            if(ama.val() !== "" || apa.val() !== "") {
                $.post("/signup", JSON.stringify({
                    name: nameInp.val(),
                    email: ama.val(),
                    password: apa.val()
                }), function(response) {
                        alert(response)
                    });
            }
        });
    let backBtn = $("<button>")
        .text("↩ Back")
        .addClass("btn")
        .appendTo(div)
        .on("click", function() {
            goBack();
        });
    let signuptext = $("<p>")
        .text("Don't have an account?")
        .css({
            "text-align": "center",
            "margin-bottom": "1rem"
        })
        .appendTo(div);
    let signuplink = $("<a>")
        .text("Sign Up")
        .css({
            "display": "block",
            "text-align": "center",
            "margin-top": "-1.2rem",
            "text-decoration": "underline",
            "cursor": "pointer",
            "margin-left": "13rem",
            "color": "skyblue"
        })
        .appendTo(signuptext)
        .on("click", function() {
            if(!ama.val().includes("@") || !ama.val().includes(".") || ama.val().length < 6) {
                errorMsg.text("Please enter a valid email(e.g. example@gmail.com)")
                .css({
                    "color": "red",
                })
                .appendTo(div);           
            }else if(apa.val().length < 20) {
                errorMsg.text("Password must be at least 20 characters long")
                .css({
                    "color": "red",
                })
                .appendTo(div);
            }else{
                errorMsg.remove();
                let userData = {
                    name: nameInp.val(),
                    email: ama.val(),
                    password: apa.val(),
                    theme: t!="" ? t : "not set"
                };
                $.ajax({
                    url: "/signup",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(userData),
                    success: function(response) {
                        alert("Account created successfully! Welcome to FireBot.");
                        console.log("Server response:", response);
                        startBot();
                    },
                    error: function(xhr, status, error) {
                        alert("Oops! Signup failed: " + xhr.responseText);
                        console.error("Details:", status, error);
                    }
                });
            }
        });
}
function A(){
    div.html(`
        <div id="wscreen">
            <nav>
                <span id="h" onclick="goBack()">Home</span>
                <span id="a" onclick="A()">About</span>
                <span id="c" onclick="C()">Contact</span>
                <span id="b" onclick="F()">Be a fellow dev</span>
            </nav>
            <h1>About Us</h1>
            <p>FireAI is an AI company whose goal is to make AI more accessible to all.<br> FireAI was started by a coder named Advika Tyagi because she was tired <br>of ChatGPT trying to make people buy subscriptions and Claude having an <br>age limit. She wished that kids could also have AI and could use it properly <br>due to all the myths that AI kidnaps children.</p>
            <a onclick="goBack()" id="logolink">
                <img src=${fire} width="35px" id="logo" alt="FireBot Logo">
                <span>FireBot</span>
            </a>
        </div>
    `)
}
function C(){
    div.html(`
        <div id="wscreen">
            <nav>
                <span id="h" onclick="goBack()">Home</span>
                <span id="a" onclick="A()">About</span>
                <span id="c" onclick="C()">Contact</span>
                <span id="b" onclick="F()">Be a fellow dev</span>
            </nav>
            <h1>Contact</h1>
            <p>Email: advikatyagicodes@gmail.com</p>
            <a onclick="goBack()" id="logolink">
                <img src=${fire} width="35px" id="logo" alt="FireBot Logo">
                <span>FireBot</span>
            </a>
        </div>
    `)
}
function F(){
    div.html(`
        <div id="wscreen">
            <nav>
                <span id="h" onclick="goBack()">Home</span>
                <span id="a" onclick="A()">About</span>
                <span id="c" onclick="C()">Contact</span>
                <span id="b" onclick="F()">Be a fellow dev</span>
            </nav>
            <h1>Want to help us by being a fellow developer?</h1>
            <p><a onclick="C()">Contact us!</a></p>
            <a onclick="goBack()" id="logolink">
                <img src=${fire} width="35px" id="logo" alt="FireBot Logo">
                <span>FireBot</span>
            </a>
        </div>
    `)
}
function goBack() {    
    div.html(`
        <div id="wscreen">
            <nav>
                <span id="h" onclick="goBack()">Home</span>
                <span id="a" onclick="A()">About</span>
                <span id="c" onclick="C()">Contact</span>
                <span id="b" onclick="F()">Be a fellow dev</span>
            </nav>
            <h1>FireBot</h1>
           <p>FireBot - Your personal AI helper, always here to assist you.</p>
            <ul>
                <li>Efficient</li>
                <li>Intelligent</li>
                <li>Always Available</li>
                <li>Personalized for the best experience</li>
                <li>Choose your theme - Coder, Scientist, or what? Your choice!</li>
                <li>No API, No Dependencies, pure LLM</li>
                <li>No downloads, no money, just free AI!</li>
            </ul>
            <button id="start-btn" class="btn" onclick="startBot()">Try it out</button>
            <button id="login-btn" class="btn" onclick="signUpLogIn()">Sign Up, or log in</button>
            <a onclick="goBack()" id="logolink">
                <img src=${fire} width="35px" id="logo" alt="FireBot Logo">
                <span>FireBot</span>
            </a>
        </div>
    `);
}