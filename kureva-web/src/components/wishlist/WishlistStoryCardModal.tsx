"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Download,
  Sparkles,
  Check,
  Copy,
  Palette,
  Smartphone,
  Square,
  ShoppingBag,
  RefreshCw
} from "lucide-react";

interface StoryCardModalProps {
  wishlist: any;
  shareUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

type LayoutStyle = "showcase" | "hero" | "duo";
type AspectType = "story" | "square";
type BgType = "gradient_preset" | "solid_custom" | "gradient_custom";

// Each preset now only carries what the redesigned canvas actually uses:
// a two-stop gradient, a text color, and an accent for price/numerals.
const GRADIENT_PRESETS = [
  { id: "emerald_grad", label: "Emerald Silk", start: "#022c22", end: "#065f46", text: "#ffffff", accent: "#6ee7b7" },
  { id: "midnight_grad", label: "Midnight Velvet", start: "#0a0a0a", end: "#292524", text: "#ffffff", accent: "#a3e635" },
  { id: "sunset_grad", label: "Sunset Blush", start: "#4c0519", end: "#9f1239", text: "#ffffff", accent: "#fda4af" },
  { id: "cobalt_grad", label: "Royal Cobalt", start: "#0c1e4e", end: "#1d4ed8", text: "#ffffff", accent: "#93c5fd" },
  { id: "plum_grad", label: "Dusk Plum", start: "#2e1065", end: "#6d28d9", text: "#ffffff", accent: "#d8b4fe" },
  { id: "bone_grad", label: "Bone Paper", start: "#f7f3ea", end: "#ece4d3", text: "#231f1a", accent: "#9a3412" },
  { id: "terracotta_grad", label: "Terracotta", start: "#431407", end: "#9a3412", text: "#ffffff", accent: "#fdba74" },
  { id: "ink_grad", label: "Ink Blue", start: "#020617", end: "#1e293b", text: "#ffffff", accent: "#7dd3fc" }
];

const SOLID_PRESETS = [
  { label: "Pure Onyx", color: "#000000" },
  { label: "Matcha Forest", color: "#064e3b" },
  { label: "Navy Deep", color: "#0f172a" },
  { label: "Ruby Wine", color: "#881337" },
  { label: "Burnt Ochre", color: "#7c2d12" },
  { label: "Warm Sand", color: "#faf5ef" },
  { label: "Cloud Silver", color: "#f4f4f5" }
];

const TAGLINE_PRESETS = [
  "Wishlist registry",
  "Birthday wishlist",
  "Wedding registry",
  "Gift wishlist",
  "Things I love",
  "Holiday wishlist"
];

export default function WishlistStoryCardModal({
  wishlist,
  shareUrl,
  isOpen,
  onClose
}: StoryCardModalProps) {
  const items: any[] = wishlist?.items || [];

  const [aspectRatio, setAspectRatio] = useState<AspectType>("story");
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>("showcase");
  const [bgMode, setBgMode] = useState<BgType>("gradient_preset");

  const [selectedGradientId, setSelectedGradientId] = useState("emerald_grad");
  const [customSolidColor, setCustomSolidColor] = useState("#064e3b");
  const [customGradStart, setCustomGradStart] = useState("#064e3b");
  const [customGradEnd, setCustomGradEnd] = useState("#047857");

  const [tagline, setTagline] = useState("Wishlist registry");
  const [showQr, setShowQr] = useState(true);

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
      if (selectedItemIds.length === 1) return;
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

  const formatPrice = (item: any) =>
    item.price
      ? `${getCurrencySymbol(item.currency)}${parseFloat(item.price).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      : "Price on site";

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

    const SERIF = "'Playfair Display', Georgia, serif";
    const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

    // ---- 1. Background + theme -------------------------------------
    let isDarkBg = true;
    let textColor = "#FFFFFF";
    let subTextColor = "rgba(255,255,255,0.72)";
    let lineColor = "rgba(255,255,255,0.3)";
    let accentColor = "#6ee7b7";
    let placeholderBg = "rgba(255,255,255,0.06)";

    if (bgMode === "gradient_preset") {
      const g = GRADIENT_PRESETS.find((p) => p.id === selectedGradientId) || GRADIENT_PRESETS[0];
      const grad = ctx.createLinearGradient(0, 0, width * 0.65, height);
      grad.addColorStop(0, g.start);
      grad.addColorStop(1, g.end);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      isDarkBg = g.text === "#ffffff";
      textColor = g.text;
      accentColor = g.accent;
      subTextColor = isDarkBg ? "rgba(255,255,255,0.72)" : "rgba(35,31,26,0.6)";
      lineColor = isDarkBg ? "rgba(255,255,255,0.32)" : "rgba(35,31,26,0.22)";
      placeholderBg = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(35,31,26,0.05)";
    } else if (bgMode === "gradient_custom") {
      const grad = ctx.createLinearGradient(0, 0, width * 0.65, height);
      grad.addColorStop(0, customGradStart);
      grad.addColorStop(1, customGradEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      isDarkBg = isColorDark(customGradStart) || isColorDark(customGradEnd);
      textColor = isDarkBg ? "#FFFFFF" : "#18181B";
      accentColor = isDarkBg ? "#6ee7b7" : "#047857";
      subTextColor = isDarkBg ? "rgba(255,255,255,0.72)" : "rgba(24,24,27,0.6)";
      lineColor = isDarkBg ? "rgba(255,255,255,0.32)" : "rgba(24,24,27,0.2)";
      placeholderBg = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(24,24,27,0.05)";
    } else {
      ctx.fillStyle = customSolidColor;
      ctx.fillRect(0, 0, width, height);

      isDarkBg = isColorDark(customSolidColor);
      textColor = isDarkBg ? "#FFFFFF" : "#18181B";
      accentColor = isDarkBg ? "#6ee7b7" : "#047857";
      subTextColor = isDarkBg ? "rgba(255,255,255,0.72)" : "rgba(24,24,27,0.6)";
      lineColor = isDarkBg ? "rgba(255,255,255,0.32)" : "rgba(24,24,27,0.2)";
      placeholderBg = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(24,24,27,0.05)";
    }

    // ---- 2. Signature device: a ticket frame, not a card stack -----
    drawTicketFrame(ctx, width, height, lineColor);

    const contentX = 96;
    const contentWidth = width - contentX * 2;
    const s = isStory ? 1 : 0.72; // scale factor for the square layout

    // ---- 3. Eyebrow tagline (sentence case, no tracked caps) -------
    const headerY = isStory ? 148 : 100;
    ctx.font = `italic 500 ${30 * s}px ${SERIF}`;
    ctx.fillStyle = subTextColor;
    ctx.textAlign = "center";
    ctx.fillText(tagline, width / 2, headerY);

    // ---- 4. Curator line --------------------------------------------
    const curatorY = headerY + 42 * s;
    ctx.font = `500 ${25 * s}px ${SANS}`;
    ctx.fillStyle = subTextColor;
    ctx.fillText(`Curated by @${wishlist.username || "creator"}`, width / 2, curatorY);

    // ---- 5. Title ------------------------------------------------
    const titleSize = isStory ? 58 : 42;
    const titleY = curatorY + 84 * s;
    ctx.font = `700 ${titleSize}px ${SERIF}`;
    ctx.fillStyle = textColor;
    const titleLines = wrapText(ctx, wishlist.name || "My Wishlist", contentWidth, 2);
    const titleLineHeight = titleSize * 1.15;
    let currentTitleY = titleY;
    titleLines.forEach((l) => {
      ctx.fillText(l, width / 2, currentTitleY);
      currentTitleY += titleLineHeight;
    });

    // ---- 6. Hairline divider under the header ----------------------
    const dividerY = currentTitleY + 22 * s;
    drawHairline(ctx, contentX, dividerY, contentWidth, lineColor);
    let cursorY = dividerY + 50 * s;

    // ---- 7. Preload images ------------------------------------------
    const featuredItems = items.filter((it) => selectedItemIds.includes(it.id));
    const activeItems = featuredItems.length > 0 ? featuredItems : items.slice(0, 3);

    const loadedImages: { [key: number]: HTMLImageElement | null } = {};
    for (const item of activeItems) {
      if (item.image_url) {
        loadedImages[item.id] = await loadImage(item.image_url);
      }
    }
    const qrImage = showQr ? await loadImage(qrUrl) : null;

    // ---- 8. Reserve the ticket stub area -----------------------------
    const stubHeight = isStory ? 250 : 190;
    const stubTop = height - stubHeight - (isStory ? 36 : 24);

    // ---- 9. Items --------------------------------------------------
    if (layoutStyle === "hero" && activeItems.length > 0) {
      const item = activeItems[0];
      const photoSize = isStory ? Math.min(520, contentWidth) : 300;
      const photoX = (width - photoSize) / 2;
      const photoY = cursorY;

      drawNumeral(ctx, 0, contentX, photoY - 14 * s, subTextColor, 26 * s);
      drawFramedImage(ctx, loadedImages[item.id], photoX, photoY, photoSize, lineColor, placeholderBg, subTextColor);

      let ty = photoY + photoSize + 58 * s;
      ctx.textAlign = "center";
      ctx.font = `700 ${40 * s}px ${SANS}`;
      ctx.fillStyle = textColor;
      const nameLines = wrapText(ctx, item.name, contentWidth - 80, 2);
      nameLines.forEach((l) => {
        ctx.fillText(l, width / 2, ty);
        ty += 48 * s;
      });

      ty += 14 * s;
      drawHairline(ctx, width / 2 - 50, ty, 100, lineColor);
      ty += 44 * s;

      ctx.font = `600 ${36 * s}px ${SANS}`;
      ctx.fillStyle = accentColor;
      ctx.fillText(formatPrice(item), width / 2, ty);

      if (item.store) {
        ty += 40 * s;
        ctx.font = `500 ${23 * s}px ${SANS}`;
        ctx.fillStyle = subTextColor;
        ctx.fillText(`Available at ${item.store}`, width / 2, ty);
      }
    } else if (layoutStyle === "duo" && activeItems.length >= 2) {
      const duoItems = activeItems.slice(0, 2);
      const gap = 48;
      const photoSize = isStory ? (contentWidth - gap) / 2 : (contentWidth - gap) / 2 * 0.78;

      duoItems.forEach((item, idx) => {
        const blockX = contentX + idx * (photoSize + gap);
        const blockY = cursorY;

        drawNumeral(ctx, idx, blockX, blockY - 12 * s, subTextColor, 22 * s);
        drawFramedImage(ctx, loadedImages[item.id], blockX, blockY, photoSize, lineColor, placeholderBg, subTextColor);

        let ty = blockY + photoSize + 42 * s;
        ctx.textAlign = "left";
        ctx.font = `700 ${29 * s}px ${SANS}`;
        ctx.fillStyle = textColor;
        const dLines = wrapText(ctx, item.name, photoSize, 2);
        dLines.forEach((l) => {
          ctx.fillText(l, blockX, ty);
          ty += 34 * s;
        });

        ty += 6 * s;
        ctx.font = `600 ${27 * s}px ${SANS}`;
        ctx.fillStyle = accentColor;
        ctx.fillText(formatPrice(item), blockX, ty);
      });
    } else {
      // Showcase list — a hairline-separated list, not stacked boxes
      const displayItems = activeItems.slice(0, isStory ? 3 : 2);
      const thumbSize = isStory ? 158 : 138;
      const rowGap = isStory ? 52 : 32;

      displayItems.forEach((item, idx) => {
        const rowY = cursorY + idx * (thumbSize + rowGap);
        if (idx > 0) {
          drawHairline(ctx, contentX, rowY - rowGap / 2, contentWidth, lineColor);
        }

        drawFramedImage(ctx, loadedImages[item.id], contentX, rowY, thumbSize, lineColor, placeholderBg, subTextColor);

        const textX = contentX + thumbSize + 34;
        const maxTextWidth = contentWidth - thumbSize - 34;

        drawNumeral(ctx, idx, textX, rowY + 20 * s, subTextColor, 20 * s);

        ctx.textAlign = "left";
        ctx.font = `700 ${30 * s}px ${SANS}`;
        ctx.fillStyle = textColor;
        const rowLines = wrapText(ctx, item.name, maxTextWidth, 2);
        let ny = rowY + 58 * s;
        rowLines.forEach((l) => {
          ctx.fillText(l, textX, ny);
          ny += 36 * s;
        });

        ctx.font = `600 ${27 * s}px ${SANS}`;
        ctx.fillStyle = accentColor;
        ctx.fillText(formatPrice(item), textX, rowY + thumbSize - 12);
      });
    }

    // ---- 10. Ticket stub (dashed perforation + QR) -------------------
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(contentX, stubTop);
    ctx.lineTo(width - contentX, stubTop);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    if (showQr && qrImage) {
      const qrSize = isStory ? 168 : 138;
      const qrX = contentX;
      const qrY = stubTop + 40;

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qrX, qrY, qrSize, qrSize);
      ctx.drawImage(qrImage, qrX + 8, qrY + 8, qrSize - 16, qrSize - 16);

      const textX = qrX + qrSize + 40;
      ctx.textAlign = "left";
      ctx.font = `700 ${29 * s}px ${SANS}`;
      ctx.fillStyle = textColor;
      ctx.fillText("Scan to claim a gift", textX, qrY + 52);

      ctx.font = `500 ${23 * s}px ${SANS}`;
      ctx.fillStyle = subTextColor;
      ctx.fillText("kureva.com", textX, qrY + 88);
    } else {
      ctx.textAlign = "center";
      ctx.font = `700 ${34 * s}px ${SERIF}`;
      ctx.fillStyle = textColor;
      ctx.fillText("kureva", width / 2, stubTop + 68);

      ctx.font = `500 ${22 * s}px ${SANS}`;
      ctx.fillStyle = subTextColor;
      ctx.fillText("Tap the link in bio to claim a wish", width / 2, stubTop + 102);
    }

    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [
    wishlist,
    items,
    shareUrl,
    aspectRatio,
    layoutStyle,
    bgMode,
    selectedGradientId,
    customSolidColor,
    customGradStart,
    customGradEnd,
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

    setTimeout(() => setDownloading(false), 800);
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
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Story & Social Graphic Studio
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-editorial tracking-tight mb-1">
          Customize & export your story graphic
        </h2>
        <p className="text-xs text-stone-500 mb-6 font-light">
          Pick a layout, choose the products to feature, set the palette, then download a high-res PNG.
        </p>

        <canvas ref={canvasRef} className="hidden" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 flex flex-col items-center sticky top-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-stone-100 bg-stone-100 max-h-[500px] w-full flex items-center justify-center">
              {previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="Wishlist story preview"
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
                <span>{downloading ? "Exporting image..." : "Download high-res graphic (.PNG)"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 border border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors bg-white shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Link copied!" : "Copy wishlist link"}</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                <span>1. Aspect ratio & layout</span>
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

              <div className="grid grid-cols-3 gap-2">
                {(["showcase", "hero", "duo"] as LayoutStyle[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLayoutStyle(l)}
                    className={`p-2 rounded-xl border text-[11px] font-medium text-center transition-all ${
                      layoutStyle === l
                        ? "border-emerald-600 bg-emerald-50/60 font-bold text-emerald-900 ring-1 ring-emerald-600"
                        : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {l === "showcase" ? "List (up to 3)" : l === "hero" ? "Spotlight (1 item)" : "Side by side (2)"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>2. Products to feature ({selectedItemIds.length} chosen)</span>
                </span>
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
                          <p className="text-xs font-semibold text-stone-900 truncate leading-snug">{item.name}</p>
                          <p className="text-[10px] text-emerald-700 font-bold">
                            {item.price ? `${getCurrencySymbol(item.currency)}${parseFloat(item.price).toLocaleString()}` : "Free / info"}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-emerald-600 text-white" : "border border-stone-300"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. Palette</span>
              </label>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {(["gradient_preset", "gradient_custom", "solid_custom"] as BgType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setBgMode(m)}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold transition-all ${
                      bgMode === m
                        ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {m === "gradient_preset" ? "Presets" : m === "gradient_custom" ? "Custom gradient" : "Solid color"}
                  </button>
                ))}
              </div>

              {bgMode === "gradient_preset" && (
                <div className="grid grid-cols-4 gap-2">
                  {GRADIENT_PRESETS.map((p) => {
                    const isActive = selectedGradientId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedGradientId(p.id)}
                        className={`p-2 rounded-xl border text-[11px] font-medium flex items-center space-x-2 transition-all ${
                          isActive
                            ? "border-emerald-600 ring-2 ring-emerald-600/30 bg-emerald-50/50"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 shadow-xs border border-black/10"
                          style={{ background: `linear-gradient(135deg, ${p.start}, ${p.end})` }}
                        />
                        <span className="text-stone-800 font-semibold truncate text-[10px]">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {bgMode === "gradient_custom" && (
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-stone-200">
                      <input
                        type="color"
                        value={customGradStart}
                        onChange={(e) => setCustomGradStart(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <div>
                        <p className="text-[10px] font-bold text-stone-600">Start color</p>
                        <p className="text-[10px] font-mono text-stone-400">{customGradStart.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-stone-200">
                      <input
                        type="color"
                        value={customGradEnd}
                        onChange={(e) => setCustomGradEnd(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <div>
                        <p className="text-[10px] font-bold text-stone-600">End color</p>
                        <p className="text-[10px] font-mono text-stone-400">{customGradEnd.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="h-7 w-full rounded-xl shadow-xs border border-stone-200"
                    style={{ background: `linear-gradient(90deg, ${customGradStart}, ${customGradEnd})` }}
                  />
                </div>
              )}

              {bgMode === "solid_custom" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {SOLID_PRESETS.map((sw) => (
                      <button
                        key={sw.color}
                        type="button"
                        onClick={() => setCustomSolidColor(sw.color)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-stone-200 hover:border-stone-400 bg-white flex items-center space-x-1.5"
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: sw.color }} />
                        <span>{sw.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-3 bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                    <input
                      type="color"
                      value={customSolidColor}
                      onChange={(e) => setCustomSolidColor(e.target.value)}
                      className="w-9 h-9 rounded-xl border-0 cursor-pointer bg-transparent p-0"
                    />
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-stone-700">Custom solid background</p>
                      <p className="text-[10px] text-stone-400 font-mono">{customSolidColor.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>4. Tagline</span>
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
                placeholder="Or type a custom tagline..."
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-stone-200">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQr}
                  onChange={(e) => setShowQr(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-stone-700">Embed scannable QR code</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Canvas helpers ----------------------------------------------------

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number = 3): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth) {
      if (lines.length + 1 === maxLines) {
        let trimmed = currentLine;
        while (ctx.measureText(trimmed + "...").width > maxWidth && trimmed.length > 0) {
          const lastSpace = trimmed.lastIndexOf(" ");
          trimmed = lastSpace === -1 ? trimmed.substring(0, trimmed.length - 1) : trimmed.substring(0, lastSpace);
        }
        lines.push(trimmed ? `${trimmed}...` : `${currentLine}...`);
        return lines;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine && lines.length < maxLines) lines.push(currentLine);
  return lines;
}

function getProxyImageUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${apiUrl}/api/proxy-image?url=${encodeURIComponent(url)}`;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      if (!src.includes("/api/proxy-image")) {
        const proxySrc = getProxyImageUrl(src);
        const proxyImg = new Image();
        proxyImg.crossOrigin = "anonymous";
        proxyImg.onload = () => resolve(proxyImg);
        proxyImg.onerror = () => resolve(null);
        proxyImg.src = proxySrc;
      } else {
        resolve(null);
      }
    };
    img.src = getProxyImageUrl(src);
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

// A thin inset border with small corner ticks — the signature "gift ticket"
// device that replaces the old glassy rounded cards.
function drawTicketFrame(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  const inset = 40;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

  const tickLen = 22;
  const corners: [number, number, number, number][] = [
    [inset, inset, 1, 1],
    [width - inset, inset, -1, 1],
    [inset, height - inset, 1, -1],
    [width - inset, height - inset, -1, -1]
  ];
  ctx.lineWidth = 2.5;
  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + tickLen * dy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + tickLen * dx, cy);
    ctx.stroke();
  });
  ctx.restore();
}

function drawHairline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.restore();
}

function drawNumeral(ctx: CanvasRenderingContext2D, index: number, x: number, y: number, color: string, size: number) {
  ctx.save();
  ctx.font = `italic 600 ${size}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.fillText(String(index + 1).padStart(2, "0"), x, y);
  ctx.restore();
}

// Square, thin-bordered photo frame — no radius, no drop shadow. Reads as a
// gallery label rather than a SaaS card thumbnail.
function drawFramedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null | undefined,
  x: number,
  y: number,
  size: number,
  borderColor: string,
  placeholderBg: string,
  placeholderFg: string
) {
  ctx.save();
  if (img) {
    ctx.beginPath();
    ctx.rect(x + 1.5, y + 1.5, size - 3, size - 3);
    ctx.clip();
    ctx.drawImage(img, x, y, size, size);
  } else {
    ctx.fillStyle = placeholderBg;
    ctx.fillRect(x, y, size, size);
    ctx.font = `${Math.max(24, size * 0.22)}px sans-serif`;
    ctx.fillStyle = placeholderFg;
    ctx.textAlign = "center";
    ctx.fillText("🎁", x + size / 2, y + size / 2 + 10);
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, size, size);
  ctx.restore();
}
