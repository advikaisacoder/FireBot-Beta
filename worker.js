const VOCAB_SIZE = 31000;
const hiddenSize = 16000;
const embeddingSize = 128;
const w1l = embeddingSize;
function randomFlat(length) {
    let arr = new Float16Array(length);
    for (let i = 0; i < length; i++) {
        arr[i] = Math.random() * 0.2 - 0.1;
    }
    return arr;
}
let vocab = self.vocab;
let idToToken = self.idToToken;
let nextId = self.nextId;
let userInp = self.userInp;
function randomMatrix(rows, cols) {
    let matrix = randomFlat(rows * cols);
    matrix.rows = rows;
    matrix.cols = cols;
    return matrix;
}
function relu(x) {
    return x > 0 ? x : x * 0.01;
}
function reluDerivative(x) {
    return x > 0 ? 1 : 0.01;
}
function train(inputMatrix, targetString) {
    let learningRate = 0.001
    let hidden1Raw = mmult(inputMatrix, weights1)
    let hidden1Active = new Float16Array(hiddenSize)
    for (let i = 0; i < hiddenSize; i++) {
        hidden1Active[i] = relu(hidden1Raw[i] + bias1[i])
    }
    let hidden2Raw = mmult(hidden1Active, weights2)
    let hidden2Active = new Float16Array(hiddenSize)
    for (let i = 0; i < hiddenSize; i++) {
        hidden2Active[i] = relu(hidden2Raw[i] + bias2[i])
    }
    let hidden3Raw = mmult(hidden2Active, weights3)
    let hidden3Active = new Float16Array(hiddenSize)
    for (let i = 0; i < hiddenSize; i++) {
        hidden3Active[i] = relu(hidden3Raw[i] + bias3[i])
    }
    let outputRaw = mmult(hidden3Active, weights4)
    let finalOutput = new Float16Array(VOCAB_SIZE)
    for (let i = 0; i < VOCAB_SIZE; i++) {
        finalOutput[i] = outputRaw[i] + bias4[i]
    }
    let sum = 0
    for (let i = 0; i < VOCAB_SIZE; i++) {
        finalOutput[i] = Math.exp(finalOutput[i])
        sum += finalOutput[i]
    }
    for (let i = 0; i < VOCAB_SIZE; i++) {
        finalOutput[i] /= sum
    }
    let targets = new Float16Array(VOCAB_SIZE)
    let targetTokens = tokenize(targetString)
    if (targetTokens.length > 0) {
        targets[targetTokens[0]] = 1
    }
    let outputDeltas = new Float16Array(VOCAB_SIZE)
    for (let i = 0; i < VOCAB_SIZE; i++) {
        outputDeltas[i] = finalOutput[i] - targets[i]
    }
    let hidden3Deltas = new Float16Array(hiddenSize)
    for (let i = 0; i < hiddenSize; i++) {
        let error = 0
        for (let j = 0; j < VOCAB_SIZE; j++) {
            error += outputDeltas[j] * weights4[i * VOCAB_SIZE + j]
        }
        hidden3Deltas[i] = error * reluDerivative(hidden3Active[i])
    }
    let hidden2Deltas = new Float16Array(hiddenSize)
    for (let i = 0; i < hiddenSize; i++) {
        let error = 0
        for (let j = 0; j < hiddenSize; j++) {
            error += hidden3Deltas[j] * weights3[i * hiddenSize + j]
        }
        hidden2Deltas[i] = error * reluDerivative(hidden2Active[i])
    }
    let hidden1Deltas = new Float16Array(hiddenSize)
    for (let i = 0; i < hiddenSize; i++) {
        let error = 0
        for (let j = 0; j < hiddenSize; j++) {
            error += hidden2Deltas[j] * weights2[i * hiddenSize + j]
        }
        hidden1Deltas[i] = error * reluDerivative(hidden1Active[i])
    }
    for (let i = 0; i < hiddenSize; i++) {
        for (let j = 0; j < VOCAB_SIZE; j++) {
            weights4[i * VOCAB_SIZE + j] -= hidden3Active[i] * outputDeltas[j] * learningRate
        }
    }
    for (let j = 0; j < VOCAB_SIZE; j++) {
        bias4[j] -= outputDeltas[j] * learningRate
    }
    for (let i = 0; i < hiddenSize; i++) {
        for (let j = 0; j < hiddenSize; j++) {
            weights3[i * hiddenSize + j] -= hidden2Active[i] * hidden3Deltas[j] * learningRate
        }
    }
    for (let j = 0; j < hiddenSize; j++) {
        bias3[j] -= hidden3Deltas[j] * learningRate
    }
    for (let i = 0; i < hiddenSize; i++) {
        for (let j = 0; j < hiddenSize; j++) {
            weights2[i * hiddenSize + j] -= hidden1Active[i] * hidden2Deltas[j] * learningRate
        }
    }
    for (let j = 0; j < hiddenSize; j++) {
        bias2[j] -= hidden2Deltas[j] * learningRate
    }
    for (let i = 0; i < inputMatrix.length; i++) {
        for (let j = 0; j < hiddenSize; j++) {
            weights1[i * hiddenSize + j] -= inputMatrix[i] * hidden1Deltas[j] * learningRate
        }
    }
    for (let j = 0; j < hiddenSize; j++) {
        bias1[j] -= hidden1Deltas[j] * learningRate
    }
}
postMessage({
    action: "INIT_VOCAB",
    vocab,
    idToToken,
    nextId
});
let embedding = randomMatrix(VOCAB_SIZE, embeddingSize);
let weights1 = randomMatrix(embeddingSize, hiddenSize);
let bias1 = new Float16Array(hiddenSize).fill(0);
let weights2 = randomMatrix(hiddenSize, hiddenSize);
let bias2 = new Float16Array(hiddenSize).fill(0);
let weights3 = randomMatrix(hiddenSize, hiddenSize);
let bias3 = new Float16Array(hiddenSize).fill(0);
let weights4 = randomMatrix(hiddenSize, VOCAB_SIZE);
let bias4 = new Float16Array(VOCAB_SIZE).fill(0);
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
for (let chunk of chunks) {
    addToken(chunk);
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
function relu(x) {
    return x > 0 ? x : x * 0.01;
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
onmessage = function(event) {
    let package = event.data;
    if (package.action === "PREDICT_NEXT_TOKENS") {
        let tokens = package.inputTokens;
        let generated = [];
        if(!userInp.includes("/")){
            for (let step = 0; step < 6; step++) {
                let currentVector = embedTokens(tokens);
                let result = predict(currentVector);
                let tokenId = sample(result.output);
                generated.push(tokenId);
                tokens = Uint16Array.from([...tokens, tokenId]);
            }
            console.log("success")
            postMessage(generated);
        }
    }
    if (package.action === "INIT_VOCAB") {
        vocab = package.vocab;
        idToToken = package.idToToken;
        nextId = package.nextId;
        console.log("good")
        postMessage("VOCAB_INITIALIZED");
    }
};