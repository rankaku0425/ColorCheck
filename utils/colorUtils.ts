import { RGB, HSL, WCAGResult } from '../types';

// Convert Hex to RGB
export const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Convert RGB to Hex
export const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
};

// Convert RGB to HSL
export const rgbToHsl = (r: number, g: number, b: number): HSL => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

// Convert HSL to RGB
export const hslToRgb = (h: number, s: number, l: number): RGB => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// Calculate relative luminance
const getLuminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// Calculate contrast ratio
export const getContrastRatio = (hex1: string, hex2: string): WCAGResult => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) {
    return {
      ratio: 0,
      aaNormal: false,
      aaLarge: false,
      aaaNormal: false,
      aaaLarge: false,
    };
  }

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: Math.floor(ratio * 100) / 100,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
};

/**
 * Suggest a better color by adjusting lightness (L) only.
 */
export const suggestAccessibleColor = (
  toAdjustHex: string, 
  referenceHex: string, 
  targetRatio = 4.5
): string | null => {
  const adjRgb = hexToRgb(toAdjustHex);
  const refRgb = hexToRgb(referenceHex);
  if (!adjRgb || !refRgb) return null;

  const refL = getLuminance(refRgb.r, refRgb.g, refRgb.b);
  const adjHsl = rgbToHsl(adjRgb.r, adjRgb.g, adjRgb.b);
  const originalL = adjHsl.l;

  let bestHex: string | null = null;
  let minDiffFromOriginal = Infinity;

  // Search L from 0 to 100.
  for (let l = 0; l <= 100; l++) {
    const testRgb = hslToRgb(adjHsl.h, adjHsl.s, l);
    const testL = getLuminance(testRgb.r, testRgb.g, testRgb.b);
    
    const lighter = Math.max(testL, refL);
    const darker = Math.min(testL, refL);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    
    if (ratio >= targetRatio) {
      const diff = Math.abs(l - originalL);
      if (diff < minDiffFromOriginal) {
        minDiffFromOriginal = diff;
        bestHex = rgbToHex(testRgb.r, testRgb.g, testRgb.b);
      }
    }
  }

  return bestHex;
};

export interface Suggestion {
  label: string;
  textColor: string;
  bgColor: string;
  ratio: number;
  description: string;
}

/**
 * Generate suggestions for a single color adjustment (text or bg)
 */
export const generateSingleSuggestions = (
  mode: 'text' | 'bg',
  targetHex: string, // the color being adjusted
  referenceHex: string // the color staying fixed
): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const targetNorm = targetHex.toUpperCase();
  
  // Helper to create suggestion object
  const createSugg = (label: string, newHex: string, desc: string) => {
      const t = mode === 'text' ? newHex : referenceHex;
      const b = mode === 'bg' ? newHex : referenceHex;
      return {
          label,
          textColor: t,
          bgColor: b,
          ratio: getContrastRatio(t, b).ratio,
          description: desc
      };
  };

  // 1. Natural Fix (AA)
  const s1Hex = suggestAccessibleColor(targetHex, referenceHex, 4.5);
  // Check if result exists AND is different from original
  if (s1Hex && s1Hex !== targetNorm) {
    suggestions.push(createSugg("自然な調整 (AA)", s1Hex, "元の色味を最大限残しつつ、最低限の基準(4.5:1)をクリアします。"));
  }

  // 2. High Contrast (AAA)
  const s2Hex = suggestAccessibleColor(targetHex, referenceHex, 7.0);
  // Check if result exists, is different from s1, AND different from original
  if (s2Hex && s2Hex !== s1Hex && s2Hex !== targetNorm) {
    suggestions.push(createSugg("高コントラスト (AAA)", s2Hex, "より視認性の高いAAA基準(7.0:1)を目指した調整です。"));
  } else if (!s2Hex) {
    // Fallback to B/W if strict Hue AAA fails
    const white = "#FFFFFF";
    const black = "#000000";
    const ratioW = getContrastRatio(white, referenceHex).ratio;
    const ratioB = getContrastRatio(black, referenceHex).ratio;
    const bestBW = ratioW > ratioB ? white : black;
    
    // Check if unique AND different from original
    if ((!s1Hex || bestBW !== s1Hex) && bestBW !== targetNorm) {
        if (ratioW >= 7 || ratioB >= 7) {
             suggestions.push(createSugg("最大コントラスト (白/黒)", bestBW, "色味よりも読みやすさを最優先した調整です。"));
        }
    }
  }

  // 3. Clarity / Extreme
  const adjRgb = hexToRgb(targetHex);
  const refRgb = hexToRgb(referenceHex);
  if (adjRgb && refRgb) {
    const refL = getLuminance(refRgb.r, refRgb.g, refRgb.b);
    const adjHsl = rgbToHsl(adjRgb.r, adjRgb.g, adjRgb.b);
    const targetL = refL > 0.5 ? 5 : 95;
    const s3Rgb = hslToRgb(adjHsl.h, adjHsl.s, targetL);
    const s3Hex = rgbToHex(s3Rgb.r, s3Rgb.g, s3Rgb.b);
    
    // Check uniqueness
    const isDup = suggestions.some(s => (mode === 'text' ? s.textColor : s.bgColor) === s3Hex);
    // Check if different from original
    if (!isDup && s3Hex !== targetNorm) {
      const ratio = getContrastRatio(mode === 'text' ? s3Hex : referenceHex, mode === 'bg' ? s3Hex : referenceHex).ratio;
      if (ratio >= 4.5) {
         suggestions.push(createSugg("くっきり (明度優先)", s3Hex, "明度差を大きくつけて、文字をはっきり浮き立たせます。"));
      }
    }
  }
  
  return suggestions.slice(0, 3);
};

