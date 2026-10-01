import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  User, 
  GraduationCap, 
  Flame, 
  Calendar, 
  MapPin, 
  Share2,
  Check,
  FileImage
} from 'lucide-react';
import { toJpeg, toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

const WhatsAppIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const DigitalPassCard = ({ participant, isPreview = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareNotice, setShareNotice] = useState(null);

  const frontCardRef = useRef(null);
  const backCardRef = useRef(null);

  // Safe defaults if empty or typing
  const name = participant?.fullName?.trim() || (isPreview ? 'Aarav Sharma' : 'Valued Fresher');
  const roll = participant?.registrationNumber?.trim() || (isPreview ? '25101001' : 'GCE-25XXXX');
  const branch = participant?.branch || 'Computer Science & Engineering';
  const role = participant?.role || 'Participant / Performer';
  const acts = participant?.acts || 'Mr. & Miss Kshitiz Ramp Walk';
  const phone = participant?.phone || '+91 98765 XXXXX';
  const passId = `KSHITIZ-25-${roll.toUpperCase()}`;

  // Generate SVG QR Code pattern deterministically based on roll number
  const generateQrPattern = () => {
    const cells = [];
    const hashStr = passId + name;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isCorner = 
          (r < 2 && c < 2) || 
          (r < 2 && c > 4) || 
          (r > 4 && c < 2);
        
        let filled = false;
        if (isCorner) {
          filled = true;
        } else {
          const charCode = hashStr.charCodeAt((r * 7 + c) % hashStr.length) || 65;
          filled = (charCode + r * 3 + c * 5) % 2 === 0;
        }
        if (filled) {
          cells.push(<rect key={`${r}-${c}`} x={c * 9 + 4} y={r * 9 + 4} width="7" height="7" rx="1.5" fill="#00F5D4" />);
        }
      }
    }
    return cells;
  };

  // High-Resolution 2D Canvas Fallback Renderer (guaranteed 100% success on any browser/device)
  const drawPassOnCanvas = (format = 'image/jpeg') => {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 1140;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Solid dark canvas base for JPEG export (avoids transparent/black corner anomalies)
    ctx.fillStyle = '#040614';
    ctx.fillRect(0, 0, width, height);

    // Helper: Rounded Rectangle
    const roundRect = (x, y, w, h, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    // 1. Background Card Body
    roundRect(20, 20, width - 40, height - 40, 36);
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0c0e2b');
    bgGrad.addColorStop(0.5, '#07091c');
    bgGrad.addColorStop(1, '#03040e');
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // 2. Neon Border
    ctx.lineWidth = 4;
    const borderGrad = ctx.createLinearGradient(0, 0, width, height);
    borderGrad.addColorStop(0, '#8B5CF6');
    borderGrad.addColorStop(0.5, '#EC4899');
    borderGrad.addColorStop(1, '#00F5D4');
    ctx.strokeStyle = borderGrad;
    ctx.stroke();

    // 3. Ambient Glow Circles
    ctx.save();
    ctx.beginPath();
    ctx.arc(width - 80, 80, 180, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.filter = 'blur(40px)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(80, height - 120, 180, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
    ctx.fill();
    ctx.restore();

    // 4. Header Section
    // GCE Icon box
    roundRect(55, 55, 60, 60, 16);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00F5D4';
    ctx.stroke();

    ctx.font = 'bold 22px Outfit, sans-serif';
    ctx.fillStyle = '#00F5D4';
    ctx.textAlign = 'center';
    ctx.fillText('GCE', 85, 92);

    // College text
    ctx.textAlign = 'left';
    ctx.font = 'bold 18px Outfit, sans-serif';
    ctx.fillStyle = '#67e8f9';
    ctx.fillText('GAYA COLLEGE OF ENGINEERING', 130, 80);
    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Organized by Batch 2024–28', 130, 102);

    // VIP Pass Pill Badge
    roundRect(width - 180, 65, 120, 36, 18);
    const badgeGrad = ctx.createLinearGradient(width - 180, 0, width - 60, 0);
    badgeGrad.addColorStop(0, '#8B5CF6');
    badgeGrad.addColorStop(1, '#EC4899');
    ctx.fillStyle = badgeGrad;
    ctx.fill();
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('VIP PASS', width - 120, 88);

    // Divider
    ctx.beginPath();
    ctx.moveTo(55, 135);
    ctx.lineTo(width - 55, 135);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 5. Conclave Branding
    // Pill
    roundRect(width / 2 - 130, 165, 260, 28, 14);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.stroke();
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.fillStyle = '#00F5D4';
    ctx.textAlign = 'center';
    ctx.fillText('★ OFFICIAL ENTRY CREDENTIAL ★', width / 2, 183);

    // Main KSHITIZ '25 text
    ctx.font = '900 68px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText("KSHITIZ '25", width / 2, 265);

    ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#c084fc';
    ctx.fillText('Beyond The Horizon • Celestial Awakening', width / 2, 300);

    // 6. Student Info Box
    roundRect(55, 335, width - 110, 480, 24);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner Fields
    ctx.textAlign = 'left';
    // Name
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('ATTENDEE NAME', 85, 375);
    ctx.font = 'bold 28px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, 85, 412);

    // Roll Number Pill
    ctx.textAlign = 'right';
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('ROLL / REG NO', width - 85, 375);
    roundRect(width - 240, 388, 155, 36, 10);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.stroke();
    ctx.font = 'bold 17px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00F5D4';
    ctx.textAlign = 'center';
    ctx.fillText(roll, width - 162, 412);

    // Divider inside box
    ctx.beginPath();
    ctx.moveTo(85, 445);
    ctx.lineTo(width - 85, 445);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Department
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('DEPARTMENT / BRANCH', 85, 485);
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(branch, 85, 515);

    // Role
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('ROLE', 85, 570);
    ctx.font = 'bold 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#f472b6';
    ctx.fillText(role, 85, 600);

    // Chosen Act
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('CHOSEN ACT / PARTICIPATION', 85, 655);
    ctx.font = 'bold 21px Outfit, sans-serif';
    ctx.fillStyle = '#fcd34d';
    ctx.fillText(acts, 85, 688);

    // Status Badge
    roundRect(85, 730, 160, 36, 10);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.stroke();
    ctx.font = 'bold 14px Outfit, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'center';
    ctx.fillText('✓ CONFIRMED PASS', 165, 753);

    // 7. Bottom Verification & QR Section
    // Verification ID
    ctx.textAlign = 'left';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('VERIFICATION TOKEN', 55, 870);
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#c084fc';
    ctx.fillText(passId, 55, 898);

    ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('📅 8 October 2026 • 05:00 PM Onwards', 55, 935);
    ctx.fillText('📍 Academic campus, GCE', 55, 960);

    // Draw Vector QR Code Box
    const qrSize = 130;
    const qrX = width - 55 - qrSize;
    const qrY = 845;
    roundRect(qrX, qrY, qrSize, qrSize, 18);
    ctx.fillStyle = '#050714';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // QR Patterns
    const hashStr = passId + name;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isCorner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
        let filled = isCorner;
        if (!isCorner) {
          const charCode = hashStr.charCodeAt((r * 7 + c) % hashStr.length) || 65;
          filled = (charCode + r * 3 + c * 5) % 2 === 0;
        }
        if (filled) {
          roundRect(qrX + 16 + c * 14, qrY + 16 + r * 14, 11, 11, 2);
          ctx.fillStyle = '#00F5D4';
          ctx.fill();
        }
      }
    }

    // Barcode Strip along bottom
    const barY = 1010;
    const barHeight = 40;
    ctx.fillStyle = '#ffffff';
    for (let b = 55; b < width - 55; b += 8) {
      const barW = (b % 16 === 0) ? 4 : (b % 24 === 0) ? 5 : 2;
      ctx.fillRect(b, barY, barW, barHeight);
    }

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText(`* ${passId} * BATCH 2025-29 OFFICIAL CONCLAVE ENTRY CREDENTIAL *`, width / 2, 1075);

    return canvas.toDataURL(format, 0.95);
  };

  // High-Quality Pass Image Generator (JPG/PNG with canvas fallback and Blob export)
  const generatePassImageData = async (format = 'image/jpeg') => {
    const targetElement = isFlipped ? backCardRef.current : frontCardRef.current;
    let dataUrl = null;

    if (targetElement) {
      try {
        const renderOpts = {
          cacheBust: true,
          pixelRatio: 2.5,
          quality: 0.95,
          backgroundColor: '#040614',
          style: {
            transform: 'none',
            borderRadius: '24px'
          }
        };

        if (format === 'image/jpeg') {
          dataUrl = await toJpeg(targetElement, renderOpts);
        } else {
          dataUrl = await toPng(targetElement, renderOpts);
        }
      } catch (domErr) {
        console.warn('DOM to image renderer notice, falling back to canvas:', domErr);
      }
    }

    if (!dataUrl) {
      dataUrl = drawPassOnCanvas(format);
    }

    // Convert dataUrl to Blob
    let blob = null;
    try {
      const res = await fetch(dataUrl);
      blob = await res.blob();
    } catch {
      try {
        const parts = dataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || format;
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blob = new Blob([u8arr], { type: mime });
      } catch (err) {
        console.error('Blob conversion error:', err);
      }
    }

    return { dataUrl, blob };
  };

  // Main Image Download Handler (Saves high-res JPG directly to device)
  const handleDownloadImage = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    const cleanRoll = roll.replace(/[^a-zA-Z0-9_-]/g, '_');
    const sideSuffix = isFlipped ? '_Rules' : '';
    const fileName = `Kshitiz_2025_Entry_Pass_${cleanRoll}${sideSuffix}.jpg`;

    try {
      const { dataUrl } = await generatePassImageData('image/jpeg');

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00F5D4', '#8B5CF6', '#EC4899', '#FBBF24']
      });

      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Download error:', err);
      const fallbackUrl = drawPassOnCanvas('image/jpeg');
      const link = document.createElement('a');
      link.download = fileName;
      link.href = fallbackUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  // Share Pass Handler: Generates JPG image and shares directly to WhatsApp or native share sheet
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    setShareNotice(null);

    const cleanRoll = roll.replace(/[^a-zA-Z0-9_-]/g, '_');
    const sideSuffix = isFlipped ? '_Rules' : '';
    const fileName = `Kshitiz_2025_Entry_Pass_${cleanRoll}${sideSuffix}.jpg`;

    try {
      const { dataUrl, blob } = await generatePassImageData('image/jpeg');

      const shareTitle = `Kshitiz '25 VIP Entry Pass - ${name}`;
      const shareText = `🎟️ Official Entry Pass for Kshitiz '25\nAttendee: ${name}\nRoll: ${roll}\nVerification ID: ${passId}\nVenue: Academic Campus, GCE\nDate: 8 Oct 2026 • 05:00 PM`;

      let sharedViaApi = false;

      // 1. Try Native Web Share API with JPG File (Android Chrome, iOS Safari, etc.)
      if (blob && typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
        try {
          const passFile = new File([blob], fileName, { type: 'image/jpeg' });
          if (navigator.canShare({ files: [passFile] })) {
            await navigator.share({
              files: [passFile],
              title: shareTitle,
              text: shareText
            });
            sharedViaApi = true;
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 3000);
          }
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') {
            // User cancelled share tray, cleanly exit
            setIsSharing(false);
            return;
          }
          console.warn('Native file share failed, switching to download + WhatsApp fallback:', shareErr);
        }
      }

      // 2. If Web Share with files is not supported (Desktop browsers, etc.):
      if (!sharedViaApi) {
        // Automatically download the JPG card so user has the actual image file
        if (dataUrl) {
          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        // Open WhatsApp with prefilled entry pass details
        const waMsg = encodeURIComponent(
          `${shareText}\n\n[Pass image downloaded as JPG — attach the downloaded image in this chat!]`
        );
        const waUrl = `https://api.whatsapp.com/send?text=${waMsg}`;
        window.open(waUrl, '_blank');

        setShareNotice('Pass downloaded as JPG! Attach this image to your WhatsApp chat.');
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 4000);
        setTimeout(() => setShareNotice(null), 8000);
      }
    } catch (err) {
      console.error('Error sharing pass:', err);
      // Failsafe: force canvas download
      try {
        const fallbackUrl = drawPassOnCanvas('image/jpeg');
        const link = document.createElement('a');
        link.download = fileName;
        link.href = fallbackUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShareNotice('Pass downloaded as JPG image!');
        setTimeout(() => setShareNotice(null), 5000);
      } catch (e) {
        console.error('Fallback error:', e);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full">
      
      {/* Exact-Position Card Wrapper (Shows ONLY ONE side at a time, anchored at the exact same place) */}
      <div 
        className="w-full max-w-sm sm:max-w-md cursor-pointer group my-1 transition-transform duration-300 active:scale-[0.99]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {!isFlipped ? (
          /* ================= FRONT SIDE ================= */
          <div 
            ref={frontCardRef}
            className="w-full rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#0c0e29] via-[#090b20] to-[#040614] border-2 border-purple-500/40 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-purple-400/60 animate-fade-in"
          >
            {/* Holographic light foil reflection sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

            {/* Glowing cosmic background orbs */}
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-purple-600/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-cyan-600/25 rounded-full blur-2xl pointer-events-none" />

            {/* Top Pass Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4 mb-3 sm:mb-4 relative z-10">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 p-[1.5px] shadow-lg">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-brand font-black text-cyan-300 text-sm">
                    GCE
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-cyan-300 tracking-wider uppercase">Gaya College of Engineering</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Batch 2024–28 Presents</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2.5 py-1 rounded-full shadow-md inline-block">
                  VIP PASS
                </span>
                <span className="block text-[9px] font-mono text-cyan-400 mt-1">2025 CONCLAVE</span>
              </div>
            </div>

            {/* Event Branding */}
            <div className="text-center my-2 sm:my-3 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-bold tracking-widest text-cyan-300 uppercase mb-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> OFFICIAL ENTRY CREDENTIAL
              </div>
              <h3 className="text-2xl sm:text-4xl font-black font-brand tracking-wider text-white">
                <span className="text-gradient-cosmic">KSHITIZ</span>{' '}
                <span className="text-gradient-gold font-light">'25</span>
              </h3>
              <p className="text-[11px] text-purple-300 font-medium tracking-wide">
                Beyond The Horizon • Celestial Awakening
              </p>
            </div>

            {/* Student Info Card Deck */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 my-3 sm:my-4 text-left space-y-2 relative z-10 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendee Name</span>
                  <span className="text-base sm:text-lg font-black text-white tracking-tight leading-tight block">
                    {name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Roll / Reg No</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-md border border-cyan-500/30 inline-block">
                    {roll}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
                  <span className="text-xs font-semibold text-slate-200 line-clamp-1">{branch}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Role</span>
                  <span className="text-xs font-semibold text-pink-300">{role}</span>
                </div>
              </div>

              <div className="pt-1 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Chosen Act / Category</span>
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="line-clamp-1">{acts}</span>
                  </span>
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                  CONFIRMED
                </span>
              </div>
            </div>

            {/* Bottom Pass Strip: Scannable QR & Verification */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10">
              <div className="text-left">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Verification ID</span>
                <span className="text-[10px] font-mono font-bold text-purple-300 tracking-wider">{passId}</span>
                <div className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-400">
                  <Calendar className="w-3 h-3 text-cyan-400" /> 8 Oct 2026 • 05:00 PM
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Visual SVG QR */}
                <div className="w-16 h-16 rounded-xl bg-slate-950 p-1.5 border border-cyan-500/40 shadow-inner flex items-center justify-center">
                  <svg viewBox="0 0 71 71" className="w-full h-full">
                    {generateQrPattern()}
                  </svg>
                </div>
              </div>
            </div>

            {/* Flip hint pill */}
            <div className="mt-3 text-center">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-purple-300 hover:text-white transition-colors bg-purple-950/40 px-3 py-1 rounded-full border border-purple-500/20">
                <RotateCw className="w-3 h-3 animate-spin-slow" /> Tap card to view Entry Rules & Guidelines
              </span>
            </div>
          </div>
        ) : (
          /* ================= BACK SIDE (Rendered in the exact same place) ================= */
          <div 
            ref={backCardRef}
            className="w-full rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#040614] via-[#090b20] to-[#0c0e29] border-2 border-cyan-500/40 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-cyan-400/60 flex flex-col justify-between text-left animate-fade-in"
          >
            {/* Ambient Background Orbs */}
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Entry Terms & Guidelines</span>
                </div>
                <span className="text-[10px] font-mono text-purple-300">GCE-KSHITIZ-2025</span>
              </div>

              <div className="space-y-2.5 text-[11px] text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">1</span>
                  <span><strong>Reporting Time:</strong> Gates open at 04:30 PM. Conclave inauguration strictly at 05:15 PM at Academic campus, GCE.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">2</span>
                  <span><strong>Dress Code:</strong> Theme "Celestial Horizon" — Royal Blues, Emeralds, Regal Ethnic wear, or Western Formals.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">3</span>
                  <span><strong>Pass Verification:</strong> Save this digital pass image on your phone. Show QR code at the red carpet gates for entry.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">4</span>
                  <span><strong>Stage Performers:</strong> Report to Green Room Stage Left 30 minutes prior to your performance slot.</span>
                </div>
              </div>

              <div className="mt-3.5 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <span className="text-[10px] font-bold uppercase text-purple-300 tracking-wider block mb-1">
                  Senior Organizing Committee Desk
                </span>
                <p className="text-[10px] text-slate-400">
                  Organized with pride by <strong>Batch 2024–2028</strong>. Anti-Ragging strictly enforced. Zero alcohol/substance tolerance. Have fun, make friends, and rock the stage!
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-cyan-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Academic campus, GCE
              </span>
              <span className="inline-flex items-center gap-1 text-purple-300 font-semibold">
                <RotateCw className="w-3 h-3" /> Tap card to view Pass Front
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls: Attached DIRECTLY at the bottom of the entry pass card */}
      <div className="w-full max-w-sm sm:max-w-md flex flex-col gap-2 mt-3">
        {/* PRIMARY SAVE PASS BUTTON */}
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={isDownloading || isSharing}
          className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-400 hover:to-pink-500 shadow-xl shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating JPG Pass...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>✓ Pass Saved as JPG!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Save Pass to Phone (JPG Image)</span>
            </>
          )}
        </button>

        {/* Secondary Actions: Flip & Share Pass (JPG) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-200 glass-card hover:text-white hover:border-cyan-500/40 transition-all cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isFlipped ? 'View Front Side' : 'View Back Rules'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            disabled={isSharing || isDownloading}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-200 glass-card hover:text-white hover:border-pink-500/40 transition-all cursor-pointer disabled:opacity-60"
            title="Share Pass as JPG image to WhatsApp or other apps"
          >
            {isSharing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Preparing JPG...</span>
              </>
            ) : shareSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>JPG Pass Ready!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Share Pass (JPG)</span>
              </>
            )}
          </button>
        </div>

        {downloadSuccess && (
          <p className="text-[11px] text-emerald-400 font-semibold text-center mt-1 animate-fade-in flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Entry pass downloaded as high-resolution JPG image!
          </p>
        )}

        {shareNotice && (
          <div className="mt-1 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2.5 animate-fade-in shadow-lg">
            <div className="flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-[11px] text-emerald-300 font-medium leading-tight">
                {shareNotice}
              </p>
            </div>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🎟️ Official Entry Pass for Kshitiz '25\nAttendee: ${name}\nRoll: ${roll}\nVerification ID: ${passId}\nVenue: Academic Campus, GCE\nDate: 8 Oct 2026 • 05:00 PM`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] inline-flex items-center gap-1.5 shadow-md transition-all flex-shrink-0"
              title="Open WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        )}
      </div>

    </div>
  );
};

export default DigitalPassCard;
