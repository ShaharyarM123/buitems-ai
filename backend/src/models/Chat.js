import mongoose from 'mongoose';

// 1. Message Sub-Schema
const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// 2. Main Chat Schema (Yeh bilkul safe hai aur yahan mojud hai!)
const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  messages: [messageSchema]
}, { timestamps: true });

// 3. Model creation
const Chat = mongoose.model('Chat', chatSchema);

export default Chat;