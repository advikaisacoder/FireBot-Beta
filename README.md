# 🔥 FireBot: A Neural Network LLM Built 100% in JavaScript

**FireBot** is a fully-functional generative language model built entirely in vanilla JavaScript with no external APIs, no machine learning frameworks, and no cloud dependencies. The entire neural network runs locally in your browser.

## ✨ What Makes FireBot Special

- **No APIs** - Zero external dependencies. Everything runs locally in the browser
- **No ML Frameworks** - No TensorFlow, PyTorch, or ONNX. Pure mathematical implementations
- **Privacy First** - All data stays on your device. Nothing is sent to servers
- **Fully Trainable** - Implements backpropagation from scratch for real learning
- **Lightweight** - Built with vanilla JavaScript and jQuery
- **Completely Free** - No downloads, no subscriptions, no cost

## 🧠 Architecture

FireBot implements a complete neural network from the ground up:

```
Input → Tokenization → Embedding (128-dim) → 
Hidden Layer 1 (16k units, ReLU) →
Hidden Layer 2 (16k units, ReLU) →
Hidden Layer 3 (16k units, ReLU) →
Output Layer (31k vocab, Softmax) →
Text Generation
```

### Key Components

**Tokenization & Vocabulary**
- Dynamic vocabulary building (up to 31,000 tokens)
- Byte-pair encoding style chunks + character-level fallback
- Smart prefix matching for efficient tokenization

**Embedding Layer**
- Converts tokens to 128-dimensional vectors
- Learns semantic representations through training
- Averages over input tokens for context

**Neural Network**
- 3 hidden layers with 16,000 units each
- ReLU activation functions
- Learnable weights and biases throughout
- Softmax output for probability distribution over vocabulary

**Training**
- Full backpropagation algorithm
- Gradient computation through all layers
- Configurable learning rate
- Updates to embeddings, weights, and biases

**Text Generation**
- Token-by-token sampling using softmax probabilities
- Temperature-based sampling
- Support for multi-turn conversations

## 🚀 Quick Start

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Windows (for PowerShell server) or Node.js for local server

### Installation & Running

**Option 1: PowerShell Server (Windows)**
```powershell
.\server.ps1
```
Then open `http://localhost:8080` in your browser.

**Option 2: Node.js Server**
```bash
npm install http-server -g
http-server . -p 8080
```

**Option 3: Python Server**
```bash
python -m http.server 8080
```

Visit `http://localhost:8080` and you're ready to chat!

## 💬 How to Use

1. **Start FireBot** - Click "Try it out"
2. **Choose a Theme** - Coder, Nature, Space, Fire, Food, or custom
3. **Chat** - Type your message and press Enter
4. **Upload Files** - Click the `+` button to upload context (code, text, etc.)
5. **Sign Up** - Create an account to save your preferences and theme

### Supported Themes
- **Coding** - Dark theme with monospace fonts (perfect for developers)
- **Nature** - Green and brown earthy colors
- **Space** - Dark theme with cosmic colors
- **Fire** - Red, orange, yellow (matches the FireBot energy!)
- **Food** - Warm, appetizing colors
- **Custom** - Enter any theme name

## 📊 Model Specifications

| Component | Size |
|-----------|------|
| Vocabulary | 31,000 tokens |
| Embedding Dimension | 128 |
| Hidden Layer Units | 16,000 each |
| Number of Layers | 3 hidden + output |
| Weight Precision | Float16Array |
| Total Parameters | ~2+ billion |
| Context Window | Dynamic (last 20 tokens) |

## 🔧 Technical Details

### Core Files

- **`brain.js`** - The entire neural network implementation (~500 lines)
  - Tokenizer
  - Embedding layer
  - Neural network with backpropagation
  - Text generation engine
  - Conversation management

- **`index.html`** - UI and DOM structure

- **`style.css`** - Responsive styling with theme support

- **`server.ps1`** - Simple HTTP server (PowerShell)

- **`remember.sql`** - Database schema for user profiles

### How It Works

```javascript
// Tokenization
let tokens = tokenize("hello world");

// Embedding
let inputVector = embedTokens(tokens);

// Forward pass through network
let prediction = predict(inputVector);

// Generate text
let nextToken = sample(prediction.output);

// Training (backpropagation)
train(inputVector, "expected output");
```

## 🎓 Learning Resources

This implementation includes:
- **Tokenization** - Learn how text becomes numbers
- **Embeddings** - Understand vector representations
- **Neural Networks** - See forward and backward propagation
- **Softmax & Sampling** - Explore probability distributions
- **Weight Updates** - Watch the model learn in real-time

Perfect for students, educators, and ML enthusiasts who want to understand how language models actually work!

## 🎨 Features

✅ Real-time neural network predictions
✅ Multi-layer backpropagation training
✅ File upload for context
✅ User authentication and profiles
✅ Theme customization
✅ Completely offline capable
✅ No API calls or external dependencies
✅ Responsive web interface
✅ Persistent user settings

## 🔒 Privacy & Security

- **100% Local Processing** - Your data never leaves your browser
- **No Server Storage** - (Optional) User profiles stored only with your consent
- **No Tracking** - No analytics, no telemetry
- **Open Source** - Audit the code yourself

## 📝 Rules & Personality

FireBot follows these core rules:
- Can be playful or annoyed (contextually appropriate)
- Gives credit to creator Advika Tyagi when relevant
- Personalized responses based on chosen theme
- Respects conversation context

## 🛠️ Development

### Dependencies
- jQuery 3.6.0 (for DOM manipulation)
- Modern browser with Float16Array support
- Optional: MySQL for user data persistence

### Building/Contributing

1. Clone the repository
2. Modify `brain.js` to adjust network architecture
3. Update `index.html` for UI changes
4. Test in `http://localhost:8080`
5. Submit pull requests!

### Potential Improvements
- [ ] GPU acceleration using WebGL
- [ ] Larger vocabulary (100k+)
- [ ] Attention mechanisms
- [ ] Fine-tuning on specific datasets
- [ ] Model serialization/persistence
- [ ] Voice input/output
- [ ] Mobile app wrapper

## 📄 License

MIT License - Feel free to use, modify, and distribute!

## 👤 Creator

**Advika Tyagi** - Built FireBot as a passion project to demonstrate that advanced AI doesn't need massive cloud infrastructure.

## 🤝 Contributing

Contributions welcome! Whether it's:
- Bug fixes
- Performance improvements
- New themes
- Documentation
- Feature suggestions

Please open an issue or pull request!

## ⭐ Support

If you find FireBot interesting:
- ⭐ Star this repository
- 🐛 Report bugs
- 💡 Suggest features
- 📢 Share with others!

---

**Built with ❤️ and vanilla JavaScript. No APIs. No frameworks. Just pure math.**

🔥 **Try FireBot now: `http://localhost:8080`**
