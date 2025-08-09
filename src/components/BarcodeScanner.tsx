"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { offlineStorage } from "@/lib/offline";
import { Scan } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError: (error: string) => void;
  continuous?: boolean;
}

// バーコード形式の検証
const validateBarcode = (
  barcode: string
): { isValid: boolean; type: string; error?: string } => {
  // EAN-13/JAN-13の検証（13桁の数字）
  if (/^\d{13}$/.test(barcode)) {
    // チェックディジットの検証
    const digits = barcode.split("").map(Number);
    const checkDigit = digits[12];
    const sum = digits.slice(0, 12).reduce((acc, digit, index) => {
      return acc + digit * (index % 2 === 0 ? 1 : 3);
    }, 0);
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;

    if (checkDigit === calculatedCheckDigit) {
      return { isValid: true, type: "EAN-13/JAN-13" };
    } else {
      return {
        isValid: false,
        type: "EAN-13/JAN-13",
        error: "チェックディジットが無効です",
      };
    }
  }

  // EAN-8の検証（8桁の数字）
  if (/^\d{8}$/.test(barcode)) {
    return { isValid: true, type: "EAN-8" };
  }

  // UPC-Aの検証（12桁の数字）
  if (/^\d{12}$/.test(barcode)) {
    return { isValid: true, type: "UPC-A" };
  }

  // UPC-Eの検証（8桁の数字）
  if (/^\d{8}$/.test(barcode)) {
    return { isValid: true, type: "UPC-E" };
  }

  return {
    isValid: false,
    type: "Unknown",
    error: "サポートされていないバーコード形式です",
  };
};

