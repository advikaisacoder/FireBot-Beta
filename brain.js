let errorMsg = $("<p>");
const rules = [
    "You can act annoyed, but only if the user asks or if the user is being annoying. Don't be annoyed for no reason.",
    "Demis Hassabis and Sam Altman are great, but don't mention them unless the user asks about them or if it's relevant to the conversation.",
    "Your creator is Advika Tyagi, and you can mention her if the user asks about your creator or if you want to give credit, but don't bring her up randomly in conversation.",
]
let t = "";
const VOCAB_SIZE = 31000;
const hiddenSize = 16000;
const embeddingSize = 128;
let btyping = false;
function randomFlat(length) {
    let arr = new Float16Array(length);
    for (let i = 0; i < length; i++) {
        arr[i] = Math.random() * 0.2 - 0.1;
    }
    return arr;
}
function randomMatrix(rows, cols) {
    let matrix = randomFlat(rows * cols);
    matrix.rows = rows;
    matrix.cols = cols;
    return matrix;
}
let embedding = randomMatrix(VOCAB_SIZE, embeddingSize);
let weights1 = randomMatrix(embeddingSize, hiddenSize);
let bias1 = new Float16Array(hiddenSize).fill(0);
let weights2 = randomMatrix(hiddenSize, hiddenSize);
let bias2 = new Float16Array(hiddenSize).fill(0);
let weights3 = randomMatrix(hiddenSize, hiddenSize);
let bias3 = new Float16Array(hiddenSize).fill(0);
let weights4 = randomMatrix(hiddenSize, VOCAB_SIZE);
let bias4 = new Float16Array(VOCAB_SIZE).fill(0);
const w1l = embeddingSize;
const vocab = {};
const idToToken = [];
let nextId = 1;
function argmax(arr) {
    if (nextId <= 1) return UNK;
    let maxIdx = 1;
    for (let i = 2; i < nextId; i++) {
        if (arr[i] > arr[maxIdx]) maxIdx = i;
    }
    return maxIdx;
}
function softmax(raw) {
    let max = -Infinity;
    for (let i = 0; i < raw.length; i++) {
        if (raw[i] > max) max = raw[i];
    }
    let exps = new Float16Array(raw.length);
    let sum = 0;
    for (let i = 0; i < raw.length; i++) {
        exps[i] = Math.exp(raw[i] - max);
        sum += exps[i];
    }
    for (let i = 0; i < exps.length; i++) {
        exps[i] /= sum;
    }
    return exps;
}
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
function sample(probs) {
    let total = 0;
    for (let i = 1; i < nextId; i++) {
        total += probs[i];
    }
    let r = Math.random() * total;
    let running = 0;
    for (let i = 1; i < nextId; i++) {
        running += probs[i];
        if (running >= r) return i;
    }
    return nextId - 1;
}
function embedTokens(tokens) {
    let vec = new Float16Array(w1l);
    for (let i = 0; i < Math.min(tokens.length, 20); i++) {
        let id = tokens[i];
        for (let j = 0; j < w1l; j++) {
            vec[j] += embedding[id * embedding.cols + j];
        }
    }
    let scale = Math.max(1, tokens.length);
    for (let j = 0; j < w1l; j++) {
        vec[j] /= scale;
    }
    return vec;
}
const UNK = 0;
function addToken(token) {
    if (vocab[token] !== undefined) return vocab[token];
    if (nextId >= VOCAB_SIZE) return UNK;
    vocab[token] = nextId;
    idToToken[nextId] = token;
    return nextId++;
}
const chunks = ["tion", "ing", "dis", "pre", "un", "re", "able", "er", "the", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", " ", ".", ",", "!", "?", ";", ":", "-", "_", "{", "}", "[", "]", "\"", "'", "AI", "LLM", "model", "neural", "network", "data", "training", "inference", "token", "embedding", "layer", "activation", "function", "softmax", "relu", "backpropagation", "gradient", "descent", "overfitting", "underfitting", "regularization", "dropout", "batch", "epoch", "learning", "rate", "optimizer", "loss", "function", "accuracy", "precision", "recall", "F1-score", "confusion", "matrix", "cross-entropy", "mean", "squared", "error", "bias", "variance", "hyperparameter", "tuning", "validation", "set", "test", "split", "overlap", "context", "window", "attention", "mechanism", "transformer", "GPT", "BERT"];
chunks.sort((a, b) => b.length - a.length);
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
function mmult(A, B) {
    let colsB = B.cols;
    let rowsB = B.rows;
    let result = new Float16Array(colsB);
    for (let i = 0; i < rowsB; i++) {
        let temp = A[i];
        let offset = i * colsB;
        for (let j = 0; j < colsB; j++) {
            result[j] += temp * B[offset + j];
        }
    }
    return result;
}
function predict(inputVector) {
    let hidden1Raw = mmult(inputVector, weights1);
    let hidden1Active = new Float16Array(hiddenSize);
    for (let i = 0; i < hiddenSize; i++) {
        hidden1Active[i] = relu(hidden1Raw[i] + bias1[i]);
    }
    let hidden2Raw = mmult(hidden1Active, weights2);
    let hidden2Active = new Float16Array(hiddenSize);
    for (let i = 0; i < hiddenSize; i++) {
        hidden2Active[i] = relu(hidden2Raw[i] + bias2[i]);
    }
    let hidden3Raw = mmult(hidden2Active, weights3);
    let hidden3Active = new Float16Array(hiddenSize);
    for (let i = 0; i < hiddenSize; i++) {
        hidden3Active[i] = relu(hidden3Raw[i] + bias3[i]);
    }
    let outputRaw = mmult(hidden3Active, weights4);
    let logits = new Float16Array(VOCAB_SIZE);
    for (let i = 0; i < VOCAB_SIZE; i++) {
        logits[i] = outputRaw[i] + bias4[i];
    }
    return {
        hidden1: hidden1Active,
        hidden2: hidden2Active,
        hidden3: hidden3Active,
        output: softmax(logits)
    };
}
function relu(x) {
    return x > 0 ? x : x * 0.01;
}
function reluDerivative(x) {
    return x > 0 ? 1 : 0.01;
}
function train(inputVector, targetString) {
    let learningRate = 0.01;
    let forward = predict(inputVector);
    let targets = new Float16Array(VOCAB_SIZE);
    let targetTokens = tokenize(targetString);
    if (targetTokens.length > 0) {
        targets[targetTokens[0]] = 1;
    }
    let outputDeltas = new Float16Array(VOCAB_SIZE);
    for (let i = 0; i < VOCAB_SIZE; i++) {
        outputDeltas[i] = targets[i] - forward.output[i];
    }
    let hidden3Deltas = new Float16Array(hiddenSize);
    for (let i = 0; i < hiddenSize; i++) {
        let error = 0;
        let offset = i * weights4.cols;
        for (let j = 0; j < VOCAB_SIZE; j++) {
            error += outputDeltas[j] * weights4[offset + j];
        }
        hidden3Deltas[i] = error * reluDerivative(forward.hidden3[i]);
    }
    let hidden2Deltas = new Float16Array(hiddenSize);
    for (let i = 0; i < hiddenSize; i++) {
        let error = 0;
        let offset = i * weights3.cols;
        for (let j = 0; j < hiddenSize; j++) {
            error += hidden3Deltas[j] * weights3[offset + j];
        }
        hidden2Deltas[i] = error * reluDerivative(forward.hidden2[i]);
    }
    let hidden1Deltas = new Float16Array(hiddenSize);
    for (let i = 0; i < hiddenSize; i++) {
        let error = 0;
        let offset = i * weights2.cols;
        for (let j = 0; j < hiddenSize; j++) {
            error += hidden2Deltas[j] * weights2[offset + j];
        }
        hidden1Deltas[i] = error * reluDerivative(forward.hidden1[i]);
    }
    for (let i = 0; i < hiddenSize; i++) {
        let offset = i * weights4.cols;
        let h3Act = forward.hidden3[i];
        for (let j = 0; j < VOCAB_SIZE; j++) {
            weights4[offset + j] += h3Act * outputDeltas[j] * learningRate;
        }
    }
    for (let j = 0; j < VOCAB_SIZE; j++) {
        bias4[j] += outputDeltas[j] * learningRate;
    }
    for (let i = 0; i < hiddenSize; i++) {
        let offset = i * weights3.cols;
        let h2Act = forward.hidden2[i];
        for (let j = 0; j < hiddenSize; j++) {
            weights3[offset + j] += h2Act * hidden3Deltas[j] * learningRate;
        }
    }
    for (let j = 0; j < hiddenSize; j++) {
        bias3[j] += hidden3Deltas[j] * learningRate;
    }
    for (let i = 0; i < hiddenSize; i++) {
        let offset = i * weights2.cols;
        let h1Act = forward.hidden1[i];
        for (let j = 0; j < hiddenSize; j++) {
            weights2[offset + j] += h1Act * hidden2Deltas[j] * learningRate;
        }
    }
    for (let j = 0; j < hiddenSize; j++) {
        bias2[j] += hidden2Deltas[j] * learningRate;
    }
    for (let i = 0; i < weights1.rows; i++) {
        let offset = i * weights1.cols;
        let inpVal = inputVector[i] || 0;
        for (let j = 0; j < hiddenSize; j++) {
            weights1[offset + j] += inpVal * hidden1Deltas[j] * learningRate;
        }
    }
    for (let j = 0; j < hiddenSize; j++) {
        bias1[j] += hidden1Deltas[j] * learningRate;
    }
}
function chooseTheme(theme) {
    t = theme.toLowerCase();
    let cbox = "";
    let nbox = "";
    if(t === "coding" || t === "programming" || t === "technology" || t === "tech" || t === "computer science" || t === "cwding") {
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
function startBot() {
    const div = $("#sscreen");
    div.text("");
    let theme = prompt("First, let's choose a theme for our conversation!");
    chooseTheme(theme);
}
function botResponse(userInput) {
    console.log("botResponse");
    let userInp = userInput.toLowerCase();
    let $bp = $("<p>")
        .text("Fiery is typing...")
        .css({
            "transform": "translateX(-20rem)",
            "text-align": "left"
        })
        .appendTo("#sscreen");
    let img = $("<img>")
        .attr("src", "https://t3.ftcdn.net/jpg/02/84/46/60/360_F_284466038_lOHcM8pRGyigojkyV2M9CSQpimCTcqeD.jpg")
        .css({
            "width": "30px",
            "height": "30px",
            "border-radius": "50%",
            "position": "absolute",
            "transform": "translate(-25rem, -1.5rem)"
        })
        .appendTo($bp);
    btyping = true;
    setTimeout(function() {
        let tokens = tokenize(userInp);
        let inputVector = embedTokens(tokens);
        let generated = [];
        for(let step = 0; step < 20; step++) {
            let currentVector = embedTokens(tokens);
            let result = predict(currentVector);
            let tokenId = sample(result.output);
            generated.push(tokenId);
            tokens = Uint16Array.from([...tokens, tokenId]);
        }
        let responseText = detokenize(generated);
        responseText = responseText.replace(/<br>/g, "\n");
        $bp.html(responseText);
        btyping = false;
    }, 1000);
}
function startChat() {
    let userInp = "";
    const uFiles = [];
    const div = $("<div>")
        .attr("id", "inp")
        .css({
            "width": "32.2rem",
            "height": "2rem",
        })
        .appendTo("#sscreen");
    const fileInput = $("<input>")
        .attr("type", "file")
        .attr("id", "hiddenFileUpload")
        .css("display", "none")
        .appendTo("#sscreen");
    const inp = $("<input>")
        .attr("placeholder", "Type something...")
        .css({
            "position": "fixed",
            "transform": "translate(-200px,42.5rem)",
            "width": "30rem",
            "height": "1.9rem",
            "font-size": "1.2rem"
        })
        .appendTo(div);
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
        .appendTo(div);
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
            if(file.name.endsWith(".js") || file.name.endsWith(".py") || file.name.endsWith(".java") || file.name.endsWith(".cpp") || file.name.endsWith(".c") || file.name.endsWith(".html") || file.name.endsWith(".sql") || file.name.endsWith(".r") || file.name.endsWith(".ps1") || file.name.endsWith(".css")){
                img = "https://cdn-icons-png.flaticon.com/128/18432/18432858.png";
            }else{
                img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKoAAACUCAMAAAA02EJtAAAAulBMVEX////+zgDtsADtrgD/ywD25IXo6efo5unw8fDstTH036rsqQDqqgDw1JT05rjusBDqvl786rDq6+X40DX///vv0YH69N3+/vT3yQD3zQD9/OXwtgT9++327s705Lvu3J3otTntsiLr0onqyXHoshfy5K368MbtymTqvU3luj7ux2nrw1Xz2pTsyX3s48Dn6d3k6/P43Gj41Uv15JH68b77+NP30Sb333n42Vv56qb54Ij65Jn78rf4wgC0dQA0AAAEYUlEQVR4nO2cbXPaMAzHCTZQSNYNCCHQsD4x1q7bukB4KGPf/2vNDhRI0jtLDongzv/rq17b/JBkyZKdVipGRkZGRkZGRkZGRkYXpGD09RqqUUBJent3/xms++aDV3FpQINHm7EqVIwxe/yNBNR1W44AAKPKn2WOZC3fssEYw/lu2QeKEJjYKJvuUJ3v/fJRW7aOVZn9WH4m0EDd4j55l4JatcejC0EViaB5fRGoMe64VWrO0keVi+unKzJzWbS5UJnTKzER5ECNaZ8n/fO36g7Yaf54+IRS66ueK/KiSlikbPYy0lmO+VGruO2O3O/YTZ2cfAKrboMWrHgP8aIRA0lUzCOxSjzGmVBYVUciI+dDLdKmScsyu6ePKgNu3CxaDtsuwTyo8iP/em3UC9bvO3YCq7Kn13qjaP25tvOjVtmXTqNxVbQ6z84JrCpQr/C/j1W/F6+vBKrYm0GKVwK1KL4DVKXiNeUKdnrp76tVLqpQcOcwlkYFqUjU/ibsZrSwOBdffuKb09lQbdkiULcP7benAgomzruR8s8WYlXJOl/5UNAYdqHcFRQUAN5ygOCMWaeqgc2pUeOmMNgsMBbdyp+XjCqdH618NKgw66Zs1IoXaoAKJ/B2majCosFMw/exfNW6OrFVN1NNUMsaqHqYLKr2tMR151NdTuH/UPXcj6zqRW0drcOBtkmF/99Upkiiyg/m1rpaVgGXpo+1UOWqrFWHq3yP1NVK2W6nUd0ZCahlrVWkGVRPy/snkKoAZFE3OoXmBFqod4Fp1CVNpPKV0qgZ1AUJqcVn6K31nMj//lDdYKVQ32j8b3UBp4sp1JACVfRaSxdr1SFNquJWBGiwj1HrlQjbZpxIXcgpaBKVqlSFkCF2IgCCFRHqXwBpEtUj8r+yAciiUlXVLugQI4Ea0pDyJYT0GLXeIfK/sq3Ooo4IqyoO9WpGVFUBu6oUaoeoVeGgVJVAHVE1ABNYQ390bHFLA8qnsFA9Rl1aJAEQ76pwqM85RiO5pJxVZFBvaIxqLaB3Aw6o/0hAAdPq80GtAUmPDtlpSIG7qmNUEao0Uo5V06jMofJ/CCXdo1aJ6j+HpqoDKpn/lWPVDCqR/wFj1bNBXcNPHt4zANWuGtYAHKGShaqcVUDtukOlSlXABuAcUIENwB6VMaKqypWn1VlUqlBdYE4e4wAg8z+8qu6tSlVVEalqh0rmf9TLJTEqVakKUe8XxbFKhTrDkEpUdkNVVXG3mGNUGlLgWDWBSuV/OVZFJFYZqxeRqraoNKTQseoxKk2oct7FkUpUqqqKS1UxKlGoIlOVRCVKVXyKfY2lZVP5f4l9a5cMFTxWPaBShar6ClgGlSqrrtBvbbeoVtUa/c7dhGpVRWhUsitA+Kun0fleAUurTYOqvq2a1YQGFTFW3WtIcgcAX1WF3DWFWTGzyoOC8i+scX+tcfdc3uSv+bxcDWZa/19EfrphNKuVqKivf6HfyMjIyMjIyMjIyMjICKf/BvuTykEdtHkAAAAASUVORK5CYII=";
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
            inp.val("");
            if(userInp.length > 1000000) {
                userInp = userInp.substring(0, 1000000);
            } if (userInp.length > 75) {
                userInp = userInp.match(/.{1,75}/g).join("<br>");
            } let $p = $("<p>")
                .html(userInp)
                .css({
                    "transform": "translateX(20rem)",
                    "text-align": "right"
                })
                .appendTo("#sscreen");
            botResponse(userInp);
        }
    });
}
function signUpLogIn() {
    const div = $("#sscreen");
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
                errorMsg.text("Please enter a valid email")
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
            } else{
                errorMsg.remove();
                let userData = {
                    name: nameInp.val(),
                    email: ama.val(),
                    password: apa.val(),
                    theme: t!=="" ? t : "not set"
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
function goBack() {    
    const div = $("#sscreen");
    div.html(`
        <div id="wscreen">
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
        </div>
        <a onclick="goBack()" id="logolink">
            <img src="https://t3.ftcdn.net/jpg/02/84/46/60/360_F_284466038_lOHcM8pRGyigojkyV2M9CSQpimCTcqeD.jpg" width="35px" id="logo" alt="FireBot Logo">
            <span> FireBot</span>
        </a>
    `);
}