"use client";
import { useRef, useEffect, useState, useCallback } from "react";

interface SignaturePadProps {
  onSave: (signatureBase64: string) => void;
  onCancel: () => void;
  title?: string;
}

export default function SignaturePad({ onSave, onCancel, title = "ลงลายเซ็น" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    setIsEmpty(false);
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pos = getPos(e, canvas);
      if (lastPos.current) {
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      lastPos.current = pos;
    },
    [isDrawing]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    const base64 = canvas.toDataURL("image/png");
    onSave(base64);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        className="animate-fade-in-up"
        style={{
          background: "white",
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px",
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{title}</h2>
          <button
            onClick={onCancel}
            style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text-tertiary)", padding: 4 }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 12 }}>
          ลากนิ้วบนพื้นที่ด้านล่างเพื่อเซ็นลายเซ็น
        </p>

        {/* Canvas */}
        <div
          style={{
            border: "2px dashed #dee2e6",
            borderRadius: 16,
            overflow: "hidden",
            touchAction: "none",
            userSelect: "none",
          }}
        >
          <canvas
            ref={canvasRef}
            width={400}
            height={180}
            style={{ width: "100%", height: 180, display: "block", cursor: "crosshair" }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            onClick={clear}
            style={{
              flex: 1,
              padding: "13px",
              border: "1.5px solid var(--border)",
              borderRadius: 12,
              background: "white",
              color: "var(--text-secondary)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ล้างลายเซ็น
          </button>
          <button
            onClick={save}
            disabled={isEmpty}
            style={{
              flex: 2,
              padding: "13px",
              border: "none",
              borderRadius: 12,
              background: isEmpty ? "#e9ecef" : "var(--mtc-red)",
              color: isEmpty ? "#adb5bd" : "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: isEmpty ? "not-allowed" : "pointer",
              boxShadow: isEmpty ? "none" : "var(--shadow-red-sm)",
              transition: "all 0.2s",
            }}
          >
            ✓ บันทึกลายเซ็น
          </button>
        </div>
      </div>
    </div>
  );
}
