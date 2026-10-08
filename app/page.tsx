'use client';
import React, { useState } from 'react';
import { 
  Shield, BookOpen, Users, AlertTriangle, 
  Lock, Sparkles, LogOut, ArrowRight, Activity, 
  Calendar, MessageSquare, RefreshCw 
} from 'lucide-react';

// Types
type Role = 'student' | 'counsellor' | null;

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  moodEmoji: string;
  text: string;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  feedback: string;
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
  const [journalText, setJournalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JournalEntry | null>(null);

  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: 'Oct 4, 2026',
      mood: 'Calm',
      moodEmoji: '😌',
      text: 'Had a productive study session at the library today. Finished my software engineering assignment early.',
      riskScore: 0.12,
      riskLevel: 'Low',
      feedback: 'Great job maintaining your study routine! Keep up the balanced approach.'
    },
    {
      id: '2',
      date: 'Oct 6, 2026',
      mood: 'Anxious',
      moodEmoji: '😰',
      text: 'So much pressure building up with midterms and tuition fee deadlines approaching. Feeling overwhelmed and losing sleep.',
      riskScore: 0.68,
      riskLevel: 'Medium',
      feedback: 'We noticed you are feeling overwhelmed. Remember to take 5-minute breathing breaks and visit the Cavendish student wellness center if needed.'
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
    },
    {
      id: 'ALT-8712',
      studentId: 'STUDENT #114-305',
      date: 'Oct 5, 2026',
      riskScore: 0.65,
      riskLevel: 'Medium',
      snippet: 'Feeling extremely isolated and lonely away from home this semester.',
      status: 'Resolved'
    }
  ]);

  const moods = [
    { emoji: '😊', label: 'Good' },
    { emoji: '😌', label: 'Calm' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '😢', label: 'Sad' }
  ];

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: journalText,
          mood: selectedMood.label,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze journal entry');
      }

      const data = await response.json();

      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood: selectedMood.label,
        moodEmoji: selectedMood.emoji,
        text: journalText,
        riskScore: data.riskScore ?? 0.15,
        riskLevel: data.riskLevel ?? 'Low',
        feedback: data.feedback ?? 'Thank you for journaling. Keep prioritizing your wellness!'
      };

      if (newEntry.riskLevel === 'High') {
        const newAlert: AlertItem = {
          id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
          studentId: 'STUDENT #113-145 (You)',
          date: 'Just now',
          riskScore: newEntry.riskScore,
          riskLevel: 'High',
          snippet: journalText.substring(0, 90) + '...',
          status: 'Pending'
        };
        setAlerts([newAlert, ...alerts]);
      }

      setEntries([newEntry, ...entries]);
      setAnalysisResult(newEntry);
      setJournalText('');
    } catch (error) {
      console.error('Error submitting journal:', error);
      alert('There was an error connecting to the AI analysis service. Please try again.');
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
                <span>AI-Based Mental Wellness & Early Risk Detection MVP</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Private Journaling & Proactive Support for Students
              </h1>
              <p className="text-base sm:text-lg text-slate-600">
                Designed for Cavendish University Zambia. Helping students privately reflect while enabling timely psychological intervention before distress escalates.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => { setSelectedRole('student'); setCurrentView('dashboard'); setActiveTab('journal'); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Launch Student Journal Portal</span>
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
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Private Digital Journal</h3>
                <p className="text-slate-600 text-sm">
                  Record daily thoughts, mood selections, and reflections in a secure, stigma-free digital space.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">AI Sentiment & Risk NLP</h3>
                <p className="text-slate-600 text-sm">
                  Instant natural language analysis detects emotional markers and provides immediate coping resources.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Confidential Alerting</h3>
                <p className="text-slate-600 text-sm">
                  High-risk entries securely trigger notifications for university counsellors for proactive triage and care.
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
                      <div className="font-bold text-slate-900">Student Portal</div>
                      <div className="text-xs text-slate-500">Journal entries, mood tracking & coping tips</div>
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
                  {selectedRole === 'student' ? 'Student Wellness & Journal' : 'Counsellor Risk & Alert Dashboard'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {selectedRole === 'student' ? 'Record daily thoughts securely and receive AI-guided wellness insights.' : 'Monitor flagged student risk entries and coordinate institutional interventions.'}
                </p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                {selectedRole === 'student' ? (
                  <>
                    <button 
                      onClick={() => setActiveTab('journal')}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'journal' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      New Journal & AI
                    </button>
                    <button 
                      onClick={() => setActiveTab('trends')}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'trends' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Mood Trends & History
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
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">How are you feeling today?</h3>
                    <p className="text-xs text-slate-500">Select your current mood and write freely. Your entry is private and analyzed securely.</p>
                  </div>

                  <form onSubmit={handleJournalSubmit} className="space-y-5">
                    <div className="flex space-x-3 overflow-x-auto pb-2">
                      {moods.map((m) => (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => setSelectedMood(m)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition min-w-18 ${selectedMood.label === m.label ? 'border-indigo-600 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                        >
                          <span className="text-2xl mb-1">{m.emoji}</span>
                          <span className="text-xs font-medium">{m.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Journal Reflection</label>
                      <textarea
                        rows={6}
                        value={journalText}
                        onChange={(e) => setJournalText(e.target.value)}
                        placeholder="Write freely about your day, academic stress, thoughts, or feelings..."
                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400 text-sm resize-none"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin text-white" />
                          <span>Running AI Sentiment & Risk Analysis...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 text-indigo-200" />
                          <span>Save & Analyze Entry</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <div className="flex items-center space-x-2 text-indigo-700 font-bold">
                      <Sparkles className="h-5 w-5" />
                      <h4>Latest AI Analysis</h4>
                    </div>

                    {analysisResult ? (
                      <div className="space-y-4 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">{analysisResult.date}</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            analysisResult.riskLevel === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                            analysisResult.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}>
                            Risk Level: {analysisResult.riskLevel} ({Math.round(analysisResult.riskScore * 100)}%)
                          </span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                          &quot;{analysisResult.text.substring(0, 120)}...&quot;
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-800">Personalized Feedback & Guidance:</span>
                          <p className="text-xs text-slate-600 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                            {analysisResult.feedback}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 space-y-2">
                        <MessageSquare className="h-8 w-8 mx-auto opacity-40" />
                        <p className="text-xs">Submit a journal entry to view instant AI feedback and risk classification.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'student' && activeTab === 'trends' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Your Emotional & Mood Trends</h3>
                    <p className="text-xs text-slate-500">Historical view of your recorded reflections.</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Streak: 6 Days</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">Recent Journal Log History</h4>
                  <div className="space-y-3">
                    {entries.map((entry) => (
                      <div key={entry.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{entry.moodEmoji}</span>
                            <span className="font-bold text-sm text-slate-900">{entry.mood}</span>
                            <span className="text-xs text-slate-400">{entry.date}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            entry.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                            entry.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            Risk: {entry.riskLevel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">{entry.text}</p>
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