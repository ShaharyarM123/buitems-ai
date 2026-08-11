'use client';

import React, { useState, useEffect } from 'react';
import { Timer, Award, AlertCircle, CheckCircle2, RefreshCw, BarChart2 } from 'lucide-react';

export default function MockTestEngine({ topicName = "Applied Physics & Calculus" }) {
  const [difficulty, setDifficulty] = useState('Standard');
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreData, setScoreData] = useState(null);

  // Mock Question Bank with Difficulty Tiers
  const questions = [
    {
      id: 1,
      question: "What is the derivative of $f(x) = e^{2x} \\sin(x)$?",
      options: [
        "e^{2x}(2\\sin(x) + \\cos(x))",
        "e^{2x}\\cos(x)",
        "2e^{2x}\\sin(x)",
        "e^{x}(2\\sin(x) - \\cos(x))"
      ],
      correct: 0,
      weakTopicCategory: "Calculus - Product & Chain Rule",
      explanation: "Requires applying both product rule and chain rule on exponential and trigonometric functions."
    },
    {
      id: 2,
      question: "In vector calculus, what does the divergence of a magnetic field vector always equal?",
      options: ["Zero", "Permeability constant", "Electric flux", "Infinity"],
      correct: 0,
      weakTopicCategory: "Applied Physics - Maxwell's Equations",
      explanation: "Gauss's law for magnetism states that magnetic monopoles do not exist, making divergence zero."
    }
  ];

  useEffect(() => {
    let timer;
    if (isExamStarted && !isSubmitted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmitExam();
    }
    return () => clearInterval(timer);
  }, [isExamStarted, timeLeft, isSubmitted]);

  const handleSelectOption = (optIndex) => {
    setUserAnswers({ ...userAnswers, [currentQIndex]: optIndex });
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    let correctCount = 0;
    let missedTopics = [];

    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) {
        correctCount++;
      } else {
        missedTopics.push(q.weakTopicCategory);
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScoreData({
      score: finalScore,
      correctCount,
      total: questions.length,
      weakTopics: [...new Set(missedTopics)],
      previousComparison: "+12% improvement compared to last attempt"
    });
  };

  if (!isExamStarted) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center space-y-6">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 w-fit mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <Award className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">BUITEMS Mock Exam Engine</h2>
          <p className="text-sm text-zinc-500">Topic: {topicName}</p>
        </div>

        <div className="space-y-3 text-left max-w-sm mx-auto">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Difficulty Tier</label>
          <div className="grid grid-cols-3 gap-2">
            {['Simple', 'Standard', 'Hard'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  difficulty === lvl 
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent' 
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => { setIsExamStarted(true); setTimeLeft(difficulty === 'Hard' ? 180 : 300); }}
          className="w-full max-w-sm py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white font-semibold text-sm shadow-lg transition-all mx-auto block"
        >
          Start Timed Assessment
        </button>
      </div>
    );
  }

  if (isSubmitted && scoreData) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-zinc-500" /> Exam Performance Analytics
          </h2>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
            Score: {scoreData.score}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 uppercase font-semibold">Correct Answers</p>
            <p className="text-2xl font-bold mt-1">{scoreData.correctCount} / {scoreData.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 uppercase font-semibold">Progress Comparison</p>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">{scoreData.previousComparison}</p>
          </div>
        </div>

        {scoreData.weakTopics.length > 0 && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Identified Weak Topics for Targeted Revision
            </span>
            <ul className="list-disc list-inside text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
              {scoreData.weakTopics.map((topic, i) => (
                <li key={i}>{topic}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => { setIsExamStarted(false); setIsSubmitted(false); setUserAnswers({}); setCurrentQIndex(0); }}
          className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white font-semibold text-sm transition-all"
        >
          Retake Mock Assessment (Randomized Pool)
        </button>
      </div>
    );
  }

  const q = questions[currentQIndex];

  return (
    <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
          Question {currentQIndex + 1} of {questions.length} ({difficulty} Mode)
        </span>
        <span className="text-xs font-mono font-bold flex items-center gap-1.5 text-amber-500">
          <Timer className="w-4 h-4" /> {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
        </span>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">{q.question}</h3>
        
        <div className="space-y-2">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${
                userAnswers[currentQIndex] === idx
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          disabled={currentQIndex === 0}
          onClick={() => setCurrentQIndex(prev => prev - 1)}
          className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold disabled:opacity-40"
        >
          Previous
        </button>

        {currentQIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQIndex(prev => prev + 1)}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold"
          >
            Next Question
          </button>
        ) : (
          <button
            onClick={handleSubmitExam}
            className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-lg"
          >
            Submit Assessment
          </button>
        )}
      </div>
    </div>
  );
}