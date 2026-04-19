import React, { useRef, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  // 🎥 Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied ❌");
    }
  };

  // 📸 Capture + Detect
  const captureAndDetect = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, 300, 200);

    const imageData = canvas.toDataURL("image/png");

    try {
      const res = await axios.post("http://127.0.0.1:5000/gesture-to-text", {
        image: imageData,
      });

      setText(res.data.text);
      setAudioUrl(res.data.audio_url);

      // 🔊 Try auto play
      if (res.data.audio_url) {
        const audio = new Audio(res.data.audio_url);
        audio.play().catch(() => {
          console.log("Autoplay blocked");
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ▶️ Start Detection
  const startDetection = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      captureAndDetect();
    }, 1500);
  };

  // ⏹ Stop Detection
  const stopDetection = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">AI Communication Dashboard</h1>

      {/* 🎥 Camera */}
      <video
        ref={videoRef}
        autoPlay
        className="border rounded w-[300px]"
      ></video>

      <canvas ref={canvasRef} width="300" height="200" hidden></canvas>

      {/* 🎛 Buttons */}
      <div className="flex gap-4">
        <button
          onClick={startCamera}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Start Camera
        </button>

        <button
          onClick={startDetection}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Start Detection
        </button>

        <button
          onClick={stopDetection}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Stop
        </button>
      </div>

      {/* 🧠 Text Output */}
      <div className="mt-4 p-4 border rounded w-[300px] text-center">
        <h2 className="font-semibold">Detected Text:</h2>
        <p className="text-lg mt-2">{text}</p>
      </div>

      {/* 🔊 Manual Play Button (IMPORTANT FIX) */}
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
    </div>
  );
};

export default Dashboard;