/**
 * Generate suggestions by adjusting BOTH colors
 */
export const generatePairSuggestions = (bg: string, text: string): Suggestion[] => {
    const suggestions: Suggestion[] = [];
    const bgNorm = bg.toUpperCase();
    const textNorm = text.toUpperCase();
    
    const bgRgb = hexToRgb(bg);
    const textRgb = hexToRgb(text);
    if (!bgRgb || !textRgb) return [];

    const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);
    const textHsl = rgbToHsl(textRgb.r, textRgb.g, textRgb.b);
    
    const bgL = bgHsl.l;
    const textL = textHsl.l;

    // Helper to clamp L
    const clamp = (v: number) => Math.max(0, Math.min(100, v));

    // Strategy 1: Expand symmetrically (Balanced)
    // Determine who goes up and who goes down
    // If bg is lighter, bg goes up, text goes down.
    const bgGoesUp = bgL >= textL;
    
    let bestPair: {b: string, t: string} | null = null;
    
    // Iterate strength of shift
    for (let i = 0; i <= 50; i++) {
        const newBgL = clamp(bgL + (bgGoesUp ? i : -i));
        const newTextL = clamp(textL + (bgGoesUp ? -i : i));
        
        const bRgb = hslToRgb(bgHsl.h, bgHsl.s, newBgL);
        const tRgb = hslToRgb(textHsl.h, textHsl.s, newTextL);
        
        const bHex = rgbToHex(bRgb.r, bRgb.g, bRgb.b);
        const tHex = rgbToHex(tRgb.r, tRgb.g, tRgb.b);
        
        const ratio = getContrastRatio(bHex, tHex).ratio;
        if (ratio >= 4.5) {
            bestPair = { b: bHex, t: tHex };
            break; // Found minimal sufficient shift
        }
    }

    if (bestPair) {
        // Check if different from original pair
        if (bestPair.b !== bgNorm || bestPair.t !== textNorm) {
            suggestions.push({
                label: "バランス調整 (両方変更)",
                bgColor: bestPair.b,
                textColor: bestPair.t,
                ratio: getContrastRatio(bestPair.b, bestPair.t).ratio,
                description: "両方の色の明度を少しずつ調整して、お互いの色味を保ちながらコントラストを確保します。"
            });
        }
    }

    // Strategy 2: High Contrast Pair (AAA)
    // Same logic but target 7.0
     let bestPairAAA: {b: string, t: string} | null = null;
     for (let i = 0; i <= 60; i++) {
        const newBgL = clamp(bgL + (bgGoesUp ? i : -i));
        const newTextL = clamp(textL + (bgGoesUp ? -i : i));
        
        const bRgb = hslToRgb(bgHsl.h, bgHsl.s, newBgL);
        const tRgb = hslToRgb(textHsl.h, textHsl.s, newTextL);
        
        const bHex = rgbToHex(bRgb.r, bRgb.g, bRgb.b);
        const tHex = rgbToHex(tRgb.r, tRgb.g, tRgb.b);
        
        const ratio = getContrastRatio(bHex, tHex).ratio;
        if (ratio >= 7.0) {
            bestPairAAA = { b: bHex, t: tHex };
            break; 
        }
    }

    if (bestPairAAA) {
        // Check uniqueness from previous suggestion
        const isDup = bestPair && (bestPair.b === bestPairAAA.b && bestPair.t === bestPairAAA.t);
        // Check difference from original
        const isOriginal = bestPairAAA.b === bgNorm && bestPairAAA.t === textNorm;

        if (!isDup && !isOriginal) {
            suggestions.push({
                label: "高コントラスト (両方変更)",
                bgColor: bestPairAAA.b,
                textColor: bestPairAAA.t,
                ratio: getContrastRatio(bestPairAAA.b, bestPairAAA.t).ratio,
                description: "AAA基準(7.0:1)を満たすように両方の色を大きく調整します。"
            });
        }
    }

    return suggestions;
}