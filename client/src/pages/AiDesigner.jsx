import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Upload,
  BrainCircuit,
  ArrowRight,
  Palette,
  CheckCircle,
  Zap,
  Info
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export const AiDesigner = () => {
  const [objective, setObjective] = useState('');
  const [roomScene, setRoomScene] = useState('living');
  const [customImageFile, setCustomImageFile] = useState(null);
  const [previewThumb, setPreviewThumb] = useState(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(15);
  const [progressMsg, setProgressMsg] = useState('Connecting to Gemini AI Engine...');
  const [diagnosticReport, setDiagnosticReport] = useState(null);

  const { addToast } = useToast();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomImageFile(file);
      setPreviewThumb(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!objective.trim()) {
      addToast('Please enter your design objective & room vibe.', 'error');
      return;
    }

    setLoading(true);
    setDiagnosticReport(null);

    // Animated progress sequence
    setProgress(20);
    setProgressMsg('Scanning spatial coordinates & luminance balance...');

    const timer1 = setTimeout(() => {
      setProgress(55);
      setProgressMsg('Computing harmonious textile textures & wall focal positions...');
    }, 1000);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setProgressMsg('Synthesizing bespoke color swatches with Gemini neural engine...');
    }, 2200);

    try {
      const formData = new FormData();
      formData.append('objective', objective.trim());
      formData.append('room_scene', roomScene);
      if (customImageFile) {
        formData.append('custom_image', customImageFile);
      }

      const res = await api.post('/ai/analyze-room', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      setProgress(100);

      if (res.data?.data) {
        setTimeout(() => {
          setDiagnosticReport(res.data.data);
          setLoading(false);
          addToast('Spatial analysis complete!', 'success');
        }, 500);
      }
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setLoading(false);
      addToast(err.response?.data?.message || 'Spatial analysis failed.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="mb-10">
        <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-max">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Aura AI Design Suite
        </span>
        <h1 className="font-display-xl text-3xl md:text-5xl text-primary font-bold leading-tight">
          AI Spatial Interior Designer
        </h1>
        <p className="text-stone-500 max-w-2xl text-sm mt-2 leading-relaxed">
          Upload your room wall photo or select an environment template, specify your mood, and let our multi-modal neural designer curate perfect spatial harmony, palettes, and bespoke wall decor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ─── Left Form ──────────────────────────────────────────────── */}
        <div className="lg:col-span-5 bg-white rounded-[2rem] p-6 md:p-8 whisper-shadow border border-stone-100 h-fit space-y-6">
          <h2 className="font-headline-md text-xl text-primary font-bold flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-emerald-800" />
            Spatial Diagnostics Setup
          </h2>

          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400">
                Design Objective & Vibe
              </label>
              <textarea
                rows="4"
                required
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g. I want to design a serene Japandi reading corner with warm earth tones, soft linen fabrics, and modern wooden frames..."
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-emerald-700 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400">
                Environment Template
              </label>
              <select
                value={roomScene}
                onChange={(e) => setRoomScene(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-700 cursor-pointer"
              >
                <option value="living">Lounge Living Room</option>
                <option value="bedroom">Sanctuary Bedroom</option>
                <option value="office">Creative Studio Office</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400">
                Room Wall Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-stone-200 hover:border-emerald-800 rounded-2xl p-4 text-center cursor-pointer relative transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {previewThumb ? (
                  <img
                    src={previewThumb}
                    alt="Uploaded wall"
                    className="w-full max-h-36 object-cover rounded-xl border border-stone-200"
                  />
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-stone-500">Drag & drop or click to upload wall photo</p>
                    <p className="text-[10px] text-stone-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-950 text-white px-6 py-4 rounded-xl font-bold hover:bg-emerald-900 shadow-md transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-50"
            >
              <span>{loading ? 'Running Diagnostic Pipeline...' : 'Analyze Space Harmony'}</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>
          </form>
        </div>

        {/* ─── Right Results Showcase ─────────────────────────────────── */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] p-6 md:p-8 whisper-shadow border border-stone-100 min-h-[500px] flex flex-col justify-between">
          
          {/* 1. Offline State */}
          {!loading && !diagnosticReport && (
            <div className="my-auto py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-800 flex items-center justify-center">
                <BrainCircuit className="w-10 h-10 animate-pulse text-emerald-800" />
              </div>
              <h3 className="font-headline-md text-xl text-primary font-bold">Space Harmony Scanner Offline</h3>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Input your spatial vision, select target room coordinates, and run analysis to launch the AI diagnostic report.
              </p>
            </div>
          )}

          {/* 2. Loading Pipeline State */}
          {loading && (
            <div className="my-auto py-16 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative w-24 h-24 flex items-center justify-center bg-emerald-500/10 rounded-full">
                <Sparkles className="w-10 h-10 text-emerald-800 animate-spin" />
                <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full scale-110 animate-ping opacity-25" />
              </div>
              <div className="space-y-3 w-full max-w-sm">
                <h4 className="text-base font-bold text-primary">Initiating Spatial Diagnostics...</h4>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-950 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs font-mono text-emerald-900">{progressMsg}</p>
              </div>
            </div>
          )}

          {/* 3. Diagnostic Report Active */}
          {diagnosticReport && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-5 gap-3">
                <div>
                  <span className="inline-block px-3 py-1 mb-1 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-bold uppercase tracking-widest">
                    Diagnostic Report Verified
                  </span>
                  <h2 className="font-headline-md text-2xl text-primary font-bold">Spatial Curation Output</h2>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-500/10 px-3 py-1 rounded-full">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Multi-modal Spec
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Diagnostics & Palette */}
                <div className="space-y-6">
                  <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400">
                      Spatial Harmony Diagnostics
                    </h3>
                    <div className="text-xs text-stone-600 leading-relaxed whitespace-pre-line space-y-2">
                      {diagnosticReport.harmony_analysis}
                    </div>
                  </div>

                  <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400">
                      Aura Palette Swatches
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      {diagnosticReport.palette?.map((swatch, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-stone-200/60 shadow-sm"
                        >
                          <span
                            className="w-7 h-7 rounded-lg border border-black/10 shrink-0"
                            style={{ backgroundColor: swatch.hex }}
                          />
                          <div className="overflow-hidden">
                            <p className="text-[11px] font-bold text-stone-800 truncate">{swatch.name}</p>
                            <p className="text-[10px] font-mono text-stone-400">{swatch.hex}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Recommendations & Studio Link */}
                <div className="space-y-6">
                  <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400">
                      Space Styling Suggestions
                    </h3>
                    <div className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                      {diagnosticReport.styling_tips}
                    </div>
                  </div>

                  {/* Recommendation Card */}
                  <div className="p-6 bg-emerald-950 text-white rounded-[2rem] border border-emerald-900 shadow-xl space-y-4">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 text-[9px] font-bold uppercase tracking-widest mb-1.5">
                        Recommended Base Piece
                      </span>
                      <h4 className="font-bold text-base">Custom Canvas Wall Art</h4>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        Pre-loaded with recommended moulding ({diagnosticReport.recommended_frame_style || 'oak'}) and palette ({diagnosticReport.recommended_frame_color || '#064e3b'}).
                      </p>
                    </div>

                    <Link
                      to={`/customize?color=${encodeURIComponent(diagnosticReport.recommended_frame_color || '#064e3b')}&frame_style=${diagnosticReport.recommended_frame_style || 'oak'}`}
                      className="w-full bg-white text-emerald-950 py-3.5 rounded-xl font-bold text-center text-xs hover:bg-stone-100 transition-colors flex justify-center items-center gap-1.5 shadow-md"
                    >
                      <span>Configure In Studio Visualizer</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