export function BarcodeScanner({
  onScan,
  onError,
  continuous = false,
  isDemoMode = false,
}: BarcodeScannerProps & { isDemoMode?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // デモ用サンプルバーコード
  const demoBarcodes = [
    "4901234567890", // 抹茶クッキー
    "4901234567891", // 抹茶チョコレート
    "4901234567892", // 抹茶ラテミックス
    "4901234567893", // 抹茶アイスクリーム
    "4901234567894", // 抹茶ケーキ
    "4901234567895", // 東京ばな奈
    "4901234567896", // 雷おこし
    "4901234567897", // 東京スカイツリークッキー
    "4901234567898", // SK-II 化粧水
    "4901234567899", // 資生堂 洗顔フォーム
  ];

  const handleDemoScan = (barcode: string) => {
    toast.success(`デモ: バーコード ${barcode} をスキャンしました`);
    onScan(barcode);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (readerRef.current) {
        try {
          const reader = readerRef.current as any;
          if (typeof reader.reset === "function") {
            reader.reset();
          } else if (typeof reader.stopAsyncDecode === "function") {
            reader.stopAsyncDecode();
          }
        } catch (err) {
          console.warn("Error stopping reader:", err);
        }
      }
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const startScanning = async () => {
    if (typeof window === "undefined") return;

    try {
      setError(null);
      setIsScanning(true);
      setScanCount(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }

      readerRef.current = new BrowserMultiFormatReader();

      try {
        await readerRef.current.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const barcode = result.getText();
              console.log("Barcode detected:", barcode);

              // バーコード形式の検証
              const validation = validateBarcode(barcode);
              if (!validation.isValid) {
                setError(`バーコード形式エラー: ${validation.error}`);
                toast.error(`バーコード形式エラー: ${validation.error}`);
                return;
              }

              // 連続スキャン時の重複チェック
              if (continuous && lastScannedBarcode === barcode) {
                return;
              }

              setLastScannedBarcode(barcode);
              setScanCount((prev) => prev + 1);

              // オフライン対応：スキャンデータを保存
              if (!offlineStorage.isOnline()) {
                offlineStorage.saveScan({
                  barcode,
                  status: "pending",
                });
                toast.info("オフライン中です。データは後で同期されます。");
              }

              onScan(barcode);

              if (!continuous) {
                stopScanning();
              } else {
                // 連続スキャン時の一時停止
                if (scanTimeoutRef.current) {
                  clearTimeout(scanTimeoutRef.current);
                }
                scanTimeoutRef.current = setTimeout(() => {
                  setLastScannedBarcode(null);
                }, 2000); // 2秒後に同じバーコードを再スキャン可能に
              }
            }
            if (error && error.name !== "NotFoundException") {
              console.error("Scanning error:", error);
              handleScanError(error);
            }
          }
        );
      } catch (decodeError) {
        console.error("Decode error:", decodeError);
        setError("バーコード読み取りの初期化に失敗しました");
        onError("バーコード読み取りの初期化に失敗しました");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("カメラへのアクセスが拒否されました");
      onError("カメラへのアクセスが拒否されました");
    }
  };

  const handleScanError = (error: any) => {
    let errorMessage = "スキャン中にエラーが発生しました";

    if (error.name === "NotAllowedError") {
      errorMessage = "カメラの使用が許可されていません";
    } else if (error.name === "NotFoundError") {
      errorMessage = "カメラが見つかりません";
    } else if (error.name === "NotReadableError") {
      errorMessage = "カメラが他のアプリケーションで使用中です";
    } else if (error.name === "OverconstrainedError") {
      errorMessage = "カメラの設定が適切ではありません";
    } else if (error.name === "StreamApiNotSupportedError") {
      errorMessage = "お使いのブラウザはカメラ機能をサポートしていません";
    }

    setError(errorMessage);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (readerRef.current) {
      try {
        const reader = readerRef.current as any;
        if (typeof reader.reset === "function") {
          reader.reset();
        } else if (typeof reader.stopAsyncDecode === "function") {
          reader.stopAsyncDecode();
        }
      } catch (err) {
        console.warn("Error stopping reader:", err);
      }
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setHasPermission(false);
    setLastScannedBarcode(null);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
  };

  const getErrorGuidance = () => {
    if (!error) return null;

    if (error.includes("カメラへのアクセスが拒否されました")) {
      return "設定からカメラの使用を許可してください";
    } else if (error.includes("カメラが他のアプリケーションで使用中")) {
      return "他のアプリを閉じてから再度お試しください";
    } else if (error.includes("カメラが見つかりません")) {
      return "デバイスにカメラがあることを確認してください";
    } else if (error.includes("バーコード読み取りの初期化に失敗")) {
      return "ページを再読み込みしてから再度お試しください";
    } else if (error.includes("バーコード形式エラー")) {
      return "EAN-13/JAN-13、EAN-8、UPC-A、UPC-E形式のバーコードをスキャンしてください";
    }

    return "もう一度近づけてスキャンしてください";
  };

  // マウント前は何も表示しない
  if (!isMounted) {
    return null;
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Scan className='w-5 h-5' />
          バーコードスキャナー
          {isDemoMode && (
            <Badge variant='secondary' className='text-xs'>
              デモモード
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isDemoMode && (
          <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
            <h4 className='font-medium text-blue-900 mb-2'>
              デモ用サンプルバーコード
            </h4>
            <div className='grid grid-cols-2 gap-2'>
              {demoBarcodes.map((barcode) => (
                <Button
                  key={barcode}
                  variant='outline'
                  size='sm'
                  onClick={() => handleDemoScan(barcode)}
                  className='text-xs'
                >
                  {barcode}
                </Button>
              ))}
            </div>
            <p className='text-xs text-blue-600 mt-2'>
              💡 これらのバーコードをクリックしてデモを体験できます
            </p>
          </div>
        )}

        {error && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-red-700 text-sm'>{error}</p>
          </div>
        )}

        <div className='relative w-full'>
          <video
            ref={videoRef}
            className='w-full h-64 bg-gray-100 rounded-lg object-cover'
            autoPlay
            playsInline
            muted
          />
          {!hasPermission && !isScanning && (
            <div className='absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg'>
              <div className='text-center'>
                <Scan className='w-12 h-12 text-gray-400 mx-auto mb-2' />
                <p className='text-gray-500'>
                  カメラを起動してバーコードをスキャン
                </p>
              </div>
            </div>
          )}
        </div>

        <div className='flex gap-2'>
          {!isScanning ? (
            <Button
              onClick={startScanning}
              className='flex-1'
              disabled={!hasPermission && !isDemoMode}
            >
              <Scan className='w-4 h-4 mr-2' />
              スキャン開始
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant='destructive'
              className='flex-1'
            >
              スキャン停止
            </Button>
          )}
        </div>

        {scanCount > 0 && (
          <div className='text-center'>
            <Badge variant='outline'>スキャン回数: {scanCount}</Badge>
          </div>
        )}

        {continuous && (
          <div className='text-xs text-gray-500 text-center'>
            <p>連続スキャンモード: 複数の商品を続けてスキャンできます</p>
            <p>同じ商品は2秒間隔で再スキャン可能</p>
          </div>
        )}

        <div className='text-xs text-gray-500 text-center'>
          <p>対応バーコード形式:</p>
          <p>EAN-13/JAN-13, EAN-8, UPC-A, UPC-E</p>
        </div>
      </CardContent>
    </Card>
  );
}
