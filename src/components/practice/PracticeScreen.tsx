import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { TranscriptMessage } from '../../types';
import { SYSTEM_PROMPT, PERSONA_PROFILES } from '../../constants';
import { generateCopilotSuggestion } from '../../services/geminiService';
import { getUserProfile } from '../../services/userProfileService';
import Spinner from '../ui/Spinner';
import Logo from '../ui/Logo';
import { MagicWandIcon, MicrophoneIcon } from '../ui/icons';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // result is "data:audio/webm;base64,...."
      // we only need the part after the comma
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const speakText = (text: string, tone: string = 'neutral'): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!window.speechSynthesis) {
            console.warn("Speech synthesis not supported by this browser.");
            resolve();
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
            console.error("Speech synthesis error:", e);
            reject(e);
        };
        
        const voices = window.speechSynthesis.getVoices();
        // Prioritize high-quality, natural-sounding voices if available
        const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) 
            || voices.find(v => v.name.toLowerCase().includes('natural') && v.lang.startsWith('en'))
            || voices.find(v => v.lang.startsWith('en-US'));
            
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        // Adjust pitch and rate based on emotional tone
        switch (tone) {
            case 'enthusiastic':
                utterance.pitch = 1.2;
                utterance.rate = 1.1;
                break;
            case 'impressed':
                 utterance.pitch = 1.1;
                 utterance.rate = 1.05;
                 break;
            case 'skeptical':
                utterance.pitch = 0.9;
                utterance.rate = 0.95;
                break;
            case 'impatient':
                utterance.pitch = 1.0;
                utterance.rate = 1.15;
                break;
            case 'curious':
                utterance.pitch = 1.1;
                utterance.rate = 1.0;
                break;
            default: // neutral
                utterance.pitch = 1.0;
                utterance.rate = 1.0;
                break;
        }

        window.speechSynthesis.speak(utterance);
    });
};


const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

// FIX: Reverted to process.env.API_KEY to align with Gemini API guidelines and fix TypeScript error.
const API_KEY = process.env.API_KEY;

