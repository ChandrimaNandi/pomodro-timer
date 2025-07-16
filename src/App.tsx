import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Settings, X } from 'lucide-react';

interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isWorkSession: boolean;
  completedPomodoros: number;
}

interface TimerSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

const motivationalQuotes = [
  "Every small step forward is progress worth celebrating.",
  "You're stronger than you think, keep pushing forward.",
  "Great things never come from comfort zones.",
  "The only impossible journey is the one you never begin.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't watch the clock; do what it does. Keep going.",
  "You are capable of amazing things.",
  "Progress, not perfection, is the goal.",
  "Every expert was once a beginner.",
  "Your future self will thank you for not giving up today.",
  "Difficult roads often lead to beautiful destinations.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "You didn't come this far to only come this far.",
  "Believe you can and you're halfway there.",
  "Champions keep playing until they get it right.",
  "Focus on progress, not perfection.",
  "Small steps daily lead to big changes yearly.",
  "Your only limit is your mind.",
  "Dream it. Believe it. Build it.",
  "Success starts with self-discipline."
];

// Animated Tomato Component
const AnimatedTomato = ({ delay, duration, size }: { delay: number; duration: number; size: number }) => {
  return (
    <div
      className="absolute opacity-10 animate-bounce"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        fontSize: `${size}px`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    >
      🍅
    </div>
  );
};

// Background Tomatoes Component
const BackgroundTomatoes = () => {
  const tomatoes = Array.from({ length: 15 }, (_, i) => (
    <AnimatedTomato
      key={i}
      delay={Math.random() * 5}
      duration={3 + Math.random() * 4}
      size={20 + Math.random() * 30}
    />
  ));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {tomatoes}
    </div>
  );
};

