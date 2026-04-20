import React, { useRef, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [language, setLanguage] = useState("en");

  // 🎥 Camera
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  // 📸 Capture
  const captureAndDetect = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 300, 200);

    const imageData = canvas.toDataURL("image/png");

    try {
      const res = await axios.post("http://127.0.0.1:5000/gesture-to-text", {
        image: imageData,
        lang: language,
      });

      setText(res.data.text);
      setAudioUrl(res.data.audio_url);

      // 🔊 Auto play
      if (res.data.audio_url) {
        const audio = new Audio(res.data.audio_url);
        audio.play().catch(() => {});
      }

    } catch (err) {
      console.log(err);
    }
  };

  // ▶️ Start detection
  const startDetection = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      captureAndDetect();
    }, 1500);
  };

  // ⏹ Stop
  const stopDetection = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 🎙 Recording
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    let chunks = [];

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedAudio(url);
    };

    recorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">AI Communication Dashboard</h1>

      {/* 🎥 Camera */}
      <video ref={videoRef} autoPlay className="border rounded w-[300px]" />
      <canvas ref={canvasRef} width="300" height="200" hidden />

      {/* 🎛 Controls */}
      <div className="flex flex-wrap gap-3">

        <button onClick={startCamera} className="bg-blue-500 text-white px-4 py-2 rounded">
          Start Camera
        </button>

        <button onClick={startDetection} className="bg-green-500 text-white px-4 py-2 rounded">
          Start Detection
        </button>

        <button onClick={stopDetection} className="bg-red-500 text-white px-4 py-2 rounded">
          Stop
        </button>

        {/* 🌐 Language */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="en">English</option>
          <option value="ta">Tamil</option>
          <option value="hi">Hindi</option>
        </select>

        {/* 🎙 Recording */}
        <button onClick={startRecording} className="bg-pink-500 text-white px-4 py-2 rounded">
          🎙 Record
        </button>

        <button onClick={stopRecording} className="bg-gray-700 text-white px-4 py-2 rounded">
          Stop Rec
        </button>
      </div>

      {/* 🧠 Text */}
      <div className="mt-4 p-4 border rounded w-[300px] text-center">
        <h2 className="font-semibold">Detected Text:</h2>
        <p className="text-lg mt-2">{text}</p>
      </div>

      {/* 🔊 Voice */}
      {audioUrl && (
        <button
          onClick={() => {
            const audio = new Audio(audioUrl);
            audio.play();
          }}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          🔊 Play Voice
        </button>
      )}

      {/* 🎧 Recorded Playback */}
      {recordedAudio && (
        <audio controls src={recordedAudio} className="mt-4"></audio>
      )}
    </div>
  );
};

export default Dashboard;