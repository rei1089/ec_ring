'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { Camera, Upload, X, Save } from 'lucide-react'

export default function CaptureNewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [formData, setFormData] = useState({
    shopName: '',
    price: '',
    description: '',
    memo: '',
    photo: null as File | null
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const barcode = searchParams.get('barcode')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
  }, [user, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const startCamera = async () => {
    if (typeof window === "undefined") return

    try {
      setIsCapturing(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (error) {
      console.error('Camera access error:', error)
      toast.error('カメラへのアクセスが拒否されました')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCapturing(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' })
        setFormData(prev => ({ ...prev, photo: file }))
        setCapturedImage(URL.createObjectURL(blob))
        stopCamera()
        toast.success('写真を撮影しました')
      }
    }, 'image/jpeg', 0.8)
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        toast.error('画像サイズは5MB以下にしてください')
        return
      }
      setFormData(prev => ({
        ...prev,
        photo: file
      }))
      setCapturedImage(URL.createObjectURL(file))
    }
  }

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }))
    setCapturedImage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('ログインが必要です')
      return
    }

    if (!formData.shopName.trim()) {
      toast.error('店舗名を入力してください')
      return
    }

    if (!formData.price.trim()) {
      toast.error('価格を入力してください')
      return
    }

    setIsLoading(true)

    try {
      let photoUrl = null

      // 写真がある場合はアップロード
      if (formData.photo) {
        // 実際の実装ではSupabase Storageにアップロード
        // ここでは簡易的にBase64エンコード
        const reader = new FileReader()
        photoUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(formData.photo!)
        })
      }

      const response = await fetch('/api/captures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawBarcode: barcode,
          photoUrl,
          shopNameText: formData.shopName,
          priceJpyText: formData.price,
          description: formData.description,
          memo: formData.memo,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save capture')
      }

      toast.success('商品情報を保存しました')
      router.push('/scan')
    } catch (error) {
      console.error('Save capture error:', error)
      toast.error('商品情報の保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // マウント前は何も表示しない
  if (!isMounted || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              商品情報入力
            </h1>
            <p className="text-gray-600">
              商品の写真を撮影して情報を入力してください
            </p>
            {barcode && (
              <Badge variant="secondary" className="mt-2">
                バーコード: {barcode}
              </Badge>
            )}
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>商品情報</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 写真撮影セクション */}
                <div className="space-y-4">
                  <Label>商品写真 *</Label>
                  
                  {!capturedImage ? (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          onClick={startCamera}
                          disabled={isCapturing}
                          className="flex-1"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          写真を撮影
                        </Button>
                        <div className="relative flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            画像を選択
                          </Button>
                        </div>
                      </div>

                      {isCapturing && (
                        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            autoPlay
                            playsInline
                            muted
                          />
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <Button
                              type="button"
                              onClick={capturePhoto}
                              size="lg"
                              className="rounded-full w-16 h-16"
                            >
                              <Camera className="w-6 h-6" />
                            </Button>
                          </div>
                          <canvas ref={canvasRef} className="hidden" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={capturedImage}
                        alt="Captured product"
                        className="w-full max-w-md mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removePhoto}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* 店舗名 */}
                <div className="space-y-2">
                  <Label htmlFor="shopName">店舗名 *</Label>
                  <Input
                    id="shopName"
                    value={formData.shopName}
                    onChange={(e) => handleInputChange('shopName', e.target.value)}
                    placeholder="例: ローソン 渋谷店"
                    required
                  />
                </div>

                {/* 価格 */}
                <div className="space-y-2">
                  <Label htmlFor="price">価格 (円) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="例: 298"
                    required
                  />
                </div>

                {/* 商品説明 */}
                <div className="space-y-2">
                  <Label htmlFor="description">商品説明</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="商品の詳細や特徴を入力してください"
                    rows={3}
                  />
                </div>

                {/* メモ */}
                <div className="space-y-2">
                  <Label htmlFor="memo">メモ</Label>
                  <Textarea
                    id="memo"
                    value={formData.memo}
                    onChange={(e) => handleInputChange('memo', e.target.value)}
                    placeholder="購入時のメモや思い出などを記録できます"
                    rows={2}
                  />
                </div>

                {/* 送信ボタン */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/scan')}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.shopName.trim() || !formData.price.trim() || !formData.photo}
                    className="flex-1"
                  >
                    {isLoading ? '保存中...' : '保存'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