function App() {
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4
  });

  const [timer, setTimer] = useState<TimerState>({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    isWorkSession: true,
    completedPomodoros: 0
  });

  const [currentQuote, setCurrentQuote] = useState('');
  const [showQuote, setShowQuote] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentSessionDuration = () => {
    if (timer.isWorkSession) {
      return settings.workDuration;
    } else {
      const isLongBreak = timer.completedPomodoros > 0 && timer.completedPomodoros % settings.longBreakInterval === 0;
      return isLongBreak ? settings.longBreakDuration : settings.breakDuration;
    }
  };

  const totalSeconds = getCurrentSessionDuration() * 60;
  const currentSeconds = timer.minutes * 60 + timer.seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  useEffect(() => {
    if (timer.isRunning && (timer.minutes > 0 || timer.seconds > 0)) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else {
            // Timer finished
            const newIsWorkSession = !prev.isWorkSession;
            const newCompletedPomodoros = prev.isWorkSession ? prev.completedPomodoros + 1 : prev.completedPomodoros;
            
            let newDuration;
            if (newIsWorkSession) {
              newDuration = settings.workDuration;
            } else {
              const isLongBreak = newCompletedPomodoros > 0 && newCompletedPomodoros % settings.longBreakInterval === 0;
              newDuration = isLongBreak ? settings.longBreakDuration : settings.breakDuration;
            }
            
            return {
              minutes: newDuration,
              seconds: 0,
              isRunning: false,
              isWorkSession: newIsWorkSession,
              completedPomodoros: newCompletedPomodoros
            };
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isRunning, timer.minutes, timer.seconds, settings]);

  const startTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  };

  const stopTimer = () => {
    const currentDuration = getCurrentSessionDuration();
    setTimer(prev => ({
      ...prev,
      minutes: currentDuration,
      seconds: 0,
      isRunning: false
    }));
  };

  const resetTimer = () => {
    setTimer({
      minutes: settings.workDuration,
      seconds: 0,
      isRunning: false,
      isWorkSession: true,
      completedPomodoros: 0
    });
  };

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  };

  const handleButtonHover = (show: boolean) => {
    if (show) {
      setCurrentQuote(getRandomQuote());
      setShowQuote(true);
    } else {
      setShowQuote(false);
    }
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSettingsSubmit = () => {
    setSettings(tempSettings);
    
    // Update current timer if not running
    if (!timer.isRunning) {
      const newDuration = timer.isWorkSession ? tempSettings.workDuration : tempSettings.breakDuration;
      setTimer(prev => ({
        ...prev,
        minutes: newDuration,
        seconds: 0
      }));
    }
    
    setShowSettings(false);
  };

  const handleSettingsCancel = () => {
    setTempSettings(settings);
    setShowSettings(false);
  };

  const getSessionType = () => {
    if (timer.isWorkSession) {
      return 'Focus Time';
    } else {
      const isLongBreak = timer.completedPomodoros > 0 && timer.completedPomodoros % settings.longBreakInterval === 0;
      return isLongBreak ? 'Long Break' : 'Short Break';
    }
  };

  const circumference = 2 * Math.PI * 120;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(135deg, #FFF8D5 0%, #EFDFD8 100%)' }}>
      <BackgroundTomatoes />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl max-w-md w-full border border-white/20">
          <div className="flex justify-between items-start mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-2">
                PomoDoro
              </h1>
              <p className="text-amber-800/80 text-lg">
                {getSessionType()}
              </p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="bg-amber-100/50 hover:bg-amber-100/70 text-amber-800 p-3 rounded-full transition-all duration-300 transform hover:scale-110 border border-amber-200/50"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-8">
            <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="rgba(180, 83, 9, 0.2)"
                strokeWidth="8"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="#B45309"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-mono font-bold text-amber-900 mb-2">
                  {formatTime(timer.minutes, timer.seconds)}
                </div>
                <div className="text-amber-800/60 text-sm">
                  {Math.round(progress)}% Complete
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            {!timer.isRunning ? (
              <button
                onClick={startTimer}
                className="bg-amber-100/50 hover:bg-amber-100/70 text-amber-800 p-4 rounded-full transition-all duration-300 transform hover:scale-110 border border-amber-200/50"
              >
                <Play className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                onMouseEnter={() => handleButtonHover(true)}
                onMouseLeave={() => handleButtonHover(false)}
                className="bg-amber-100/50 hover:bg-amber-100/70 text-amber-800 p-4 rounded-full transition-all duration-300 transform hover:scale-110 border border-amber-200/50"
              >
                <Pause className="w-6 h-6" />
              </button>
            )}
            
            <button
              onClick={stopTimer}
              onMouseEnter={() => handleButtonHover(true)}
              onMouseLeave={() => handleButtonHover(false)}
              className="bg-amber-100/50 hover:bg-amber-100/70 text-amber-800 p-4 rounded-full transition-all duration-300 transform hover:scale-110 border border-amber-200/50"
            >
              <Square className="w-6 h-6" />
            </button>
            
            <button
              onClick={resetTimer}
              className="bg-amber-100/50 hover:bg-amber-100/70 text-amber-800 p-4 rounded-full transition-all duration-300 transform hover:scale-110 border border-amber-200/50"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center mb-6">
            <p className="text-amber-800/80 text-sm mb-2">Completed Pomodoros</p>
            <div className="flex justify-center space-x-2">
              {[...Array(Math.min(timer.completedPomodoros, 8))].map((_, index) => (
                <div
                  key={index}
                  className="w-3 h-3 bg-amber-600 rounded-full opacity-80"
                />
              ))}
              {timer.completedPomodoros > 8 && (
                <span className="text-amber-800/80 text-sm ml-2">
                  +{timer.completedPomodoros - 8} more
                </span>
              )}
            </div>
          </div>

          <div className="h-20 flex items-center justify-center">
            <div className={`text-center transition-all duration-500 ${
              showQuote ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
            }`}>
              {showQuote && (
                <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 max-w-sm border border-white/20">
                  <p className="text-amber-900 text-sm font-medium italic">
                    "{currentQuote}"
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-amber-800/60 text-xs">
              Hover over pause or stop for motivation
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-amber-200/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Timer Settings</h2>
              <button
                onClick={handleSettingsCancel}
                className="text-amber-600 hover:text-amber-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.workDuration}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) || 25 }))}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={tempSettings.breakDuration}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, breakDuration: parseInt(e.target.value) || 5 }))}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.longBreakDuration}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) || 15 }))}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Long Break Interval (pomodoros)
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={tempSettings.longBreakInterval}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, longBreakInterval: parseInt(e.target.value) || 4 }))}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/50"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSettingsCancel}
                className="flex-1 px-4 py-2 text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSettingsSubmit}
                className="flex-1 px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;