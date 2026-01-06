import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, Save, Sparkles, Palette as PaletteIcon, X, SlidersHorizontal, ArrowLeft, HelpCircle } from 'lucide-react';
import ColorPicker from './components/ColorPicker';
import ContrastScore from './components/ContrastScore';
import PreviewSimulator from './components/PreviewSimulator';
import SavedList from './components/SavedList';
import SuggestionPanel from './components/SuggestionPanel';
import Tutorial, { TutorialStep } from './components/Tutorial';
import { getContrastRatio, generateSingleSuggestions, generatePairSuggestions, Suggestion } from './utils/colorUtils';
import { Palette, WCAGResult } from './types';

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        targetId: 'tutorial-color-pickers',
        title: 'STEP 1: 色を選ぶ',
        content: 'まずは背景色と文字色を選びましょう。カラーコードを直接入力するか、クリックしてカラーピッカーから選べます。',
    },
    {
        targetId: 'tutorial-contrast-score',
        title: 'STEP 2: スコアを確認',
        content: '選んだ色の組み合わせが「読みやすいか」を判定します。WCAG基準でAA（合格）やAAA（とても見やすい）を目指しましょう。',
    },
    {
        targetId: 'tutorial-auto-adjust',
        title: 'STEP 3: 自動調整',
        content: '「AAまであと少し...」という時はこれ！色味を保ったまま、AIが読みやすい色に自動で調整してくれます。',
    },
    {
        targetId: 'tutorial-save-button',
        title: 'STEP 4: 保存',
        content: '気に入った組み合わせができたら保存しましょう。下の一覧からいつでも呼び出せます。',
    }
];

