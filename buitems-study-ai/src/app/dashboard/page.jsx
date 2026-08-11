//13th edit


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
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://buitems-ai-production.up.railway.app'; //edited        let endpoint = `${API_BASE_URL}/api/ai/ask-anything`;
      if (activeTab === 'Note Expander') endpoint = `${API_BASE_URL}/api/ai/expand-notes`;
      else if (activeTab === 'PDF Uploader') endpoint = `${API_BASE_URL}/api/ai/pdf-analysis`;

      const payload = { prompt: finalQuery, tool: activeTab };
      if (hasImages) payload.images = noteExpanderImages.map(img => img.base64);
      if (hasPdf) {
        payload.pdf = selectedPdf.base64;
        payload.pdfName = selectedPdf.name;
      }

      const response = await secureFetch(endpoint, {
        method: 'POST',
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



//12th

// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   Lightbulb, Send, Settings, FileText, HelpCircle, User, X, 
//   CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, 
//   BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp, Menu, 
//   Sparkles, Bot, Zap, Flame, Compass, Paperclip, Mic 
// } from 'lucide-react';
// import { secureFetch } from '@/utils/apiHelper';
// import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
// import AIResponseCard from '@/components/AIResponseCard';
// import SettingsModal from '@/components/SettingsModal';

// function DashboardPage() {
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   const [activeTab, setActiveTab] = useState('Ask Anything');
//   const [showSettings, setShowSettings] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
//   const [toolStates, setToolStates] = useState({
//     'Ask Anything': { messages: [], input: '' },
//     'Note Expander': { messages: [], input: '' },
//     'PDF Uploader': { messages: [], input: '' },
//   });
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // --- CURRENT TOOL STATE DEFINATION ---
//   const currentToolState = toolStates[activeTab] || { messages: [], input: '' };

//   // --- USER PROFILE & THEME STATES ---
//   const [userName, setUserName] = useState('MIR SHAHARYAR');
//   const [tempName, setTempName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [themeMode, setThemeMode] = useState('light');

//   // --- PERSONAL BOOKSHELF STATES ---
//   const [bookshelves, setBookshelves] = useState([]);
//   const [activeBookshelfId, setActiveBookshelfId] = useState(null);
//   const [viewingBookshelf, setViewingBookshelf] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [pendingItemToSave, setPendingItemToSave] = useState(null);
//   const [newBookshelfName, setNewBookshelfName] = useState('');

//   // --- MOCK TEST STATES ---
//   const [savedTests, setSavedTests] = useState([]);
//   const [testHistories, setTestHistories] = useState({});
//   const [activeTest, setActiveTest] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [testResult, setTestResult] = useState(null);

//   // --- NOTE EXPANDER STATES ---
//   const [noteExpanderImages, setNoteExpanderImages] = useState([]);
//   const [isDraggingOver, setIsDraggingOver] = useState(false);
//   const noteImageInputRef = useRef(null);

//   // --- PDF UPLOADER STATES ---
//   const [selectedPdf, setSelectedPdf] = useState(null);
//   const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
//   const pdfInputRef = useRef(null);

//   // --- AUTH GUARD ---
//   useEffect(() => {
//     setMounted(true);
//     const token = localStorage.getItem('token');
//     if (!token) {
//       router.replace('/login');
//     }
//   }, [router]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedTests = localStorage.getItem('buitems_mock_tests');
//       const storedHistories = localStorage.getItem('buitems_test_histories');
//       const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
//       const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
//       const storedName = localStorage.getItem('buitems_user_name');
//       const storedTheme = localStorage.getItem('buitems_theme_mode');

//       if (storedTests) setSavedTests(JSON.parse(storedTests));
//       if (storedHistories) setTestHistories(JSON.parse(storedHistories));
//       if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
//       if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
//       if (storedName) {
//         setUserName(storedName);
//         setTempName(storedName);
//       }
//       if (storedTheme) setThemeMode(storedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [toolStates, activeTab, loading]);

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], input: val }
//     }));
//   };

//   const handleSaveName = () => {
//     if (!tempName.trim()) return;
//     setUserName(tempName.trim());
//     localStorage.setItem('buitems_user_name', tempName.trim());
//     setIsEditingName(false);
//   };

//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       localStorage.clear();
//       document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
//       router.replace('/login');
//       router.refresh();
//     }
//   };

//   const handleTriggerSave = (msgText, queryText) => {
//     if (!activeBookshelfId) {
//       setPendingItemToSave({ text: msgText, title: queryText });
//       setNewBookshelfName(queryText || 'My Study Notes');
//       setShowSaveModal(true);
//     } else {
//       saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
//     }
//   };

//   const handleCreateNewBookshelfAndSave = () => {
//     if (!newBookshelfName.trim()) return;
//     const shelfId = Date.now().toString();
//     const newShelf = {
//       id: shelfId,
//       title: newBookshelfName.trim(),
//       date: new Date().toLocaleDateString(),
//       items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
//     };

//     const updatedShelves = [newShelf, ...bookshelves];
//     setBookshelves(updatedShelves);
//     setActiveBookshelfId(shelfId);

//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     localStorage.setItem('buitems_active_bookshelf_id', shelfId);

//     setShowSaveModal(false);
//     setPendingItemToSave(null);
//     setNewBookshelfName('');
//     alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
//   };

//   const saveItemToBookshelf = (shelfId, item) => {
//     const updatedShelves = bookshelves.map(shelf => {
//       if (shelf.id === shelfId) {
//         return { ...shelf, items: [item, ...shelf.items] };
//       }
//       return shelf;
//     });
//     setBookshelves(updatedShelves);
//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     alert("Successfully saved to your active bookshelf!");
//   };

//   const handleDeleteBookshelf = (e, shelfId) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this bookshelf?")) {
//       const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
//       setBookshelves(updatedShelves);
//       localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//       if (activeBookshelfId === shelfId) {
//         setActiveBookshelfId(null);
//         localStorage.removeItem('buitems_active_bookshelf_id');
//       }
//       if (viewingBookshelf && viewingBookshelf.id === shelfId) {
//         setViewingBookshelf(null);
//       }
//     }
//   };

//   const handleClearAllBookshelves = () => {
//     if (window.confirm("Are you sure you want to delete all bookshelves?")) {
//       setBookshelves([]);
//       setActiveBookshelfId(null);
//       setViewingBookshelf(null);
//       localStorage.removeItem('buitems_personal_bookshelves');
//       localStorage.removeItem('buitems_active_bookshelf_id');
//     }
//   };

//   const handleDeleteTest = (e, testId) => {
//     e.stopPropagation();
//     const updatedTests = savedTests.filter(t => t.id !== testId);
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     if (activeTest && activeTest.id === testId) setActiveTest(null);
//   };

//   const handleClearAllTests = () => {
//     if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
//       setSavedTests([]);
//       localStorage.removeItem('buitems_mock_tests');
//       setActiveTest(null);
//     }
//   };

//   const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
//     const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

//     try {
//       if (typeof rawText === 'string') {
//         let cleaned = rawText.trim();
//         const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (match) cleaned = match[1].trim();

//         const firstBracket = cleaned.indexOf('[');
//         const lastBracket = cleaned.lastIndexOf(']');
//         if (firstBracket !== -1 && lastBracket !== -1) {
//           cleaned = cleaned.substring(firstBracket, lastBracket + 1);
//         }

//         const parsed = JSON.parse(cleaned);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const validQuestions = parsed.map(q => ({
//             question: q.question || "Sample Question?",
//             options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
//             correct: typeof q.correct === 'number' ? q.correct : 0,
//             topic: q.topic || topicName
//           }));

//           const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
//           const updatedTests = [newTest, ...savedTests];
//           setSavedTests(updatedTests);
//           localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//           setActiveTest(newTest);
//           setActiveTab('Mock Tests');
//           return;
//         }
//       }
//     } catch (err) {
//       console.warn("JSON parse error caught safely, switching to fallback test:", err);
//     }

//     const fallbackQuestions = [];
//     for (let i = 1; i <= 50; i++) {
//       fallbackQuestions.push({
//         question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
//         options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
//         correct: 0,
//         topic: topicName
//       });
//     }

//     const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
//     const updatedTests = [fallbackTest, ...savedTests];
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     setActiveTest(fallbackTest);
//     setActiveTab('Mock Tests');
//   };

//   const handleImageUpload = (fileList) => {
//     const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
//     if (files.length === 0) return;

//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//           name: file.name,
//           base64: e.target.result,
//         };
//         setNoteExpanderImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (id) => {
//     setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingOver(false);
//     if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
//   };

//   const formatFileSize = (bytes) => {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   const handlePdfUpload = (fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
//     if (!isPdf) {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setSelectedPdf({
//         name: file.name,
//         size: file.size,
//         base64: e.target.result,
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePdf = () => setSelectedPdf(null);

//   const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
//   const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
//   const handlePdfDrop = (e) => {
//     e.preventDefault();
//     setIsPdfDraggingOver(false);
//     if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
//   };

//   const handleSendQuery = async (e, customPrompt = null) => {
//     if (e) e.preventDefault();
//     const queryText = (customPrompt || currentToolState.input).trim();
//     const isNoteExpander = activeTab === 'Note Expander';
//     const isPdfUploader = activeTab === 'PDF Uploader';
//     const hasImages = isNoteExpander && noteExpanderImages.length > 0;
//     const hasPdf = isPdfUploader && !!selectedPdf;

//     if ((!queryText && !hasImages && !hasPdf) || loading) return;

//     const userMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       text: queryText || (hasImages
//         ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
//         : hasPdf
//           ? `📄 Uploaded ${selectedPdf.name}`
//           : '')
//     };
    
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
//     }));
//     setLoading(true);

//     try {
//       let finalQuery = queryText;
//       const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

//       const lowerQuery = queryText.toLowerCase();
//       const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
//       const previousMessages = toolStates[activeTab]?.messages || [];
      
//       if (hasPronoun && previousMessages.length > 0) {
//         const lastMsg = previousMessages[previousMessages.length - 1];
//         const contextTopic = lastMsg.queryContext || lastMsg.text || '';
//         if (contextTopic) {
//           finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
//         }
//       }

//       if (isMockReq && activeTab === 'Ask Anything') {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
//       }

//       if (isNoteExpander) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: Expand and correct the rough notes provided.]`;
//       }

//       if (isPdfUploader) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: Analyze the PDF and provide structured study summaries.]`;
//       }

//       let endpoint = 'http://localhost:5000/api/ai/ask-anything';
//       if (activeTab === 'Note Expander') endpoint = 'http://localhost:5000/api/ai/expand-notes';
//       else if (activeTab === 'PDF Uploader') endpoint = 'http://localhost:5000/api/ai/pdf-analysis';

//       const payload = { prompt: finalQuery, tool: activeTab };
//       if (hasImages) payload.images = noteExpanderImages.map(img => img.base64);
//       if (hasPdf) {
//         payload.pdf = selectedPdf.base64;
//         payload.pdfName = selectedPdf.name;
//       }

//       const response = await secureFetch(endpoint, {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       if (!response) {
//         setLoading(false);
//         return;
//       }

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || 'Failed to process AI generation request.');

//       const rawContent = data.result || data.text || data.content || JSON.stringify(data);

//       if (isMockReq) {
//         extractAndSavedMockTestSafe(rawContent, queryText);
//         setLoading(false);
//         return;
//       }

//       const aiResponse = { 
//         id: (Date.now() + 1).toString(), 
//         sender: 'ai', 
//         result: rawContent, 
//         text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
//         queryContext: queryText 
//       };

//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
//       }));

//       if (hasImages) setNoteExpanderImages([]);
//       if (hasPdf) setSelectedPdf(null);

//     } catch (err) {
//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { 
//           ...prev[activeTab], 
//           messages: [...prev[activeTab].messages, { id: Date.now().toString(), sender: 'ai', text: `Error: ${err.message}` }] 
//         }
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOptionSelect = (qIdx, optIdx) => {
//     setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
//   };

//   const handleSubmitTest = () => {
//     let score = 0;
//     let weakTopicsMap = [];

//     activeTest.questions.forEach((q, idx) => {
//       if (selectedAnswers[idx] === q.correct) score += 1;
//       else weakTopicsMap.push(q.topic || activeTest.title);
//     });

//     const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
//     const weakTopics = [...new Set(weakTopicsMap)];
//     const previousHistory = testHistories[activeTest.id];
//     let comparisonMessage = "First Attempt Completed!";
//     let statusColor = "text-zinc-600";

//     if (previousHistory) {
//       if (percentage > previousHistory.lastPercentage) {
//         comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-emerald-600 font-bold";
//       } else if (percentage < previousHistory.lastPercentage) {
//         comparisonMessage = `Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-red-600 font-bold";
//       } else {
//         comparisonMessage = `Consistent performance at ${percentage}%.`;
//         statusColor = "text-zinc-600";
//       }
//     }

//     const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
//     setTestResult(resultObj);
//     const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
//     setTestHistories(updatedHistory);
//     localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
//   };

//   const handleRetakeTest = () => {
//     const shuffledQuestions = activeTest.questions.map(q => {
//       const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
//       optionsWithIndex.sort(() => Math.random() - 0.5);
//       return {
//         ...q,
//         options: optionsWithIndex.map(o => o.text),
//         correct: optionsWithIndex.findIndex(o => o.isCorrect)
//       };
//     });
//     setActiveTest({ ...activeTest, questions: shuffledQuestions });
//     setSelectedAnswers({});
//     setTestResult(null);
//     setCurrentQuestionIndex(0);
//   };

//   const handleExitTest = () => {
//     setActiveTest(null);
//     setTestResult(null);
//     setSelectedAnswers({});
//     setCurrentQuestionIndex(0);
//   };

//   const handleResetSession = () => {
//     setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
//     setActiveBookshelfId(null);
//     localStorage.removeItem('buitems_active_bookshelf_id');
//     setNoteExpanderImages([]);
//     setSelectedPdf(null);
//   };

//   const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

//   if (!mounted) return null;

//   return (
//     <div className="flex h-[100dvh] bg-white text-black font-sans overflow-hidden relative selection:bg-emerald-500 selection:text-white">
      
//       {/* Background Orbs */}
//       <div className="absolute top-0 right-0 w-[650px] h-[500px] bg-gradient-to-br from-emerald-100/50 via-zinc-100/60 to-white blur-[140px] rounded-full pointer-events-none z-0" />
//       <div className="absolute top-1/3 left-10 w-[400px] h-[350px] bg-gradient-to-tr from-emerald-50/60 to-white blur-[130px] rounded-full pointer-events-none z-0" />

//       {isMobileSidebarOpen && (
//         <div 
//           onClick={() => setIsMobileSidebarOpen(false)}
//           className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm transition-opacity"
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`fixed md:relative inset-y-0 left-0 z-30 w-72 border-r border-zinc-200 bg-zinc-50/95 backdrop-blur-2xl flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
//         <div>
//           <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-zinc-200">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white">
//                 <Sparkles className="w-5 h-5 animate-pulse text-white" />
//               </div>
//               <div>
//                 <h1 className="text-sm font-extrabold tracking-wider text-zinc-900">Echo AI Study</h1>
//                 <p className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase truncate max-w-[120px]">{userName}</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setIsMobileSidebarOpen(false)}
//               className="md:hidden text-zinc-500 hover:text-black p-1"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-3 mb-2">Core Tools</div>
//           <nav className="space-y-1.5">
//             {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                        ? 'bg-zinc-200 text-black border border-zinc-300 shadow-sm'
//                       : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
//                   }`}
//                 >
//                   <FileText className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-500'}`} /> {name}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-3 mt-6 mb-2">Library & Workspace</div>
//           <nav className="space-y-1.5">
//             {['Personal Bookshelf', 'Mock Tests'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-zinc-200 text-black border border-zinc-300 shadow-sm'
//                       : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
//                   }`}
//                 >
//                   <HelpCircle className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-500'}`} /> {name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Account Box */}
//         <div className="pt-4 border-t border-zinc-200 space-y-2">
//           <button
//             onClick={() => { setIsSettingsOpen(true); setIsMobileSidebarOpen(false); }}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-zinc-200 border border-zinc-300 text-zinc-700 flex items-center justify-center font-bold text-xs shadow-sm">
//               <Settings className="w-3.5 h-3.5" />
//             </div>
//             <span>Settings & Profile</span>
//           </button>
          
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
//               <LogOut className="w-3.5 h-3.5" />
//             </div>
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Workspace Area */}
//       <main className="flex-1 flex flex-col justify-between bg-transparent relative z-10 overflow-hidden w-full">
//         {/* Header */}
//         <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
//           <div className="flex items-center gap-3 min-w-0">
//             <button
//               onClick={() => setIsMobileSidebarOpen(true)}
//               className="md:hidden p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 shrink-0"
//               title="Open Menu"
//             >
//               <Menu className="w-4 h-4" />
//             </button>
//             <span className="px-3.5 py-1.5 rounded-full border border-zinc-200 bg-zinc-100 text-[11px] font-semibold uppercase tracking-wider text-zinc-700 truncate">
//               Session: <span className="text-emerald-600 font-bold">{activeTab}</span>
//             </span>
//             {activeBookshelfId && activeTab === 'Ask Anything' && (
//               <span className="hidden lg:inline-block text-[11px] font-semibold text-zinc-900 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full truncate max-w-[220px]">
//                 Shelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
//               </span>
//             )}
//           </div>
//           {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
//             <button 
//               onClick={handleResetSession} 
//               className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 transition-all shrink-0 ml-2 shadow-sm"
//             >
//               <RefreshCcw className="w-3.5 h-3.5 text-emerald-600" />
//               <span>Reset Chat</span>
//             </button>
//           )}
//         </header>

//         {/* Tab Content Routing */}
//         {activeTab === 'Personal Bookshelf' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!viewingBookshelf ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-zinc-900">My Personal Bookshelf</h2>
//                     <p className="text-xs text-zinc-500 mt-1">Manage saved study modules and topic notes.</p>
//                   </div>
//                   {bookshelves.length > 0 && (
//                     <button
//                       onClick={handleClearAllBookshelves}
//                       className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
//                     </button>
//                   )}
//                 </div>

//                 {bookshelves.length === 0 ? (
//                   <div className="p-16 border border-zinc-200 bg-zinc-50 backdrop-blur-xl rounded-3xl text-center space-y-4 shadow-xl">
//                     <BookOpen className="w-12 h-12 mx-auto text-zinc-400 animate-pulse" />
//                     <h3 className="text-lg font-bold text-zinc-800">No bookshelves created yet.</h3>
//                     <p className="text-xs text-zinc-500 max-w-sm mx-auto">
//                       Go to <span className="text-emerald-600 font-semibold">Ask Anything</span>, generate study notes, and click <span className="text-zinc-900 font-semibold">"Save to Bookshelf"</span> to build your custom library.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {bookshelves.map((shelf) => (
//                       <div
//                         key={shelf.id}
//                         onClick={() => setViewingBookshelf(shelf)}
//                         className="p-6 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded-2xl flex flex-col justify-between h-48 transition-all shadow-md cursor-pointer group"
//                       >
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-zinc-900 capitalize pr-6 flex items-center gap-2">
//                               <BookOpen className="w-4 h-4 text-emerald-600" /> {shelf.title}
//                             </h3>
//                             <button
//                               onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
//                               className="text-zinc-400 hover:text-red-600 p-1"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-500 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
//                         </div>
//                         <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
//                           <span className={`text-[11px] font-semibold ${activeBookshelfId === shelf.id ? 'text-emerald-600' : 'text-zinc-500'}`}>
//                             {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
//                           </span>
//                           <span className="px-3.5 py-1.5 bg-black text-white hover:bg-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors">
//                             Open Shelf <ArrowRight className="w-3.5 h-3.5" />
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
//                   <div>
//                     <button onClick={() => setViewingBookshelf(null)} className="text-xs text-zinc-500 hover:text-black hover:underline mb-1">← Back to All Bookshelves</button>
//                     <h2 className="text-lg font-extrabold text-zinc-900 capitalize flex items-center gap-2">
//                       <BookOpen className="w-5 h-5 text-emerald-600" /> {viewingBookshelf.title}
//                     </h2>
//                     <p className="text-xs text-zinc-500 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setActiveBookshelfId(viewingBookshelf.id);
//                       localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
//                       alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
//                     }}
//                     className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeBookshelfId === viewingBookshelf.id ? 'bg-black text-white font-extrabold shadow-md' : 'bg-zinc-100 text-zinc-900 border border-zinc-300 hover:bg-zinc-200'}`}
//                   >
//                     {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   {viewingBookshelf.items.map((item, idx) => (
//                     <div key={idx} className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 shadow-md">
//                       <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
//                         <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600">Topic: {item.title || viewingBookshelf.title}</h4>
//                         <span className="text-[10px] text-zinc-500">{item.date}</span>
//                       </div>
//                       <div className="text-sm text-zinc-800">
//               <AIResponseCard message={{ result: item.text, text: item.text }} />
//             </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : activeTab === 'Mock Tests' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!activeTest ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-zinc-900">Saved Mock Tests</h2>
//                     <p className="text-xs text-zinc-500 mt-1">Generated tests are stored here for practice.</p>
//                   </div>
//                   {savedTests.length > 0 && (
//                     <button
//                       onClick={handleClearAllTests}
//                       className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
//                     </button>
//                   )}
//                 </div>

//                 {savedTests.length === 0 ? (
//                   <div className="p-16 border border-zinc-200 bg-zinc-50 backdrop-blur-xl rounded-3xl text-center space-y-3 shadow-xl">
//                     <HelpCircle className="w-12 h-12 text-zinc-400 mx-auto animate-pulse" />
//                     <h3 className="text-lg font-bold text-zinc-800">No mock tests available yet.</h3>
//                     <p className="text-xs text-zinc-500 max-w-sm mx-auto">
//                       Type <span className="text-emerald-600 font-semibold">"generate quiz"</span> in <span className="text-zinc-900 font-semibold">Ask Anything</span> to create mock tests.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {savedTests.map((test) => (
//                       <div key={test.id} className="p-6 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded-2xl flex flex-col justify-between h-44 transition-all shadow-md group">
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-zinc-900 capitalize pr-6 truncate">{test.title}</h3>
//                             <button
//                               onClick={(e) => handleDeleteTest(e, test.id)}
//                               className="text-zinc-400 hover:text-red-600 p-1 shrink-0"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-500 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
//                         </div>
//                         <button
//                           onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
//                           className="self-end px-4 py-2 bg-black text-white hover:bg-zinc-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
//                         >
//                           Open Test <ArrowRight className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTest && !testResult ? (
//               <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
//                 <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
//                   <div className="min-w-0 pr-2">
//                     <h2 className="text-base font-extrabold text-zinc-900 capitalize truncate">{activeTest.title}</h2>
//                     <p className="text-xs text-zinc-500 mt-0.5">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
//                   </div>
//                   <button onClick={handleExitTest} className="text-xs text-zinc-600 hover:text-black underline shrink-0">Exit to Library</button>
//                 </div>

//                 <div className="space-y-4">
//                   <p className="text-sm font-semibold text-zinc-900 leading-relaxed">{activeTest.questions[currentQuestionIndex].question}</p>
//                   <div className="space-y-2.5">
//                     {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
//                         className={`w-full text-left px-4.5 py-3 rounded-xl text-xs transition-all border ${
//                           selectedAnswers[currentQuestionIndex] === oIdx
//                             ? 'bg-zinc-200 text-black font-bold border-zinc-400 shadow-sm'
//                             : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-100'
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
//                   <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 text-xs font-semibold disabled:opacity-40">Previous</button>
//                   {currentQuestionIndex < activeTest.questions.length - 1 ? (
//                     <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold shadow-sm">Next Question</button>
//                   ) : (
//                     <button onClick={handleSubmitTest} className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md">Submit Test</button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-zinc-50 border border-zinc-200 rounded-3xl shadow-xl overflow-hidden space-y-6">
//                 <div className="p-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
//                       <CheckCircle2 className="w-5 h-5" />
//                     </div>
//                     <h2 className="text-base font-extrabold text-zinc-900 capitalize truncate">{activeTest.title} - Test Results</h2>
//                   </div>
//                   <span className={`text-xs font-bold ${testResult.statusColor} bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full`}>
//                     {testResult.comparisonMessage}
//                   </span>
//                 </div>

//                 <div className="px-6 pb-8">
//                   <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
//                     <table className="w-full text-left text-sm">
//                       <thead className="bg-zinc-100 text-xs uppercase font-mono text-zinc-600">
//                         <tr>
//                           <th className="px-5 py-3.5 border-b border-zinc-200">Evaluation Metric</th>
//                           <th className="px-5 py-3.5 border-b border-zinc-200">Details</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-zinc-200 text-zinc-800 text-xs">
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-zinc-900">Total Score</td>
//                           <td className="px-5 py-4">{testResult.score} / {testResult.total}</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-zinc-900">Percentage Obtained</td>
//                           <td className="px-5 py-4 font-mono font-extrabold text-zinc-900 text-sm">{testResult.percentage}%</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-zinc-900 align-top">Weak Topics</td>
//                           <td className="px-5 py-4">
//                             {testResult.weakTopics.length > 0 ? (
//                               <ul className="list-disc list-inside text-zinc-600 space-y-1">
//                                 {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
//                               </ul>
//                             ) : (
//                               <span className="text-emerald-600 font-semibold">Brilliant! All answers were correct.</span>
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//                     <button onClick={handleExitTest} className="text-xs text-zinc-600 hover:text-black underline self-start sm:self-auto">
//                       ← Back to Saved Mock Tests
//                     </button>
//                     <button onClick={handleRetakeTest} className="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
//                       <RefreshCcw className="w-4 h-4 text-emerald-600" /> Retake Test
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <>
//             {/* Chat View */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {currentToolState.messages.length === 0 ? (
//                 <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 py-12">
//                   <div className="relative group">
//                     <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 to-green-400 blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse" />
//                     <div className="relative w-20 h-20 rounded-3xl bg-white border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-xl">
//                       <Sparkles className="w-10 h-10 text-emerald-600" />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Welcome to Echo AI</p>
//                     <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
//                       How Can I Assist You?
//                     </h2>
//                   </div>

//                   {activeTab === 'Ask Anything' && (
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-4">
//                       {[
//                         { title: "Expand Rough Notes", desc: "Upload handwritten lecture notes", icon: ImagePlus, prompt: "Expand my lecture notes with detailed explanations" },
//                         { title: "Generate Mock Test", desc: "50 MCQs exam quiz generator", icon: HelpCircle, prompt: "Generate a mock test on Computer Networks" },
//                         { title: "Analyze Reference PDF", desc: "Extract key terms & formulas", icon: FileUp, prompt: "Summarize main concepts from reference materials" },
//                       ].map((card, i) => (
//                         <button
//                           key={i}
//                           onClick={() => handleSendQuery(null, card.prompt)}
//                           className="p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-left transition-all group shadow-sm flex flex-col justify-between h-32"
//                         >
//                           <card.icon className="w-5 h-5 text-zinc-500 group-hover:text-black transition-colors" />
//                           <div>
//                             <p className="text-xs font-bold text-zinc-800 group-hover:text-black">{card.title}</p>
//                             <p className="text-[10px] text-zinc-500 mt-0.5">{card.desc}</p>
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 currentToolState.messages.map((msg) => (
//                   msg.sender === 'user' ? (
//                     <div key={msg.id} className="flex justify-end w-full">
//                       <div className="max-w-[90%] sm:max-w-[80%] bg-zinc-100 text-zinc-900 border border-zinc-200 px-5 py-3.5 rounded-2xl rounded-br-none text-sm flex items-start gap-3 shadow-sm">
//                         <span className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</span>
//                         <div className="p-1 rounded-full bg-black text-white shrink-0 mt-0.5"><User className="w-3.5 h-3.5" /></div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div key={msg.id} className="space-y-2">
//                       <div className="flex justify-start">
//                         <button
//                           onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
//                           className="px-3.5 py-1.5 bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
//                         >
//                           <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600" /> Save to Bookshelf
//                         </button>
//                       </div>
//                       <AIResponseCard message={msg} onBookmark={(item) => handleTriggerSave(item.content, msg.queryContext || 'Saved Notes')} />
//                     </div>
//                   )
//                 ))
//               )}
//               {loading && (
//                 <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200 w-fit text-xs text-zinc-800 animate-pulse flex items-center gap-2 shadow-md">
//                   <Sparkles className="w-4 h-4 animate-spin text-emerald-600" /> Echo AI is processing your request...
//                 </div>
//               )}
//               <div ref={chatEndRef} />
//             </div>

//             {/* Input Capsule */}
//             <div className="p-4 sm:p-6 bg-transparent">
//               <div className="max-w-4xl mx-auto space-y-3">

//                 {activeTab === 'Note Expander' && (
//                   <div
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-zinc-50 ${
//                       isDraggingOver
//                         ? 'border-emerald-500 bg-emerald-50/50'
//                         : 'border-zinc-300 hover:border-zinc-400'
//                     }`}
//                   >
//                     {noteExpanderImages.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         {noteExpanderImages.map((img) => (
//                           <div key={img.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-300 group shadow-sm">
//                             <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(img.id)}
//                               className="absolute top-1 right-1 bg-zinc-900/80 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => noteImageInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black transition-all border border-zinc-200 bg-white shadow-sm"
//                     >
//                       <ImagePlus className="w-4 h-4 text-emerald-600" />
//                       <span className="truncate">{noteExpanderImages.length > 0 ? 'Add More Photos' : 'Upload Photos of Notes'}</span>
//                     </button>
//                     <input
//                       ref={noteImageInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {activeTab === 'PDF Uploader' && (
//                   <div
//                     onDragOver={handlePdfDragOver}
//                     onDragLeave={handlePdfDragLeave}
//                     onDrop={handlePdfDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-zinc-50 ${
//                       isPdfDraggingOver
//                         ? 'border-emerald-500 bg-emerald-50/50'
//                         : 'border-zinc-300 hover:border-zinc-400'
//                     }`}
//                   >
//                     {selectedPdf ? (
//                       <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-zinc-200 bg-white mb-3 shadow-sm">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
//                             <FileText className="w-5 h-5" />
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-xs font-bold truncate text-zinc-900">{selectedPdf.name}</p>
//                             <p className="text-[10px] text-zinc-500">{formatFileSize(selectedPdf.size)}</p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removePdf}
//                           className="text-zinc-400 hover:text-red-600 p-1.5"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => pdfInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black transition-all border border-zinc-200 bg-white shadow-sm"
//                     >
//                       <FileUp className="w-4 h-4 text-emerald-600" />
//                       <span className="truncate">{selectedPdf ? 'Replace PDF' : 'Upload Reference PDF'}</span>
//                     </button>
//                     <input
//                       ref={pdfInputRef}
//                       type="file"
//                       accept="application/pdf,.pdf"
//                       onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 <form onSubmit={handleSendQuery} className="relative group">
//                   <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-md opacity-0 group-focus-within:opacity-50 transition-opacity pointer-events-none" />
                  
//                   <div className="relative flex items-center bg-zinc-50 border border-zinc-300 focus-within:border-emerald-600 rounded-2xl px-4 py-2 shadow-lg transition-all">
//                     <Sparkles className="w-4 h-4 text-emerald-600 mr-3 shrink-0" />
//                     <input
//                       type="text"
//                       value={currentToolState.input}
//                       onChange={handleInputChange}
//                       placeholder="Ask AI anything or write your request..."
//                       className="w-full bg-transparent py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
//                     />
                    
//                     <button
//                       type="submit"
//                       disabled={
//                         loading ||
//                         (!currentToolState.input.trim() &&
//                           !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
//                           !(activeTab === 'PDF Uploader' && selectedPdf))
//                       }
//                       className="ml-2 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-md disabled:opacity-40 shrink-0"
//                     >
//                       <Send className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* Save Modal */}
//       {showSaveModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white border border-zinc-200 text-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
//             <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
//               <h3 className="text-sm font-extrabold flex items-center gap-2 text-zinc-900">
//                 <BookmarkPlus className="w-4 h-4 text-emerald-600" /> Create New Bookshelf
//               </h3>
//               <button onClick={() => setShowSaveModal(false)} className="text-zinc-500 hover:text-black"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <p className="text-zinc-600">Name your new bookshelf to save this study material:</p>
//               <input
//                 type="text"
//                 value={newBookshelfName}
//                 onChange={(e) => setNewBookshelfName(e.target.value)}
//                 placeholder="e.g. Physics Notes, Web Dev..."
//                 className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-zinc-50 text-zinc-900 outline-none focus:border-emerald-600 font-medium"
//               />
//             </div>

//             <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-200">
//               <button onClick={() => setShowSaveModal(false)} className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold">Cancel</button>
//               <button onClick={handleCreateNewBookshelfAndSave} className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold shadow-sm">Create & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <SettingsModal
//         isOpen={isSettingsOpen}
//         onClose={() => setIsSettingsOpen(false)}
//       />
//     </div>
//   );
// }

// // Strict Default Export for Next.js App Router
// export default DashboardPage;



//11th edit

// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   Lightbulb, Send, Settings, FileText, HelpCircle, User, X, 
//   CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, 
//   BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp, Menu, 
//   Sparkles, Bot, Zap, Flame, Compass, Paperclip, Mic 
// } from 'lucide-react';
// import { secureFetch } from '@/utils/apiHelper';
// import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
// import AIResponseCard from '@/components/AIResponseCard';
// import SettingsModal from '@/components/SettingsModal';

// export default function DashboardPage() {
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   const [activeTab, setActiveTab] = useState('Ask Anything');
//   const [showSettings, setShowSettings] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
//   const [toolStates, setToolStates] = useState({
//     'Ask Anything': { messages: [], input: '' },
//     'Note Expander': { messages: [], input: '' },
//     'PDF Uploader': { messages: [], input: '' },
//   });
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // --- USER PROFILE & THEME STATES ---
//   const [userName, setUserName] = useState('MIR SHAHARYAR');
//   const [tempName, setTempName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [themeMode, setThemeMode] = useState('light');

//   // --- PERSONAL BOOKSHELF STATES ---
//   const [bookshelves, setBookshelves] = useState([]);
//   const [activeBookshelfId, setActiveBookshelfId] = useState(null);
//   const [viewingBookshelf, setViewingBookshelf] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [pendingItemToSave, setPendingItemToSave] = useState(null);
//   const [newBookshelfName, setNewBookshelfName] = useState('');

//   // --- MOCK TEST STATES ---
//   const [savedTests, setSavedTests] = useState([]);
//   const [testHistories, setTestHistories] = useState({});
//   const [activeTest, setActiveTest] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [testResult, setTestResult] = useState(null);

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD STATES ---
//   const [noteExpanderImages, setNoteExpanderImages] = useState([]);
//   const [isDraggingOver, setIsDraggingOver] = useState(false);
//   const noteImageInputRef = useRef(null);

//   // --- PDF UPLOADER: SINGLE PDF UPLOAD STATES ---
//   const [selectedPdf, setSelectedPdf] = useState(null);
//   const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
//   const pdfInputRef = useRef(null);

//   // --- AUTH GUARD ---
//   useEffect(() => {
//     setMounted(true);
//     const token = localStorage.getItem('token');
//     if (!token) {
//       router.replace('/login');
//     }
//   }, [router]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedTests = localStorage.getItem('buitems_mock_tests');
//       const storedHistories = localStorage.getItem('buitems_test_histories');
//       const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
//       const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
//       const storedName = localStorage.getItem('buitems_user_name');
//       const storedTheme = localStorage.getItem('buitems_theme_mode');

//       if (storedTests) setSavedTests(JSON.parse(storedTests));
//       if (storedHistories) setTestHistories(JSON.parse(storedHistories));
//       if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
//       if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
//       if (storedName) {
//         setUserName(storedName);
//         setTempName(storedName);
//       }
//       if (storedTheme) setThemeMode(storedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [toolStates, activeTab, loading]);

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], input: val }
//     }));
//   };

//   const handleSaveName = () => {
//     if (!tempName.trim()) return;
//     setUserName(tempName.trim());
//     localStorage.setItem('buitems_user_name', tempName.trim());
//     setIsEditingName(false);
//   };

//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       localStorage.clear();
//       document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
//       router.replace('/login');
//       router.refresh();
//     }
//   };

//   const handleTriggerSave = (msgText, queryText) => {
//     if (!activeBookshelfId) {
//       setPendingItemToSave({ text: msgText, title: queryText });
//       setNewBookshelfName(queryText || 'My Study Notes');
//       setShowSaveModal(true);
//     } else {
//       saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
//     }
//   };

//   const handleCreateNewBookshelfAndSave = () => {
//     if (!newBookshelfName.trim()) return;
//     const shelfId = Date.now().toString();
//     const newShelf = {
//       id: shelfId,
//       title: newBookshelfName.trim(),
//       date: new Date().toLocaleDateString(),
//       items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
//     };

//     const updatedShelves = [newShelf, ...bookshelves];
//     setBookshelves(updatedShelves);
//     setActiveBookshelfId(shelfId);

//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     localStorage.setItem('buitems_active_bookshelf_id', shelfId);

//     setShowSaveModal(false);
//     setPendingItemToSave(null);
//     setNewBookshelfName('');
//     alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
//   };

//   const saveItemToBookshelf = (shelfId, item) => {
//     const updatedShelves = bookshelves.map(shelf => {
//       if (shelf.id === shelfId) {
//         return { ...shelf, items: [item, ...shelf.items] };
//       }
//       return shelf;
//     });
//     setBookshelves(updatedShelves);
//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     alert("Successfully saved to your active bookshelf!");
//   };

//   const handleDeleteBookshelf = (e, shelfId) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this bookshelf?")) {
//       const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
//       setBookshelves(updatedShelves);
//       localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//       if (activeBookshelfId === shelfId) {
//         setActiveBookshelfId(null);
//         localStorage.removeItem('buitems_active_bookshelf_id');
//       }
//       if (viewingBookshelf && viewingBookshelf.id === shelfId) {
//         setViewingBookshelf(null);
//       }
//     }
//   };

//   const handleClearAllBookshelves = () => {
//     if (window.confirm("Are you sure you want to delete all bookshelves?")) {
//       setBookshelves([]);
//       setActiveBookshelfId(null);
//       setViewingBookshelf(null);
//       localStorage.removeItem('buitems_personal_bookshelves');
//       localStorage.removeItem('buitems_active_bookshelf_id');
//     }
//   };

//   const handleDeleteTest = (e, testId) => {
//     e.stopPropagation();
//     const updatedTests = savedTests.filter(t => t.id !== testId);
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     if (activeTest && activeTest.id === testId) setActiveTest(null);
//   };

//   const handleClearAllTests = () => {
//     if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
//       setSavedTests([]);
//       localStorage.removeItem('buitems_mock_tests');
//       setActiveTest(null);
//     }
//   };

//   const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
//     const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

//     try {
//       if (typeof rawText === 'string') {
//         let cleaned = rawText.trim();
//         const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (match) cleaned = match[1].trim();

//         const firstBracket = cleaned.indexOf('[');
//         const lastBracket = cleaned.lastIndexOf(']');
//         if (firstBracket !== -1 && lastBracket !== -1) {
//           cleaned = cleaned.substring(firstBracket, lastBracket + 1);
//         }

//         const parsed = JSON.parse(cleaned);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const validQuestions = parsed.map(q => ({
//             question: q.question || "Sample Question?",
//             options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
//             correct: typeof q.correct === 'number' ? q.correct : 0,
//             topic: q.topic || topicName
//           }));

//           const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
//           const updatedTests = [newTest, ...savedTests];
//           setSavedTests(updatedTests);
//           localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//           setActiveTest(newTest);
//           setActiveTab('Mock Tests');
//           return;
//         }
//       }
//     } catch (err) {
//       console.warn("JSON parse error caught safely, switching to fallback test:", err);
//     }

//     const fallbackQuestions = [];
//     for (let i = 1; i <= 50; i++) {
//       fallbackQuestions.push({
//         question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
//         options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
//         correct: 0,
//         topic: topicName
//       });
//     }

//     const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
//     const updatedTests = [fallbackTest, ...savedTests];
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     setActiveTest(fallbackTest);
//     setActiveTab('Mock Tests');
//   };

//   const handleImageUpload = (fileList) => {
//     const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
//     if (files.length === 0) return;

//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//           name: file.name,
//           base64: e.target.result,
//         };
//         setNoteExpanderImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (id) => {
//     setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingOver(false);
//     if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
//   };

//   const formatFileSize = (bytes) => {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   const handlePdfUpload = (fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
//     if (!isPdf) {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setSelectedPdf({
//         name: file.name,
//         size: file.size,
//         base64: e.target.result,
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePdf = () => setSelectedPdf(null);

//   const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
//   const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
//   const handlePdfDrop = (e) => {
//     e.preventDefault();
//     setIsPdfDraggingOver(false);
//     if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
//   };

//   const handleSendQuery = async (e, customPrompt = null) => {
//     if (e) e.preventDefault();
//     const queryText = (customPrompt || currentToolState.input).trim();
//     const isNoteExpander = activeTab === 'Note Expander';
//     const isPdfUploader = activeTab === 'PDF Uploader';
//     const hasImages = isNoteExpander && noteExpanderImages.length > 0;
//     const hasPdf = isPdfUploader && !!selectedPdf;

//     if ((!queryText && !hasImages && !hasPdf) || loading) return;

//     const userMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       text: queryText || (hasImages
//         ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
//         : hasPdf
//           ? `📄 Uploaded ${selectedPdf.name}`
//           : '')
//     };
    
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
//     }));
//     setLoading(true);

//     try {
//       let finalQuery = queryText;
//       const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

//       const lowerQuery = queryText.toLowerCase();
//       const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
//       const previousMessages = toolStates[activeTab]?.messages || [];
      
//       if (hasPronoun && previousMessages.length > 0) {
//         const lastMsg = previousMessages[previousMessages.length - 1];
//         const contextTopic = lastMsg.queryContext || lastMsg.text || '';
//         if (contextTopic) {
//           finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
//         }
//       }

//       if (isMockReq && activeTab === 'Ask Anything') {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
//       }

//       if (isNoteExpander) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: Expand and correct the rough notes provided.]`;
//       }

//       if (isPdfUploader) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: Analyze the PDF and provide structured study summaries.]`;
//       }

//       let endpoint = 'http://localhost:5000/api/ai/ask-anything';
//       if (activeTab === 'Note Expander') endpoint = 'http://localhost:5000/api/ai/expand-notes';
//       else if (activeTab === 'PDF Uploader') endpoint = 'http://localhost:5000/api/ai/pdf-analysis';

//       const payload = { prompt: finalQuery, tool: activeTab };
//       if (hasImages) payload.images = noteExpanderImages.map(img => img.base64);
//       if (hasPdf) {
//         payload.pdf = selectedPdf.base64;
//         payload.pdfName = selectedPdf.name;
//       }

//       const response = await secureFetch(endpoint, {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       if (!response) {
//         setLoading(false);
//         return;
//       }

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || 'Failed to process AI generation request.');

//       const rawContent = data.result || data.text || data.content || JSON.stringify(data);

//       if (isMockReq) {
//         extractAndSavedMockTestSafe(rawContent, queryText);
//         setLoading(false);
//         return;
//       }

//       const aiResponse = { 
//         id: (Date.now() + 1).toString(), 
//         sender: 'ai', 
//         result: rawContent, 
//         text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
//         queryContext: queryText 
//       };

//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
//       }));

//       if (hasImages) setNoteExpanderImages([]);
//       if (hasPdf) setSelectedPdf(null);

//     } catch (err) {
//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { 
//           ...prev[activeTab], 
//           messages: [...prev[activeTab].messages, { id: Date.now().toString(), sender: 'ai', text: `Error: ${err.message}` }] 
//         }
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOptionSelect = (qIdx, optIdx) => {
//     setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
//   };

//   const handleSubmitTest = () => {
//     let score = 0;
//     let weakTopicsMap = [];

//     activeTest.questions.forEach((q, idx) => {
//       if (selectedAnswers[idx] === q.correct) score += 1;
//       else weakTopicsMap.push(q.topic || activeTest.title);
//     });

//     const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
//     const weakTopics = [...new Set(weakTopicsMap)];
//     const previousHistory = testHistories[activeTest.id];
//     let comparisonMessage = "First Attempt Completed!";
//     let statusColor = "text-zinc-600";

//     if (previousHistory) {
//       if (percentage > previousHistory.lastPercentage) {
//         comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-emerald-600 font-bold";
//       } else if (percentage < previousHistory.lastPercentage) {
//         comparisonMessage = `Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-red-600 font-bold";
//       } else {
//         comparisonMessage = `Consistent performance at ${percentage}%.`;
//         statusColor = "text-zinc-600";
//       }
//     }

//     const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
//     setTestResult(resultObj);
//     const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
//     setTestHistories(updatedHistory);
//     localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
//   };

//   const handleRetakeTest = () => {
//     const shuffledQuestions = activeTest.questions.map(q => {
//       const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
//       optionsWithIndex.sort(() => Math.random() - 0.5);
//       return {
//         ...q,
//         options: optionsWithIndex.map(o => o.text),
//         correct: optionsWithIndex.findIndex(o => o.isCorrect)
//       };
//     });
//     setActiveTest({ ...activeTest, questions: shuffledQuestions });
//     setSelectedAnswers({});
//     setTestResult(null);
//     setCurrentQuestionIndex(0);
//   };

//   const handleExitTest = () => {
//     setActiveTest(null);
//     setTestResult(null);
//     setSelectedAnswers({});
//     setCurrentQuestionIndex(0);
//   };

//   const handleResetSession = () => {
//     setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
//     setActiveBookshelfId(null);
//     localStorage.removeItem('buitems_active_bookshelf_id');
//     setNoteExpanderImages([]);
//     setSelectedPdf(null);
//   };

//   const currentToolState = toolStates[activeTab] || { messages: [], input: '' };
//   const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

//   if (!mounted) return null;

//   return (
//     <div className="flex h-[100dvh] bg-white text-black font-sans overflow-hidden relative selection:bg-emerald-500 selection:text-white">
      
//       {/* Dynamic Ambient Light Beams - Adjusted for White Theme */}
//       <div className="absolute top-0 right-0 w-[650px] h-[500px] bg-gradient-to-br from-emerald-100/50 via-zinc-100/60 to-white blur-[140px] rounded-full pointer-events-none z-0" />
//       <div className="absolute top-1/3 left-10 w-[400px] h-[350px] bg-gradient-to-tr from-emerald-50/60 to-white blur-[130px] rounded-full pointer-events-none z-0" />

//       {isMobileSidebarOpen && (
//         <div 
//           onClick={() => setIsMobileSidebarOpen(false)}
//           className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm transition-opacity"
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`fixed md:relative inset-y-0 left-0 z-30 w-72 border-r border-zinc-200 bg-zinc-50/95 backdrop-blur-2xl flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
//         <div>
//           <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-zinc-200">
//             <div className="flex items-center gap-3">
//               {/* Aesthetic Green AI Logo */}
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white">
//                 <Sparkles className="w-5 h-5 animate-pulse text-white" />
//               </div>
//               <div>
//                 <h1 className="text-sm font-extrabold tracking-wider text-zinc-900">Echo AI Study</h1>
//                 <p className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase truncate max-w-[120px]">{userName}</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setIsMobileSidebarOpen(false)}
//               className="md:hidden text-zinc-500 hover:text-black p-1"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-3 mb-2">Core Tools</div>
//           <nav className="space-y-1.5">
//             {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                        ? 'bg-zinc-200 text-black border border-zinc-300 shadow-sm'
//                       : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
//                   }`}
//                 >
//                   <FileText className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-500'}`} /> {name}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-3 mt-6 mb-2">Library & Workspace</div>
//           <nav className="space-y-1.5">
//             {['Personal Bookshelf', 'Mock Tests'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-zinc-200 text-black border border-zinc-300 shadow-sm'
//                       : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
//                   }`}
//                 >
//                   <HelpCircle className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-500'}`} /> {name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Upgrade / Account Box */}
//         <div className="pt-4 border-t border-zinc-200 space-y-2">
         
            

//           <button
//             onClick={() => { setIsSettingsOpen(true); setIsMobileSidebarOpen(false); }}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-zinc-200 border border-zinc-300 text-zinc-700 flex items-center justify-center font-bold text-xs shadow-sm">
//               <Settings className="w-3.5 h-3.5" />
//             </div>
//             <span>Settings & Profile</span>
//           </button>
          
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
//               <LogOut className="w-3.5 h-3.5" />
//             </div>
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Workspace Area */}
//       <main className="flex-1 flex flex-col justify-between bg-transparent relative z-10 overflow-hidden w-full">
//         {/* Header */}
//         <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
//           <div className="flex items-center gap-3 min-w-0">
//             <button
//               onClick={() => setIsMobileSidebarOpen(true)}
//               className="md:hidden p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 shrink-0"
//               title="Open Menu"
//             >
//               <Menu className="w-4 h-4" />
//             </button>
//             <span className="px-3.5 py-1.5 rounded-full border border-zinc-200 bg-zinc-100 text-[11px] font-semibold uppercase tracking-wider text-zinc-700 truncate">
//               Session: <span className="text-emerald-600 font-bold">{activeTab}</span>
//             </span>
//             {activeBookshelfId && activeTab === 'Ask Anything' && (
//               <span className="hidden lg:inline-block text-[11px] font-semibold text-zinc-900 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full truncate max-w-[220px]">
//                 Shelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
//               </span>
//             )}
//           </div>
//           {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
//             <button 
//               onClick={handleResetSession} 
//               className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 transition-all shrink-0 ml-2 shadow-sm"
//             >
//               <RefreshCcw className="w-3.5 h-3.5 text-emerald-600" />
//               <span>Reset Chat</span>
//             </button>
//           )}
//         </header>

//         {/* Tab Content Routing */}
//         {activeTab === 'Personal Bookshelf' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!viewingBookshelf ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-zinc-900">My Personal Bookshelf</h2>
//                     <p className="text-xs text-zinc-500 mt-1">Manage saved study modules and topic notes.</p>
//                   </div>
//                   {bookshelves.length > 0 && (
//                     <button
//                       onClick={handleClearAllBookshelves}
//                       className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
//                     </button>
//                   )}
//                 </div>

//                 {bookshelves.length === 0 ? (
//                   <div className="p-16 border border-zinc-200 bg-zinc-50 backdrop-blur-xl rounded-3xl text-center space-y-4 shadow-xl">
//                     <BookOpen className="w-12 h-12 mx-auto text-zinc-400 animate-pulse" />
//                     <h3 className="text-lg font-bold text-zinc-800">No bookshelves created yet.</h3>
//                     <p className="text-xs text-zinc-500 max-w-sm mx-auto">
//                       Go to <span className="text-emerald-600 font-semibold">Ask Anything</span>, generate study notes, and click <span className="text-zinc-900 font-semibold">"Save to Bookshelf"</span> to build your custom library.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {bookshelves.map((shelf) => (
//                       <div
//                         key={shelf.id}
//                         onClick={() => setViewingBookshelf(shelf)}
//                         className="p-6 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded-2xl flex flex-col justify-between h-48 transition-all shadow-md cursor-pointer group"
//                       >
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-zinc-900 capitalize pr-6 flex items-center gap-2">
//                               <BookOpen className="w-4 h-4 text-emerald-600" /> {shelf.title}
//                             </h3>
//                             <button
//                               onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
//                               className="text-zinc-400 hover:text-red-600 p-1"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-500 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
//                         </div>
//                         <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
//                           <span className={`text-[11px] font-semibold ${activeBookshelfId === shelf.id ? 'text-emerald-600' : 'text-zinc-500'}`}>
//                             {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
//                           </span>
//                           <span className="px-3.5 py-1.5 bg-black text-white hover:bg-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors">
//                             Open Shelf <ArrowRight className="w-3.5 h-3.5" />
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
//                   <div>
//                     <button onClick={() => setViewingBookshelf(null)} className="text-xs text-zinc-500 hover:text-black hover:underline mb-1">← Back to All Bookshelves</button>
//                     <h2 className="text-lg font-extrabold text-zinc-900 capitalize flex items-center gap-2">
//                       <BookOpen className="w-5 h-5 text-emerald-600" /> {viewingBookshelf.title}
//                     </h2>
//                     <p className="text-xs text-zinc-500 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setActiveBookshelfId(viewingBookshelf.id);
//                       localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
//                       alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
//                     }}
//                     className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeBookshelfId === viewingBookshelf.id ? 'bg-black text-white font-extrabold shadow-md' : 'bg-zinc-100 text-zinc-900 border border-zinc-300 hover:bg-zinc-200'}`}
//                   >
//                     {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   {viewingBookshelf.items.map((item, idx) => (
//                     <div key={idx} className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 shadow-md">
//                       <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
//                         <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600">Topic: {item.title || viewingBookshelf.title}</h4>
//                         <span className="text-[10px] text-zinc-500">{item.date}</span>
//                       </div>
//                       <div className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800">
//                         {item.text}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : activeTab === 'Mock Tests' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!activeTest ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-zinc-900">Saved Mock Tests</h2>
//                     <p className="text-xs text-zinc-500 mt-1">Generated tests are stored here for practice.</p>
//                   </div>
//                   {savedTests.length > 0 && (
//                     <button
//                       onClick={handleClearAllTests}
//                       className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
//                     </button>
//                   )}
//                 </div>

//                 {savedTests.length === 0 ? (
//                   <div className="p-16 border border-zinc-200 bg-zinc-50 backdrop-blur-xl rounded-3xl text-center space-y-3 shadow-xl">
//                     <HelpCircle className="w-12 h-12 text-zinc-400 mx-auto animate-pulse" />
//                     <h3 className="text-lg font-bold text-zinc-800">No mock tests available yet.</h3>
//                     <p className="text-xs text-zinc-500 max-w-sm mx-auto">
//                       Type <span className="text-emerald-600 font-semibold">"generate quiz"</span> in <span className="text-zinc-900 font-semibold">Ask Anything</span> to create mock tests.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {savedTests.map((test) => (
//                       <div key={test.id} className="p-6 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded-2xl flex flex-col justify-between h-44 transition-all shadow-md group">
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-zinc-900 capitalize pr-6 truncate">{test.title}</h3>
//                             <button
//                               onClick={(e) => handleDeleteTest(e, test.id)}
//                               className="text-zinc-400 hover:text-red-600 p-1 shrink-0"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-500 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
//                         </div>
//                         <button
//                           onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
//                           className="self-end px-4 py-2 bg-black text-white hover:bg-zinc-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
//                         >
//                           Open Test <ArrowRight className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTest && !testResult ? (
//               <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
//                 <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
//                   <div className="min-w-0 pr-2">
//                     <h2 className="text-base font-extrabold text-zinc-900 capitalize truncate">{activeTest.title}</h2>
//                     <p className="text-xs text-zinc-500 mt-0.5">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
//                   </div>
//                   <button onClick={handleExitTest} className="text-xs text-zinc-600 hover:text-black underline shrink-0">Exit to Library</button>
//                 </div>

//                 <div className="space-y-4">
//                   <p className="text-sm font-semibold text-zinc-900 leading-relaxed">{activeTest.questions[currentQuestionIndex].question}</p>
//                   <div className="space-y-2.5">
//                     {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
//                         className={`w-full text-left px-4.5 py-3 rounded-xl text-xs transition-all border ${
//                           selectedAnswers[currentQuestionIndex] === oIdx
//                             ? 'bg-zinc-200 text-black font-bold border-zinc-400 shadow-sm'
//                             : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-100'
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
//                   <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 text-xs font-semibold disabled:opacity-40">Previous</button>
//                   {currentQuestionIndex < activeTest.questions.length - 1 ? (
//                     <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold shadow-sm">Next Question</button>
//                   ) : (
//                     <button onClick={handleSubmitTest} className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md">Submit Test</button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-zinc-50 border border-zinc-200 rounded-3xl shadow-xl overflow-hidden space-y-6">
//                 <div className="p-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
//                       <CheckCircle2 className="w-5 h-5" />
//                     </div>
//                     <h2 className="text-base font-extrabold text-zinc-900 capitalize truncate">{activeTest.title} - Test Results</h2>
//                   </div>
//                   <span className={`text-xs font-bold ${testResult.statusColor} bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full`}>
//                     {testResult.comparisonMessage}
//                   </span>
//                 </div>

//                 <div className="px-6 pb-8">
//                   <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
//                     <table className="w-full text-left text-sm">
//                       <thead className="bg-zinc-100 text-xs uppercase font-mono text-zinc-600">
//                         <tr>
//                           <th className="px-5 py-3.5 border-b border-zinc-200">Evaluation Metric</th>
//                           <th className="px-5 py-3.5 border-b border-zinc-200">Details</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-zinc-200 text-zinc-800 text-xs">
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-zinc-900">Total Score</td>
//                           <td className="px-5 py-4">{testResult.score} / {testResult.total}</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-zinc-900">Percentage Obtained</td>
//                           <td className="px-5 py-4 font-mono font-extrabold text-zinc-900 text-sm">{testResult.percentage}%</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-zinc-900 align-top">Weak Topics</td>
//                           <td className="px-5 py-4">
//                             {testResult.weakTopics.length > 0 ? (
//                               <ul className="list-disc list-inside text-zinc-600 space-y-1">
//                                 {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
//                               </ul>
//                             ) : (
//                               <span className="text-emerald-600 font-semibold">Brilliant! All answers were correct.</span>
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//                     <button onClick={handleExitTest} className="text-xs text-zinc-600 hover:text-black underline self-start sm:self-auto">
//                       ← Back to Saved Mock Tests
//                     </button>
//                     <button onClick={handleRetakeTest} className="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
//                       <RefreshCcw className="w-4 h-4 text-emerald-600" /> Retake Test
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <>
//             {/* Chat & Prompt Main View */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {currentToolState.messages.length === 0 ? (
//                 /* Glowing Central Hero Welcome */
//                 <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 py-12">
                  
//                   {/* Glowing Logo Badge (Aesthetic Green) */}
//                   <div className="relative group">
//                     <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 to-green-400 blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse" />
//                     <div className="relative w-20 h-20 rounded-3xl bg-white border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-xl">
//                       <Sparkles className="w-10 h-10 text-emerald-600" />
//                     </div>
//                   </div>

//                   {/* Welcome Titles */}
//                   <div className="space-y-2">
//                     <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Welcome to Echo AI</p>
//                     <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
//                       How Can I Assist You?
//                     </h2>
//                   </div>

//                   {/* Suggestion Cards Grid */}
//                   {activeTab === 'Ask Anything' && (
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-4">
//                       {[
//                         { title: "Expand Rough Notes", desc: "Upload handwritten lecture notes", icon: ImagePlus, prompt: "Expand my lecture notes with detailed explanations" },
//                         { title: "Generate Mock Test", desc: "50 MCQs exam quiz generator", icon: HelpCircle, prompt: "Generate a mock test on Computer Networks" },
//                         { title: "Analyze Reference PDF", desc: "Extract key terms & formulas", icon: FileUp, prompt: "Summarize main concepts from reference materials" },
//                       ].map((card, i) => (
//                         <button
//                           key={i}
//                           onClick={() => handleSendQuery(null, card.prompt)}
//                           className="p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-left transition-all group shadow-sm flex flex-col justify-between h-32"
//                         >
//                           <card.icon className="w-5 h-5 text-zinc-500 group-hover:text-black transition-colors" />
//                           <div>
//                             <p className="text-xs font-bold text-zinc-800 group-hover:text-black">{card.title}</p>
//                             <p className="text-[10px] text-zinc-500 mt-0.5">{card.desc}</p>
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 currentToolState.messages.map((msg) => (
//                   msg.sender === 'user' ? (
//                     <div key={msg.id} className="flex justify-end w-full">
//                       <div className="max-w-[90%] sm:max-w-[80%] bg-zinc-100 text-zinc-900 border border-zinc-200 px-5 py-3.5 rounded-2xl rounded-br-none text-sm flex items-start gap-3 shadow-sm">
//                         <span className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</span>
//                         <div className="p-1 rounded-full bg-black text-white shrink-0 mt-0.5"><User className="w-3.5 h-3.5" /></div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div key={msg.id} className="space-y-2">
//                       <div className="flex justify-start">
//                         <button
//                           onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
//                           className="px-3.5 py-1.5 bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
//                         >
//                           <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600" /> Save to Bookshelf
//                         </button>
//                       </div>
//                       <AIResponseCard message={msg} onBookmark={(item) => handleTriggerSave(item.content, msg.queryContext || 'Saved Notes')} />
//                     </div>
//                   )
//                 ))
//               )}
//               {loading && (
//                 <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200 w-fit text-xs text-zinc-800 animate-pulse flex items-center gap-2 shadow-md">
//                   <Sparkles className="w-4 h-4 animate-spin text-emerald-600" /> Echo AI is processing your request...
//                 </div>
//               )}
//               <div ref={chatEndRef} />
//             </div>

//             {/* Bottom Floating Glass Input Capsule */}
//             <div className="p-4 sm:p-6 bg-transparent">
//               <div className="max-w-4xl mx-auto space-y-3">

//                 {activeTab === 'Note Expander' && (
//                   <div
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-zinc-50 ${
//                       isDraggingOver
//                         ? 'border-emerald-500 bg-emerald-50/50'
//                         : 'border-zinc-300 hover:border-zinc-400'
//                     }`}
//                   >
//                     {noteExpanderImages.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         {noteExpanderImages.map((img) => (
//                           <div key={img.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-300 group shadow-sm">
//                             <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(img.id)}
//                               className="absolute top-1 right-1 bg-zinc-900/80 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => noteImageInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black transition-all border border-zinc-200 bg-white shadow-sm"
//                     >
//                       <ImagePlus className="w-4 h-4 text-emerald-600" />
//                       <span className="truncate">{noteExpanderImages.length > 0 ? 'Add More Photos' : 'Upload Photos of Notes'}</span>
//                     </button>
//                     <input
//                       ref={noteImageInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {activeTab === 'PDF Uploader' && (
//                   <div
//                     onDragOver={handlePdfDragOver}
//                     onDragLeave={handlePdfDragLeave}
//                     onDrop={handlePdfDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-zinc-50 ${
//                       isPdfDraggingOver
//                         ? 'border-emerald-500 bg-emerald-50/50'
//                         : 'border-zinc-300 hover:border-zinc-400'
//                     }`}
//                   >
//                     {selectedPdf ? (
//                       <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-zinc-200 bg-white mb-3 shadow-sm">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
//                             <FileText className="w-5 h-5" />
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-xs font-bold truncate text-zinc-900">{selectedPdf.name}</p>
//                             <p className="text-[10px] text-zinc-500">{formatFileSize(selectedPdf.size)}</p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removePdf}
//                           className="text-zinc-400 hover:text-red-600 p-1.5"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => pdfInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black transition-all border border-zinc-200 bg-white shadow-sm"
//                     >
//                       <FileUp className="w-4 h-4 text-emerald-600" />
//                       <span className="truncate">{selectedPdf ? 'Replace PDF' : 'Upload Reference PDF'}</span>
//                     </button>
//                     <input
//                       ref={pdfInputRef}
//                       type="file"
//                       accept="application/pdf,.pdf"
//                       onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {/* Floating Capsule Input Bar */}
//                 <form onSubmit={handleSendQuery} className="relative group">
//                   <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-md opacity-0 group-focus-within:opacity-50 transition-opacity pointer-events-none" />
                  
//                   <div className="relative flex items-center bg-zinc-50 border border-zinc-300 focus-within:border-emerald-600 rounded-2xl px-4 py-2 shadow-lg transition-all">
//                     <Sparkles className="w-4 h-4 text-emerald-600 mr-3 shrink-0" />
//                     <input
//                       type="text"
//                       value={currentToolState.input}
//                       onChange={handleInputChange}
//                       placeholder="Ask AI anything or write your request..."
//                       className="w-full bg-transparent py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
//                     />
                    
//                     <button
//                       type="submit"
//                       disabled={
//                         loading ||
//                         (!currentToolState.input.trim() &&
//                           !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
//                           !(activeTab === 'PDF Uploader' && selectedPdf))
//                       }
//                       className="ml-2 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-md disabled:opacity-40 shrink-0"
//                     >
//                       <Send className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* Save Modal */}
//       {showSaveModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white border border-zinc-200 text-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
//             <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
//               <h3 className="text-sm font-extrabold flex items-center gap-2 text-zinc-900">
//                 <BookmarkPlus className="w-4 h-4 text-emerald-600" /> Create New Bookshelf
//               </h3>
//               <button onClick={() => setShowSaveModal(false)} className="text-zinc-500 hover:text-black"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <p className="text-zinc-600">Name your new bookshelf to save this study material:</p>
//               <input
//                 type="text"
//                 value={newBookshelfName}
//                 onChange={(e) => setNewBookshelfName(e.target.value)}
//                 placeholder="e.g. Physics Notes, Web Dev..."
//                 className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-zinc-50 text-zinc-900 outline-none focus:border-emerald-600 font-medium"
//               />
//             </div>

//             <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-200">
//               <button onClick={() => setShowSaveModal(false)} className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold">Cancel</button>
//               <button onClick={handleCreateNewBookshelfAndSave} className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold shadow-sm">Create & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <SettingsModal
//         isOpen={isSettingsOpen}
//         onClose={() => setIsSettingsOpen(false)}
//       />
//     </div>
//   );
// }



//10th edit
// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   Lightbulb, Send, Settings, FileText, HelpCircle, User, X, 
//   CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, 
//   BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp, Menu, 
//   Sparkles, Bot, Zap, Flame, Compass, Paperclip, Mic 
// } from 'lucide-react';
// import { secureFetch } from '@/utils/apiHelper';
// import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
// import SettingsModal from '@/components/SettingsModal';
// import AIResponseCard from '@/components/AIResponseCard';


// export default function DashboardPage() {
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   const [activeTab, setActiveTab] = useState('Ask Anything');
//   const [showSettings, setShowSettings] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
//   const [toolStates, setToolStates] = useState({
//     'Ask Anything': { messages: [], input: '' },
//     'Note Expander': { messages: [], input: '' },
//     'PDF Uploader': { messages: [], input: '' },
//   });
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // --- USER PROFILE & THEME STATES ---
//   const [userName, setUserName] = useState('MIR SHAHARYAR');
//   const [tempName, setTempName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [themeMode, setThemeMode] = useState('light');

//   // --- PERSONAL BOOKSHELF STATES ---
//   const [bookshelves, setBookshelves] = useState([]);
//   const [activeBookshelfId, setActiveBookshelfId] = useState(null);
//   const [viewingBookshelf, setViewingBookshelf] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [pendingItemToSave, setPendingItemToSave] = useState(null);
//   const [newBookshelfName, setNewBookshelfName] = useState('');

//   // --- MOCK TEST STATES ---
//   const [savedTests, setSavedTests] = useState([]);
//   const [testHistories, setTestHistories] = useState({});
//   const [activeTest, setActiveTest] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [testResult, setTestResult] = useState(null);

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD STATES ---
//   const [noteExpanderImages, setNoteExpanderImages] = useState([]);
//   const [isDraggingOver, setIsDraggingOver] = useState(false);
//   const noteImageInputRef = useRef(null);

//   // --- PDF UPLOADER: SINGLE PDF UPLOAD STATES ---
//   const [selectedPdf, setSelectedPdf] = useState(null);
//   const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
//   const pdfInputRef = useRef(null);

//   // --- AUTH GUARD ---
//   useEffect(() => {
//     setMounted(true);
//     const token = localStorage.getItem('token');
//     if (!token) {
//       router.replace('/login');
//     }
//   }, [router]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedTests = localStorage.getItem('buitems_mock_tests');
//       const storedHistories = localStorage.getItem('buitems_test_histories');
//       const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
//       const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
//       const storedName = localStorage.getItem('buitems_user_name');
//       const storedTheme = localStorage.getItem('buitems_theme_mode');

//       if (storedTests) setSavedTests(JSON.parse(storedTests));
//       if (storedHistories) setTestHistories(JSON.parse(storedHistories));
//       if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
//       if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
//       if (storedName) {
//         setUserName(storedName);
//         setTempName(storedName);
//       }
//       if (storedTheme) setThemeMode(storedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [toolStates, activeTab, loading]);

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], input: val }
//     }));
//   };

//   const handleSaveName = () => {
//     if (!tempName.trim()) return;
//     setUserName(tempName.trim());
//     localStorage.setItem('buitems_user_name', tempName.trim());
//     setIsEditingName(false);
//   };

//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       localStorage.clear();
//       document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
//       router.replace('/login');
//       router.refresh();
//     }
//   };

//   const handleTriggerSave = (msgText, queryText) => {
//     if (!activeBookshelfId) {
//       setPendingItemToSave({ text: msgText, title: queryText });
//       setNewBookshelfName(queryText || 'My Study Notes');
//       setShowSaveModal(true);
//     } else {
//       saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
//     }
//   };

//   const handleCreateNewBookshelfAndSave = () => {
//     if (!newBookshelfName.trim()) return;
//     const shelfId = Date.now().toString();
//     const newShelf = {
//       id: shelfId,
//       title: newBookshelfName.trim(),
//       date: new Date().toLocaleDateString(),
//       items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
//     };

//     const updatedShelves = [newShelf, ...bookshelves];
//     setBookshelves(updatedShelves);
//     setActiveBookshelfId(shelfId);

//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     localStorage.setItem('buitems_active_bookshelf_id', shelfId);

//     setShowSaveModal(false);
//     setPendingItemToSave(null);
//     setNewBookshelfName('');
//     alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
//   };

//   const saveItemToBookshelf = (shelfId, item) => {
//     const updatedShelves = bookshelves.map(shelf => {
//       if (shelf.id === shelfId) {
//         return { ...shelf, items: [item, ...shelf.items] };
//       }
//       return shelf;
//     });
//     setBookshelves(updatedShelves);
//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     alert("Successfully saved to your active bookshelf!");
//   };

//   const handleDeleteBookshelf = (e, shelfId) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this bookshelf?")) {
//       const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
//       setBookshelves(updatedShelves);
//       localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//       if (activeBookshelfId === shelfId) {
//         setActiveBookshelfId(null);
//         localStorage.removeItem('buitems_active_bookshelf_id');
//       }
//       if (viewingBookshelf && viewingBookshelf.id === shelfId) {
//         setViewingBookshelf(null);
//       }
//     }
//   };

//   const handleClearAllBookshelves = () => {
//     if (window.confirm("Are you sure you want to delete all bookshelves?")) {
//       setBookshelves([]);
//       setActiveBookshelfId(null);
//       setViewingBookshelf(null);
//       localStorage.removeItem('buitems_personal_bookshelves');
//       localStorage.removeItem('buitems_active_bookshelf_id');
//     }
//   };

//   const handleDeleteTest = (e, testId) => {
//     e.stopPropagation();
//     const updatedTests = savedTests.filter(t => t.id !== testId);
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     if (activeTest && activeTest.id === testId) setActiveTest(null);
//   };

//   const handleClearAllTests = () => {
//     if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
//       setSavedTests([]);
//       localStorage.removeItem('buitems_mock_tests');
//       setActiveTest(null);
//     }
//   };

//   const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
//     const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

//     try {
//       if (typeof rawText === 'string') {
//         let cleaned = rawText.trim();
//         const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (match) cleaned = match[1].trim();

//         const firstBracket = cleaned.indexOf('[');
//         const lastBracket = cleaned.lastIndexOf(']');
//         if (firstBracket !== -1 && lastBracket !== -1) {
//           cleaned = cleaned.substring(firstBracket, lastBracket + 1);
//         }

//         const parsed = JSON.parse(cleaned);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const validQuestions = parsed.map(q => ({
//             question: q.question || "Sample Question?",
//             options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
//             correct: typeof q.correct === 'number' ? q.correct : 0,
//             topic: q.topic || topicName
//           }));

//           const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
//           const updatedTests = [newTest, ...savedTests];
//           setSavedTests(updatedTests);
//           localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//           setActiveTest(newTest);
//           setActiveTab('Mock Tests');
//           return;
//         }
//       }
//     } catch (err) {
//       console.warn("JSON parse error caught safely, switching to fallback test:", err);
//     }

//     const fallbackQuestions = [];
//     for (let i = 1; i <= 50; i++) {
//       fallbackQuestions.push({
//         question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
//         options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
//         correct: 0,
//         topic: topicName
//       });
//     }

//     const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
//     const updatedTests = [fallbackTest, ...savedTests];
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     setActiveTest(fallbackTest);
//     setActiveTab('Mock Tests');
//   };

//   const handleImageUpload = (fileList) => {
//     const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
//     if (files.length === 0) return;

//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//           name: file.name,
//           base64: e.target.result,
//         };
//         setNoteExpanderImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (id) => {
//     setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingOver(false);
//     if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
//   };

//   const formatFileSize = (bytes) => {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   const handlePdfUpload = (fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
//     if (!isPdf) {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setSelectedPdf({
//         name: file.name,
//         size: file.size,
//         base64: e.target.result,
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePdf = () => setSelectedPdf(null);

//   const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
//   const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
//   const handlePdfDrop = (e) => {
//     e.preventDefault();
//     setIsPdfDraggingOver(false);
//     if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
//   };

//   const handleSendQuery = async (e, customPrompt = null) => {
//     if (e) e.preventDefault();
//     const queryText = (customPrompt || currentToolState.input).trim();
//     const isNoteExpander = activeTab === 'Note Expander';
//     const isPdfUploader = activeTab === 'PDF Uploader';
//     const hasImages = isNoteExpander && noteExpanderImages.length > 0;
//     const hasPdf = isPdfUploader && !!selectedPdf;

//     if ((!queryText && !hasImages && !hasPdf) || loading) return;

//     const userMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       text: queryText || (hasImages
//         ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
//         : hasPdf
//           ? `📄 Uploaded ${selectedPdf.name}`
//           : '')
//     };
    
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
//     }));
//     setLoading(true);

//     try {
//       let finalQuery = queryText;
//       const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

//       const lowerQuery = queryText.toLowerCase();
//       const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
//       const previousMessages = toolStates[activeTab]?.messages || [];
      
//       if (hasPronoun && previousMessages.length > 0) {
//         const lastMsg = previousMessages[previousMessages.length - 1];
//         const contextTopic = lastMsg.queryContext || lastMsg.text || '';
//         if (contextTopic) {
//           finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
//         }
//       }

//       if (isMockReq && activeTab === 'Ask Anything') {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
//       }

//       if (isNoteExpander) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: Expand and correct the rough notes provided.]`;
//       }

//       if (isPdfUploader) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: Analyze the PDF and provide structured study summaries.]`;
//       }

//       let endpoint = 'http://localhost:5000/api/ai/ask-anything';
//       if (activeTab === 'Note Expander') endpoint = 'http://localhost:5000/api/ai/expand-notes';
//       else if (activeTab === 'PDF Uploader') endpoint = 'http://localhost:5000/api/ai/pdf-analysis';

//       const payload = { prompt: finalQuery, tool: activeTab };
//       if (hasImages) payload.images = noteExpanderImages.map(img => img.base64);
//       if (hasPdf) {
//         payload.pdf = selectedPdf.base64;
//         payload.pdfName = selectedPdf.name;
//       }

//       const response = await secureFetch(endpoint, {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       if (!response) {
//         setLoading(false);
//         return;
//       }

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || 'Failed to process AI generation request.');

//       const rawContent = data.result || data.text || data.content || JSON.stringify(data);

//       if (isMockReq) {
//         extractAndSavedMockTestSafe(rawContent, queryText);
//         setLoading(false);
//         return;
//       }

//       const aiResponse = { 
//         id: (Date.now() + 1).toString(), 
//         sender: 'ai', 
//         result: rawContent, 
//         text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
//         queryContext: queryText 
//       };

//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
//       }));

//       if (hasImages) setNoteExpanderImages([]);
//       if (hasPdf) setSelectedPdf(null);

//     } catch (err) {
//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { 
//           ...prev[activeTab], 
//           messages: [...prev[activeTab].messages, { id: Date.now().toString(), sender: 'ai', text: `Error: ${err.message}` }] 
//         }
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOptionSelect = (qIdx, optIdx) => {
//     setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
//   };

//   const handleSubmitTest = () => {
//     let score = 0;
//     let weakTopicsMap = [];

//     activeTest.questions.forEach((q, idx) => {
//       if (selectedAnswers[idx] === q.correct) score += 1;
//       else weakTopicsMap.push(q.topic || activeTest.title);
//     });

//     const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
//     const weakTopics = [...new Set(weakTopicsMap)];
//     const previousHistory = testHistories[activeTest.id];
//     let comparisonMessage = "First Attempt Completed!";
//     let statusColor = "text-zinc-600";

//     if (previousHistory) {
//       if (percentage > previousHistory.lastPercentage) {
//         comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-emerald-600 font-bold";
//       } else if (percentage < previousHistory.lastPercentage) {
//         comparisonMessage = `Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-red-600 font-bold";
//       } else {
//         comparisonMessage = `Consistent performance at ${percentage}%.`;
//         statusColor = "text-zinc-600";
//       }
//     }

//     const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
//     setTestResult(resultObj);
//     const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
//     setTestHistories(updatedHistory);
//     localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
//   };

//   const handleRetakeTest = () => {
//     const shuffledQuestions = activeTest.questions.map(q => {
//       const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
//       optionsWithIndex.sort(() => Math.random() - 0.5);
//       return {
//         ...q,
//         options: optionsWithIndex.map(o => o.text),
//         correct: optionsWithIndex.findIndex(o => o.isCorrect)
//       };
//     });
//     setActiveTest({ ...activeTest, questions: shuffledQuestions });
//     setSelectedAnswers({});
//     setTestResult(null);
//     setCurrentQuestionIndex(0);
//   };

//   const handleExitTest = () => {
//     setActiveTest(null);
//     setTestResult(null);
//     setSelectedAnswers({});
//     setCurrentQuestionIndex(0);
//   };

//   const handleResetSession = () => {
//     setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
//     setActiveBookshelfId(null);
//     localStorage.removeItem('buitems_active_bookshelf_id');
//     setNoteExpanderImages([]);
//     setSelectedPdf(null);
//   };

//   const currentToolState = toolStates[activeTab] || { messages: [], input: '' };
//   const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

//   if (!mounted) return null;

//   return (
//     <div className="flex h-[100dvh] bg-white text-black font-sans overflow-hidden relative selection:bg-emerald-500 selection:text-white">
      
//       {/* Dynamic Ambient Light Beams - Adjusted for White Theme */}
//       <div className="absolute top-0 right-0 w-[650px] h-[500px] bg-gradient-to-br from-emerald-100/50 via-zinc-100/60 to-white blur-[140px] rounded-full pointer-events-none z-0" />
//       <div className="absolute top-1/3 left-10 w-[400px] h-[350px] bg-gradient-to-tr from-emerald-50/60 to-white blur-[130px] rounded-full pointer-events-none z-0" />

//       {isMobileSidebarOpen && (
//         <div 
//           onClick={() => setIsMobileSidebarOpen(false)}
//           className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm transition-opacity"
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`fixed md:relative inset-y-0 left-0 z-30 w-72 border-r border-zinc-200 bg-zinc-50/95 backdrop-blur-2xl flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
//         <div>
//           <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-zinc-200">
//             <div className="flex items-center gap-3">
//               {/* Aesthetic Green AI Logo */}
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white">
//                 <Sparkles className="w-5 h-5 animate-pulse text-white" />
//               </div>
//               <div>
//                 <h1 className="text-sm font-extrabold tracking-wider text-zinc-900">Echo AI Study</h1>
//                 <p className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase truncate max-w-[120px]">{userName}</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setIsMobileSidebarOpen(false)}
//               className="md:hidden text-zinc-500 hover:text-black p-1"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-3 mb-2">Core Tools</div>
//           <nav className="space-y-1.5">
//             {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                        ? 'bg-zinc-200 text-black border border-zinc-300 shadow-sm'
//                       : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
//                   }`}
//                 >
//                   <FileText className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-500'}`} /> {name}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-3 mt-6 mb-2">Library & Workspace</div>
//           <nav className="space-y-1.5">
//             {['Personal Bookshelf', 'Mock Tests'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-zinc-200 text-black border border-zinc-300 shadow-sm'
//                       : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
//                   }`}
//                 >
//                   <HelpCircle className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-500'}`} /> {name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Upgrade / Account Box */}
//         <div className="pt-4 border-t border-zinc-200 space-y-2">
         
            

//           <button
//             onClick={() => { setIsSettingsOpen(true); setIsMobileSidebarOpen(false); }}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-zinc-200 border border-zinc-300 text-zinc-700 flex items-center justify-center font-bold text-xs shadow-sm">
//               <Settings className="w-3.5 h-3.5" />
//             </div>
//             <span>Settings & Profile</span>
//           </button>
          
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
//               <LogOut className="w-3.5 h-3.5" />
//             </div>
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Workspace Area */}
//       <main className="flex-1 flex flex-col justify-between bg-transparent relative z-10 overflow-hidden w-full">
//         {/* Header */}
//         <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
//           <div className="flex items-center gap-3 min-w-0">
//             <button
//               onClick={() => setIsMobileSidebarOpen(true)}
//               className="md:hidden p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 shrink-0"
//               title="Open Menu"
//             >
//               <Menu className="w-4 h-4" />
//             </button>
//             <span className="px-3.5 py-1.5 rounded-full border border-zinc-200 bg-zinc-100 text-[11px] font-semibold uppercase tracking-wider text-zinc-700 truncate">
//               Session: <span className="text-emerald-600 font-bold">{activeTab}</span>
//             </span>
//             {activeBookshelfId && activeTab === 'Ask Anything' && (
//               <span className="hidden lg:inline-block text-[11px] font-semibold text-zinc-900 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full truncate max-w-[220px]">
//                 Shelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
//               </span>
//             )}
//           </div>
//           {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
//             <button 
//               onClick={handleResetSession} 
//               className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 transition-all shrink-0 ml-2 shadow-sm"
//             >
//               <RefreshCcw className="w-3.5 h-3.5 text-emerald-600" />
//               <span>Reset Chat</span>
//             </button>
//           )}
//         </header>

//         {/* Tab Content Routing */}
//         {activeTab === 'Personal Bookshelf' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!viewingBookshelf ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-zinc-900">My Personal Bookshelf</h2>
//                     <p className="text-xs text-zinc-500 mt-1">Manage saved study modules and topic notes.</p>
//                   </div>
//                   {bookshelves.length > 0 && (
//                     <button
//                       onClick={handleClearAllBookshelves}
//                       className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
//                     </button>
//                   )}
//                 </div>

//                 {bookshelves.length === 0 ? (
//                   <div className="p-16 border border-zinc-200 bg-zinc-50 backdrop-blur-xl rounded-3xl text-center space-y-4 shadow-xl">
//                     <BookOpen className="w-12 h-12 mx-auto text-zinc-400 animate-pulse" />
//                     <h3 className="text-lg font-bold text-zinc-800">No bookshelves created yet.</h3>
//                     <p className="text-xs text-zinc-500 max-w-sm mx-auto">
//                       Go to <span className="text-emerald-600 font-semibold">Ask Anything</span>, generate study notes, and click <span className="text-zinc-900 font-semibold">"Save to Bookshelf"</span> to build your custom library.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {bookshelves.map((shelf) => (
//                       <div
//                         key={shelf.id}
//                         onClick={() => setViewingBookshelf(shelf)}
//                         className="p-6 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded-2xl flex flex-col justify-between h-48 transition-all shadow-md cursor-pointer group"
//                       >
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-zinc-900 capitalize pr-6 flex items-center gap-2">
//                               <BookOpen className="w-4 h-4 text-emerald-600" /> {shelf.title}
//                             </h3>
//                             <button
//                               onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
//                               className="text-zinc-400 hover:text-red-600 p-1"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-500 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
//                         </div>
//                         <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
//                           <span className={`text-[11px] font-semibold ${activeBookshelfId === shelf.id ? 'text-emerald-600' : 'text-zinc-500'}`}>
//                             {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
//                           </span>
//                           <span className="px-3.5 py-1.5 bg-black text-white hover:bg-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors">
//                             Open Shelf <ArrowRight className="w-3.5 h-3.5" />
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
//                   <div>
//                     <button onClick={() => setViewingBookshelf(null)} className="text-xs text-zinc-500 hover:text-black hover:underline mb-1">← Back to All Bookshelves</button>
//                     <h2 className="text-lg font-extrabold text-zinc-900 capitalize flex items-center gap-2">
//                       <BookOpen className="w-5 h-5 text-emerald-600" /> {viewingBookshelf.title}
//                     </h2>
//                     <p className="text-xs text-zinc-500 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setActiveBookshelfId(viewingBookshelf.id);
//                       localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
//                       alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
//                     }}
//                     className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeBookshelfId === viewingBookshelf.id ? 'bg-black text-white font-extrabold shadow-md' : 'bg-zinc-100 text-zinc-900 border border-zinc-300 hover:bg-zinc-200'}`}
//                   >
//                     {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   {viewingBookshelf.items.map((item, idx) => (
//                     <div key={idx} className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 shadow-md">
//                       <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
//                         <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600">Topic: {item.title || viewingBookshelf.title}</h4>
//                         <span className="text-[10px] text-zinc-500">{item.date}</span>
//                       </div>
//                       <div className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800">
//                         {item.text}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : activeTab === 'Mock Tests' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!activeTest ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-zinc-900">Saved Mock Tests</h2>
//                     <p className="text-xs text-zinc-500 mt-1">Generated tests are stored here for practice.</p>
//                   </div>
//                   {savedTests.length > 0 && (
//                     <button
//                       onClick={handleClearAllTests}
//                       className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
//                     </button>
//                   )}
//                 </div>

//                 {savedTests.length === 0 ? (
//                   <div className="p-16 border border-zinc-200 bg-zinc-50 backdrop-blur-xl rounded-3xl text-center space-y-3 shadow-xl">
//                     <HelpCircle className="w-12 h-12 text-zinc-400 mx-auto animate-pulse" />
//                     <h3 className="text-lg font-bold text-zinc-800">No mock tests available yet.</h3>
//                     <p className="text-xs text-zinc-500 max-w-sm mx-auto">
//                       Type <span className="text-emerald-600 font-semibold">"generate quiz"</span> in <span className="text-zinc-900 font-semibold">Ask Anything</span> to create mock tests.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {savedTests.map((test) => (
//                       <div key={test.id} className="p-6 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded-2xl flex flex-col justify-between h-44 transition-all shadow-md group">
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-zinc-900 capitalize pr-6 truncate">{test.title}</h3>
//                             <button
//                               onClick={(e) => handleDeleteTest(e, test.id)}
//                               className="text-zinc-400 hover:text-red-600 p-1 shrink-0"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-500 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
//                         </div>
//                         <button
//                           onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
//                           className="self-end px-4 py-2 bg-black text-white hover:bg-zinc-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
//                         >
//                           Open Test <ArrowRight className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTest && !testResult ? (
//               <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
//                 <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
//                   <div className="min-w-0 pr-2">
//                     <h2 className="text-base font-extrabold text-zinc-900 capitalize truncate">{activeTest.title}</h2>
//                     <p className="text-xs text-zinc-500 mt-0.5">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
//                   </div>
//                   <button onClick={handleExitTest} className="text-xs text-zinc-600 hover:text-black underline shrink-0">Exit to Library</button>
//                 </div>

//                 <div className="space-y-4">
//                   <p className="text-sm font-semibold text-zinc-900 leading-relaxed">{activeTest.questions[currentQuestionIndex].question}</p>
//                   <div className="space-y-2.5">
//                     {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
//                         className={`w-full text-left px-4.5 py-3 rounded-xl text-xs transition-all border ${
//                           selectedAnswers[currentQuestionIndex] === oIdx
//                             ? 'bg-zinc-200 text-black font-bold border-zinc-400 shadow-sm'
//                             : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-100'
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
//                   <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 text-xs font-semibold disabled:opacity-40">Previous</button>
//                   {currentQuestionIndex < activeTest.questions.length - 1 ? (
//                     <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold shadow-sm">Next Question</button>
//                   ) : (
//                     <button onClick={handleSubmitTest} className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md">Submit Test</button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-zinc-50 border border-zinc-200 rounded-3xl shadow-xl overflow-hidden space-y-6">
//                 <div className="p-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
//                       <CheckCircle2 className="w-5 h-5" />
//                     </div>
//                     <h2 className="text-base font-extrabold text-zinc-900 capitalize truncate">{activeTest.title} - Test Results</h2>
//                   </div>
//                   <span className={`text-xs font-bold ${testResult.statusColor} bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full`}>
//                     {testResult.comparisonMessage}
//                   </span>
//                 </div>

//                 <div className="px-6 pb-8">
//                   <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
//                     <table className="w-full text-left text-sm">
//                       <thead className="bg-zinc-100 text-xs uppercase font-mono text-zinc-600">
//                         <tr>
//                           <th className="px-5 py-3.5 border-b border-zinc-200">Evaluation Metric</th>
//                           <th className="px-5 py-3.5 border-b border-zinc-200">Details</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-zinc-200 text-zinc-800 text-xs">
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-zinc-900">Total Score</td>
//                           <td className="px-5 py-4">{testResult.score} / {testResult.total}</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-zinc-900">Percentage Obtained</td>
//                           <td className="px-5 py-4 font-mono font-extrabold text-zinc-900 text-sm">{testResult.percentage}%</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-zinc-900 align-top">Weak Topics</td>
//                           <td className="px-5 py-4">
//                             {testResult.weakTopics.length > 0 ? (
//                               <ul className="list-disc list-inside text-zinc-600 space-y-1">
//                                 {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
//                               </ul>
//                             ) : (
//                               <span className="text-emerald-600 font-semibold">Brilliant! All answers were correct.</span>
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//                     <button onClick={handleExitTest} className="text-xs text-zinc-600 hover:text-black underline self-start sm:self-auto">
//                       ← Back to Saved Mock Tests
//                     </button>
//                     <button onClick={handleRetakeTest} className="px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
//                       <RefreshCcw className="w-4 h-4 text-emerald-600" /> Retake Test
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <>
//             {/* Chat & Prompt Main View */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {currentToolState.messages.length === 0 ? (
//                 /* Glowing Central Hero Welcome */
//                 <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 py-12">
                  
//                   {/* Glowing Logo Badge (Aesthetic Green) */}
//                   <div className="relative group">
//                     <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 to-green-400 blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse" />
//                     <div className="relative w-20 h-20 rounded-3xl bg-white border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-xl">
//                       <Sparkles className="w-10 h-10 text-emerald-600" />
//                     </div>
//                   </div>

//                   {/* Welcome Titles */}
//                   <div className="space-y-2">
//                     <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Welcome to Echo AI</p>
//                     <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
//                       How Can I Assist You?
//                     </h2>
//                   </div>

//                   {/* Suggestion Cards Grid */}
//                   {activeTab === 'Ask Anything' && (
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-4">
//                       {[
//                         { title: "Expand Rough Notes", desc: "Upload handwritten lecture notes", icon: ImagePlus, prompt: "Expand my lecture notes with detailed explanations" },
//                         { title: "Generate Mock Test", desc: "50 MCQs exam quiz generator", icon: HelpCircle, prompt: "Generate a mock test on Computer Networks" },
//                         { title: "Analyze Reference PDF", desc: "Extract key terms & formulas", icon: FileUp, prompt: "Summarize main concepts from reference materials" },
//                       ].map((card, i) => (
//                         <button
//                           key={i}
//                           onClick={() => handleSendQuery(null, card.prompt)}
//                           className="p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-left transition-all group shadow-sm flex flex-col justify-between h-32"
//                         >
//                           <card.icon className="w-5 h-5 text-zinc-500 group-hover:text-black transition-colors" />
//                           <div>
//                             <p className="text-xs font-bold text-zinc-800 group-hover:text-black">{card.title}</p>
//                             <p className="text-[10px] text-zinc-500 mt-0.5">{card.desc}</p>
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 currentToolState.messages.map((msg) => (
//                   msg.sender === 'user' ? (
//                     <div key={msg.id} className="flex justify-end w-full">
//                       <div className="max-w-[90%] sm:max-w-[80%] bg-zinc-100 text-zinc-900 border border-zinc-200 px-5 py-3.5 rounded-2xl rounded-br-none text-sm flex items-start gap-3 shadow-sm">
//                         <span className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</span>
//                         <div className="p-1 rounded-full bg-black text-white shrink-0 mt-0.5"><User className="w-3.5 h-3.5" /></div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div key={msg.id} className="space-y-2">
//                       <div className="flex justify-start">
//                         <button
//                           onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
//                           className="px-3.5 py-1.5 bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
//                         >
//                           <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600" /> Save to Bookshelf
//                         </button>
//                       </div>
//                       <StructuredResponseRenderer message={msg} />
//                     </div>
//                   )
//                 ))
//               )}
//               {loading && (
//                 <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200 w-fit text-xs text-zinc-800 animate-pulse flex items-center gap-2 shadow-md">
//                   <Sparkles className="w-4 h-4 animate-spin text-emerald-600" /> Echo AI is processing your request...
//                 </div>
//               )}
//               <div ref={chatEndRef} />
//             </div>

//             {/* Bottom Floating Glass Input Capsule */}
//             <div className="p-4 sm:p-6 bg-transparent">
//               <div className="max-w-4xl mx-auto space-y-3">

//                 {activeTab === 'Note Expander' && (
//                   <div
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-zinc-50 ${
//                       isDraggingOver
//                         ? 'border-emerald-500 bg-emerald-50/50'
//                         : 'border-zinc-300 hover:border-zinc-400'
//                     }`}
//                   >
//                     {noteExpanderImages.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         {noteExpanderImages.map((img) => (
//                           <div key={img.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-300 group shadow-sm">
//                             <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(img.id)}
//                               className="absolute top-1 right-1 bg-zinc-900/80 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => noteImageInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black transition-all border border-zinc-200 bg-white shadow-sm"
//                     >
//                       <ImagePlus className="w-4 h-4 text-emerald-600" />
//                       <span className="truncate">{noteExpanderImages.length > 0 ? 'Add More Photos' : 'Upload Photos of Notes'}</span>
//                     </button>
//                     <input
//                       ref={noteImageInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {activeTab === 'PDF Uploader' && (
//                   <div
//                     onDragOver={handlePdfDragOver}
//                     onDragLeave={handlePdfDragLeave}
//                     onDrop={handlePdfDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-zinc-50 ${
//                       isPdfDraggingOver
//                         ? 'border-emerald-500 bg-emerald-50/50'
//                         : 'border-zinc-300 hover:border-zinc-400'
//                     }`}
//                   >
//                     {selectedPdf ? (
//                       <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-zinc-200 bg-white mb-3 shadow-sm">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
//                             <FileText className="w-5 h-5" />
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-xs font-bold truncate text-zinc-900">{selectedPdf.name}</p>
//                             <p className="text-[10px] text-zinc-500">{formatFileSize(selectedPdf.size)}</p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removePdf}
//                           className="text-zinc-400 hover:text-red-600 p-1.5"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => pdfInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black transition-all border border-zinc-200 bg-white shadow-sm"
//                     >
//                       <FileUp className="w-4 h-4 text-emerald-600" />
//                       <span className="truncate">{selectedPdf ? 'Replace PDF' : 'Upload Reference PDF'}</span>
//                     </button>
//                     <input
//                       ref={pdfInputRef}
//                       type="file"
//                       accept="application/pdf,.pdf"
//                       onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {/* Floating Capsule Input Bar */}
//                 <form onSubmit={handleSendQuery} className="relative group">
//                   <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-md opacity-0 group-focus-within:opacity-50 transition-opacity pointer-events-none" />
                  
//                   <div className="relative flex items-center bg-zinc-50 border border-zinc-300 focus-within:border-emerald-600 rounded-2xl px-4 py-2 shadow-lg transition-all">
//                     <Sparkles className="w-4 h-4 text-emerald-600 mr-3 shrink-0" />
//                     <input
//                       type="text"
//                       value={currentToolState.input}
//                       onChange={handleInputChange}
//                       placeholder="Ask AI anything or write your request..."
//                       className="w-full bg-transparent py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
//                     />
                    
//                     <button
//                       type="submit"
//                       disabled={
//                         loading ||
//                         (!currentToolState.input.trim() &&
//                           !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
//                           !(activeTab === 'PDF Uploader' && selectedPdf))
//                       }
//                       className="ml-2 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-md disabled:opacity-40 shrink-0"
//                     >
//                       <Send className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* Save Modal */}
//       {showSaveModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white border border-zinc-200 text-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
//             <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
//               <h3 className="text-sm font-extrabold flex items-center gap-2 text-zinc-900">
//                 <BookmarkPlus className="w-4 h-4 text-emerald-600" /> Create New Bookshelf
//               </h3>
//               <button onClick={() => setShowSaveModal(false)} className="text-zinc-500 hover:text-black"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <p className="text-zinc-600">Name your new bookshelf to save this study material:</p>
//               <input
//                 type="text"
//                 value={newBookshelfName}
//                 onChange={(e) => setNewBookshelfName(e.target.value)}
//                 placeholder="e.g. Physics Notes, Web Dev..."
//                 className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-zinc-50 text-zinc-900 outline-none focus:border-emerald-600 font-medium"
//               />
//             </div>

//             <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-200">
//               <button onClick={() => setShowSaveModal(false)} className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold">Cancel</button>
//               <button onClick={handleCreateNewBookshelfAndSave} className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold shadow-sm">Create & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <SettingsModal
//         isOpen={isSettingsOpen}
//         onClose={() => setIsSettingsOpen(false)}
//       />
//     </div>
//   );
// }



//9th edit

// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   Lightbulb, Send, Settings, FileText, HelpCircle, User, X, 
//   CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, 
//   BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp, Menu, 
//   Sparkles, Bot, Zap, Flame, Compass, Paperclip, Mic 
// } from 'lucide-react';
// import { secureFetch } from '@/utils/apiHelper';
// import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
// import SettingsModal from '@/components/SettingsModal';

// export default function DashboardPage() {
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   const [activeTab, setActiveTab] = useState('Ask Anything');
//   const [showSettings, setShowSettings] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
//   const [toolStates, setToolStates] = useState({
//     'Ask Anything': { messages: [], input: '' },
//     'Note Expander': { messages: [], input: '' },
//     'PDF Uploader': { messages: [], input: '' },
//   });
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // --- USER PROFILE & THEME STATES ---
//   const [userName, setUserName] = useState('MIR SHAHARYAR');
//   const [tempName, setTempName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [themeMode, setThemeMode] = useState('dark');

//   // --- PERSONAL BOOKSHELF STATES ---
//   const [bookshelves, setBookshelves] = useState([]);
//   const [activeBookshelfId, setActiveBookshelfId] = useState(null);
//   const [viewingBookshelf, setViewingBookshelf] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [pendingItemToSave, setPendingItemToSave] = useState(null);
//   const [newBookshelfName, setNewBookshelfName] = useState('');

//   // --- MOCK TEST STATES ---
//   const [savedTests, setSavedTests] = useState([]);
//   const [testHistories, setTestHistories] = useState({});
//   const [activeTest, setActiveTest] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [testResult, setTestResult] = useState(null);

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD STATES ---
//   const [noteExpanderImages, setNoteExpanderImages] = useState([]);
//   const [isDraggingOver, setIsDraggingOver] = useState(false);
//   const noteImageInputRef = useRef(null);

//   // --- PDF UPLOADER: SINGLE PDF UPLOAD STATES ---
//   const [selectedPdf, setSelectedPdf] = useState(null);
//   const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
//   const pdfInputRef = useRef(null);

//   // --- AUTH GUARD ---
//   useEffect(() => {
//     setMounted(true);
//     const token = localStorage.getItem('token');
//     if (!token) {
//       router.replace('/login');
//     }
//   }, [router]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedTests = localStorage.getItem('buitems_mock_tests');
//       const storedHistories = localStorage.getItem('buitems_test_histories');
//       const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
//       const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
//       const storedName = localStorage.getItem('buitems_user_name');
//       const storedTheme = localStorage.getItem('buitems_theme_mode');

//       if (storedTests) setSavedTests(JSON.parse(storedTests));
//       if (storedHistories) setTestHistories(JSON.parse(storedHistories));
//       if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
//       if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
//       if (storedName) {
//         setUserName(storedName);
//         setTempName(storedName);
//       }
//       if (storedTheme) setThemeMode(storedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [toolStates, activeTab, loading]);

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], input: val }
//     }));
//   };

//   const handleSaveName = () => {
//     if (!tempName.trim()) return;
//     setUserName(tempName.trim());
//     localStorage.setItem('buitems_user_name', tempName.trim());
//     setIsEditingName(false);
//   };

//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       localStorage.clear();
//       document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
//       router.replace('/login');
//       router.refresh();
//     }
//   };

//   const handleTriggerSave = (msgText, queryText) => {
//     if (!activeBookshelfId) {
//       setPendingItemToSave({ text: msgText, title: queryText });
//       setNewBookshelfName(queryText || 'My Study Notes');
//       setShowSaveModal(true);
//     } else {
//       saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
//     }
//   };

//   const handleCreateNewBookshelfAndSave = () => {
//     if (!newBookshelfName.trim()) return;
//     const shelfId = Date.now().toString();
//     const newShelf = {
//       id: shelfId,
//       title: newBookshelfName.trim(),
//       date: new Date().toLocaleDateString(),
//       items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
//     };

//     const updatedShelves = [newShelf, ...bookshelves];
//     setBookshelves(updatedShelves);
//     setActiveBookshelfId(shelfId);

//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     localStorage.setItem('buitems_active_bookshelf_id', shelfId);

//     setShowSaveModal(false);
//     setPendingItemToSave(null);
//     setNewBookshelfName('');
//     alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
//   };

//   const saveItemToBookshelf = (shelfId, item) => {
//     const updatedShelves = bookshelves.map(shelf => {
//       if (shelf.id === shelfId) {
//         return { ...shelf, items: [item, ...shelf.items] };
//       }
//       return shelf;
//     });
//     setBookshelves(updatedShelves);
//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     alert("Successfully saved to your active bookshelf!");
//   };

//   const handleDeleteBookshelf = (e, shelfId) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this bookshelf?")) {
//       const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
//       setBookshelves(updatedShelves);
//       localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//       if (activeBookshelfId === shelfId) {
//         setActiveBookshelfId(null);
//         localStorage.removeItem('buitems_active_bookshelf_id');
//       }
//       if (viewingBookshelf && viewingBookshelf.id === shelfId) {
//         setViewingBookshelf(null);
//       }
//     }
//   };

//   const handleClearAllBookshelves = () => {
//     if (window.confirm("Are you sure you want to delete all bookshelves?")) {
//       setBookshelves([]);
//       setActiveBookshelfId(null);
//       setViewingBookshelf(null);
//       localStorage.removeItem('buitems_personal_bookshelves');
//       localStorage.removeItem('buitems_active_bookshelf_id');
//     }
//   };

//   const handleDeleteTest = (e, testId) => {
//     e.stopPropagation();
//     const updatedTests = savedTests.filter(t => t.id !== testId);
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     if (activeTest && activeTest.id === testId) setActiveTest(null);
//   };

//   const handleClearAllTests = () => {
//     if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
//       setSavedTests([]);
//       localStorage.removeItem('buitems_mock_tests');
//       setActiveTest(null);
//     }
//   };

//   const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
//     const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

//     try {
//       if (typeof rawText === 'string') {
//         let cleaned = rawText.trim();
//         const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (match) cleaned = match[1].trim();

//         const firstBracket = cleaned.indexOf('[');
//         const lastBracket = cleaned.lastIndexOf(']');
//         if (firstBracket !== -1 && lastBracket !== -1) {
//           cleaned = cleaned.substring(firstBracket, lastBracket + 1);
//         }

//         const parsed = JSON.parse(cleaned);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const validQuestions = parsed.map(q => ({
//             question: q.question || "Sample Question?",
//             options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
//             correct: typeof q.correct === 'number' ? q.correct : 0,
//             topic: q.topic || topicName
//           }));

//           const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
//           const updatedTests = [newTest, ...savedTests];
//           setSavedTests(updatedTests);
//           localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//           setActiveTest(newTest);
//           setActiveTab('Mock Tests');
//           return;
//         }
//       }
//     } catch (err) {
//       console.warn("JSON parse error caught safely, switching to fallback test:", err);
//     }

//     const fallbackQuestions = [];
//     for (let i = 1; i <= 50; i++) {
//       fallbackQuestions.push({
//         question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
//         options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
//         correct: 0,
//         topic: topicName
//       });
//     }

//     const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
//     const updatedTests = [fallbackTest, ...savedTests];
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     setActiveTest(fallbackTest);
//     setActiveTab('Mock Tests');
//   };

//   const handleImageUpload = (fileList) => {
//     const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
//     if (files.length === 0) return;

//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//           name: file.name,
//           base64: e.target.result,
//         };
//         setNoteExpanderImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (id) => {
//     setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingOver(false);
//     if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
//   };

//   const formatFileSize = (bytes) => {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   const handlePdfUpload = (fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
//     if (!isPdf) {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setSelectedPdf({
//         name: file.name,
//         size: file.size,
//         base64: e.target.result,
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePdf = () => setSelectedPdf(null);

//   const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
//   const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
//   const handlePdfDrop = (e) => {
//     e.preventDefault();
//     setIsPdfDraggingOver(false);
//     if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
//   };

//   const handleSendQuery = async (e, customPrompt = null) => {
//     if (e) e.preventDefault();
//     const queryText = (customPrompt || currentToolState.input).trim();
//     const isNoteExpander = activeTab === 'Note Expander';
//     const isPdfUploader = activeTab === 'PDF Uploader';
//     const hasImages = isNoteExpander && noteExpanderImages.length > 0;
//     const hasPdf = isPdfUploader && !!selectedPdf;

//     if ((!queryText && !hasImages && !hasPdf) || loading) return;

//     const userMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       text: queryText || (hasImages
//         ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
//         : hasPdf
//           ? `📄 Uploaded ${selectedPdf.name}`
//           : '')
//     };
    
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
//     }));
//     setLoading(true);

//     try {
//       let finalQuery = queryText;
//       const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

//       const lowerQuery = queryText.toLowerCase();
//       const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
//       const previousMessages = toolStates[activeTab]?.messages || [];
      
//       if (hasPronoun && previousMessages.length > 0) {
//         const lastMsg = previousMessages[previousMessages.length - 1];
//         const contextTopic = lastMsg.queryContext || lastMsg.text || '';
//         if (contextTopic) {
//           finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
//         }
//       }

//       if (isMockReq && activeTab === 'Ask Anything') {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
//       }

//       if (isNoteExpander) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: Expand and correct the rough notes provided.]`;
//       }

//       if (isPdfUploader) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: Analyze the PDF and provide structured study summaries.]`;
//       }

//       let endpoint = 'http://localhost:5000/api/ai/ask-anything';
//       if (activeTab === 'Note Expander') endpoint = 'http://localhost:5000/api/ai/expand-notes';
//       else if (activeTab === 'PDF Uploader') endpoint = 'http://localhost:5000/api/ai/pdf-analysis';

//       const payload = { prompt: finalQuery, tool: activeTab };
//       if (hasImages) payload.images = noteExpanderImages.map(img => img.base64);
//       if (hasPdf) {
//         payload.pdf = selectedPdf.base64;
//         payload.pdfName = selectedPdf.name;
//       }

//       const response = await secureFetch(endpoint, {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       if (!response) {
//         setLoading(false);
//         return;
//       }

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || 'Failed to process AI generation request.');

//       const rawContent = data.result || data.text || data.content || JSON.stringify(data);

//       if (isMockReq) {
//         extractAndSavedMockTestSafe(rawContent, queryText);
//         setLoading(false);
//         return;
//       }

//       const aiResponse = { 
//         id: (Date.now() + 1).toString(), 
//         sender: 'ai', 
//         result: rawContent, 
//         text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
//         queryContext: queryText 
//       };

//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
//       }));

//       if (hasImages) setNoteExpanderImages([]);
//       if (hasPdf) setSelectedPdf(null);

//     } catch (err) {
//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { 
//           ...prev[activeTab], 
//           messages: [...prev[activeTab].messages, { id: Date.now().toString(), sender: 'ai', text: `Error: ${err.message}` }] 
//         }
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOptionSelect = (qIdx, optIdx) => {
//     setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
//   };

//   const handleSubmitTest = () => {
//     let score = 0;
//     let weakTopicsMap = [];

//     activeTest.questions.forEach((q, idx) => {
//       if (selectedAnswers[idx] === q.correct) score += 1;
//       else weakTopicsMap.push(q.topic || activeTest.title);
//     });

//     const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
//     const weakTopics = [...new Set(weakTopicsMap)];
//     const previousHistory = testHistories[activeTest.id];
//     let comparisonMessage = "First Attempt Completed!";
//     let statusColor = "text-zinc-400";

//     if (previousHistory) {
//       if (percentage > previousHistory.lastPercentage) {
//         comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-emerald-400";
//       } else if (percentage < previousHistory.lastPercentage) {
//         comparisonMessage = `Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-red-500";
//       } else {
//         comparisonMessage = `Consistent performance at ${percentage}%.`;
//         statusColor = "text-zinc-400";
//       }
//     }

//     const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
//     setTestResult(resultObj);
//     const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
//     setTestHistories(updatedHistory);
//     localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
//   };

//   const handleRetakeTest = () => {
//     const shuffledQuestions = activeTest.questions.map(q => {
//       const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
//       optionsWithIndex.sort(() => Math.random() - 0.5);
//       return {
//         ...q,
//         options: optionsWithIndex.map(o => o.text),
//         correct: optionsWithIndex.findIndex(o => o.isCorrect)
//       };
//     });
//     setActiveTest({ ...activeTest, questions: shuffledQuestions });
//     setSelectedAnswers({});
//     setTestResult(null);
//     setCurrentQuestionIndex(0);
//   };

//   const handleExitTest = () => {
//     setActiveTest(null);
//     setTestResult(null);
//     setSelectedAnswers({});
//     setCurrentQuestionIndex(0);
//   };

//   const handleResetSession = () => {
//     setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
//     setActiveBookshelfId(null);
//     localStorage.removeItem('buitems_active_bookshelf_id');
//     setNoteExpanderImages([]);
//     setSelectedPdf(null);
//   };

//   const currentToolState = toolStates[activeTab] || { messages: [], input: '' };
//   const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

//   if (!mounted) return null;

//   return (
//     <div className="flex h-[100dvh] bg-black text-white font-sans overflow-hidden relative selection:bg-emerald-500 selection:text-white">
      
//       {/* Dynamic Ambient Light Beams - Updated to subtle neutral/green */}
//       <div className="absolute top-0 right-0 w-[650px] h-[500px] bg-gradient-to-br from-zinc-900/40 via-emerald-900/10 to-black blur-[140px] rounded-full pointer-events-none z-0" />
//       <div className="absolute top-1/3 left-10 w-[400px] h-[350px] bg-gradient-to-tr from-zinc-900/30 to-black blur-[130px] rounded-full pointer-events-none z-0" />

//       {isMobileSidebarOpen && (
//         <div 
//           onClick={() => setIsMobileSidebarOpen(false)}
//           className="fixed inset-0 bg-black/90 z-20 md:hidden backdrop-blur-md transition-opacity"
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`fixed md:relative inset-y-0 left-0 z-30 w-72 border-r border-zinc-800 bg-black/80 backdrop-blur-2xl flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
//         <div>
//           <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-zinc-800">
//             <div className="flex items-center gap-3">
//               {/* Aesthetic Green AI Logo */}
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white">
//                 <Sparkles className="w-5 h-5 animate-pulse text-white" />
//               </div>
//               <div>
//                 <h1 className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">Echo AI Study</h1>
//                 <p className="text-[10px] text-zinc-400 font-semibold tracking-widest uppercase truncate max-w-[120px]">{userName}</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setIsMobileSidebarOpen(false)}
//               className="md:hidden text-zinc-400 hover:text-white p-1"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-3 mb-2">Core Tools</div>
//           <nav className="space-y-1.5">
//             {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-zinc-900 text-white border border-zinc-700 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
//                       : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
//                   }`}
//                 >
//                   <FileText className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} /> {name}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-3 mt-6 mb-2">Library & Workspace</div>
//           <nav className="space-y-1.5">
//             {['Personal Bookshelf', 'Mock Tests'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-zinc-900 text-white border border-zinc-700 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
//                       : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
//                   }`}
//                 >
//                   <HelpCircle className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} /> {name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Upgrade / Account Box */}
//         <div className="pt-4 border-t border-zinc-800 space-y-2">
//           <div className="p-3.5 rounded-2xl bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 shadow-lg mb-2">
//             <div className="flex items-center gap-2 text-xs font-bold text-white">
//               <Flame className="w-4 h-4 text-emerald-400 animate-pulse" /> Upgrade to Pro
//             </div>
//             <p className="text-[10px] text-zinc-400 mt-1">Get unlimited AI responses & advanced mock test generation.</p>
//           </div>

//           <button
//             onClick={() => { setIsSettingsOpen(true); setIsMobileSidebarOpen(false); }}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-xs shadow">
//               <Settings className="w-3.5 h-3.5" />
//             </div>
//             <span>Settings & Profile</span>
//           </button>
          
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
//               <LogOut className="w-3.5 h-3.5" />
//             </div>
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Workspace Area */}
//       <main className="flex-1 flex flex-col justify-between bg-transparent relative z-10 overflow-hidden w-full">
//         {/* Header */}
//         <header className="h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
//           <div className="flex items-center gap-3 min-w-0">
//             <button
//               onClick={() => setIsMobileSidebarOpen(true)}
//               className="md:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 shrink-0"
//               title="Open Menu"
//             >
//               <Menu className="w-4 h-4" />
//             </button>
//             <span className="px-3.5 py-1.5 rounded-full border border-zinc-700 bg-zinc-900 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 truncate">
//               Session: <span className="text-emerald-400">{activeTab}</span>
//             </span>
//             {activeBookshelfId && activeTab === 'Ask Anything' && (
//               <span className="hidden lg:inline-block text-[11px] font-semibold text-white bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full truncate max-w-[220px]">
//                 Shelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
//               </span>
//             )}
//           </div>
//           {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
//             <button 
//               onClick={handleResetSession} 
//               className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-all shrink-0 ml-2"
//             >
//               <RefreshCcw className="w-3.5 h-3.5 text-white" />
//               <span>Reset Chat</span>
//             </button>
//           )}
//         </header>

//         {/* Tab Content Routing */}
//         {activeTab === 'Personal Bookshelf' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!viewingBookshelf ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-white">My Personal Bookshelf</h2>
//                     <p className="text-xs text-zinc-400 mt-1">Manage saved study modules and topic notes.</p>
//                   </div>
//                   {bookshelves.length > 0 && (
//                     <button
//                       onClick={handleClearAllBookshelves}
//                       className="px-3.5 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
//                     </button>
//                   )}
//                 </div>

//                 {bookshelves.length === 0 ? (
//                   <div className="p-16 border border-zinc-800 bg-zinc-950 backdrop-blur-xl rounded-3xl text-center space-y-4 shadow-2xl">
//                     <BookOpen className="w-12 h-12 mx-auto text-zinc-400 animate-pulse" />
//                     <h3 className="text-lg font-bold text-zinc-200">No bookshelves created yet.</h3>
//                     <p className="text-xs text-zinc-400 max-w-sm mx-auto">
//                       Go to <span className="text-emerald-400 font-semibold">Ask Anything</span>, generate study notes, and click <span className="text-white font-semibold">"Save to Bookshelf"</span> to build your custom library.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {bookshelves.map((shelf) => (
//                       <div
//                         key={shelf.id}
//                         onClick={() => setViewingBookshelf(shelf)}
//                         className="p-6 bg-zinc-950 border border-zinc-800 hover:border-white rounded-2xl flex flex-col justify-between h-48 transition-all shadow-xl cursor-pointer group"
//                       >
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-white capitalize pr-6 flex items-center gap-2">
//                               <BookOpen className="w-4 h-4 text-emerald-400" /> {shelf.title}
//                             </h3>
//                             <button
//                               onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
//                               className="text-zinc-500 hover:text-red-400 p-1"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-500 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
//                         </div>
//                         <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
//                           <span className={`text-[11px] font-semibold ${activeBookshelfId === shelf.id ? 'text-emerald-400' : 'text-zinc-500'}`}>
//                             {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
//                           </span>
//                           <span className="px-3.5 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors">
//                             Open Shelf <ArrowRight className="w-3.5 h-3.5" />
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
//                   <div>
//                     <button onClick={() => setViewingBookshelf(null)} className="text-xs text-zinc-400 hover:text-white hover:underline mb-1">← Back to All Bookshelves</button>
//                     <h2 className="text-lg font-extrabold text-white capitalize flex items-center gap-2">
//                       <BookOpen className="w-5 h-5 text-emerald-400" /> {viewingBookshelf.title}
//                     </h2>
//                     <p className="text-xs text-zinc-400 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setActiveBookshelfId(viewingBookshelf.id);
//                       localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
//                       alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
//                     }}
//                     className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeBookshelfId === viewingBookshelf.id ? 'bg-white text-black font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-zinc-900 text-white border border-zinc-700 hover:bg-zinc-800'}`}
//                   >
//                     {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   {viewingBookshelf.items.map((item, idx) => (
//                     <div key={idx} className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 shadow-xl">
//                       <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
//                         <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Topic: {item.title || viewingBookshelf.title}</h4>
//                         <span className="text-[10px] text-zinc-500">{item.date}</span>
//                       </div>
//                       <div className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-200">
//                         {item.text}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : activeTab === 'Mock Tests' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!activeTest ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-white">Saved Mock Tests</h2>
//                     <p className="text-xs text-zinc-400 mt-1">Generated tests are stored here for practice.</p>
//                   </div>
//                   {savedTests.length > 0 && (
//                     <button
//                       onClick={handleClearAllTests}
//                       className="px-3.5 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
//                     </button>
//                   )}
//                 </div>

//                 {savedTests.length === 0 ? (
//                   <div className="p-16 border border-zinc-800 bg-zinc-950 backdrop-blur-xl rounded-3xl text-center space-y-3 shadow-2xl">
//                     <HelpCircle className="w-12 h-12 text-zinc-400 mx-auto animate-pulse" />
//                     <h3 className="text-lg font-bold text-zinc-200">No mock tests available yet.</h3>
//                     <p className="text-xs text-zinc-400 max-w-sm mx-auto">
//                       Type <span className="text-emerald-400 font-semibold">"generate quiz"</span> in <span className="text-white font-semibold">Ask Anything</span> to create mock tests.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {savedTests.map((test) => (
//                       <div key={test.id} className="p-6 bg-zinc-950 border border-zinc-800 hover:border-white rounded-2xl flex flex-col justify-between h-44 transition-all shadow-xl group">
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-white capitalize pr-6 truncate">{test.title}</h3>
//                             <button
//                               onClick={(e) => handleDeleteTest(e, test.id)}
//                               className="text-zinc-500 hover:text-red-400 p-1 shrink-0"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-500 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
//                         </div>
//                         <button
//                           onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
//                           className="self-end px-4 py-2 bg-white text-black hover:bg-zinc-200 hover:scale-105 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
//                         >
//                           Open Test <ArrowRight className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTest && !testResult ? (
//               <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl">
//                 <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
//                   <div className="min-w-0 pr-2">
//                     <h2 className="text-base font-extrabold text-white capitalize truncate">{activeTest.title}</h2>
//                     <p className="text-xs text-zinc-400 mt-0.5">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
//                   </div>
//                   <button onClick={handleExitTest} className="text-xs text-zinc-300 hover:text-white underline shrink-0">Exit to Library</button>
//                 </div>

//                 <div className="space-y-4">
//                   <p className="text-sm font-semibold text-zinc-100 leading-relaxed">{activeTest.questions[currentQuestionIndex].question}</p>
//                   <div className="space-y-2.5">
//                     {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
//                         className={`w-full text-left px-4.5 py-3 rounded-xl text-xs transition-all border ${
//                           selectedAnswers[currentQuestionIndex] === oIdx
//                             ? 'bg-zinc-800 text-white font-bold border-zinc-500 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
//                             : 'bg-black/50 text-zinc-300 border-zinc-800 hover:bg-zinc-900'
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
//                   <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold disabled:opacity-40">Previous</button>
//                   {currentQuestionIndex < activeTest.questions.length - 1 ? (
//                     <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="px-5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]">Next Question</button>
//                   ) : (
//                     <button onClick={handleSubmitTest} className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]">Submit Test</button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden space-y-6 backdrop-blur-2xl">
//                 <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
//                       <CheckCircle2 className="w-5 h-5" />
//                     </div>
//                     <h2 className="text-base font-extrabold text-white capitalize truncate">{activeTest.title} - Test Results</h2>
//                   </div>
//                   <span className={`text-xs font-bold ${testResult.statusColor} bg-black border border-zinc-800 px-4 py-2 rounded-full`}>
//                     {testResult.comparisonMessage}
//                   </span>
//                 </div>

//                 <div className="px-6 pb-8">
//                   <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black/50">
//                     <table className="w-full text-left text-sm">
//                       <thead className="bg-zinc-900/60 text-xs uppercase font-mono text-zinc-400">
//                         <tr>
//                           <th className="px-5 py-3.5 border-b border-zinc-800">Evaluation Metric</th>
//                           <th className="px-5 py-3.5 border-b border-zinc-800">Details</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-zinc-800 text-zinc-300 text-xs">
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white">Total Score</td>
//                           <td className="px-5 py-4">{testResult.score} / {testResult.total}</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white">Percentage Obtained</td>
//                           <td className="px-5 py-4 font-mono font-extrabold text-white text-sm">{testResult.percentage}%</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white align-top">Weak Topics</td>
//                           <td className="px-5 py-4">
//                             {testResult.weakTopics.length > 0 ? (
//                               <ul className="list-disc list-inside text-zinc-400 space-y-1">
//                                 {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
//                               </ul>
//                             ) : (
//                               <span className="text-emerald-400 font-semibold">Brilliant! All answers were correct.</span>
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//                     <button onClick={handleExitTest} className="text-xs text-zinc-400 hover:text-white underline self-start sm:self-auto">
//                       ← Back to Saved Mock Tests
//                     </button>
//                     <button onClick={handleRetakeTest} className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold flex items-center justify-center gap-2">
//                       <RefreshCcw className="w-4 h-4 text-emerald-400" /> Retake Test
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <>
//             {/* Chat & Prompt Main View */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {currentToolState.messages.length === 0 ? (
//                 /* Glowing Central Hero Welcome */
//                 <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 py-12">
                  
//                   {/* Glowing Logo Badge (Aesthetic Green) */}
//                   <div className="relative group">
//                     <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-600 to-green-500 blur-xl opacity-40 group-hover:opacity-70 transition-opacity animate-pulse" />
//                     <div className="relative w-20 h-20 rounded-3xl bg-black border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-2xl">
//                       <Sparkles className="w-10 h-10 text-emerald-400" />
//                     </div>
//                   </div>

//                   {/* Welcome Titles */}
//                   <div className="space-y-2">
//                     <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Welcome to Echo AI</p>
//                     <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
//                       How Can I Assist You?
//                     </h2>
//                   </div>

//                   {/* Suggestion Cards Grid */}
//                   {activeTab === 'Ask Anything' && (
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-4">
//                       {[
//                         { title: "Expand Rough Notes", desc: "Upload handwritten lecture notes", icon: ImagePlus, prompt: "Expand my lecture notes with detailed explanations" },
//                         { title: "Generate Mock Test", desc: "50 MCQs exam quiz generator", icon: HelpCircle, prompt: "Generate a mock test on Computer Networks" },
//                         { title: "Analyze Reference PDF", desc: "Extract key terms & formulas", icon: FileUp, prompt: "Summarize main concepts from reference materials" },
//                       ].map((card, i) => (
//                         <button
//                           key={i}
//                           onClick={() => handleSendQuery(null, card.prompt)}
//                           className="p-4 rounded-2xl bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-left transition-all group shadow-lg flex flex-col justify-between h-32"
//                         >
//                           <card.icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
//                           <div>
//                             <p className="text-xs font-bold text-zinc-300 group-hover:text-white">{card.title}</p>
//                             <p className="text-[10px] text-zinc-500 mt-0.5">{card.desc}</p>
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 currentToolState.messages.map((msg) => (
//                   msg.sender === 'user' ? (
//                     <div key={msg.id} className="flex justify-end w-full">
//                       <div className="max-w-[90%] sm:max-w-[80%] bg-zinc-800 text-white border border-zinc-700 px-5 py-3.5 rounded-2xl rounded-br-none text-sm flex items-start gap-3 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
//                         <span className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</span>
//                         <div className="p-1 rounded-full bg-zinc-950 text-white shrink-0 mt-0.5"><User className="w-3.5 h-3.5" /></div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div key={msg.id} className="space-y-2">
//                       <div className="flex justify-start">
//                         <button
//                           onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
//                           className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
//                         >
//                           <BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" /> Save to Bookshelf
//                         </button>
//                       </div>
//                       <StructuredResponseRenderer message={msg} />
//                     </div>
//                   )
//                 ))
//               )}
//               {loading && (
//                 <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 w-fit text-xs text-white animate-pulse flex items-center gap-2 shadow-xl">
//                   <Sparkles className="w-4 h-4 animate-spin text-emerald-400" /> Echo AI is processing your request...
//                 </div>
//               )}
//               <div ref={chatEndRef} />
//             </div>

//             {/* Bottom Floating Glass Input Capsule */}
//             <div className="p-4 sm:p-6 bg-transparent">
//               <div className="max-w-4xl mx-auto space-y-3">

//                 {activeTab === 'Note Expander' && (
//                   <div
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-zinc-950/60 ${
//                       isDraggingOver
//                         ? 'border-emerald-500 bg-emerald-500/10'
//                         : 'border-zinc-800 hover:border-zinc-600'
//                     }`}
//                   >
//                     {noteExpanderImages.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         {noteExpanderImages.map((img) => (
//                           <div key={img.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-700 group shadow">
//                             <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(img.id)}
//                               className="absolute top-1 right-1 bg-black/80 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => noteImageInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all border border-zinc-800 bg-zinc-900/40"
//                     >
//                       <ImagePlus className="w-4 h-4 text-emerald-400" />
//                       <span className="truncate">{noteExpanderImages.length > 0 ? 'Add More Photos' : 'Upload Photos of Notes'}</span>
//                     </button>
//                     <input
//                       ref={noteImageInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {activeTab === 'PDF Uploader' && (
//                   <div
//                     onDragOver={handlePdfDragOver}
//                     onDragLeave={handlePdfDragLeave}
//                     onDrop={handlePdfDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-zinc-950/60 ${
//                       isPdfDraggingOver
//                         ? 'border-emerald-500 bg-emerald-500/10'
//                         : 'border-zinc-800 hover:border-zinc-600'
//                     }`}
//                   >
//                     {selectedPdf ? (
//                       <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 mb-3 shadow">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
//                             <FileText className="w-5 h-5" />
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-xs font-bold truncate text-white">{selectedPdf.name}</p>
//                             <p className="text-[10px] text-zinc-500">{formatFileSize(selectedPdf.size)}</p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removePdf}
//                           className="text-zinc-400 hover:text-red-400 p-1.5"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => pdfInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all border border-zinc-800 bg-zinc-900/40"
//                     >
//                       <FileUp className="w-4 h-4 text-emerald-400" />
//                       <span className="truncate">{selectedPdf ? 'Replace PDF' : 'Upload Reference PDF'}</span>
//                     </button>
//                     <input
//                       ref={pdfInputRef}
//                       type="file"
//                       accept="application/pdf,.pdf"
//                       onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {/* Floating Capsule Input Bar */}
//                 <form onSubmit={handleSendQuery} className="relative group">
//                   <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600/30 to-green-500/30 blur-md opacity-0 group-focus-within:opacity-40 transition-opacity pointer-events-none" />
                  
//                   <div className="relative flex items-center bg-zinc-950 border border-zinc-800 focus-within:border-emerald-500/60 rounded-2xl px-4 py-2 backdrop-blur-xl shadow-2xl transition-all">
//                     <Sparkles className="w-4 h-4 text-emerald-400 mr-3 shrink-0" />
//                     <input
//                       type="text"
//                       value={currentToolState.input}
//                       onChange={handleInputChange}
//                       placeholder={
//                         activeTab === 'Note Expander'
//                           ? 'Ask AI anything or write your request...'
//                           : activeTab === 'PDF Uploader'
//                             ? 'Ask AI anything or write your request...'
//                             : 'Ask AI anything or write your request...'
//                       }
//                       className="w-full bg-transparent py-3 text-sm text-white placeholder-zinc-500 focus:outline-none"
//                     />
                    
//                     <button
//                       type="submit"
//                       disabled={
//                         loading ||
//                         (!currentToolState.input.trim() &&
//                           !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
//                           !(activeTab === 'PDF Uploader' && selectedPdf))
//                       }
//                       className="ml-2 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-40 shrink-0"
//                     >
//                       <Send className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* Save Modal */}
//       {showSaveModal && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
//           <div className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
//             <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
//               <h3 className="text-sm font-extrabold flex items-center gap-2 text-white">
//                 <BookmarkPlus className="w-4 h-4 text-emerald-400" /> Create New Bookshelf
//               </h3>
//               <button onClick={() => setShowSaveModal(false)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <p className="text-zinc-400">Name your new bookshelf to save this study material:</p>
//               <input
//                 type="text"
//                 value={newBookshelfName}
//                 onChange={(e) => setNewBookshelfName(e.target.value)}
//                 placeholder="e.g. Physics Notes, Web Dev..."
//                 className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-black text-white outline-none focus:border-emerald-500 font-medium"
//               />
//             </div>

//             <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-800">
//               <button onClick={() => setShowSaveModal(false)} className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold">Cancel</button>
//               <button onClick={handleCreateNewBookshelfAndSave} className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]">Create & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <SettingsModal
//         isOpen={isSettingsOpen}
//         onClose={() => setIsSettingsOpen(false)}
//       />
//     </div>
//   );
// }




//8th edit

// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   Lightbulb, Send, Settings, FileText, HelpCircle, User, X, 
//   CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, 
//   BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp, Menu, 
//   Sparkles, Bot, Zap, Flame, Compass, Paperclip, Mic 
// } from 'lucide-react';
// import { secureFetch } from '@/utils/apiHelper';
// import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
// import SettingsModal from '@/components/SettingsModal';

// export default function DashboardPage() {
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   const [activeTab, setActiveTab] = useState('Ask Anything');
//   const [showSettings, setShowSettings] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
//   const [toolStates, setToolStates] = useState({
//     'Ask Anything': { messages: [], input: '' },
//     'Note Expander': { messages: [], input: '' },
//     'PDF Uploader': { messages: [], input: '' },
//   });
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // --- USER PROFILE & THEME STATES ---
//   const [userName, setUserName] = useState('MIR SHAHARYAR');
//   const [tempName, setTempName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [themeMode, setThemeMode] = useState('dark');

//   // --- PERSONAL BOOKSHELF STATES ---
//   const [bookshelves, setBookshelves] = useState([]);
//   const [activeBookshelfId, setActiveBookshelfId] = useState(null);
//   const [viewingBookshelf, setViewingBookshelf] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [pendingItemToSave, setPendingItemToSave] = useState(null);
//   const [newBookshelfName, setNewBookshelfName] = useState('');

//   // --- MOCK TEST STATES ---
//   const [savedTests, setSavedTests] = useState([]);
//   const [testHistories, setTestHistories] = useState({});
//   const [activeTest, setActiveTest] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [testResult, setTestResult] = useState(null);

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD STATES ---
//   const [noteExpanderImages, setNoteExpanderImages] = useState([]);
//   const [isDraggingOver, setIsDraggingOver] = useState(false);
//   const noteImageInputRef = useRef(null);

//   // --- PDF UPLOADER: SINGLE PDF UPLOAD STATES ---
//   const [selectedPdf, setSelectedPdf] = useState(null);
//   const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
//   const pdfInputRef = useRef(null);

//   // --- AUTH GUARD ---
//   useEffect(() => {
//     setMounted(true);
//     const token = localStorage.getItem('token');
//     if (!token) {
//       router.replace('/login');
//     }
//   }, [router]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedTests = localStorage.getItem('buitems_mock_tests');
//       const storedHistories = localStorage.getItem('buitems_test_histories');
//       const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
//       const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
//       const storedName = localStorage.getItem('buitems_user_name');
//       const storedTheme = localStorage.getItem('buitems_theme_mode');

//       if (storedTests) setSavedTests(JSON.parse(storedTests));
//       if (storedHistories) setTestHistories(JSON.parse(storedHistories));
//       if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
//       if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
//       if (storedName) {
//         setUserName(storedName);
//         setTempName(storedName);
//       }
//       if (storedTheme) setThemeMode(storedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [toolStates, activeTab, loading]);

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], input: val }
//     }));
//   };

//   const handleSaveName = () => {
//     if (!tempName.trim()) return;
//     setUserName(tempName.trim());
//     localStorage.setItem('buitems_user_name', tempName.trim());
//     setIsEditingName(false);
//   };

//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       localStorage.clear();
//       document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
//       router.replace('/login');
//       router.refresh();
//     }
//   };

//   const handleTriggerSave = (msgText, queryText) => {
//     if (!activeBookshelfId) {
//       setPendingItemToSave({ text: msgText, title: queryText });
//       setNewBookshelfName(queryText || 'My Study Notes');
//       setShowSaveModal(true);
//     } else {
//       saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
//     }
//   };

//   const handleCreateNewBookshelfAndSave = () => {
//     if (!newBookshelfName.trim()) return;
//     const shelfId = Date.now().toString();
//     const newShelf = {
//       id: shelfId,
//       title: newBookshelfName.trim(),
//       date: new Date().toLocaleDateString(),
//       items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
//     };

//     const updatedShelves = [newShelf, ...bookshelves];
//     setBookshelves(updatedShelves);
//     setActiveBookshelfId(shelfId);

//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     localStorage.setItem('buitems_active_bookshelf_id', shelfId);

//     setShowSaveModal(false);
//     setPendingItemToSave(null);
//     setNewBookshelfName('');
//     alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
//   };

//   const saveItemToBookshelf = (shelfId, item) => {
//     const updatedShelves = bookshelves.map(shelf => {
//       if (shelf.id === shelfId) {
//         return { ...shelf, items: [item, ...shelf.items] };
//       }
//       return shelf;
//     });
//     setBookshelves(updatedShelves);
//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     alert("Successfully saved to your active bookshelf!");
//   };

//   const handleDeleteBookshelf = (e, shelfId) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this bookshelf?")) {
//       const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
//       setBookshelves(updatedShelves);
//       localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//       if (activeBookshelfId === shelfId) {
//         setActiveBookshelfId(null);
//         localStorage.removeItem('buitems_active_bookshelf_id');
//       }
//       if (viewingBookshelf && viewingBookshelf.id === shelfId) {
//         setViewingBookshelf(null);
//       }
//     }
//   };

//   const handleClearAllBookshelves = () => {
//     if (window.confirm("Are you sure you want to delete all bookshelves?")) {
//       setBookshelves([]);
//       setActiveBookshelfId(null);
//       setViewingBookshelf(null);
//       localStorage.removeItem('buitems_personal_bookshelves');
//       localStorage.removeItem('buitems_active_bookshelf_id');
//     }
//   };

//   const handleDeleteTest = (e, testId) => {
//     e.stopPropagation();
//     const updatedTests = savedTests.filter(t => t.id !== testId);
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     if (activeTest && activeTest.id === testId) setActiveTest(null);
//   };

//   const handleClearAllTests = () => {
//     if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
//       setSavedTests([]);
//       localStorage.removeItem('buitems_mock_tests');
//       setActiveTest(null);
//     }
//   };

//   const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
//     const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

//     try {
//       if (typeof rawText === 'string') {
//         let cleaned = rawText.trim();
//         const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (match) cleaned = match[1].trim();

//         const firstBracket = cleaned.indexOf('[');
//         const lastBracket = cleaned.lastIndexOf(']');
//         if (firstBracket !== -1 && lastBracket !== -1) {
//           cleaned = cleaned.substring(firstBracket, lastBracket + 1);
//         }

//         const parsed = JSON.parse(cleaned);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const validQuestions = parsed.map(q => ({
//             question: q.question || "Sample Question?",
//             options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
//             correct: typeof q.correct === 'number' ? q.correct : 0,
//             topic: q.topic || topicName
//           }));

//           const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
//           const updatedTests = [newTest, ...savedTests];
//           setSavedTests(updatedTests);
//           localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//           setActiveTest(newTest);
//           setActiveTab('Mock Tests');
//           return;
//         }
//       }
//     } catch (err) {
//       console.warn("JSON parse error caught safely, switching to fallback test:", err);
//     }

//     const fallbackQuestions = [];
//     for (let i = 1; i <= 50; i++) {
//       fallbackQuestions.push({
//         question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
//         options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
//         correct: 0,
//         topic: topicName
//       });
//     }

//     const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
//     const updatedTests = [fallbackTest, ...savedTests];
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     setActiveTest(fallbackTest);
//     setActiveTab('Mock Tests');
//   };

//   const handleImageUpload = (fileList) => {
//     const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
//     if (files.length === 0) return;

//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//           name: file.name,
//           base64: e.target.result,
//         };
//         setNoteExpanderImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (id) => {
//     setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingOver(false);
//     if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
//   };

//   const formatFileSize = (bytes) => {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   const handlePdfUpload = (fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
//     if (!isPdf) {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setSelectedPdf({
//         name: file.name,
//         size: file.size,
//         base64: e.target.result,
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePdf = () => setSelectedPdf(null);

//   const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
//   const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
//   const handlePdfDrop = (e) => {
//     e.preventDefault();
//     setIsPdfDraggingOver(false);
//     if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
//   };

//   const handleSendQuery = async (e, customPrompt = null) => {
//     if (e) e.preventDefault();
//     const queryText = (customPrompt || currentToolState.input).trim();
//     const isNoteExpander = activeTab === 'Note Expander';
//     const isPdfUploader = activeTab === 'PDF Uploader';
//     const hasImages = isNoteExpander && noteExpanderImages.length > 0;
//     const hasPdf = isPdfUploader && !!selectedPdf;

//     if ((!queryText && !hasImages && !hasPdf) || loading) return;

//     const userMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       text: queryText || (hasImages
//         ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
//         : hasPdf
//           ? `📄 Uploaded ${selectedPdf.name}`
//           : '')
//     };
    
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
//     }));
//     setLoading(true);

//     try {
//       let finalQuery = queryText;
//       const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

//       const lowerQuery = queryText.toLowerCase();
//       const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
//       const previousMessages = toolStates[activeTab]?.messages || [];
      
//       if (hasPronoun && previousMessages.length > 0) {
//         const lastMsg = previousMessages[previousMessages.length - 1];
//         const contextTopic = lastMsg.queryContext || lastMsg.text || '';
//         if (contextTopic) {
//           finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
//         }
//       }

//       if (isMockReq && activeTab === 'Ask Anything') {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
//       }

//       if (isNoteExpander) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: Expand and correct the rough notes provided.]`;
//       }

//       if (isPdfUploader) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: Analyze the PDF and provide structured study summaries.]`;
//       }

//       let endpoint = 'http://localhost:5000/api/ai/ask-anything';
//       if (activeTab === 'Note Expander') endpoint = 'http://localhost:5000/api/ai/expand-notes';
//       else if (activeTab === 'PDF Uploader') endpoint = 'http://localhost:5000/api/ai/pdf-analysis';

//       const payload = { prompt: finalQuery, tool: activeTab };
//       if (hasImages) payload.images = noteExpanderImages.map(img => img.base64);
//       if (hasPdf) {
//         payload.pdf = selectedPdf.base64;
//         payload.pdfName = selectedPdf.name;
//       }

//       const response = await secureFetch(endpoint, {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       if (!response) {
//         setLoading(false);
//         return;
//       }

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || 'Failed to process AI generation request.');

//       const rawContent = data.result || data.text || data.content || JSON.stringify(data);

//       if (isMockReq) {
//         extractAndSavedMockTestSafe(rawContent, queryText);
//         setLoading(false);
//         return;
//       }

//       const aiResponse = { 
//         id: (Date.now() + 1).toString(), 
//         sender: 'ai', 
//         result: rawContent, 
//         text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
//         queryContext: queryText 
//       };

//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
//       }));

//       if (hasImages) setNoteExpanderImages([]);
//       if (hasPdf) setSelectedPdf(null);

//     } catch (err) {
//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { 
//           ...prev[activeTab], 
//           messages: [...prev[activeTab].messages, { id: Date.now().toString(), sender: 'ai', text: `Error: ${err.message}` }] 
//         }
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOptionSelect = (qIdx, optIdx) => {
//     setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
//   };

//   const handleSubmitTest = () => {
//     let score = 0;
//     let weakTopicsMap = [];

//     activeTest.questions.forEach((q, idx) => {
//       if (selectedAnswers[idx] === q.correct) score += 1;
//       else weakTopicsMap.push(q.topic || activeTest.title);
//     });

//     const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
//     const weakTopics = [...new Set(weakTopicsMap)];
//     const previousHistory = testHistories[activeTest.id];
//     let comparisonMessage = "First Attempt Completed!";
//     let statusColor = "text-purple-400";

//     if (previousHistory) {
//       if (percentage > previousHistory.lastPercentage) {
//         comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-orange-400";
//       } else if (percentage < previousHistory.lastPercentage) {
//         comparisonMessage = `Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-pink-500";
//       } else {
//         comparisonMessage = `Consistent performance at ${percentage}%.`;
//         statusColor = "text-purple-400";
//       }
//     }

//     const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
//     setTestResult(resultObj);
//     const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
//     setTestHistories(updatedHistory);
//     localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
//   };

//   const handleRetakeTest = () => {
//     const shuffledQuestions = activeTest.questions.map(q => {
//       const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
//       optionsWithIndex.sort(() => Math.random() - 0.5);
//       return {
//         ...q,
//         options: optionsWithIndex.map(o => o.text),
//         correct: optionsWithIndex.findIndex(o => o.isCorrect)
//       };
//     });
//     setActiveTest({ ...activeTest, questions: shuffledQuestions });
//     setSelectedAnswers({});
//     setTestResult(null);
//     setCurrentQuestionIndex(0);
//   };

//   const handleExitTest = () => {
//     setActiveTest(null);
//     setTestResult(null);
//     setSelectedAnswers({});
//     setCurrentQuestionIndex(0);
//   };

//   const handleResetSession = () => {
//     setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
//     setActiveBookshelfId(null);
//     localStorage.removeItem('buitems_active_bookshelf_id');
//     setNoteExpanderImages([]);
//     setSelectedPdf(null);
//   };

//   const currentToolState = toolStates[activeTab] || { messages: [], input: '' };
//   const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

//   if (!mounted) return null;

//   return (
//     <div className="flex h-[100dvh] bg-[#0c0a12] text-purple-50 font-sans overflow-hidden relative selection:bg-orange-500 selection:text-white">
      
//       {/* Dynamic Purple & Orange Ambient Light Beams */}
//       <div className="absolute top-0 right-0 w-[650px] h-[500px] bg-gradient-to-br from-purple-700/30 via-pink-600/15 to-orange-500/20 blur-[140px] rounded-full pointer-events-none z-0" />
//       <div className="absolute top-1/3 left-10 w-[400px] h-[350px] bg-gradient-to-tr from-purple-900/20 to-orange-600/10 blur-[130px] rounded-full pointer-events-none z-0" />

//       {isMobileSidebarOpen && (
//         <div 
//           onClick={() => setIsMobileSidebarOpen(false)}
//           className="fixed inset-0 bg-black/80 z-20 md:hidden backdrop-blur-md transition-opacity"
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`fixed md:relative inset-y-0 left-0 z-30 w-72 border-r border-purple-900/30 bg-[#120f1d]/80 backdrop-blur-2xl flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
//         <div>
//           <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-purple-900/30">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white">
//                 <Sparkles className="w-5 h-5 animate-pulse text-orange-200" />
//               </div>
//               <div>
//                 <h1 className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-purple-200 via-pink-200 to-orange-300 bg-clip-text text-transparent">Echo AI Study</h1>
//                 <p className="text-[10px] text-orange-400 font-semibold tracking-widest uppercase truncate max-w-[120px]">{userName}</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setIsMobileSidebarOpen(false)}
//               className="md:hidden text-purple-400 hover:text-white p-1"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400/60 px-3 mb-2">Core Tools</div>
//           <nav className="space-y-1.5">
//             {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-gradient-to-r from-purple-900/40 to-orange-950/40 text-orange-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
//                       : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-900/20'
//                   }`}
//                 >
//                   <FileText className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-purple-400'}`} /> {name}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400/60 px-3 mt-6 mb-2">Library & Workspace</div>
//           <nav className="space-y-1.5">
//             {['Personal Bookshelf', 'Mock Tests'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-gradient-to-r from-purple-900/40 to-orange-950/40 text-orange-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
//                       : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-900/20'
//                   }`}
//                 >
//                   <HelpCircle className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-purple-400'}`} /> {name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Upgrade / Account Box */}
//         <div className="pt-4 border-t border-purple-900/30 space-y-2">
//           <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-purple-900/30 to-orange-950/40 border border-purple-500/30 shadow-lg mb-2">
//             <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
//               <Flame className="w-4 h-4 text-orange-400 animate-pulse" /> Upgrade to Pro
//             </div>
//             <p className="text-[10px] text-purple-300/70 mt-1">Get unlimited AI responses & advanced mock test generation.</p>
//           </div>

//           <button
//             onClick={() => { setIsSettingsOpen(true); setIsMobileSidebarOpen(false); }}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-purple-300 hover:text-white hover:bg-purple-900/30 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-400/30 text-purple-300 flex items-center justify-center font-bold text-xs shadow">
//               <Settings className="w-3.5 h-3.5" />
//             </div>
//             <span>Settings & Profile</span>
//           </button>
          
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
//               <LogOut className="w-3.5 h-3.5" />
//             </div>
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Workspace Area */}
//       <main className="flex-1 flex flex-col justify-between bg-transparent relative z-10 overflow-hidden w-full">
//         {/* Header */}
//         <header className="h-16 border-b border-purple-900/30 bg-[#120f1d]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
//           <div className="flex items-center gap-3 min-w-0">
//             <button
//               onClick={() => setIsMobileSidebarOpen(true)}
//               className="md:hidden p-2 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-200 shrink-0"
//               title="Open Menu"
//             >
//               <Menu className="w-4 h-4" />
//             </button>
//             <span className="px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-[11px] font-semibold uppercase tracking-wider text-purple-300 truncate">
//               Session: <span className="text-orange-400">{activeTab}</span>
//             </span>
//             {activeBookshelfId && activeTab === 'Ask Anything' && (
//               <span className="hidden lg:inline-block text-[11px] font-semibold text-orange-300 bg-orange-950/40 border border-orange-500/30 px-3 py-1 rounded-full truncate max-w-[220px]">
//                 Shelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
//               </span>
//             )}
//           </div>
//           {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
//             <button 
//               onClick={handleResetSession} 
//               className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/60 text-xs font-semibold text-purple-200 transition-all shrink-0 ml-2"
//             >
//               <RefreshCcw className="w-3.5 h-3.5 text-orange-400" />
//               <span>Reset Chat</span>
//             </button>
//           )}
//         </header>

//         {/* Tab Content Routing */}
//         {activeTab === 'Personal Bookshelf' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!viewingBookshelf ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-white">My Personal Bookshelf</h2>
//                     <p className="text-xs text-purple-300/70 mt-1">Manage saved study modules and topic notes.</p>
//                   </div>
//                   {bookshelves.length > 0 && (
//                     <button
//                       onClick={handleClearAllBookshelves}
//                       className="px-3.5 py-2 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold rounded-xl hover:bg-pink-500/20 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
//                     </button>
//                   )}
//                 </div>

//                 {bookshelves.length === 0 ? (
//                   <div className="p-16 border border-purple-900/40 bg-[#120f1d]/40 backdrop-blur-xl rounded-3xl text-center space-y-4 shadow-2xl">
//                     <BookOpen className="w-12 h-12 mx-auto text-purple-400 animate-pulse" />
//                     <h3 className="text-lg font-bold text-purple-200">No bookshelves created yet.</h3>
//                     <p className="text-xs text-purple-300/70 max-w-sm mx-auto">
//                       Go to <span className="text-orange-400 font-semibold">Ask Anything</span>, generate study notes, and click <span className="text-purple-400 font-semibold">"Save to Bookshelf"</span> to build your custom library.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {bookshelves.map((shelf) => (
//                       <div
//                         key={shelf.id}
//                         onClick={() => setViewingBookshelf(shelf)}
//                         className="p-6 bg-[#120f1d]/80 border border-purple-900/50 hover:border-orange-500/50 rounded-2xl flex flex-col justify-between h-48 transition-all shadow-xl cursor-pointer group"
//                       >
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-white capitalize pr-6 flex items-center gap-2">
//                               <BookOpen className="w-4 h-4 text-purple-400" /> {shelf.title}
//                             </h3>
//                             <button
//                               onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
//                               className="text-purple-400/50 hover:text-pink-400 p-1"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-purple-300/60 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
//                         </div>
//                         <div className="flex items-center justify-between pt-4 border-t border-purple-900/30">
//                           <span className={`text-[11px] font-semibold ${activeBookshelfId === shelf.id ? 'text-orange-400' : 'text-purple-400/60'}`}>
//                             {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
//                           </span>
//                           <span className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-orange-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md">
//                             Open Shelf <ArrowRight className="w-3.5 h-3.5" />
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="p-6 bg-[#120f1d]/80 border border-purple-900/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
//                   <div>
//                     <button onClick={() => setViewingBookshelf(null)} className="text-xs text-orange-400 hover:underline mb-1">← Back to All Bookshelves</button>
//                     <h2 className="text-lg font-extrabold text-white capitalize flex items-center gap-2">
//                       <BookOpen className="w-5 h-5 text-purple-400" /> {viewingBookshelf.title}
//                     </h2>
//                     <p className="text-xs text-purple-300/60 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setActiveBookshelfId(viewingBookshelf.id);
//                       localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
//                       alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
//                     }}
//                     className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeBookshelfId === viewingBookshelf.id ? 'bg-orange-500 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-purple-950 text-purple-200 border border-purple-800 hover:bg-purple-900'}`}
//                   >
//                     {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   {viewingBookshelf.items.map((item, idx) => (
//                     <div key={idx} className="p-6 bg-[#120f1d]/80 border border-purple-900/40 rounded-2xl space-y-3 shadow-xl">
//                       <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
//                         <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">Topic: {item.title || viewingBookshelf.title}</h4>
//                         <span className="text-[10px] text-purple-300/60">{item.date}</span>
//                       </div>
//                       <div className="text-sm leading-relaxed whitespace-pre-wrap text-purple-100">
//                         {item.text}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : activeTab === 'Mock Tests' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!activeTest ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-white">Saved Mock Tests</h2>
//                     <p className="text-xs text-purple-300/70 mt-1">Generated tests are stored here for practice.</p>
//                   </div>
//                   {savedTests.length > 0 && (
//                     <button
//                       onClick={handleClearAllTests}
//                       className="px-3.5 py-2 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold rounded-xl hover:bg-pink-500/20 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
//                     </button>
//                   )}
//                 </div>

//                 {savedTests.length === 0 ? (
//                   <div className="p-16 border border-purple-900/40 bg-[#120f1d]/40 backdrop-blur-xl rounded-3xl text-center space-y-3 shadow-2xl">
//                     <HelpCircle className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
//                     <h3 className="text-lg font-bold text-purple-200">No mock tests available yet.</h3>
//                     <p className="text-xs text-purple-300/70 max-w-sm mx-auto">
//                       Type <span className="text-orange-400 font-semibold">"generate quiz"</span> in <span className="text-purple-300 font-semibold">Ask Anything</span> to create mock tests.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {savedTests.map((test) => (
//                       <div key={test.id} className="p-6 bg-[#120f1d]/80 border border-purple-900/50 hover:border-orange-500/50 rounded-2xl flex flex-col justify-between h-44 transition-all shadow-xl group">
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-white capitalize pr-6 truncate">{test.title}</h3>
//                             <button
//                               onClick={(e) => handleDeleteTest(e, test.id)}
//                               className="text-purple-400/50 hover:text-pink-400 p-1 shrink-0"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-purple-300/60 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
//                         </div>
//                         <button
//                           onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
//                           className="self-end px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:scale-105 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
//                         >
//                           Open Test <ArrowRight className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTest && !testResult ? (
//               <div className="bg-[#120f1d]/90 border border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl">
//                 <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
//                   <div className="min-w-0 pr-2">
//                     <h2 className="text-base font-extrabold text-white capitalize truncate">{activeTest.title}</h2>
//                     <p className="text-xs text-purple-300/60 mt-0.5">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
//                   </div>
//                   <button onClick={handleExitTest} className="text-xs text-purple-300 hover:text-white underline shrink-0">Exit to Library</button>
//                 </div>

//                 <div className="space-y-4">
//                   <p className="text-sm font-semibold text-purple-100 leading-relaxed">{activeTest.questions[currentQuestionIndex].question}</p>
//                   <div className="space-y-2.5">
//                     {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
//                         className={`w-full text-left px-4.5 py-3 rounded-xl text-xs transition-all border ${
//                           selectedAnswers[currentQuestionIndex] === oIdx
//                             ? 'bg-gradient-to-r from-purple-950/80 to-orange-950/80 text-orange-300 font-bold border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
//                             : 'bg-[#0c0a12]/70 text-purple-200 border-purple-900/40 hover:bg-purple-900/30'
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex justify-between items-center pt-4 border-t border-purple-900/30">
//                   <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-semibold disabled:opacity-40">Previous</button>
//                   {currentQuestionIndex < activeTest.questions.length - 1 ? (
//                     <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)]">Next Question</button>
//                   ) : (
//                     <button onClick={handleSubmitTest} className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)]">Submit Test</button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-[#120f1d]/90 border border-purple-900/50 rounded-3xl shadow-2xl overflow-hidden space-y-6 backdrop-blur-2xl">
//                 <div className="p-6 border-b border-purple-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
//                       <CheckCircle2 className="w-5 h-5" />
//                     </div>
//                     <h2 className="text-base font-extrabold text-white capitalize truncate">{activeTest.title} - Test Results</h2>
//                   </div>
//                   <span className={`text-xs font-bold ${testResult.statusColor} bg-[#0c0a12] border border-purple-900/50 px-4 py-2 rounded-full`}>
//                     {testResult.comparisonMessage}
//                   </span>
//                 </div>

//                 <div className="px-6 pb-8">
//                   <div className="overflow-x-auto rounded-2xl border border-purple-900/40 bg-[#0c0a12]/70">
//                     <table className="w-full text-left text-sm">
//                       <thead className="bg-purple-950/60 text-xs uppercase font-mono text-purple-300">
//                         <tr>
//                           <th className="px-5 py-3.5 border-b border-purple-900/30">Evaluation Metric</th>
//                           <th className="px-5 py-3.5 border-b border-purple-900/30">Details</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-purple-900/30 text-purple-200 text-xs">
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white">Total Score</td>
//                           <td className="px-5 py-4">{testResult.score} / {testResult.total}</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white">Percentage Obtained</td>
//                           <td className="px-5 py-4 font-mono font-extrabold text-orange-400 text-sm">{testResult.percentage}%</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white align-top">Weak Topics</td>
//                           <td className="px-5 py-4">
//                             {testResult.weakTopics.length > 0 ? (
//                               <ul className="list-disc list-inside text-pink-400 space-y-1">
//                                 {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
//                               </ul>
//                             ) : (
//                               <span className="text-orange-400 font-semibold">Brilliant! All answers were correct.</span>
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//                     <button onClick={handleExitTest} className="text-xs text-purple-300 hover:text-white underline self-start sm:self-auto">
//                       ← Back to Saved Mock Tests
//                     </button>
//                     <button onClick={handleRetakeTest} className="px-5 py-3 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2">
//                       <RefreshCcw className="w-4 h-4 text-orange-400" /> Retake Test
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <>
//             {/* Chat & Prompt Main View */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {currentToolState.messages.length === 0 ? (
//                 /* Glowing Central Hero Welcome */
//                 <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 py-12">
                  
//                   {/* Glowing Logo Badge */}
//                   <div className="relative group">
//                     <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600 to-orange-500 blur-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
//                     <div className="relative w-20 h-20 rounded-3xl bg-[#120f1d] border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-2xl">
//                       <Sparkles className="w-10 h-10 text-orange-400" />
//                     </div>
//                   </div>

//                   {/* Welcome Titles */}
//                   <div className="space-y-2">
//                     <p className="text-xs font-bold uppercase tracking-widest text-purple-400">Welcome to Echo AI</p>
//                     <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
//                       How Can I Assist You?
//                     </h2>
//                   </div>

//                   {/* Suggestion Cards Grid (Only visible in 'Ask Anything' tab) */}
//                   {activeTab === 'Ask Anything' && (
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-4">
//                       {[
//                         { title: "Expand Rough Notes", desc: "Upload handwritten lecture notes", icon: ImagePlus, prompt: "Expand my lecture notes with detailed explanations" },
//                         { title: "Generate Mock Test", desc: "50 MCQs exam quiz generator", icon: HelpCircle, prompt: "Generate a mock test on Computer Networks" },
//                         { title: "Analyze Reference PDF", desc: "Extract key terms & formulas", icon: FileUp, prompt: "Summarize main concepts from reference materials" },
//                       ].map((card, i) => (
//                         <button
//                           key={i}
//                           onClick={() => handleSendQuery(null, card.prompt)}
//                           className="p-4 rounded-2xl bg-[#120f1d]/60 hover:bg-gradient-to-b hover:from-purple-900/30 hover:to-orange-950/30 border border-purple-900/40 hover:border-purple-500/50 text-left transition-all group shadow-lg flex flex-col justify-between h-32"
//                         >
//                           <card.icon className="w-5 h-5 text-purple-400 group-hover:text-orange-400 transition-colors" />
//                           <div>
//                             <p className="text-xs font-bold text-purple-100 group-hover:text-white">{card.title}</p>
//                             <p className="text-[10px] text-purple-400/60 mt-0.5">{card.desc}</p>
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 currentToolState.messages.map((msg) => (
//                   msg.sender === 'user' ? (
//                     <div key={msg.id} className="flex justify-end w-full">
//                       <div className="max-w-[90%] sm:max-w-[80%] bg-gradient-to-r from-purple-700 via-pink-700 to-orange-600 text-white border border-purple-400/30 px-5 py-3.5 rounded-2xl rounded-br-none text-sm flex items-start gap-3 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
//                         <span className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</span>
//                         <div className="p-1 rounded-full bg-purple-900 text-white shrink-0 mt-0.5"><User className="w-3.5 h-3.5" /></div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div key={msg.id} className="space-y-2">
//                       <div className="flex justify-start">
//                         <button
//                           onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
//                           className="px-3.5 py-1.5 bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/40 text-orange-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
//                         >
//                           <BookmarkPlus className="w-3.5 h-3.5 text-orange-400" /> Save to Bookshelf
//                         </button>
//                       </div>
//                       <StructuredResponseRenderer message={msg} />
//                     </div>
//                   )
//                 ))
//               )}
//               {loading && (
//                 <div className="p-4 rounded-2xl bg-[#120f1d]/80 border border-purple-500/30 w-fit text-xs text-orange-400 animate-pulse flex items-center gap-2 shadow-xl">
//                   <Sparkles className="w-4 h-4 animate-spin text-purple-400" /> Echo AI is processing your request...
//                 </div>
//               )}
//               <div ref={chatEndRef} />
//             </div>

//             {/* Bottom Floating Glass Input Capsule */}
//             <div className="p-4 sm:p-6 bg-transparent">
//               <div className="max-w-4xl mx-auto space-y-3">

//                 {activeTab === 'Note Expander' && (
//                   <div
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-[#120f1d]/60 ${
//                       isDraggingOver
//                         ? 'border-orange-500 bg-orange-500/10'
//                         : 'border-purple-900/50 hover:border-purple-500/50'
//                     }`}
//                   >
//                     {noteExpanderImages.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         {noteExpanderImages.map((img) => (
//                           <div key={img.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-700 group shadow">
//                             <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(img.id)}
//                               className="absolute top-1 right-1 bg-black/80 hover:bg-pink-500 text-white rounded-full p-1 transition-colors"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => noteImageInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-purple-200 hover:text-white transition-all border border-purple-800 bg-purple-950/40"
//                     >
//                       <ImagePlus className="w-4 h-4 text-orange-400" />
//                       <span className="truncate">{noteExpanderImages.length > 0 ? 'Add More Photos' : 'Upload Photos of Notes'}</span>
//                     </button>
//                     <input
//                       ref={noteImageInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {activeTab === 'PDF Uploader' && (
//                   <div
//                     onDragOver={handlePdfDragOver}
//                     onDragLeave={handlePdfDragLeave}
//                     onDrop={handlePdfDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-[#120f1d]/60 ${
//                       isPdfDraggingOver
//                         ? 'border-orange-500 bg-orange-500/10'
//                         : 'border-purple-900/50 hover:border-purple-500/50'
//                     }`}
//                   >
//                     {selectedPdf ? (
//                       <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-purple-800 bg-purple-950/40 mb-3 shadow">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
//                             <FileText className="w-5 h-5" />
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-xs font-bold truncate text-purple-200">{selectedPdf.name}</p>
//                             <p className="text-[10px] text-purple-400/60">{formatFileSize(selectedPdf.size)}</p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removePdf}
//                           className="text-purple-400 hover:text-pink-400 p-1.5"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => pdfInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-purple-200 hover:text-white transition-all border border-purple-800 bg-purple-950/40"
//                     >
//                       <FileUp className="w-4 h-4 text-orange-400" />
//                       <span className="truncate">{selectedPdf ? 'Replace PDF' : 'Upload Reference PDF'}</span>
//                     </button>
//                     <input
//                       ref={pdfInputRef}
//                       type="file"
//                       accept="application/pdf,.pdf"
//                       onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {/* Floating Capsule Input Bar */}
//                 <form onSubmit={handleSendQuery} className="relative group">
//                   <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/30 to-orange-500/30 blur-md opacity-40 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  
//                   <div className="relative flex items-center bg-[#120f1d]/90 border border-purple-500/30 focus-within:border-orange-500/60 rounded-2xl px-4 py-2 backdrop-blur-xl shadow-2xl transition-all">
//                     <Sparkles className="w-4 h-4 text-purple-400 mr-3 shrink-0" />
//                     <input
//                       type="text"
//                       value={currentToolState.input}
//                       onChange={handleInputChange}
//                       placeholder={
//                         activeTab === 'Note Expander'
//                           ? 'Ask AI anything or write your request...'
//                           : activeTab === 'PDF Uploader'
//                             ? 'Ask AI anything or write your request...'
//                             : 'Ask AI anything or write your request...'
//                       }
//                       className="w-full bg-transparent py-3 text-sm text-purple-100 placeholder-purple-400/50 focus:outline-none"
//                     />
                    
//                     <button
//                       type="submit"
//                       disabled={
//                         loading ||
//                         (!currentToolState.input.trim() &&
//                           !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
//                           !(activeTab === 'PDF Uploader' && selectedPdf))
//                       }
//                       className="ml-2 w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] disabled:opacity-40 shrink-0"
//                     >
//                       <Send className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* Save Modal */}
//       {showSaveModal && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
//           <div className="bg-[#120f1d] border border-purple-500/40 text-purple-100 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
//             <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
//               <h3 className="text-sm font-extrabold flex items-center gap-2 text-white">
//                 <BookmarkPlus className="w-4 h-4 text-orange-400" /> Create New Bookshelf
//               </h3>
//               <button onClick={() => setShowSaveModal(false)} className="text-purple-400 hover:text-white"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <p className="text-purple-300/70">Name your new bookshelf to save this study material:</p>
//               <input
//                 type="text"
//                 value={newBookshelfName}
//                 onChange={(e) => setNewBookshelfName(e.target.value)}
//                 placeholder="e.g. Physics Notes, Web Dev..."
//                 className="w-full px-4 py-3 rounded-xl border border-purple-700/50 bg-[#0c0a12] text-white outline-none focus:border-orange-500 font-medium"
//               />
//             </div>

//             <div className="flex justify-end gap-2.5 pt-2 border-t border-purple-900/30">
//               <button onClick={() => setShowSaveModal(false)} className="px-4 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-semibold">Cancel</button>
//               <button onClick={handleCreateNewBookshelfAndSave} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]">Create & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <SettingsModal
//         isOpen={isSettingsOpen}
//         onClose={() => setIsSettingsOpen(false)}
//       />
//     </div>
//   );
// }



//7th edit

// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   Lightbulb, Send, Settings, FileText, HelpCircle, User, X, 
//   CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, 
//   BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp, Menu, 
//   Sparkles, Bot, Zap, Flame, Compass, Paperclip, Mic 
// } from 'lucide-react';
// import { secureFetch } from '@/utils/apiHelper';
// import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
// import SettingsModal from '@/components/SettingsModal';

// export default function DashboardPage() {
//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   const [activeTab, setActiveTab] = useState('Ask Anything');
//   const [showSettings, setShowSettings] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
//   const [toolStates, setToolStates] = useState({
//     'Ask Anything': { messages: [], input: '' },
//     'Note Expander': { messages: [], input: '' },
//     'PDF Uploader': { messages: [], input: '' },
//   });
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // --- USER PROFILE & THEME STATES ---
//   const [userName, setUserName] = useState('MIR SHAHARYAR');
//   const [tempName, setTempName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [themeMode, setThemeMode] = useState('dark');

//   // --- PERSONAL BOOKSHELF STATES ---
//   const [bookshelves, setBookshelves] = useState([]);
//   const [activeBookshelfId, setActiveBookshelfId] = useState(null);
//   const [viewingBookshelf, setViewingBookshelf] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [pendingItemToSave, setPendingItemToSave] = useState(null);
//   const [newBookshelfName, setNewBookshelfName] = useState('');

//   // --- MOCK TEST STATES ---
//   const [savedTests, setSavedTests] = useState([]);
//   const [testHistories, setTestHistories] = useState({});
//   const [activeTest, setActiveTest] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [testResult, setTestResult] = useState(null);

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD STATES ---
//   const [noteExpanderImages, setNoteExpanderImages] = useState([]);
//   const [isDraggingOver, setIsDraggingOver] = useState(false);
//   const noteImageInputRef = useRef(null);

//   // --- PDF UPLOADER: SINGLE PDF UPLOAD STATES ---
//   const [selectedPdf, setSelectedPdf] = useState(null);
//   const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
//   const pdfInputRef = useRef(null);

//   // --- AUTH GUARD ---
//   useEffect(() => {
//     setMounted(true);
//     const token = localStorage.getItem('token');
//     if (!token) {
//       router.replace('/login');
//     }
//   }, [router]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedTests = localStorage.getItem('buitems_mock_tests');
//       const storedHistories = localStorage.getItem('buitems_test_histories');
//       const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
//       const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
//       const storedName = localStorage.getItem('buitems_user_name');
//       const storedTheme = localStorage.getItem('buitems_theme_mode');

//       if (storedTests) setSavedTests(JSON.parse(storedTests));
//       if (storedHistories) setTestHistories(JSON.parse(storedHistories));
//       if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
//       if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
//       if (storedName) {
//         setUserName(storedName);
//         setTempName(storedName);
//       }
//       if (storedTheme) setThemeMode(storedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [toolStates, activeTab, loading]);

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], input: val }
//     }));
//   };

//   const handleSaveName = () => {
//     if (!tempName.trim()) return;
//     setUserName(tempName.trim());
//     localStorage.setItem('buitems_user_name', tempName.trim());
//     setIsEditingName(false);
//   };

//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       localStorage.clear();
//       document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
//       router.replace('/login');
//       router.refresh();
//     }
//   };

//   const handleTriggerSave = (msgText, queryText) => {
//     if (!activeBookshelfId) {
//       setPendingItemToSave({ text: msgText, title: queryText });
//       setNewBookshelfName(queryText || 'My Study Notes');
//       setShowSaveModal(true);
//     } else {
//       saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
//     }
//   };

//   const handleCreateNewBookshelfAndSave = () => {
//     if (!newBookshelfName.trim()) return;
//     const shelfId = Date.now().toString();
//     const newShelf = {
//       id: shelfId,
//       title: newBookshelfName.trim(),
//       date: new Date().toLocaleDateString(),
//       items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
//     };

//     const updatedShelves = [newShelf, ...bookshelves];
//     setBookshelves(updatedShelves);
//     setActiveBookshelfId(shelfId);

//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     localStorage.setItem('buitems_active_bookshelf_id', shelfId);

//     setShowSaveModal(false);
//     setPendingItemToSave(null);
//     setNewBookshelfName('');
//     alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
//   };

//   const saveItemToBookshelf = (shelfId, item) => {
//     const updatedShelves = bookshelves.map(shelf => {
//       if (shelf.id === shelfId) {
//         return { ...shelf, items: [item, ...shelf.items] };
//       }
//       return shelf;
//     });
//     setBookshelves(updatedShelves);
//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     alert("Successfully saved to your active bookshelf!");
//   };

//   const handleDeleteBookshelf = (e, shelfId) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this bookshelf?")) {
//       const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
//       setBookshelves(updatedShelves);
//       localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//       if (activeBookshelfId === shelfId) {
//         setActiveBookshelfId(null);
//         localStorage.removeItem('buitems_active_bookshelf_id');
//       }
//       if (viewingBookshelf && viewingBookshelf.id === shelfId) {
//         setViewingBookshelf(null);
//       }
//     }
//   };

//   const handleClearAllBookshelves = () => {
//     if (window.confirm("Are you sure you want to delete all bookshelves?")) {
//       setBookshelves([]);
//       setActiveBookshelfId(null);
//       setViewingBookshelf(null);
//       localStorage.removeItem('buitems_personal_bookshelves');
//       localStorage.removeItem('buitems_active_bookshelf_id');
//     }
//   };

//   const handleDeleteTest = (e, testId) => {
//     e.stopPropagation();
//     const updatedTests = savedTests.filter(t => t.id !== testId);
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     if (activeTest && activeTest.id === testId) setActiveTest(null);
//   };

//   const handleClearAllTests = () => {
//     if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
//       setSavedTests([]);
//       localStorage.removeItem('buitems_mock_tests');
//       setActiveTest(null);
//     }
//   };

//   const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
//     const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

//     try {
//       if (typeof rawText === 'string') {
//         let cleaned = rawText.trim();
//         const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (match) cleaned = match[1].trim();

//         const firstBracket = cleaned.indexOf('[');
//         const lastBracket = cleaned.lastIndexOf(']');
//         if (firstBracket !== -1 && lastBracket !== -1) {
//           cleaned = cleaned.substring(firstBracket, lastBracket + 1);
//         }

//         const parsed = JSON.parse(cleaned);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const validQuestions = parsed.map(q => ({
//             question: q.question || "Sample Question?",
//             options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
//             correct: typeof q.correct === 'number' ? q.correct : 0,
//             topic: q.topic || topicName
//           }));

//           const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
//           const updatedTests = [newTest, ...savedTests];
//           setSavedTests(updatedTests);
//           localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//           setActiveTest(newTest);
//           setActiveTab('Mock Tests');
//           return;
//         }
//       }
//     } catch (err) {
//       console.warn("JSON parse error caught safely, switching to fallback test:", err);
//     }

//     const fallbackQuestions = [];
//     for (let i = 1; i <= 50; i++) {
//       fallbackQuestions.push({
//         question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
//         options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
//         correct: 0,
//         topic: topicName
//       });
//     }

//     const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
//     const updatedTests = [fallbackTest, ...savedTests];
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     setActiveTest(fallbackTest);
//     setActiveTab('Mock Tests');
//   };

//   const handleImageUpload = (fileList) => {
//     const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
//     if (files.length === 0) return;

//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//           name: file.name,
//           base64: e.target.result,
//         };
//         setNoteExpanderImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (id) => {
//     setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingOver(false);
//     if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
//   };

//   const formatFileSize = (bytes) => {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   const handlePdfUpload = (fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
//     if (!isPdf) {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setSelectedPdf({
//         name: file.name,
//         size: file.size,
//         base64: e.target.result,
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePdf = () => setSelectedPdf(null);

//   const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
//   const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
//   const handlePdfDrop = (e) => {
//     e.preventDefault();
//     setIsPdfDraggingOver(false);
//     if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
//   };

//   const handleSendQuery = async (e, customPrompt = null) => {
//     if (e) e.preventDefault();
//     const queryText = (customPrompt || currentToolState.input).trim();
//     const isNoteExpander = activeTab === 'Note Expander';
//     const isPdfUploader = activeTab === 'PDF Uploader';
//     const hasImages = isNoteExpander && noteExpanderImages.length > 0;
//     const hasPdf = isPdfUploader && !!selectedPdf;

//     if ((!queryText && !hasImages && !hasPdf) || loading) return;

//     const userMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       text: queryText || (hasImages
//         ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
//         : hasPdf
//           ? `📄 Uploaded ${selectedPdf.name}`
//           : '')
//     };
    
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
//     }));
//     setLoading(true);

//     try {
//       let finalQuery = queryText;
//       const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

//       const lowerQuery = queryText.toLowerCase();
//       const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
//       const previousMessages = toolStates[activeTab]?.messages || [];
      
//       if (hasPronoun && previousMessages.length > 0) {
//         const lastMsg = previousMessages[previousMessages.length - 1];
//         const contextTopic = lastMsg.queryContext || lastMsg.text || '';
//         if (contextTopic) {
//           finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
//         }
//       }

//       if (isMockReq && activeTab === 'Ask Anything') {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
//       }

//       if (isNoteExpander) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: Expand and correct the rough notes provided.]`;
//       }

//       if (isPdfUploader) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: Analyze the PDF and provide structured study summaries.]`;
//       }

//       let endpoint = 'http://localhost:5000/api/ai/ask-anything';
//       if (activeTab === 'Note Expander') endpoint = 'http://localhost:5000/api/ai/expand-notes';
//       else if (activeTab === 'PDF Uploader') endpoint = 'http://localhost:5000/api/ai/pdf-analysis';

//       const payload = { prompt: finalQuery, tool: activeTab };
//       if (hasImages) payload.images = noteExpanderImages.map(img => img.base64);
//       if (hasPdf) {
//         payload.pdf = selectedPdf.base64;
//         payload.pdfName = selectedPdf.name;
//       }

//       const response = await secureFetch(endpoint, {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       if (!response) {
//         setLoading(false);
//         return;
//       }

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || 'Failed to process AI generation request.');

//       const rawContent = data.result || data.text || data.content || JSON.stringify(data);

//       if (isMockReq) {
//         extractAndSavedMockTestSafe(rawContent, queryText);
//         setLoading(false);
//         return;
//       }

//       const aiResponse = { 
//         id: (Date.now() + 1).toString(), 
//         sender: 'ai', 
//         result: rawContent, 
//         text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
//         queryContext: queryText 
//       };

//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
//       }));

//       if (hasImages) setNoteExpanderImages([]);
//       if (hasPdf) setSelectedPdf(null);

//     } catch (err) {
//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { 
//           ...prev[activeTab], 
//           messages: [...prev[activeTab].messages, { id: Date.now().toString(), sender: 'ai', text: `Error: ${err.message}` }] 
//         }
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOptionSelect = (qIdx, optIdx) => {
//     setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
//   };

//   const handleSubmitTest = () => {
//     let score = 0;
//     let weakTopicsMap = [];

//     activeTest.questions.forEach((q, idx) => {
//       if (selectedAnswers[idx] === q.correct) score += 1;
//       else weakTopicsMap.push(q.topic || activeTest.title);
//     });

//     const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
//     const weakTopics = [...new Set(weakTopicsMap)];
//     const previousHistory = testHistories[activeTest.id];
//     let comparisonMessage = "First Attempt Completed!";
//     let statusColor = "text-purple-400";

//     if (previousHistory) {
//       if (percentage > previousHistory.lastPercentage) {
//         comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-orange-400";
//       } else if (percentage < previousHistory.lastPercentage) {
//         comparisonMessage = `Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-pink-500";
//       } else {
//         comparisonMessage = `Consistent performance at ${percentage}%.`;
//         statusColor = "text-purple-400";
//       }
//     }

//     const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
//     setTestResult(resultObj);
//     const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
//     setTestHistories(updatedHistory);
//     localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
//   };

//   const handleRetakeTest = () => {
//     const shuffledQuestions = activeTest.questions.map(q => {
//       const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
//       optionsWithIndex.sort(() => Math.random() - 0.5);
//       return {
//         ...q,
//         options: optionsWithIndex.map(o => o.text),
//         correct: optionsWithIndex.findIndex(o => o.isCorrect)
//       };
//     });
//     setActiveTest({ ...activeTest, questions: shuffledQuestions });
//     setSelectedAnswers({});
//     setTestResult(null);
//     setCurrentQuestionIndex(0);
//   };

//   const handleExitTest = () => {
//     setActiveTest(null);
//     setTestResult(null);
//     setSelectedAnswers({});
//     setCurrentQuestionIndex(0);
//   };

//   const handleResetSession = () => {
//     setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
//     setActiveBookshelfId(null);
//     localStorage.removeItem('buitems_active_bookshelf_id');
//     setNoteExpanderImages([]);
//     setSelectedPdf(null);
//   };

//   const currentToolState = toolStates[activeTab] || { messages: [], input: '' };
//   const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

//   if (!mounted) return null;

//   return (
//     <div className="flex h-[100dvh] bg-[#0c0a12] text-purple-50 font-sans overflow-hidden relative selection:bg-orange-500 selection:text-white">
      
//       {/* Dynamic Purple & Orange Ambient Light Beams (Matching Image Reference 1) */}
//       <div className="absolute top-0 right-0 w-[650px] h-[500px] bg-gradient-to-br from-purple-700/30 via-pink-600/15 to-orange-500/20 blur-[140px] rounded-full pointer-events-none z-0" />
//       <div className="absolute top-1/3 left-10 w-[400px] h-[350px] bg-gradient-to-tr from-purple-900/20 to-orange-600/10 blur-[130px] rounded-full pointer-events-none z-0" />

//       {isMobileSidebarOpen && (
//         <div 
//           onClick={() => setIsMobileSidebarOpen(false)}
//           className="fixed inset-0 bg-black/80 z-20 md:hidden backdrop-blur-md transition-opacity"
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`fixed md:relative inset-y-0 left-0 z-30 w-72 border-r border-purple-900/30 bg-[#120f1d]/80 backdrop-blur-2xl flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
//         <div>
//           <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-purple-900/30">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white">
//                 <Sparkles className="w-5 h-5 animate-pulse text-orange-200" />
//               </div>
//               <div>
//                 <h1 className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-purple-200 via-pink-200 to-orange-300 bg-clip-text text-transparent">Echo AI Study</h1>
//                 <p className="text-[10px] text-orange-400 font-semibold tracking-widest uppercase truncate max-w-[120px]">{userName}</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setIsMobileSidebarOpen(false)}
//               className="md:hidden text-purple-400 hover:text-white p-1"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400/60 px-3 mb-2">Core Tools</div>
//           <nav className="space-y-1.5">
//             {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-gradient-to-r from-purple-900/40 to-orange-950/40 text-orange-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
//                       : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-900/20'
//                   }`}
//                 >
//                   <FileText className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-purple-400'}`} /> {name}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400/60 px-3 mt-6 mb-2">Library & Workspace</div>
//           <nav className="space-y-1.5">
//             {['Personal Bookshelf', 'Mock Tests'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-gradient-to-r from-purple-900/40 to-orange-950/40 text-orange-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
//                       : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-900/20'
//                   }`}
//                 >
//                   <HelpCircle className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-purple-400'}`} /> {name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Upgrade / Account Box (Style Inspired by Reference Image 1) */}
//         <div className="pt-4 border-t border-purple-900/30 space-y-2">
//           <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-purple-900/30 to-orange-950/40 border border-purple-500/30 shadow-lg mb-2">
//             <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
//               <Flame className="w-4 h-4 text-orange-400 animate-pulse" /> Upgrade to Pro
//             </div>
//             <p className="text-[10px] text-purple-300/70 mt-1">Get unlimited AI responses & advanced mock test generation.</p>
//           </div>

//           <button
//             onClick={() => { setIsSettingsOpen(true); setIsMobileSidebarOpen(false); }}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-purple-300 hover:text-white hover:bg-purple-900/30 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-400/30 text-purple-300 flex items-center justify-center font-bold text-xs shadow">
//               <Settings className="w-3.5 h-3.5" />
//             </div>
//             <span>Settings & Profile</span>
//           </button>
          
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
//               <LogOut className="w-3.5 h-3.5" />
//             </div>
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Workspace Area */}
//       <main className="flex-1 flex flex-col justify-between bg-transparent relative z-10 overflow-hidden w-full">
//         {/* Header */}
//         <header className="h-16 border-b border-purple-900/30 bg-[#120f1d]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
//           <div className="flex items-center gap-3 min-w-0">
//             <button
//               onClick={() => setIsMobileSidebarOpen(true)}
//               className="md:hidden p-2 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-200 shrink-0"
//               title="Open Menu"
//             >
//               <Menu className="w-4 h-4" />
//             </button>
//             <span className="px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-[11px] font-semibold uppercase tracking-wider text-purple-300 truncate">
//               Session: <span className="text-orange-400">{activeTab}</span>
//             </span>
//             {activeBookshelfId && activeTab === 'Ask Anything' && (
//               <span className="hidden lg:inline-block text-[11px] font-semibold text-orange-300 bg-orange-950/40 border border-orange-500/30 px-3 py-1 rounded-full truncate max-w-[220px]">
//                 Shelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
//               </span>
//             )}
//           </div>
//           {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
//             <button 
//               onClick={handleResetSession} 
//               className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/60 text-xs font-semibold text-purple-200 transition-all shrink-0 ml-2"
//             >
//               <RefreshCcw className="w-3.5 h-3.5 text-orange-400" />
//               <span>Reset Chat</span>
//             </button>
//           )}
//         </header>

//         {/* Tab Content Routing */}
//         {activeTab === 'Personal Bookshelf' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!viewingBookshelf ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-white">My Personal Bookshelf</h2>
//                     <p className="text-xs text-purple-300/70 mt-1">Manage saved study modules and topic notes.</p>
//                   </div>
//                   {bookshelves.length > 0 && (
//                     <button
//                       onClick={handleClearAllBookshelves}
//                       className="px-3.5 py-2 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold rounded-xl hover:bg-pink-500/20 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
//                     </button>
//                   )}
//                 </div>

//                 {bookshelves.length === 0 ? (
//                   <div className="p-16 border border-purple-900/40 bg-[#120f1d]/40 backdrop-blur-xl rounded-3xl text-center space-y-4 shadow-2xl">
//                     <BookOpen className="w-12 h-12 mx-auto text-purple-400 animate-pulse" />
//                     <h3 className="text-lg font-bold text-purple-200">No bookshelves created yet.</h3>
//                     <p className="text-xs text-purple-300/70 max-w-sm mx-auto">
//                       Go to <span className="text-orange-400 font-semibold">Ask Anything</span>, generate study notes, and click <span className="text-purple-400 font-semibold">"Save to Bookshelf"</span> to build your custom library.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {bookshelves.map((shelf) => (
//                       <div
//                         key={shelf.id}
//                         onClick={() => setViewingBookshelf(shelf)}
//                         className="p-6 bg-[#120f1d]/80 border border-purple-900/50 hover:border-orange-500/50 rounded-2xl flex flex-col justify-between h-48 transition-all shadow-xl cursor-pointer group"
//                       >
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-white capitalize pr-6 flex items-center gap-2">
//                               <BookOpen className="w-4 h-4 text-purple-400" /> {shelf.title}
//                             </h3>
//                             <button
//                               onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
//                               className="text-purple-400/50 hover:text-pink-400 p-1"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-purple-300/60 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
//                         </div>
//                         <div className="flex items-center justify-between pt-4 border-t border-purple-900/30">
//                           <span className={`text-[11px] font-semibold ${activeBookshelfId === shelf.id ? 'text-orange-400' : 'text-purple-400/60'}`}>
//                             {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
//                           </span>
//                           <span className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-orange-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md">
//                             Open Shelf <ArrowRight className="w-3.5 h-3.5" />
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="p-6 bg-[#120f1d]/80 border border-purple-900/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
//                   <div>
//                     <button onClick={() => setViewingBookshelf(null)} className="text-xs text-orange-400 hover:underline mb-1">← Back to All Bookshelves</button>
//                     <h2 className="text-lg font-extrabold text-white capitalize flex items-center gap-2">
//                       <BookOpen className="w-5 h-5 text-purple-400" /> {viewingBookshelf.title}
//                     </h2>
//                     <p className="text-xs text-purple-300/60 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setActiveBookshelfId(viewingBookshelf.id);
//                       localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
//                       alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
//                     }}
//                     className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeBookshelfId === viewingBookshelf.id ? 'bg-orange-500 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-purple-950 text-purple-200 border border-purple-800 hover:bg-purple-900'}`}
//                   >
//                     {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   {viewingBookshelf.items.map((item, idx) => (
//                     <div key={idx} className="p-6 bg-[#120f1d]/80 border border-purple-900/40 rounded-2xl space-y-3 shadow-xl">
//                       <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
//                         <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">Topic: {item.title || viewingBookshelf.title}</h4>
//                         <span className="text-[10px] text-purple-300/60">{item.date}</span>
//                       </div>
//                       <div className="text-sm leading-relaxed whitespace-pre-wrap text-purple-100">
//                         {item.text}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : activeTab === 'Mock Tests' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!activeTest ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-white">Saved Mock Tests</h2>
//                     <p className="text-xs text-purple-300/70 mt-1">Generated tests are stored here for practice.</p>
//                   </div>
//                   {savedTests.length > 0 && (
//                     <button
//                       onClick={handleClearAllTests}
//                       className="px-3.5 py-2 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold rounded-xl hover:bg-pink-500/20 transition-all flex items-center justify-center gap-2"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
//                     </button>
//                   )}
//                 </div>

//                 {savedTests.length === 0 ? (
//                   <div className="p-16 border border-purple-900/40 bg-[#120f1d]/40 backdrop-blur-xl rounded-3xl text-center space-y-3 shadow-2xl">
//                     <HelpCircle className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
//                     <h3 className="text-lg font-bold text-purple-200">No mock tests available yet.</h3>
//                     <p className="text-xs text-purple-300/70 max-w-sm mx-auto">
//                       Type <span className="text-orange-400 font-semibold">"generate quiz"</span> in <span className="text-purple-300 font-semibold">Ask Anything</span> to create mock tests.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {savedTests.map((test) => (
//                       <div key={test.id} className="p-6 bg-[#120f1d]/80 border border-purple-900/50 hover:border-orange-500/50 rounded-2xl flex flex-col justify-between h-44 transition-all shadow-xl group">
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-white capitalize pr-6 truncate">{test.title}</h3>
//                             <button
//                               onClick={(e) => handleDeleteTest(e, test.id)}
//                               className="text-purple-400/50 hover:text-pink-400 p-1 shrink-0"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-purple-300/60 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
//                         </div>
//                         <button
//                           onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
//                           className="self-end px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:scale-105 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
//                         >
//                           Open Test <ArrowRight className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTest && !testResult ? (
//               <div className="bg-[#120f1d]/90 border border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl">
//                 <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
//                   <div className="min-w-0 pr-2">
//                     <h2 className="text-base font-extrabold text-white capitalize truncate">{activeTest.title}</h2>
//                     <p className="text-xs text-purple-300/60 mt-0.5">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
//                   </div>
//                   <button onClick={handleExitTest} className="text-xs text-purple-300 hover:text-white underline shrink-0">Exit to Library</button>
//                 </div>

//                 <div className="space-y-4">
//                   <p className="text-sm font-semibold text-purple-100 leading-relaxed">{activeTest.questions[currentQuestionIndex].question}</p>
//                   <div className="space-y-2.5">
//                     {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
//                         className={`w-full text-left px-4.5 py-3 rounded-xl text-xs transition-all border ${
//                           selectedAnswers[currentQuestionIndex] === oIdx
//                             ? 'bg-gradient-to-r from-purple-950/80 to-orange-950/80 text-orange-300 font-bold border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
//                             : 'bg-[#0c0a12]/70 text-purple-200 border-purple-900/40 hover:bg-purple-900/30'
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex justify-between items-center pt-4 border-t border-purple-900/30">
//                   <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-semibold disabled:opacity-40">Previous</button>
//                   {currentQuestionIndex < activeTest.questions.length - 1 ? (
//                     <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)]">Next Question</button>
//                   ) : (
//                     <button onClick={handleSubmitTest} className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)]">Submit Test</button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-[#120f1d]/90 border border-purple-900/50 rounded-3xl shadow-2xl overflow-hidden space-y-6 backdrop-blur-2xl">
//                 <div className="p-6 border-b border-purple-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
//                       <CheckCircle2 className="w-5 h-5" />
//                     </div>
//                     <h2 className="text-base font-extrabold text-white capitalize truncate">{activeTest.title} - Test Results</h2>
//                   </div>
//                   <span className={`text-xs font-bold ${testResult.statusColor} bg-[#0c0a12] border border-purple-900/50 px-4 py-2 rounded-full`}>
//                     {testResult.comparisonMessage}
//                   </span>
//                 </div>

//                 <div className="px-6 pb-8">
//                   <div className="overflow-x-auto rounded-2xl border border-purple-900/40 bg-[#0c0a12]/70">
//                     <table className="w-full text-left text-sm">
//                       <thead className="bg-purple-950/60 text-xs uppercase font-mono text-purple-300">
//                         <tr>
//                           <th className="px-5 py-3.5 border-b border-purple-900/30">Evaluation Metric</th>
//                           <th className="px-5 py-3.5 border-b border-purple-900/30">Details</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-purple-900/30 text-purple-200 text-xs">
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white">Total Score</td>
//                           <td className="px-5 py-4">{testResult.score} / {testResult.total}</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white">Percentage Obtained</td>
//                           <td className="px-5 py-4 font-mono font-extrabold text-orange-400 text-sm">{testResult.percentage}%</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white align-top">Weak Topics</td>
//                           <td className="px-5 py-4">
//                             {testResult.weakTopics.length > 0 ? (
//                               <ul className="list-disc list-inside text-pink-400 space-y-1">
//                                 {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
//                               </ul>
//                             ) : (
//                               <span className="text-orange-400 font-semibold">Brilliant! All answers were correct.</span>
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//                     <button onClick={handleExitTest} className="text-xs text-purple-300 hover:text-white underline self-start sm:self-auto">
//                       ← Back to Saved Mock Tests
//                     </button>
//                     <button onClick={handleRetakeTest} className="px-5 py-3 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2">
//                       <RefreshCcw className="w-4 h-4 text-orange-400" /> Retake Test
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <>
//             {/* Chat & Prompt Main View */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {currentToolState.messages.length === 0 ? (
//                 /* Glowing Central Hero Welcome (Matches Image Reference 1 design structure) */
//                 <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 py-12">
                  
//                   {/* Glowing Logo Badge */}
//                   <div className="relative group">
//                     <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600 to-orange-500 blur-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
//                     <div className="relative w-20 h-20 rounded-3xl bg-[#120f1d] border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-2xl">
//                       <Sparkles className="w-10 h-10 text-orange-400" />
//                     </div>
//                   </div>

//                   {/* Welcome Titles */}
//                   <div className="space-y-2">
//                     <p className="text-xs font-bold uppercase tracking-widest text-purple-400">Welcome to Echo AI</p>
//                     <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
//                       How Can I Assist You?
//                     </h2>
//                   </div>

//                   {/* Suggestion Cards Grid (Image Reference 1) */}
//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-4">
//                     {[
//                       { title: "Expand Rough Notes", desc: "Upload handwritten lecture notes", icon: ImagePlus, prompt: "Expand my lecture notes with detailed explanations" },
//                       { title: "Generate Mock Test", desc: "50 MCQs exam quiz generator", icon: HelpCircle, prompt: "Generate a mock test on Computer Networks" },
//                       { title: "Analyze Reference PDF", desc: "Extract key terms & formulas", icon: FileUp, prompt: "Summarize main concepts from reference materials" },
//                     ].map((card, i) => (
//                       <button
//                         key={i}
//                         onClick={() => handleSendQuery(null, card.prompt)}
//                         className="p-4 rounded-2xl bg-[#120f1d]/60 hover:bg-gradient-to-b hover:from-purple-900/30 hover:to-orange-950/30 border border-purple-900/40 hover:border-purple-500/50 text-left transition-all group shadow-lg flex flex-col justify-between h-32"
//                       >
//                         <card.icon className="w-5 h-5 text-purple-400 group-hover:text-orange-400 transition-colors" />
//                         <div>
//                           <p className="text-xs font-bold text-purple-100 group-hover:text-white">{card.title}</p>
//                           <p className="text-[10px] text-purple-400/60 mt-0.5">{card.desc}</p>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 currentToolState.messages.map((msg) => (
//                   msg.sender === 'user' ? (
//                     <div key={msg.id} className="flex justify-end w-full">
//                       <div className="max-w-[90%] sm:max-w-[80%] bg-gradient-to-r from-purple-700 via-pink-700 to-orange-600 text-white border border-purple-400/30 px-5 py-3.5 rounded-2xl rounded-br-none text-sm flex items-start gap-3 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
//                         <span className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</span>
//                         <div className="p-1 rounded-full bg-purple-900 text-white shrink-0 mt-0.5"><User className="w-3.5 h-3.5" /></div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div key={msg.id} className="space-y-2">
//                       <div className="flex justify-start">
//                         <button
//                           onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
//                           className="px-3.5 py-1.5 bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/40 text-orange-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
//                         >
//                           <BookmarkPlus className="w-3.5 h-3.5 text-orange-400" /> Save to Bookshelf
//                         </button>
//                       </div>
//                       <StructuredResponseRenderer message={msg} />
//                     </div>
//                   )
//                 ))
//               )}
//               {loading && (
//                 <div className="p-4 rounded-2xl bg-[#120f1d]/80 border border-purple-500/30 w-fit text-xs text-orange-400 animate-pulse flex items-center gap-2 shadow-xl">
//                   <Sparkles className="w-4 h-4 animate-spin text-purple-400" /> Echo AI is processing your request...
//                 </div>
//               )}
//               <div ref={chatEndRef} />
//             </div>

//             {/* Bottom Floating Glass Input Capsule (Matching Image Reference 1 Layout) */}
//             <div className="p-4 sm:p-6 bg-transparent">
//               <div className="max-w-4xl mx-auto space-y-3">

//                 {activeTab === 'Note Expander' && (
//                   <div
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-[#120f1d]/60 ${
//                       isDraggingOver
//                         ? 'border-orange-500 bg-orange-500/10'
//                         : 'border-purple-900/50 hover:border-purple-500/50'
//                     }`}
//                   >
//                     {noteExpanderImages.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         {noteExpanderImages.map((img) => (
//                           <div key={img.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-700 group shadow">
//                             <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(img.id)}
//                               className="absolute top-1 right-1 bg-black/80 hover:bg-pink-500 text-white rounded-full p-1 transition-colors"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => noteImageInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-purple-200 hover:text-white transition-all border border-purple-800 bg-purple-950/40"
//                     >
//                       <ImagePlus className="w-4 h-4 text-orange-400" />
//                       <span className="truncate">{noteExpanderImages.length > 0 ? 'Add More Photos' : 'Upload Photos of Notes'}</span>
//                     </button>
//                     <input
//                       ref={noteImageInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {activeTab === 'PDF Uploader' && (
//                   <div
//                     onDragOver={handlePdfDragOver}
//                     onDragLeave={handlePdfDragLeave}
//                     onDrop={handlePdfDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-[#120f1d]/60 ${
//                       isPdfDraggingOver
//                         ? 'border-orange-500 bg-orange-500/10'
//                         : 'border-purple-900/50 hover:border-purple-500/50'
//                     }`}
//                   >
//                     {selectedPdf ? (
//                       <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-purple-800 bg-purple-950/40 mb-3 shadow">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
//                             <FileText className="w-5 h-5" />
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-xs font-bold truncate text-purple-200">{selectedPdf.name}</p>
//                             <p className="text-[10px] text-purple-400/60">{formatFileSize(selectedPdf.size)}</p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removePdf}
//                           className="text-purple-400 hover:text-pink-400 p-1.5"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => pdfInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-purple-200 hover:text-white transition-all border border-purple-800 bg-purple-950/40"
//                     >
//                       <FileUp className="w-4 h-4 text-orange-400" />
//                       <span className="truncate">{selectedPdf ? 'Replace PDF' : 'Upload Reference PDF'}</span>
//                     </button>
//                     <input
//                       ref={pdfInputRef}
//                       type="file"
//                       accept="application/pdf,.pdf"
//                       onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {/* Floating Capsule Input Bar (Reflects Image 1 bottom bar) */}
//                 <form onSubmit={handleSendQuery} className="relative group">
//                   <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/30 to-orange-500/30 blur-md opacity-40 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  
//                   <div className="relative flex items-center bg-[#120f1d]/90 border border-purple-500/30 focus-within:border-orange-500/60 rounded-2xl px-4 py-2 backdrop-blur-xl shadow-2xl transition-all">
//                     <Sparkles className="w-4 h-4 text-purple-400 mr-3 shrink-0" />
//                     <input
//                       type="text"
//                       value={currentToolState.input}
//                       onChange={handleInputChange}
//                       placeholder={
//                         activeTab === 'Note Expander'
//                           ? 'Ask AI anything or write your request...'
//                           : activeTab === 'PDF Uploader'
//                             ? 'Ask AI anything or write your request...'
//                             : 'Ask AI anything or write your request...'
//                       }
//                       className="w-full bg-transparent py-3 text-sm text-purple-100 placeholder-purple-400/50 focus:outline-none"
//                     />
                    
//                     <button
//                       type="submit"
//                       disabled={
//                         loading ||
//                         (!currentToolState.input.trim() &&
//                           !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
//                           !(activeTab === 'PDF Uploader' && selectedPdf))
//                       }
//                       className="ml-2 w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] disabled:opacity-40 shrink-0"
//                     >
//                       <Send className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* Save Modal with Theme Styling */}
//       {showSaveModal && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
//           <div className="bg-[#120f1d] border border-purple-500/40 text-purple-100 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
//             <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
//               <h3 className="text-sm font-extrabold flex items-center gap-2 text-white">
//                 <BookmarkPlus className="w-4 h-4 text-orange-400" /> Create New Bookshelf
//               </h3>
//               <button onClick={() => setShowSaveModal(false)} className="text-purple-400 hover:text-white"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <p className="text-purple-300/70">Name your new bookshelf to save this study material:</p>
//               <input
//                 type="text"
//                 value={newBookshelfName}
//                 onChange={(e) => setNewBookshelfName(e.target.value)}
//                 placeholder="e.g. Physics Notes, Web Dev..."
//                 className="w-full px-4 py-3 rounded-xl border border-purple-700/50 bg-[#0c0a12] text-white outline-none focus:border-orange-500 font-medium"
//               />
//             </div>

//             <div className="flex justify-end gap-2.5 pt-2 border-t border-purple-900/30">
//               <button onClick={() => setShowSaveModal(false)} className="px-4 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-semibold">Cancel</button>
//               <button onClick={handleCreateNewBookshelfAndSave} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]">Create & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <SettingsModal
//         isOpen={isSettingsOpen}
//         onClose={() => setIsSettingsOpen(false)}
//       />
//     </div>
//   );
// }



//6th edit

// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { Lightbulb, Send, Settings, FileText, HelpCircle, User, X, CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp, Menu, Sparkles } from 'lucide-react';
// import { secureFetch } from '@/utils/apiHelper';
// import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
// import SettingsModal from '@/components/SettingsModal';

// export default function DashboardPage() {

//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   const [activeTab, setActiveTab] = useState('Ask Anything');
//   const [showSettings, setShowSettings] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
//   const [toolStates, setToolStates] = useState({
//     'Ask Anything': { messages: [], input: '' },
//     'Note Expander': { messages: [], input: '' },
//     'PDF Uploader': { messages: [], input: '' },
//   });
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // --- USER PROFILE & THEME STATES ---
//   const [userName, setUserName] = useState('MIR SHAHARYAR');
//   const [tempName, setTempName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [themeMode, setThemeMode] = useState('dark');

//   // --- PERSONAL BOOKSHELF STATES ---
//   const [bookshelves, setBookshelves] = useState([]);
//   const [activeBookshelfId, setActiveBookshelfId] = useState(null);
//   const [viewingBookshelf, setViewingBookshelf] = useState(null);
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [pendingItemToSave, setPendingItemToSave] = useState(null);
//   const [newBookshelfName, setNewBookshelfName] = useState('');

//   // --- MOCK TEST STATES ---
//   const [savedTests, setSavedTests] = useState([]);
//   const [testHistories, setTestHistories] = useState({});
//   const [activeTest, setActiveTest] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [testResult, setTestResult] = useState(null);

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD STATES ---
//   const [noteExpanderImages, setNoteExpanderImages] = useState([]);
//   const [isDraggingOver, setIsDraggingOver] = useState(false);
//   const noteImageInputRef = useRef(null);

//   // --- PDF UPLOADER: SINGLE PDF (TEXTBOOK) UPLOAD STATES ---
//   const [selectedPdf, setSelectedPdf] = useState(null);
//   const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
//   const pdfInputRef = useRef(null);

//   // --- AUTH GUARD FIXED ---
//   useEffect(() => {
//     setMounted(true);
//     const token = localStorage.getItem('token');
//     // Agar token nahi hai to foran login page par redirect kar do
//     if (!token) {
//       router.replace('/login');
//     }
//   }, [router]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedTests = localStorage.getItem('buitems_mock_tests');
//       const storedHistories = localStorage.getItem('buitems_test_histories');
//       const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
//       const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
//       const storedName = localStorage.getItem('buitems_user_name');
//       const storedTheme = localStorage.getItem('buitems_theme_mode');

//       if (storedTests) setSavedTests(JSON.parse(storedTests));
//       if (storedHistories) setTestHistories(JSON.parse(storedHistories));
//       if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
//       if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
//       if (storedName) {
//         setUserName(storedName);
//         setTempName(storedName);
//       }
//       if (storedTheme) setThemeMode(storedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [toolStates, activeTab, loading]);

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], input: val }
//     }));
//   };

//   const handleSaveName = () => {
//     if (!tempName.trim()) return;
//     setUserName(tempName.trim());
//     localStorage.setItem('buitems_user_name', tempName.trim());
//     setIsEditingName(false);
//   };

//   const handleToggleTheme = () => {
//     const newTheme = themeMode === 'dark' ? 'light' : 'dark';
//     setThemeMode(newTheme);
//     localStorage.setItem('buitems_theme_mode', newTheme);
//   };

//   // --- LOGOUT HANDLER FIXED (Clears Cookie & Storage properly) ---
//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       localStorage.clear();
//       // Clear auth cookie by expiring it immediately
//       document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
//       router.replace('/login');
//       router.refresh();
//     }
//   };

//   const handleTriggerSave = (msgText, queryText) => {
//     if (!activeBookshelfId) {
//       setPendingItemToSave({ text: msgText, title: queryText });
//       setNewBookshelfName(queryText || 'My Study Notes');
//       setShowSaveModal(true);
//     } else {
//       saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
//     }
//   };

//   const handleCreateNewBookshelfAndSave = () => {
//     if (!newBookshelfName.trim()) return;
//     const shelfId = Date.now().toString();
//     const newShelf = {
//       id: shelfId,
//       title: newBookshelfName.trim(),
//       date: new Date().toLocaleDateString(),
//       items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
//     };

//     const updatedShelves = [newShelf, ...bookshelves];
//     setBookshelves(updatedShelves);
//     setActiveBookshelfId(shelfId);

//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     localStorage.setItem('buitems_active_bookshelf_id', shelfId);

//     setShowSaveModal(false);
//     setPendingItemToSave(null);
//     setNewBookshelfName('');
//     alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
//   };

//   const saveItemToBookshelf = (shelfId, item) => {
//     const updatedShelves = bookshelves.map(shelf => {
//       if (shelf.id === shelfId) {
//         return { ...shelf, items: [item, ...shelf.items] };
//       }
//       return shelf;
//     });
//     setBookshelves(updatedShelves);
//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     alert("Successfully saved to your active bookshelf!");
//   };

//   const handleDeleteBookshelf = (e, shelfId) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this bookshelf?")) {
//       const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
//       setBookshelves(updatedShelves);
//       localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//       if (activeBookshelfId === shelfId) {
//         setActiveBookshelfId(null);
//         localStorage.removeItem('buitems_active_bookshelf_id');
//       }
//       if (viewingBookshelf && viewingBookshelf.id === shelfId) {
//         setViewingBookshelf(null);
//       }
//     }
//   };

//   const handleClearAllBookshelves = () => {
//     if (window.confirm("Are you sure you want to delete all bookshelves?")) {
//       setBookshelves([]);
//       setActiveBookshelfId(null);
//       setViewingBookshelf(null);
//       localStorage.removeItem('buitems_personal_bookshelves');
//       localStorage.removeItem('buitems_active_bookshelf_id');
//     }
//   };

//   const handleDeleteTest = (e, testId) => {
//     e.stopPropagation();
//     const updatedTests = savedTests.filter(t => t.id !== testId);
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     if (activeTest && activeTest.id === testId) setActiveTest(null);
//   };

//   const handleClearAllTests = () => {
//     if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
//       setSavedTests([]);
//       localStorage.removeItem('buitems_mock_tests');
//       setActiveTest(null);
//     }
//   };

//   const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
//     const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

//     try {
//       if (typeof rawText === 'string') {
//         let cleaned = rawText.trim();
//         const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (match) cleaned = match[1].trim();

//         const firstBracket = cleaned.indexOf('[');
//         const lastBracket = cleaned.lastIndexOf(']');
//         if (firstBracket !== -1 && lastBracket !== -1) {
//           cleaned = cleaned.substring(firstBracket, lastBracket + 1);
//         }

//         const parsed = JSON.parse(cleaned);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const validQuestions = parsed.map(q => ({
//             question: q.question || "Sample Question?",
//             options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
//             correct: typeof q.correct === 'number' ? q.correct : 0,
//             topic: q.topic || topicName
//           }));

//           const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
//           const updatedTests = [newTest, ...savedTests];
//           setSavedTests(updatedTests);
//           localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//           setActiveTest(newTest);
//           setActiveTab('Mock Tests');
//           return;
//         }
//       }
//     } catch (err) {
//       console.warn("JSON parse error caught safely, switching to dynamic fallback test:", err);
//     }

//     const fallbackQuestions = [];
//     for (let i = 1; i <= 50; i++) {
//       fallbackQuestions.push({
//         question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
//         options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
//         correct: 0,
//         topic: topicName
//       });
//     }

//     const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
//     const updatedTests = [fallbackTest, ...savedTests];
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     setActiveTest(fallbackTest);
//     setActiveTab('Mock Tests');
//   };

//   const handleImageUpload = (fileList) => {
//     const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
//     if (files.length === 0) return;

//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//           name: file.name,
//           base64: e.target.result,
//         };
//         setNoteExpanderImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (id) => {
//     setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingOver(false);
//     if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
//   };

//   const formatFileSize = (bytes) => {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   const handlePdfUpload = (fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
//     if (!isPdf) {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setSelectedPdf({
//         name: file.name,
//         size: file.size,
//         base64: e.target.result,
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePdf = () => setSelectedPdf(null);

//   const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
//   const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
//   const handlePdfDrop = (e) => {
//     e.preventDefault();
//     setIsPdfDraggingOver(false);
//     if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
//   };

//   const handleSendQuery = async (e) => {
//     e.preventDefault();
//     const queryText = currentToolState.input.trim();
//     const isNoteExpander = activeTab === 'Note Expander';
//     const isPdfUploader = activeTab === 'PDF Uploader';
//     const hasImages = isNoteExpander && noteExpanderImages.length > 0;
//     const hasPdf = isPdfUploader && !!selectedPdf;

//     if ((!queryText && !hasImages && !hasPdf) || loading) return;

//     const userMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       text: queryText || (hasImages
//         ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
//         : hasPdf
//           ? `📄 Uploaded ${selectedPdf.name}`
//           : '')
//     };
    
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
//     }));
//     setLoading(true);

//     try {
//       let finalQuery = queryText;
//       const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

//       const lowerQuery = queryText.toLowerCase();
//       const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
//       const previousMessages = toolStates[activeTab]?.messages || [];
      
//       if (hasPronoun && previousMessages.length > 0) {
//         const lastMsg = previousMessages[previousMessages.length - 1];
//         const contextTopic = lastMsg.queryContext || lastMsg.text || '';
//         if (contextTopic) {
//           finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
//         }
//       }

//       if (isMockReq && activeTab === 'Ask Anything') {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
//       }

//       if (isNoteExpander) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: The attached images contain a student's incomplete or rough handwritten class notes. Read the images carefully, then: (1) rewrite and expand the notes into complete, well-structured study notes covering the full topic; (2) add a separate "Corrections & Gaps" section that explicitly flags any factual mistakes, conceptual errors, or missing information found in the original notes.]`;
//       }

//       if (isPdfUploader) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: The attached PDF is a full textbook, chapter, or reference document. Carefully read through the entire document and produce comprehensive, well-structured study notes covering: (1) a chapter-by-chapter or section-by-section summary of key concepts; (2) all important formulas, definitions, and terminology explicitly called out; (3) a clear, organized outline suitable for exam revision.]`;
//       }

//       let endpoint = 'http://localhost:5000/api/ai/ask-anything';
//       if (activeTab === 'Note Expander') endpoint = 'http://localhost:5000/api/ai/expand-notes';
//       else if (activeTab === 'PDF Uploader') endpoint = 'http://localhost:5000/api/ai/pdf-analysis';

//       const payload = { prompt: finalQuery, tool: activeTab };
//       if (hasImages) {
//         payload.images = noteExpanderImages.map(img => img.base64);
//       }
//       if (hasPdf) {
//         payload.pdf = selectedPdf.base64;
//         payload.pdfName = selectedPdf.name;
//       }

//       const response = await secureFetch(endpoint, {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       if (!response) {
//         setLoading(false);
//         return;
//       }

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to process AI generation request.');
//       }

//       const rawContent = data.result || data.text || data.content || JSON.stringify(data);

//       if (isMockReq) {
//         extractAndSavedMockTestSafe(rawContent, queryText);
//         setLoading(false);
//         return;
//       }

//       const aiResponse = { 
//         id: (Date.now() + 1).toString(), 
//         sender: 'ai', 
//         result: rawContent, 
//         text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
//         queryContext: queryText 
//       };

//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
//       }));

//       if (hasImages) setNoteExpanderImages([]);
//       if (hasPdf) setSelectedPdf(null);

//     } catch (err) {
//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { 
//           ...prev[activeTab], 
//           messages: [...prev[activeTab].messages, { 
//             id: Date.now().toString(), 
//             sender: 'ai', 
//             text: `Error: ${err.message}` 
//           }] 
//         }
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOptionSelect = (qIdx, optIdx) => {
//     setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
//   };

//   const handleSubmitTest = () => {
//     let score = 0;
//     let weakTopicsMap = [];

//     activeTest.questions.forEach((q, idx) => {
//       if (selectedAnswers[idx] === q.correct) score += 1;
//       else weakTopicsMap.push(q.topic || activeTest.title);
//     });

//     const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
//     const weakTopics = [...new Set(weakTopicsMap)];
//     const previousHistory = testHistories[activeTest.id];
//     let comparisonMessage = "This is your first attempt.";
//     let statusColor = "text-slate-400";

//     if (previousHistory) {
//       if (percentage > previousHistory.lastPercentage) {
//         comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-emerald-400";
//       } else if (percentage < previousHistory.lastPercentage) {
//         comparisonMessage = `Degraded. Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-rose-400";
//       } else {
//         comparisonMessage = `Consistent performance at ${percentage}%.`;
//         statusColor = "text-blue-400";
//       }
//     }

//     const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
//     setTestResult(resultObj);
//     const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
//     setTestHistories(updatedHistory);
//     localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
//   };

//   const handleRetakeTest = () => {
//     const shuffledQuestions = activeTest.questions.map(q => {
//       const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
//       optionsWithIndex.sort(() => Math.random() - 0.5);
//       return {
//         ...q,
//         options: optionsWithIndex.map(o => o.text),
//         correct: optionsWithIndex.findIndex(o => o.isCorrect)
//       };
//     });
//     setActiveTest({ ...activeTest, questions: shuffledQuestions });
//     setSelectedAnswers({});
//     setTestResult(null);
//     setCurrentQuestionIndex(0);
//   };

//   const handleExitTest = () => {
//     setActiveTest(null);
//     setTestResult(null);
//     setSelectedAnswers({});
//     setCurrentQuestionIndex(0);
//   };

//   const handleResetSession = () => {
//     setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
//     setActiveBookshelfId(null);
//     localStorage.removeItem('buitems_active_bookshelf_id');
//     setNoteExpanderImages([]);
//     setSelectedPdf(null);
//   };

//   const currentToolState = toolStates[activeTab] || { messages: [], input: '' };
//   const isDark = themeMode === 'dark';
//   const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

//   if (!mounted) return null;

//   return (
//     <div className="flex h-[100dvh] bg-slate-950 text-slate-100 font-sans overflow-hidden relative selection:bg-blue-500 selection:text-white">
      
//       <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

//       {isMobileSidebarOpen && (
//         <div 
//           onClick={() => setIsMobileSidebarOpen(false)}
//           className="fixed inset-0 bg-black/70 z-20 md:hidden backdrop-blur-sm transition-opacity"
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`fixed md:relative inset-y-0 left-0 z-30 w-72 border-r border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
//         <div>
//           <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-slate-800/80">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white">
//                 <Sparkles className="w-5 h-5 animate-pulse" />
//               </div>
//               <div>
//                 <h1 className="text-sm font-extrabold tracking-wider text-white">BUITEMS Study AI</h1>
//                 <p className="text-[10px] text-blue-400 font-medium tracking-widest uppercase truncate max-w-[120px]">{userName}</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setIsMobileSidebarOpen(false)}
//               className="md:hidden text-slate-400 hover:text-white p-1"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">Tools</div>
//           <nav className="space-y-1">
//             {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
//                       : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
//                   }`}
//                 >
//                   <FileText className="w-4 h-4" /> {name}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mt-6 mb-2">Library & Assessment</div>
//           <nav className="space-y-1">
//             {['Personal Bookshelf', 'Mock Tests'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
//                       : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
//                   }`}
//                 >
//                   <HelpCircle className="w-4 h-4" /> {name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         <div className="pt-4 border-t border-slate-800/80 space-y-2">
//           <button
//             onClick={() => { setIsSettingsOpen(true); setIsMobileSidebarOpen(false); }}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow">
//               <Settings className="w-3.5 h-3.5" />
//             </div>
//             <span>Settings & Profile</span>
//           </button>
          
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
//               <LogOut className="w-3.5 h-3.5" />
//             </div>
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <main className="flex-1 flex flex-col justify-between bg-slate-950 relative z-10 overflow-hidden w-full">
//         <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
//           <div className="flex items-center gap-3 min-w-0">
//             <button
//               onClick={() => setIsMobileSidebarOpen(true)}
//               className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 shrink-0"
//               title="Open Menu"
//             >
//               <Menu className="w-4 h-4" />
//             </button>
//             <span className="px-3.5 py-1.5 rounded-full border border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
//               Session: <span className="text-blue-400">{activeTab}</span>
//             </span>
//             {activeBookshelfId && activeTab === 'Ask Anything' && (
//               <span className="hidden lg:inline-block text-[11px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1 rounded-full truncate max-w-[220px]">
//                 Active Shelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
//               </span>
//             )}
//           </div>
//           {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
//             <button 
//               onClick={handleResetSession} 
//               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-all shrink-0 ml-2"
//             >
//               <RefreshCcw className="w-3.5 h-3.5 text-blue-400" />
//               <span>Reset</span>
//             </button>
//           )}
//         </header>

//         {activeTab === 'Personal Bookshelf' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!viewingBookshelf ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-white">My Personal Bookshelf</h2>
//                     <p className="text-xs text-slate-400 mt-1">Manage your saved study modules and topic notes.</p>
//                   </div>
//                   {bookshelves.length > 0 && (
//                     <button
//                       onClick={handleClearAllBookshelves}
//                       className="px-3.5 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto shadow"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
//                     </button>
//                   )}
//                 </div>

//                 {bookshelves.length === 0 ? (
//                   <div className="p-16 border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-3xl text-center space-y-4 shadow-2xl">
//                     <BookOpen className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
//                     <h3 className="text-lg font-bold text-slate-300">No bookshelves created yet.</h3>
//                     <p className="text-xs text-slate-400 max-w-sm mx-auto">
//                       Go to <span className="text-blue-400 font-semibold">Ask Anything</span>, generate study notes, and click <span className="text-amber-400 font-semibold">"Save to Bookshelf"</span> to build your custom library.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {bookshelves.map((shelf) => (
//                       <div
//                         key={shelf.id}
//                         onClick={() => setViewingBookshelf(shelf)}
//                         className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between h-48 transition-all shadow-xl hover:border-blue-500/40 cursor-pointer group relative"
//                       >
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-white capitalize pr-6 flex items-center gap-2">
//                               <BookOpen className="w-4 h-4 text-blue-400" /> {shelf.title}
//                             </h3>
//                             <button
//                               onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
//                               title="Delete Bookshelf"
//                               className="text-slate-500 hover:text-red-400 p-1 transition-colors"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-slate-500 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
//                         </div>
//                         <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
//                           <span className={`text-[11px] font-semibold ${activeBookshelfId === shelf.id ? 'text-emerald-400' : 'text-slate-500'}`}>
//                             {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
//                           </span>
//                           <span className="px-3.5 py-1.5 bg-blue-600 group-hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
//                             Open Shelf <ArrowRight className="w-3.5 h-3.5" />
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
//                   <div>
//                     <button onClick={() => setViewingBookshelf(null)} className="text-xs text-blue-400 hover:underline mb-1">← Back to All Bookshelves</button>
//                     <h2 className="text-lg font-extrabold text-white capitalize flex items-center gap-2">
//                       <BookOpen className="w-5 h-5 text-blue-400" /> {viewingBookshelf.title}
//                     </h2>
//                     <p className="text-xs text-slate-400 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setActiveBookshelfId(viewingBookshelf.id);
//                       localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
//                       alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
//                     }}
//                     className={`px-4 py-2 rounded-xl text-xs font-bold self-start sm:self-auto transition-all ${activeBookshelfId === viewingBookshelf.id ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'}`}
//                   >
//                     {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
//                   </button>
//                 </div>

//                 {viewingBookshelf.items.length === 0 ? (
//                   <div className="p-12 border border-slate-800 bg-slate-900/40 border-dashed rounded-2xl text-center text-slate-400">
//                     <p className="text-sm">No items saved in this bookshelf yet.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {viewingBookshelf.items.map((item, idx) => (
//                       <div key={idx} className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 shadow-xl">
//                         <div className="flex items-center justify-between border-b border-slate-800 pb-3">
//                           <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Topic: {item.title || viewingBookshelf.title}</h4>
//                           <span className="text-[10px] text-slate-500">{item.date}</span>
//                         </div>
//                         <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
//                           {item.text}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ) : activeTab === 'Mock Tests' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!activeTest ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-white">Saved Mock Tests</h2>
//                     <p className="text-xs text-slate-400 mt-1">All generated test files are safely stored here for exam practice.</p>
//                   </div>
//                   {savedTests.length > 0 && (
//                     <button
//                       onClick={handleClearAllTests}
//                       className="px-3.5 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto shadow"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
//                     </button>
//                   )}
//                 </div>

//                 {savedTests.length === 0 ? (
//                   <div className="p-16 border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-3xl text-center space-y-3 shadow-2xl">
//                     <HelpCircle className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
//                     <h3 className="text-lg font-bold text-slate-300">No mock tests available yet.</h3>
//                     <p className="text-xs text-slate-400 max-w-sm mx-auto">
//                       Ask anything or type <span className="text-blue-400 font-semibold">"generate quiz"</span> in <span className="text-slate-300 font-semibold">Ask Anything</span> to create tests.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {savedTests.map((test) => (
//                       <div key={test.id} className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between h-44 transition-all shadow-xl hover:border-cyan-500/40 group relative">
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-white capitalize pr-6 truncate">{test.title}</h3>
//                             <button
//                               onClick={(e) => handleDeleteTest(e, test.id)}
//                               title="Delete Test"
//                               className="text-slate-500 hover:text-red-400 p-1 transition-colors shrink-0"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-slate-500 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
//                         </div>
//                         <button
//                           onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
//                           className="self-end px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-105 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
//                         >
//                           Open & Solve Test <ArrowRight className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTest && !testResult ? (
//               <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
//                 <div className="flex items-center justify-between border-b border-slate-800 pb-4">
//                   <div className="min-w-0 pr-2">
//                     <h2 className="text-base font-extrabold text-white capitalize truncate">{activeTest.title}</h2>
//                     <p className="text-xs text-slate-400 mt-0.5">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
//                   </div>
//                   <button onClick={handleExitTest} className="text-xs text-slate-400 hover:text-white underline shrink-0">Exit to Library</button>
//                 </div>

//                 <div className="space-y-4">
//                   <p className="text-sm font-semibold text-slate-200 leading-relaxed">{activeTest.questions[currentQuestionIndex].question}</p>
//                   <div className="space-y-2.5">
//                     {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
//                         className={`w-full text-left px-4.5 py-3 rounded-xl text-xs transition-all border ${
//                           selectedAnswers[currentQuestionIndex] === oIdx
//                             ? 'bg-blue-600/20 text-blue-300 font-bold border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
//                             : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex justify-between items-center pt-4 border-t border-slate-800">
//                   <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40">Previous</button>
//                   {currentQuestionIndex < activeTest.questions.length - 1 ? (
//                     <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]">Next Question</button>
//                   ) : (
//                     <button onClick={handleSubmitTest} className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 text-white text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]">Submit Test</button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-6 backdrop-blur-xl">
//                 <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
//                       <CheckCircle2 className="w-5 h-5" />
//                     </div>
//                     <h2 className="text-base font-extrabold text-white capitalize truncate">{activeTest.title} - Results</h2>
//                   </div>
//                   <span className={`text-xs font-bold ${testResult.statusColor} bg-slate-950 border border-slate-800 px-4 py-2 rounded-full self-start sm:self-auto shadow`}>
//                     {testResult.comparisonMessage}
//                   </span>
//                 </div>

//                 <div className="px-6 pb-8">
//                   <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
//                     <table className="w-full text-left text-sm">
//                       <thead className="bg-slate-900/80 text-xs uppercase font-mono text-slate-400">
//                         <tr>
//                           <th className="px-5 py-3.5 border-b border-slate-800">Evaluation Metric</th>
//                           <th className="px-5 py-3.5 border-b border-slate-800">Details</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-slate-800 text-slate-300 text-xs">
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white">Total Score</td>
//                           <td className="px-5 py-4">{testResult.score} / {testResult.total}</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white">Percentage Obtained</td>
//                           <td className="px-5 py-4 font-mono font-extrabold text-cyan-400 text-sm">{testResult.percentage}%</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white align-top">Weak Topics / Improvement Needed</td>
//                           <td className="px-5 py-4">
//                             {testResult.weakTopics.length > 0 ? (
//                               <ul className="list-disc list-inside text-rose-400 space-y-1">
//                                 {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
//                               </ul>
//                             ) : (
//                               <span className="text-emerald-400 font-semibold">Brilliant! All answers were correct.</span>
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//                     <button onClick={handleExitTest} className="text-xs text-slate-400 hover:text-white underline underline-offset-2 self-start sm:self-auto">
//                       ← Back to Saved Mock Tests
//                     </button>
//                     <button onClick={handleRetakeTest} className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto border border-slate-700 shadow">
//                       <RefreshCcw className="w-4 h-4 text-blue-400" /> Retake Test (Shuffled Questions)
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <>
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {currentToolState.messages.length === 0 ? (
//                 <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 max-w-sm mx-auto space-y-3 px-4 py-20">
//                   <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)]">
//                     <Sparkles className="w-8 h-8 animate-pulse" />
//                   </div>
//                   <h2 className="text-lg font-bold text-white">
//                     {activeTab === 'Note Expander'
//                       ? 'Upload rough lecture notes or scribbled bullet points'
//                       : activeTab === 'PDF Uploader'
//                         ? 'Upload your reference textbook or course handbook'
//                         : 'Ask anything or type "generate quiz"'}
//                   </h2>
//                   <p className="text-xs text-slate-400">
//                     {activeTab === 'Note Expander'
//                       ? 'Upload photos of your rough notes below, then ask anything to expand and correct them!'
//                       : activeTab === 'PDF Uploader'
//                         ? 'Upload your full textbook or reference PDF below, then ask anything to generate complete study notes!'
//                         : 'Get instant academic explanations tailored for BUITEMS university exams.'
//                     }
//                   </p>
//                 </div>
//               ) : (
//                 currentToolState.messages.map((msg) => (
//                   msg.sender === 'user' ? (
//                     <div key={msg.id} className="flex justify-end w-full">
//                       <div className="max-w-[90%] sm:max-w-[80%] bg-blue-600 text-white border border-blue-500/40 px-5 py-3.5 rounded-2xl rounded-br-none text-sm flex items-start gap-3 shadow-[0_0_20px_rgba(59,130,246,0.25)]">
//                         <span className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</span>
//                         <div className="p-1 rounded-full bg-blue-700 text-white shrink-0 mt-0.5"><User className="w-3.5 h-3.5" /></div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div key={msg.id} className="space-y-2">
//                       <div className="flex justify-start">
//                         <button
//                           onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
//                           className="px-3.5 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
//                         >
//                           <BookmarkPlus className="w-3.5 h-3.5" /> Save to Bookshelf
//                         </button>
//                       </div>
//                       <StructuredResponseRenderer message={msg} />
//                     </div>
//                   )
//                 ))
//               )}
//               {loading && (
//                 <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 w-fit text-xs text-blue-400 animate-pulse flex items-center gap-2 shadow-xl">
//                   <Sparkles className="w-4 h-4 animate-spin" /> AI is formulating response & study materials...
//                 </div>
//               )}
//               <div ref={chatEndRef} />
//             </div>

//             <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800/80">
//               <div className="max-w-4xl mx-auto space-y-3">

//                 {activeTab === 'Note Expander' && (
//                   <div
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-slate-900/40 ${
//                       isDraggingOver
//                         ? 'border-blue-500 bg-blue-500/10'
//                         : 'border-slate-800 hover:border-blue-500/40'
//                     }`}
//                   >
//                     {noteExpanderImages.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         {noteExpanderImages.map((img) => (
//                           <div key={img.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 group shadow">
//                             <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(img.id)}
//                               className="absolute top-1 right-1 bg-black/80 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
//                               title="Remove image"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => noteImageInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-800 bg-slate-900/80"
//                     >
//                       <ImagePlus className="w-4 h-4 text-blue-400" />
//                       <span className="truncate">{noteExpanderImages.length > 0 ? 'Add More Photos of Notes' : 'Upload Photos of Your Notes (multiple allowed)'}</span>
//                     </button>
//                     <input
//                       ref={noteImageInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {activeTab === 'PDF Uploader' && (
//                   <div
//                     onDragOver={handlePdfDragOver}
//                     onDragLeave={handlePdfDragLeave}
//                     onDrop={handlePdfDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-slate-900/40 ${
//                       isPdfDraggingOver
//                         ? 'border-cyan-500 bg-cyan-500/10'
//                         : 'border-slate-800 hover:border-cyan-500/40'
//                     }`}
//                   >
//                     {selectedPdf ? (
//                       <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900 mb-3 shadow">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
//                             <FileText className="w-5 h-5" />
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-xs font-bold truncate text-slate-200">{selectedPdf.name}</p>
//                             <p className="text-[10px] text-slate-500">{formatFileSize(selectedPdf.size)}</p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removePdf}
//                           title="Remove PDF"
//                           className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg transition-colors shrink-0"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => pdfInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-800 bg-slate-900/80"
//                     >
//                       <FileUp className="w-4 h-4 text-cyan-400" />
//                       <span className="truncate">{selectedPdf ? 'Replace PDF' : 'Upload Your Textbook / Reference PDF'}</span>
//                     </button>
//                     <input
//                       ref={pdfInputRef}
//                       type="file"
//                       accept="application/pdf,.pdf"
//                       onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 <form onSubmit={handleSendQuery} className="relative">
//                   <input
//                     type="text" value={currentToolState.input} onChange={handleInputChange}
//                     placeholder={
//                       activeTab === 'Note Expander'
//                         ? 'Add instructions (optional)...'
//                         : activeTab === 'PDF Uploader'
//                           ? 'Add instructions (optional)...'
//                           : 'Ask anything (e.g. semiconductor physics, integration)...'
//                     }
//                     className="w-full pl-5 pr-14 py-4 rounded-2xl border border-slate-800 bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-2xl transition-all"
//                   />
//                   <button
//                     type="submit"
//                     disabled={
//                       loading ||
//                       (!currentToolState.input.trim() &&
//                         !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
//                         !(activeTab === 'PDF Uploader' && selectedPdf))
//                     }
//                     className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-45"
//                   >
//                     <Send className="w-4 h-4" />
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {showSaveModal && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
//             <div className="flex items-center justify-between border-b border-slate-800 pb-4">
//               <h3 className="text-sm font-extrabold flex items-center gap-2 text-white">
//                 <BookmarkPlus className="w-4 h-4 text-blue-400" /> Create New Personal Bookshelf
//               </h3>
//               <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <p className="text-slate-400">You do not have an active bookshelf selected. Name your new bookshelf to save this study material:</p>
//               <input
//                 type="text"
//                 value={newBookshelfName}
//                 onChange={(e) => setNewBookshelfName(e.target.value)}
//                 placeholder="e.g. Calculus Fundamentals, Physics Notes..."
//                 className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white outline-none font-medium focus:border-blue-500"
//               />
//             </div>

//             <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
//               <button onClick={() => setShowSaveModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">Cancel</button>
//               <button onClick={handleCreateNewBookshelfAndSave} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]">Create & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <SettingsModal
//         isOpen={isSettingsOpen}
//         onClose={() => setIsSettingsOpen(false)}
//       />
//     </div>
//   );
// }




// 5th edit

// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { Lightbulb, Send, Settings, FileText, HelpCircle, User, X, CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp, Menu, Sparkles } from 'lucide-react';
// import { secureFetch } from '@/utils/apiHelper';
// import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
// import SettingsModal from '@/components/SettingsModal';

// export default function DashboardPage() {

//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   const [activeTab, setActiveTab] = useState('Ask Anything');
//   const [showSettings, setShowSettings] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Mobile sidebar drawer state
//   const [toolStates, setToolStates] = useState({
//     'Ask Anything': { messages: [], input: '' },
//     'Note Expander': { messages: [], input: '' },
//     'PDF Uploader': { messages: [], input: '' },
//   });
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // --- USER PROFILE & THEME STATES ---
//   const [userName, setUserName] = useState('MIR SHAHARYAR');
//   const [tempName, setTempName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [themeMode, setThemeMode] = useState('dark');

//   // --- PERSONAL BOOKSHELF STATES ---
//   const [bookshelves, setBookshelves] = useState([]);
//   const [activeBookshelfId, setActiveBookshelfId] = useState(null);
//   const [viewingBookshelf, setViewingBookshelf] = useState(null); // For opening a specific bookshelf in library
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [pendingItemToSave, setPendingItemToSave] = useState(null);
//   const [newBookshelfName, setNewBookshelfName] = useState('');

//   // --- MOCK TEST STATES ---
//   const [savedTests, setSavedTests] = useState([]);
//   const [testHistories, setTestHistories] = useState({});
//   const [activeTest, setActiveTest] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [testResult, setTestResult] = useState(null);

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD STATES ---
//   const [noteExpanderImages, setNoteExpanderImages] = useState([]); // [{ id, name, base64 }]
//   const [isDraggingOver, setIsDraggingOver] = useState(false);
//   const noteImageInputRef = useRef(null);

//   // --- PDF UPLOADER: SINGLE PDF (TEXTBOOK) UPLOAD STATES ---
//   const [selectedPdf, setSelectedPdf] = useState(null); // { name, size, base64 }
//   const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
//   const pdfInputRef = useRef(null);

//   // --- AUTH GUARD ---
//   useEffect(() => {
//     setMounted(true);
//     const token = localStorage.getItem('token');
//     if (!token) {
//       router.push('/'); // Agar token nahi hai toh baghair login ke dashboard khulne hi nahi dega
//     }
//   }, [router]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedTests = localStorage.getItem('buitems_mock_tests');
//       const storedHistories = localStorage.getItem('buitems_test_histories');
//       const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
//       const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
//       const storedName = localStorage.getItem('buitems_user_name');
//       const storedTheme = localStorage.getItem('buitems_theme_mode');

//       if (storedTests) setSavedTests(JSON.parse(storedTests));
//       if (storedHistories) setTestHistories(JSON.parse(storedHistories));
//       if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
//       if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
//       if (storedName) {
//         setUserName(storedName);
//         setTempName(storedName);
//       }
//       if (storedTheme) setThemeMode(storedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [toolStates, activeTab, loading]);

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], input: val }
//     }));
//   };

//   // Profile Name Update
//   const handleSaveName = () => {
//     if (!tempName.trim()) return;
//     setUserName(tempName.trim());
//     localStorage.setItem('buitems_user_name', tempName.trim());
//     setIsEditingName(false);
//   };

//   // Theme Toggle
//   const handleToggleTheme = () => {
//     const newTheme = themeMode === 'dark' ? 'light' : 'dark';
//     setThemeMode(newTheme);
//     localStorage.setItem('buitems_theme_mode', newTheme);
//   };

//   // Logout Handler
//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       localStorage.clear();
//       window.location.reload();
//     }
//   };

//   // --- BOOKSHELF LOGIC ---
//   const handleTriggerSave = (msgText, queryText) => {
//     if (!activeBookshelfId) {
//       // No active bookshelf, prompt user to create one
//       setPendingItemToSave({ text: msgText, title: queryText });
//       setNewBookshelfName(queryText || 'My Study Notes');
//       setShowSaveModal(true);
//     } else {
//       // Active bookshelf exists, save directly into it
//       saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
//     }
//   };

//   const handleCreateNewBookshelfAndSave = () => {
//     if (!newBookshelfName.trim()) return;
//     const shelfId = Date.now().toString();
//     const newShelf = {
//       id: shelfId,
//       title: newBookshelfName.trim(),
//       date: new Date().toLocaleDateString(),
//       items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
//     };

//     const updatedShelves = [newShelf, ...bookshelves];
//     setBookshelves(updatedShelves);
//     setActiveBookshelfId(shelfId);

//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     localStorage.setItem('buitems_active_bookshelf_id', shelfId);

//     setShowSaveModal(false);
//     setPendingItemToSave(null);
//     setNewBookshelfName('');
//     alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
//   };

//   const saveItemToBookshelf = (shelfId, item) => {
//     const updatedShelves = bookshelves.map(shelf => {
//       if (shelf.id === shelfId) {
//         return { ...shelf, items: [item, ...shelf.items] };
//       }
//       return shelf;
//     });
//     setBookshelves(updatedShelves);
//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     alert("Successfully saved to your active bookshelf!");
//   };

//   const handleDeleteBookshelf = (e, shelfId) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this bookshelf?")) {
//       const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
//       setBookshelves(updatedShelves);
//       localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//       if (activeBookshelfId === shelfId) {
//         setActiveBookshelfId(null);
//         localStorage.removeItem('buitems_active_bookshelf_id');
//       }
//       if (viewingBookshelf && viewingBookshelf.id === shelfId) {
//         setViewingBookshelf(null);
//       }
//     }
//   };

//   const handleClearAllBookshelves = () => {
//     if (window.confirm("Are you sure you want to delete all bookshelves?")) {
//       setBookshelves([]);
//       setActiveBookshelfId(null);
//       setViewingBookshelf(null);
//       localStorage.removeItem('buitems_personal_bookshelves');
//       localStorage.removeItem('buitems_active_bookshelf_id');
//     }
//   };

//   // --- MOCK TEST LOGIC ---
//   const handleDeleteTest = (e, testId) => {
//     e.stopPropagation();
//     const updatedTests = savedTests.filter(t => t.id !== testId);
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     if (activeTest && activeTest.id === testId) setActiveTest(null);
//   };

//   const handleClearAllTests = () => {
//     if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
//       setSavedTests([]);
//       localStorage.removeItem('buitems_mock_tests');
//       setActiveTest(null);
//     }
//   };

//   const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
//     const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

//     try {
//       if (typeof rawText === 'string') {
//         let cleaned = rawText.trim();
//         const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (match) cleaned = match[1].trim();

//         const firstBracket = cleaned.indexOf('[');
//         const lastBracket = cleaned.lastIndexOf(']');
//         if (firstBracket !== -1 && lastBracket !== -1) {
//           cleaned = cleaned.substring(firstBracket, lastBracket + 1);
//         }

//         const parsed = JSON.parse(cleaned);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const validQuestions = parsed.map(q => ({
//             question: q.question || "Sample Question?",
//             options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
//             correct: typeof q.correct === 'number' ? q.correct : 0,
//             topic: q.topic || topicName
//           }));

//           const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
//           const updatedTests = [newTest, ...savedTests];
//           setSavedTests(updatedTests);
//           localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//           setActiveTest(newTest);
//           setActiveTab('Mock Tests');
//           return;
//         }
//       }
//     } catch (err) {
//       console.warn("JSON parse error caught safely, switching to dynamic fallback test:", err);
//     }

//     const fallbackQuestions = [];
//     for (let i = 1; i <= 50; i++) {
//       fallbackQuestions.push({
//         question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
//         options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
//         correct: 0,
//         topic: topicName
//       });
//     }

//     const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
//     const updatedTests = [fallbackTest, ...savedTests];
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     setActiveTest(fallbackTest);
//     setActiveTab('Mock Tests');
//   };

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD LOGIC ---
//   const handleImageUpload = (fileList) => {
//     const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
//     if (files.length === 0) return;

//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//           name: file.name,
//           base64: e.target.result,
//         };
//         setNoteExpanderImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (id) => {
//     setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingOver(false);
//     if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
//   };

//   // --- PDF UPLOADER: SINGLE PDF (TEXTBOOK) UPLOAD LOGIC ---
//   const formatFileSize = (bytes) => {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   const handlePdfUpload = (fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
//     if (!isPdf) {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setSelectedPdf({
//         name: file.name,
//         size: file.size,
//         base64: e.target.result,
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePdf = () => setSelectedPdf(null);

//   const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
//   const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
//   const handlePdfDrop = (e) => {
//     e.preventDefault();
//     setIsPdfDraggingOver(false);
//     if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
//   };

//   const handleSendQuery = async (e) => {
//     e.preventDefault();
//     const queryText = currentToolState.input.trim();
//     const isNoteExpander = activeTab === 'Note Expander';
//     const isPdfUploader = activeTab === 'PDF Uploader';
//     const hasImages = isNoteExpander && noteExpanderImages.length > 0;
//     const hasPdf = isPdfUploader && !!selectedPdf;

//     if ((!queryText && !hasImages && !hasPdf) || loading) return;

//     const userMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       text: queryText || (hasImages
//         ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
//         : hasPdf
//           ? `📄 Uploaded ${selectedPdf.name}`
//           : '')
//     };
    
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
//     }));
//     setLoading(true);

//     try {
//       let finalQuery = queryText;
//       const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

//       const lowerQuery = queryText.toLowerCase();
//       const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
//       const previousMessages = toolStates[activeTab]?.messages || [];
      
//       if (hasPronoun && previousMessages.length > 0) {
//         const lastMsg = previousMessages[previousMessages.length - 1];
//         const contextTopic = lastMsg.queryContext || lastMsg.text || '';
//         if (contextTopic) {
//           finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
//         }
//       }

//       if (isMockReq && activeTab === 'Ask Anything') {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
//       }

//       if (isNoteExpander) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: The attached images contain a student's incomplete or rough handwritten class notes. Read the images carefully, then: (1) rewrite and expand the notes into complete, well-structured study notes covering the full topic; (2) add a separate "Corrections & Gaps" section that explicitly flags any factual mistakes, conceptual errors, or missing information found in the original notes.]`;
//       }

//       if (isPdfUploader) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: The attached PDF is a full textbook, chapter, or reference document. Carefully read through the entire document and produce comprehensive, well-structured study notes covering: (1) a chapter-by-chapter or section-by-section summary of key concepts; (2) all important formulas, definitions, and terminology explicitly called out; (3) a clear, organized outline suitable for exam revision. If the user specified a chapter or topic focus in their instructions, prioritize that section while still noting other relevant content in brief.]`;
//       }

//       let endpoint = 'http://localhost:5000/api/ai/ask-anything';
//       if (activeTab === 'Note Expander') endpoint = 'http://localhost:5000/api/ai/expand-notes';
//       else if (activeTab === 'PDF Uploader') endpoint = 'http://localhost:5000/api/ai/pdf-analysis';

//       const payload = { prompt: finalQuery, tool: activeTab };
//       if (hasImages) {
//         payload.images = noteExpanderImages.map(img => img.base64);
//       }
//       if (hasPdf) {
//         payload.pdf = selectedPdf.base64;
//         payload.pdfName = selectedPdf.name;
//       }

//       const response = await secureFetch(endpoint, {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       if (!response) {
//         setLoading(false);
//         return;
//       }

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to process AI generation request.');
//       }

//       const rawContent = data.result || data.text || data.content || JSON.stringify(data);

//       if (isMockReq) {
//         extractAndSavedMockTestSafe(rawContent, queryText);
//         setLoading(false);
//         return;
//       }

//       const aiResponse = { 
//         id: (Date.now() + 1).toString(), 
//         sender: 'ai', 
//         result: rawContent, 
//         text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
//         queryContext: queryText 
//       };

//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
//       }));

//       if (hasImages) setNoteExpanderImages([]);
//       if (hasPdf) setSelectedPdf(null);

//     } catch (err) {
//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { 
//           ...prev[activeTab], 
//           messages: [...prev[activeTab].messages, { 
//             id: Date.now().toString(), 
//             sender: 'ai', 
//             text: `Error: ${err.message}` 
//           }] 
//         }
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOptionSelect = (qIdx, optIdx) => {
//     setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
//   };

//   const handleSubmitTest = () => {
//     let score = 0;
//     let weakTopicsMap = [];

//     activeTest.questions.forEach((q, idx) => {
//       if (selectedAnswers[idx] === q.correct) score += 1;
//       else weakTopicsMap.push(q.topic || activeTest.title);
//     });

//     const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
//     const weakTopics = [...new Set(weakTopicsMap)];
//     const previousHistory = testHistories[activeTest.id];
//     let comparisonMessage = "This is your first attempt.";
//     let statusColor = "text-slate-400";

//     if (previousHistory) {
//       if (percentage > previousHistory.lastPercentage) {
//         comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-emerald-400";
//       } else if (percentage < previousHistory.lastPercentage) {
//         comparisonMessage = `Degraded. Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-rose-400";
//       } else {
//         comparisonMessage = `Consistent performance at ${percentage}%.`;
//         statusColor = "text-blue-400";
//       }
//     }

//     const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
//     setTestResult(resultObj);
//     const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
//     setTestHistories(updatedHistory);
//     localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
//   };

//   const handleRetakeTest = () => {
//     const shuffledQuestions = activeTest.questions.map(q => {
//       const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
//       optionsWithIndex.sort(() => Math.random() - 0.5);
//       return {
//         ...q,
//         options: optionsWithIndex.map(o => o.text),
//         correct: optionsWithIndex.findIndex(o => o.isCorrect)
//       };
//     });
//     setActiveTest({ ...activeTest, questions: shuffledQuestions });
//     setSelectedAnswers({});
//     setTestResult(null);
//     setCurrentQuestionIndex(0);
//   };

//   const handleExitTest = () => {
//     setActiveTest(null);
//     setTestResult(null);
//     setSelectedAnswers({});
//     setCurrentQuestionIndex(0);
//   };

//   const handleResetSession = () => {
//     setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
//     setActiveBookshelfId(null);
//     localStorage.removeItem('buitems_active_bookshelf_id');
//     setNoteExpanderImages([]);
//     setSelectedPdf(null);
//   };

//   const currentToolState = toolStates[activeTab] || { messages: [], input: '' };
//   const isDark = themeMode === 'dark';
//   const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

//   if (!mounted) return null;

//   return (
//     <div className="flex h-[100dvh] bg-slate-950 text-slate-100 font-sans overflow-hidden relative selection:bg-blue-500 selection:text-white">
      
//       {/* Background Ambient Glow */}
//       <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

//       {/* Mobile Sidebar Overlay Backdrop */}
//       {isMobileSidebarOpen && (
//         <div 
//           onClick={() => setIsMobileSidebarOpen(false)}
//           className="fixed inset-0 bg-black/70 z-20 md:hidden backdrop-blur-sm transition-opacity"
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`fixed md:relative inset-y-0 left-0 z-30 w-72 border-r border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
//         <div>
//           {/* Logo / Brand Header */}
//           <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-slate-800/80">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white">
//                 <Sparkles className="w-5 h-5 animate-pulse" />
//               </div>
//               <div>
//                 <h1 className="text-sm font-extrabold tracking-wider text-white">BUITEMS Study AI</h1>
//                 <p className="text-[10px] text-blue-400 font-medium tracking-widest uppercase truncate max-w-[120px]">{userName}</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setIsMobileSidebarOpen(false)}
//               className="md:hidden text-slate-400 hover:text-white p-1"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">Tools</div>
//           <nav className="space-y-1">
//             {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
//                       : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
//                   }`}
//                 >
//                   <FileText className="w-4 h-4" /> {name}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mt-6 mb-2">Library & Assessment</div>
//           <nav className="space-y-1">
//             {['Personal Bookshelf', 'Mock Tests'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
//                     isActive
//                       ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
//                       : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
//                   }`}
//                 >
//                   <HelpCircle className="w-4 h-4" /> {name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         <div className="pt-4 border-t border-slate-800/80">
//           <button
//             onClick={() => { setIsSettingsOpen(true); setIsMobileSidebarOpen(false); }}
//             className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all w-full"
//           >
//             <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow">
//               <Settings className="w-3.5 h-3.5" />
//             </div>
//             <span>Settings & Profile</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <main className="flex-1 flex flex-col justify-between bg-slate-950 relative z-10 overflow-hidden w-full">
//         <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
//           <div className="flex items-center gap-3 min-w-0">
//             <button
//               onClick={() => setIsMobileSidebarOpen(true)}
//               className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 shrink-0"
//               title="Open Menu"
//             >
//               <Menu className="w-4 h-4" />
//             </button>
//             <span className="px-3.5 py-1.5 rounded-full border border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
//               Session: <span className="text-blue-400">{activeTab}</span>
//             </span>
//             {activeBookshelfId && activeTab === 'Ask Anything' && (
//               <span className="hidden lg:inline-block text-[11px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1 rounded-full truncate max-w-[220px]">
//                 Active Shelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
//               </span>
//             )}
//           </div>
//           {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
//             <button 
//               onClick={handleResetSession} 
//               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-all shrink-0 ml-2"
//             >
//               <RefreshCcw className="w-3.5 h-3.5 text-blue-400" />
//               <span>Reset</span>
//             </button>
//           )}
//         </header>

//         {/* ================= PERSONAL BOOKSHELF PAGE ================= */}
//         {activeTab === 'Personal Bookshelf' ? (
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!viewingBookshelf ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-white">My Personal Bookshelf</h2>
//                     <p className="text-xs text-slate-400 mt-1">Manage your saved study modules and topic notes.</p>
//                   </div>
//                   {bookshelves.length > 0 && (
//                     <button
//                       onClick={handleClearAllBookshelves}
//                       className="px-3.5 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto shadow"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
//                     </button>
//                   )}
//                 </div>

//                 {bookshelves.length === 0 ? (
//                   <div className="p-16 border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-3xl text-center space-y-4 shadow-2xl">
//                     <BookOpen className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
//                     <h3 className="text-lg font-bold text-slate-300">No bookshelves created yet.</h3>
//                     <p className="text-xs text-slate-400 max-w-sm mx-auto">
//                       Go to <span className="text-blue-400 font-semibold">Ask Anything</span>, generate study notes, and click <span className="text-amber-400 font-semibold">"Save to Bookshelf"</span> to build your custom library.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {bookshelves.map((shelf) => (
//                       <div
//                         key={shelf.id}
//                         onClick={() => setViewingBookshelf(shelf)}
//                         className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between h-48 transition-all shadow-xl hover:border-blue-500/40 cursor-pointer group relative"
//                       >
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-white capitalize pr-6 flex items-center gap-2">
//                               <BookOpen className="w-4 h-4 text-blue-400" /> {shelf.title}
//                             </h3>
//                             <button
//                               onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
//                               title="Delete Bookshelf"
//                               className="text-slate-500 hover:text-red-400 p-1 transition-colors"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-slate-500 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
//                         </div>
//                         <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
//                           <span className={`text-[11px] font-semibold ${activeBookshelfId === shelf.id ? 'text-emerald-400' : 'text-slate-500'}`}>
//                             {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
//                           </span>
//                           <span className="px-3.5 py-1.5 bg-blue-600 group-hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
//                             Open Shelf <ArrowRight className="w-3.5 h-3.5" />
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
//                   <div>
//                     <button onClick={() => setViewingBookshelf(null)} className="text-xs text-blue-400 hover:underline mb-1">← Back to All Bookshelves</button>
//                     <h2 className="text-lg font-extrabold text-white capitalize flex items-center gap-2">
//                       <BookOpen className="w-5 h-5 text-blue-400" /> {viewingBookshelf.title}
//                     </h2>
//                     <p className="text-xs text-slate-400 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setActiveBookshelfId(viewingBookshelf.id);
//                       localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
//                       alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
//                     }}
//                     className={`px-4 py-2 rounded-xl text-xs font-bold self-start sm:self-auto transition-all ${activeBookshelfId === viewingBookshelf.id ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'}`}
//                   >
//                     {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
//                   </button>
//                 </div>

//                 {viewingBookshelf.items.length === 0 ? (
//                   <div className="p-12 border border-slate-800 bg-slate-900/40 border-dashed rounded-2xl text-center text-slate-400">
//                     <p className="text-sm">No items saved in this bookshelf yet.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {viewingBookshelf.items.map((item, idx) => (
//                       <div key={idx} className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 shadow-xl">
//                         <div className="flex items-center justify-between border-b border-slate-800 pb-3">
//                           <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Topic: {item.title || viewingBookshelf.title}</h4>
//                           <span className="text-[10px] text-slate-500">{item.date}</span>
//                         </div>
//                         <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
//                           {item.text}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ) : activeTab === 'Mock Tests' ? (
//           /* ================= MOCK TESTS PAGE ================= */
//           <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full">
//             {!activeTest ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className="text-2xl font-extrabold text-white">Saved Mock Tests</h2>
//                     <p className="text-xs text-slate-400 mt-1">All generated test files are safely stored here for exam practice.</p>
//                   </div>
//                   {savedTests.length > 0 && (
//                     <button
//                       onClick={handleClearAllTests}
//                       className="px-3.5 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto shadow"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
//                     </button>
//                   )}
//                 </div>

//                 {savedTests.length === 0 ? (
//                   <div className="p-16 border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-3xl text-center space-y-3 shadow-2xl">
//                     <HelpCircle className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
//                     <h3 className="text-lg font-bold text-slate-300">No mock tests available yet.</h3>
//                     <p className="text-xs text-slate-400 max-w-sm mx-auto">
//                       Ask anything or type <span className="text-blue-400 font-semibold">"generate quiz"</span> in <span className="text-slate-300 font-semibold">Ask Anything</span> to create tests.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {savedTests.map((test) => (
//                       <div key={test.id} className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between h-44 transition-all shadow-xl hover:border-cyan-500/40 group relative">
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className="text-sm font-bold text-white capitalize pr-6 truncate">{test.title}</h3>
//                             <button
//                               onClick={(e) => handleDeleteTest(e, test.id)}
//                               title="Delete Test"
//                               className="text-slate-500 hover:text-red-400 p-1 transition-colors shrink-0"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-slate-500 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
//                         </div>
//                         <button
//                           onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
//                           className="self-end px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-105 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
//                         >
//                           Open & Solve Test <ArrowRight className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTest && !testResult ? (
//               <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
//                 <div className="flex items-center justify-between border-b border-slate-800 pb-4">
//                   <div className="min-w-0 pr-2">
//                     <h2 className="text-base font-extrabold text-white capitalize truncate">{activeTest.title}</h2>
//                     <p className="text-xs text-slate-400 mt-0.5">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
//                   </div>
//                   <button onClick={handleExitTest} className="text-xs text-slate-400 hover:text-white underline shrink-0">Exit to Library</button>
//                 </div>

//                 <div className="space-y-4">
//                   <p className="text-sm font-semibold text-slate-200 leading-relaxed">{activeTest.questions[currentQuestionIndex].question}</p>
//                   <div className="space-y-2.5">
//                     {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
//                         className={`w-full text-left px-4.5 py-3 rounded-xl text-xs transition-all border ${
//                           selectedAnswers[currentQuestionIndex] === oIdx
//                             ? 'bg-blue-600/20 text-blue-300 font-bold border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
//                             : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex justify-between items-center pt-4 border-t border-slate-800">
//                   <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40">Previous</button>
//                   {currentQuestionIndex < activeTest.questions.length - 1 ? (
//                     <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]">Next Question</button>
//                   ) : (
//                     <button onClick={handleSubmitTest} className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 text-white text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]">Submit Test</button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-6 backdrop-blur-xl">
//                 <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
//                       <CheckCircle2 className="w-5 h-5" />
//                     </div>
//                     <h2 className="text-base font-extrabold text-white capitalize truncate">{activeTest.title} - Results</h2>
//                   </div>
//                   <span className={`text-xs font-bold ${testResult.statusColor} bg-slate-950 border border-slate-800 px-4 py-2 rounded-full self-start sm:self-auto shadow`}>
//                     {testResult.comparisonMessage}
//                   </span>
//                 </div>

//                 <div className="px-6 pb-8">
//                   <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
//                     <table className="w-full text-left text-sm">
//                       <thead className="bg-slate-900/80 text-xs uppercase font-mono text-slate-400">
//                         <tr>
//                           <th className="px-5 py-3.5 border-b border-slate-800">Evaluation Metric</th>
//                           <th className="px-5 py-3.5 border-b border-slate-800">Details</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-slate-800 text-slate-300 text-xs">
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white">Total Score</td>
//                           <td className="px-5 py-4">{testResult.score} / {testResult.total}</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white">Percentage Obtained</td>
//                           <td className="px-5 py-4 font-mono font-extrabold text-cyan-400 text-sm">{testResult.percentage}%</td>
//                         </tr>
//                         <tr>
//                           <td className="px-5 py-4 font-semibold text-white align-top">Weak Topics / Improvement Needed</td>
//                           <td className="px-5 py-4">
//                             {testResult.weakTopics.length > 0 ? (
//                               <ul className="list-disc list-inside text-rose-400 space-y-1">
//                                 {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
//                               </ul>
//                             ) : (
//                               <span className="text-emerald-400 font-semibold">Brilliant! All answers were correct.</span>
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//                     <button onClick={handleExitTest} className="text-xs text-slate-400 hover:text-white underline underline-offset-2 self-start sm:self-auto">
//                       ← Back to Saved Mock Tests
//                     </button>
//                     <button onClick={handleRetakeTest} className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto border border-slate-700 shadow">
//                       <RefreshCcw className="w-4 h-4 text-blue-400" /> Retake Test (Shuffled Questions)
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           /* ================= NORMAL CHAT VIEW WITH SAVE BUTTON ON RESPONSES ================= */
//           <>
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {currentToolState.messages.length === 0 ? (
//                 <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 max-w-sm mx-auto space-y-3 px-4 py-20">
//                   <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)]">
//                     <Sparkles className="w-8 h-8 animate-pulse" />
//                   </div>
//                   <h2 className="text-lg font-bold text-white">
//                     {activeTab === 'Note Expander'
//                       ? 'Upload rough lecture notes or scribbled bullet points'
//                       : activeTab === 'PDF Uploader'
//                         ? 'Upload your reference textbook or course handbook'
//                         : 'Ask anything or type "generate quiz"'}
//                   </h2>
//                   <p className="text-xs text-slate-400">
//                     {activeTab === 'Note Expander'
//                       ? 'Upload photos of your rough notes below, then ask anything to expand and correct them!'
//                       : activeTab === 'PDF Uploader'
//                         ? 'Upload your full textbook or reference PDF below, then ask anything to generate complete study notes!'
//                         : 'Get instant academic explanations tailored for BUITEMS university exams.'
//                     }
//                   </p>
//                 </div>
//               ) : (
//                 currentToolState.messages.map((msg) => (
//                   msg.sender === 'user' ? (
//                     <div key={msg.id} className="flex justify-end w-full">
//                       <div className="max-w-[90%] sm:max-w-[80%] bg-blue-600 text-white border border-blue-500/40 px-5 py-3.5 rounded-2xl rounded-br-none text-sm flex items-start gap-3 shadow-[0_0_20px_rgba(59,130,246,0.25)]">
//                         <span className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</span>
//                         <div className="p-1 rounded-full bg-blue-700 text-white shrink-0 mt-0.5"><User className="w-3.5 h-3.5" /></div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div key={msg.id} className="space-y-2">
//                       <div className="flex justify-start">
//                         <button
//                           onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
//                           className="px-3.5 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
//                         >
//                           <BookmarkPlus className="w-3.5 h-3.5" /> Save to Bookshelf
//                         </button>
//                       </div>
//                       <StructuredResponseRenderer message={msg} />
//                     </div>
//                   )
//                 ))
//               )}
//               {loading && (
//                 <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 w-fit text-xs text-blue-400 animate-pulse flex items-center gap-2 shadow-xl">
//                   <Sparkles className="w-4 h-4 animate-spin" /> AI is formulating response & study materials...
//                 </div>
//               )}
//               <div ref={chatEndRef} />
//             </div>

//             <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800/80">
//               <div className="max-w-4xl mx-auto space-y-3">

//                 {/* Note Expander: multi-image dropzone */}
//                 {activeTab === 'Note Expander' && (
//                   <div
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-slate-900/40 ${
//                       isDraggingOver
//                         ? 'border-blue-500 bg-blue-500/10'
//                         : 'border-slate-800 hover:border-blue-500/40'
//                     }`}
//                   >
//                     {noteExpanderImages.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         {noteExpanderImages.map((img) => (
//                           <div key={img.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 group shadow">
//                             <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(img.id)}
//                               className="absolute top-1 right-1 bg-black/80 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
//                               title="Remove image"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => noteImageInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-800 bg-slate-900/80"
//                     >
//                       <ImagePlus className="w-4 h-4 text-blue-400" />
//                       <span className="truncate">{noteExpanderImages.length > 0 ? 'Add More Photos of Notes' : 'Upload Photos of Your Notes (multiple allowed)'}</span>
//                     </button>
//                     <input
//                       ref={noteImageInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {/* PDF Uploader: single textbook PDF dropzone */}
//                 {activeTab === 'PDF Uploader' && (
//                   <div
//                     onDragOver={handlePdfDragOver}
//                     onDragLeave={handlePdfDragLeave}
//                     onDrop={handlePdfDrop}
//                     className={`rounded-2xl border border-dashed transition-all p-4 bg-slate-900/40 ${
//                       isPdfDraggingOver
//                         ? 'border-cyan-500 bg-cyan-500/10'
//                         : 'border-slate-800 hover:border-cyan-500/40'
//                     }`}
//                   >
//                     {selectedPdf ? (
//                       <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900 mb-3 shadow">
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
//                             <FileText className="w-5 h-5" />
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-xs font-bold truncate text-slate-200">{selectedPdf.name}</p>
//                             <p className="text-[10px] text-slate-500">{formatFileSize(selectedPdf.size)}</p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removePdf}
//                           title="Remove PDF"
//                           className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg transition-colors shrink-0"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => pdfInputRef.current?.click()}
//                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-800 bg-slate-900/80"
//                     >
//                       <FileUp className="w-4 h-4 text-cyan-400" />
//                       <span className="truncate">{selectedPdf ? 'Replace PDF' : 'Upload Your Textbook / Reference PDF'}</span>
//                     </button>
//                     <input
//                       ref={pdfInputRef}
//                       type="file"
//                       accept="application/pdf,.pdf"
//                       onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 <form onSubmit={handleSendQuery} className="relative">
//                   <input
//                     type="text" value={currentToolState.input} onChange={handleInputChange}
//                     placeholder={
//                       activeTab === 'Note Expander'
//                         ? 'Add instructions (optional)...'
//                         : activeTab === 'PDF Uploader'
//                           ? 'Add instructions (optional)...'
//                           : 'Ask anything (e.g. semiconductor physics, integration)...'
//                     }
//                     className="w-full pl-5 pr-14 py-4 rounded-2xl border border-slate-800 bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-2xl transition-all"
//                   />
//                   <button
//                     type="submit"
//                     disabled={
//                       loading ||
//                       (!currentToolState.input.trim() &&
//                         !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
//                         !(activeTab === 'PDF Uploader' && selectedPdf))
//                     }
//                     className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-45"
//                   >
//                     <Send className="w-4 h-4" />
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* Save to Bookshelf Prompt Modal */}
//       {showSaveModal && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
//             <div className="flex items-center justify-between border-b border-slate-800 pb-4">
//               <h3 className="text-sm font-extrabold flex items-center gap-2 text-white">
//                 <BookmarkPlus className="w-4 h-4 text-blue-400" /> Create New Personal Bookshelf
//               </h3>
//               <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <p className="text-slate-400">You do not have an active bookshelf selected. Name your new bookshelf to save this study material:</p>
//               <input
//                 type="text"
//                 value={newBookshelfName}
//                 onChange={(e) => setNewBookshelfName(e.target.value)}
//                 placeholder="e.g. Calculus Fundamentals, Physics Notes..."
//                 className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white outline-none font-medium focus:border-blue-500"
//               />
//             </div>

//             <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
//               <button onClick={() => setShowSaveModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">Cancel</button>
//               <button onClick={handleCreateNewBookshelfAndSave} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]">Create & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* External SettingsModal Component */}
//       <SettingsModal
//         isOpen={isSettingsOpen}
//         onClose={() => setIsSettingsOpen(false)}
//       />
//     </div>
//   );
// }



//4th edit

// 'use client'
// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { Lightbulb, Send, Settings, FileText, HelpCircle, User, X, CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp, Menu } from 'lucide-react';
// import { secureFetch } from '@/utils/apiHelper';
// import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
// import SettingsModal from '@/components/SettingsModal';

// export default function DashboardPage() {

//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   const [activeTab, setActiveTab] = useState('Ask Anything');
//   const [showSettings, setShowSettings] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Mobile sidebar drawer state
//   const [toolStates, setToolStates] = useState({
//     'Ask Anything': { messages: [], input: '' },
//     'Note Expander': { messages: [], input: '' },
//     'PDF Uploader': { messages: [], input: '' },
//   });
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // --- USER PROFILE & THEME STATES ---
//   const [userName, setUserName] = useState('MIR SHAHARYAR');
//   const [tempName, setTempName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [themeMode, setThemeMode] = useState('dark');

//   // --- PERSONAL BOOKSHELF STATES ---
//   const [bookshelves, setBookshelves] = useState([]);
//   const [activeBookshelfId, setActiveBookshelfId] = useState(null);
//   const [viewingBookshelf, setViewingBookshelf] = useState(null); // For opening a specific bookshelf in library
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [pendingItemToSave, setPendingItemToSave] = useState(null);
//   const [newBookshelfName, setNewBookshelfName] = useState('');

//   // --- MOCK TEST STATES ---
//   const [savedTests, setSavedTests] = useState([]);
//   const [testHistories, setTestHistories] = useState({});
//   const [activeTest, setActiveTest] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [testResult, setTestResult] = useState(null);

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD STATES ---
//   const [noteExpanderImages, setNoteExpanderImages] = useState([]); // [{ id, name, base64 }]
//   const [isDraggingOver, setIsDraggingOver] = useState(false);
//   const noteImageInputRef = useRef(null);

//   // --- PDF UPLOADER: SINGLE PDF (TEXTBOOK) UPLOAD STATES ---
//   const [selectedPdf, setSelectedPdf] = useState(null); // { name, size, base64 }
//   const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
//   const pdfInputRef = useRef(null);

//   // --- AUTH GUARD ---
//   useEffect(() => {
//     setMounted(true);
//     const token = localStorage.getItem('token');
//     if (!token) {
//       router.push('/'); // Agar token nahi hai toh baghair login ke dashboard khulne hi nahi dega
//     }
//   }, [router]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedTests = localStorage.getItem('buitems_mock_tests');
//       const storedHistories = localStorage.getItem('buitems_test_histories');
//       const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
//       const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
//       const storedName = localStorage.getItem('buitems_user_name');
//       const storedTheme = localStorage.getItem('buitems_theme_mode');

//       if (storedTests) setSavedTests(JSON.parse(storedTests));
//       if (storedHistories) setTestHistories(JSON.parse(storedHistories));
//       if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
//       if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
//       if (storedName) {
//         setUserName(storedName);
//         setTempName(storedName);
//       }
//       if (storedTheme) setThemeMode(storedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [toolStates, activeTab, loading]);

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], input: val }
//     }));
//   };

//   // Profile Name Update
//   const handleSaveName = () => {
//     if (!tempName.trim()) return;
//     setUserName(tempName.trim());
//     localStorage.setItem('buitems_user_name', tempName.trim());
//     setIsEditingName(false);
//   };

//   // Theme Toggle
//   const handleToggleTheme = () => {
//     const newTheme = themeMode === 'dark' ? 'light' : 'dark';
//     setThemeMode(newTheme);
//     localStorage.setItem('buitems_theme_mode', newTheme);
//   };

//   // Logout Handler
//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       localStorage.clear();
//       window.location.reload();
//     }
//   };

//   // --- BOOKSHELF LOGIC ---
//   const handleTriggerSave = (msgText, queryText) => {
//     if (!activeBookshelfId) {
//       // No active bookshelf, prompt user to create one
//       setPendingItemToSave({ text: msgText, title: queryText });
//       setNewBookshelfName(queryText || 'My Study Notes');
//       setShowSaveModal(true);
//     } else {
//       // Active bookshelf exists, save directly into it
//       saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
//     }
//   };

//   const handleCreateNewBookshelfAndSave = () => {
//     if (!newBookshelfName.trim()) return;
//     const shelfId = Date.now().toString();
//     const newShelf = {
//       id: shelfId,
//       title: newBookshelfName.trim(),
//       date: new Date().toLocaleDateString(),
//       items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
//     };

//     const updatedShelves = [newShelf, ...bookshelves];
//     setBookshelves(updatedShelves);
//     setActiveBookshelfId(shelfId);

//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     localStorage.setItem('buitems_active_bookshelf_id', shelfId);

//     setShowSaveModal(false);
//     setPendingItemToSave(null);
//     setNewBookshelfName('');
//     alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
//   };

//   const saveItemToBookshelf = (shelfId, item) => {
//     const updatedShelves = bookshelves.map(shelf => {
//       if (shelf.id === shelfId) {
//         return { ...shelf, items: [item, ...shelf.items] };
//       }
//       return shelf;
//     });
//     setBookshelves(updatedShelves);
//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     alert("Successfully saved to your active bookshelf!");
//   };

//   const handleDeleteBookshelf = (e, shelfId) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this bookshelf?")) {
//       const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
//       setBookshelves(updatedShelves);
//       localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//       if (activeBookshelfId === shelfId) {
//         setActiveBookshelfId(null);
//         localStorage.removeItem('buitems_active_bookshelf_id');
//       }
//       if (viewingBookshelf && viewingBookshelf.id === shelfId) {
//         setViewingBookshelf(null);
//       }
//     }
//   };

//   const handleClearAllBookshelves = () => {
//     if (window.confirm("Are you sure you want to delete all bookshelves?")) {
//       setBookshelves([]);
//       setActiveBookshelfId(null);
//       setViewingBookshelf(null);
//       localStorage.removeItem('buitems_personal_bookshelves');
//       localStorage.removeItem('buitems_active_bookshelf_id');
//     }
//   };

//   // --- MOCK TEST LOGIC ---
//   const handleDeleteTest = (e, testId) => {
//     e.stopPropagation();
//     const updatedTests = savedTests.filter(t => t.id !== testId);
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     if (activeTest && activeTest.id === testId) setActiveTest(null);
//   };

//   const handleClearAllTests = () => {
//     if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
//       setSavedTests([]);
//       localStorage.removeItem('buitems_mock_tests');
//       setActiveTest(null);
//     }
//   };

//   const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
//     const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

//     try {
//       if (typeof rawText === 'string') {
//         let cleaned = rawText.trim();
//         const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (match) cleaned = match[1].trim();

//         const firstBracket = cleaned.indexOf('[');
//         const lastBracket = cleaned.lastIndexOf(']');
//         if (firstBracket !== -1 && lastBracket !== -1) {
//           cleaned = cleaned.substring(firstBracket, lastBracket + 1);
//         }

//         const parsed = JSON.parse(cleaned);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const validQuestions = parsed.map(q => ({
//             question: q.question || "Sample Question?",
//             options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
//             correct: typeof q.correct === 'number' ? q.correct : 0,
//             topic: q.topic || topicName
//           }));

//           const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
//           const updatedTests = [newTest, ...savedTests];
//           setSavedTests(updatedTests);
//           localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//           setActiveTest(newTest);
//           setActiveTab('Mock Tests');
//           return;
//         }
//       }
//     } catch (err) {
//       console.warn("JSON parse error caught safely, switching to dynamic fallback test:", err);
//     }

//     const fallbackQuestions = [];
//     for (let i = 1; i <= 50; i++) {
//       fallbackQuestions.push({
//         question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
//         options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
//         correct: 0,
//         topic: topicName
//       });
//     }

//     const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
//     const updatedTests = [fallbackTest, ...savedTests];
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     setActiveTest(fallbackTest);
//     setActiveTab('Mock Tests');
//   };

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD LOGIC ---
//   const handleImageUpload = (fileList) => {
//     const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
//     if (files.length === 0) return;

//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//           name: file.name,
//           base64: e.target.result, // data:image/...;base64,...
//         };
//         setNoteExpanderImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (id) => {
//     setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingOver(false);
//     if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
//   };

//   // --- PDF UPLOADER: SINGLE PDF (TEXTBOOK) UPLOAD LOGIC ---
//   const formatFileSize = (bytes) => {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   const handlePdfUpload = (fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
//     if (!isPdf) {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setSelectedPdf({
//         name: file.name,
//         size: file.size,
//         base64: e.target.result, // data:application/pdf;base64,...
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePdf = () => setSelectedPdf(null);

//   const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
//   const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
//   const handlePdfDrop = (e) => {
//     e.preventDefault();
//     setIsPdfDraggingOver(false);
//     if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
//   };

//   const handleSendQuery = async (e) => {
//     e.preventDefault();
//     const queryText = currentToolState.input.trim();
//     const isNoteExpander = activeTab === 'Note Expander';
//     const isPdfUploader = activeTab === 'PDF Uploader';
//     const hasImages = isNoteExpander && noteExpanderImages.length > 0;
//     const hasPdf = isPdfUploader && !!selectedPdf;

//     if ((!queryText && !hasImages && !hasPdf) || loading) return; // allow attachment-only submits

//     const userMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       text: queryText || (hasImages
//         ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
//         : hasPdf
//           ? `📄 Uploaded ${selectedPdf.name}`
//           : '')
//     };
    
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
//     }));
//     setLoading(true);

//     try {
//       let finalQuery = queryText;
//       const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

//       // Smart Context Injection for short/ambiguous pronouns (e.g., "where its being used", "its types")
//       const lowerQuery = queryText.toLowerCase();
//       const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
//       const previousMessages = toolStates[activeTab]?.messages || [];
      
//       if (hasPronoun && previousMessages.length > 0) {
//         const lastMsg = previousMessages[previousMessages.length - 1];
//         const contextTopic = lastMsg.queryContext || lastMsg.text || '';
//         if (contextTopic) {
//           finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
//         }
//       }

//       if (isMockReq && activeTab === 'Ask Anything') {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
//       }

//       if (isNoteExpander) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: The attached images contain a student's incomplete or rough handwritten class notes. Read the images carefully, then: (1) rewrite and expand the notes into complete, well-structured study notes covering the full topic; (2) add a separate "Corrections & Gaps" section that explicitly flags any factual mistakes, conceptual errors, or missing information found in the original notes.]`;
//       }

//       if (isPdfUploader) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: The attached PDF is a full textbook, chapter, or reference document. Carefully read through the entire document and produce comprehensive, well-structured study notes covering: (1) a chapter-by-chapter or section-by-section summary of key concepts; (2) all important formulas, definitions, and terminology explicitly called out; (3) a clear, organized outline suitable for exam revision. If the user specified a chapter or topic focus in their instructions, prioritize that section while still noting other relevant content in brief.]`;
//       }

//       let endpoint = 'http://localhost:5000/api/ai/ask-anything';
//       if (activeTab === 'Note Expander') endpoint = 'http://localhost:5000/api/ai/expand-notes';
//       else if (activeTab === 'PDF Uploader') endpoint = 'http://localhost:5000/api/ai/pdf-analysis';

//       const payload = { prompt: finalQuery, tool: activeTab };
//       if (hasImages) {
//         payload.images = noteExpanderImages.map(img => img.base64);
//       }
//       if (hasPdf) {
//         payload.pdf = selectedPdf.base64;
//         payload.pdfName = selectedPdf.name;
//       }

//       const response = await secureFetch(endpoint, {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       if (!response) {
//         setLoading(false);
//         return; // Agar 401 hoga toh secureFetch khud hi redirect kar dega
//       }

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to process AI generation request.');
//       }

//       const rawContent = data.result || data.text || data.content || JSON.stringify(data);

//       if (isMockReq) {
//         extractAndSavedMockTestSafe(rawContent, queryText);
//         setLoading(false);
//         return;
//       }

//       const aiResponse = { 
//         id: (Date.now() + 1).toString(), 
//         sender: 'ai', 
//         result: rawContent, // Yeh structured object hai (definition, formula, explanation)
//         text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
//         queryContext: queryText 
//       };

//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
//       }));

//       if (hasImages) setNoteExpanderImages([]);
//       if (hasPdf) setSelectedPdf(null);

//     } catch (err) {
//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { 
//           ...prev[activeTab], 
//           messages: [...prev[activeTab].messages, { 
//             id: Date.now().toString(), 
//             sender: 'ai', 
//             text: `Error: ${err.message}` 
//           }] 
//         }
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOptionSelect = (qIdx, optIdx) => {
//     setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
//   };

//   const handleSubmitTest = () => {
//     let score = 0;
//     let weakTopicsMap = [];

//     activeTest.questions.forEach((q, idx) => {
//       if (selectedAnswers[idx] === q.correct) score += 1;
//       else weakTopicsMap.push(q.topic || activeTest.title);
//     });

//     const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
//     const weakTopics = [...new Set(weakTopicsMap)];
//     const previousHistory = testHistories[activeTest.id];
//     let comparisonMessage = "This is your first attempt.";
//     let statusColor = themeMode === 'dark' ? "text-zinc-400" : "text-zinc-600";

//     if (previousHistory) {
//       if (percentage > previousHistory.lastPercentage) {
//         comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-emerald-500";
//       } else if (percentage < previousHistory.lastPercentage) {
//         comparisonMessage = `Degraded. Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-red-500";
//       } else {
//         comparisonMessage = `Consistent performance at ${percentage}%.`;
//         statusColor = "text-amber-500";
//       }
//     }

//     const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
//     setTestResult(resultObj);
//     const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
//     setTestHistories(updatedHistory);
//     localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
//   };

//   const handleRetakeTest = () => {
//     const shuffledQuestions = activeTest.questions.map(q => {
//       const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
//       optionsWithIndex.sort(() => Math.random() - 0.5);
//       return {
//         ...q,
//         options: optionsWithIndex.map(o => o.text),
//         correct: optionsWithIndex.findIndex(o => o.isCorrect)
//       };
//     });
//     setActiveTest({ ...activeTest, questions: shuffledQuestions });
//     setSelectedAnswers({});
//     setTestResult(null);
//     setCurrentQuestionIndex(0);
//   };

//   const handleExitTest = () => {
//     setActiveTest(null);
//     setTestResult(null);
//     setSelectedAnswers({});
//     setCurrentQuestionIndex(0);
//   };

//   const handleResetSession = () => {
//     setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
//     setActiveBookshelfId(null);
//     localStorage.removeItem('buitems_active_bookshelf_id');
//     setNoteExpanderImages([]);
//     setSelectedPdf(null);
//   };

//   const currentToolState = toolStates[activeTab] || { messages: [], input: '' };
//   const isDark = themeMode === 'dark';
//   const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

//   if (!mounted) return null; // avoid flashing the dashboard before the auth check runs

//   return (
//     <div className={`flex h-[100dvh] ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} font-sans overflow-hidden relative transition-colors`}>
      
//       {/* Mobile Sidebar Overlay Backdrop */}
//       {isMobileSidebarOpen && (
//         <div 
//           onClick={() => setIsMobileSidebarOpen(false)}
//           className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-xs transition-opacity"
//         />
//       )}

//       {/* Sidebar (Responsive: Drawer on mobile, Fixed flex on desktop) */}
//       <aside className={`fixed md:relative inset-y-0 left-0 z-30 w-64 border-r ${isDark ? 'border-zinc-800/80 bg-zinc-900 md:bg-zinc-900/40' : 'border-zinc-200 bg-white'} flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
//         <div>
//           <div className="flex items-center justify-between px-2 py-3 mb-6">
//             <div className="flex items-center gap-3">
//               <div className={`p-2 rounded-xl ${isDark ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'} font-bold`}>
//                 <Lightbulb className="w-5 h-5" />
//               </div>
//               <div>
//                 <h1 className="text-sm font-bold tracking-tight">BUITEMS Study AI</h1>
//                 <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'} uppercase font-mono truncate max-w-[110px]`}>{userName}</p>
//               </div>
//             </div>
//             {/* Close button inside drawer on mobile */}
//             <button 
//               onClick={() => setIsMobileSidebarOpen(false)}
//               className="md:hidden text-zinc-400 hover:text-zinc-100 p-1"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'} px-2 mb-2`}>Tools</div>
//           <nav className="space-y-1">
//             {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
//                     isActive
//                       ? (isDark ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-zinc-900 text-white font-semibold')
//                       : (isDark ? 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900')
//                   }`}
//                 >
//                   <FileText className="w-4 h-4" /> {name}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'} px-2 mt-6 mb-2`}>Library & Assessment</div>
//           <nav className="space-y-1">
//             {['Personal Bookshelf', 'Mock Tests'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); setViewingBookshelf(null); setIsMobileSidebarOpen(false); }}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
//                     isActive
//                       ? (isDark ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-zinc-900 text-white font-semibold')
//                       : (isDark ? 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900')
//                   }`}
//                 >
//                   <HelpCircle className="w-4 h-4" /> {name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         <div>
//           <button
//             onClick={() => { setIsSettingsOpen(true); setIsMobileSidebarOpen(false); }}
//             className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800 transition-colors w-full text-zinc-300 text-xs"
//           >
//             <Settings className="w-4 h-4" />
//             <span>Settings</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <main className={`flex-1 flex flex-col justify-between ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'} relative overflow-hidden w-full`}>
//         <header className={`h-14 border-b ${isDark ? 'border-zinc-800/80 bg-zinc-950/50' : 'border-zinc-200 bg-white/50'} flex items-center justify-between px-4 sm:px-6 backdrop-blur-md shrink-0`}>
//           <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//             {/* Hamburger button for opening mobile sidebar */}
//             <button
//               onClick={() => setIsMobileSidebarOpen(true)}
//               className={`md:hidden p-2 rounded-xl ${isDark ? 'bg-zinc-900 text-zinc-200' : 'bg-zinc-100 text-zinc-800'} shrink-0`}
//               title="Open Menu"
//             >
//               <Menu className="w-4 h-4" />
//             </button>
//             <div className={`px-2.5 sm:px-3 py-1 rounded-full ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'} border text-[10px] sm:text-[11px] font-mono tracking-wide uppercase truncate`}>
//               Session: <span className="hidden sm:inline">{activeTab}</span><span className="sm:hidden">{activeTab.split(' ')[0]}</span>
//             </div>
//             {activeBookshelfId && activeTab === 'Ask Anything' && (
//               <span className="hidden lg:inline-block text-[11px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full truncate max-w-[200px]">
//                 Active Bookshelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
//               </span>
//             )}
//           </div>
//           {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
//             <button onClick={handleResetSession} className={`text-xs font-semibold ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} transition-colors shrink-0 ml-2`}>
//               RESET
//             </button>
//           )}
//         </header>

//         {/* ================= PERSONAL BOOKSHELF PAGE ================= */}
//         {activeTab === 'Personal Bookshelf' ? (
//           <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full">
//             {!viewingBookshelf ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>My Personal Bookshelf</h2>
//                     <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-1`}>Manage your saved study modules and topic notes.</p>
//                   </div>
//                   {bookshelves.length > 0 && (
//                     <button
//                       onClick={handleClearAllBookshelves}
//                       className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
//                     </button>
//                   )}
//                 </div>

//                 {bookshelves.length === 0 ? (
//                   <div className={`p-8 sm:p-12 border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'} border-dashed rounded-2xl text-center space-y-3`}>
//                     <BookOpen className="w-10 h-10 mx-auto text-zinc-500 opacity-50" />
//                     <p className="text-sm font-semibold">No bookshelves created yet.</p>
//                     <p className="text-xs max-w-md mx-auto">Go to <span className="font-bold">Ask Anything</span>, generate study notes on any topic, and click the <span className="font-bold text-amber-500">"Save to Bookshelf"</span> button on any response card to create your library.</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {bookshelves.map((shelf) => (
//                       <div
//                         key={shelf.id}
//                         onClick={() => setViewingBookshelf(shelf)}
//                         className={`p-5 ${isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'} border rounded-2xl flex flex-col justify-between h-44 transition-all shadow-lg cursor-pointer group relative`}
//                       >
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className={`text-sm font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize pr-6 flex items-center gap-2`}>
//                               <BookOpen className="w-4 h-4 text-amber-500" /> {shelf.title}
//                             </h3>
//                             <button
//                               onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
//                               title="Delete Bookshelf"
//                               className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-400 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
//                         </div>
//                         <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
//                           <span className={`text-[11px] ${activeBookshelfId === shelf.id ? 'text-emerald-500 font-bold' : 'text-zinc-500'}`}>
//                             {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
//                           </span>
//                           <span className={`px-3 py-1.5 ${isDark ? 'bg-zinc-100 text-zinc-950 group-hover:bg-amber-400' : 'bg-zinc-900 text-white'} text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors`}>
//                             Open Shelf <ArrowRight className="w-3.5 h-3.5" />
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               /* Inside a Specific Bookshelf */
//               <div className="space-y-6">
//                 <div className={`p-4 sm:p-6 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
//                   <div>
//                     <button onClick={() => setViewingBookshelf(null)} className="text-xs text-zinc-400 hover:text-zinc-100 mb-1 underline">← Back to All Bookshelves</button>
//                     <h2 className={`text-base sm:text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize flex items-center gap-2`}>
//                       <BookOpen className="w-5 h-5 text-amber-500" /> {viewingBookshelf.title}
//                     </h2>
//                     <p className="text-xs text-zinc-400 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setActiveBookshelfId(viewingBookshelf.id);
//                       localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
//                       alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
//                     }}
//                     className={`px-4 py-2 rounded-xl text-xs font-bold self-start sm:self-auto ${activeBookshelfId === viewingBookshelf.id ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}
//                   >
//                     {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
//                   </button>
//                 </div>

//                 {viewingBookshelf.items.length === 0 ? (
//                   <div className={`p-8 border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'} border-dashed rounded-2xl text-center`}>
//                     <p className="text-sm">No items saved in this bookshelf yet.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {viewingBookshelf.items.map((item, idx) => (
//                       <div key={idx} className={`p-5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl space-y-3 shadow-md`}>
//                         <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
//                           <h4 className={`text-xs font-bold uppercase tracking-wider text-amber-500`}>Topic: {item.title || viewingBookshelf.title}</h4>
//                           <span className="text-[10px] text-zinc-500">{item.date}</span>
//                         </div>
//                         <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
//                           {item.text}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ) : activeTab === 'Mock Tests' ? (
//           /* ================= MOCK TESTS PAGE ================= */
//           <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full">
//             {!activeTest ? (
//               <div className="space-y-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div>
//                     <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Saved Mock Tests</h2>
//                     <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-1`}>All generated test files are safely stored here.</p>
//                   </div>
//                   {savedTests.length > 0 && (
//                     <button
//                       onClick={handleClearAllTests}
//                       className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
//                     </button>
//                   )}
//                 </div>

//                 {savedTests.length === 0 ? (
//                   <div className={`p-8 border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'} border-dashed rounded-2xl text-center space-y-2`}>
//                     <p className="text-sm">No mock tests available yet.</p>
//                     <p className="text-xs">Ask anything or type <span className={`font-mono ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>"generate quiz"</span> in "Ask Anything" to create a test (defaults to 50 questions).</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {savedTests.map((test) => (
//                       <div key={test.id} className={`p-5 ${isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'} border rounded-2xl flex flex-col justify-between h-40 transition-colors shadow-lg relative group`}>
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className={`text-sm font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize pr-6 truncate`}>{test.title}</h3>
//                             <button
//                               onClick={(e) => handleDeleteTest(e, test.id)}
//                               title="Delete Test"
//                               className="text-zinc-400 hover:text-red-500 p-1 transition-colors shrink-0"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-400 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
//                         </div>
//                         <button
//                           onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
//                           className={`self-end px-4 py-2 ${isDark ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'} text-xs font-bold rounded-xl flex items-center gap-2 transition-colors`}
//                         >
//                           Open & Solve Test <ArrowRight className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTest && !testResult ? (
//               <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl p-4 sm:p-6 shadow-xl space-y-6`}>
//                 <div className={`flex items-center justify-between border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'} pb-4`}>
//                   <div className="min-w-0 pr-2">
//                     <h2 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize truncate`}>{activeTest.title}</h2>
//                     <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-0.5`}>Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
//                   </div>
//                   <button onClick={handleExitTest} className={`text-xs ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} underline shrink-0`}>Exit to Library</button>
//                 </div>

//                 <div className="space-y-4">
//                   <p className={`text-sm font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{activeTest.questions[currentQuestionIndex].question}</p>
//                   <div className="space-y-2">
//                     {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
//                         className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all border ${
//                           selectedAnswers[currentQuestionIndex] === oIdx
//                             ? (isDark ? 'bg-zinc-100 text-zinc-950 font-semibold border-zinc-100' : 'bg-zinc-900 text-white font-semibold border-zinc-900')
//                             : (isDark ? 'bg-zinc-950/60 text-zinc-300 border-zinc-800 hover:bg-zinc-800/50' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100')
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className={`flex justify-between items-center pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
//                   <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className={`px-4 py-2 rounded-xl ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'} text-xs disabled:opacity-40`}>Previous</button>
//                   {currentQuestionIndex < activeTest.questions.length - 1 ? (
//                     <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className={`px-4 py-2 rounded-xl ${isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-white'} text-xs font-bold`}>Next Question</button>
//                   ) : (
//                     <button onClick={handleSubmitTest} className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400">Submit Test</button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl shadow-xl overflow-hidden space-y-6`}>
//                 <div className={`p-4 sm:p-6 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
//                   <div className="flex items-center gap-3 min-w-0">
//                     <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
//                     <h2 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize truncate`}>{activeTest.title} - Results</h2>
//                   </div>
//                   <span className={`text-xs font-bold ${testResult.statusColor} ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'} px-3 py-1.5 rounded-full border self-start sm:self-auto`}>
//                     {testResult.comparisonMessage}
//                   </span>
//                 </div>

//                 <div className="px-4 sm:px-6 pb-6">
//                   <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
//                     <table className="w-full text-left text-sm">
//                       <thead className={`bg-zinc-500/10 text-xs uppercase font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
//                         <tr>
//                           <th className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>Evaluation Metric</th>
//                           <th className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>Details</th>
//                         </tr>
//                       </thead>
//                       <tbody className={`divide-y ${isDark ? 'divide-zinc-800 text-zinc-300' : 'divide-zinc-200 text-zinc-700'} text-xs`}>
//                         <tr>
//                           <td className={`px-4 py-3 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Total Score</td>
//                           <td className="px-4 py-3">{testResult.score} / {testResult.total}</td>
//                         </tr>
//                         <tr>
//                           <td className={`px-4 py-3 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Percentage Obtained</td>
//                           <td className="px-4 py-3 font-mono font-bold text-amber-500">{testResult.percentage}%</td>
//                         </tr>
//                         <tr>
//                           <td className={`px-4 py-3 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'} align-top`}>Weak Topics / Improvement Needed</td>
//                           <td className="px-4 py-3">
//                             {testResult.weakTopics.length > 0 ? (
//                               <ul className="list-disc list-inside text-red-500 space-y-1">
//                                 {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
//                               </ul>
//                             ) : (
//                               <span className="text-emerald-500 font-semibold">Brilliant! All answers were correct.</span>
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//                     <button onClick={handleExitTest} className={`text-xs ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} underline underline-offset-2 self-start sm:self-auto`}>
//                       ← Back to Saved Mock Tests
//                     </button>
//                     <button onClick={handleRetakeTest} className={`px-5 py-2.5 rounded-xl ${isDark ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'} text-xs font-bold transition-colors flex items-center justify-center gap-2 w-full sm:w-auto`}>
//                       <RefreshCcw className="w-4 h-4" /> Retake Test (Shuffled Questions)
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           /* ================= NORMAL CHAT VIEW WITH SAVE BUTTON ON RESPONSES ================= */
//           <>
//             <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
//               {currentToolState.messages.length === 0 ? (
//                 <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 max-w-sm mx-auto space-y-2 px-4">
//                   <Lightbulb className="w-8 h-8 text-zinc-500 animate-pulse" />
//                   <p className="text-sm font-medium">
//                     {activeTab === 'Note Expander'
//                       ? <>Upload photos of your rough notes below, then ask anything to expand and correct them!</>
//                       : activeTab === 'PDF Uploader'
//                         ? <>Upload your full textbook or reference PDF below, then ask anything to generate complete study notes!</>
//                         : <>Ask anything or type <span className={`font-mono ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>"generate quiz"</span> to create tests!</>
//                     }
//                   </p>
//                 </div>
//               ) : (
//                 currentToolState.messages.map((msg) => (
//                   msg.sender === 'user' ? (
//                     <div key={msg.id} className="flex justify-end w-full">
//                       <div className={`max-w-[90%] sm:max-w-[80%] ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'} border px-4 py-3 rounded-2xl text-sm flex items-start gap-3`}>
//                         <span className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</span>
//                         <div className={`p-1 rounded-full ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'} shrink-0 mt-0.5`}><User className="w-3.5 h-3.5" /></div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div key={msg.id} className="space-y-2">
//                       {/* Save Button Header over AI response compartment */}
//                       <div className="flex justify-start">
//                         <button
//                           onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
//                           className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
//                         >
//                           <BookmarkPlus className="w-3.5 h-3.5" /> Save to Bookshelf
//                         </button>
//                       </div>
//                       <StructuredResponseRenderer message={msg} />
//                     </div>
//                   )
//                 ))
//               )}
//               {loading && <div className={`text-xs font-mono py-2 animate-pulse flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}><div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div> Generating response & study materials...</div>}
//               <div ref={chatEndRef} />
//             </div>

//             <div className={`p-3 sm:p-4 ${isDark ? 'bg-zinc-950 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'} border-t`}>
//               <div className="max-w-4xl mx-auto space-y-3">

//                 {/* Note Expander: multi-image dropzone + thumbnail previews */}
//                 {activeTab === 'Note Expander' && (
//                   <div
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     className={`rounded-2xl border border-dashed transition-colors p-3 ${
//                       isDraggingOver
//                         ? 'border-amber-500 bg-amber-500/5'
//                         : (isDark ? 'border-zinc-800' : 'border-zinc-300')
//                     }`}
//                   >
//                     {noteExpanderImages.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-2">
//                         {noteExpanderImages.map((img) => (
//                           <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 group">
//                             <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(img.id)}
//                               className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-500 text-white rounded-full p-0.5 transition-colors"
//                               title="Remove image"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => noteImageInputRef.current?.click()}
//                       className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-colors ${
//                         isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
//                       }`}
//                     >
//                       <ImagePlus className="w-4 h-4" />
//                       <span className="truncate">{noteExpanderImages.length > 0 ? 'Add More Photos of Notes' : 'Upload Photos of Your Notes (multiple allowed)'}</span>
//                     </button>
//                     <input
//                       ref={noteImageInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {/* PDF Uploader: single textbook/reference PDF dropzone + file card */}
//                 {activeTab === 'PDF Uploader' && (
//                   <div
//                     onDragOver={handlePdfDragOver}
//                     onDragLeave={handlePdfDragLeave}
//                     onDrop={handlePdfDrop}
//                     className={`rounded-2xl border border-dashed transition-colors p-3 ${
//                       isPdfDraggingOver
//                         ? 'border-amber-500 bg-amber-500/5'
//                         : (isDark ? 'border-zinc-800' : 'border-zinc-300')
//                     }`}
//                   >
//                     {selectedPdf ? (
//                       <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} mb-2`}>
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
//                             <FileText className="w-5 h-5" />
//                           </div>
//                           <div className="min-w-0">
//                             <p className={`text-xs font-semibold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{selectedPdf.name}</p>
//                             <p className="text-[10px] text-zinc-500">{formatFileSize(selectedPdf.size)}</p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removePdf}
//                           title="Remove PDF"
//                           className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg transition-colors shrink-0"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => pdfInputRef.current?.click()}
//                       className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-colors ${
//                         isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
//                       }`}
//                     >
//                       <FileUp className="w-4 h-4" />
//                       <span className="truncate">{selectedPdf ? 'Replace PDF' : 'Upload Your Textbook / Reference PDF'}</span>
//                     </button>
//                     <input
//                       ref={pdfInputRef}
//                       type="file"
//                       accept="application/pdf,.pdf"
//                       onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 <form onSubmit={handleSendQuery} className={`flex items-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl px-3 sm:px-4 py-2.5`}>
//                   <input
//                     type="text" value={currentToolState.input} onChange={handleInputChange}
//                     placeholder={
//                       activeTab === 'Note Expander'
//                         ? 'Add instructions (optional)...'
//                         : activeTab === 'PDF Uploader'
//                           ? 'Add instructions (optional)...'
//                           : 'Ask anything (e.g. integration)...'
//                     }
//                     className={`flex-1 bg-transparent border-none outline-none text-xs sm:text-sm ${isDark ? 'text-zinc-100 placeholder-zinc-500' : 'text-zinc-900 placeholder-zinc-400'} px-1 sm:px-2 min-w-0`}
//                   />
//                   <button
//                     type="submit"
//                     disabled={
//                       loading ||
//                       (!currentToolState.input.trim() &&
//                         !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
//                         !(activeTab === 'PDF Uploader' && selectedPdf))
//                     }
//                     className={`p-2 rounded-xl ${isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-white'} disabled:opacity-40 shrink-0 ml-1`}
//                   >
//                     <Send className="w-4 h-4" />
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* Save to Bookshelf Prompt Modal */}
//       {showSaveModal && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className={`${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-950'} border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5`}>
//             <div className="flex items-center justify-between border-b pb-3 border-zinc-700/30">
//               <h3 className="text-sm font-bold flex items-center gap-2">
//                 <BookmarkPlus className="w-4 h-4 text-amber-500" /> Create New Personal Bookshelf
//               </h3>
//               <button onClick={() => setShowSaveModal(false)} className="text-zinc-400 hover:text-zinc-100"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <p className="text-zinc-400">You don't have an active bookshelf selected. Name your new bookshelf to save this study material:</p>
//               <input
//                 type="text"
//                 value={newBookshelfName}
//                 onChange={(e) => setNewBookshelfName(e.target.value)}
//                 placeholder="e.g. Calculus Fundamentals, Physics Notes..."
//                 className={`w-full px-3.5 py-2.5 rounded-xl border ${isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'} outline-none font-medium`}
//               />
//             </div>

//             <div className="flex justify-end gap-2 pt-2">
//               <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold">Cancel</button>
//               <button onClick={handleCreateNewBookshelfAndSave} className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400">Create & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* External SettingsModal Component */}
//       <SettingsModal
//         isOpen={isSettingsOpen}
//         onClose={() => setIsSettingsOpen(false)}
//       />
//     </div>
//   );
// }




//3rd edit
// 'use client'
// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { Lightbulb, Send, Settings, FileText, HelpCircle, User, X, CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp } from 'lucide-react';
// import { secureFetch } from '@/utils/apiHelper';
// import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
// import SettingsModal from '@/components/SettingsModal';



// export default function DashboardPage() {

//   const router = useRouter();
//   const [mounted, setMounted] = useState(false);

//   const [activeTab, setActiveTab] = useState('Ask Anything');
//   const [showSettings, setShowSettings] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [toolStates, setToolStates] = useState({
//     'Ask Anything': { messages: [], input: '' },
//     'Note Expander': { messages: [], input: '' },
//     'PDF Uploader': { messages: [], input: '' },
//   });
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // --- USER PROFILE & THEME STATES ---
//   const [userName, setUserName] = useState('MIR SHAHARYAR');
//   const [tempName, setTempName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [themeMode, setThemeMode] = useState('dark');

//   // --- PERSONAL BOOKSHELF STATES ---
//   const [bookshelves, setBookshelves] = useState([]);
//   const [activeBookshelfId, setActiveBookshelfId] = useState(null);
//   const [viewingBookshelf, setViewingBookshelf] = useState(null); // For opening a specific bookshelf in library
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [pendingItemToSave, setPendingItemToSave] = useState(null);
//   const [newBookshelfName, setNewBookshelfName] = useState('');

//   // --- MOCK TEST STATES ---
//   const [savedTests, setSavedTests] = useState([]);
//   const [testHistories, setTestHistories] = useState({});
//   const [activeTest, setActiveTest] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [testResult, setTestResult] = useState(null);

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD STATES ---
//   const [noteExpanderImages, setNoteExpanderImages] = useState([]); // [{ id, name, base64 }]
//   const [isDraggingOver, setIsDraggingOver] = useState(false);
//   const noteImageInputRef = useRef(null);

//   // --- PDF UPLOADER: SINGLE PDF (TEXTBOOK) UPLOAD STATES ---
//   const [selectedPdf, setSelectedPdf] = useState(null); // { name, size, base64 }
//   const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
//   const pdfInputRef = useRef(null);

//   // --- AUTH GUARD ---
//   useEffect(() => {
//     setMounted(true);
//     const token = localStorage.getItem('token');
//     if (!token) {
//       router.push('/'); // Agar token nahi hai toh baghair login ke dashboard khulne hi nahi dega
//     }
//   }, [router]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedTests = localStorage.getItem('buitems_mock_tests');
//       const storedHistories = localStorage.getItem('buitems_test_histories');
//       const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
//       const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
//       const storedName = localStorage.getItem('buitems_user_name');
//       const storedTheme = localStorage.getItem('buitems_theme_mode');

//       if (storedTests) setSavedTests(JSON.parse(storedTests));
//       if (storedHistories) setTestHistories(JSON.parse(storedHistories));
//       if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
//       if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
//       if (storedName) {
//         setUserName(storedName);
//         setTempName(storedName);
//       }
//       if (storedTheme) setThemeMode(storedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [toolStates, activeTab, loading]);

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], input: val }
//     }));
//   };

//   // Profile Name Update
//   const handleSaveName = () => {
//     if (!tempName.trim()) return;
//     setUserName(tempName.trim());
//     localStorage.setItem('buitems_user_name', tempName.trim());
//     setIsEditingName(false);
//   };

//   // Theme Toggle
//   const handleToggleTheme = () => {
//     const newTheme = themeMode === 'dark' ? 'light' : 'dark';
//     setThemeMode(newTheme);
//     localStorage.setItem('buitems_theme_mode', newTheme);
//   };

//   // Logout Handler
//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       localStorage.clear();
//       window.location.reload();
//     }
//   };

//   // --- BOOKSHELF LOGIC ---
//   const handleTriggerSave = (msgText, queryText) => {
//     if (!activeBookshelfId) {
//       // No active bookshelf, prompt user to create one
//       setPendingItemToSave({ text: msgText, title: queryText });
//       setNewBookshelfName(queryText || 'My Study Notes');
//       setShowSaveModal(true);
//     } else {
//       // Active bookshelf exists, save directly into it
//       saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
//     }
//   };

//   const handleCreateNewBookshelfAndSave = () => {
//     if (!newBookshelfName.trim()) return;
//     const shelfId = Date.now().toString();
//     const newShelf = {
//       id: shelfId,
//       title: newBookshelfName.trim(),
//       date: new Date().toLocaleDateString(),
//       items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
//     };

//     const updatedShelves = [newShelf, ...bookshelves];
//     setBookshelves(updatedShelves);
//     setActiveBookshelfId(shelfId);

//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     localStorage.setItem('buitems_active_bookshelf_id', shelfId);

//     setShowSaveModal(false);
//     setPendingItemToSave(null);
//     setNewBookshelfName('');
//     alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
//   };

//   const saveItemToBookshelf = (shelfId, item) => {
//     const updatedShelves = bookshelves.map(shelf => {
//       if (shelf.id === shelfId) {
//         return { ...shelf, items: [item, ...shelf.items] };
//       }
//       return shelf;
//     });
//     setBookshelves(updatedShelves);
//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     alert("Successfully saved to your active bookshelf!");
//   };

//   const handleDeleteBookshelf = (e, shelfId) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this bookshelf?")) {
//       const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
//       setBookshelves(updatedShelves);
//       localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//       if (activeBookshelfId === shelfId) {
//         setActiveBookshelfId(null);
//         localStorage.removeItem('buitems_active_bookshelf_id');
//       }
//       if (viewingBookshelf && viewingBookshelf.id === shelfId) {
//         setViewingBookshelf(null);
//       }
//     }
//   };

//   const handleClearAllBookshelves = () => {
//     if (window.confirm("Are you sure you want to delete all bookshelves?")) {
//       setBookshelves([]);
//       setActiveBookshelfId(null);
//       setViewingBookshelf(null);
//       localStorage.removeItem('buitems_personal_bookshelves');
//       localStorage.removeItem('buitems_active_bookshelf_id');
//     }
//   };

//   // --- MOCK TEST LOGIC ---
//   const handleDeleteTest = (e, testId) => {
//     e.stopPropagation();
//     const updatedTests = savedTests.filter(t => t.id !== testId);
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     if (activeTest && activeTest.id === testId) setActiveTest(null);
//   };

//   const handleClearAllTests = () => {
//     if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
//       setSavedTests([]);
//       localStorage.removeItem('buitems_mock_tests');
//       setActiveTest(null);
//     }
//   };

//   const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
//     const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

//     try {
//       if (typeof rawText === 'string') {
//         let cleaned = rawText.trim();
//         const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (match) cleaned = match[1].trim();

//         const firstBracket = cleaned.indexOf('[');
//         const lastBracket = cleaned.lastIndexOf(']');
//         if (firstBracket !== -1 && lastBracket !== -1) {
//           cleaned = cleaned.substring(firstBracket, lastBracket + 1);
//         }

//         const parsed = JSON.parse(cleaned);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const validQuestions = parsed.map(q => ({
//             question: q.question || "Sample Question?",
//             options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
//             correct: typeof q.correct === 'number' ? q.correct : 0,
//             topic: q.topic || topicName
//           }));

//           const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
//           const updatedTests = [newTest, ...savedTests];
//           setSavedTests(updatedTests);
//           localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//           setActiveTest(newTest);
//           setActiveTab('Mock Tests');
//           return;
//         }
//       }
//     } catch (err) {
//       console.warn("JSON parse error caught safely, switching to dynamic fallback test:", err);
//     }

//     const fallbackQuestions = [];
//     for (let i = 1; i <= 50; i++) {
//       fallbackQuestions.push({
//         question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
//         options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
//         correct: 0,
//         topic: topicName
//       });
//     }

//     const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
//     const updatedTests = [fallbackTest, ...savedTests];
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     setActiveTest(fallbackTest);
//     setActiveTab('Mock Tests');
//   };

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD LOGIC ---
//   const handleImageUpload = (fileList) => {
//     const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
//     if (files.length === 0) return;

//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//           name: file.name,
//           base64: e.target.result, // data:image/...;base64,...
//         };
//         setNoteExpanderImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (id) => {
//     setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingOver(false);
//     if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
//   };

//   // --- PDF UPLOADER: SINGLE PDF (TEXTBOOK) UPLOAD LOGIC ---
//   const formatFileSize = (bytes) => {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   const handlePdfUpload = (fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
//     if (!isPdf) {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setSelectedPdf({
//         name: file.name,
//         size: file.size,
//         base64: e.target.result, // data:application/pdf;base64,...
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePdf = () => setSelectedPdf(null);

//   const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
//   const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
//   const handlePdfDrop = (e) => {
//     e.preventDefault();
//     setIsPdfDraggingOver(false);
//     if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
//   };

//  const handleSendQuery = async (e) => {
//     e.preventDefault();
//     const queryText = currentToolState.input.trim();
//     const isNoteExpander = activeTab === 'Note Expander';
//     const isPdfUploader = activeTab === 'PDF Uploader';
//     const hasImages = isNoteExpander && noteExpanderImages.length > 0;
//     const hasPdf = isPdfUploader && !!selectedPdf;

//     if ((!queryText && !hasImages && !hasPdf) || loading) return; // allow attachment-only submits

//     const userMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       text: queryText || (hasImages
//         ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
//         : hasPdf
//           ? `📄 Uploaded ${selectedPdf.name}`
//           : '')
//     };
    
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
//     }));
//     setLoading(true);

// try {
//       let finalQuery = queryText;
//       const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

//       // Smart Context Injection for short/ambiguous pronouns (e.g., "where its being used", "its types")
//       const lowerQuery = queryText.toLowerCase();
//       const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
//       const previousMessages = toolStates[activeTab]?.messages || [];
      
//       if (hasPronoun && previousMessages.length > 0) {
//         const lastMsg = previousMessages[previousMessages.length - 1];
//         const contextTopic = lastMsg.queryContext || lastMsg.text || '';
//         if (contextTopic) {
//           finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
//         }
//       }

//       if (isMockReq && activeTab === 'Ask Anything') {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
//       }

//       if (isNoteExpander) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: The attached images contain a student's incomplete or rough handwritten class notes. Read the images carefully, then: (1) rewrite and expand the notes into complete, well-structured study notes covering the full topic; (2) add a separate "Corrections & Gaps" section that explicitly flags any factual mistakes, conceptual errors, or missing information found in the original notes.]`;
//       }

//       if (isPdfUploader) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: The attached PDF is a full textbook, chapter, or reference document. Carefully read through the entire document and produce comprehensive, well-structured study notes covering: (1) a chapter-by-chapter or section-by-section summary of key concepts; (2) all important formulas, definitions, and terminology explicitly called out; (3) a clear, organized outline suitable for exam revision. If the user specified a chapter or topic focus in their instructions, prioritize that section while still noting other relevant content in brief.]`;
//       }

//       let endpoint = 'http://localhost:5000/api/ai/ask-anything';
//       if (activeTab === 'Note Expander') endpoint = 'http://localhost:5000/api/ai/expand-notes';
//       else if (activeTab === 'PDF Uploader') endpoint = 'http://localhost:5000/api/ai/pdf-analysis';

//       const payload = { prompt: finalQuery, tool: activeTab };
//       if (hasImages) {
//         payload.images = noteExpanderImages.map(img => img.base64);
//       }
//       if (hasPdf) {
//         payload.pdf = selectedPdf.base64;
//         payload.pdfName = selectedPdf.name;
//       }

//       const response = await secureFetch(endpoint, {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       if (!response) {
//         setLoading(false);
//         return; // Agar 401 hoga toh secureFetch khud hi redirect kar dega
//       }

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to process AI generation request.');
//       }

//       const rawContent = data.result || data.text || data.content || JSON.stringify(data);

//       if (isMockReq) {
//         extractAndSavedMockTestSafe(rawContent, queryText);
//         setLoading(false);
//         return;
//       }

//       const aiResponse = { 
//         id: (Date.now() + 1).toString(), 
//         sender: 'ai', 
//         result: rawContent, // Yeh structured object hai (definition, formula, explanation)
//         text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
//         queryContext: queryText 
//       };

//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
//       }));

//       if (hasImages) setNoteExpanderImages([]);
//       if (hasPdf) setSelectedPdf(null);

//     }catch (err) {
//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { 
//           ...prev[activeTab], 
//           messages: [...prev[activeTab].messages, { 
//             id: Date.now().toString(), 
//             sender: 'ai', 
//             text: `Error: ${err.message}` 
//           }] 
//         }
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOptionSelect = (qIdx, optIdx) => {
//     setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
//   };

//   const handleSubmitTest = () => {
//     let score = 0;
//     let weakTopicsMap = [];

//     activeTest.questions.forEach((q, idx) => {
//       if (selectedAnswers[idx] === q.correct) score += 1;
//       else weakTopicsMap.push(q.topic || activeTest.title);
//     });

//     const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
//     const weakTopics = [...new Set(weakTopicsMap)];
//     const previousHistory = testHistories[activeTest.id];
//     let comparisonMessage = "This is your first attempt.";
//     let statusColor = themeMode === 'dark' ? "text-zinc-400" : "text-zinc-600";

//     if (previousHistory) {
//       if (percentage > previousHistory.lastPercentage) {
//         comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-emerald-500";
//       } else if (percentage < previousHistory.lastPercentage) {
//         comparisonMessage = `Degraded. Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-red-500";
//       } else {
//         comparisonMessage = `Consistent performance at ${percentage}%.`;
//         statusColor = "text-amber-500";
//       }
//     }

//     const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
//     setTestResult(resultObj);
//     const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
//     setTestHistories(updatedHistory);
//     localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
//   };

//   const handleRetakeTest = () => {
//     const shuffledQuestions = activeTest.questions.map(q => {
//       const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
//       optionsWithIndex.sort(() => Math.random() - 0.5);
//       return {
//         ...q,
//         options: optionsWithIndex.map(o => o.text),
//         correct: optionsWithIndex.findIndex(o => o.isCorrect)
//       };
//     });
//     setActiveTest({ ...activeTest, questions: shuffledQuestions });
//     setSelectedAnswers({});
//     setTestResult(null);
//     setCurrentQuestionIndex(0);
//   };

//   const handleExitTest = () => {
//     setActiveTest(null);
//     setTestResult(null);
//     setSelectedAnswers({});
//     setCurrentQuestionIndex(0);
//   };

// const handleResetSession = () => {
//     setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
//     setActiveBookshelfId(null);
//     localStorage.removeItem('buitems_active_bookshelf_id');
//     setNoteExpanderImages([]);
//     setSelectedPdf(null);
//   };

//   const currentToolState = toolStates[activeTab] || { messages: [], input: '' };
//   const isDark = themeMode === 'dark';
//   const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

//   if (!mounted) return null; // avoid flashing the dashboard before the auth check runs

//   return (
//     <div className={`flex h-screen ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} font-sans overflow-hidden relative transition-colors`}>
//       {/* Sidebar */}
//       <aside className={`w-64 border-r ${isDark ? 'border-zinc-800/80 bg-zinc-900/40' : 'border-zinc-200 bg-white'} flex flex-col justify-between p-4 z-10`}>
//         <div>
//           <div className="flex items-center gap-3 px-2 py-3 mb-6">
//             <div className={`p-2 rounded-xl ${isDark ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'} font-bold`}>
//               <Lightbulb className="w-5 h-5" />
//             </div>
//             <div>
//               <h1 className="text-sm font-bold tracking-tight">BUITEMS Study AI</h1>
//               <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'} uppercase font-mono`}>{userName}</p>
//             </div>
//           </div>

//           <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'} px-2 mb-2`}>Tools</div>
//           <nav className="space-y-1">
//             {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); }}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
//                     isActive
//                       ? (isDark ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-zinc-900 text-white font-semibold')
//                       : (isDark ? 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900')
//                   }`}
//                 >
//                   <FileText className="w-4 h-4" /> {name}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'} px-2 mt-6 mb-2`}>Library & Assessment</div>
//           <nav className="space-y-1">
//             {['Personal Bookshelf', 'Mock Tests'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); setViewingBookshelf(null); }}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
//                     isActive
//                       ? (isDark ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-zinc-900 text-white font-semibold')
//                       : (isDark ? 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900')
//                   }`}
//                 >
//                   <HelpCircle className="w-4 h-4" /> {name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         <div>
//           <button
//             onClick={() => setIsSettingsOpen(true)}
//             className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800 transition-colors w-full text-zinc-300"
//           >
//             <Settings className="w-4 h-4" />
//             <span>Settings</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <main className={`flex-1 flex flex-col justify-between ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'} relative overflow-hidden`}>
//         <header className={`h-14 border-b ${isDark ? 'border-zinc-800/80 bg-zinc-950/50' : 'border-zinc-200 bg-white/50'} flex items-center justify-between px-6 backdrop-blur-md`}>
//           <div className="flex items-center gap-3">
//             <div className={`px-3 py-1 rounded-full ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'} border text-[11px] font-mono tracking-wide uppercase`}>
//               Session: {activeTab}
//             </div>
//             {activeBookshelfId && activeTab === 'Ask Anything' && (
//               <span className="text-[11px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
//                 Active Bookshelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
//               </span>
//             )}
//           </div>
//           {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
//             <button onClick={handleResetSession} className={`text-xs font-semibold ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} transition-colors`}>
//               RESET
//             </button>
//           )}
//         </header>

//         {/* ================= PERSONAL BOOKSHELF PAGE ================= */}
//         {activeTab === 'Personal Bookshelf' ? (
//           <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
//             {!viewingBookshelf ? (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className={`text-xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>My Personal Bookshelf</h2>
//                     <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-1`}>Manage your saved study modules and topic notes.</p>
//                   </div>
//                   {bookshelves.length > 0 && (
//                     <button
//                       onClick={handleClearAllBookshelves}
//                       className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
//                     </button>
//                   )}
//                 </div>

//                 {bookshelves.length === 0 ? (
//                   <div className={`p-12 border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'} border-dashed rounded-2xl text-center space-y-3`}>
//                     <BookOpen className="w-10 h-10 mx-auto text-zinc-500 opacity-50" />
//                     <p className="text-sm font-semibold">No bookshelves created yet.</p>
//                     <p className="text-xs max-w-md mx-auto">Go to <span className="font-bold">Ask Anything</span>, generate study notes on any topic, and click the <span className="font-bold text-amber-500">"Save to Bookshelf"</span> button on any response card to create your library.</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {bookshelves.map((shelf) => (
//                       <div
//                         key={shelf.id}
//                         onClick={() => setViewingBookshelf(shelf)}
//                         className={`p-5 ${isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'} border rounded-2xl flex flex-col justify-between h-44 transition-all shadow-lg cursor-pointer group relative`}
//                       >
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className={`text-sm font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize pr-6 flex items-center gap-2`}>
//                               <BookOpen className="w-4 h-4 text-amber-500" /> {shelf.title}
//                             </h3>
//                             <button
//                               onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
//                               title="Delete Bookshelf"
//                               className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-400 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
//                         </div>
//                         <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
//                           <span className={`text-[11px] ${activeBookshelfId === shelf.id ? 'text-emerald-500 font-bold' : 'text-zinc-500'}`}>
//                             {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
//                           </span>
//                           <span className={`px-3 py-1.5 ${isDark ? 'bg-zinc-100 text-zinc-950 group-hover:bg-amber-400' : 'bg-zinc-900 text-white'} text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors`}>
//                             Open Shelf <ArrowRight className="w-3.5 h-3.5" />
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               /* Inside a Specific Bookshelf */
//               <div className="space-y-6">
//                 <div className={`p-6 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl flex items-center justify-between`}>
//                   <div>
//                     <button onClick={() => setViewingBookshelf(null)} className="text-xs text-zinc-400 hover:text-zinc-100 mb-1 underline">← Back to All Bookshelves</button>
//                     <h2 className={`text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize flex items-center gap-2`}>
//                       <BookOpen className="w-5 h-5 text-amber-500" /> {viewingBookshelf.title}
//                     </h2>
//                     <p className="text-xs text-zinc-400 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setActiveBookshelfId(viewingBookshelf.id);
//                       localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
//                       alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
//                     }}
//                     className={`px-4 py-2 rounded-xl text-xs font-bold ${activeBookshelfId === viewingBookshelf.id ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}
//                   >
//                     {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
//                   </button>
//                 </div>

//                 {viewingBookshelf.items.length === 0 ? (
//                   <div className={`p-8 border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'} border-dashed rounded-2xl text-center`}>
//                     <p className="text-sm">No items saved in this bookshelf yet.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {viewingBookshelf.items.map((item, idx) => (
//                       <div key={idx} className={`p-5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl space-y-3 shadow-md`}>
//                         <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
//                           <h4 className={`text-xs font-bold uppercase tracking-wider text-amber-500`}>Topic: {item.title || viewingBookshelf.title}</h4>
//                           <span className="text-[10px] text-zinc-500">{item.date}</span>
//                         </div>
//                         <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
//                           {item.text}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ) : activeTab === 'Mock Tests' ? (
//           /* ================= MOCK TESTS PAGE ================= */
//           <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
//             {!activeTest ? (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className={`text-xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Saved Mock Tests</h2>
//                     <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-1`}>All generated test files are safely stored here.</p>
//                   </div>
//                   {savedTests.length > 0 && (
//                     <button
//                       onClick={handleClearAllTests}
//                       className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
//                     </button>
//                   )}
//                 </div>

//                 {savedTests.length === 0 ? (
//                   <div className={`p-8 border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'} border-dashed rounded-2xl text-center space-y-2`}>
//                     <p className="text-sm">No mock tests available yet.</p>
//                     <p className="text-xs">Ask anything or type <span className={`font-mono ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>"generate quiz"</span> in "Ask Anything" to create a test (defaults to 50 questions).</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {savedTests.map((test) => (
//                       <div key={test.id} className={`p-5 ${isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'} border rounded-2xl flex flex-col justify-between h-40 transition-colors shadow-lg relative group`}>
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className={`text-sm font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize pr-6`}>{test.title}</h3>
//                             <button
//                               onClick={(e) => handleDeleteTest(e, test.id)}
//                               title="Delete Test"
//                               className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-400 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
//                         </div>
//                         <button
//                           onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
//                           className={`self-end px-4 py-2 ${isDark ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'} text-xs font-bold rounded-xl flex items-center gap-2 transition-colors`}
//                         >
//                           Open & Solve Test <ArrowRight className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTest && !testResult ? (
//               <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl p-6 shadow-xl space-y-6`}>
//                 <div className={`flex items-center justify-between border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'} pb-4`}>
//                   <div>
//                     <h2 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize`}>{activeTest.title}</h2>
//                     <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-0.5`}>Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
//                   </div>
//                   <button onClick={handleExitTest} className={`text-xs ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} underline`}>Exit to Library</button>
//                 </div>

//                 <div className="space-y-4">
//                   <p className={`text-sm font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{activeTest.questions[currentQuestionIndex].question}</p>
//                   <div className="space-y-2">
//                     {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
//                         className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all border ${
//                           selectedAnswers[currentQuestionIndex] === oIdx
//                             ? (isDark ? 'bg-zinc-100 text-zinc-950 font-semibold border-zinc-100' : 'bg-zinc-900 text-white font-semibold border-zinc-900')
//                             : (isDark ? 'bg-zinc-950/60 text-zinc-300 border-zinc-800 hover:bg-zinc-800/50' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100')
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className={`flex justify-between items-center pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
//                   <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className={`px-4 py-2 rounded-xl ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'} text-xs disabled:opacity-40`}>Previous</button>
//                   {currentQuestionIndex < activeTest.questions.length - 1 ? (
//                     <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className={`px-4 py-2 rounded-xl ${isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-white'} text-xs font-bold`}>Next Question</button>
//                   ) : (
//                     <button onClick={handleSubmitTest} className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400">Submit Test</button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl shadow-xl overflow-hidden space-y-6`}>
//                 <div className={`p-6 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'} flex items-center justify-between`}>
//                   <div className="flex items-center gap-3">
//                     <CheckCircle2 className="w-6 h-6 text-emerald-500" />
//                     <h2 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize`}>{activeTest.title} - Results</h2>
//                   </div>
//                   <span className={`text-xs font-bold ${testResult.statusColor} ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'} px-3 py-1.5 rounded-full border`}>
//                     {testResult.comparisonMessage}
//                   </span>
//                 </div>

//                 <div className="px-6 pb-6">
//                   <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
//                     <table className="w-full text-left text-sm">
//                       <thead className={`bg-zinc-500/10 text-xs uppercase font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
//                         <tr>
//                           <th className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>Evaluation Metric</th>
//                           <th className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>Details</th>
//                         </tr>
//                       </thead>
//                       <tbody className={`divide-y ${isDark ? 'divide-zinc-800 text-zinc-300' : 'divide-zinc-200 text-zinc-700'} text-xs`}>
//                         <tr>
//                           <td className={`px-4 py-3 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Total Score</td>
//                           <td className="px-4 py-3">{testResult.score} / {testResult.total}</td>
//                         </tr>
//                         <tr>
//                           <td className={`px-4 py-3 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Percentage Obtained</td>
//                           <td className="px-4 py-3 font-mono font-bold text-amber-500">{testResult.percentage}%</td>
//                         </tr>
//                         <tr>
//                           <td className={`px-4 py-3 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'} align-top`}>Weak Topics / Improvement Needed</td>
//                           <td className="px-4 py-3">
//                             {testResult.weakTopics.length > 0 ? (
//                               <ul className="list-disc list-inside text-red-500 space-y-1">
//                                 {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
//                               </ul>
//                             ) : (
//                               <span className="text-emerald-500 font-semibold">Brilliant! All answers were correct.</span>
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="pt-6 flex justify-between items-center">
//                     <button onClick={handleExitTest} className={`text-xs ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} underline underline-offset-2`}>
//                       ← Back to Saved Mock Tests
//                     </button>
//                     <button onClick={handleRetakeTest} className={`px-5 py-2.5 rounded-xl ${isDark ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'} text-xs font-bold transition-colors flex items-center gap-2`}>
//                       <RefreshCcw className="w-4 h-4" /> Retake Test (Shuffled Questions)
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           /* ================= NORMAL CHAT VIEW WITH SAVE BUTTON ON RESPONSES ================= */
//           <>
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {currentToolState.messages.length === 0 ? (
//                 <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 max-w-sm mx-auto space-y-2">
//                   <Lightbulb className="w-8 h-8 text-zinc-500 animate-pulse" />
//                   <p className="text-sm font-medium">
//                     {activeTab === 'Note Expander'
//                       ? <>Upload photos of your rough notes below, then ask anything to expand and correct them!</>
//                       : activeTab === 'PDF Uploader'
//                         ? <>Upload your full textbook or reference PDF below, then ask anything to generate complete study notes!</>
//                         : <>Ask anything or type <span className={`font-mono ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>"generate quiz"</span> to create tests!</>
//                     }
//                   </p>
//                 </div>
//               ) : (
//                 currentToolState.messages.map((msg) => (
//                   msg.sender === 'user' ? (
//                     <div key={msg.id} className="flex justify-end w-full">
//                       <div className={`max-w-[80%] ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'} border px-4 py-3 rounded-2xl text-sm flex items-start gap-3`}>
//                         <span className="leading-relaxed whitespace-pre-wrap">{msg.text}</span>
//                         <div className={`p-1 rounded-full ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'} shrink-0 mt-0.5`}><User className="w-3.5 h-3.5" /></div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div key={msg.id} className="space-y-2">
//                       {/* Save Button Header over AI response compartment */}
//                       <div className="flex justify-start">
//                         <button
//                           onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
//                           className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
//                         >
//                           <BookmarkPlus className="w-3.5 h-3.5" /> Save to Bookshelf
//                         </button>
//                       </div>
//                       <StructuredResponseRenderer message={msg} />
//                     </div>
//                   )
//                 ))
//               )}
//               {loading && <div className={`text-xs font-mono py-2 animate-pulse flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}><div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div> Generating response & study materials...</div>}
//               <div ref={chatEndRef} />
//             </div>

//             <div className={`p-4 ${isDark ? 'bg-zinc-950 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'} border-t`}>
//               <div className="max-w-4xl mx-auto space-y-3">

//                 {/* Note Expander: multi-image dropzone + thumbnail previews */}
//                 {activeTab === 'Note Expander' && (
//                   <div
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     className={`rounded-2xl border border-dashed transition-colors p-3 ${
//                       isDraggingOver
//                         ? 'border-amber-500 bg-amber-500/5'
//                         : (isDark ? 'border-zinc-800' : 'border-zinc-300')
//                     }`}
//                   >
//                     {noteExpanderImages.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-2">
//                         {noteExpanderImages.map((img) => (
//                           <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 group">
//                             <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(img.id)}
//                               className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-500 text-white rounded-full p-0.5 transition-colors"
//                               title="Remove image"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => noteImageInputRef.current?.click()}
//                       className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-colors ${
//                         isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
//                       }`}
//                     >
//                       <ImagePlus className="w-4 h-4" />
//                       {noteExpanderImages.length > 0 ? 'Add More Photos of Notes' : 'Upload Photos of Your Notes (multiple allowed)'}
//                     </button>
//                     <input
//                       ref={noteImageInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {/* PDF Uploader: single textbook/reference PDF dropzone + file card */}
//                 {activeTab === 'PDF Uploader' && (
//                   <div
//                     onDragOver={handlePdfDragOver}
//                     onDragLeave={handlePdfDragLeave}
//                     onDrop={handlePdfDrop}
//                     className={`rounded-2xl border border-dashed transition-colors p-3 ${
//                       isPdfDraggingOver
//                         ? 'border-amber-500 bg-amber-500/5'
//                         : (isDark ? 'border-zinc-800' : 'border-zinc-300')
//                     }`}
//                   >
//                     {selectedPdf ? (
//                       <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} mb-2`}>
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
//                             <FileText className="w-5 h-5" />
//                           </div>
//                           <div className="min-w-0">
//                             <p className={`text-xs font-semibold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{selectedPdf.name}</p>
//                             <p className="text-[10px] text-zinc-500">{formatFileSize(selectedPdf.size)}</p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removePdf}
//                           title="Remove PDF"
//                           className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg transition-colors shrink-0"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => pdfInputRef.current?.click()}
//                       className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-colors ${
//                         isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
//                       }`}
//                     >
//                       <FileUp className="w-4 h-4" />
//                       {selectedPdf ? 'Replace PDF' : 'Upload Your Textbook / Reference PDF'}
//                     </button>
//                     <input
//                       ref={pdfInputRef}
//                       type="file"
//                       accept="application/pdf,.pdf"
//                       onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 <form onSubmit={handleSendQuery} className={`flex items-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl px-4 py-2.5`}>
//                   <input
//                     type="text" value={currentToolState.input} onChange={handleInputChange}
//                     placeholder={
//                       activeTab === 'Note Expander'
//                         ? 'Add instructions (optional), e.g. "focus on chapter 3"...'
//                         : activeTab === 'PDF Uploader'
//                           ? 'Add instructions (optional), e.g. "focus on Module 6"...'
//                           : 'Ask anything (e.g. what is integration)...'
//                     }
//                     className={`flex-1 bg-transparent border-none outline-none text-sm ${isDark ? 'text-zinc-100 placeholder-zinc-500' : 'text-zinc-900 placeholder-zinc-400'} px-2`}
//                   />
//                   <button
//                     type="submit"
//                     disabled={
//                       loading ||
//                       (!currentToolState.input.trim() &&
//                         !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
//                         !(activeTab === 'PDF Uploader' && selectedPdf))
//                     }
//                     className={`p-2 rounded-xl ${isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-white'} disabled:opacity-40`}
//                   >
//                     <Send className="w-4 h-4" />
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* Save to Bookshelf Prompt Modal */}
//       {showSaveModal && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className={`${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-950'} border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5`}>
//             <div className="flex items-center justify-between border-b pb-3 border-zinc-700/30">
//               <h3 className="text-sm font-bold flex items-center gap-2">
//                 <BookmarkPlus className="w-4 h-4 text-amber-500" /> Create New Personal Bookshelf
//               </h3>
//               <button onClick={() => setShowSaveModal(false)} className="text-zinc-400 hover:text-zinc-100"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <p className="text-zinc-400">You don't have an active bookshelf selected. Name your new bookshelf to save this study material:</p>
//               <input
//                 type="text"
//                 value={newBookshelfName}
//                 onChange={(e) => setNewBookshelfName(e.target.value)}
//                 placeholder="e.g. Calculus Fundamentals, Physics Notes..."
//                 className={`w-full px-3.5 py-2.5 rounded-xl border ${isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'} outline-none font-medium`}
//               />
//             </div>

//             <div className="flex justify-end gap-2 pt-2">
//               <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold">Cancel</button>
//               <button onClick={handleCreateNewBookshelfAndSave} className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400">Create & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* External SettingsModal Component */}
//       <SettingsModal
//         isOpen={isSettingsOpen}
//         onClose={() => setIsSettingsOpen(false)}
//       />
//     </div>
//   );
// }






//2nd edit
// 'use client'
// import React, { useState, useEffect, useRef } from 'react';
// import { Lightbulb, Send, Settings, FileText, HelpCircle, User, X, CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp } from 'lucide-react';
// import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
// import SettingsModal from '@/components/SettingsModal';



// export default function DashboardPage() {

//   const [activeTab, setActiveTab] = useState('Ask Anything');
//   const [showSettings, setShowSettings] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [toolStates, setToolStates] = useState({
//     'Ask Anything': { messages: [], input: '' },
//     'Note Expander': { messages: [], input: '' },
//     'PDF Uploader': { messages: [], input: '' },
//   });
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);


//   // --- USER PROFILE & THEME STATES ---
//   const [userName, setUserName] = useState('MIR SHAHARYAR');
//   const [tempName, setTempName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [themeMode, setThemeMode] = useState('dark');

//   // --- PERSONAL BOOKSHELF STATES ---
//   const [bookshelves, setBookshelves] = useState([]);
//   const [activeBookshelfId, setActiveBookshelfId] = useState(null);
//   const [viewingBookshelf, setViewingBookshelf] = useState(null); // For opening a specific bookshelf in library
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [pendingItemToSave, setPendingItemToSave] = useState(null);
//   const [newBookshelfName, setNewBookshelfName] = useState('');

//   // --- MOCK TEST STATES ---
//   const [savedTests, setSavedTests] = useState([]);
//   const [testHistories, setTestHistories] = useState({});
//   const [activeTest, setActiveTest] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [testResult, setTestResult] = useState(null);

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD STATES ---
//   const [noteExpanderImages, setNoteExpanderImages] = useState([]); // [{ id, name, base64 }]
//   const [isDraggingOver, setIsDraggingOver] = useState(false);
//   const noteImageInputRef = useRef(null);

//   // --- PDF UPLOADER: SINGLE PDF (TEXTBOOK) UPLOAD STATES ---
//   const [selectedPdf, setSelectedPdf] = useState(null); // { name, size, base64 }
//   const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
//   const pdfInputRef = useRef(null);


//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedTests = localStorage.getItem('buitems_mock_tests');
//       const storedHistories = localStorage.getItem('buitems_test_histories');
//       const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
//       const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
//       const storedName = localStorage.getItem('buitems_user_name');
//       const storedTheme = localStorage.getItem('buitems_theme_mode');

//       if (storedTests) setSavedTests(JSON.parse(storedTests));
//       if (storedHistories) setTestHistories(JSON.parse(storedHistories));
//       if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
//       if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
//       if (storedName) {
//         setUserName(storedName);
//         setTempName(storedName);
//       }
//       if (storedTheme) setThemeMode(storedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [toolStates, activeTab, loading]);

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], input: val }
//     }));
//   };

//   // Profile Name Update
//   const handleSaveName = () => {
//     if (!tempName.trim()) return;
//     setUserName(tempName.trim());
//     localStorage.setItem('buitems_user_name', tempName.trim());
//     setIsEditingName(false);
//   };

//   // Theme Toggle
//   const handleToggleTheme = () => {
//     const newTheme = themeMode === 'dark' ? 'light' : 'dark';
//     setThemeMode(newTheme);
//     localStorage.setItem('buitems_theme_mode', newTheme);
//   };

//   // Logout Handler
// const handleLogout = () => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       // 1. Specific items clear karein ya safe tarike se storage clean karein
//       localStorage.removeItem('token');
//       localStorage.removeItem('profileName');

//       // 2. Cookie ko khatam/expire karein taake baghair password ke access na mile
//       document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

//       // 3. Page reload ki bajaye seedha router se landing/login page par bhej dein
//       router.push('/');
//     }
//   };

//   // --- BOOKSHELF LOGIC ---
//   const handleTriggerSave = (msgText, queryText) => {
//     if (!activeBookshelfId) {
//       // No active bookshelf, prompt user to create one
//       setPendingItemToSave({ text: msgText, title: queryText });
//       setNewBookshelfName(queryText || 'My Study Notes');
//       setShowSaveModal(true);
//     } else {
//       // Active bookshelf exists, save directly into it
//       saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
//     }
//   };

//   const handleCreateNewBookshelfAndSave = () => {
//     if (!newBookshelfName.trim()) return;
//     const shelfId = Date.now().toString();
//     const newShelf = {
//       id: shelfId,
//       title: newBookshelfName.trim(),
//       date: new Date().toLocaleDateString(),
//       items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
//     };

//     const updatedShelves = [newShelf, ...bookshelves];
//     setBookshelves(updatedShelves);
//     setActiveBookshelfId(shelfId);

//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     localStorage.setItem('buitems_active_bookshelf_id', shelfId);

//     setShowSaveModal(false);
//     setPendingItemToSave(null);
//     setNewBookshelfName('');
//     alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
//   };

//   const saveItemToBookshelf = (shelfId, item) => {
//     const updatedShelves = bookshelves.map(shelf => {
//       if (shelf.id === shelfId) {
//         return { ...shelf, items: [item, ...shelf.items] };
//       }
//       return shelf;
//     });
//     setBookshelves(updatedShelves);
//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     alert("Successfully saved to your active bookshelf!");
//   };

//   const handleDeleteBookshelf = (e, shelfId) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this bookshelf?")) {
//       const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
//       setBookshelves(updatedShelves);
//       localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//       if (activeBookshelfId === shelfId) {
//         setActiveBookshelfId(null);
//         localStorage.removeItem('buitems_active_bookshelf_id');
//       }
//       if (viewingBookshelf && viewingBookshelf.id === shelfId) {
//         setViewingBookshelf(null);
//       }
//     }
//   };

//   const handleClearAllBookshelves = () => {
//     if (window.confirm("Are you sure you want to delete all bookshelves?")) {
//       setBookshelves([]);
//       setActiveBookshelfId(null);
//       setViewingBookshelf(null);
//       localStorage.removeItem('buitems_personal_bookshelves');
//       localStorage.removeItem('buitems_active_bookshelf_id');
//     }
//   };

//   // --- MOCK TEST LOGIC ---
//   const handleDeleteTest = (e, testId) => {
//     e.stopPropagation();
//     const updatedTests = savedTests.filter(t => t.id !== testId);
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     if (activeTest && activeTest.id === testId) setActiveTest(null);
//   };

//   const handleClearAllTests = () => {
//     if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
//       setSavedTests([]);
//       localStorage.removeItem('buitems_mock_tests');
//       setActiveTest(null);
//     }
//   };

//   const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
//     const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

//     try {
//       if (typeof rawText === 'string') {
//         let cleaned = rawText.trim();
//         const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (match) cleaned = match[1].trim();

//         const firstBracket = cleaned.indexOf('[');
//         const lastBracket = cleaned.lastIndexOf(']');
//         if (firstBracket !== -1 && lastBracket !== -1) {
//           cleaned = cleaned.substring(firstBracket, lastBracket + 1);
//         }

//         const parsed = JSON.parse(cleaned);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const validQuestions = parsed.map(q => ({
//             question: q.question || "Sample Question?",
//             options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
//             correct: typeof q.correct === 'number' ? q.correct : 0,
//             topic: q.topic || topicName
//           }));

//           const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
//           const updatedTests = [newTest, ...savedTests];
//           setSavedTests(updatedTests);
//           localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//           setActiveTest(newTest);
//           setActiveTab('Mock Tests');
//           return;
//         }
//       }
//     } catch (err) {
//       console.warn("JSON parse error caught safely, switching to dynamic fallback test:", err);
//     }

//     const fallbackQuestions = [];
//     for (let i = 1; i <= 50; i++) {
//       fallbackQuestions.push({
//         question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
//         options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
//         correct: 0,
//         topic: topicName
//       });
//     }

//     const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
//     const updatedTests = [fallbackTest, ...savedTests];
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     setActiveTest(fallbackTest);
//     setActiveTab('Mock Tests');
//   };

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD LOGIC ---
//   const handleImageUpload = (fileList) => {
//     const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
//     if (files.length === 0) return;

//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//           name: file.name,
//           base64: e.target.result, // data:image/...;base64,...
//         };
//         setNoteExpanderImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (id) => {
//     setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingOver(false);
//     if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
//   };

//   // --- PDF UPLOADER: SINGLE PDF (TEXTBOOK) UPLOAD LOGIC ---
//   const formatFileSize = (bytes) => {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   const handlePdfUpload = (fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
//     if (!isPdf) {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setSelectedPdf({
//         name: file.name,
//         size: file.size,
//         base64: e.target.result, // data:application/pdf;base64,...
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePdf = () => setSelectedPdf(null);

//   const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
//   const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
//   const handlePdfDrop = (e) => {
//     e.preventDefault();
//     setIsPdfDraggingOver(false);
//     if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
//   };

//  const handleSendQuery = async (e) => {
//     e.preventDefault();
//     const queryText = currentToolState.input.trim();
//     const isNoteExpander = activeTab === 'Note Expander';
//     const isPdfUploader = activeTab === 'PDF Uploader';
//     const hasImages = isNoteExpander && noteExpanderImages.length > 0;
//     const hasPdf = isPdfUploader && !!selectedPdf;

//     if ((!queryText && !hasImages && !hasPdf) || loading) return; // allow attachment-only submits

//     const userMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       text: queryText || (hasImages
//         ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
//         : hasPdf
//           ? `📄 Uploaded ${selectedPdf.name}`
//           : '')
//     };
    
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
//     }));
//     setLoading(true);

// try {
//       let finalQuery = queryText;
//       const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

//       // Smart Context Injection for short/ambiguous pronouns (e.g., "where its being used", "its types")
//       const lowerQuery = queryText.toLowerCase();
//       const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
//       const previousMessages = toolStates[activeTab]?.messages || [];
      
//       if (hasPronoun && previousMessages.length > 0) {
//         const lastMsg = previousMessages[previousMessages.length - 1];
//         const contextTopic = lastMsg.queryContext || lastMsg.text || '';
//         if (contextTopic) {
//           finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
//         }
//       }

//       if (isMockReq && activeTab === 'Ask Anything') {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
//       }

//       if (isNoteExpander) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: The attached images contain a student's incomplete or rough handwritten class notes. Read the images carefully, then: (1) rewrite and expand the notes into complete, well-structured study notes covering the full topic; (2) add a separate "Corrections & Gaps" section that explicitly flags any factual mistakes, conceptual errors, or missing information found in the original notes.]`;
//       }

//       if (isPdfUploader) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: The attached PDF is a full textbook, chapter, or reference document. Carefully read through the entire document and produce comprehensive, well-structured study notes covering: (1) a chapter-by-chapter or section-by-section summary of key concepts; (2) all important formulas, definitions, and terminology explicitly called out; (3) a clear, organized outline suitable for exam revision. If the user specified a chapter or topic focus in their instructions, prioritize that section while still noting other relevant content in brief.]`;
//       }

//       let endpoint = 'http://localhost:5000/api/ai/ask-anything';
//       if (activeTab === 'Note Expander') endpoint = 'http://localhost:5000/api/ai/expand-notes';
//       else if (activeTab === 'PDF Uploader') endpoint = 'http://localhost:5000/api/ai/pdf-analysis';

//       const payload = { prompt: finalQuery, tool: activeTab };
//       if (hasImages) {
//         payload.images = noteExpanderImages.map(img => img.base64);
//       }
//       if (hasPdf) {
//         payload.pdf = selectedPdf.base64;
//         payload.pdfName = selectedPdf.name;
//       }

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to process AI generation request.');
//       }

//       const rawContent = data.result || data.text || data.content || JSON.stringify(data);

//       if (isMockReq) {
//         extractAndSavedMockTestSafe(rawContent, queryText);
//         setLoading(false);
//         return;
//       }

//       const aiResponse = { 
//         id: (Date.now() + 1).toString(), 
//         sender: 'ai', 
//         result: rawContent, // Yeh structured object hai (definition, formula, explanation)
//         text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
//         queryContext: queryText 
//       };

//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
//       }));

//       if (hasImages) setNoteExpanderImages([]);
//       if (hasPdf) setSelectedPdf(null);

//     }catch (err) {
//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { 
//           ...prev[activeTab], 
//           messages: [...prev[activeTab].messages, { 
//             id: Date.now().toString(), 
//             sender: 'ai', 
//             text: `Error: ${err.message}` 
//           }] 
//         }
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOptionSelect = (qIdx, optIdx) => {
//     setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
//   };

//   const handleSubmitTest = () => {
//     let score = 0;
//     let weakTopicsMap = [];

//     activeTest.questions.forEach((q, idx) => {
//       if (selectedAnswers[idx] === q.correct) score += 1;
//       else weakTopicsMap.push(q.topic || activeTest.title);
//     });

//     const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
//     const weakTopics = [...new Set(weakTopicsMap)];
//     const previousHistory = testHistories[activeTest.id];
//     let comparisonMessage = "This is your first attempt.";
//     let statusColor = themeMode === 'dark' ? "text-zinc-400" : "text-zinc-600";

//     if (previousHistory) {
//       if (percentage > previousHistory.lastPercentage) {
//         comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-emerald-500";
//       } else if (percentage < previousHistory.lastPercentage) {
//         comparisonMessage = `Degraded. Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-red-500";
//       } else {
//         comparisonMessage = `Consistent performance at ${percentage}%.`;
//         statusColor = "text-amber-500";
//       }
//     }

//     const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
//     setTestResult(resultObj);
//     const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
//     setTestHistories(updatedHistory);
//     localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
//   };

//   const handleRetakeTest = () => {
//     const shuffledQuestions = activeTest.questions.map(q => {
//       const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
//       optionsWithIndex.sort(() => Math.random() - 0.5);
//       return {
//         ...q,
//         options: optionsWithIndex.map(o => o.text),
//         correct: optionsWithIndex.findIndex(o => o.isCorrect)
//       };
//     });
//     setActiveTest({ ...activeTest, questions: shuffledQuestions });
//     setSelectedAnswers({});
//     setTestResult(null);
//     setCurrentQuestionIndex(0);
//   };

//   const handleExitTest = () => {
//     setActiveTest(null);
//     setTestResult(null);
//     setSelectedAnswers({});
//     setCurrentQuestionIndex(0);
//   };

// const handleResetSession = () => {
//     setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
//     setActiveBookshelfId(null);
//     localStorage.removeItem('buitems_active_bookshelf_id');
//     setNoteExpanderImages([]);
//     setSelectedPdf(null);
//   };

//   const currentToolState = toolStates[activeTab] || { messages: [], input: '' };
//   const isDark = themeMode === 'dark';
//   const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

//   return (
//     <div className={`flex h-screen ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} font-sans overflow-hidden relative transition-colors`}>
//       {/* Sidebar */}
//       <aside className={`w-64 border-r ${isDark ? 'border-zinc-800/80 bg-zinc-900/40' : 'border-zinc-200 bg-white'} flex flex-col justify-between p-4 z-10`}>
//         <div>
//           <div className="flex items-center gap-3 px-2 py-3 mb-6">
//             <div className={`p-2 rounded-xl ${isDark ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'} font-bold`}>
//               <Lightbulb className="w-5 h-5" />
//             </div>
//             <div>
//               <h1 className="text-sm font-bold tracking-tight">BUITEMS Study AI</h1>
//               <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'} uppercase font-mono`}>{userName}</p>
//             </div>
//           </div>

//           <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'} px-2 mb-2`}>Tools</div>
//           <nav className="space-y-1">
//             {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); }}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
//                     isActive
//                       ? (isDark ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-zinc-900 text-white font-semibold')
//                       : (isDark ? 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900')
//                   }`}
//                 >
//                   <FileText className="w-4 h-4" /> {name}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'} px-2 mt-6 mb-2`}>Library & Assessment</div>
//           <nav className="space-y-1">
//             {['Personal Bookshelf', 'Mock Tests'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); setViewingBookshelf(null); }}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
//                     isActive
//                       ? (isDark ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-zinc-900 text-white font-semibold')
//                       : (isDark ? 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900')
//                   }`}
//                 >
//                   <HelpCircle className="w-4 h-4" /> {name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         <div>
//           <button
//             onClick={() => setIsSettingsOpen(true)}
//             className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800 transition-colors w-full text-zinc-300"
//           >
//             <Settings className="w-4 h-4" />
//             <span>Settings</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <main className={`flex-1 flex flex-col justify-between ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'} relative overflow-hidden`}>
//         <header className={`h-14 border-b ${isDark ? 'border-zinc-800/80 bg-zinc-950/50' : 'border-zinc-200 bg-white/50'} flex items-center justify-between px-6 backdrop-blur-md`}>
//           <div className="flex items-center gap-3">
//             <div className={`px-3 py-1 rounded-full ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'} border text-[11px] font-mono tracking-wide uppercase`}>
//               Session: {activeTab}
//             </div>
//             {activeBookshelfId && activeTab === 'Ask Anything' && (
//               <span className="text-[11px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
//                 Active Bookshelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
//               </span>
//             )}
//           </div>
//           {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
//             <button onClick={handleResetSession} className={`text-xs font-semibold ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} transition-colors`}>
//               RESET
//             </button>
//           )}
//         </header>

//         {/* ================= PERSONAL BOOKSHELF PAGE ================= */}
//         {activeTab === 'Personal Bookshelf' ? (
//           <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
//             {!viewingBookshelf ? (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className={`text-xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>My Personal Bookshelf</h2>
//                     <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-1`}>Manage your saved study modules and topic notes.</p>
//                   </div>
//                   {bookshelves.length > 0 && (
//                     <button
//                       onClick={handleClearAllBookshelves}
//                       className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
//                     </button>
//                   )}
//                 </div>

//                 {bookshelves.length === 0 ? (
//                   <div className={`p-12 border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'} border-dashed rounded-2xl text-center space-y-3`}>
//                     <BookOpen className="w-10 h-10 mx-auto text-zinc-500 opacity-50" />
//                     <p className="text-sm font-semibold">No bookshelves created yet.</p>
//                     <p className="text-xs max-w-md mx-auto">Go to <span className="font-bold">Ask Anything</span>, generate study notes on any topic, and click the <span className="font-bold text-amber-500">"Save to Bookshelf"</span> button on any response card to create your library.</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {bookshelves.map((shelf) => (
//                       <div
//                         key={shelf.id}
//                         onClick={() => setViewingBookshelf(shelf)}
//                         className={`p-5 ${isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'} border rounded-2xl flex flex-col justify-between h-44 transition-all shadow-lg cursor-pointer group relative`}
//                       >
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className={`text-sm font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize pr-6 flex items-center gap-2`}>
//                               <BookOpen className="w-4 h-4 text-amber-500" /> {shelf.title}
//                             </h3>
//                             <button
//                               onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
//                               title="Delete Bookshelf"
//                               className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-400 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
//                         </div>
//                         <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
//                           <span className={`text-[11px] ${activeBookshelfId === shelf.id ? 'text-emerald-500 font-bold' : 'text-zinc-500'}`}>
//                             {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
//                           </span>
//                           <span className={`px-3 py-1.5 ${isDark ? 'bg-zinc-100 text-zinc-950 group-hover:bg-amber-400' : 'bg-zinc-900 text-white'} text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors`}>
//                             Open Shelf <ArrowRight className="w-3.5 h-3.5" />
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               /* Inside a Specific Bookshelf */
//               <div className="space-y-6">
//                 <div className={`p-6 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl flex items-center justify-between`}>
//                   <div>
//                     <button onClick={() => setViewingBookshelf(null)} className="text-xs text-zinc-400 hover:text-zinc-100 mb-1 underline">← Back to All Bookshelves</button>
//                     <h2 className={`text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize flex items-center gap-2`}>
//                       <BookOpen className="w-5 h-5 text-amber-500" /> {viewingBookshelf.title}
//                     </h2>
//                     <p className="text-xs text-zinc-400 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setActiveBookshelfId(viewingBookshelf.id);
//                       localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
//                       alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
//                     }}
//                     className={`px-4 py-2 rounded-xl text-xs font-bold ${activeBookshelfId === viewingBookshelf.id ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}
//                   >
//                     {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
//                   </button>
//                 </div>

//                 {viewingBookshelf.items.length === 0 ? (
//                   <div className={`p-8 border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'} border-dashed rounded-2xl text-center`}>
//                     <p className="text-sm">No items saved in this bookshelf yet.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {viewingBookshelf.items.map((item, idx) => (
//                       <div key={idx} className={`p-5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl space-y-3 shadow-md`}>
//                         <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
//                           <h4 className={`text-xs font-bold uppercase tracking-wider text-amber-500`}>Topic: {item.title || viewingBookshelf.title}</h4>
//                           <span className="text-[10px] text-zinc-500">{item.date}</span>
//                         </div>
//                         <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
//                           {item.text}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ) : activeTab === 'Mock Tests' ? (
//           /* ================= MOCK TESTS PAGE ================= */
//           <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
//             {!activeTest ? (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className={`text-xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Saved Mock Tests</h2>
//                     <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-1`}>All generated test files are safely stored here.</p>
//                   </div>
//                   {savedTests.length > 0 && (
//                     <button
//                       onClick={handleClearAllTests}
//                       className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
//                     </button>
//                   )}
//                 </div>

//                 {savedTests.length === 0 ? (
//                   <div className={`p-8 border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'} border-dashed rounded-2xl text-center space-y-2`}>
//                     <p className="text-sm">No mock tests available yet.</p>
//                     <p className="text-xs">Ask anything or type <span className={`font-mono ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>"generate quiz"</span> in "Ask Anything" to create a test (defaults to 50 questions).</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {savedTests.map((test) => (
//                       <div key={test.id} className={`p-5 ${isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'} border rounded-2xl flex flex-col justify-between h-40 transition-colors shadow-lg relative group`}>
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className={`text-sm font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize pr-6`}>{test.title}</h3>
//                             <button
//                               onClick={(e) => handleDeleteTest(e, test.id)}
//                               title="Delete Test"
//                               className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-400 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
//                         </div>
//                         <button
//                           onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
//                           className={`self-end px-4 py-2 ${isDark ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'} text-xs font-bold rounded-xl flex items-center gap-2 transition-colors`}
//                         >
//                           Open & Solve Test <ArrowRight className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTest && !testResult ? (
//               <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl p-6 shadow-xl space-y-6`}>
//                 <div className={`flex items-center justify-between border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'} pb-4`}>
//                   <div>
//                     <h2 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize`}>{activeTest.title}</h2>
//                     <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-0.5`}>Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
//                   </div>
//                   <button onClick={handleExitTest} className={`text-xs ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} underline`}>Exit to Library</button>
//                 </div>

//                 <div className="space-y-4">
//                   <p className={`text-sm font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{activeTest.questions[currentQuestionIndex].question}</p>
//                   <div className="space-y-2">
//                     {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
//                         className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all border ${
//                           selectedAnswers[currentQuestionIndex] === oIdx
//                             ? (isDark ? 'bg-zinc-100 text-zinc-950 font-semibold border-zinc-100' : 'bg-zinc-900 text-white font-semibold border-zinc-900')
//                             : (isDark ? 'bg-zinc-950/60 text-zinc-300 border-zinc-800 hover:bg-zinc-800/50' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100')
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className={`flex justify-between items-center pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
//                   <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className={`px-4 py-2 rounded-xl ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'} text-xs disabled:opacity-40`}>Previous</button>
//                   {currentQuestionIndex < activeTest.questions.length - 1 ? (
//                     <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className={`px-4 py-2 rounded-xl ${isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-white'} text-xs font-bold`}>Next Question</button>
//                   ) : (
//                     <button onClick={handleSubmitTest} className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400">Submit Test</button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl shadow-xl overflow-hidden space-y-6`}>
//                 <div className={`p-6 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'} flex items-center justify-between`}>
//                   <div className="flex items-center gap-3">
//                     <CheckCircle2 className="w-6 h-6 text-emerald-500" />
//                     <h2 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize`}>{activeTest.title} - Results</h2>
//                   </div>
//                   <span className={`text-xs font-bold ${testResult.statusColor} ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'} px-3 py-1.5 rounded-full border`}>
//                     {testResult.comparisonMessage}
//                   </span>
//                 </div>

//                 <div className="px-6 pb-6">
//                   <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
//                     <table className="w-full text-left text-sm">
//                       <thead className={`bg-zinc-500/10 text-xs uppercase font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
//                         <tr>
//                           <th className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>Evaluation Metric</th>
//                           <th className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>Details</th>
//                         </tr>
//                       </thead>
//                       <tbody className={`divide-y ${isDark ? 'divide-zinc-800 text-zinc-300' : 'divide-zinc-200 text-zinc-700'} text-xs`}>
//                         <tr>
//                           <td className={`px-4 py-3 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Total Score</td>
//                           <td className="px-4 py-3">{testResult.score} / {testResult.total}</td>
//                         </tr>
//                         <tr>
//                           <td className={`px-4 py-3 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Percentage Obtained</td>
//                           <td className="px-4 py-3 font-mono font-bold text-amber-500">{testResult.percentage}%</td>
//                         </tr>
//                         <tr>
//                           <td className={`px-4 py-3 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'} align-top`}>Weak Topics / Improvement Needed</td>
//                           <td className="px-4 py-3">
//                             {testResult.weakTopics.length > 0 ? (
//                               <ul className="list-disc list-inside text-red-500 space-y-1">
//                                 {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
//                               </ul>
//                             ) : (
//                               <span className="text-emerald-500 font-semibold">Brilliant! All answers were correct.</span>
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="pt-6 flex justify-between items-center">
//                     <button onClick={handleExitTest} className={`text-xs ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} underline underline-offset-2`}>
//                       ← Back to Saved Mock Tests
//                     </button>
//                     <button onClick={handleRetakeTest} className={`px-5 py-2.5 rounded-xl ${isDark ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'} text-xs font-bold transition-colors flex items-center gap-2`}>
//                       <RefreshCcw className="w-4 h-4" /> Retake Test (Shuffled Questions)
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           /* ================= NORMAL CHAT VIEW WITH SAVE BUTTON ON RESPONSES ================= */
//           <>
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {currentToolState.messages.length === 0 ? (
//                 <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 max-w-sm mx-auto space-y-2">
//                   <Lightbulb className="w-8 h-8 text-zinc-500 animate-pulse" />
//                   <p className="text-sm font-medium">
//                     {activeTab === 'Note Expander'
//                       ? <>Upload photos of your rough notes below, then ask anything to expand and correct them!</>
//                       : activeTab === 'PDF Uploader'
//                         ? <>Upload your full textbook or reference PDF below, then ask anything to generate complete study notes!</>
//                         : <>Ask anything or type <span className={`font-mono ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>"generate quiz"</span> to create tests!</>
//                     }
//                   </p>
//                 </div>
//               ) : (
//                 currentToolState.messages.map((msg) => (
//                   msg.sender === 'user' ? (
//                     <div key={msg.id} className="flex justify-end w-full">
//                       <div className={`max-w-[80%] ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'} border px-4 py-3 rounded-2xl text-sm flex items-start gap-3`}>
//                         <span className="leading-relaxed whitespace-pre-wrap">{msg.text}</span>
//                         <div className={`p-1 rounded-full ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'} shrink-0 mt-0.5`}><User className="w-3.5 h-3.5" /></div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div key={msg.id} className="space-y-2">
//                       {/* Save Button Header over AI response compartment */}
//                       <div className="flex justify-start">
//                         <button
//                           onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
//                           className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
//                         >
//                           <BookmarkPlus className="w-3.5 h-3.5" /> Save to Bookshelf
//                         </button>
//                       </div>
//                       <StructuredResponseRenderer message={msg} />
//                     </div>
//                   )
//                 ))
//               )}
//               {loading && <div className={`text-xs font-mono py-2 animate-pulse flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}><div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div> Generating response & study materials...</div>}
//               <div ref={chatEndRef} />
//             </div>

//             <div className={`p-4 ${isDark ? 'bg-zinc-950 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'} border-t`}>
//               <div className="max-w-4xl mx-auto space-y-3">

//                 {/* Note Expander: multi-image dropzone + thumbnail previews */}
//                 {activeTab === 'Note Expander' && (
//                   <div
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     className={`rounded-2xl border border-dashed transition-colors p-3 ${
//                       isDraggingOver
//                         ? 'border-amber-500 bg-amber-500/5'
//                         : (isDark ? 'border-zinc-800' : 'border-zinc-300')
//                     }`}
//                   >
//                     {noteExpanderImages.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-2">
//                         {noteExpanderImages.map((img) => (
//                           <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 group">
//                             <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(img.id)}
//                               className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-500 text-white rounded-full p-0.5 transition-colors"
//                               title="Remove image"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => noteImageInputRef.current?.click()}
//                       className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-colors ${
//                         isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
//                       }`}
//                     >
//                       <ImagePlus className="w-4 h-4" />
//                       {noteExpanderImages.length > 0 ? 'Add More Photos of Notes' : 'Upload Photos of Your Notes (multiple allowed)'}
//                     </button>
//                     <input
//                       ref={noteImageInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {/* PDF Uploader: single textbook/reference PDF dropzone + file card */}
//                 {activeTab === 'PDF Uploader' && (
//                   <div
//                     onDragOver={handlePdfDragOver}
//                     onDragLeave={handlePdfDragLeave}
//                     onDrop={handlePdfDrop}
//                     className={`rounded-2xl border border-dashed transition-colors p-3 ${
//                       isPdfDraggingOver
//                         ? 'border-amber-500 bg-amber-500/5'
//                         : (isDark ? 'border-zinc-800' : 'border-zinc-300')
//                     }`}
//                   >
//                     {selectedPdf ? (
//                       <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} mb-2`}>
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
//                             <FileText className="w-5 h-5" />
//                           </div>
//                           <div className="min-w-0">
//                             <p className={`text-xs font-semibold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{selectedPdf.name}</p>
//                             <p className="text-[10px] text-zinc-500">{formatFileSize(selectedPdf.size)}</p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removePdf}
//                           title="Remove PDF"
//                           className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg transition-colors shrink-0"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => pdfInputRef.current?.click()}
//                       className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-colors ${
//                         isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
//                       }`}
//                     >
//                       <FileUp className="w-4 h-4" />
//                       {selectedPdf ? 'Replace PDF' : 'Upload Your Textbook / Reference PDF'}
//                     </button>
//                     <input
//                       ref={pdfInputRef}
//                       type="file"
//                       accept="application/pdf,.pdf"
//                       onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 <form onSubmit={handleSendQuery} className={`flex items-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl px-4 py-2.5`}>
//                   <input
//                     type="text" value={currentToolState.input} onChange={handleInputChange}
//                     placeholder={
//                       activeTab === 'Note Expander'
//                         ? 'Add instructions (optional), e.g. "focus on chapter 3"...'
//                         : activeTab === 'PDF Uploader'
//                           ? 'Add instructions (optional), e.g. "focus on Module 6"...'
//                           : 'Ask anything (e.g. what is integration)...'
//                     }
//                     className={`flex-1 bg-transparent border-none outline-none text-sm ${isDark ? 'text-zinc-100 placeholder-zinc-500' : 'text-zinc-900 placeholder-zinc-400'} px-2`}
//                   />
//                   <button
//                     type="submit"
//                     disabled={
//                       loading ||
//                       (!currentToolState.input.trim() &&
//                         !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
//                         !(activeTab === 'PDF Uploader' && selectedPdf))
//                     }
//                     className={`p-2 rounded-xl ${isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-white'} disabled:opacity-40`}
//                   >
//                     <Send className="w-4 h-4" />
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* Save to Bookshelf Prompt Modal */}
//       {showSaveModal && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className={`${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-950'} border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5`}>
//             <div className="flex items-center justify-between border-b pb-3 border-zinc-700/30">
//               <h3 className="text-sm font-bold flex items-center gap-2">
//                 <BookmarkPlus className="w-4 h-4 text-amber-500" /> Create New Personal Bookshelf
//               </h3>
//               <button onClick={() => setShowSaveModal(false)} className="text-zinc-400 hover:text-zinc-100"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <p className="text-zinc-400">You don't have an active bookshelf selected. Name your new bookshelf to save this study material:</p>
//               <input
//                 type="text"
//                 value={newBookshelfName}
//                 onChange={(e) => setNewBookshelfName(e.target.value)}
//                 placeholder="e.g. Calculus Fundamentals, Physics Notes..."
//                 className={`w-full px-3.5 py-2.5 rounded-xl border ${isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'} outline-none font-medium`}
//               />
//             </div>

//             <div className="flex justify-end gap-2 pt-2">
//               <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold">Cancel</button>
//               <button onClick={handleCreateNewBookshelfAndSave} className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400">Create & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* External SettingsModal Component */}
//       <SettingsModal
//         isOpen={isSettingsOpen}
//         onClose={() => setIsSettingsOpen(false)}
//       />
//     </div>
//   );
// }




//1st edit

// 'use client'
// import React, { useState, useEffect, useRef } from 'react';
// import { Lightbulb, Send, Settings, FileText, HelpCircle, User, X, CheckCircle2, Trash2, LogOut, Sun, Moon, Edit3, BookmarkPlus, BookOpen, ArrowRight, RefreshCcw, ImagePlus, FileUp } from 'lucide-react';
// import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';
// import SettingsModal from '@/components/SettingsModal';



// export default function DashboardPage() {

//   const [activeTab, setActiveTab] = useState('Ask Anything');
//   const [showSettings, setShowSettings] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [toolStates, setToolStates] = useState({
//     'Ask Anything': { messages: [], input: '' },
//     'Note Expander': { messages: [], input: '' },
//     'PDF Uploader': { messages: [], input: '' },
//   });
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // --- USER PROFILE & THEME STATES ---
//   const [userName, setUserName] = useState('MIR SHAHARYAR');
//   const [tempName, setTempName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [themeMode, setThemeMode] = useState('dark');

//   // --- PERSONAL BOOKSHELF STATES ---
//   const [bookshelves, setBookshelves] = useState([]);
//   const [activeBookshelfId, setActiveBookshelfId] = useState(null);
//   const [viewingBookshelf, setViewingBookshelf] = useState(null); // For opening a specific bookshelf in library
//   const [showSaveModal, setShowSaveModal] = useState(false);
//   const [pendingItemToSave, setPendingItemToSave] = useState(null);
//   const [newBookshelfName, setNewBookshelfName] = useState('');

//   // --- MOCK TEST STATES ---
//   const [savedTests, setSavedTests] = useState([]);
//   const [testHistories, setTestHistories] = useState({});
//   const [activeTest, setActiveTest] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [testResult, setTestResult] = useState(null);

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD STATES ---
//   const [noteExpanderImages, setNoteExpanderImages] = useState([]); // [{ id, name, base64 }]
//   const [isDraggingOver, setIsDraggingOver] = useState(false);
//   const noteImageInputRef = useRef(null);

//   // --- PDF UPLOADER: SINGLE PDF (TEXTBOOK) UPLOAD STATES ---
//   const [selectedPdf, setSelectedPdf] = useState(null); // { name, size, base64 }
//   const [isPdfDraggingOver, setIsPdfDraggingOver] = useState(false);
//   const pdfInputRef = useRef(null);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const storedTests = localStorage.getItem('buitems_mock_tests');
//       const storedHistories = localStorage.getItem('buitems_test_histories');
//       const storedBookshelves = localStorage.getItem('buitems_personal_bookshelves');
//       const storedActiveShelf = localStorage.getItem('buitems_active_bookshelf_id');
//       const storedName = localStorage.getItem('buitems_user_name');
//       const storedTheme = localStorage.getItem('buitems_theme_mode');

//       if (storedTests) setSavedTests(JSON.parse(storedTests));
//       if (storedHistories) setTestHistories(JSON.parse(storedHistories));
//       if (storedBookshelves) setBookshelves(JSON.parse(storedBookshelves));
//       if (storedActiveShelf) setActiveBookshelfId(storedActiveShelf);
//       if (storedName) {
//         setUserName(storedName);
//         setTempName(storedName);
//       }
//       if (storedTheme) setThemeMode(storedTheme);
//     }
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [toolStates, activeTab, loading]);

//   const handleInputChange = (e) => {
//     const val = e.target.value;
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], input: val }
//     }));
//   };

//   // Profile Name Update
//   const handleSaveName = () => {
//     if (!tempName.trim()) return;
//     setUserName(tempName.trim());
//     localStorage.setItem('buitems_user_name', tempName.trim());
//     setIsEditingName(false);
//   };

//   // Theme Toggle
//   const handleToggleTheme = () => {
//     const newTheme = themeMode === 'dark' ? 'light' : 'dark';
//     setThemeMode(newTheme);
//     localStorage.setItem('buitems_theme_mode', newTheme);
//   };

//   // Logout Handler
//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       localStorage.clear();
//       window.location.reload();
//     }
//   };

//   // --- BOOKSHELF LOGIC ---
//   const handleTriggerSave = (msgText, queryText) => {
//     if (!activeBookshelfId) {
//       // No active bookshelf, prompt user to create one
//       setPendingItemToSave({ text: msgText, title: queryText });
//       setNewBookshelfName(queryText || 'My Study Notes');
//       setShowSaveModal(true);
//     } else {
//       // Active bookshelf exists, save directly into it
//       saveItemToBookshelf(activeBookshelfId, { text: msgText, title: queryText, date: new Date().toLocaleDateString() });
//     }
//   };

//   const handleCreateNewBookshelfAndSave = () => {
//     if (!newBookshelfName.trim()) return;
//     const shelfId = Date.now().toString();
//     const newShelf = {
//       id: shelfId,
//       title: newBookshelfName.trim(),
//       date: new Date().toLocaleDateString(),
//       items: pendingItemToSave ? [{ text: pendingItemToSave.text, title: pendingItemToSave.title, date: new Date().toLocaleDateString() }] : []
//     };

//     const updatedShelves = [newShelf, ...bookshelves];
//     setBookshelves(updatedShelves);
//     setActiveBookshelfId(shelfId);

//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     localStorage.setItem('buitems_active_bookshelf_id', shelfId);

//     setShowSaveModal(false);
//     setPendingItemToSave(null);
//     setNewBookshelfName('');
//     alert(`Successfully created bookshelf "${newShelf.title}" and saved item!`);
//   };

//   const saveItemToBookshelf = (shelfId, item) => {
//     const updatedShelves = bookshelves.map(shelf => {
//       if (shelf.id === shelfId) {
//         return { ...shelf, items: [item, ...shelf.items] };
//       }
//       return shelf;
//     });
//     setBookshelves(updatedShelves);
//     localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//     alert("Successfully saved to your active bookshelf!");
//   };

//   const handleDeleteBookshelf = (e, shelfId) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this bookshelf?")) {
//       const updatedShelves = bookshelves.filter(s => s.id !== shelfId);
//       setBookshelves(updatedShelves);
//       localStorage.setItem('buitems_personal_bookshelves', JSON.stringify(updatedShelves));
//       if (activeBookshelfId === shelfId) {
//         setActiveBookshelfId(null);
//         localStorage.removeItem('buitems_active_bookshelf_id');
//       }
//       if (viewingBookshelf && viewingBookshelf.id === shelfId) {
//         setViewingBookshelf(null);
//       }
//     }
//   };

//   const handleClearAllBookshelves = () => {
//     if (window.confirm("Are you sure you want to delete all bookshelves?")) {
//       setBookshelves([]);
//       setActiveBookshelfId(null);
//       setViewingBookshelf(null);
//       localStorage.removeItem('buitems_personal_bookshelves');
//       localStorage.removeItem('buitems_active_bookshelf_id');
//     }
//   };

//   // --- MOCK TEST LOGIC ---
//   const handleDeleteTest = (e, testId) => {
//     e.stopPropagation();
//     const updatedTests = savedTests.filter(t => t.id !== testId);
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     if (activeTest && activeTest.id === testId) setActiveTest(null);
//   };

//   const handleClearAllTests = () => {
//     if (window.confirm("Are you sure you want to clear all saved mock tests?")) {
//       setSavedTests([]);
//       localStorage.removeItem('buitems_mock_tests');
//       setActiveTest(null);
//     }
//   };

//   const extractAndSavedMockTestSafe = (rawText, originalPrompt) => {
//     const topicName = originalPrompt.replace(/mock test on|mock test|create|generate|quiz on|quiz/gi, '').trim() || originalPrompt;

//     try {
//       if (typeof rawText === 'string') {
//         let cleaned = rawText.trim();
//         const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//         if (match) cleaned = match[1].trim();

//         const firstBracket = cleaned.indexOf('[');
//         const lastBracket = cleaned.lastIndexOf(']');
//         if (firstBracket !== -1 && lastBracket !== -1) {
//           cleaned = cleaned.substring(firstBracket, lastBracket + 1);
//         }

//         const parsed = JSON.parse(cleaned);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const validQuestions = parsed.map(q => ({
//             question: q.question || "Sample Question?",
//             options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
//             correct: typeof q.correct === 'number' ? q.correct : 0,
//             topic: q.topic || topicName
//           }));

//           const newTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: validQuestions };
//           const updatedTests = [newTest, ...savedTests];
//           setSavedTests(updatedTests);
//           localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//           setActiveTest(newTest);
//           setActiveTab('Mock Tests');
//           return;
//         }
//       }
//     } catch (err) {
//       console.warn("JSON parse error caught safely, switching to dynamic fallback test:", err);
//     }

//     const fallbackQuestions = [];
//     for (let i = 1; i <= 50; i++) {
//       fallbackQuestions.push({
//         question: `Question ${i}: What is a major aspect or concept related to ${topicName}?`,
//         options: [`Fundamental principle ${i} of ${topicName}`, `Secondary operational framework`, `General historical context`, `None of the above`],
//         correct: 0,
//         topic: topicName
//       });
//     }

//     const fallbackTest = { id: Date.now().toString(), title: topicName, date: new Date().toLocaleDateString(), questions: fallbackQuestions };
//     const updatedTests = [fallbackTest, ...savedTests];
//     setSavedTests(updatedTests);
//     localStorage.setItem('buitems_mock_tests', JSON.stringify(updatedTests));
//     setActiveTest(fallbackTest);
//     setActiveTab('Mock Tests');
//   };

//   // --- NOTE EXPANDER: MULTI-IMAGE UPLOAD LOGIC ---
//   const handleImageUpload = (fileList) => {
//     const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
//     if (files.length === 0) return;

//     files.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//           name: file.name,
//           base64: e.target.result, // data:image/...;base64,...
//         };
//         setNoteExpanderImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (id) => {
//     setNoteExpanderImages(prev => prev.filter(img => img.id !== id));
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingOver(false); };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDraggingOver(false);
//     if (e.dataTransfer.files?.length) handleImageUpload(e.dataTransfer.files);
//   };

//   // --- PDF UPLOADER: SINGLE PDF (TEXTBOOK) UPLOAD LOGIC ---
//   const formatFileSize = (bytes) => {
//     if (!bytes && bytes !== 0) return '';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   const handlePdfUpload = (fileList) => {
//     const file = fileList?.[0];
//     if (!file) return;
//     const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
//     if (!isPdf) {
//       alert('Please upload a valid PDF file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setSelectedPdf({
//         name: file.name,
//         size: file.size,
//         base64: e.target.result, // data:application/pdf;base64,...
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePdf = () => setSelectedPdf(null);

//   const handlePdfDragOver = (e) => { e.preventDefault(); setIsPdfDraggingOver(true); };
//   const handlePdfDragLeave = (e) => { e.preventDefault(); setIsPdfDraggingOver(false); };
//   const handlePdfDrop = (e) => {
//     e.preventDefault();
//     setIsPdfDraggingOver(false);
//     if (e.dataTransfer.files?.length) handlePdfUpload(e.dataTransfer.files);
//   };

//  const handleSendQuery = async (e) => {
//     e.preventDefault();
//     const queryText = currentToolState.input.trim();
//     const isNoteExpander = activeTab === 'Note Expander';
//     const isPdfUploader = activeTab === 'PDF Uploader';
//     const hasImages = isNoteExpander && noteExpanderImages.length > 0;
//     const hasPdf = isPdfUploader && !!selectedPdf;

//     if ((!queryText && !hasImages && !hasPdf) || loading) return; // allow attachment-only submits

//     const userMessage = {
//       id: Date.now().toString(),
//       sender: 'user',
//       text: queryText || (hasImages
//         ? `📎 Uploaded ${noteExpanderImages.length} image(s) of notes`
//         : hasPdf
//           ? `📄 Uploaded ${selectedPdf.name}`
//           : '')
//     };
    
//     setToolStates(prev => ({
//       ...prev,
//       [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, userMessage], input: '' }
//     }));
//     setLoading(true);

// try {
//       let finalQuery = queryText;
//       const isMockReq = queryText.toLowerCase().includes('mock test') || queryText.toLowerCase().includes('test') || queryText.toLowerCase().includes('quiz');

//       // Smart Context Injection for short/ambiguous pronouns (e.g., "where its being used", "its types")
//       const lowerQuery = queryText.toLowerCase();
//       const hasPronoun = lowerQuery.includes('it ') || lowerQuery.includes('its') || lowerQuery.startsWith('where ') || lowerQuery.startsWith('what are its');
//       const previousMessages = toolStates[activeTab]?.messages || [];
      
//       if (hasPronoun && previousMessages.length > 0) {
//         const lastMsg = previousMessages[previousMessages.length - 1];
//         const contextTopic = lastMsg.queryContext || lastMsg.text || '';
//         if (contextTopic) {
//           finalQuery = `${queryText} ( regarding the topic: ${contextTopic} )`;
//         }
//       }

//       if (isMockReq && activeTab === 'Ask Anything') {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: If the user did not specify a question count, generate exactly 50 multiple choice questions. Provide output strictly as a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "topic": "..."}]]`;
//       }

//       if (isNoteExpander) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: The attached images contain a student's incomplete or rough handwritten class notes. Read the images carefully, then: (1) rewrite and expand the notes into complete, well-structured study notes covering the full topic; (2) add a separate "Corrections & Gaps" section that explicitly flags any factual mistakes, conceptual errors, or missing information found in the original notes.]`;
//       }

//       if (isPdfUploader) {
//         finalQuery += `\n\n[SYSTEM INSTRUCTION: The attached PDF is a full textbook, chapter, or reference document. Carefully read through the entire document and produce comprehensive, well-structured study notes covering: (1) a chapter-by-chapter or section-by-section summary of key concepts; (2) all important formulas, definitions, and terminology explicitly called out; (3) a clear, organized outline suitable for exam revision. If the user specified a chapter or topic focus in their instructions, prioritize that section while still noting other relevant content in brief.]`;
//       }

//       let endpoint = 'http://localhost:5000/api/ai/ask-anything';
//       if (activeTab === 'Note Expander') endpoint = 'http://localhost:5000/api/ai/expand-notes';
//       else if (activeTab === 'PDF Uploader') endpoint = 'http://localhost:5000/api/ai/pdf-analysis';

//       const payload = { prompt: finalQuery, tool: activeTab };
//       if (hasImages) {
//         payload.images = noteExpanderImages.map(img => img.base64);
//       }
//       if (hasPdf) {
//         payload.pdf = selectedPdf.base64;
//         payload.pdfName = selectedPdf.name;
//       }

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to process AI generation request.');
//       }

//       const rawContent = data.result || data.text || data.content || JSON.stringify(data);

//       if (isMockReq) {
//         extractAndSavedMockTestSafe(rawContent, queryText);
//         setLoading(false);
//         return;
//       }

//       const aiResponse = { 
//         id: (Date.now() + 1).toString(), 
//         sender: 'ai', 
//         result: rawContent, // Yeh structured object hai (definition, formula, explanation)
//         text: typeof rawContent === 'object' ? rawContent.explanation : String(rawContent), 
//         queryContext: queryText 
//       };

//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { ...prev[activeTab], messages: [...prev[activeTab].messages, aiResponse] }
//       }));

//       if (hasImages) setNoteExpanderImages([]);
//       if (hasPdf) setSelectedPdf(null);

//     }catch (err) {
//       setToolStates(prev => ({
//         ...prev,
//         [activeTab]: { 
//           ...prev[activeTab], 
//           messages: [...prev[activeTab].messages, { 
//             id: Date.now().toString(), 
//             sender: 'ai', 
//             text: `Error: ${err.message}` 
//           }] 
//         }
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOptionSelect = (qIdx, optIdx) => {
//     setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
//   };

//   const handleSubmitTest = () => {
//     let score = 0;
//     let weakTopicsMap = [];

//     activeTest.questions.forEach((q, idx) => {
//       if (selectedAnswers[idx] === q.correct) score += 1;
//       else weakTopicsMap.push(q.topic || activeTest.title);
//     });

//     const percentage = ((score / activeTest.questions.length) * 100).toFixed(1);
//     const weakTopics = [...new Set(weakTopicsMap)];
//     const previousHistory = testHistories[activeTest.id];
//     let comparisonMessage = "This is your first attempt.";
//     let statusColor = themeMode === 'dark' ? "text-zinc-400" : "text-zinc-600";

//     if (previousHistory) {
//       if (percentage > previousHistory.lastPercentage) {
//         comparisonMessage = `Improved! Score went up to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-emerald-500";
//       } else if (percentage < previousHistory.lastPercentage) {
//         comparisonMessage = `Degraded. Score dropped to ${percentage}% (from ${previousHistory.lastPercentage}%).`;
//         statusColor = "text-red-500";
//       } else {
//         comparisonMessage = `Consistent performance at ${percentage}%.`;
//         statusColor = "text-amber-500";
//       }
//     }

//     const resultObj = { score, total: activeTest.questions.length, percentage, weakTopics, comparisonMessage, statusColor };
//     setTestResult(resultObj);
//     const updatedHistory = { ...testHistories, [activeTest.id]: { lastPercentage: parseFloat(percentage), lastScore: score } };
//     setTestHistories(updatedHistory);
//     localStorage.setItem('buitems_test_histories', JSON.stringify(updatedHistory));
//   };

//   const handleRetakeTest = () => {
//     const shuffledQuestions = activeTest.questions.map(q => {
//       const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
//       optionsWithIndex.sort(() => Math.random() - 0.5);
//       return {
//         ...q,
//         options: optionsWithIndex.map(o => o.text),
//         correct: optionsWithIndex.findIndex(o => o.isCorrect)
//       };
//     });
//     setActiveTest({ ...activeTest, questions: shuffledQuestions });
//     setSelectedAnswers({});
//     setTestResult(null);
//     setCurrentQuestionIndex(0);
//   };

//   const handleExitTest = () => {
//     setActiveTest(null);
//     setTestResult(null);
//     setSelectedAnswers({});
//     setCurrentQuestionIndex(0);
//   };

// const handleResetSession = () => {
//     setToolStates(prev => ({ ...prev, [activeTab]: { messages: [], input: '' } }));
//     setActiveBookshelfId(null);
//     localStorage.removeItem('buitems_active_bookshelf_id');
//     setNoteExpanderImages([]);
//     setSelectedPdf(null);
//   };

//   const currentToolState = toolStates[activeTab] || { messages: [], input: '' };
//   const isDark = themeMode === 'dark';
//   const activeShelfObj = bookshelves.find(s => s.id === activeBookshelfId);

//   return (
//     <div className={`flex h-screen ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} font-sans overflow-hidden relative transition-colors`}>
//       {/* Sidebar */}
//       <aside className={`w-64 border-r ${isDark ? 'border-zinc-800/80 bg-zinc-900/40' : 'border-zinc-200 bg-white'} flex flex-col justify-between p-4 z-10`}>
//         <div>
//           <div className="flex items-center gap-3 px-2 py-3 mb-6">
//             <div className={`p-2 rounded-xl ${isDark ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'} font-bold`}>
//               <Lightbulb className="w-5 h-5" />
//             </div>
//             <div>
//               <h1 className="text-sm font-bold tracking-tight">BUITEMS Study AI</h1>
//               <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'} uppercase font-mono`}>{userName}</p>
//             </div>
//           </div>

//           <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'} px-2 mb-2`}>Tools</div>
//           <nav className="space-y-1">
//             {['Ask Anything', 'Note Expander', 'PDF Uploader'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); handleExitTest(); setViewingBookshelf(null); }}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
//                     isActive
//                       ? (isDark ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-zinc-900 text-white font-semibold')
//                       : (isDark ? 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900')
//                   }`}
//                 >
//                   <FileText className="w-4 h-4" /> {name}
//                 </button>
//               );
//             })}
//           </nav>

//           <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'} px-2 mt-6 mb-2`}>Library & Assessment</div>
//           <nav className="space-y-1">
//             {['Personal Bookshelf', 'Mock Tests'].map((name) => {
//               const isActive = activeTab === name;
//               return (
//                 <button
//                   key={name}
//                   onClick={() => { setActiveTab(name); setViewingBookshelf(null); }}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
//                     isActive
//                       ? (isDark ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-zinc-900 text-white font-semibold')
//                       : (isDark ? 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900')
//                   }`}
//                 >
//                   <HelpCircle className="w-4 h-4" /> {name}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         <div>
//           <button
//             onClick={() => setShowSettings(true)}
//             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${isDark ? 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'} transition-colors`}
//           >
//             <Settings className="w-4 h-4" /> Settings
//           </button>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <main className={`flex-1 flex flex-col justify-between ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'} relative overflow-hidden`}>
//         <header className={`h-14 border-b ${isDark ? 'border-zinc-800/80 bg-zinc-950/50' : 'border-zinc-200 bg-white/50'} flex items-center justify-between px-6 backdrop-blur-md`}>
//           <div className="flex items-center gap-3">
//             <div className={`px-3 py-1 rounded-full ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'} border text-[11px] font-mono tracking-wide uppercase`}>
//               Session: {activeTab}
//             </div>
//             {activeBookshelfId && activeTab === 'Ask Anything' && (
//               <span className="text-[11px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
//                 Active Bookshelf: {activeShelfObj ? activeShelfObj.title : 'Custom'}
//               </span>
//             )}
//           </div>
//           {activeTab !== 'Mock Tests' && activeTab !== 'Personal Bookshelf' && (
//             <button onClick={handleResetSession} className={`text-xs font-semibold ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} transition-colors`}>
//               RESET
//             </button>
//           )}
//         </header>

//         {/* ================= PERSONAL BOOKSHELF PAGE ================= */}
//         {activeTab === 'Personal Bookshelf' ? (
//           <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
//             {!viewingBookshelf ? (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className={`text-xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>My Personal Bookshelf</h2>
//                     <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-1`}>Manage your saved study modules and topic notes.</p>
//                   </div>
//                   {bookshelves.length > 0 && (
//                     <button
//                       onClick={handleClearAllBookshelves}
//                       className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Bookshelves
//                     </button>
//                   )}
//                 </div>

//                 {bookshelves.length === 0 ? (
//                   <div className={`p-12 border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'} border-dashed rounded-2xl text-center space-y-3`}>
//                     <BookOpen className="w-10 h-10 mx-auto text-zinc-500 opacity-50" />
//                     <p className="text-sm font-semibold">No bookshelves created yet.</p>
//                     <p className="text-xs max-w-md mx-auto">Go to <span className="font-bold">Ask Anything</span>, generate study notes on any topic, and click the <span className="font-bold text-amber-500">"Save to Bookshelf"</span> button on any response card to create your library.</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {bookshelves.map((shelf) => (
//                       <div
//                         key={shelf.id}
//                         onClick={() => setViewingBookshelf(shelf)}
//                         className={`p-5 ${isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'} border rounded-2xl flex flex-col justify-between h-44 transition-all shadow-lg cursor-pointer group relative`}
//                       >
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className={`text-sm font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize pr-6 flex items-center gap-2`}>
//                               <BookOpen className="w-4 h-4 text-amber-500" /> {shelf.title}
//                             </h3>
//                             <button
//                               onClick={(e) => handleDeleteBookshelf(e, shelf.id)}
//                               title="Delete Bookshelf"
//                               className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-400 mt-1">{shelf.items.length} Saved Sections • Created on {shelf.date}</p>
//                         </div>
//                         <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
//                           <span className={`text-[11px] ${activeBookshelfId === shelf.id ? 'text-emerald-500 font-bold' : 'text-zinc-500'}`}>
//                             {activeBookshelfId === shelf.id ? '● Active Bookshelf' : 'Click to View'}
//                           </span>
//                           <span className={`px-3 py-1.5 ${isDark ? 'bg-zinc-100 text-zinc-950 group-hover:bg-amber-400' : 'bg-zinc-900 text-white'} text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors`}>
//                             Open Shelf <ArrowRight className="w-3.5 h-3.5" />
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               /* Inside a Specific Bookshelf */
//               <div className="space-y-6">
//                 <div className={`p-6 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl flex items-center justify-between`}>
//                   <div>
//                     <button onClick={() => setViewingBookshelf(null)} className="text-xs text-zinc-400 hover:text-zinc-100 mb-1 underline">← Back to All Bookshelves</button>
//                     <h2 className={`text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize flex items-center gap-2`}>
//                       <BookOpen className="w-5 h-5 text-amber-500" /> {viewingBookshelf.title}
//                     </h2>
//                     <p className="text-xs text-zinc-400 mt-0.5">{viewingBookshelf.items.length} saved study components</p>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setActiveBookshelfId(viewingBookshelf.id);
//                       localStorage.setItem('buitems_active_bookshelf_id', viewingBookshelf.id);
//                       alert(`Set "${viewingBookshelf.title}" as your active bookshelf for new saves.`);
//                     }}
//                     className={`px-4 py-2 rounded-xl text-xs font-bold ${activeBookshelfId === viewingBookshelf.id ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}
//                   >
//                     {activeBookshelfId === viewingBookshelf.id ? 'Active for Saving' : 'Set as Active'}
//                   </button>
//                 </div>

//                 {viewingBookshelf.items.length === 0 ? (
//                   <div className={`p-8 border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'} border-dashed rounded-2xl text-center`}>
//                     <p className="text-sm">No items saved in this bookshelf yet.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {viewingBookshelf.items.map((item, idx) => (
//                       <div key={idx} className={`p-5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl space-y-3 shadow-md`}>
//                         <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
//                           <h4 className={`text-xs font-bold uppercase tracking-wider text-amber-500`}>Topic: {item.title || viewingBookshelf.title}</h4>
//                           <span className="text-[10px] text-zinc-500">{item.date}</span>
//                         </div>
//                         <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
//                           {item.text}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ) : activeTab === 'Mock Tests' ? (
//           /* ================= MOCK TESTS PAGE ================= */
//           <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
//             {!activeTest ? (
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className={`text-xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Saved Mock Tests</h2>
//                     <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-1`}>All generated test files are safely stored here.</p>
//                   </div>
//                   {savedTests.length > 0 && (
//                     <button
//                       onClick={handleClearAllTests}
//                       className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" /> Clear All Tests
//                     </button>
//                   )}
//                 </div>

//                 {savedTests.length === 0 ? (
//                   <div className={`p-8 border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'} border-dashed rounded-2xl text-center space-y-2`}>
//                     <p className="text-sm">No mock tests available yet.</p>
//                     <p className="text-xs">Ask anything or type <span className={`font-mono ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>"generate quiz"</span> in "Ask Anything" to create a test (defaults to 50 questions).</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {savedTests.map((test) => (
//                       <div key={test.id} className={`p-5 ${isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'} border rounded-2xl flex flex-col justify-between h-40 transition-colors shadow-lg relative group`}>
//                         <div>
//                           <div className="flex items-start justify-between">
//                             <h3 className={`text-sm font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize pr-6`}>{test.title}</h3>
//                             <button
//                               onClick={(e) => handleDeleteTest(e, test.id)}
//                               title="Delete Test"
//                               className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-[10px] text-zinc-400 mt-1">{test.questions.length} Questions • Created on {test.date}</p>
//                         </div>
//                         <button
//                           onClick={() => { setActiveTest(test); setCurrentQuestionIndex(0); setTestResult(null); setSelectedAnswers({}); }}
//                           className={`self-end px-4 py-2 ${isDark ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'} text-xs font-bold rounded-xl flex items-center gap-2 transition-colors`}
//                         >
//                           Open & Solve Test <ArrowRight className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : activeTest && !testResult ? (
//               <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl p-6 shadow-xl space-y-6`}>
//                 <div className={`flex items-center justify-between border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'} pb-4`}>
//                   <div>
//                     <h2 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize`}>{activeTest.title}</h2>
//                     <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mt-0.5`}>Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
//                   </div>
//                   <button onClick={handleExitTest} className={`text-xs ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} underline`}>Exit to Library</button>
//                 </div>

//                 <div className="space-y-4">
//                   <p className={`text-sm font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{activeTest.questions[currentQuestionIndex].question}</p>
//                   <div className="space-y-2">
//                     {activeTest.questions[currentQuestionIndex].options.map((opt, oIdx) => (
//                       <button
//                         key={oIdx}
//                         onClick={() => handleOptionSelect(currentQuestionIndex, oIdx)}
//                         className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all border ${
//                           selectedAnswers[currentQuestionIndex] === oIdx
//                             ? (isDark ? 'bg-zinc-100 text-zinc-950 font-semibold border-zinc-100' : 'bg-zinc-900 text-white font-semibold border-zinc-900')
//                             : (isDark ? 'bg-zinc-950/60 text-zinc-300 border-zinc-800 hover:bg-zinc-800/50' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100')
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className={`flex justify-between items-center pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
//                   <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className={`px-4 py-2 rounded-xl ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'} text-xs disabled:opacity-40`}>Previous</button>
//                   {currentQuestionIndex < activeTest.questions.length - 1 ? (
//                     <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className={`px-4 py-2 rounded-xl ${isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-white'} text-xs font-bold`}>Next Question</button>
//                   ) : (
//                     <button onClick={handleSubmitTest} className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400">Submit Test</button>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl shadow-xl overflow-hidden space-y-6`}>
//                 <div className={`p-6 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'} flex items-center justify-between`}>
//                   <div className="flex items-center gap-3">
//                     <CheckCircle2 className="w-6 h-6 text-emerald-500" />
//                     <h2 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'} capitalize`}>{activeTest.title} - Results</h2>
//                   </div>
//                   <span className={`text-xs font-bold ${testResult.statusColor} ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'} px-3 py-1.5 rounded-full border`}>
//                     {testResult.comparisonMessage}
//                   </span>
//                 </div>

//                 <div className="px-6 pb-6">
//                   <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
//                     <table className="w-full text-left text-sm">
//                       <thead className={`bg-zinc-500/10 text-xs uppercase font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
//                         <tr>
//                           <th className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>Evaluation Metric</th>
//                           <th className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>Details</th>
//                         </tr>
//                       </thead>
//                       <tbody className={`divide-y ${isDark ? 'divide-zinc-800 text-zinc-300' : 'divide-zinc-200 text-zinc-700'} text-xs`}>
//                         <tr>
//                           <td className={`px-4 py-3 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Total Score</td>
//                           <td className="px-4 py-3">{testResult.score} / {testResult.total}</td>
//                         </tr>
//                         <tr>
//                           <td className={`px-4 py-3 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Percentage Obtained</td>
//                           <td className="px-4 py-3 font-mono font-bold text-amber-500">{testResult.percentage}%</td>
//                         </tr>
//                         <tr>
//                           <td className={`px-4 py-3 font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'} align-top`}>Weak Topics / Improvement Needed</td>
//                           <td className="px-4 py-3">
//                             {testResult.weakTopics.length > 0 ? (
//                               <ul className="list-disc list-inside text-red-500 space-y-1">
//                                 {testResult.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
//                               </ul>
//                             ) : (
//                               <span className="text-emerald-500 font-semibold">Brilliant! All answers were correct.</span>
//                             )}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="pt-6 flex justify-between items-center">
//                     <button onClick={handleExitTest} className={`text-xs ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} underline underline-offset-2`}>
//                       ← Back to Saved Mock Tests
//                     </button>
//                     <button onClick={handleRetakeTest} className={`px-5 py-2.5 rounded-xl ${isDark ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'} text-xs font-bold transition-colors flex items-center gap-2`}>
//                       <RefreshCcw className="w-4 h-4" /> Retake Test (Shuffled Questions)
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           /* ================= NORMAL CHAT VIEW WITH SAVE BUTTON ON RESPONSES ================= */
//           <>
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {currentToolState.messages.length === 0 ? (
//                 <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 max-w-sm mx-auto space-y-2">
//                   <Lightbulb className="w-8 h-8 text-zinc-500 animate-pulse" />
//                   <p className="text-sm font-medium">
//                     {activeTab === 'Note Expander'
//                       ? <>Upload photos of your rough notes below, then ask anything to expand and correct them!</>
//                       : activeTab === 'PDF Uploader'
//                         ? <>Upload your full textbook or reference PDF below, then ask anything to generate complete study notes!</>
//                         : <>Ask anything or type <span className={`font-mono ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>"generate quiz"</span> to create tests!</>
//                     }
//                   </p>
//                 </div>
//               ) : (
//                 currentToolState.messages.map((msg) => (
//                   msg.sender === 'user' ? (
//                     <div key={msg.id} className="flex justify-end w-full">
//                       <div className={`max-w-[80%] ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'} border px-4 py-3 rounded-2xl text-sm flex items-start gap-3`}>
//                         <span className="leading-relaxed whitespace-pre-wrap">{msg.text}</span>
//                         <div className={`p-1 rounded-full ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'} shrink-0 mt-0.5`}><User className="w-3.5 h-3.5" /></div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div key={msg.id} className="space-y-2">
//                       {/* Save Button Header over AI response compartment */}
//                       <div className="flex justify-start">
//                         <button
//                           onClick={() => handleTriggerSave(msg.text, msg.queryContext || 'General Notes')}
//                           className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
//                         >
//                           <BookmarkPlus className="w-3.5 h-3.5" /> Save to Bookshelf
//                         </button>
//                       </div>
//                       <StructuredResponseRenderer message={msg} />
//                     </div>
//                   )
//                 ))
//               )}
//               {loading && <div className={`text-xs font-mono py-2 animate-pulse flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}><div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div> Generating response & study materials...</div>}
//               <div ref={chatEndRef} />
//             </div>

//             <div className={`p-4 ${isDark ? 'bg-zinc-950 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'} border-t`}>
//               <div className="max-w-4xl mx-auto space-y-3">

//                 {/* Note Expander: multi-image dropzone + thumbnail previews */}
//                 {activeTab === 'Note Expander' && (
//                   <div
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                     className={`rounded-2xl border border-dashed transition-colors p-3 ${
//                       isDraggingOver
//                         ? 'border-amber-500 bg-amber-500/5'
//                         : (isDark ? 'border-zinc-800' : 'border-zinc-300')
//                     }`}
//                   >
//                     {noteExpanderImages.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-2">
//                         {noteExpanderImages.map((img) => (
//                           <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 group">
//                             <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(img.id)}
//                               className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-500 text-white rounded-full p-0.5 transition-colors"
//                               title="Remove image"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       onClick={() => noteImageInputRef.current?.click()}
//                       className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-colors ${
//                         isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
//                       }`}
//                     >
//                       <ImagePlus className="w-4 h-4" />
//                       {noteExpanderImages.length > 0 ? 'Add More Photos of Notes' : 'Upload Photos of Your Notes (multiple allowed)'}
//                     </button>
//                     <input
//                       ref={noteImageInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 {/* PDF Uploader: single textbook/reference PDF dropzone + file card */}
//                 {activeTab === 'PDF Uploader' && (
//                   <div
//                     onDragOver={handlePdfDragOver}
//                     onDragLeave={handlePdfDragLeave}
//                     onDrop={handlePdfDrop}
//                     className={`rounded-2xl border border-dashed transition-colors p-3 ${
//                       isPdfDraggingOver
//                         ? 'border-amber-500 bg-amber-500/5'
//                         : (isDark ? 'border-zinc-800' : 'border-zinc-300')
//                     }`}
//                   >
//                     {selectedPdf ? (
//                       <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} mb-2`}>
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
//                             <FileText className="w-5 h-5" />
//                           </div>
//                           <div className="min-w-0">
//                             <p className={`text-xs font-semibold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{selectedPdf.name}</p>
//                             <p className="text-[10px] text-zinc-500">{formatFileSize(selectedPdf.size)}</p>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={removePdf}
//                           title="Remove PDF"
//                           className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg transition-colors shrink-0"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : null}

//                     <button
//                       type="button"
//                       onClick={() => pdfInputRef.current?.click()}
//                       className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-colors ${
//                         isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
//                       }`}
//                     >
//                       <FileUp className="w-4 h-4" />
//                       {selectedPdf ? 'Replace PDF' : 'Upload Your Textbook / Reference PDF'}
//                     </button>
//                     <input
//                       ref={pdfInputRef}
//                       type="file"
//                       accept="application/pdf,.pdf"
//                       onChange={(e) => { handlePdfUpload(e.target.files); e.target.value = ''; }}
//                       className="hidden"
//                     />
//                   </div>
//                 )}

//                 <form onSubmit={handleSendQuery} className={`flex items-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl px-4 py-2.5`}>
//                   <input
//                     type="text" value={currentToolState.input} onChange={handleInputChange}
//                     placeholder={
//                       activeTab === 'Note Expander'
//                         ? 'Add instructions (optional), e.g. "focus on chapter 3"...'
//                         : activeTab === 'PDF Uploader'
//                           ? 'Add instructions (optional), e.g. "focus on Module 6"...'
//                           : 'Ask anything (e.g. what is integration)...'
//                     }
//                     className={`flex-1 bg-transparent border-none outline-none text-sm ${isDark ? 'text-zinc-100 placeholder-zinc-500' : 'text-zinc-900 placeholder-zinc-400'} px-2`}
//                   />
//                   <button
//                     type="submit"
//                     disabled={
//                       loading ||
//                       (!currentToolState.input.trim() &&
//                         !(activeTab === 'Note Expander' && noteExpanderImages.length > 0) &&
//                         !(activeTab === 'PDF Uploader' && selectedPdf))
//                     }
//                     className={`p-2 rounded-xl ${isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-white'} disabled:opacity-40`}
//                   >
//                     <Send className="w-4 h-4" />
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* Save to Bookshelf Prompt Modal */}
//       {showSaveModal && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className={`${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-950'} border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5`}>
//             <div className="flex items-center justify-between border-b pb-3 border-zinc-700/30">
//               <h3 className="text-sm font-bold flex items-center gap-2">
//                 <BookmarkPlus className="w-4 h-4 text-amber-500" /> Create New Personal Bookshelf
//               </h3>
//               <button onClick={() => setShowSaveModal(false)} className="text-zinc-400 hover:text-zinc-100"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <p className="text-zinc-400">You don't have an active bookshelf selected. Name your new bookshelf to save this study material:</p>
//               <input
//                 type="text"
//                 value={newBookshelfName}
//                 onChange={(e) => setNewBookshelfName(e.target.value)}
//                 placeholder="e.g. Calculus Fundamentals, Physics Notes..."
//                 className={`w-full px-3.5 py-2.5 rounded-xl border ${isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'} outline-none font-medium`}
//               />
//             </div>

//             <div className="flex justify-end gap-2 pt-2">
//               <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold">Cancel</button>
//               <button onClick={handleCreateNewBookshelfAndSave} className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400">Create & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Settings Modal */}
//       {showSettings && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className={`${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-950'} border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-6`}>
//             <div className="flex items-center justify-between border-b pb-3 border-zinc-700/30">
//               <h2 className="text-base font-bold">Settings</h2>
//               <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-zinc-100"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="space-y-4 text-xs">
//               <div className={`p-4 rounded-xl ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} border space-y-2`}>
//                 <label className="font-semibold text-zinc-400 uppercase font-mono">Profile Name</label>
//                 {isEditingName ? (
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="text"
//                       value={tempName}
//                       onChange={(e) => setTempName(e.target.value)}
//                       className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-black'} outline-none`}
//                     />
//                     <button onClick={handleSaveName} className="px-3 py-2 bg-emerald-500 text-zinc-950 font-bold rounded-lg">Save</button>
//                   </div>
//                 ) : (
//                   <div className="flex items-center justify-between">
//                     <span className="font-bold text-sm">{userName}</span>
//                     <button onClick={() => setIsEditingName(true)} className="flex items-center gap-1 text-amber-500 hover:underline"><Edit3 className="w-3.5 h-3.5" /> Edit Name</button>
//                   </div>
//                 )}
//               </div>

//               <div className={`p-4 rounded-xl ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} border flex items-center justify-between`}>
//                 <div>
//                   <p className="font-semibold text-zinc-400 uppercase font-mono">Appearance Mode</p>
//                   <p className="font-bold text-sm capitalize mt-0.5">{themeMode} Mode</p>
//                 </div>
//                 <button
//                   onClick={handleToggleTheme}
//                   className={`px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors ${isDark ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'}`}
//                 >
//                   {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
//                   Switch to {isDark ? 'Light' : 'Dark'}
//                 </button>
//               </div>

//               <div className={`p-4 rounded-xl ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} border flex items-center justify-between`}>
//                 <div>
//                   <p className="font-semibold text-zinc-400 uppercase font-mono">Session Control</p>
//                   <p className="text-zinc-500 text-[11px] mt-0.5">Sign out and clear local storage.</p>
//                 </div>
//                 <button
//                   onClick={handleLogout}
//                   className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/20 flex items-center gap-2 transition-colors"
//                 >
//                   <LogOut className="w-4 h-4" /> Logout
//                 </button>
//               </div>
//             </div>

//             <div className="flex justify-end pt-2">
//               <button onClick={() => setShowSettings(false)} className={`px-4 py-2 ${isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-white'} rounded-xl text-xs font-bold`}>Close</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


