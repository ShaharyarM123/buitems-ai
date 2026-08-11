//14th edit

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lightbulb, Send, Settings, FileText, HelpCircle, User, X, 
  CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, 
  BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp, Menu, 
  Sparkles, Bot, Zap, Flame, Compass, Paperclip, Mic 
} from 'lucide-react';
import { secureFetch } from '@/utils/apiHelper';
import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
import AIResponseCard from '@/components/AIResponseCard';
import SettingsModal from '@/components/SettingsModal';

function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState('Ask Anything');
  const [showSettings, setShowSettings] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toolStates, setToolStates] = useState({
    'Ask Anything': { messages: [], input: '' },
    'Note Expander': { messages: [], input: '' },
    'PDF Uploader': { messages: [], input: '' },
  });
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // --- CURRENT TOOL STATE DEFINATION ---
  const currentToolState = toolStates[activeTab] || { messages: [], input: '' };

  // --- USER PROFILE & THEME STATES ---
  const [userName, setUserName] = useState('MIR SHAHARYAR');
  const [tempName, setTempName] = useState('MIR SHAHARYAR');
  const [isEditingName, setIsEditingName] = useState(false);
  const [themeMode, setThemeMode] = useState('light');

  // --- PERSONAL BOOKSHELF STATES ---
  const [bookshelves, setBookshelves] = useState([]);
  const [activeBookshelfId, setActiveBookshelfId] = useState(null);
  const [viewingBookshelf, setViewingBookshelf] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingItemToSave, setPendingItemToSave] = useState(null);
  const [newBookshelfName, setNewBookshelfName] = useState('');

  // --- MOCK TEST STATES ---
  const [savedTests, setSavedTests] = useState([]);
  const [testHistories, setTestHistories] = useState({});
  const [activeTest, setActiveTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);

  // --- NOTE EXPANDER STATES ---
  const [noteExpanderImages, setNoteExpanderImages] = useState([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const noteImageInputRef = useRef(null);

  // --- PDF UPLOADER STATES ---
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
  const pdfInputRef = useRef(null);

  // --- AUTH GUARD ---
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTests = localStorage.getItem('buitems_mock_tests');
      const storedHistories = localStorage.getItem('buitems_test_histories');
      const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
      const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
      const storedName = localStorage.getItem('buitems_user_name');
      const storedTheme = localStorage.getItem('buitems_theme_mode');

      if (storedTests) setSavedTests(JSON.parse(storedTests));
      if (storedHistories) setTestHistories(JSON.parse(storedHistories));
      if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
      if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
      if (storedName) {
        setUserName(storedName);
        setTempName(storedName);
      }
      if (storedTheme) setThemeMode(storedTheme);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [toolStates, activeTab, loading]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setToolStates(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], input: val }
    }));
  };

  const handleSaveName = () => {
    if (!tempName.trim()) return;
    setUserName(tempName.trim());
    localStorage.setItem('buitems_user_name', tempName.trim());
    setIsEditingName(false);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      router.replace('/login');
      router.refresh();
    }
  };

  const handleTriggerSave = (msgText, queryText) => {
    if (!activeBookshelfId) {
      setPendingItemToSave({ text: msgText, title: queryText });
      setNewBookshelfName(queryText || 'My Study Notes');
      setShowSaveModal(true);
    } else {
      saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
    }
  };

  const handleCreateNewBookshelfAndSave = () => {
    if (!newBookshelfName.trim()) return;
    const shelfId = Date.now().toString();
    const newShelf = {
      id: shelfId,
      title: newBookshelfName.trim(),
      date: new Date().toLocaleDateString(),
      items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
    };

    const updatedShelves = [newShelf, ...bookshelves];
    setBookshelves(updatedShelves);
    setActiveBookshelfId(shelfId);

    localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
    localStorage.setItem('buitems_active_bookshelf_id', shelfId);

    setShowSaveModal(false);
    setPendingItemToSave(null);
    setNewBookshelfName('');
    alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
  };

  const saveItemToBookshelf = (shelfId, item) => {
    const updatedShelves = bookshelves.map(shelf => {
      if (shelf.id === shelfId) {
        return { ...shelf, items: [item, ...shelf.items] };
      }
      return shelf;
    });
    setBookshelves(updatedShelves);
    localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
    alert("Successfully saved to your active bookshelf!");
  };

  const handleDeleteBookshelf = (e, shelfId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this bookshelf?")) {
      const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
      setBookshelves(updatedShelves);
      localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
      if (activeBookshelfId === shelfId) {
        setActiveBookshelfId(null);
        localStorage.removeItem('buitems_active_bookshelf_id');
      }
      if (viewingBookshelf && viewingBookshelf.id === shelfId) {
        setViewingBookshelf(null);
      }
    }
  };

  const handleClearAllBookshelves = () => {
    if (window.confirm("Are you sure you want to delete all bookshelves?")) {
      setBookshelves([]);
      setActiveBookshelfId(null);
      setViewingBookshelf(null);
      localStorage.removeItem('buitems_personal_bookshelves');
      localStorage.removeItem('buitems_active_bookshelf_id');
    }
  };

  const handleDeleteTest = (e, testId) => {
    e.stopPropagation();
    const updatedTests = savedTests.filter(t => t.id !== testId);
    setSavedTests(updatedTests);
    localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
    if (activeTest && activeTest.id === testId) setActiveTest(null);
  };

  const handleClearAllTests = () => {
    if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
      setSavedTests([]);
      localStorage.removeItem('buitems_mock_tests');
      setActiveTest(null);
    }
  };

  const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
    const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

    try {
      if (typeof rawText === 'string') {
        let cleaned = rawText.trim();
        const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) cleaned = match[1].trim();

        const firstBracket = cleaned.indexOf('[');
        const lastBracket = cleaned.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
          cleaned = cleaned.substring(firstBracket, lastBracket + 1);
        }

        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validQuestions = parsed.map(q => ({
            question: q.question || "Sample Question?",
            options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
            correct: typeof q.correct === 'number' ? q.correct : 0,
            topic: q.topic || topicName
          }));

          const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
          const updatedTests = [newTest, ...savedTests];
          setSavedTests(updatedTests);
          localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
          setActiveTest(newTest);
          setActiveTab('Mock Tests');
          return;
        }
      }
    } catch (err) {
      console.warn("JSON parse error caught safely, switching to fallback test:", err);
    }

    const fallbackQuestions = [];
    for (let i = 1; i <= 50; i++) {
      fallbackQuestions.push({
        question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
        options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
        correct: 0,
        topic: topicName
      });
    }

    const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
    const updatedTests = [fallbackTest, ...savedTests];
    setSavedTests(updatedTests);
    localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
    setActiveTest(fallbackTest);
    setActiveTab('Mock Tests');
  };

  const handleImageUpload = (fileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: file.name,
          base64: e.target.result,
        };
        setNoteExpanderImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePdfUpload = (fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      alert('Please upload a valid PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedPdf({
        name: file.name,
        size: file.size,
        base64: e.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const removePdf = () => setSelectedPdf(null);

  const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
  const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
  const handlePdfDrop = (e) => {
    e.preventDefault();
    setIsPdfDraggingOver(false);
    if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
  };

  const handleSendQuery = async (e, customPrompt = null) => {
    if (e) e.preventDefault();
    const queryText = (customPrompt || currentToolState.input).trim();
    const isNoteExpander = activeTab === 'Note Expander';
    const isPdfUploader = activeTab === 'PDF Uploader';
    const hasImages = isNoteExpander && noteExpanderImages.length > 0;
    const hasPdf = isPdfUploader && !!selectedPdf;

    if ((!queryText && !hasImages && !hasPdf) || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText || (hasImages
        ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
        : hasPdf
          ? `📄 Uploaded ${selectedPdf.name}`
          : '')
    };
    
    setToolStates(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
    }));
    setLoading(true);

    try {
      let finalQuery = queryText;
      const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

      const lowerQuery = queryText.toLowerCase();
      const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
      const previousMessages = toolStates[activeTab]?.messages || [];
      
      if (hasPronoun && previousMessages.length > 0) {
        const lastMsg = previousMessages[previousMessages.length - 1];
        const contextTopic = lastMsg.queryContext || lastMsg.text || '';
        if (contextTopic) {
          finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
        }
      }

      if (isMockReq && activeTab === 'Ask Anything') {
        finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
      }

      if (isNoteExpander) {
        finalQuery += `\n\n[SYSTEM INSTRUCTION: Expand and correct the rough notes provided.]`;
      }

      if (isPdfUploader) {
        finalQuery += `\n\n[SYSTEM INSTRUCTION: Analyze the PDF and provide structured study summaries.]`;
      }

      // Dynamic Backend URL for Mobile / Production Support
      const API_BASE_URL = 'https://buitems-ai-production.up.railway.app';        
     // ✅ Is tarah direct likh do:
let endpoint = 'https://buitems-ai-production.up.railway.app/api/ai/ask-anything';
if (activeTab === 'Note Expander') endpoint = 'https://buitems-ai-production.up.railway.app/api/ai/expand-notes';
else if (activeTab === 'PDF Uploader') endpoint = 'https://buitems-ai-production.up.railway.app/api/ai/pdf-analysis';

      const payload = { prompt: finalQuery, tool: activeTab };
      if (hasImages) payload.images = noteExpanderImages.map(img => img.base64);
      if (hasPdf) {
        payload.pdf = selectedPdf.base64;
        payload.pdfName = selectedPdf.name;
      }

      const response = await secureFetch(endpoint, {
        method: 'POST', // <-- Method explicitly set to POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response) {
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to process AI generation request.');

      const rawContent = data.result || data.text || data.content || JSON.stringify(data);

      if (isMockReq) {
        extractAndSavedMockTestSafe(rawContent, queryText);
        setLoading(false);
        return;
      }

      const aiResponse = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        result: rawContent, 
        text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
        queryContext: queryText 
      };

      setToolStates(prev => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
      }));

      if (hasImages) setNoteExpanderImages([]);
      if (hasPdf) setSelectedPdf(null);

    } catch (err) {
      setToolStates(prev => ({
        ...prev,
        [activeTab]: { 
          ...prev[activeTab], 
          messages: [...prev[activeTab].messages, { id: Date.now().toString(), sender: 'ai', text: `Error: ${err.message}` }] 
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qIdx, optIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitTest = () => {
    let score = 0;
    let weakTopicsMap = [];

    activeTest.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score += 1;
      else weakTopicsMap.push(q.topic || activeTest.title);
    });

    const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
    const weakTopics = [...new Set(weakTopicsMap)];
    const previousHistory = testHistories[activeTest.id];
    let comparisonMessage = "First Attempt Completed!";
    let statusColor = "text-zinc-600";

    if (previousHistory) {
      if (percentage > previousHistory.lastPercentage) {
        comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
        statusColor = "text-emerald-600 font-bold";
      } else if (percentage < previousHistory.lastPercentage) {
        comparisonMessage = `Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
        statusColor = "text-red-600 font-bold";
      } else {
        comparisonMessage = `Consistent performance at ${percentage}%.`;
        statusColor = "text-zinc-600";
      }
    }

    const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
    setTestResult(resultObj);
    const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
    setTestHistories(updatedHistory);
    localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
  };

  const handleRetakeTest = () => {
    const shuffledQuestions = activeTest.questions.map(q => {
      const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
      optionsWithIndex.sort(() => Math.random() - 0.5);
      return {
        ...q,
        options: optionsWithIndex.map(o => o.text),
        correct: optionsWithIndex.findIndex(o => o.isCorrect)
      };
    });
    setActiveTest({ ...activeTest, questions: shuffledQuestions });
    setSelectedAnswers({});
    setTestResult(null);
    setCurrentQuestionIndex(0);
  };

  const handleExitTest = () => {
    setActiveTest(null);
    setTestResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleResetSession = () => {
    setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
    setActiveBookshelfId(null);
    localStorage.removeItem('buitems_active_bookshelf_id');
    setNoteExpanderImages([]);
    setSelectedPdf(null);
  };

  const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

  if (!mounted) return null;

  return (
    <div className="flex h-[100dvh] bg-white text-black font-sans overflow-hidden relative selection:bg-emerald-500 selection:text-white">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[650px] h-[500px] bg-gradient-to-br from-emerald-100/50 via-zinc-100/60 to-white blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[350px] bg-gradient-to-tr from-emerald-50/60 to-white blur-[130px] rounded-full pointer-events-none z-0" />

      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-30 w-72 border-r border-zinc-200 bg-zinc-50/95 backdrop-blur-2xl flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white">
                <Sparkles className="w-5 h-5 animate-pulse text-white" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-wider text-zinc-900">Echo AI Study</h1>
                <p className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase truncate max-w-[120px]">{userName}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden text-zinc-500 hover:text-black p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-3 mb-2">Core Tools</div>
          <nav className="space-y-1.5">
            {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
              const isActive = activeTab === name;
              return (
                <button
                  key={name}
                  onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                       ? 'bg-zinc-200 text-black border border-zinc-300 shadow-sm'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-500'}`} /> {name}
                </button>
              );
            })}
          </nav>

          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-3 mt-6 mb-2">Library & Workspace</div>
          <nav className="space-y-1.5">
            {['Personal Bookshelf', 'Mock Tests'].map((name) => {
              const isActive = activeTab === name;
              return (
                <button
                  key={name}
                  onClick={() => { setActiveTab(name); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-zinc-200 text-black border border-zinc-300 shadow-sm'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                  }`}
                >
                  <HelpCircle className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-500'}`} /> {name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Account Box */}
        <div className="pt-4 border-t border-zinc-200 space-y-2">
          <button
            onClick={() => { setIsSettingsOpen(true); setIsMobileSidebarOpen(false); }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-all w-full"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-200 border border-zinc-300 text-zinc-700 flex items-center justify-center font-bold text-xs shadow-sm">
              <Settings className="w-3.5 h-3.5" />
            </div>
            <span>Settings & Profile</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all w-full"
          >
            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col justify-between bg-transparent relative z-10 overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 shrink-0"
              title="Open Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="px-3.5 py-1.5 rounded-full border border-zinc-200 bg-zinc-100 text-[11px] font-semibold uppercase tracking-wider text-zinc-700 truncate">
              Session: <span className="text-emerald-600 font-bold">{activeTab}</span>
            </span>
            {activeBookshelfId && activeTab === 'Ask Anything' && (
              <span className="hidden lg:inline-block text-[11px] font-semibold text-zinc-900 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full truncate max-w-[220px]">
                Shelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
              </span>
            )}
          </div>
          {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
            <button 
              onClick={handleResetSession} 
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 transition-all shrink-0 ml-2 shadow-sm"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reset Chat</span>
            </button>
          )}
        </header>

        {/* Tab Content Routing */}
        {activeTab === 'Personal Bookshelf' ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
            {!viewingBookshelf ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-zinc-900">My Personal Bookshelf</h2>
                    <p className="text-xs text-zinc-500 mt-1">Manage saved study modules and topic notes.</p>
                  </div>
                  {bookshelves.length > 0 && (
                    <button
                      onClick={handleClearAllBookshelves}
                      className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
                    </button>
                  )}
                </div>

                {bookshelves.length === 0 ? (
                  <div className="p-16 border border-zinc-200 bg-zinc-50 backdrop-blur-xl rounded-3xl text-center space-y-4 shadow-xl">
                    <BookOpen className="w-12 h-12 mx-auto text-zinc-400 animate-pulse" />
                    <h3 className="text-lg font-bold text-zinc-800">No bookshelves created yet.</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Go to <span className="text-emerald-600 font-semibold">Ask Anything</span>, generate study notes, and click <span className="text-zinc-900 font-semibold">"Save to Bookshelf"</span> to build your custom library.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookshelves.map((shelf) => (
                      <div
                        key={shelf.id}
                        onClick={() => setViewingBookshelf(shelf)}
                        className="p-6 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded-2xl flex flex-col justify-between h-48 transition-all shadow-md cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <h3 className="text-sm font-bold text-zinc-900 capitalize pr-6 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-emerald-600" /> {shelf.title}
                            </h3>
                            <button
                              onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
                              className="text-zinc-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
                          <span className={`text-[11px] font-semibold ${activeBookshelfId === shelf.id ? 'text-emerald-600' : 'text-zinc-500'}`}>
                            {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
                          </span>
                          <span className="px-3.5 py-1.5 bg-black text-white hover:bg-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors">
                            Open Shelf <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                  <div>
                    <button onClick={() => setViewingBookshelf(null)} className="text-xs text-zinc-500 hover:text-black hover:underline mb-1">← Back to All Bookshelves</button>
                    <h2 className="text-lg font-extrabold text-zinc-900 capitalize flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-600" /> {viewingBookshelf.title}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveBookshelfId(viewingBookshelf.id);
                      localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
                      alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeBookshelfId === viewingBookshelf.id ? 'bg-black text-white font-extrabold shadow-md' : 'bg-zinc-100 text-zinc-900 border border-zinc-300 hover:bg-zinc-200'}`}
                  >
                    {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
                  </button>
                </div>

                <div className="space-y-4">
                  {viewingBookshelf.items.map((item, idx) => (
                    <div key={idx} className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 shadow-md">
                      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600">Topic: {item.title || viewingBookshelf.title}</h4>
                        <span className="text-[10px] text-zinc-500">{item.date}</span>
                      </div>
                      <div className="text-sm text-zinc-800">
              <AIResponseCard message={{ result: item.text, text: item.text }} />
            </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'Mock Tests' ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
            {!activeTest ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-zinc-900">Saved Mock Tests</h2>
                    <p className="text-xs text-zinc-500 mt-1">Generated tests are stored here for practice.</p>
                  </div>
                  {savedTests.length > 0 && (
                    <button
                      onClick={handleClearAllTests}
                      className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
                    </button>
                  )}
                </div>

                {savedTests.length === 0 ? (
                  <div className="p-16 border border-zinc-200 bg-zinc-50 backdrop-blur-xl rounded-3xl text-center space-y-3 shadow-xl">
                    <HelpCircle className="w-12 h-12 text-zinc-400 mx-auto animate-pulse" />
                    <h3 className="text-lg font-bold text-zinc-800">No mock tests available yet.</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Type <span className="text-emerald-600 font-semibold">"generate quiz"</span> in <span className="text-zinc-900 font-semibold">Ask Anything</span> to create mock tests.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedTests.map((test) => (
                      <div key={test.id} className="p-6 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded-2xl flex flex-col justify-between h-44 transition-all shadow-md group">
                        <div>
                          <div className="flex items-start justify-between">
                            <h3 className="text-sm font-bold text-zinc-900 capitalize pr-6 truncate">{test.title}</h3>
                            <button
                              onClick={(e) => handleDeleteTest(e, test.id)}
                              className="text-zinc-400 hover:text-red-600 p-1 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
                        </div>
                        <button
                          onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
                          className="self-end px-4 py-2 bg-black text-white hover:bg-zinc-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
                        >
                          Open Test <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTest && !testResult ? (
              <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                  <div className="min-w-0 pr-2">
                    <h2 className="text-base font-extrabold text-zinc-900 capitalize truncate">{activeTest.title}</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
                  </div>
                  <button onClick={handleExitTest} className="text-xs text-zinc-600 hover:text-black underline shrink-0">Exit to Library</button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold text-zinc-900 leading-relaxed">{activeTest.questions[currentQuestionIndex].question}</p>
                  <div className="space-y-2.5">
                    {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
                        className={`w-full text-left px-4.5 py-3 rounded-xl text-xs transition-all border ${
                          selectedAnswers[currentQuestionIndex] === oIdx
                            ? 'bg-zinc-200 text-black font-bold border-zinc-400 shadow-sm'
                            : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
                  <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 text-xs font-semibold disabled:opacity-40">Previous</button>
                  {currentQuestionIndex < activeTest.questions.length - 1 ? (
                    <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold shadow-sm">Next Question</button>
                  ) : (
                    <button onClick={handleSubmitTest} className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md">Submit Test</button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-50 border border-zinc-200 rounded-3xl shadow-xl overflow-hidden space-y-6">
                <div className="p-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-extrabold text-zinc-900 capitalize truncate">{activeTest.title} - Test Results</h2>
                  </div>
                  <span className={`text-xs font-bold ${testResult.statusColor} bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full`}>
                    {testResult.comparisonMessage}
                  </span>
                </div>

                <div className="px-6 pb-8">
                  <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-100 text-xs uppercase font-mono text-zinc-600">
                        <tr>
                          <th className="px-5 py-3.5 border-b border-zinc-200">Evaluation Metric</th>
                          <th className="px-5 py-3.5 border-b border-zinc-200">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-800 text-xs">
                        <tr>
                          <td className="px-5 py-4 font-semibold text-zinc-900">Total Score</td>
                          <td className="px-5 py-4">{testResult.score} / {testResult.total}</td>
                        </tr>
                        <tr>
                          <td className="px-5 py-4 font-semibold text-zinc-900">Percentage Obtained</td>
                          <td className="px-5 py-4 font-mono font-extrabold text-zinc-900 text-sm">{testResult.percentage}%</td>
                        </tr>
                        <tr>
                          <td className="px-5 py-4 font-semibold text-zinc-900 align-top">Weak Topics</td>
                          <td className="px-5 py-4">
                            {testResult.weakTopics.length > 0 ? (
                              <ul className="list-disc list-inside text-zinc-600 space-y-1">
                                {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
                              </ul>
                            ) : (
                              <span className="text-emerald-600 font-semibold">Brilliant! All answers were correct.</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button onClick={handleExitTest} className="text-xs text-zinc-600 hover:text-black underline self-start sm:self-auto">
                      ← Back to Saved Mock Tests
                    </button>
                    <button onClick={handleRetakeTest} className="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
                      <RefreshCcw className="w-4 h-4 text-emerald-600" /> Retake Test
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Chat View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {currentToolState.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 py-12">
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 to-green-400 blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse" />
                    <div className="relative w-20 h-20 rounded-3xl bg-white border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-xl">
                      <Sparkles className="w-10 h-10 text-emerald-600" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Welcome to Echo AI</p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                      How Can I Assist You?
                    </h2>
                  </div>

                  {activeTab === 'Ask Anything' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-4">
                      {[
                        { title: "Expand Rough Notes", desc: "Upload handwritten lecture notes", icon: ImagePlus, prompt: "Expand my lecture notes with detailed explanations" },
                        { title: "Generate Mock Test", desc: "50 MCQs exam quiz generator", icon: HelpCircle, prompt: "Generate a mock test on Computer Networks" },
                        { title: "Analyze Reference PDF", desc: "Extract key terms & formulas", icon: FileUp, prompt: "Summarize main concepts from reference materials" },
                      ].map((card, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendQuery(null, card.prompt)}
                          className="p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-left transition-all group shadow-sm flex flex-col justify-between h-32"
                        >
                          <card.icon className="w-5 h-5 text-zinc-500 group-hover:text-black transition-colors" />
                          <div>
                            <p className="text-xs font-bold text-zinc-800 group-hover:text-black">{card.title}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{card.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                currentToolState.messages.map((msg) => (
                  msg.sender === 'user' ? (
                    <div key={msg.id} className="flex justify-end w-full">
                      <div className="max-w-[90%] sm:max-w-[80%] bg-zinc-100 text-zinc-900 border border-zinc-200 px-5 py-3.5 rounded-2xl rounded-br-none text-sm flex items-start gap-3 shadow-sm">
                        <span className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</span>
                        <div className="p-1 rounded-full bg-black text-white shrink-0 mt-0.5"><User className="w-3.5 h-3.5" /></div>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="space-y-2">
                      <div className="flex justify-start">
                        <button
                          onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
                          className="px-3.5 py-1.5 bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600" /> Save to Bookshelf
                        </button>
                      </div>
                      <AIResponseCard message={msg} onBookmark={(item) => handleTriggerSave(item.content, msg.queryContext || 'Saved Notes')} />
                    </div>
                  )
                ))
              )}
              {loading && (
                <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200 w-fit text-xs text-zinc-800 animate-pulse flex items-center gap-2 shadow-md">
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-600" /> Echo AI is processing your request...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Capsule */}
            <div className="p-4 sm:p-6 bg-transparent">
              <div className="max-w-4xl mx-auto space-y-3">

                {activeTab === 'Note Expander' && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`rounded-2xl border border-dashed transition-all p-4 bg-zinc-50 ${
                      isDraggingOver
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-zinc-300 hover:border-zinc-400'
                    }`}
                  >
                    {noteExpanderImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {noteExpanderImages.map((img) => (
                          <div key={img.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-300 group shadow-sm">
                            <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(img.id)}
                              className="absolute top-1 right-1 bg-zinc-900/80 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => noteImageInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black transition-all border border-zinc-200 bg-white shadow-sm"
                    >
                      <ImagePlus className="w-4 h-4 text-emerald-600" />
                      <span className="truncate">{noteExpanderImages.length > 0 ? 'Add More Photos' : 'Upload Photos of Notes'}</span>
                    </button>
                    <input
                      ref={noteImageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
                      className="hidden"
                    />
                  </div>
                )}

                {activeTab === 'PDF Uploader' && (
                  <div
                    onDragOver={handlePdfDragOver}
                    onDragLeave={handlePdfDragLeave}
                    onDrop={handlePdfDrop}
                    className={`rounded-2xl border border-dashed transition-all p-4 bg-zinc-50 ${
                      isPdfDraggingOver
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-zinc-300 hover:border-zinc-400'
                    }`}
                  >
                    {selectedPdf ? (
                      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-zinc-200 bg-white mb-3 shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate text-zinc-900">{selectedPdf.name}</p>
                            <p className="text-[10px] text-zinc-500">{formatFileSize(selectedPdf.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removePdf}
                          className="text-zinc-400 hover:text-red-600 p-1.5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black transition-all border border-zinc-200 bg-white shadow-sm"
                    >
                      <FileUp className="w-4 h-4 text-emerald-600" />
                      <span className="truncate">{selectedPdf ? 'Replace PDF' : 'Upload Reference PDF'}</span>
                    </button>
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
                      className="hidden"
                    />
                  </div>
                )}

                <form onSubmit={handleSendQuery} className="relative group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-md opacity-0 group-focus-within:opacity-50 transition-opacity pointer-events-none" />
                  
                  <div className="relative flex items-center bg-zinc-50 border border-zinc-300 focus-within:border-emerald-600 rounded-2xl px-4 py-2 shadow-lg transition-all">
                    <Sparkles className="w-4 h-4 text-emerald-600 mr-3 shrink-0" />
                    <input
                      type="text"
                      value={currentToolState.input}
                      onChange={handleInputChange}
                      placeholder="Ask AI anything or write your request..."
                      className="w-full bg-transparent py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                    />
                    
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        (!currentToolState.input.trim() &&
                          !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
                          !(activeTab === 'PDF Uploader' && selectedPdf))
                      }
                      className="ml-2 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-md disabled:opacity-40 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 text-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <h3 className="text-sm font-extrabold flex items-center gap-2 text-zinc-900">
                <BookmarkPlus className="w-4 h-4 text-emerald-600" /> Create New Bookshelf
              </h3>
              <button onClick={() => setShowSaveModal(false)} className="text-zinc-500 hover:text-black"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-zinc-600">Name your new bookshelf to save this study material:</p>
              <input
                type="text"
                value={newBookshelfName}
                onChange={(e) => setNewBookshelfName(e.target.value)}
                placeholder="e.g. Physics Notes, Web Dev..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-zinc-50 text-zinc-900 outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-200">
              <button onClick={() => setShowSaveModal(false)} className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold">Cancel</button>
              <button onClick={handleCreateNewBookshelfAndSave} className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold shadow-sm">Create & Save</button>
            </div>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

// Strict Default Export for Next.js App Router
export default DashboardPage;