interface PracticeScreenProps {
  onPracticeComplete: (transcript: string) => void;
  userEmail: string;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({ onPracticeComplete, userEmail }) => {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'speaking' | 'error' | 'ending'>('idle');
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [copilotSuggestion, setCopilotSuggestion] = useState('Start the conversation to get your first tip.');
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<{name: string, description: string} | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const systemInstructionRef = useRef('');

  // FIX: Add a ref to track the latest status value. This prevents stale closures
  // in asynchronous callbacks and event listeners like `processAndSendAudio`.
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const onPracticeCompleteRef = useRef(onPracticeComplete);
  onPracticeCompleteRef.current = onPracticeComplete;
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  const cleanupResources = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    window.speechSynthesis?.cancel();
  }, []);

  const handleEndSession = useCallback(() => {
    cleanupResources();
    setStatus('idle');
    setIsRecording(false);
    setSessionStarted(false);
    const finalTranscript = transcriptRef.current.map(msg => `${msg.author === 'user' ? 'Student' : 'Debbie'}: ${msg.text}`).join('\n');
    onPracticeCompleteRef.current(finalTranscript);
  }, [cleanupResources]);
  
  // Effect to handle graceful session ending when timer runs out
  useEffect(() => {
    if (timeLeft <= 0 && sessionStarted && status !== 'ending') {
      setStatus('ending');
      if (isRecording) {
        stopRecording(); // Stop recording and let the processing finish
      }
    }
  }, [timeLeft, sessionStarted, status, isRecording]);
  
  // Effect to transition to assessment screen after the final turn
  useEffect(() => {
    // FIX: This logic had a type error because it checked if status was 'processing' inside a block where status was already 'ending'.
    // The check was redundant, as the state machine ensures this only triggers after any AI turn is complete.
    if (status === 'ending' && !isRecording && mediaRecorderRef.current?.state !== 'recording') {
       handleEndSession();
    }
  }, [status, isRecording, handleEndSession]);

  const fetchCopilotSuggestion = useCallback(async (currentTranscript: TranscriptMessage[]) => {
    setIsCopilotLoading(true);
    const fullTranscript = currentTranscript.map(msg => `${msg.author === 'user' ? 'Student' : 'Debbie'}: ${msg.text}`).join('\n');
    const suggestion = await generateCopilotSuggestion(fullTranscript);
    setCopilotSuggestion(suggestion);
    setIsCopilotLoading(false);
  }, []);

  useEffect(() => {
    if (sessionStarted && timeLeft > 0) {
      const intervalId = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [sessionStarted, timeLeft]);
  
  const processAndSendAudio = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
        console.log("No audio recorded.");
        // FIX: Use statusRef to get latest status. The `status` from closure could be stale.
        setStatus(statusRef.current === 'ending' ? 'ending' : 'idle');
        return;
    }
    setStatus('processing');
    
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];
    
    try {
        const base64Audio = await blobToBase64(audioBlob);
        
        const history = transcriptRef.current.map(msg => ({
            role: msg.author === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));
        
        const contents = [
            ...history,
            {
                role: 'user',
                parts: [
                    { inlineData: { mimeType: audioBlob.type, data: base64Audio } },
                    { text: "Transcribe my audio and then provide Debbie's response based on her persona and the conversation." }
                ],
            },
        ];

        if (!aiRef.current) throw new Error("AI service not initialized");

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                userTranscription: {
                    type: Type.STRING,
                    description: 'A precise transcription of the user\'s spoken audio.',
                },
                debbieResponse: {
                    type: Type.STRING,
                    description: 'Debbie\'s spoken response to the user, in character, following all persona and formatting rules. Maximum 200 tokens.',
                },
                debbieTone: {
                    type: Type.STRING,
                    description: "The emotional tone for Debbie's response. Must be one of: 'neutral', 'curious', 'enthusiastic', 'skeptical', 'impatient', 'impressed'."
                }
            },
            required: ['userTranscription', 'debbieResponse', 'debbieTone'],
        };

        const response = await aiRef.current.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents as any,
            config: {
                systemInstruction: systemInstructionRef.current,
                responseMimeType: 'application/json',
                responseSchema,
            },
        });

        const jsonResponse = JSON.parse(response.text);
        const { userTranscription, debbieResponse, debbieTone } = jsonResponse;

        if (!userTranscription || !debbieResponse) {
            throw new Error("Invalid response structure from AI.");
        }

        const newMessages: TranscriptMessage[] = [
            { author: 'user', text: userTranscription },
            { author: 'debbie', text: debbieResponse },
        ];

        const updatedTranscript = [...transcriptRef.current, ...newMessages];
        setTranscript(updatedTranscript);
        
        // Don't fetch new suggestions if the session is ending
        // FIX: Use statusRef to get the latest status and avoid stale closure issues.
        if (statusRef.current !== 'ending') {
            fetchCopilotSuggestion(updatedTranscript);
        }

        setStatus('speaking');
        await speakText(debbieResponse, debbieTone);
        // FIX: Use statusRef to get latest status. The `status` from closure could be stale,
        // preventing the session from ending correctly.
        setStatus(statusRef.current === 'ending' ? 'ending' : 'idle');

    } catch (error) {
        console.error("Error processing audio or with Gemini API:", error);
        setStatus('error');
    }
    // FIX: Removed `status` from dependency array as we are now using a ref to get the latest value.
  }, [fetchCopilotSuggestion]);

  const startRecording = useCallback(() => {
    if (!mediaStreamRef.current || isRecording) return;
    
    const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
    const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
    
    if (!supportedMimeType) {
        console.error("No supported MIME type for MediaRecorder");
        setStatus('error');
        return;
    }

    const mediaRecorder = new MediaRecorder(mediaStreamRef.current, { mimeType: supportedMimeType });
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunksRef.current.push(event.data);
    });

    mediaRecorder.addEventListener("stop", processAndSendAudio);
    
    mediaRecorder.start();
    setIsRecording(true);
    setStatus('recording');
  }, [isRecording, processAndSendAudio]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }, [isRecording]);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);


  const handleStartSession = useCallback(async () => {
    if (!API_KEY) {
        setStatus('error');
        // FIX: Updated alert message to be generic, not Vite-specific.
        alert("API Key not found. Please configure your environment variables.");
        return;
    }

    const persona = PERSONA_PROFILES[Math.floor(Math.random() * PERSONA_PROFILES.length)];
    setCurrentPersona(persona);
    
    const userProfile = await getUserProfile(userEmail);
    // Use the last 2 assessments for brevity in the prompt
    const historyText = userProfile.assessments.length > 0 
        ? userProfile.assessments.slice(-2).join('\n---\n') 
        : "This is the user's first session.";

    systemInstructionRef.current = SYSTEM_PROMPT
      .replace('{{USER_HISTORY}}', historyText)
      .replace('[PERSONA TYPE]', persona.description)
      .replace('[SKILL_LEVEL]', difficulty);

    setSessionStarted(true);
    setStatus('idle');
    setTranscript([]);
    setTimeLeft(600);
    setCopilotSuggestion('Start the conversation to get your first tip.');
    
    if (!aiRef.current) {
      aiRef.current = new GoogleGenAI({ apiKey: API_KEY });
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
    } catch (err) {
        console.error('Failed to get user media:', err);
        setStatus('error');
    }
  }, [difficulty, userEmail]);
  
  useEffect(() => { 
    window.speechSynthesis?.getVoices();
    return cleanupResources;
  }, [cleanupResources]);

  if (!sessionStarted) {
    return (
        <div className="text-center w-full max-w-lg bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-cyan-400/20 animate-fade-in">
             <Logo className="h-24 w-24 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Welcome to your AI Sales Mentor</h2>
            <p className="text-cyan-200/80 mb-8">Hone your pitch and close more deals. Let's get started.</p>
            
            <div className="mb-8 text-left">
                <label className="block text-sm font-medium text-cyan-200/80 mb-2">Select Difficulty</label>
                <div className="flex justify-center gap-2 bg-slate-800/50 p-1 rounded-full border border-cyan-400/20">
                    {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                        <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`w-1/3 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                                difficulty === level 
                                ? 'bg-cyan-500 text-white shadow-md' 
                                : 'text-cyan-200/80 hover:bg-slate-700/50'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>
            
             <button
                onClick={handleStartSession}
                disabled={!difficulty}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
             >
                <MagicWandIcon className="h-6 w-6 mr-3" />
                Start Conversation
            </button>
        </div>
    );
  }

  // FIX: Simplified condition. The `|| status === 'ending'` was redundant and caused a type error,
  // as the 'ending' state is already handled by `status !== 'idle' && status !== 'recording'`.
  const isMicDisabled = status !== 'idle' && status !== 'recording';

  return (
    <div className="w-full h-[calc(100vh-8rem)] max-w-4xl flex flex-col bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-400/20 animate-fade-in overflow-hidden">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-cyan-400/20">
            <div>
                <p className="text-xs text-cyan-200/80">Your Prospect</p>
                <p className="text-base font-bold text-white">{currentPersona?.name || '...'}</p>
            </div>
             <div className="absolute left-1/2 -translate-x-1/2 bg-slate-800/50 px-3 py-1 rounded-full border border-cyan-400/20">
                <p className={`text-base font-mono font-bold ${timeLeft <= 60 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>{formatTime(timeLeft)}</p>
            </div>
            <button onClick={handleEndSession} className="bg-red-600/80 hover:bg-red-500/80 text-white font-bold py-2 px-4 rounded-full transition duration-300 text-sm">
                End Session
            </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
             {transcript.map((msg, index) => (
                <div key={index} className={`flex items-end gap-3 ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.author === 'debbie' && <Logo className="h-8 w-8 flex-shrink-0" />}
                    <div className={`p-3 rounded-2xl max-w-lg ${msg.author === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700/80 text-cyan-100 rounded-bl-none'}`}>
                        <p className="text-base">{msg.text}</p>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="relative p-4 mt-auto border-t border-cyan-400/20">
            <div className="absolute bottom-full left-4 mb-2 w-1/3 hidden md:block">
                 <div className="bg-slate-800/70 backdrop-blur-sm p-3 rounded-lg text-cyan-200/90 text-sm border border-cyan-400/20">
                    <h3 className="text-sm font-bold text-cyan-400 mb-1">Mentor's Tip</h3>
                    {isCopilotLoading ? <Spinner className="h-5 w-5 border-cyan-300"/> : <p>{copilotSuggestion}</p>}
                </div>
            </div>

            <div className="h-20 flex items-center justify-center">
                <button 
                    onClick={handleToggleRecording}
                    disabled={isMicDisabled}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isRecording ? 'bg-red-500/80 shadow-lg scale-110 animate-pulse' : 'bg-cyan-600/90 hover:bg-cyan-500/90'}`}>
                    <MicrophoneIcon className="w-9 h-9 text-white" />
                </button>
            </div>

             <div className="absolute inset-x-0 top-0 h-10 -translate-y-1/2 text-center flex items-center justify-center pointer-events-none">
                 <div className="bg-slate-800/70 backdrop-blur-sm px-3 py-1 rounded-full">
                    {status === 'recording' && <span className="text-red-400 text-sm animate-pulse">Recording...</span>}
                    {status === 'speaking' && <span className="text-cyan-200/80 text-sm">Debbie is speaking...</span>}
                    {status === 'processing' && <div className="flex items-center gap-2 text-cyan-300 text-sm"><Spinner className="h-4 w-4" /><span>Thinking...</span></div>}
                    {status === 'ending' && <span className="text-yellow-400 text-sm animate-pulse">Wrapping up session...</span>}
                    {status === 'error' && <span className="text-red-400 text-sm">An error occurred. Please refresh.</span>}
                    {status === 'idle' && <span className="text-cyan-200/80 text-sm">Tap microphone to speak</span>}
                 </div>
            </div>
        </div>
    </div>
  );
};

export default PracticeScreen;