"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useRouter } from "next/navigation";
import { X, ScanLine, Camera } from "lucide-react";

/**
 * Workshop 扫码器（QR-001/002）：员工扫 rider/摩托 QR → 解析 deep link → 跳转。
 * 用 zxing-js 浏览器扫码（getUserMedia 相机），支持视频流实时识别。
 * 识别到含 /qr/ 的 URL 后提取 token 段并路由。
 */
export function QrScanner({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(false);
  const scannedRef = useRef(false);

  useEffect(() => {
    if (!videoRef.current) return;
    const reader = new BrowserQRCodeReader();
    let cancelled = false;
    let stream: MediaStream | null = null;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        setActive(true);
        await reader.decodeFromStream(stream, videoRef.current, (result) => {
          if (scannedRef.current || !result) return;
          const text = result.getText();
          const match = text.match(/\/qr\/(motorcycle|rider|workshop)\/([A-Za-z0-9_-]+)/);
          if (match) {
            scannedRef.current = true;
            const [, type, token] = match;
            router.push("/qr/" + type + "/" + token);
          }
        });
      } catch {
        setError("Camera unavailable or permission denied. Tip: scan with the phone camera and open the link.");
        if (cancelled) return;
      }
    };
    start();

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90">
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold"><ScanLine className="h-4 w-4" /> Scan QR</div>
        <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close scanner">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-black">
          <video ref={videoRef} className="aspect-square w-full object-cover" playsInline muted />
          {active && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-56 w-56 rounded-2xl border-2 border-white/70" />
            </div>
          )}
        </div>
      </div>
      <div className="p-4 text-center">
        {error ? (
          <p className="text-sm text-amber-300">{error}</p>
        ) : (
          <p className="flex items-center justify-center gap-2 text-sm text-white/70"><Camera className="h-4 w-4" /> Point at a D&Z QR code — it will open automatically</p>
        )}
      </div>
    </div>
  );
}
