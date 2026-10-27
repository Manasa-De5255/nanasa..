import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  X,
  Languages,
  Bot,
  User,
  RotateCcw
} from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  language: string;
  timestamp: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', name: 'English', label: 'English' },
  { code: 'ta-IN', name: 'Tamil', label: 'தமிழ்' },
  { code: 'hi-IN', name: 'Hindi', label: 'हिन्दी' },
  { code: 'te-IN', name: 'Telugu', label: 'తెలుగు' },
  { code: 'ml-IN', name: 'Malayalam', label: 'മലയാളം' },
];

const SAMPLE_QUESTIONS: Record<string, string[]> = {
  English: [
    'When do the May 2026 semester exams begin?',
    'How do I file an anonymous campus grievance?',
    'Where is the Glasshouse Innovation Sandbox located?',
    'When are professor monthly payslips credited?',
  ],
  Tamil: [
    'மே 2026 செமஸ்டர் தேர்வுகள் எப்போது தொடங்கும்?',
    'ரகசியமாக வளாகத்தில் கோரிக்கை வைப்பது எப்படி?',
    'இன்னோவேஷன் சாண்ட்பாக்ஸ் எங்கு உள்ளது?',
    'பேராசிரியர்களின் ஊதிய சீட்டு எப்போது கிடைக்கும்?',
  ],
  Hindi: [
    'मई 2026 की सेमेस्टर परीक्षाएं कब शुरू होंगी?',
    'गुमनाम रूप से शिकायत कैसे दर्ज करें?',
    'इनोवेशन सैंडबॉक्स परिसर में कहाँ है?',
    'संकाय वेतन पर्ची कब जारी होती है?',
  ],
  Telugu: [
    'మే 2026 సెమిస్టర్ పరీక్షలు ఎప్పుడు ప్రారంభమవుతాయి?',
    'అజ్ఞాతంగా ఫిర్యాదు ఎలా దాఖలు చేయాలి?',
    'ఇన్నోవేషన్ సాండ్‌బాక్స్ ఎక్కడ ఉంది?',
    'ప్రొఫెసర్ల పేస్లిప్ ఎప్పుడు వస్తుంది?',
  ],
  Malayalam: [
    'മെയ് 2026 സെമസ്റ്റർ പരീക്ഷകൾ എപ്പോൾ തുടങ്ങും?',
    'അജ്ഞാതമായി ഒരു പരാതി എങ്ങനെ നൽകാം?',
    'ഇന്നൊവേഷൻ സാൻഡ്ബോക്സ് എവിടെയാണ്?',
    'പ്രൊഫസർമാരുടെ പേസ്ലിപ്പ് എപ്പോൾ ലഭിക്കും?',
  ],
};

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [selectedLang, setSelectedLang] = useState<string>('English');
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: 'Hello! I am Unicore Mitra, your campus voice assistant. Ask me anything about class timetables, exams, payslips, or campus spots in English, தமிழ், हिन्दी, తెలుగు, or മലയാളം.',
      language: 'English',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langObj = SUPPORTED_LANGUAGES.find((l) => l.name === selectedLang);
      recognition.lang = langObj?.code || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
          handleSendQuery(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser window. Please type your query in the input box.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.name === selectedLang);
      recognitionRef.current.lang = langObj?.code || 'en-IN';
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Mic start error', e);
      }
    }
  };

  const speakText = (text: string, langName: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.name === langName);
    utterance.lang = langObj?.code || 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      language: selectedLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          language: selectedLang,
          role: user?.role || 'student',
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'I am ready to assist with your campus queries.';

      const botMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: reply,
        language: selectedLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(reply, selectedLang);
    } catch (err) {
      const errorMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: 'Sorry, I encountered a temporary connection issue. Please check your timetable or ask again.',
        language: selectedLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentQuestions = SAMPLE_QUESTIONS[selectedLang] || SAMPLE_QUESTIONS.English;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl bg-surface border border-subtle shadow-2xl flex flex-col h-[600px] text-main overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-subtle bg-subtle/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand/10 text-brand">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-main">Unicore Mitra</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand/15 text-brand">
                  Multilingual AI
                </span>
              </div>
              <p className="text-[11px] text-muted-custom">
                Tamil · English · Hindi · Telugu · Malayalam
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                title="Mute spoken response"
                className="p-1.5 rounded-lg text-rose-600 bg-rose-50 dark:bg-rose-950/40 cursor-pointer"
              >
                <VolumeX className="w-4 h-4 animate-pulse" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-custom hover:text-main cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language Selector Bar */}
        <div className="px-4 py-2 bg-subtle/80 border-b border-subtle flex items-center gap-1.5 overflow-x-auto text-xs">
          <Languages className="w-3.5 h-3.5 text-muted-custom shrink-0 mr-1" />
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.name}
              onClick={() => setSelectedLang(lang.name)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                selectedLang === lang.name
                  ? 'bg-brand text-brand-contrast font-bold shadow-2xs'
                  : 'text-muted-custom hover:text-main'
              }`}
            >
              {lang.name} ({lang.label})
            </button>
          ))}
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => {
            const isBot = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isBot ? 'bg-brand/10 text-brand' : 'bg-subtle text-muted-custom'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                    isBot
                      ? 'bg-subtle/70 text-main border border-subtle rounded-tl-xs'
                      : 'bg-brand text-brand-contrast rounded-tr-xs'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <div
                    className={`flex items-center justify-between text-[10px] ${
                      isBot ? 'text-muted-custom' : 'text-brand-contrast/70'
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {isBot && (
                      <button
                        onClick={() => speakText(m.text, m.language)}
                        className="hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2 mr-auto items-center text-xs text-muted-custom p-2">
              <Bot className="w-4 h-4 text-brand animate-spin" />
              <span>Thinking in {selectedLang}...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-subtle/40 border-t border-subtle flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-muted-custom shrink-0 font-medium">Ask:</span>
          {currentQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputQuery(q);
                handleSendQuery(q);
              }}
              className="px-2.5 py-1 rounded-full bg-surface border border-subtle hover:border-brand/40 text-muted-custom hover:text-main whitespace-nowrap cursor-pointer transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-surface border-t border-subtle flex items-center gap-2">
          <button
            onClick={toggleMic}
            title={isListening ? 'Stop listening' : 'Start microphone speech input'}
            className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-subtle text-muted-custom hover:text-main border border-subtle'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            placeholder={
              isListening
                ? `Listening in ${selectedLang}... speak now`
                : `Ask in ${selectedLang} (e.g. exams, timetable, payslips)...`
            }
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-subtle bg-subtle/40 text-main focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand"
          />

          <button
            onClick={() => handleSendQuery()}
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 rounded-xl bg-brand text-brand-contrast hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
