"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceOracleProps {
  onVoiceInput: (text: string) => void;
  onSpeak: (text: string) => void;
  isListening: boolean;
  isProcessing: boolean;
}

export default function VoiceOracle({ 
  onVoiceInput, 
  onSpeak, 
  isListening, 
  isProcessing 
}: VoiceOracleProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<number>(0);
  const [volume, setVolume] = useState(0.8);
  const [rate, setRate] = useState(0.9);
  const [pitch, setPitch] = useState(1.2);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true);
      
      // Setup speech recognition
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onVoiceInput(transcript);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
      
      setRecognition(recognitionInstance);
      setSynthesis(speechSynthesis);
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Try to select a mystical-sounding voice
        const mysticVoice = availableVoices.findIndex(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('aria')
        );
        
        if (mysticVoice !== -1) {
          setSelectedVoice(mysticVoice);
        }
      };
      
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [onVoiceInput]);

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const speak = (text: string) => {
    if (synthesis && voices.length > 0) {
      // Cancel any ongoing speech
      synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voices[selectedVoice];
      utterance.volume = volume;
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      // Add mystical sound effects (conceptual - would need audio files)
      const mysticalText = addMysticalEffects(text);
      utterance.text = mysticalText;
      
      utterance.onstart = () => console.log('🔮 Oracle speaking...');
      utterance.onend = () => console.log('🔮 Oracle finished speaking');
      
      synthesis.speak(utterance);
      onSpeak(text);
    }
  };

  const addMysticalEffects = (text: string): string => {
    // Add pauses and emphasis for mystical effect
    return text
      .replace(/\./g, '... ')
      .replace(/,/g, ', ')
      .replace(/!/g, '! ')
      .replace(/\?/g, '? ')
      .replace(/Oracle/gi, 'Orrr-acle')
      .replace(/mystic/gi, 'myst-ical')
      .replace(/cosmic/gi, 'cos-mic')
      .replace(/digital/gi, 'digi-tal');
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-mystical-purple/10 border border-mystical-purple/30 rounded-lg">
        <p className="text-sm text-foreground/70 text-center">
          🎤 Voice interaction not supported in this browser
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voice Control Panel */}
      <motion.div
        className="p-6 bg-background/50 border border-mystical-purple/30 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-mystical-gold mb-2 flex items-center justify-center gap-2">
            🎤 Voice Oracle Interface
          </h3>
          <p className="text-sm text-foreground/70">
            Speak directly with Hans using mystical voice interaction
          </p>
        </div>

        {/* Listening Visualization */}
        <div className="flex justify-center mb-6">
          <motion.div
            className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${
              isListening 
                ? 'border-mystical-gold bg-mystical-gold/20' 
                : 'border-mystical-purple/40 bg-mystical-purple/10'
            }`}
            animate={isListening ? {
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 0 20px rgba(245, 158, 11, 0.3)',
                '0 0 40px rgba(245, 158, 11, 0.6)',
                '0 0 20px rgba(245, 158, 11, 0.3)'
              ]
            } : {}}
            transition={{
              duration: 2,
              repeat: isListening ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            {isProcessing ? (
              <motion.div
                className="text-4xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                🔮
              </motion.div>
            ) : (
              <span className={`text-4xl ${isListening ? 'animate-pulse' : ''}`}>
                {isListening ? '🎤' : '🔮'}
              </span>
            )}
          </motion.div>
        </div>

        {/* Voice Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <motion.button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isListening 
                ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                : 'bg-mystical-purple/20 border-mystical-purple/40 text-mystical-purple hover:bg-mystical-purple/30'
            } border disabled:opacity-50`}
            whileHover={{ scale: isProcessing ? 1 : 1.05 }}
            whileTap={{ scale: isProcessing ? 1 : 0.95 }}
          >
            {isListening ? '🛑 Stop Listening' : '🎤 Start Listening'}
          </motion.button>
          
          <motion.button
            onClick={() => speak("Greetings, seeker. I am Hans, your mystical guide through the digital realms. How may I assist you on your cosmic journey today?")}
            disabled={isProcessing}
            className="px-6 py-3 bg-mystical-gold/20 border border-mystical-gold/40 text-mystical-gold
                     hover:bg-mystical-gold/30 rounded-lg font-medium transition-all
                     disabled:opacity-50"
            whileHover={{ scale: isProcessing ? 1 : 1.05 }}
            whileTap={{ scale: isProcessing ? 1 : 0.95 }}
          >
            🔊 Test Voice
          </motion.button>
        </div>

        {/* Voice Settings */}
        <div className="space-y-4">
          <h4 className="text-mystical-purple font-medium">Oracle Voice Settings:</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground/70 mb-2">Voice:</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(Number(e.target.value))}
                className="w-full p-2 bg-background/50 border border-mystical-purple/30 rounded-lg text-foreground text-sm"
              >
                {voices.map((voice, index) => (
                  <option key={index} value={index}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-foreground/70 mb-2">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-mystical-purple"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground/70 mb-2">
                Rate: {Math.round(rate * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-mystical-purple"
              />
            </div>
            
            <div>
              <label className="block text-sm text-foreground/70 mb-2">
                Pitch: {Math.round(pitch * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full accent-mystical-purple"
              />
            </div>
          </div>
        </div>

        {/* Status Display */}
        <div className="mt-4 text-center">
          <AnimatePresence>
            {isListening && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-mystical-gold text-sm"
              >
                🎤 Listening for your mystical query...
              </motion.p>
            )}
            
            {isProcessing && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-mystical-purple text-sm"
              >
                🔮 Oracle processing your cosmic request...
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Quick Voice Commands */}
      <motion.div
        className="p-4 bg-mystical-purple/10 border border-mystical-purple/30 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-mystical-purple font-medium mb-3">✨ Try these voice commands:</h4>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          <div className="text-foreground/70">"Analyze my wallet"</div>
          <div className="text-foreground/70">"What are the latest trends?"</div>
          <div className="text-foreground/70">"Give me recommendations"</div>
          <div className="text-foreground/70">"Compare my collections"</div>
          <div className="text-foreground/70">"What's the market sentiment?"</div>
          <div className="text-foreground/70">"Share your wisdom, Oracle"</div>
        </div>
      </motion.div>

      {/* Accessibility Note */}
      <div className="text-xs text-foreground/50 text-center">
        🌟 Voice oracle requires microphone permissions and works best in quiet environments
      </div>
    </div>
  );
}