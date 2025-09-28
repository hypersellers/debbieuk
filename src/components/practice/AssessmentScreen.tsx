import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { generateAssessment } from '../../services/geminiService';
import { getUserProfile, saveAssessment } from '../../services/userProfileService';
import { saveTranscriptToCloud } from '../../services/cloudStorageService';
import Spinner from '../ui/Spinner';

interface AssessmentScreenProps {
  transcript: string;
  onStartNewSession: () => void;
  userEmail: string;
}

const AssessmentScreen: React.FC<AssessmentScreenProps> = ({ transcript, onStartNewSession, userEmail }) => {
  const [assessment, setAssessment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const fetchAndSaveAssessment = async () => {
      if (!transcript) {
        setIsLoading(false);
        setAssessment("No transcript available to generate an assessment.");
        return;
      }
      
      setIsLoading(true);
      setSaveStatus('saving');

      // Simulate uploading the raw transcript to cloud storage
      await saveTranscriptToCloud(userEmail, transcript);

      // Fetch user history to provide context to the assessment prompt
      const userProfile = await getUserProfile(userEmail);
      const historyText = userProfile.assessments.length > 0
        ? userProfile.assessments.slice(-2).join('\n---\n')
        : "This is the user's first session.";

      const result = await generateAssessment(transcript, historyText);
      setAssessment(result);
      setIsLoading(false);

      // Save the new assessment to the user's local profile for the memory feature
      await saveAssessment(userEmail, result);
      setSaveStatus('saved');
    };

    fetchAndSaveAssessment();
  }, [transcript, userEmail]);

  const downloadFeedbackAsPDF = () => {
    if (!assessment) return;

    const doc = new jsPDF();
    
    // Add a title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Hypersellers.ai Sales Mentor Assessment', 105, 20, { align: 'center' });
    
    // Add user info and date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const timestamp = new Date().toLocaleString();
    doc.text(`User: ${userEmail}`, 15, 30);
    doc.text(`Date: ${timestamp}`, 15, 35);
    
    // Add the assessment content
    doc.setFontSize(12);
    // The splitTextToSize function handles automatic line wrapping
    const splitText = doc.splitTextToSize(assessment, 180);
    doc.text(splitText, 15, 50);

    const filename = `hyperseller-assessment-${userEmail}-${new Date().toISOString().replace(/:/g, '-')}.pdf`;
    doc.save(filename);
  };
  
  return (
    <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-cyan-400/20 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white">Session Assessment</h2>
        <p className="h-5 mt-1 text-sm">
            {saveStatus === 'saving' && <span className="text-cyan-300 animate-pulse">Saving transcript to cloud...</span>}
            {saveStatus === 'saved' && <span className="text-green-400">Transcript saved. Assessment saved to your profile.</span>}
        </p>
      </div>
      
      <div className="bg-slate-800/50 p-6 rounded-2xl h-96 overflow-y-auto border border-cyan-400/20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-cyan-300">
            <Spinner />
            <p className="mt-4">Debbie is preparing your feedback...</p>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-cyan-100/90 font-sans text-base leading-relaxed">{assessment}</pre>
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={onStartNewSession}
          className="w-full sm:w-auto flex justify-center py-3 px-8 border border-transparent rounded-full shadow-sm text-base font-bold text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105"
        >
          Start New Session
        </button>
        <button
          onClick={downloadFeedbackAsPDF}
          disabled={isLoading || !assessment}
          className="w-full sm:w-auto flex justify-center py-3 px-8 border border-cyan-400/30 rounded-full shadow-sm text-base font-bold text-white bg-slate-700/60 hover:bg-slate-600/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download Feedback
        </button>
      </div>
    </div>
  );
};

export default AssessmentScreen;