import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { api } from '../../lib/api';

interface DesignBriefFormProps {
  onSubmit: (intent: any) => void;
  isLoading: boolean;
  externalError?: string | null;
}

export function DesignBriefForm({ onSubmit, isLoading, externalError }: DesignBriefFormProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form State (Canonical mm)
  const [plotWidth, setPlotWidth] = useState(15000);
  const [plotDepth, setPlotDepth] = useState(20000);
  const [livingArea, setLivingArea] = useState(25000000);
  const [kitchenArea, setKitchenArea] = useState(12000000);
  const [bedArea, setBedArea] = useState(16000000);
  const [vastu, setVastu] = useState(true);

  // Extracted Rooms State
  const [extractedRooms, setExtractedRooms] = useState<any[] | null>(null);

  const presets = [
    { label: "6 BHK Palatial Estate", prompt: "6 BHK palatial luxury mansion with 6 bedrooms, 5 bathrooms, grand living room, formal dining, chef kitchen, pooja room, gym and study with vastu." },
    { label: "4 BHK Luxury Villa", prompt: "4 BHK modern villa on 22m x 25m plot with 4 bedrooms, 3 bathrooms, dining, kitchen, pooja and spacious living hall." },
    { label: "3 BHK Family Home", prompt: "3 BHK home on 18m x 22m plot with 3 bedrooms, 2 bathrooms, open kitchen and living room." },
    { label: "2 BHK Modern Flat", prompt: "2 BHK modern apartment with 2 bedrooms, 2 bathrooms, kitchen and living room." },
    { label: "Big House with Pooja & Study", prompt: "I want a big house with 5 bedrooms, pooja room, study room, balcony and vastu compliance." }
  ];

  const handleAiExtract = async (promptToUse?: string) => {
    const textPrompt = promptToUse || aiPrompt;
    if (!textPrompt || !textPrompt.trim()) return null;
    
    setIsAiLoading(true);
    setInternalError(null);
    try {
      const res = await api.post('/ai/extract-intent', { prompt: textPrompt.trim() });
      const intent = res.data;
      
      // Auto-fill Plot and Preferences
      if (intent.plotWidth) setPlotWidth(intent.plotWidth);
      if (intent.plotDepth) setPlotDepth(intent.plotDepth);
      if (intent.preferences && intent.preferences.vastu !== undefined) {
        setVastu(intent.preferences.vastu);
      }
      
      if (intent.rooms && intent.rooms.length > 0) {
        setExtractedRooms(intent.rooms);
        const lr = intent.rooms.find((r: any) => r.type === 'LivingRoom');
        const k = intent.rooms.find((r: any) => r.type === 'Kitchen');
        const b = intent.rooms.find((r: any) => r.type === 'Bedroom');
        
        if (lr) setLivingArea(lr.area);
        if (k) setKitchenArea(k.area);
        if (b) setBedArea(b.area);
      }
      return intent;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'AI extraction failed. Please try a different prompt.';
      setInternalError(msg);
      return null;
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInternalError(null);

    // If user entered natural language brief and hasn't extracted rooms yet, auto-extract and generate seamlessly in 1 click!
    let roomsToSubmit = extractedRooms;
    let targetWidth = plotWidth;
    let targetDepth = plotDepth;
    let targetVastu = vastu;

    if (aiPrompt.trim() && (!extractedRooms || extractedRooms.length === 0)) {
      const extracted = await handleAiExtract(aiPrompt);
      if (extracted) {
        roomsToSubmit = extracted.rooms;
        targetWidth = extracted.plotWidth || plotWidth;
        targetDepth = extracted.plotDepth || plotDepth;
        if (extracted.preferences?.vastu !== undefined) {
          targetVastu = extracted.preferences.vastu;
        }
      }
    }

    // Sanitize rooms
    const sanitizedRooms = (roomsToSubmit && roomsToSubmit.length > 0)
      ? roomsToSubmit.map(r => ({
          ...r,
          area: Number(r.area) > 1000000 ? Number(r.area) : 12000000
        }))
      : [
          { type: 'LivingRoom', area: livingArea > 1000000 ? livingArea : 25000000 },
          { type: 'Kitchen', area: kitchenArea > 1000000 ? kitchenArea : 12000000 },
          { type: 'Bedroom', area: bedArea > 1000000 ? bedArea : 16000000 },
        ];

    const intentData = {
      plotWidth: targetWidth > 2000 ? targetWidth : 15000,
      plotDepth: targetDepth > 2000 ? targetDepth : 20000,
      rooms: sanitizedRooms,
      preferences: { vastu: targetVastu }
    };

    onSubmit(intentData);
  };

  const bedCount = extractedRooms ? extractedRooms.filter(r => (r.type as string).toUpperCase().includes('BED')).length : 1;
  const bathCount = extractedRooms ? extractedRooms.filter(r => (r.type as string).toUpperCase().includes('BATH') || (r.type as string).toUpperCase().includes('TOILET')).length : 1;
  const activeError = internalError || externalError;
  const isBusy = isLoading || isAiLoading;

  return (
    <Card className="w-full shadow-lg border border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-800">AI Architectural Planner</CardTitle>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            Smart Engine 2.0
          </span>
        </div>
        <CardDescription>
          Specify any requirements (1 to 6+ BHK, Palatial Estates, Custom Amenities).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Input Section */}
        <div className="space-y-3 p-4 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Natural Language Brief</label>
            <span className="text-[11px] text-indigo-600 font-medium">Freeform input</span>
          </div>

          <textarea 
            className="w-full p-3 text-sm rounded-lg border border-indigo-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            rows={3} 
            placeholder="e.g. 4 BHK luxury villa with 3 bathrooms, pooja room, gym, dining hall and vastu."
            value={aiPrompt}
            onChange={e => {
              setAiPrompt(e.target.value);
              setInternalError(null);
            }}
          />

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiPrompt(p.prompt);
                  handleAiExtract(p.prompt);
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs font-medium transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button 
            type="button" 
            onClick={() => handleAiExtract()} 
            disabled={isBusy || !aiPrompt.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg shadow transition cursor-pointer"
          >
            {isAiLoading ? 'Extracting Architectural Scope...' : 'Extract Requirements'}
          </Button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
          {activeError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{activeError}</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Plot Width (mm)</label>
              <Input 
                type="number" 
                step="100" 
                value={plotWidth} 
                onChange={e => setPlotWidth(Number(e.target.value) || 0)} 
              />
              <span className="text-[10px] text-slate-400 font-mono">{(plotWidth / 1000).toFixed(1)} meters</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Plot Depth (mm)</label>
              <Input 
                type="number" 
                step="100" 
                value={plotDepth} 
                onChange={e => setPlotDepth(Number(e.target.value) || 0)} 
              />
              <span className="text-[10px] text-slate-400 font-mono">{(plotDepth / 1000).toFixed(1)} meters</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Extracted Room Schedule
              </h4>
              {extractedRooms && (
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {extractedRooms.length} Rooms ({bedCount} Bed, {bathCount} Bath)
                </span>
              )}
            </div>

            {extractedRooms ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {extractedRooms.map((room, idx) => {
                  const areaM2 = (room.area / 1000000).toFixed(1);
                  const areaSqFt = Math.round(room.area / 1000000 * 10.764);
                  return (
                    <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-800 truncate">{room.type}</span>
                        <span className="text-[9px] font-medium text-slate-400">{areaSqFt} sq ft</span>
                      </div>
                      <Input 
                        type="number" 
                        value={room.area} 
                        className="h-7 text-xs font-mono"
                        onChange={e => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          const newRooms = [...extractedRooms];
                          newRooms[idx].area = val;
                          setExtractedRooms(newRooms);
                        }} 
                      />
                      <span className="text-[9px] text-slate-400 block text-right font-mono">{areaM2} m²</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Living</label>
                  <Input type="number" value={livingArea} onChange={e => setLivingArea(Number(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Kitchen</label>
                  <Input type="number" value={kitchenArea} onChange={e => setKitchenArea(Number(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Bedroom</label>
                  <Input type="number" value={bedArea} onChange={e => setBedArea(Number(e.target.value) || 0)} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input 
              type="checkbox" 
              id="vastu" 
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" 
              checked={vastu} 
              onChange={e => setVastu(e.target.checked)} 
            />
            <label htmlFor="vastu" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Apply Vastu Shastra Design Principles
            </label>
          </div>

          <Button 
            type="submit" 
            disabled={isBusy} 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isBusy && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
            {isAiLoading ? 'Extracting Architectural Scope...' : isLoading ? 'Generating AI Layout...' : 'Generate AI Layout'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
