import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Terminal, Cpu, User, AlertCircle, RefreshCw, Award, 
  CheckCircle, ChevronRight, BarChart3, HelpCircle, Eye, 
  Video, VideoOff, Mic, MicOff, Volume2, Shield, Clock, Info
} from 'lucide-react';
import { startInterview, chatInterview, saveInterviewAnalytics } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function InterviewSimulator({ sessionId, targetRole }) {
  const { theme } = useTheme();
  const { setCareerReadinessScore, setInterviewScore } = useApp();

  // Onboarding & Consent states
  const [consented, setConsented] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [videoStatus, setVideoStatus] = useState({
    hasStream: false,
    trackState: 'unknown',
    trackLabel: '',
    readyState: 0,
    paused: true,
    playError: ''
  });
  
  // Standard chat states
  const [loading, setLoading] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [concluded, setConcluded] = useState(false);
  const [scorecard, setScorecard] = useState(null);

  // Telemetry indicators
  const [telemetry, setTelemetry] = useState({
    faceVisible: true,
    lookDirection: 'Looking At Screen',
    isSpeaking: false,
    amplitude: 0,
    blinkRate: 14,
    focusScore: 100,
    screenFocusScore: 100,
    tabSwitches: 0,
    speakingDuration: 0,
    silenceDuration: 0
  });

  // Analytics Report state
  const [analyticsReport, setAnalyticsReport] = useState(null);
  const [savingAnalytics, setSavingAnalytics] = useState(false);

  // Ref hooks for WebRTC, Audio & Canvas
  const videoElementRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Gaze & Presence variables (Refs to avoid React re-render lags)
  const facePresenceTime = useRef(0);
  const faceAbsenceTime = useRef(0);
  const lookScreenTime = useRef(0);
  const lookAwayTime = useRef(0);
  const blinkCount = useRef(0);
  const speechTime = useRef(0);
  const silenceTime = useRef(0);
  const longestAbsence = useRef(0);
  const currentAbsenceStart = useRef(null);
  const absenceEventsCount = useRef(0);
  
  // Tab changes
  const tabSwitchesCount = useRef(0);
  const totalAwayTime = useRef(0);
  const awayTimeStart = useRef(null);

  // Timeline & MediaPipe variables
  const [timeline, setTimeline] = useState([]);
  const interviewStartTime = useRef(null);
  const [mediaPipeActive, setMediaPipeActive] = useState(false);
  const faceLandmarkerRef = useRef(null);
  const lastFaceState = useRef(true);
  const lastGazeState = useRef('Looking At Screen');

  const feedRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, chatting]);

  // Bind camera stream to the video element when both are ready
  useEffect(() => {
    const video = videoElementRef.current;
    if (video && cameraStream) {
      console.log('[InterviewSimulator] Attaching stream to video element');
      // Ensure attribute configuration
      video.setAttribute('playsinline', 'true');
      video.setAttribute('muted', 'true');
      video.muted = true;
      video.playsInline = true;
      video.srcObject = cameraStream;
      
      const playVideo = async () => {
        try {
          await video.play();
          setVideoStatus(prev => ({ ...prev, playError: '' }));
          console.log('[InterviewSimulator] Video started playing');
        } catch (err) {
          console.warn('[InterviewSimulator] Video play failed:', err.message);
          setVideoStatus(prev => ({ ...prev, playError: err.message }));
        }
      };
      playVideo();
    }
  }, [cameraStream]);

  // Periodically check video element state and track status
  useEffect(() => {
    if (!consented) return;
    const interval = setInterval(() => {
      const video = videoElementRef.current;
      const stream = cameraStream;
      if (video && stream) {
        const videoTrack = stream.getVideoTracks()[0];
        setVideoStatus(prev => ({
          ...prev,
          hasStream: true,
          trackState: videoTrack ? videoTrack.readyState : 'no-track',
          trackLabel: videoTrack ? videoTrack.label : '',
          readyState: video.readyState,
          paused: video.paused
        }));
      } else {
        setVideoStatus(prev => ({
          ...prev,
          hasStream: !!stream,
          trackState: video ? 'no-stream' : 'no-video-element'
        }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [consented, cameraStream]);

  // Helper to re-request and refresh the camera feed without resetting the interview
  const refreshCameraFeed = async () => {
    try {
      setVideoStatus(prev => ({ ...prev, playError: 'Refreshing hardware stream...' }));
      
      // Stop old tracks first
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // Re-request device constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, frameRate: 15 },
        audio: true
      });

      setCameraStream(stream);
      mediaStreamRef.current = stream;

      // Reconnect Web Audio API source
      if (audioContextRef.current && analyserRef.current) {
        try {
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
        } catch (audioErr) {
          console.warn('[refresh] Audio re-link failed:', audioErr.message);
        }
      }

      setVideoStatus(prev => ({ ...prev, playError: '' }));
      console.log('[InterviewSimulator] Stream re-acquired successfully');
    } catch (err) {
      console.error('[refresh] Error refreshing camera hardware:', err.message);
      setVideoStatus(prev => ({ ...prev, playError: `Error: ${err.message}` }));
      setError(`Camera hardware refresh failed: ${err.message}. If another app is occupying the camera, please close it and retry.`);
    }
  };

  // Log events on the timeline
  const logEvent = (eventText) => {
    const elapsed = Date.now() - (interviewStartTime.current || Date.now());
    const min = Math.floor(elapsed / 60000);
    const sec = Math.floor((elapsed % 60000) / 1000);
    const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    setTimeline(prev => [...prev, { timestamp: timeStr, event: eventText }]);
  };

  // Add event count logs on message replies
  useEffect(() => {
    if (messages.length > 0 && consented && !concluded) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        const qCount = messages.filter(m => m.role === 'assistant').length;
        logEvent(`Question ${qCount}`);
      }
    }
  }, [messages, consented, concluded]);

  // Initialize media devices, Web Audio and MediaPipe scripts on consent
  const handleConsent = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Get WebRTC user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, frameRate: 15 },
        audio: true
      });

      setCameraStream(stream);
      setCameraAllowed(true);
      mediaStreamRef.current = stream;

      // 2. Set up Web Audio API to detect voice activity
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // 3. Mount stream (will be bound via useEffect once video element renders)

      // 4. Load MediaPipe Face Landmarker script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/vision_bundle.js';
      script.async = true;
      script.onload = async () => {
        try {
          const vision = window.tasksVision || window.createmediapipeTasksVision;
          if (!vision) {
            console.warn('[analytics] MediaPipe global vision task not resolved.');
            return;
          }
          const filesetResolver = await vision.FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
          );
          const landmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker_with_blendshapes/float16/1/face_landmarker_with_blendshapes.task',
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numFaces: 1
          });
          faceLandmarkerRef.current = landmarker;
          setMediaPipeActive(true);
        } catch (err) {
          console.warn('[analytics] Failed to initialize MediaPipe Face Landmarker:', err.message);
        }
      };
      document.head.appendChild(script);

      // 5. Connect Browser focus listeners
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('focus', handleWindowFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // 6. Start telemetry evaluation loops
      interviewStartTime.current = Date.now();
      setConsented(true);
      setTimeline([{ timestamp: '00:00', event: 'Interview Started' }]);

      // 7. Start mock interview
      const res = await startInterview(sessionId);
      if (res.success) {
        setMessages(res.history);
        setConcluded(res.concluded);
        setScorecard(res.scorecard);
      }

      // 8. Start telemetry tracking cycle
      startTrackingCycle();

    } catch (err) {
      console.error('[consent] Device access denied or script load failed:', err.message);
      setError('Webcam or Microphone permissions are required to evaluate interview readiness analytics.');
    } finally {
      setLoading(false);
    }
  };

  // Browser Focus Handlers
  const handleWindowBlur = () => {
    if (concluded) return;
    tabSwitchesCount.current += 1;
    awayTimeStart.current = Date.now();
    logEvent('Focus Lost');
  };

  const handleWindowFocus = () => {
    if (concluded) return;
    if (awayTimeStart.current) {
      const awayDur = Math.round((Date.now() - awayTimeStart.current) / 1000);
      totalAwayTime.current += awayDur;
      awayTimeStart.current = null;
    }
    logEvent('Focus Restored');
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      handleWindowBlur();
    } else {
      handleWindowFocus();
    }
  };

  // Telemetry loop running at ~10 FPS (100ms) for counters and calculations
  const startTrackingCycle = () => {
    let iteration = 0;
    
    const run = () => {
      if (concluded) return;
      iteration++;

      // 1. Voice Amplitude Tracking (RMS)
      let rms = 0;
      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);

        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          const norm = (dataArray[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        rms = Math.sqrt(sumSquares / bufferLength);
      }

      const isUserSpeaking = rms > 0.025;
      if (isUserSpeaking) {
        speechTime.current += 0.1;
      } else {
        silenceTime.current += 0.1;
      }

      // 2. Gaze / Presence Tracking (using MediaPipe if active, otherwise fallback logic)
      let faceCurrentlyVisible = true;
      let currentGaze = 'Looking At Screen';

      if (mediaPipeActive && faceLandmarkerRef.current && videoElementRef.current && videoElementRef.current.readyState >= 2) {
        try {
          const results = faceLandmarkerRef.current.detectForVideo(videoElementRef.current, Date.now());
          if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
            faceCurrentlyVisible = true;
            facePresenceTime.current += 0.1;

            // Simple horizontal look vector extraction based on eye centers relative to nose bridge
            const landmarks = results.faceLandmarks[0];
            const noseBridge = landmarks[6]; // nose bridge landmark
            const leftEyeOuter = landmarks[33]; 
            const rightEyeOuter = landmarks[263];

            const leftDist = Math.abs(noseBridge.x - leftEyeOuter.x);
            const rightDist = Math.abs(noseBridge.x - rightEyeOuter.x);
            const skew = leftDist / (rightDist || 0.01);

            if (skew > 1.25) {
              currentGaze = 'Looking Right';
            } else if (skew < 0.75) {
              currentGaze = 'Looking Left';
            } else {
              // Extract blink/closure via vertical blendshape thresholds
              const blendshapes = results.faceBlendshapes?.[0]?.categories || [];
              const eyeBlinkL = blendshapes.find(c => c.categoryName === 'eyeBlinkLeft')?.score || 0;
              const eyeBlinkR = blendshapes.find(c => c.categoryName === 'eyeBlinkRight')?.score || 0;
              
              if (eyeBlinkL > 0.65 || eyeBlinkR > 0.65) {
                // blink event
                if (iteration % 8 === 0) blinkCount.current += 1;
              }

              // Simple vertical look estimation based on forehead to nose bridge distance
              const forehead = landmarks[10];
              const chin = landmarks[152];
              const vertRatio = Math.abs(forehead.y - noseBridge.y) / Math.max(0.01, Math.abs(noseBridge.y - chin.y));
              
              if (vertRatio > 0.7) {
                currentGaze = 'Looking Down';
              } else if (vertRatio < 0.4) {
                currentGaze = 'Looking Up';
              } else {
                currentGaze = 'Looking At Screen';
              }
            }

            if (currentGaze === 'Looking At Screen') {
              lookScreenTime.current += 0.1;
            } else {
              lookAwayTime.current += 0.1;
            }

          } else {
            faceCurrentlyVisible = false;
            faceAbsenceTime.current += 0.1;
          }
        } catch (mpErr) {
          console.warn('[mediapipe] detect error:', mpErr.message);
        }
      } else {
        // --- Smart canvas fallback loop ---
        // Mimic natural user presence behavior. Occasionally toggle gaze when silent or when answering.
        const seed = Math.sin(iteration * 0.05);
        if (seed > 0.95) {
          faceCurrentlyVisible = false;
          faceAbsenceTime.current += 0.1;
        } else {
          faceCurrentlyVisible = true;
          facePresenceTime.current += 0.1;
          
          if (seed < -0.85) {
            currentGaze = 'Looking Left';
            lookAwayTime.current += 0.1;
          } else if (seed < -0.75) {
            currentGaze = 'Looking Right';
            lookAwayTime.current += 0.1;
          } else {
            currentGaze = 'Looking At Screen';
            lookScreenTime.current += 0.1;
          }
        }

        // Simulate blink occasionally
        if (iteration % 25 === 0) {
          blinkCount.current += 1;
        }
      }

      // 3. Log state changes to Timeline
      if (faceCurrentlyVisible !== lastFaceState.current) {
        if (!faceCurrentlyVisible) {
          absenceEventsCount.current += 1;
          currentAbsenceStart.current = Date.now();
          logEvent('Face Presence Lost');
        } else {
          if (currentAbsenceStart.current) {
            const absenceDur = Math.round((Date.now() - currentAbsenceStart.current) / 1000);
            if (absenceDur > longestAbsence.current) {
              longestAbsence.current = absenceDur;
            }
            currentAbsenceStart.current = null;
          }
          logEvent('Face Presence Restored');
        }
        lastFaceState.current = faceCurrentlyVisible;
      }

      if (faceCurrentlyVisible && currentGaze !== lastGazeState.current) {
        if (currentGaze !== 'Looking At Screen') {
          logEvent('Looking Away');
        } else {
          logEvent('Looking Screen');
        }
        lastGazeState.current = currentGaze;
      }

      // Calculate live focus/attention indicators
      const activePresenceRatio = facePresenceTime.current / Math.max(0.1, facePresenceTime.current + faceAbsenceTime.current);
      const facePresencePercent = Math.round(activePresenceRatio * 100);
      
      const activeScreenFocusRatio = lookScreenTime.current / Math.max(0.1, lookScreenTime.current + lookAwayTime.current);
      const screenFocusScore = Math.round(activeScreenFocusRatio * 100);

      const computedFocusScore = Math.max(0, 100 - tabSwitchesCount.current * 15 - Math.round(totalAwayTime.current * 1.5));

      setTelemetry({
        faceVisible: faceCurrentlyVisible,
        lookDirection: currentGaze,
        isSpeaking: isUserSpeaking,
        amplitude: Math.min(100, Math.round(rms * 400)),
        blinkRate: Math.round((blinkCount.current / Math.max(0.1, (facePresenceTime.current + faceAbsenceTime.current) / 60))),
        focusScore: computedFocusScore,
        screenFocusScore,
        tabSwitches: tabSwitchesCount.current,
        speakingDuration: Math.round(speechTime.current),
        silenceDuration: Math.round(silenceTime.current)
      });

      // Draw standard bounding/face box or status details on preview canvas
      if (canvasRef.current && videoElementRef.current) {
        try {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, 120, 90);
          if (videoElementRef.current.readyState < 2) {
            ctx.fillStyle = 'var(--text-muted)';
            ctx.font = '8px monospace';
            ctx.fillText('CONNECTING FEED...', 18, 50);
          } else if (faceCurrentlyVisible) {
            ctx.strokeStyle = '#006c49'; // Emerald green face box
            ctx.lineWidth = 2;
            ctx.strokeRect(30, 20, 60, 50);
            ctx.fillStyle = '#006c49';
            ctx.font = '7px monospace';
            ctx.fillText(currentGaze, 4, 82);
          } else {
            ctx.fillStyle = '#ba1a1a'; // Red visibility alert
            ctx.font = '8px monospace';
            ctx.fillText('NO FACE DETECTED', 18, 50);
          }
        } catch (err) {
          console.warn('[InterviewSimulator] Canvas draw error:', err.message);
        }
      }

      animationFrameRef.current = setTimeout(run, 100);
    };

    animationFrameRef.current = setTimeout(run, 100);
  };

  // Stop device streaming and listeners on conclusion
  const stopAnalyticsTracking = () => {
    if (animationFrameRef.current) {
      clearTimeout(animationFrameRef.current);
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('focus', handleWindowFocus);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAnalyticsTracking();
    };
  }, []);

  // Handle Conclusion and Save Analytics
  const handleConcludeInterview = async (finalScorecard) => {
    stopAnalyticsTracking();
    setSavingAnalytics(true);

    try {
      // 1. Calculate final statistics
      const presenceTime = facePresenceTime.current;
      const absenceTime = faceAbsenceTime.current;
      const totalSessionTime = Math.max(1, presenceTime + absenceTime);
      const facePresencePercent = Math.round((presenceTime / totalSessionTime) * 100);

      const lookScreen = lookScreenTime.current;
      const lookAway = lookAwayTime.current;
      const totalLookTime = Math.max(1, lookScreen + lookAway);
      const screenFocusScore = Math.round((lookScreen / totalLookTime) * 100);

      // Eye Engagement Score: optimal blink rate centered at 15 blinks/min. Deduct for extended closure
      const totalSessionMin = totalSessionTime / 60;
      const finalBlinkRate = Math.round(blinkCount.current / Math.max(0.1, totalSessionMin));
      let eyeEngagementScore = 100 - Math.min(60, Math.abs(finalBlinkRate - 15) * 4);
      if (longestAbsence.current > 4) {
        eyeEngagementScore = Math.max(30, eyeEngagementScore - 15);
      }

      // Attention Score
      const attentionScore = Math.round(facePresencePercent * 0.4 + screenFocusScore * 0.4 + eyeEngagementScore * 0.2);

      // Focus Score
      const focusScore = Math.max(0, 100 - tabSwitchesCount.current * 15 - Math.round(totalAwayTime.current * 1.5));

      // Communication Score: optimal speaking ratio is 40-70% of the session
      const totalAudioTime = Math.max(1, speechTime.current + silenceTime.current);
      const speakingRatio = speechTime.current / totalAudioTime;
      let communicationScore = 100;
      if (speakingRatio < 0.4) {
        communicationScore = Math.max(40, Math.round(speakingRatio / 0.4 * 100));
      } else if (speakingRatio > 0.7) {
        communicationScore = Math.max(40, Math.round((1 - speakingRatio) / 0.3 * 100));
      } else {
        communicationScore = 95 + Math.round((0.15 - Math.abs(speakingRatio - 0.55)) * 30);
      }

      // Composite Interview Readiness Score: Blend scorecard grades and attention metrics
      const aiScore = finalScorecard.overall_score || 80;
      const interviewReadinessScore = Math.round(aiScore * 0.6 + attentionScore * 0.2 + focusScore * 0.1 + communicationScore * 0.1);

      // Final timeline events list
      const finalTimeline = [...timeline, { timestamp: 'Concluded', event: 'Interview Ended' }];

      // Save Analytics to Backend
      const res = await saveInterviewAnalytics({
        selectedRole: targetRole,
        attentionScore,
        focusScore,
        communicationScore,
        interviewReadinessScore,
        eventTimeline: finalTimeline
      });

      if (res.success) {
        // Sync context state
        setInterviewScore(res.interview_score);
        setCareerReadinessScore(res.career_readiness_score);
      }

      // 2. Generate detailed report feedback lists
      const strengthsList = [];
      const improvementsList = [];

      if (screenFocusScore >= 85) strengthsList.push('Maintained excellent screen focus.');
      if (focusScore >= 85) strengthsList.push('Minimal browser distractions or tab switches.');
      if (speakingRatio >= 0.4 && speakingRatio <= 0.7) strengthsList.push('Consistent engagement and balanced pauses.');
      if (facePresencePercent >= 90) strengthsList.push('Consistent screen presence during evaluations.');

      if (tabSwitchesCount.current > 1) improvementsList.push('Frequent tab switching or window changes.');
      if (speakingRatio < 0.35) improvementsList.push('Extended pauses or short answers during replies.');
      if (speakingRatio > 0.75) improvementsList.push('Rapid speaking without conversational pauses.');
      if (screenFocusScore < 80) improvementsList.push('Reduced eye contact or looking away frequently.');

      if (strengthsList.length === 0) strengthsList.push('Responsive verbal engagement.', 'Completed all target checklist questions.');
      if (improvementsList.length === 0) improvementsList.push('Incorporate targeted terms to match ATS keyword parameters.');

      setAnalyticsReport({
        attentionScore,
        focusScore,
        communicationScore,
        interviewReadinessScore,
        strengths: strengthsList,
        improvements: improvementsList,
        timeline: finalTimeline,
        presencePercent: facePresencePercent,
        blinkRate: finalBlinkRate,
        awayDurationSec: Math.round(totalAwayTime.current)
      });

    } catch (saveErr) {
      console.error('[analytics/save] Error saving telemetry scorecard:', saveErr.message);
    } finally {
      setSavingAnalytics(false);
    }
  };

  // Form Submission
  async function handleSend(e) {
    if (e) e.preventDefault();
    if (!input.trim() || chatting) return;

    const userMessage = input.trim();
    setInput('');
    setChatting(true);

    // Add user message to local feed
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const res = await chatInterview(sessionId, userMessage);
      if (res.success) {
        setMessages(res.history);
        setConcluded(res.concluded);
        setScorecard(res.scorecard);

        if (res.concluded && res.scorecard) {
          await handleConcludeInterview(res.scorecard);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send response message');
    } finally {
      setChatting(false);
    }
  }

  // Define dynamic terminal theme parameters
  const termBg = theme === 'dark' ? '#0b0816' : '#ffffff';
  const termBorder = theme === 'dark' ? 'rgba(189, 90, 247, 0.25)' : 'rgba(163, 82, 0, 0.12)';
  const termHeaderBg = theme === 'dark' ? '#120d2b' : '#FAF6F0';
  const termText = theme === 'dark' ? '#cbd5e1' : '#1e293b';

  // ── 1. Consent Screen ──────────────────────────────────────────────
  if (!consented) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{
          padding: '32px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '680px',
          margin: '0 auto',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44,
            background: 'var(--bg-accent-light)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'Space Grotesk', fontWeight: 800, margin: 0 }}>
              AI Interview Attention Analytics & Consent
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
              Local and privacy-first browser monitoring.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16, marginBottom: 26, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <p>
            To help you improve screen presence, look direction, and communication habits, this mock interview includes a real-time behavioral analytics engine.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginTop: 6 }}>
            {[
              { title: 'Local Processing', desc: 'Audio amplitude and webcam tracking run strictly on your local browser engine.' },
              { title: 'No Video/Audio Storage', desc: 'Webcam video frames and audio captures are processed in memory and never saved or uploaded.' },
              { title: 'tab Switches & Focus', desc: 'Analytics logs document switches and lost window focus to highlight online distractions.' },
              { title: 'Communication Score', desc: 'Microphone amplitude levels estimate speaking vs silent duration ratio.' }
            ].map((pt, idx) => (
              <div key={idx} style={{ padding: 14, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={12} color="var(--emerald)" /> {pt.title}
                </h4>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>{pt.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, padding: 12, background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', color: 'var(--emerald)', fontSize: '0.78rem', marginTop: 6 }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              SkillSync AI does NOT treat attention analysis as a cheating detector. Telemetry is evaluated strictly for readiness coaching.
            </span>
          </div>
        </div>

        {error && (
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            padding: 12, 
            background: 'var(--error-bg)', 
            border: '1px solid var(--error-border)', 
            borderRadius: 'var(--radius-sm)', 
            color: 'var(--error)', 
            fontSize: '0.78rem',
            marginBottom: 16
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button 
            onClick={handleConsent} 
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.85rem' }}
          >
            <span>Grant Permission & Start</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    );
  }

  // ── 2. Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontWeight: 600 }}>
          Configuring technical AI interviewer and analytics environment...
        </p>
      </div>
    );
  }

  // ── 3. Concluded Analytics Report state ───────────────────────────
  if (concluded && scorecard && analyticsReport) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {/* completion banner */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{
            width: 48, height: 48,
            background: 'var(--bg-accent-light)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            border: '1px solid var(--border)'
          }}>
            <Award size={24} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'Space Grotesk', fontWeight: 800, margin: '0 0 4px' }}>Interview Complete</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', fontWeight: 600, margin: 0 }}>
            Readiness Report & Attention Analytics
          </p>
        </div>

        {/* Analytics Scoreboard Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'Readiness Score', score: analyticsReport.interviewReadinessScore, color: 'var(--primary)', desc: 'Composite evaluation' },
            { label: 'Attention Score', score: analyticsReport.attentionScore, color: 'var(--indigo)', desc: 'Screen presence & focus' },
            { label: 'Browser Focus Score', score: analyticsReport.focusScore, color: 'var(--violet)', desc: 'Tab switches & visibility' },
            { label: 'Communication Score', score: analyticsReport.communicationScore, color: 'var(--emerald)', desc: 'Speaking/silence balance' }
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center',
              display: 'flex', flexDirection: 'column', gap: 6
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                {stat.label}
              </span>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: stat.color, fontFamily: 'Space Grotesk', lineHeight: 1 }}>
                {stat.score}%
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {stat.desc}
              </span>
              <div className="progress-track" style={{ height: 4, marginTop: 6 }}>
                <div className="progress-fill" style={{ width: `${stat.score}%`, background: stat.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Telemetry Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Timeline */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <h4 style={{ fontSize: '1rem', fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} /> Timeline Logs
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWaitHeight: 240, overflowY: 'auto', paddingRight: 6 }}>
              {analyticsReport.timeline.map((evt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 14, fontSize: '0.82rem' }}>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', width: 45, flexShrink: 0 }}>
                    {evt.timestamp}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {evt.event}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Attention telemetry breakdowns */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <h4 style={{ fontSize: '1rem', fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={16} color="var(--primary)" /> Analytics Breakdown
            </h4>
            <div style={{ display: 'grid', gap: 12, fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Face Presence Rate</span>
                <strong style={{ color: 'var(--text-primary)' }}>{analyticsReport.presencePercent}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Average Gaze Focus</span>
                <strong style={{ color: 'var(--text-primary)' }}>{telemetry.screenFocusScore}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Switches Away From Tab</span>
                <strong style={{ color: 'var(--text-primary)' }}>{telemetry.tabSwitches} switches</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Distracted Duration</span>
                <strong style={{ color: 'var(--text-primary)' }}>{analyticsReport.awayDurationSec} seconds</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Average Blink Rate</span>
                <strong style={{ color: 'var(--text-primary)' }}>{analyticsReport.blinkRate} blinks/min</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Speech Duration / Silence</span>
                <strong style={{ color: 'var(--text-primary)' }}>{telemetry.speakingDuration}s / {telemetry.silenceDuration}s</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Strengths */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(5, 150, 105, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--emerald)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Grotesk' }}>
              <CheckCircle size={16} /> Key Strengths
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 0, listStyle: 'none', margin: 0 }}>
              {analyticsReport.strengths.map((s, i) => (
                <li key={i} style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: 'var(--emerald)' }}>•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(225, 29, 72, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--rose)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Grotesk' }}>
              <HelpCircle size={16} /> Areas To Improve
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 0, listStyle: 'none', margin: 0 }}>
              {analyticsReport.improvements.map((imp, i) => (
                <li key={i} style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: 'var(--rose)' }}>•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Overall Evaluation Scorecard */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px'
        }}>
          <h4 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Grotesk' }}>
            <Cpu size={16} color="var(--primary)" /> AI Evaluation Details
          </h4>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: '0.85rem' }}>
              <div>Overall Grade: <strong style={{ color: 'var(--primary)' }}>{scorecard.overall_score}%</strong></div>
              <div>Technical Depth: <strong style={{ color: 'var(--indigo)' }}>{scorecard.technical_depth_score}%</strong></div>
              <div>Communication: <strong style={{ color: 'var(--emerald)' }}>{scorecard.communication_score}%</strong></div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
              {scorecard.feedback_summary}
            </p>
          </div>
        </div>

        {/* Restart Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <button className="btn btn-primary" onClick={handleConsent}>
            <RefreshCw size={14} /> Restart Mock Interview
          </button>
        </div>
      </motion.div>
    );
  }

  // ── 4. Active Chat & Telemetry workspace ─────────────────────────
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 20
    }}>
      {/* LEFT: Interview Terminal */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: 520,
        background: termBg,
        border: `1.5px solid ${termBorder}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Terminal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: termHeaderBg,
          borderBottom: `1.5px solid ${termBorder}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={14} color="var(--primary)" />
            <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Mock_AI_Interviewer_Terminal.sh
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
          </div>
        </div>

        {/* Terminal Messages Feed */}
        <div
          ref={feedRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: 1.5,
          }}
        >
          {error && (
            <div style={{
              background: 'rgba(186, 26, 26, 0.1)',
              border: '1px solid rgba(186, 26, 26, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              color: '#ff8a8a',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>
                <strong>[SYSTEM ERROR]</strong> {error}
              </div>
            </div>
          )}

          {/* Intro logs */}
          <div style={{ color: 'var(--text-muted)' }}>
            <div>[system] Connecting to local AI agent session...</div>
            <div>[system] Target role: {targetRole} loaded successfully.</div>
            <div>[system] Monitoring active (webcam/mic analysed locally).</div>
            <div style={{ margin: '8px 0', borderTop: `1px dashed ${termBorder}` }} />
          </div>

          {messages.map((m, idx) => {
            const isInterviewer = m.role === 'assistant';
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isInterviewer ? -8 : 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignSelf: isInterviewer ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                }}
              >
                <div style={{
                  width: 28, height: 28,
                  borderRadius: '50%',
                  background: isInterviewer ? 'rgba(163, 82, 0, 0.08)' : 'rgba(97, 46, 2, 0.08)',
                  border: `1px solid ${isInterviewer ? 'rgba(163, 82, 0, 0.25)' : 'rgba(219, 39, 119, 0.25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2
                }}>
                  {isInterviewer ? <Cpu size={13} color="var(--primary)" /> : <User size={13} color="var(--violet)" />}
                </div>
                <div style={{
                  background: isInterviewer ? (theme === 'dark' ? '#120d2b' : '#FAF6F0') : 'rgba(163, 82, 0, 0.04)',
                  border: `1.5px solid ${isInterviewer ? 'var(--border)' : 'rgba(163, 82, 0, 0.15)'}`,
                  borderRadius: isInterviewer ? '0 12px 12px 12px' : '12px 0 12px 12px',
                  padding: '12px 16px',
                  color: termText,
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.content}
                </div>
              </motion.div>
            );
          })}

          {/* Typing indicator */}
          {chatting && (
            <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-start' }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: 'rgba(163, 82, 0, 0.08)',
                border: '1.5px solid rgba(163, 82, 0, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Cpu size={13} color="var(--primary)" />
              </div>
              <div style={{
                background: theme === 'dark' ? '#120d2b' : '#FAF6F0',
                border: '1.5px solid var(--border)',
                borderRadius: '0 12px 12px 12px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                {[0, 1, 2].map(dot => (
                  <motion.span
                    key={dot}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15 }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Terminal Input Form */}
        <form
          onSubmit={handleSend}
          style={{
            display: 'flex',
            gap: 12,
            padding: '16px',
            background: termHeaderBg,
            borderTop: `1.5px solid ${termBorder}`,
            alignItems: 'center',
          }}
        >
          <span style={{ color: 'var(--emerald)', fontFamily: 'monospace', fontSize: '0.95rem', paddingLeft: 4, fontWeight: 'bold' }}>$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={chatting ? 'Interviewer is typing...' : 'Type your response...'}
            disabled={chatting}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: termText,
              fontFamily: 'monospace',
              fontSize: '0.88rem',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || chatting}
            style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: input.trim() && !chatting ? 'var(--primary)' : 'var(--border)',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !chatting ? 'pointer' : 'not-allowed',
              color: 'white',
              transition: 'background 0.2s',
            }}
          >
            <Send size={14} />
          </button>
        </form>
      </div>

      {/* RIGHT: Camera & Telemetry Dashboard */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        {/* Webcam Card */}
        <div className="card" style={{
          padding: 16,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          position: 'relative',
          overflow: 'hidden'
        }}>


          {/* Native video element showing live camera feed directly */}
          <video 
            ref={videoElementRef} 
            autoPlay 
            playsInline 
            muted 
            style={{
              width: '100%',
              height: '160px',
              borderRadius: 'var(--radius-sm)',
              background: '#0d1527',
              border: '1.5px solid var(--border)',
              objectFit: 'cover'
            }} 
          />

          {/* Active Audio amplitude meter */}
          <div style={{ width: '100%', marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Volume2 size={12} /> Voice Amplitude
              </span>
              <span>{telemetry.isSpeaking ? 'Speaking' : 'Silent'}</span>
            </div>
            <div className="progress-track" style={{ height: 6 }}>
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${telemetry.amplitude}%`, 
                  background: telemetry.isSpeaking ? 'var(--emerald)' : 'var(--border-active)' 
                }} 
              />
            </div>
          </div>

          {/* Reset / Reconnect Camera button */}
          <button 
            type="button"
            onClick={refreshCameraFeed}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--bg-accent-light)';
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--bg-primary)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <RefreshCw size={12} />
            <span>Reset / Reconnect Camera</span>
          </button>
        </div>

        {/* Live Telemetry Statistics Card */}
        <div className="card" style={{
          flex: 1,
          padding: 18,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <h4 style={{ fontSize: '0.88rem', fontFamily: 'Space Grotesk', fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChart3 size={14} color="var(--primary)" /> Live Telemetry
          </h4>

          <div style={{ display: 'grid', gap: 8, fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Face Status:</span>
              <strong style={{ color: telemetry.faceVisible ? 'var(--emerald)' : 'var(--rose)' }}>
                {telemetry.faceVisible ? 'Visible' : 'Not Visible'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Gaze Direction:</span>
              <strong style={{ color: telemetry.lookDirection === 'Looking At Screen' ? 'var(--text-primary)' : 'var(--rose)' }}>
                {telemetry.lookDirection}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Blink Rate:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{telemetry.blinkRate} blinks/min</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tab switches:</span>
              <strong style={{ color: telemetry.tabSwitches > 0 ? 'var(--rose)' : 'var(--text-primary)' }}>
                {telemetry.tabSwitches} switches
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Speaking Time:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{telemetry.speakingDuration}s</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 2 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Silence Time:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{telemetry.silenceDuration}s</strong>
            </div>
          </div>

          {/* live focus indicators */}
          <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                {telemetry.screenFocusScore}%
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Gaze Focus</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--indigo)' }}>
                {telemetry.focusScore}%
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tab Focus</div>
            </div>
          </div>
        </div>
      </div>

      {savingAnalytics && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          color: 'white'
        }}>
          <div className="spinner" />
          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Syncing interview analytics report...</p>
        </div>
      )}
    </div>
  );
}
