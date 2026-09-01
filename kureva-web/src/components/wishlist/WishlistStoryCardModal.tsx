"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  X, 
  Download, 
  Sparkles, 
  Check, 
  Share2, 
  Copy, 
  Palette, 
  Smartphone,
  Square,
  QrCode,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  ShoppingBag
} from "lucide-react";

interface StoryCardModalProps {
  wishlist: any;
  shareUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

type LayoutStyle = "showcase" | "hero" | "duo" | "minimal";
type AspectType = "story" | "square";
type BgStyle = "preset" | "solid";

const COLOR_PRESETS = [
  { id: "emerald", label: "Emerald Silk", bg: "#064e3b", text: "#ffffff", sub: "#a7f3d0", accent: "#34d399", card: "rgba(255, 255, 255, 0.12)", border: "rgba(255, 255, 255, 0.22)" },
  { id: "midnight", label: "Midnight Noir", bg: "#09090b", text: "#ffffff", sub: "#a1a1aa", accent: "#10b981", card: "rgba(255, 255, 255, 0.1)", border: "rgba(255, 255, 255, 0.2)" },
  { id: "champagne", label: "Champagne Gold", bg: "#fef3c7", text: "#1c1917", sub: "#78716c", accent: "#d97706", card: "#ffffff", border: "rgba(217, 119, 6, 0.2)" },
  { id: "sunset", label: "Sunset Rose", bg: "#831843", text: "#ffffff", sub: "#fbcfe8", accent: "#f43f5e", card: "rgba(255, 255, 255, 0.15)", border: "rgba(255, 255, 255, 0.25)" },
  { id: "cobalt", label: "Electric Cobalt", bg: "#1e3a8a", text: "#ffffff", sub: "#bfdbfe", accent: "#60a5fa", card: "rgba(255, 255, 255, 0.12)", border: "rgba(255, 255, 255, 0.2)" },
  { id: "terracotta", label: "Terracotta Earth", bg: "#7c2d12", text: "#ffffff", sub: "#fed7aa", accent: "#fb923c", card: "rgba(255, 255, 255, 0.12)", border: "rgba(255, 255, 255, 0.2)" },
  { id: "minimal", label: "Cloud Minimal", bg: "#f4f4f5", text: "#18181b", sub: "#71717a", accent: "#047857", card: "#ffffff", border: "rgba(0, 0, 0, 0.08)" }
];

const TAGLINE_PRESETS = [
  "✦ Wishlist Registry",
  "🎂 Birthday Wishlist",
  "💍 Wedding Registry",
  "🎁 Gift Wishlist",
  "✨ Things I Love",
  "🎄 Holiday Wishlist"
];

export default function WishlistStoryCardModal({
  wishlist,
  shareUrl,
  isOpen,
  onClose
}: StoryCardModalProps) {
  const items: any[] = wishlist?.items || [];
  
  // Customization States
  const [aspectRatio, setAspectRatio] = useState<AspectType>("story");
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>("showcase");
  const [selectedPresetId, setSelectedPresetId] = useState("emerald");
  const [bgType, setBgType] = useState<BgStyle>("preset");
  const [customSolidColor, setCustomSolidColor] = useState("#064e3b");
  const [tagline, setTagline] = useState("✦ Wishlist Registry");
  const [showQr, setShowQr] = useState(true);
  
  // Selected items to feature (IDs) - defaults to first 2 or 3
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (items.length > 0 && selectedItemIds.length === 0) {
      setSelectedItemIds(items.slice(0, 3).map((it) => it.id));
    }
  }, [items, selectedItemIds.length]);

  const toggleItemSelection = (id: number) => {
    if (selectedItemIds.includes(id)) {
      if (selectedItemIds.length === 1) return; // Keep at least 1
      setSelectedItemIds(selectedItemIds.filter((itemId) => itemId !== id));
    } else {
      if (selectedItemIds.length >= 4) {
        setSelectedItemIds([...selectedItemIds.slice(1), id]);
      } else {
        setSelectedItemIds([...selectedItemIds, id]);
      }
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency?.toUpperCase()) {
      case "NGN": return "₦";
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "JPY": return "¥";
      default: return currency ? `${currency} ` : "$";
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(shareUrl)}&margin=10`;

  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !wishlist) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isStory = aspectRatio === "story";
    const width = 1080;
    const height = isStory ? 1920 : 1080;

    canvas.width = width;
    canvas.height = height;

    // Determine Active Theme Colors
    const activePreset = COLOR_PRESETS.find((p) => p.id === selectedPresetId) || COLOR_PRESETS[0];
    const isCustom = bgType === "solid";

    const bgColor = isCustom ? customSolidColor : activePreset.bg;
    
    // Check if background is dark or light for text contrast
    const isDarkBg = isCustom ? isColorDark(customSolidColor) : selectedPresetId !== "champagne" && selectedPresetId !== "minimal";

    const textColor = isDarkBg ? "#FFFFFF" : "#18181B";
    const subTextColor = isDarkBg ? "rgba(255, 255, 255, 0.75)" : "#52525B";
    const cardBg = isDarkBg ? "rgba(255, 255, 255, 0.12)" : "#FFFFFF";
    const cardBorder = isDarkBg ? "rgba(255, 255, 255, 0.22)" : "rgba(0, 0, 0, 0.08)";
    const accentColor = isDarkBg ? (activePreset.accent || "#34d399") : "#047857";

    // 1. Draw Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Decorative ambient circles
    ctx.strokeStyle = isDarkBg ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width * 0.9, height * 0.1, 400, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.9, 500, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Header Tagline / Badge
    const headerY = isStory ? 130 : 90;
    ctx.font = "bold 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = accentColor;
    ctx.textAlign = "center";
    ctx.fillText(tagline.toUpperCase(), width / 2, headerY);

    // 3. Curator Subtitle
    const curatorY = headerY + 55;
    ctx.font = "500 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = subTextColor;
    ctx.fillText(`Curated with care by @${wishlist.username || "creator"}`, width / 2, curatorY);

    // 4. Wishlist Title (Serif Editorial)
    const titleY = curatorY + 95;
    ctx.font = "bold 64px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = textColor;
    
    // Wrap title
    const maxTitleWidth = width - 180;
    const words = (wishlist.name || "My Wishlist").split(" ");
    let line = "";
    const lines = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTitleWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    let currentTitleY = titleY;
    lines.slice(0, 2).forEach((l) => {
      ctx.fillText(l.trim(), width / 2, currentTitleY);
      currentTitleY += 75;
    });

    // 5. Featured Items Calculation
    const featuredItems = items.filter((it) => selectedItemIds.includes(it.id));
    const activeItems = featuredItems.length > 0 ? featuredItems : items.slice(0, 3);

    // Preload item images & QR
    const loadedImages: { [key: number]: HTMLImageElement | null } = {};
    for (const item of activeItems) {
      if (item.image_url) {
        loadedImages[item.id] = await loadImage(item.image_url);
      }
    }

    let qrImage: HTMLImageElement | null = null;
    if (showQr) {
      qrImage = await loadImage(qrUrl);
    }

    // 6. Draw Products based on Layout Style
    if (layoutStyle === "hero" && activeItems.length > 0) {
      // Single Hero Showcase
      const heroItem = activeItems[0];
      const cardWidth = width - 160;
      const cardHeight = isStory ? 780 : 460;
      const cardX = 80;
      const cardY = currentTitleY + 30;

      // Draw Hero Card
      ctx.fillStyle = cardBg;
      ctx.strokeStyle = cardBorder;
      ctx.lineWidth = 2;
      roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 36, true, true);

      // Hero Image Frame
      const imgSize = isStory ? 440 : 260;
      const imgX = (width - imgSize) / 2;
      const imgY = cardY + 40;

      const heroImg = loadedImages[heroItem.id];
      if (heroImg) {
        ctx.save();
        roundRect(ctx, imgX, imgY, imgSize, imgSize, 24, false, false);
        ctx.clip();
        ctx.drawImage(heroImg, imgX, imgY, imgSize, imgSize);
        ctx.restore();
      } else {
        ctx.fillStyle = isDarkBg ? "rgba(255, 255, 255, 0.08)" : "#f4f4f5";
        roundRect(ctx, imgX, imgY, imgSize, imgSize, 24, true, false);
        ctx.font = "32px sans-serif";
        ctx.fillStyle = subTextColor;
        ctx.textAlign = "center";
        ctx.fillText("🎁", width / 2, imgY + (imgSize / 2) + 10);
      }

      // Hero Item Name
      const textStartY = imgY + imgSize + 55;
      ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      const name = heroItem.name.length > 40 ? heroItem.name.substring(0, 38) + "..." : heroItem.name;
      ctx.fillText(name, width / 2, textStartY);

      // Hero Item Price
      const priceText = heroItem.price 
        ? `${getCurrencySymbol(heroItem.currency)}${parseFloat(heroItem.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "Price on site";
      ctx.font = "bold 48px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = accentColor;
      ctx.fillText(priceText, width / 2, textStartY + 65);

      if (heroItem.store) {
        ctx.font = "500 28px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = subTextColor;
        ctx.fillText(`Available at ${heroItem.store}`, width / 2, textStartY + 115);
      }

    } else if (layoutStyle === "duo" && activeItems.length >= 2) {
      // Duo Split Cards
      const duoItems = activeItems.slice(0, 2);
      const cardHeight = isStory ? 380 : 300;
      const cardWidth = width - 160;
      const cardX = 80;

      duoItems.forEach((item, idx) => {
        const cardY = currentTitleY + 30 + (idx * (cardHeight + 25));

        ctx.fillStyle = cardBg;
        ctx.strokeStyle = cardBorder;
        ctx.lineWidth = 2;
        roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 32, true, true);

        // Product image on the left
        const photoSize = cardHeight - 60;
        const photoX = cardX + 30;
        const photoY = cardY + 30;

        const pImg = loadedImages[item.id];
        if (pImg) {
          ctx.save();
          roundRect(ctx, photoX, photoY, photoSize, photoSize, 20, false, false);
          ctx.clip();
          ctx.drawImage(pImg, photoX, photoY, photoSize, photoSize);
          ctx.restore();
        } else {
          ctx.fillStyle = isDarkBg ? "rgba(255, 255, 255, 0.08)" : "#f4f4f5";
          roundRect(ctx, photoX, photoY, photoSize, photoSize, 20, true, false);
          ctx.font = "36px sans-serif";
          ctx.fillStyle = subTextColor;
          ctx.textAlign = "center";
          ctx.fillText("🎁", photoX + (photoSize / 2), photoY + (photoSize / 2) + 12);
        }

        // Product text on right
        const textX = photoX + photoSize + 35;
        ctx.textAlign = "left";

        // Priority / Store pill
        ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = accentColor;
        ctx.fillText(item.store ? item.store.toUpperCase() : "GIFT REGISTRY", textX, photoY + 45);

        // Title
        ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = textColor;
        const maxLen = isStory ? 28 : 22;
        const iName = item.name.length > maxLen ? item.name.substring(0, maxLen - 2) + "..." : item.name;
        ctx.fillText(iName, textX, photoY + 105);

        // Price
        const priceText = item.price 
          ? `${getCurrencySymbol(item.currency)}${parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "Price on site";
        ctx.font = "bold 40px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = accentColor;
        ctx.fillText(priceText, textX, photoY + 175);
      });

    } else {
      // Standard Stacked Showcase (up to 3 items)
      const displayItems = activeItems.slice(0, isStory ? 3 : 2);
      const cardHeight = isStory ? 195 : 155;
      const cardWidth = width - 160;
      const cardX = 80;
      const startY = currentTitleY + 25;

      displayItems.forEach((item, idx) => {
        const cardY = startY + (idx * (cardHeight + 20));

        ctx.fillStyle = cardBg;
        ctx.strokeStyle = cardBorder;
        ctx.lineWidth = 2;
        roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 28, true, true);

        // Product image thumbnail
        const thumbSize = cardHeight - 40;
        const thumbX = cardX + 20;
        const thumbY = cardY + 20;

        const pImg = loadedImages[item.id];
        if (pImg) {
          ctx.save();
          roundRect(ctx, thumbX, thumbY, thumbSize, thumbSize, 18, false, false);
          ctx.clip();
          ctx.drawImage(pImg, thumbX, thumbY, thumbSize, thumbSize);
          ctx.restore();
        } else {
          ctx.fillStyle = isDarkBg ? "rgba(255, 255, 255, 0.08)" : "#f4f4f5";
          roundRect(ctx, thumbX, thumbY, thumbSize, thumbSize, 18, true, false);
          ctx.font = "28px sans-serif";
          ctx.fillStyle = subTextColor;
          ctx.textAlign = "center";
          ctx.fillText("🎁", thumbX + (thumbSize / 2), thumbY + (thumbSize / 2) + 10);
        }

        // Product Details
        const textX = thumbX + thumbSize + 30;
        ctx.textAlign = "left";

        ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = textColor;
        const iName = item.name.length > 30 ? item.name.substring(0, 28) + "..." : item.name;
        ctx.fillText(iName, textX, cardY + 65);

        const priceText = item.price 
          ? `${getCurrencySymbol(item.currency)}${parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "Price on site";
        ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = accentColor;
        ctx.fillText(priceText, textX, cardY + 130);

        if (item.store) {
          ctx.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.fillStyle = subTextColor;
          ctx.fillText(`• ${item.store}`, textX + ctx.measureText(priceText).width + 18, cardY + 130);
        }
      });
    }

    // 7. QR Code & Call To Action Banner
    if (showQr && qrImage) {
      const qrBoxSize = isStory ? 240 : 190;
      const qrBoxY = isStory ? height - 390 : height - 260;
      const qrBoxX = (width - qrBoxSize) / 2;

      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx.shadowBlur = 20;
      roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28, true, false);
      ctx.shadowBlur = 0;

      const pad = 18;
      ctx.drawImage(qrImage, qrBoxX + pad, qrBoxY + pad, qrBoxSize - (pad * 2), qrBoxSize - (pad * 2));

      ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText("Scan with Camera to Claim a Gift", width / 2, qrBoxY + qrBoxSize + 45);

      ctx.font = "500 22px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = subTextColor;
      ctx.fillText("kureva.com • tap link in bio", width / 2, qrBoxY + qrBoxSize + 80);
    } else {
      // Bottom branding only
      ctx.font = "bold 32px 'Playfair Display', Georgia, serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText("kureva", width / 2, height - 90);

      ctx.font = "500 22px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = subTextColor;
      ctx.fillText("Tap the secret link in bio to claim a wish", width / 2, height - 50);
    }

    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [
    wishlist, 
    items, 
    shareUrl, 
    aspectRatio, 
    layoutStyle, 
    selectedPresetId, 
    bgType, 
    customSolidColor, 
    tagline, 
    showQr, 
    selectedItemIds, 
    qrUrl
  ]);

  useEffect(() => {
    if (isOpen) {
      drawCanvas();
    }
  }, [isOpen, drawCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    const link = document.createElement("a");
    link.download = `${wishlist?.name || "wishlist"}-${aspectRatio}-graphic.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    setTimeout(() => {
      setDownloading(false);
    }, 800);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Story & Social Graphic Studio
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-editorial tracking-tight mb-1">
          Customize & Export Story Image
        </h2>
        <p className="text-xs text-stone-500 mb-6 font-light">
          Choose card structures, select specific product photos, customize solid colors, and download a high-res PNG.
        </p>

        {/* Hidden Canvas used for high-res generation */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Live Preview Column */}
          <div className="md:col-span-5 flex flex-col items-center sticky top-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-stone-100 bg-stone-100 max-h-[500px] w-full flex items-center justify-center">
              {previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="Wishlist Story Preview"
                  className="w-full h-auto object-contain max-h-[480px] rounded-lg"
                />
              ) : (
                <div className="py-28 text-center text-xs text-stone-400 animate-pulse flex flex-col items-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                  <span>Rendering graphic...</span>
                </div>
              )}
            </div>

            <div className="mt-4 w-full space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading || !previewUrl}
                className="w-full py-3.5 bg-[#1b7a43] hover:bg-[#145d33] text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? "Exporting Image..." : "Download High-Res Graphic (.PNG)"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 border border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors bg-white shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied!" : "Copy Wishlist Link"}</span>
              </button>
            </div>
          </div>

          {/* Studio Controls Column */}
          <div className="md:col-span-7 space-y-6">
            
            {/* 1. Format & Structure */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                <span>1. Card Aspect Ratio & Layout Structure</span>
              </label>

              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => setAspectRatio("story")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    aspectRatio === "story"
                      ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Story (9:16)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio("square")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    aspectRatio === "square"
                      ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Square (1:1)</span>
                </button>
              </div>

              {/* Layout Styles */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLayoutStyle("showcase")}
                  className={`p-2 rounded-xl border text-[11px] font-medium text-center transition-all ${
                    layoutStyle === "showcase" 
                      ? "border-emerald-600 bg-emerald-50/60 font-bold text-emerald-900 ring-1 ring-emerald-600" 
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  Showcase Stack
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutStyle("hero")}
                  className={`p-2 rounded-xl border text-[11px] font-medium text-center transition-all ${
                    layoutStyle === "hero" 
                      ? "border-emerald-600 bg-emerald-50/60 font-bold text-emerald-900 ring-1 ring-emerald-600" 
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  Hero Spotlight (1 Item)
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutStyle("duo")}
                  className={`p-2 rounded-xl border text-[11px] font-medium text-center transition-all ${
                    layoutStyle === "duo" 
                      ? "border-emerald-600 bg-emerald-50/60 font-bold text-emerald-900 ring-1 ring-emerald-600" 
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  Duo Split (2 Items)
                </button>
              </div>
            </div>

            {/* 2. Product Picker (Select Which Items to Feature) */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>2. Select Products to Feature ({selectedItemIds.length} chosen)</span>
                </span>
                <span className="text-[10px] text-stone-400 font-normal">Tap item to toggle</span>
              </label>

              {items.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No items available in this wishlist.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 border border-stone-200 rounded-2xl bg-stone-50/50">
                  {items.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemSelection(item.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center space-x-2.5 transition-all ${
                          isSelected
                            ? "bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-600/30"
                            : "bg-white/60 border-stone-200/80 hover:bg-white text-stone-500"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center border border-stone-200">
                          {item.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-3.5 h-3.5 text-stone-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-stone-900 truncate leading-snug">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-emerald-700 font-bold">
                            {item.price ? `${getCurrencySymbol(item.currency)}${parseFloat(item.price).toLocaleString()}` : "Free / Info"}
                          </p>
                        </div>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-emerald-600 text-white" : "border border-stone-300"
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Aesthetic Color Palette & Custom Solid Color */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. Color Theme & Solid Color Picker</span>
              </label>

              {/* Color Preset Swatches */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {COLOR_PRESETS.map((p) => {
                  const isActive = bgType === "preset" && selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setBgType("preset");
                        setSelectedPresetId(p.id);
                      }}
                      className={`p-2 rounded-xl border text-[11px] font-medium flex items-center space-x-2 transition-all ${
                        isActive 
                          ? "border-emerald-600 ring-2 ring-emerald-600/30 bg-emerald-50/50" 
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full shrink-0 shadow-xs border border-black/10" style={{ backgroundColor: p.bg }}></span>
                      <span className="text-stone-800 font-semibold truncate text-[10px]">{p.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Solid Color Picker */}
              <div className="flex items-center space-x-3 bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                <input
                  type="color"
                  value={customSolidColor}
                  onChange={(e) => {
                    setBgType("solid");
                    setCustomSolidColor(e.target.value);
                  }}
                  className="w-9 h-9 rounded-xl border-0 cursor-pointer bg-transparent p-0"
                />
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-stone-700">Custom Solid Background Color</p>
                  <p className="text-[10px] text-stone-400 font-mono">{customSolidColor.toUpperCase()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBgType("solid")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    bgType === "solid" 
                      ? "bg-stone-900 text-white border-stone-900" 
                      : "bg-white text-stone-600 border-stone-300"
                  }`}
                >
                  Use Custom
                </button>
              </div>
            </div>

            {/* 4. Occasion Tagline Presets */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>4. Occasion Tagline / Headline</span>
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {TAGLINE_PRESETS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTagline(t)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      tagline === t 
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-xs" 
                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Or type custom headline..."
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            {/* 5. Toggles */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-200">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQr}
                  onChange={(e) => setShowQr(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-stone-700">Embed Scannable QR Code</span>
              </label>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function isColorDark(hexColor: string) {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return true;
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 135;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean,
  stroke: boolean
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
