// KissanDost AI — Minimalist Farmer-First Leaf Vision & Disease Detection Modal
import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Calendar,
  MapPin,
  ShieldAlert,
  RefreshCw,
  Sprout,
} from 'lucide-react';
import { Language, Farm, RecommendationResult } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface CropScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFarm: Farm;
  language: Language;
  onAnalysisComplete: (result: RecommendationResult) => void;
}

export interface LeafBiomarkers {
  greenHealthyPct: number;
  yellowChloroticPct: number;
  brownNecroticPct: number;
}

export interface ImageQualityReport {
  blurScore: number;
  lightingScore: number;
  resolutionValid: boolean;
  leafVisibilityPct: number;
  overlappingLeaves: boolean;
  isAcceptable: boolean;
  rejectionReasons: string[];
}

export interface AutoVisionPreview {
  detectedCrop: 'Tomato' | 'Potato' | 'Wheat' | 'Maize' | 'Chili' | 'Onion' | 'Cotton' | 'Okra';
  cropConfidence: number;
  severity: 'Healthy' | 'Mild' | 'Moderate' | 'Severe';
  affectedLeafPct: number;
  detectedSymptoms: string[];
  internalSymptomKeys: string[];
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s, v };
}

function calculateCropAgeAndGrowthStage(
  crop: string,
  mode: 'days' | 'date',
  daysInput: number,
  dateInput: string
): {
  cropAgeDays: number;
  estimatedGrowthStage: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvest';
} {
  let ageDays = 45;
  if (mode === 'days') {
    ageDays = Math.max(1, Math.min(260, Math.round(daysInput || 45)));
  } else if (dateInput) {
    const parsed = new Date(dateInput);
    if (!Number.isNaN(parsed.getTime())) {
      const diff = Math.floor((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 1 && diff <= 300) {
        ageDays = diff;
      }
    }
  }

  const cropNorm = (crop || 'Tomato').toLowerCase();
  let stage: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvest' = 'Vegetative';

  if (cropNorm === 'wheat') {
    if (ageDays <= 22) stage = 'Seedling';
    else if (ageDays <= 65) stage = 'Vegetative';
    else if (ageDays <= 95) stage = 'Flowering';
    else if (ageDays <= 125) stage = 'Fruiting';
    else stage = 'Harvest';
  } else if (cropNorm === 'maize') {
    if (ageDays <= 18) stage = 'Seedling';
    else if (ageDays <= 50) stage = 'Vegetative';
    else if (ageDays <= 72) stage = 'Flowering';
    else if (ageDays <= 98) stage = 'Fruiting';
    else stage = 'Harvest';
  } else if (cropNorm === 'cotton') {
    if (ageDays <= 25) stage = 'Seedling';
    else if (ageDays <= 55) stage = 'Vegetative';
    else if (ageDays <= 85) stage = 'Flowering';
    else if (ageDays <= 135) stage = 'Fruiting';
    else stage = 'Harvest';
  } else {
    if (ageDays <= 20) stage = 'Seedling';
    else if (ageDays <= 42) stage = 'Vegetative';
    else if (ageDays <= 65) stage = 'Flowering';
    else if (ageDays <= 92) stage = 'Fruiting';
    else stage = 'Harvest';
  }

  return { cropAgeDays: ageDays, estimatedGrowthStage: stage };
}

export const CropScanModal: React.FC<CropScanModalProps> = ({
  isOpen,
  onClose,
  activeFarm,
  language,
  onAnalysisComplete,
}) => {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Step 1: Primary Leaf Image starts NULL (no pre-loaded photo before farmer uploads)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Pre-Diagnosis Image Quality State
  const [imageQuality, setImageQuality] = useState<ImageQualityReport>({
    blurScore: 91,
    lightingScore: 78,
    resolutionValid: true,
    leafVisibilityPct: 86,
    overlappingLeaves: false,
    isAcceptable: true,
    rejectionReasons: [],
  });

  // Step 2: Farmer Selects the Crop
  const [selectedCrop, setSelectedCrop] = useState<
    'Tomato' | 'Potato' | 'Wheat' | 'Maize' | 'Chili' | 'Cotton' | 'Onion'
  >('Cotton');

  // Extracted Leaf Biomarkers
  const [biomarkers, setBiomarkers] = useState<LeafBiomarkers>({
    greenHealthyPct: 92,
    yellowChloroticPct: 5,
    brownNecroticPct: 3,
  });

  // Step 3: Planting Age
  const [plantingInputMode, setPlantingInputMode] = useState<'days' | 'date'>('days');
  const [daysSincePlanting, setDaysSincePlanting] = useState<number>(48);
  const [plantingDate, setPlantingDate] = useState<string>(
    activeFarm.plantingDate || '2026-09-24'
  );
  const [recentlySprayedPesticide, setRecentlySprayedPesticide] = useState<boolean>(false);
  const [recentPesticideName, setRecentPesticideName] = useState<string>('');

  // GPS Detection State
  const [gpsAvailable, setGpsAvailable] = useState<boolean>(true);
  const [detectedDistrict, setDetectedDistrict] = useState<string>(activeFarm.district || 'Mardan');

  const [consentToShare] = useState<boolean>(true);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsAvailable(true);
          const { latitude, longitude } = pos.coords;
          if (latitude >= 33.5 && latitude <= 35.5 && longitude >= 71.0 && longitude <= 73.0) {
            if (longitude < 71.65) setDetectedDistrict('Peshawar');
            else if (longitude < 71.88) setDetectedDistrict('Charsadda');
            else if (latitude > 34.35) setDetectedDistrict('Malakand');
            else if (longitude > 72.25) setDetectedDistrict('Swabi');
            else setDetectedDistrict('Mardan');
          }
        },
        () => {
          setGpsAvailable(false);
        },
        { timeout: 3500 }
      );
    } else {
      setGpsAvailable(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * Computes quantitative RGB + HSV leaf color biomarkers AND Image Quality metrics.
   * Properly prioritizes sunlit healthy green foliage (h: 58..172 where g > r) and filters out human hands/skin.
   */
  const computeCanvasBiomarkersAndQuality = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    origWidth: number,
    origHeight: number
  ): { markers: LeafBiomarkers; quality: ImageQualityReport } => {
    try {
      const imgData = ctx.getImageData(0, 0, width, height).data;
      let greenScore = 0;
      let yellowScore = 0;
      let brownScore = 0;
      let leafPixelCount = 0;
      let totalSampledPixels = 0;
      let luminanceSum = 0;
      let edgeEnergySum = 0;
      let edgeSamples = 0;

      const xMinCenter = width * 0.15;
      const xMaxCenter = width * 0.85;
      const yMinCenter = height * 0.15;
      const yMaxCenter = height * 0.85;

      const isGreenLeafAt = (px: number, py: number): boolean => {
        if (px < 0 || px >= width || py < 0 || py >= height) return false;
        const i = (py * width + px) * 4;
        const pr = imgData[i];
        const pg = imgData[i + 1];
        const pb = imgData[i + 2];
        return pg > 35 && pg >= pr * 0.90 && pg > pb * 1.08;
      };

      for (let y = 2; y < height - 2; y += 2) {
        for (let x = 2; x < width - 2; x += 2) {
          const idx = (y * width + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];

          totalSampledPixels++;
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          luminanceSum += lum;

          const idxRight = (y * width + (x + 2)) * 4;
          const idxDown = ((y + 2) * width + x) * 4;
          const lumRight =
            0.299 * imgData[idxRight] + 0.587 * imgData[idxRight + 1] + 0.114 * imgData[idxRight + 2];
          const lumDown =
            0.299 * imgData[idxDown] + 0.587 * imgData[idxDown + 1] + 0.114 * imgData[idxDown + 2];
          edgeEnergySum += Math.abs(lum - lumRight) + Math.abs(lum - lumDown);
          edgeSamples++;

          const { h, s, v } = rgbToHsv(r, g, b);

          // Ignore pure black borders, white sky/glare, or desaturated gray background
          if (v < 0.06 || (s < 0.14 && v > 0.68) || s < 0.08) continue;

          const inCenter =
            x >= xMinCenter && x <= xMaxCenter && y >= yMinCenter && y <= yMaxCenter;
          const spatialWeight = inCenter ? 2.6 : 0.6;

          // 1. Check Healthy Green Foliage FIRST (includes sunlit lime-green leaf tissue where g >= r * 0.92)
          const isHealthyGreen =
            h >= 48 && h <= 175 && s >= 0.10 && v >= 0.14 && g >= r * 0.92 && g > b * 1.06;

          if (isHealthyGreen) {
            greenScore += spatialWeight;
            leafPixelCount++;
            continue;
          }

          // Check how many sides (Left, Right, Up, Down) within 8..24px have green leaf tissue
          const hasGreenLeft =
            isGreenLeafAt(x - 8, y) || isGreenLeafAt(x - 16, y) || isGreenLeafAt(x - 24, y);
          const hasGreenRight =
            isGreenLeafAt(x + 8, y) || isGreenLeafAt(x + 16, y) || isGreenLeafAt(x + 24, y);
          const hasGreenUp =
            isGreenLeafAt(x, y - 8) || isGreenLeafAt(x, y - 16) || isGreenLeafAt(x, y - 24);
          const hasGreenDown =
            isGreenLeafAt(x, y + 8) || isGreenLeafAt(x, y + 16) || isGreenLeafAt(x, y + 24);
          const greenSides =
            (hasGreenLeft ? 1 : 0) +
            (hasGreenRight ? 1 : 0) +
            (hasGreenUp ? 1 : 0) +
            (hasGreenDown ? 1 : 0);

          // 2. Filter out bright peach/pinkish human hand skin holding the leaf edge (never embedded on 2+ sides by green leaf)
          const isBrightPeachSkin =
            greenSides < 2 &&
            v >= 0.46 &&
            r >= 118 &&
            g >= 75 &&
            b >= 58 &&
            r > g * 1.08 &&
            b / r >= 0.38 &&
            s <= 0.50;

          if (isBrightPeachSkin) {
            continue;
          }

          // 3. True Necrotic Brown / Dark Vein Blight / Leaf Spots on the leaf
          const isNecroticColor =
            ((h >= 0 && h <= 45) || h >= 330) &&
            s >= 0.22 &&
            v >= 0.06 &&
            v <= 0.62 &&
            r > g * 1.08 &&
            r > b * 1.15;

          const isTanOrBrown =
            isNecroticColor && (greenSides >= 2 || (inCenter && greenSides >= 1 && (v <= 0.42 || s >= 0.45)));

          // 4. True Chlorotic Yellow on the leaf
          const isYellowHalo =
            !isTanOrBrown &&
            greenSides >= 1 &&
            h >= 36 &&
            h <= 56 &&
            s >= 0.32 &&
            v >= 0.38 &&
            r > g * 1.04 &&
            b < g * 0.65;

          if (isTanOrBrown) {
            // Amplify vein blight and leaf-embedded necrotic spots so narrow vein lesions are never diluted by background green
            brownScore += spatialWeight * (greenSides >= 2 ? 3.4 : 2.0);
            leafPixelCount++;
          } else if (isYellowHalo) {
            yellowScore += spatialWeight * 1.5;
            leafPixelCount++;
          }
        }
      }

      const avgLum = totalSampledPixels > 0 ? luminanceSum / totalSampledPixels : 128;
      const lightingScore = Math.max(0, Math.min(100, Math.round((avgLum / 255) * 100)));
      const avgEdge = edgeSamples > 0 ? edgeEnergySum / edgeSamples : 18;
      const blurScore = Math.max(15, Math.min(98, Math.round(avgEdge * 3.8)));
      const resolutionValid = origWidth >= 140 && origHeight >= 140;
      const leafVisibilityPct =
        totalSampledPixels > 0
          ? Math.min(100, Math.max(20, Math.round((leafPixelCount / totalSampledPixels) * 155)))
          : 80;

      const rejectionReasons: string[] = [];
      if (blurScore < 28) {
        rejectionReasons.push(
          language === 'ur'
            ? 'تصویر دھندلی ہے — براہِ کرم کیمرہ مستحکم رکھیں اور پتے کی صاف تصویر لیں۔'
            : language === 'ps'
            ? 'انځور تت دی — مهرباني وکړئ کیمره کلکه ونیسئ او د پاڼې صفا انځور واخلئ.'
            : 'Image is too blurry — please hold the camera steady and retake a clear leaf photo.'
        );
      }

      const quality: ImageQualityReport = {
        blurScore,
        lightingScore,
        resolutionValid,
        leafVisibilityPct,
        overlappingLeaves: false,
        isAcceptable: rejectionReasons.length === 0,
        rejectionReasons,
      };

      const totalScore = greenScore + yellowScore + brownScore;
      if (totalScore < 25) {
        return {
          markers: { greenHealthyPct: 94, yellowChloroticPct: 4, brownNecroticPct: 2 },
          quality,
        };
      }

      let greenHealthyPct = Math.round((greenScore / totalScore) * 100);
      let yellowChloroticPct = Math.round((yellowScore / totalScore) * 100);
      let brownNecroticPct = Math.max(0, 100 - greenHealthyPct - yellowChloroticPct);

      // If significant leaf-embedded necrotic pixels were detected (>= 6%), ensure they are not diluted by blurred green background
      if (brownNecroticPct >= 6) {
        brownNecroticPct = Math.max(brownNecroticPct, 16);
        yellowChloroticPct = Math.max(yellowChloroticPct, 8);
        greenHealthyPct = Math.max(0, 100 - brownNecroticPct - yellowChloroticPct);
      } else if (brownNecroticPct <= 4 && yellowChloroticPct <= 12) {
        // Truly clean, lesion-free green leaf
        greenHealthyPct = Math.max(greenHealthyPct, 94);
        brownNecroticPct = Math.min(brownNecroticPct, 2);
        yellowChloroticPct = Math.max(0, 100 - greenHealthyPct - brownNecroticPct);
      }

      return {
        markers: { greenHealthyPct, yellowChloroticPct, brownNecroticPct },
        quality,
      };
    } catch {
      return {
        markers: { greenHealthyPct: 90, yellowChloroticPct: 6, brownNecroticPct: 4 },
        quality: {
          blurScore: 88,
          lightingScore: 76,
          resolutionValid: true,
          leafVisibilityPct: 84,
          overlappingLeaves: false,
          isAcceptable: true,
          rejectionReasons: [],
        },
      };
    }
  };

  const computeAutoVisionPreview = (): AutoVisionPreview => {
    const { greenHealthyPct, yellowChloroticPct, brownNecroticPct } = biomarkers;
    const detectedCrop = selectedCrop;
    const detectedSymptoms: string[] = [];
    const internalSymptomKeys: string[] = [];

    if (brownNecroticPct <= 5 && yellowChloroticPct <= 14 && greenHealthyPct >= 82) {
      detectedSymptoms.push('Healthy green foliage (No lesions)');
      internalSymptomKeys.push('healthy_green');
    } else {
      if (brownNecroticPct >= 8) {
        detectedSymptoms.push('Brown lesions');
        internalSymptomKeys.push('brown_spots');
      }
      if (brownNecroticPct >= 22) {
        detectedSymptoms.push('Necrosis');
      }
      if (yellowChloroticPct >= 18 || brownNecroticPct >= 12) {
        detectedSymptoms.push('Yellowing', 'Chlorosis');
      }
      if (detectedCrop === 'Wheat') {
        internalSymptomKeys.push('yellow_powder');
      } else if (detectedCrop === 'Maize') {
        internalSymptomKeys.push('long_tan_spots');
      }
      if (detectedSymptoms.length === 0) {
        detectedSymptoms.push('Healthy green foliage');
        internalSymptomKeys.push('healthy_green');
      }
    }

    const affectedLeafPct = Math.max(0, Math.min(100, yellowChloroticPct + brownNecroticPct));
    let severity: 'Healthy' | 'Mild' | 'Moderate' | 'Severe' = 'Healthy';
    if (brownNecroticPct <= 5 && yellowChloroticPct <= 14 && greenHealthyPct >= 82) {
      severity = 'Healthy';
    } else if (affectedLeafPct <= 18) {
      severity = 'Mild';
    } else if (affectedLeafPct <= 38) {
      severity = 'Moderate';
    } else {
      severity = 'Severe';
    }

    return {
      detectedCrop,
      cropConfidence: 100,
      severity,
      affectedLeafPct,
      detectedSymptoms,
      internalSymptomKeys,
    };
  };

  const compressImageFile = (
    file: File
  ): Promise<{ dataUrl: string; markers: LeafBiomarkers; quality: ImageQualityReport }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        const img = new Image();
        img.onerror = () =>
          resolve({
            dataUrl: rawDataUrl,
            markers: { greenHealthyPct: 90, yellowChloroticPct: 6, brownNecroticPct: 4 },
            quality: {
              blurScore: 88,
              lightingScore: 76,
              resolutionValid: true,
              leafVisibilityPct: 84,
              overlappingLeaves: false,
              isAcceptable: true,
              rejectionReasons: [],
            },
          });
        img.onload = () => {
          const origWidth = img.width || 640;
          const origHeight = img.height || 480;
          const maxDim = 768;
          let width = origWidth;
          let height = origHeight;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const { markers, quality } = computeCanvasBiomarkersAndQuality(
              ctx,
              width,
              height,
              origWidth,
              origHeight
            );
            resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.85), markers, quality });
          } else {
            resolve({
              dataUrl: rawDataUrl,
              markers: { greenHealthyPct: 90, yellowChloroticPct: 6, brownNecroticPct: 4 },
              quality: {
                blurScore: 88,
                lightingScore: 76,
                resolutionValid: true,
                leafVisibilityPct: 84,
                overlappingLeaves: false,
                isAcceptable: true,
                rejectionReasons: [],
              },
            });
          }
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const processUploadedFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage(
        language === 'ur'
          ? 'براہ کرم پتے کی صحیح تصویر منتخب کریں۔'
          : language === 'ps'
          ? 'مهرباني وکړئ د پاڼې سم انځور وټاکئ.'
          : 'Please pick a valid photo.'
      );
      return;
    }

    setErrorMessage(null);
    try {
      const { dataUrl, markers, quality } = await compressImageFile(file);
      setSelectedImage(dataUrl);
      setBiomarkers(markers);
      setImageQuality(quality);
    } catch {
      setErrorMessage('Could not load photo.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processUploadedFile(file);
    }
  };

  const startCamera = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setErrorMessage(
        language === 'ur'
          ? 'کیمرہ دستیاب نہیں ہے۔ براہ کرم موبائل سے پتے کی تصویر اپلوڈ کریں۔'
          : language === 'ps'
          ? 'کیمره خلاصه نه شوه. مهرباني وکړئ له موبایل نه د پاڼې انځور اپلوډ کړئ.'
          : 'Camera unavailable. Please upload a leaf photo from your device.'
      );
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const { markers, quality } = computeCanvasBiomarkersAndQuality(
        ctx,
        canvas.width,
        canvas.height,
        canvas.width,
        canvas.height
      );
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      setBiomarkers(markers);
      setImageQuality(quality);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const visionPreview = computeAutoVisionPreview();

  const { cropAgeDays, estimatedGrowthStage } = calculateCropAgeAndGrowthStage(
    selectedCrop,
    plantingInputMode,
    daysSincePlanting,
    plantingDate
  );

  const runAnalysis = async () => {
    if (!selectedImage || !imageQuality.isAcceptable) return;

    setIsAnalyzing(true);
    setPipelineStep(1);
    setErrorMessage(null);

    const stepInterval = setInterval(() => {
      setPipelineStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 450);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const clientTimeout = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('/api/v1/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          sampleId: '',
          cropHint: selectedCrop,
          consensusTestMode: 'AUTO',
          plantingDate: plantingInputMode === 'date' ? plantingDate : undefined,
          daysSincePlanting: cropAgeDays,
          recentlySprayedPesticide,
          recentPesticideName: recentlySprayedPesticide ? recentPesticideName : '',
          growthStage: estimatedGrowthStage,
          symptoms: visionPreview.internalSymptomKeys,
          biomarkers,
          imageQuality,
          district: detectedDistrict || activeFarm.district,
          village: activeFarm.village,
          consentToShare,
        }),
        signal: controller.signal,
      });

      clearTimeout(clientTimeout);
      clearInterval(stepInterval);
      setPipelineStep(5);

      const data = await response.json();

      if (response.ok && data.success && data.result) {
        setTimeout(() => {
          setIsAnalyzing(false);
          stopCamera();
          onAnalysisComplete({
            ...data.result,
            imageUrl: selectedImage,
          });
          onClose();
        }, 250);
      } else {
        throw new Error(data.message || 'Unable to complete leaf diagnosis.');
      }
    } catch (err: any) {
      clearTimeout(clientTimeout);
      clearInterval(stepInterval);
      setIsAnalyzing(false);

      const isAbort =
        err?.name === 'AbortError' ||
        String(err?.message || '').toLowerCase().includes('aborted');

      if (isAbort) {
        setErrorMessage(
          language === 'ur'
            ? 'سرور سے جواب میں زیادہ وقت لگا۔ براہ کرم دوبارہ کوشش کریں۔'
            : language === 'ps'
            ? 'د سرور نه ځواب وځنډېد. مهرباني وکړئ بیا هڅه وکړئ.'
            : 'Diagnosis request timed out. Please try again.'
        );
      } else {
        setErrorMessage(
          err?.message ||
            (language === 'ur'
              ? 'معائنہ مکمل نہیں ہو سکا۔ دوبارہ کوشش کریں۔'
              : language === 'ps'
              ? 'کتنه بشپړه نه شوه. بیا هڅه وکړئ.'
              : 'Diagnosis request failed. Please try again.')
        );
      }
    }
  };

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAnalyzing(false);
    stopCamera();
    onClose();
  };

  const getLocalizedStageName = (stage: string) => {
    if (language === 'ur') {
      if (stage === 'Seedling') return 'ابتدائی پنیری (Seedling)';
      if (stage === 'Vegetative') return 'بڑھوتری کا مرحلہ (Vegetative)';
      if (stage === 'Flowering') return 'پھول آنے کا مرحلہ (Flowering)';
      if (stage === 'Fruiting') return 'پھل بننے کا مرحلہ (Fruiting)';
      return 'کٹائی کے قریب (Harvest)';
    }
    if (language === 'ps') {
      if (stage === 'Seedling') return 'کوچنی بوټی (Seedling)';
      if (stage === 'Vegetative') return 'د ودې مرحله (Vegetative)';
      if (stage === 'Flowering') return 'د ګل نیولو وخت (Flowering)';
      if (stage === 'Fruiting') return 'د مېوې نیولو وخت (Fruiting)';
      return 'د حاصل ټولولو وخت (Harvest)';
    }
    return stage;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#17231F]/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl max-h-[92dvh] sm:max-h-[90dvh] bg-white rounded-t-[24px] sm:rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden animate-card-fade"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Top Modal Bar */}
        <div className="shrink-0 px-6 py-4 bg-[#0A4D36] text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[14px] bg-[#F6B81A] text-[#17231F] flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[19px] font-bold text-white truncate">
                {t.scanModalTitle}
              </h2>
              <p className="text-[12px] text-white/80 truncate">
                {language === 'ur'
                  ? 'پتے کی تصویر لگائیں اور اپنی فصل منتخب کریں'
                  : language === 'ps'
                  ? 'د پاڼې انځور اپلوډ کړئ او خپل فصل وټاکئ'
                  : 'Upload a leaf photo and select your crop'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="shrink-0 min-h-[44px] px-4 py-2 rounded-[16px] bg-white/15 hover:bg-[#E53935] text-white font-semibold text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
            <span>
              {language === 'ur' ? 'بند کریں' : language === 'ps' ? 'بند کړئ' : 'Close'}
            </span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#F7F8F6]">
          {errorMessage && (
            <div className="p-4 bg-[#FEF2F2] rounded-[16px] flex items-start gap-3 text-[#E53935] text-[14px] font-normal">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#E53935] mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          {isAnalyzing ? (
            <div className="py-8 px-4 text-center space-y-6 bg-white rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              <Loader2 className="w-12 h-12 text-[#0F6B4B] animate-spin mx-auto" />
              <div>
                <h3 className="text-[20px] font-bold text-[#17231F]">{t.analyzingTitle}</h3>
                <p className="text-[13px] font-normal text-[#6B7280] mt-1">{t.estimatedTime}</p>
              </div>

              <div className="max-w-sm mx-auto space-y-3 text-start bg-[#F7F8F6] p-5 rounded-[20px]">
                {[
                  t.stepDetectingCrop,
                  t.stepIdentifyingDisease,
                  t.stepCheckingWeather,
                  t.stepRetrievingKnowledge,
                  t.stepGeneratingRecommendation,
                ].map((label, idx) => {
                  const stepNum = idx + 1;
                  const done = pipelineStep >= stepNum;
                  return (
                    <div key={idx} className="flex items-center gap-3 text-[15px]">
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-[#0F6B4B] shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-[#6B7280]/40 shrink-0" />
                      )}
                      <span className={done ? 'font-semibold text-[#17231F]' : 'font-normal text-[#6B7280]'}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Upload / Capture Leaf Image (Dummy Leaf Icon Placeholder when no image is uploaded) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-[#0F6B4B] uppercase tracking-wider">
                    {language === 'ur'
                      ? 'مرحلہ ۱: پتے کی تصویر اپلوڈ کریں'
                      : language === 'ps'
                      ? '۱ مرحله: د پاڼې انځور اپلوډ کړئ'
                      : 'Step 1: Upload Plant Leaf Image'}
                  </span>
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="text-[12px] font-semibold text-[#E53935] hover:underline cursor-pointer"
                    >
                      {language === 'ur' ? 'تصویر ہٹائیں' : language === 'ps' ? 'انځور لرې کړئ' : 'Remove Photo'}
                    </button>
                  )}
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleDrop}
                  className="relative rounded-[20px] bg-[#17231F] overflow-hidden flex flex-col items-center justify-center min-h-[220px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  {isCameraActive ? (
                    <div className="relative w-full h-60 bg-black flex items-center justify-center">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <button
                        onClick={capturePhoto}
                        className="absolute bottom-4 min-h-[52px] px-6 py-3 rounded-[16px] bg-[#F6B81A] hover:bg-[#e5a912] text-[#17231F] font-semibold text-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-5 h-5" />
                        <span>{t.takePhoto}</span>
                      </button>
                    </div>
                  ) : selectedImage ? (
                    <div className="relative w-full h-56 sm:h-64 bg-[#17231F] flex items-center justify-center">
                      <img
                        src={selectedImage}
                        alt="Uploaded Crop Leaf"
                        referrerPolicy="no-referrer"
                        onClick={() => fileInputRef.current?.click()}
                        className="max-h-full max-w-full object-contain cursor-pointer transition-all"
                      />
                      <div className="absolute bottom-3 inset-x-4 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="min-h-[46px] px-5 py-2 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[14px] flex items-center gap-2 shadow-md cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-[#F6B81A]" />
                          <span>{t.takePhoto}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="min-h-[46px] px-5 py-2 rounded-[16px] bg-[#F6B81A] hover:bg-[#e5a912] text-[#17231F] font-bold text-[14px] flex items-center gap-2 shadow-md cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-[#17231F]" />
                          <span>{t.uploadImage}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Clean Dummy Leaf Icon Placeholder when no photo is uploaded yet */
                    <div className="w-full py-8 px-6 flex flex-col items-center justify-center text-center space-y-4">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-full bg-[#0F6B4B]/30 border-2 border-dashed border-[#0F6B4B] flex items-center justify-center text-[#F6B81A] cursor-pointer hover:bg-[#0F6B4B]/45 transition-all"
                      >
                        <Sprout className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[16px] font-bold text-white">
                          {language === 'ur'
                            ? 'یہاں پتے کی صاف تصویر لگائیں'
                            : language === 'ps'
                            ? 'دلته د پاڼې صفا انځور ولګوئ'
                            : 'Upload or Capture a Leaf Photo Here'}
                        </p>
                        <p className="text-[12px] text-white/65">
                          {language === 'ur'
                            ? 'ابھی کوئی تصویر منتخب نہیں ہے — نیچے بٹن دبائیں'
                            : language === 'ps'
                            ? 'تراوسه هیڅ انځور نه دی غوره شوی — لاندې بټن کېکاږئ'
                            : 'No leaf image uploaded yet — tap a button below'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="min-h-[48px] px-5 py-2.5 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[14px] flex items-center gap-2 shadow-md cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-[#F6B81A]" />
                          <span>{t.takePhoto}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="min-h-[48px] px-5 py-2.5 rounded-[16px] bg-[#F6B81A] hover:bg-[#e5a912] text-[#17231F] font-bold text-[14px] flex items-center gap-2 shadow-md cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-[#17231F]" />
                          <span>{t.uploadImage}</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {selectedImage && !imageQuality.isAcceptable ? (
                <div className="p-5 rounded-[20px] bg-[#FEF2F2] border-2 border-[#E53935] space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-[#E53935] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="text-[16px] font-bold text-[#991B1B]">
                        {language === 'ur'
                          ? 'تصویر صاف نہیں ہے — براہِ کرم دوبارہ تصویر لیں'
                          : language === 'ps'
                          ? 'انځور صفا نه دی — مهرباني وکړئ بل صفا انځور واخلئ'
                          : 'Image Not Clear — Please Retake Photo'}
                      </h3>
                      <p className="text-[13px] text-[#7F1D1D]">
                        {imageQuality.rejectionReasons[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[46px] px-5 py-2.5 rounded-[14px] bg-[#E53935] hover:bg-[#B91C1C] text-white font-bold text-[14px] flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>
                        {language === 'ur'
                          ? 'صاف تصویر دوبارہ اپلوڈ کریں'
                          : language === 'ps'
                          ? 'صفا انځور بیا اپلوډ کړئ'
                          : 'Retake / Upload Clear Leaf Image'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* STEP 2: User Selects the Crop */}
                  <div className="p-5 rounded-[20px] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)] space-y-3.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px]">🌱</span>
                        <h3 className="text-[15px] font-bold text-[#17231F]">
                          {language === 'ur'
                            ? 'مرحلہ ۲: فصل منتخب کریں'
                            : language === 'ps'
                            ? '۲ مرحله: خپل فصل وټاکئ'
                            : 'Step 2: Select Your Crop'}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                      {(
                        [
                          { id: 'Tomato', icon: '🍅', ur: 'ٹماٹر', ps: 'ټماټر' },
                          { id: 'Potato', icon: '🥔', ur: 'آلو', ps: 'الوګان' },
                          { id: 'Wheat', icon: '🌾', ur: 'گندم', ps: 'غنم' },
                          { id: 'Maize', icon: '🌽', ur: 'مکئی', ps: 'جوار' },
                          { id: 'Chili', icon: '🌶️', ur: 'مرچ', ps: 'مرچک' },
                          { id: 'Cotton', icon: '🌿', ur: 'کپاس', ps: 'پنبه' },
                          { id: 'Onion', icon: '🧅', ur: 'پیاز', ps: 'پیاز' },
                        ] as const
                      ).map((cropItem) => {
                        const isSelected = selectedCrop === cropItem.id;
                        return (
                          <button
                            key={cropItem.id}
                            type="button"
                            onClick={() => setSelectedCrop(cropItem.id)}
                            className={`min-h-[54px] px-2.5 py-2 rounded-[14px] font-bold text-[13px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#0F6B4B] text-white shadow-[0_6px_16px_rgba(15,107,75,0.24)]'
                                : 'bg-[#F7F8F6] text-[#17231F] hover:bg-[#EBF5F0]'
                            }`}
                          >
                            <span className="text-[16px] leading-none">{cropItem.icon}</span>
                            <span className="truncate">
                              {language === 'ur'
                                ? cropItem.ur
                                : language === 'ps'
                                ? cropItem.ps
                                : cropItem.id}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 3: Ask "How many days ago was this crop planted?" */}
                  <div className="p-5 rounded-[20px] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)] space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#0F6B4B]" />
                      <h3 className="text-[15px] font-bold text-[#17231F]">
                        {language === 'ur'
                          ? 'مرحلہ ۳: یہ فصل کتنے دن پہلے لگائی گئی تھی؟'
                          : language === 'ps'
                          ? '۳ مرحله: دا فصل څو ورځې مخکې کرل شوی و؟'
                          : 'Step 3: How Many Days Ago Was This Crop Planted?'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-[#F7F8F6] rounded-[14px]">
                      <button
                        type="button"
                        onClick={() => setPlantingInputMode('days')}
                        className={`min-h-[42px] rounded-[10px] text-[13px] font-bold transition-all cursor-pointer ${
                          plantingInputMode === 'days'
                            ? 'bg-[#0F6B4B] text-white shadow-xs'
                            : 'text-[#6B7280] hover:text-[#17231F]'
                        }`}
                      >
                        {language === 'ur'
                          ? 'کاشت کے بعد کے دن (Days)'
                          : language === 'ps'
                          ? 'د کرلو ورځې (Days)'
                          : 'Days Since Planting'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlantingInputMode('date')}
                        className={`min-h-[42px] rounded-[10px] text-[13px] font-bold transition-all cursor-pointer ${
                          plantingInputMode === 'date'
                            ? 'bg-[#0F6B4B] text-white shadow-xs'
                            : 'text-[#6B7280] hover:text-[#17231F]'
                        }`}
                      >
                        {language === 'ur'
                          ? 'کاشت کی تاریخ (Date)'
                          : language === 'ps'
                          ? 'د کرلو نېټه (Date)'
                          : 'Planting Date'}
                      </button>
                    </div>

                    {plantingInputMode === 'days' ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min={1}
                            max={240}
                            value={daysSincePlanting}
                            onChange={(e) =>
                              setDaysSincePlanting(Math.max(1, Number(e.target.value) || 1))
                            }
                            className="w-28 min-h-[48px] px-4 rounded-[14px] bg-[#F7F8F6] text-[#17231F] font-bold text-[16px] outline-none focus:ring-2 focus:ring-[#0F6B4B]"
                          />
                          <div className="flex flex-wrap gap-2">
                            {[18, 35, 50, 75, 100].map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setDaysSincePlanting(d)}
                                className={`px-3 py-2 rounded-[12px] text-[13px] font-bold transition-colors cursor-pointer ${
                                  daysSincePlanting === d
                                    ? 'bg-[#0F6B4B] text-white'
                                    : 'bg-[#F7F8F6] text-[#17231F] hover:bg-[#EBF5F0]'
                                }`}
                              >
                                {d}d
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="date"
                          value={plantingDate}
                          onChange={(e) => setPlantingDate(e.target.value)}
                          className="w-full min-h-[48px] px-4 rounded-[14px] bg-[#F7F8F6] text-[#17231F] font-semibold text-[15px] outline-none focus:ring-2 focus:ring-[#0F6B4B]"
                        />
                      </div>
                    )}

                    <div className="p-3.5 rounded-[14px] bg-[#EBF5F0] flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-[#0A4D36]">
                        {language === 'ur'
                          ? `فصل کی عمر: ${cropAgeDays} دن`
                          : language === 'ps'
                          ? `د فصل عمر: ${cropAgeDays} ورځې`
                          : `Crop Age: ${cropAgeDays} days`}
                      </span>
                      <span className="px-3 py-1 rounded-[10px] bg-[#0F6B4B] text-white text-[12px] font-bold">
                        {getLocalizedStageName(estimatedGrowthStage)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-100 space-y-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-semibold text-[#6B7280]">
                          {language === 'ur'
                            ? 'کیا حال ہی میں کوئی اسپرے کیا گیا ہے؟'
                            : language === 'ps'
                            ? 'ایا په دې وروستیو کې مو کومه سپرے کړې ده؟'
                            : 'Were pesticides recently sprayed?'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setRecentlySprayedPesticide(false)}
                            className={`px-3.5 py-1.5 rounded-[10px] text-[13px] font-bold cursor-pointer ${
                              !recentlySprayedPesticide
                                ? 'bg-[#0F6B4B] text-white'
                                : 'bg-[#F7F8F6] text-[#6B7280]'
                            }`}
                          >
                            {language === 'ur' ? 'نہیں' : language === 'ps' ? 'نه' : 'No'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecentlySprayedPesticide(true)}
                            className={`px-3.5 py-1.5 rounded-[10px] text-[13px] font-bold cursor-pointer ${
                              recentlySprayedPesticide
                                ? 'bg-[#D97706] text-white'
                                : 'bg-[#F7F8F6] text-[#6B7280]'
                            }`}
                          >
                            {language === 'ur' ? 'ہاں' : language === 'ps' ? 'هو' : 'Yes'}
                          </button>
                        </div>
                      </div>

                      {recentlySprayedPesticide && (
                        <input
                          type="text"
                          value={recentPesticideName}
                          onChange={(e) => setRecentPesticideName(e.target.value)}
                          placeholder={
                            language === 'ur'
                              ? 'دوائی کا نام (اختیاری)'
                              : language === 'ps'
                              ? 'د دوایۍ نوم (اختیاري)'
                              : 'Medicine name if known (optional)'
                          }
                          className="w-full min-h-[42px] px-3.5 rounded-[12px] bg-[#F7F8F6] text-[13px] text-[#17231F] outline-none"
                        />
                      )}
                    </div>

                    {!gpsAvailable ? (
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                        <span className="text-[13px] font-semibold text-[#6B7280] flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#D97706]" />
                          <span>
                            {language === 'ur'
                              ? 'ضلع منتخب کریں:'
                              : language === 'ps'
                              ? 'خپله ضلع وټاکئ:'
                              : 'Select District:'}
                          </span>
                        </span>
                        <select
                          value={detectedDistrict}
                          onChange={(e) => setDetectedDistrict(e.target.value)}
                          className="min-h-[40px] px-3 rounded-[10px] bg-[#F7F8F6] text-[13px] font-bold text-[#17231F] outline-none"
                        >
                          {['Mardan', 'Swabi', 'Charsadda', 'Peshawar', 'Nowshera', 'Malakand'].map(
                            (d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    ) : (
                      <div className="pt-1 flex items-center gap-2 text-[12px] text-[#0F6B4B] font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          {language === 'ur'
                            ? `ضلع: ${detectedDistrict}`
                            : language === 'ps'
                            ? `ضلع: ${detectedDistrict}`
                            : `District: ${detectedDistrict}`}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Pinned Bottom Action Footer */}
        {!isAnalyzing && (
          <div className="shrink-0 p-6 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={runAnalysis}
              disabled={!selectedImage || !imageQuality.isAcceptable}
              className={`w-full min-h-[56px] py-3.5 rounded-[16px] text-[18px] font-bold flex items-center justify-center gap-3 transition-all ${
                selectedImage && imageQuality.isAcceptable
                  ? 'bg-[#0F6B4B] hover:bg-[#0A4D36] text-white shadow-[0_8px_24px_rgba(15,107,75,0.25)] cursor-pointer'
                  : 'bg-[#F7F8F6] text-[#6B7280] cursor-not-allowed'
              }`}
            >
              <Camera className="w-6 h-6" />
              <span>
                {selectedImage
                  ? t.startAnalysisBtn
                  : language === 'ur'
                  ? 'پہلے پتے کی تصویر اپلوڈ کریں'
                  : language === 'ps'
                  ? 'لومړی د پاڼې انځور اپلوډ کړئ'
                  : 'Please upload a leaf image first'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