function App() {
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [textColor, setTextColor] = useState<string>('#64748B');
  const [result, setResult] = useState<WCAGResult>({
    ratio: 0,
    aaNormal: false,
    aaLarge: false,
    aaaNormal: false,
    aaaLarge: false,
  });
  const [savedPalettes, setSavedPalettes] = useState<Palette[]>([]);
  
  // Suggestion State
  const [showSuggestions, setShowSuggestions] = useState<'text' | 'bg' | 'both' | null>(null);
  const [currentSuggestions, setCurrentSuggestions] = useState<Suggestion[]>([]);
  
  // Preview/Confirmation State
  const [originalColors, setOriginalColors] = useState<{bg: string, text: string} | null>(null);

  // Tutorial State
  const [isTutorialActive, setIsTutorialActive] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('iroCheckPalettes');
    if (saved) {
      try {
        setSavedPalettes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved palettes", e);
      }
    }
    
    // Check tutorial status
    const hasSeenTutorial = localStorage.getItem('iroCheckTutorialSeen');
    if (!hasSeenTutorial) {
        // Small delay to ensure render
        setTimeout(() => setIsTutorialActive(true), 500);
    }

    // Set initial calculation
    calculateContrast('#FFFFFF', '#64748B');
  }, []);

  const finishTutorial = () => {
      setIsTutorialActive(false);
      localStorage.setItem('iroCheckTutorialSeen', 'true');
  };

  const startTutorial = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsTutorialActive(true);
  };

  const calculateContrast = useCallback((bg: string, text: string) => {
    // Validate hex before calculating
    if (/^#[0-9A-F]{6}$/i.test(bg) && /^#[0-9A-F]{6}$/i.test(text)) {
      const res = getContrastRatio(bg, text);
      setResult(res);
    }
  }, []);

  const handleBgChange = (color: string) => {
    setBgColor(color);
    calculateContrast(color, textColor);
    // Only update suggestions if we are NOT currently previewing a specific suggestion
    if (showSuggestions && !originalColors) updateSuggestions(showSuggestions, color, textColor);
  };

  const handleTextChange = (color: string) => {
    setTextColor(color);
    calculateContrast(bgColor, color);
    // Only update suggestions if we are NOT currently previewing a specific suggestion
    if (showSuggestions && !originalColors) updateSuggestions(showSuggestions, bgColor, color);
  };

  const swapColors = () => {
    const temp = bgColor;
    setBgColor(textColor);
    setTextColor(temp);
    calculateContrast(textColor, temp); 
    // Do not hide suggestions, just update them
    if (showSuggestions) updateSuggestions(showSuggestions, textColor, temp);
  };

  const savePalette = () => {
    const newPalette: Palette = {
      id: Date.now().toString(),
      bgColor,
      textColor,
      createdAt: Date.now(),
    };
    const updated = [newPalette, ...savedPalettes];
    setSavedPalettes(updated);
    localStorage.setItem('iroCheckPalettes', JSON.stringify(updated));
  };

  const deletePalette = (id: string) => {
    const updated = savedPalettes.filter((p) => p.id !== id);
    setSavedPalettes(updated);
    localStorage.setItem('iroCheckPalettes', JSON.stringify(updated));
  };

  const loadPalette = (p: Palette) => {
    setBgColor(p.bgColor);
    setTextColor(p.textColor);
    calculateContrast(p.bgColor, p.textColor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowSuggestions(null);
    setOriginalColors(null);
  };

  const updateSuggestions = (mode: 'text' | 'bg' | 'both', bg: string, text: string) => {
      let sugs: Suggestion[] = [];
      if (mode === 'text') {
        sugs = generateSingleSuggestions('text', text, bg);
      } else if (mode === 'bg') {
        sugs = generateSingleSuggestions('bg', bg, text);
      } else {
        sugs = generatePairSuggestions(bg, text);
      }
      setCurrentSuggestions(sugs);
  };

  const toggleSuggestions = (mode: 'text' | 'bg' | 'both') => {
    if (showSuggestions === mode) {
        setShowSuggestions(null);
        handleCancelPreview(); // Ensure we reset if closing
    } else {
        // If switching modes, ensure we reset any active preview first
        if (originalColors) handleCancelPreview();
        
        setShowSuggestions(mode);
        updateSuggestions(mode, bgColor, textColor);
    }
  };

  const handlePreviewSuggestion = (newBg: string, newText: string) => {
      // 1. Store original colors if not already stored
      if (!originalColors) {
          setOriginalColors({ bg: bgColor, text: textColor });
      }
      // 2. Apply temporarily
      setBgColor(newBg);
      setTextColor(newText);
      calculateContrast(newBg, newText);
  };

  const handleConfirmPreview = () => {
      // Commit changes: just clear the 'original' memory
      setOriginalColors(null);
      setShowSuggestions(null); // Close panel on success
  };

  const handleCancelPreview = () => {
      // Revert changes
      if (originalColors) {
          setBgColor(originalColors.bg);
          setTextColor(originalColors.text);
          calculateContrast(originalColors.bg, originalColors.text);
          setOriginalColors(null);
      }
  };

  const closeSuggestions = () => {
      handleCancelPreview();
      setShowSuggestions(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {isTutorialActive && (
        <Tutorial 
          isActive={isTutorialActive}
          steps={TUTORIAL_STEPS}
          onComplete={finishTutorial}
          onSkip={finishTutorial}
        />
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Nav */}
        <div className="mb-6 flex items-center justify-between">
            <a
              href="https://noads-webtools.com/tool.html"
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm"
            >
                <ArrowLeft size={18} />
                ツール一覧に戻る
            </a>
            <button 
                onClick={startTutorial}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-bold px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
            >
                <HelpCircle size={16} />
                使い方
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls & Score */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Controls Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">カラーパレット作成</h2>
                <button 
                  onClick={swapColors}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                  title="色を入れ替え"
                >
                  <ArrowRightLeft size={18} />
                </button>
              </div>

              {/* Added ID for Tutorial Step 1 */}
              <div className="space-y-6" id="tutorial-color-pickers">
                <ColorPicker 
                  id="bg-picker" 
                  label="背景色 (Background)" 
                  color={bgColor} 
                  onChange={handleBgChange} 
                />
                
                <ColorPicker 
                  id="text-picker" 
                  label="文字色 (Text)" 
                  color={textColor} 
                  onChange={handleTextChange} 
                />
              </div>

              <div className="mt-8 space-y-3">
                 {/* Added ID for Tutorial Step 4 */}
                 <button 
                  id="tutorial-save-button"
                  onClick={savePalette}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors font-bold text-sm shadow-sm"
                 >
                   <Save size={16} />
                   組み合わせを保存
                 </button>
                 
                 {/* Auto Fix Actions - Always Visible */}
                 <div className="pt-2">
                   <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">自動調整 (Hue/Sat維持)</p>
                   {/* Added ID for Tutorial Step 3 */}
                   <div className="grid grid-cols-3 gap-2" id="tutorial-auto-adjust">
                     <button 
                      onClick={() => toggleSuggestions('text')}
                      className={`flex flex-col items-center justify-center gap-1 border px-2 py-2 rounded-lg transition-colors font-medium text-[10px] sm:text-xs h-16
                        ${showSuggestions === 'text' 
                            ? 'bg-blue-100 border-blue-300 text-blue-800' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'}`}
                     >
                       <Sparkles size={16} />
                       文字を調整
                     </button>
                     <button 
                      onClick={() => toggleSuggestions('bg')}
                      className={`flex flex-col items-center justify-center gap-1 border px-2 py-2 rounded-lg transition-colors font-medium text-[10px] sm:text-xs h-16
                        ${showSuggestions === 'bg' 
                            ? 'bg-blue-100 border-blue-300 text-blue-800' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'}`}
                     >
                       <PaletteIcon size={16} />
                       背景を調整
                     </button>
                     <button 
                      onClick={() => toggleSuggestions('both')}
                      className={`flex flex-col items-center justify-center gap-1 border px-2 py-2 rounded-lg transition-colors font-medium text-[10px] sm:text-xs h-16
                        ${showSuggestions === 'both' 
                            ? 'bg-blue-100 border-blue-300 text-blue-800' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'}`}
                     >
                       <SlidersHorizontal size={16} />
                       両方を調整
                     </button>
                   </div>
                 </div>
                 
                 {/* Suggestions Panel */}
                 {showSuggestions && (
                     <div className="relative">
                         <div className="absolute top-[-10px] right-0 z-10">
                            <button onClick={closeSuggestions} className="p-1.5 bg-white rounded-full border border-slate-200 shadow-sm text-slate-400 hover:text-slate-600">
                                <X size={14} />
                            </button>
                         </div>
                         <SuggestionPanel 
                            suggestions={currentSuggestions} 
                            onPreview={handlePreviewSuggestion} 
                            onConfirm={handleConfirmPreview}
                            onCancel={handleCancelPreview}
                            isPreviewing={!!originalColors}
                         />
                     </div>
                 )}
              </div>
            </div>

            {/* Score Card - Added ID wrapper for Tutorial Step 2 */}
            <div id="tutorial-contrast-score">
                <ContrastScore result={result} />
            </div>
            
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-7 space-y-8">
            <PreviewSimulator bgColor={bgColor} textColor={textColor} />
            
            <div className="border-t border-slate-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-bold text-slate-800">保存したパレット</h2>
                 <span className="text-sm text-slate-500">{savedPalettes.length} 件</span>
              </div>
              <SavedList 
                palettes={savedPalettes} 
                onLoad={loadPalette} 
                onDelete={deletePalette} 
              />
            </div>
          </div>
          
        </div>

      </main>
    </div>
  );
}

export default App;