import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  QrCode, 
  Camera, 
  Search, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  Store, 
  Phone, 
  User, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Printer,
  FileText,
  Upload,
  Sparkles
} from 'lucide-react';
import jsQR from 'jsqr';
import { OrderRecord } from '../types';
import { getCutLabel } from '../data/products';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  onSelectOrder: (order: OrderRecord) => void;
  onPrintReceipt?: (order: OrderRecord) => void;
  onUpdateOrderStatus?: (orderId: string, status: OrderRecord['status']) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
  onPrintReceipt,
  onUpdateOrderStatus,
}) => {
  const [manualInput, setManualInput] = useState('');
  const [foundOrder, setFoundOrder] = useState<OrderRecord | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [scanSuccessAnim, setScanSuccessAnim] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setFoundOrder(null);
      setManualInput('');
      setErrorMessage(null);
      setCameraPermissionError(null);
      setScanSuccessAnim(false);
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanningCamera(false);
  };

  const startCamera = async () => {
    setCameraPermissionError(null);
    setErrorMessage(null);
    setIsScanningCamera(true);

    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsScanningCamera(false);
      setCameraPermissionError(
        'Kamera tidak dapat diakses atau kebenaran disekat. Anda boleh muat naik gambar QR atau taip No. Pesanan secara manual.'
      );
    }
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (canvas) {
        const video = videoRef.current;
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleScannedText(code.data);
            return;
          }
        }
      }
    }
    if (streamRef.current) {
      animationFrameId.current = requestAnimationFrame(tick);
    }
  };

  const parseOrderNumber = (rawText: string): string => {
    const text = rawText.trim();
    // Check if it's a URL with ?orderId= or /order/ or order=
    try {
      if (text.startsWith('http://') || text.startsWith('https://')) {
        const url = new URL(text);
        const qId = url.searchParams.get('orderId') || url.searchParams.get('id') || url.searchParams.get('order');
        if (qId) return qId.replace(/^#/, '').trim();
      }
    } catch {
      // ignore
    }

    // Match patterns like KFF-123456, #KFF-123456, 123456
    const clean = text.replace(/^#/, '').trim();
    return clean;
  };

  const handleScannedText = (scannedText: string) => {
    const orderIdToFind = parseOrderNumber(scannedText);
    stopCamera();
    findOrder(orderIdToFind);
  };

  const findOrder = (query: string) => {
    const q = query.trim().toLowerCase().replace(/^#/, '');
    if (!q) {
      setErrorMessage('Sila masukkan No. Pesanan atau imbas Kod QR.');
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);

    const match = orders.find((o) => {
      const idMatch = o.orderId.toLowerCase() === q || o.orderId.toLowerCase().replace(/^kff-/, '') === q;
      const phoneMatch = o.customer.phone.replace(/\D/g, '') === q.replace(/\D/g, '');
      const nameMatch = o.customer.fullName.toLowerCase().includes(q) && q.length >= 3;
      return idMatch || phoneMatch || nameMatch;
    });

    setIsSearching(false);

    if (match) {
      setFoundOrder(match);
      setScanSuccessAnim(true);
      setTimeout(() => setScanSuccessAnim(false), 2000);
    } else {
      setFoundOrder(null);
      setErrorMessage(`Tiada pesanan ditemui dengan No. Pesanan/QR "${query}". Sila pastikan no. pesanan tepat.`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    findOrder(manualInput);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleScannedText(code.data);
          } else {
            setErrorMessage('Kod QR tidak dapat dikesan dari imej yang dimuat naik. Sila cuba gambar yang lebih jelas atau taip No. Pesanan.');
          }
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input value
    e.target.value = '';
  };

  if (!isOpen) return null;

  const isPickup = foundOrder?.fulfillmentType === 'pickup' || foundOrder?.customer.fulfillmentType === 'pickup';
  const totalItems = foundOrder?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-stone-950 via-emerald-950 to-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md ring-2 ring-emerald-400/30">
              <QrCode className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight font-['Outfit']">
                  Imbas QR Resit & Semakan Pantas
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                  Pasar Semenyih
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                Imbas kod QR pada resit fizikal/bungkusan pelanggan untuk menyemak status, slot & lokasi pickup.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Top Scanner / Search Bar */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={isScanningCamera ? stopCamera : startCamera}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer shadow-xs ${
                  isScanningCamera
                    ? 'bg-rose-600 text-white border-rose-500 hover:bg-rose-700 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{isScanningCamera ? 'Hentikan Kamera Scanner' : 'Buka Kamera Imbas QR'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-750 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Muat Naik Foto Kod QR</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Camera Viewfinder if Active */}
            {isScanningCamera && (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-emerald-500 shadow-inner">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-emerald-400 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-emerald-300 bg-black/60 px-2 py-1 rounded-md">
                      Halakan Kamera ke Kod QR
                    </span>
                  </div>
                </div>
              </div>
            )}

            {cameraPermissionError && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-bold block">Akses Kamera Disekat</span>
                  <span>{cameraPermissionError}</span>
                </div>
              </div>
            )}

            {/* Manual No. Pesanan Input */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Atau masukkan No. Pesanan (cth: KFF-123456) / Nama / Telefon"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 pl-9 text-xs focus:outline-hidden focus:border-emerald-500 text-stone-900 dark:text-white"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Cari</span>
              </button>
            </form>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* FOUND ORDER DISPLAY */}
          {foundOrder ? (
            <div className={`rounded-2xl border transition-all space-y-3 p-4 ${
              scanSuccessAnim
                ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-400/40'
                : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-700 shadow-sm'
            }`}>
              
              {/* Order Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-750 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    No. Pesanan Ditemui:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-stone-900 dark:text-white font-mono">
                      #{foundOrder.orderId}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase flex items-center gap-1 ${
                      isPickup
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300'
                        : 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-300'
                    }`}>
                      {isPickup ? <Store className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                      <span>{isPickup ? 'Ambil Sendiri (Pasar)' : 'Penghantaran Rider'}</span>
                    </span>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-stone-500">Status:</span>
                  <select
                    value={foundOrder.status}
                    onChange={(e) => {
                      const newSt = e.target.value as OrderRecord['status'];
                      if (onUpdateOrderStatus) {
                        onUpdateOrderStatus(foundOrder.orderId, newSt);
                      }
                      setFoundOrder({ ...foundOrder, status: newSt });
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-black border cursor-pointer ${
                      foundOrder.status === 'disahkan'
                        ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                        : foundOrder.status === 'sembelih-potong'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                        : foundOrder.status === 'pembungkusan-sejuk'
                        ? 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300'
                        : foundOrder.status === 'dalam-penghantaran'
                        ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    <option value="disahkan">1. Disahkan</option>
                    <option value="sembelih-potong">2. Sembelih & Potong</option>
                    <option value="pembungkusan-sejuk">3. Pack Dan Tunggu Rider</option>
                    <option value="dalam-penghantaran">4. Sedia Ambil / Rider</option>
                    <option value="selesai">5. Selesai</option>
                  </select>
                </div>
              </div>

              {/* Customer & Fulfillment Info Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1">
                  <div className="font-bold text-[10px] text-stone-500 uppercase flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Maklumat Pelanggan</span>
                  </div>
                  <div className="font-black text-sm text-stone-900 dark:text-white">
                    {foundOrder.customer.fullName}
                  </div>
                  <div className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span className="font-mono">{foundOrder.customer.phone}</span>
                  </div>
                  {foundOrder.customer.email && (
                    <div className="text-[11px] text-stone-400 truncate">{foundOrder.customer.email}</div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <div className="font-bold text-[10px] text-emerald-800 dark:text-emerald-400 uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Lokasi & Jadual</span>
                  </div>
                  <div className="font-bold text-stone-900 dark:text-white">
                    {isPickup ? (
                      <span className="text-emerald-700 dark:text-emerald-300 font-extrabold">
                        Gerai GA 59, Pasar Semenyih
                      </span>
                    ) : (
                      <span>{foundOrder.customer.address}, {foundOrder.customer.postcode} {foundOrder.customer.city}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-300 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                    <span>Tarikh: <strong>{foundOrder.customer.deliveryDate}</strong></span>
                    <span>Slot: <strong>{isPickup ? (foundOrder.customer.pickupTime || '09:00 AM') : foundOrder.customer.deliverySlot.toUpperCase()}</strong></span>
                  </div>
                </div>
              </div>

              {/* Order Items & Cutting Details */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex justify-between items-center font-bold text-[11px]">
                  <span>Item Tempahan ({totalItems} unit)</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400 font-['Outfit']">
                    Jumlah: RM {foundOrder.total.toFixed(2)}
                  </span>
                </div>

                <div className="divide-y divide-stone-200 dark:divide-stone-700">
                  {foundOrder.items.map((it, idx) => {
                    const cutLabel = it.product.supportsCutting && it.selectedCut
                      ? getCutLabel(it.selectedCut, it.product)
                      : null;

                    return (
                      <div key={idx} className="py-1.5 flex justify-between items-start gap-2">
                        <div>
                          <div className="font-bold text-stone-900 dark:text-white">
                            {idx + 1}. {it.product.name} <span className="text-emerald-600">x{it.quantity}</span>
                          </div>
                          <div className="text-[10px] text-stone-500 space-x-2">
                            {it.selectedWeightOption && <span>• Saiz: {it.selectedWeightOption.weightLabel}</span>}
                            {cutLabel && (
                              <span className="font-black text-stone-800 dark:text-stone-200 bg-stone-200 dark:bg-stone-700 px-1 rounded">
                                ✂ POTONG: {cutLabel}
                              </span>
                            )}
                            {it.organVariationLabel && <span>• {it.organVariationLabel}</span>}
                          </div>
                          {it.specialNotes && (
                            <div className="text-[10px] text-amber-600 font-bold italic">
                              ★ Nota: {it.specialNotes}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-stone-800 dark:text-stone-200 shrink-0">
                          RM {it.itemTotalPrice.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons for this Order */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-stone-200 dark:border-stone-700">
                {onPrintReceipt && (
                  <button
                    type="button"
                    onClick={() => {
                      onPrintReceipt(foundOrder);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cetak Resit Thermal 80mm</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onSelectOrder(foundOrder);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lihat Slip Penuh di Portal</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl text-stone-400">
              <QrCode className="w-12 h-12 mx-auto mb-2 opacity-40 text-emerald-600" />
              <p className="font-bold text-stone-700 dark:text-stone-300">Belum ada pesanan diimbas</p>
              <p className="text-[11px] mt-1">
                Gunakan kamera imbasan di atas atau masukkan No. Pesanan untuk melihat status pesanan dan butiran pickup dengan segera.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-stone-100 dark:bg-stone-800/90 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500">
            Sistem Imbasan Resit Semenyih • Khairul Fresh Food
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-300 dark:hover:bg-stone-600 text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
