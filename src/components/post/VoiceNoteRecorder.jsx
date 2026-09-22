import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2 } from 'lucide-react';
import soundFX from '../../utils/soundEffects';
import toast from 'react-hot-toast';

export const VoiceNoteRecorder = ({ onAttachAudio, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioElementRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      soundFX.playPop();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Web Audio setup for live visualizer
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        // Convert blob to File and pass to parent
        const audioFile = new File([blob], `voice-memo-${Date.now()}.webm`, { type: 'audio/webm' });
        if (onAttachAudio) onAttachAudio(audioFile);

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
        if (audioCtx.state !== 'closed') audioCtx.close();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Start canvas drawing
      drawWaveform();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Không thể truy cập micro. Vui lòng cấp quyền.');
    }
  };

  const stopRecording = () => {
    soundFX.playPop();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#6366f1'; // Indigo brand color
        ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 1, barHeight || 2);
        x += barWidth;
      }
    };
    render();
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    soundFX.playPop();
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    soundFX.playPop();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsRecording(false);
    setIsPlaying(false);
    setDuration(0);
    if (onCancel) onCancel();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 select-none">
      <div className="flex items-center justify-between gap-3">
        {/* Left Status & Waveform */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isRecording ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Đang ghi âm: {formatTime(duration)}
              </span>
              <canvas ref={canvasRef} width={120} height={24} className="rounded" />
            </div>
          ) : audioUrl ? (
            <div className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={togglePlayback}
                className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition active:scale-95 shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ghi chú âm thanh ({formatTime(duration)})
              </span>
              <audio
                ref={audioElementRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mic className="w-4 h-4 text-indigo-500" />
              <span>Ghi âm giọng nói trực tiếp để đính kèm vào bài viết</span>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {!isRecording && !audioUrl && (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Bắt đầu ghi</span>
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Dừng lại</span>
            </button>
          )}

          {audioUrl && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Xóa bản ghi âm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceNoteRecorder;
