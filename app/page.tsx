'use client';
import React, { useState } from 'react';
import { 
  Shield, BookOpen, Users, AlertTriangle, 
  Lock, Sparkles, LogOut, ArrowRight, Activity, 
  Calendar, MessageSquare, RefreshCw, Send
} from 'lucide-react';

// Types
type Role = 'student' | 'counsellor' | null;

interface ChatMessage {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  timestamp: string;
  riskScore?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
}

interface AlertItem {
  id: string;
  studentId: string;
  date: string;
  riskScore: number;
  riskLevel: 'Medium' | 'High';
  snippet: string;
  status: 'Pending' | 'Acknowledged' | 'Resolved';
}

export default function Home() {
  const [currentView, setCurrentView] = useState<'welcome' | 'login' | 'dashboard'>('welcome');
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [activeTab, setActiveTab] = useState<'journal' | 'trends' | 'resources' | 'alerts'>('journal');

  const [selectedMood, setSelectedMood] = useState<{ emoji: string; label: string }>({ emoji: '😊', label: 'Good' });
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat messages history for conversational AI therapist mode
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am MindGuard AI, your confidential wellness partner here at Cavendish University. How are you feeling today, and what is on your mind?',
      timestamp: 'Today, 8:00 AM'
    }
  ]);

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'ALT-8921',
      studentId: 'STUDENT #113-145',
      date: 'Today, 2:15 PM',
      riskScore: 0.89,
      riskLevel: 'High',
      snippet: 'I honestly feel like giving up completely. Nothing is working out and the stress is unbearable...',
      status: 'Pending'
    },
    {
      id: 'ALT-8840',
      studentId: 'STUDENT #112-902',
      date: 'Yesterday, 8:45 PM',
      riskScore: 0.74,
      riskLevel: 'High',
      snippet: 'Cannot sleep for three days straight. Chest is tight and panic attacks will not stop.',
      status: 'Acknowledged'
    }
  ]);

  const moods = [
    { emoji: '😊', label: 'Good' },
    { emoji: '😌', label: 'Calm' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '😢', label: 'Sad' }
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText;
    const timeNow = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'student',
      text: `[Mood: ${selectedMood.label} ${selectedMood.emoji}] ${userMsgText}`,
      timestamp: timeNow
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsSubmitting(true);

    try {
      // Send conversation history to the AI therapist backend route
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMsgText,
          history: updatedMessages.map(m => ({ sender: m.sender, text: m.text }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI therapist');
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.feedback ?? 'I hear you. Let us take things one step at a time. How can we manage this together?',
        timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        riskScore: data.riskScore ?? 0.15,
        riskLevel: data.riskLevel ?? 'Low'
      };

      setMessages(prev => [...prev, aiMessage]);

      // If high risk is detected, automatically log a confidential alert for the counsellor dashboard
      if (data.riskLevel === 'High') {
        const newAlert: AlertItem = {
          id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
          studentId: 'STUDENT #113-145 (You)',
          date: 'Just now',
          riskScore: data.riskScore,
          riskLevel: 'High',
          snippet: userMsgText.substring(0, 90) + '...',
          status: 'Pending'
        };
        setAlerts(prev => [newAlert, ...prev]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const fallbackAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'I am having a brief moment connecting to the secure server, but please remember your well-being matters. Feel free to visit the Cavendish student wellness center.',
        timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        riskLevel: 'Low'
      };
      setMessages(prev => [...prev, fallbackAiMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAlertStatus = (id: string, status: 'Pending' | 'Acknowledged' | 'Resolved') => {
    setAlerts(alerts.map(alt => alt.id === id ? { ...alt, status } : alt));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('welcome')}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-inner flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wide text-white">MindGuard <span className="text-indigo-400">AI</span></span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Cavendish University Zambia</span>
            </div>
          </div>

          {currentView === 'dashboard' ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-slate-200 capitalize font-medium">Role: {selectedRole}</span>
              </div>
              <button 
                onClick={() => { setCurrentView('welcome'); setSelectedRole(null); }}
                className="flex items-center space-x-1 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-300 px-3 py-1.5 rounded-lg border border-red-500/30 transition"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setCurrentView('login')}
                className="text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
              >
                Access Prototype Portal
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {currentView === 'welcome' && (
          <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
            <div className="text-center space-y-4 max-w-3xl mb-12">
              <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border border-indigo-200">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>Interactive AI Wellness & Virtual Therapist MVP</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Conversational Support & Proactive Care for Students
              </h1>
              <p className="text-base sm:text-lg text-slate-600">
                Designed for Cavendish University Zambia. Chat interactively with an empathetic AI wellness partner while ensuring seamless institutional backup.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => { setSelectedRole('student'); setCurrentView('dashboard'); setActiveTab('journal'); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Launch Student Therapy Chat</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => { setSelectedRole('counsellor'); setCurrentView('dashboard'); setActiveTab('alerts'); }}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <Users className="h-5 w-5" />
                  <span>Launch Counsellor Dashboard</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Interactive AI Therapist</h3>
                <p className="text-slate-600 text-sm">
                  Have back-and-forth therapeutic conversations in real-time with continuous contextual memory.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Continuous Risk Triage</h3>
                <p className="text-slate-600 text-sm">
                  Advanced NLP assesses emotional markers dynamically throughout the chat session.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Confidential Alerting</h3>
                <p className="text-slate-600 text-sm">
                  High-risk indicators securely notify university counselors for timely professional support.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'login' && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Prototype Portal Access</h2>
                <p className="text-sm text-slate-500">Select your user role to explore the MVP features</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => { setSelectedRole('student'); setCurrentView('dashboard'); setActiveTab('journal'); }}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900">Student Portal (Therapy Chat)</div>
                      <div className="text-xs text-slate-500">Interactive chat, mood tracking & coping tips</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
                </button>

                <button 
                  onClick={() => { setSelectedRole('counsellor'); setCurrentView('dashboard'); setActiveTab('alerts'); }}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900">Counsellor Dashboard</div>
                      <div className="text-xs text-slate-500">Review risk alerts and manage student support</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-600" />
                </button>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setCurrentView('welcome')}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  ← Back to Home Overview
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'dashboard' && (
          <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {selectedRole === 'student' ? 'Student Wellness & Virtual Therapist' : 'Counsellor Risk & Alert Dashboard'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {selectedRole === 'student' ? 'Chat interactively with MindGuard AI for guidance and stress management.' : 'Monitor flagged student risk entries and coordinate institutional interventions.'}
                </p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                {selectedRole === 'student' ? (
                  <>
                    <button 
                      onClick={() => setActiveTab('journal')}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'journal' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Therapy Chat
                    </button>
                    <button 
                      onClick={() => setActiveTab('trends')}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'trends' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Mood Trends
                    </button>
                    <button 
                      onClick={() => setActiveTab('resources')}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'resources' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Coping Tips
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setActiveTab('alerts')}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-amber-700 shadow-sm"
                  >
                    Risk Alerts ({alerts.filter(a => a.status === 'Pending').length} Pending)
                  </button>
                )}
              </div>
            </div>

            {selectedRole === 'student' && activeTab === 'journal' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Interactive Chat Interface */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-`150`">
                  <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Chat with MindGuard AI</h3>
                      <p className="text-xs text-slate-500">Your secure, confidential virtual wellness counselor.</p>
                    </div>
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Active Session</span>
                    </span>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'student' 
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' 
                            : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                        }`}>
                          {msg.text}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                          {msg.riskLevel && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              msg.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                              msg.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              Risk: {msg.riskLevel}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {isSubmitting && (
                      <div className="flex items-center space-x-2 text-slate-400 text-xs italic bg-slate-50 p-3 rounded-2xl w-fit border border-slate-100">
                        <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                        <span>MindGuard AI is reflecting and preparing a response...</span>
                      </div>
                    )}
                  </div>

                  {/* Message Input & Mood Selector Bar */}
                  <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex space-x-2 overflow-x-auto pb-1">
                      {moods.map((m) => (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => setSelectedMood(m)}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition shrink-0 ${
                            selectedMood.label === m.label 
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-500/20 font-bold' 
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                          }`}
                        >
                          <span>{m.emoji}</span>
                          <span>{m.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your thoughts, worries, or reply to the AI counselor..."
                        className="flex-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400 text-sm"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white p-3 rounded-xl shadow transition flex items-center justify-center disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Side Info & Quick Tips */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <div className="flex items-center space-x-2 text-indigo-700 font-bold">
                      <Sparkles className="h-5 w-5" />
                      <h4>Therapeutic Support Guide</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      This chat is designed to help you process academic stress, anxiety, or personal challenges in a judgment-free space.
                    </p>
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2">
                      <span className="text-xs font-bold text-indigo-900 block">Confidentiality Guarantee</span>
                      <p className="text-xs text-indigo-700 leading-relaxed">
                        Your conversations are private. Only high-risk distress signals trigger proactive university support options.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'student' && activeTab === 'trends' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Your Emotional & Mood Trends</h3>
                    <p className="text-xs text-slate-500">Historical view of your session reflections.</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Streak: 6 Days</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">Recent Therapy Session Logs</h4>
                  <div className="space-y-3">
                    {messages.filter(m => m.sender === 'student').map((entry) => (
                      <div key={entry.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{entry.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600">{entry.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'student' && activeTab === 'resources' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Personalized Coping & Wellness Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-2">
                    <span className="text-xs bg-indigo-200 text-indigo-800 font-bold px-2 py-0.5 rounded">Anxiety Relief</span>
                    <h4 className="font-bold text-slate-900 text-base">5-Minute Box Breathing Exercise</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, and hold for 4 seconds. Proven to lower heart rate and reduce acute stress.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">Campus Support</span>
                    <h4 className="font-bold text-slate-900 text-base">Cavendish University Counselling Unit</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Professional on-campus counselling is available for all registered students. Walk-ins welcome weekdays from 9:00 AM to 4:00 PM.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'counsellor' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Confidential Student Risk Alerts</h3>
                    <p className="text-xs text-slate-500">Automated NLP risk triage dashboard for Cavendish University counselling staff.</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                    {alerts.filter(a => a.status === 'Pending').length} Pending Action Required
                  </span>
                </div>

                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-5 rounded-xl border transition space-y-3 ${
                        alert.riskLevel === 'High' ? 'border-red-300 bg-red-50/30' : 'border-amber-300 bg-amber-50/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg font-bold text-xs ${
                            alert.riskLevel === 'High' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                          }`}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                              <span>{alert.studentId}</span>
                              <span className="text-xs font-normal text-slate-500">({alert.id})</span>
                            </div>
                            <span className="text-xs text-slate-500">Flagged at: {alert.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            alert.riskLevel === 'High' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            Risk Score: {Math.round(alert.riskScore * 100)}% ({alert.riskLevel})
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            alert.status === 'Pending' ? 'bg-slate-200 text-slate-700' :
                            alert.status === 'Acknowledged' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {alert.status}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 italic">
                        &quot;{alert.snippet}&quot;
                      </div>

                      <div className="flex flex-wrap items-center justify-between pt-2 gap-2 border-t border-slate-200/60">
                        <div className="text-xs text-slate-500 flex items-center space-x-1">
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Confidential institutional follow-up protocol active</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {alert.status !== 'Acknowledged' && (
                            <button
                              onClick={() => updateAlertStatus(alert.id, 'Acknowledged')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                            >
                              Acknowledge
                            </button>
                          )}
                          {alert.status !== 'Resolved' && (
                            <button
                              onClick={() => updateAlertStatus(alert.id, 'Resolved')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}