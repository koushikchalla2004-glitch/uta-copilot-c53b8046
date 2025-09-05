import { useCallback } from 'react';
import Sentiment from 'sentiment';

export type SentimentLabel = 'positive' | 'neutral' | 'negative';

// Create a single analyzer instance (lightweight)
const analyzer = new Sentiment();

export const useSentiment = () => {
  const analyze = useCallback((text: string) => {
    const result = analyzer.analyze(text || '');
    const label: SentimentLabel = result.score > 1 ? 'positive' : result.score < -1 ? 'negative' : 'neutral';
    return { ...result, label } as typeof result & { label: SentimentLabel };
  }, []);

  const labelFromScore = useCallback((score: number): SentimentLabel => {
    return score > 1 ? 'positive' : score < -1 ? 'negative' : 'neutral';
  }, []);

  const humanizeResponse = useCallback((text: string, userLabel: SentimentLabel) => {
    const safeText = (text || '').trim();
    if (!safeText) return safeText;

    const lower = safeText.toLowerCase();
    const startsFriendly =
      lower.startsWith('great') ||
      lower.startsWith('sure') ||
      lower.startsWith("i'm sorry") ||
      lower.startsWith('sorry') ||
      lower.startsWith('great question') ||
      lower.startsWith('here is') ||
      lower.startsWith("here's what i found");

    if (startsFriendly) return safeText; // avoid double prefix

    let prefix = '';
    if (userLabel === 'negative') {
      prefix = "Sorry — that's frustrating. ";
    } else if (userLabel === 'positive') {
      prefix = 'Great question — ';
    } else {
      prefix = '';
    }

    return `${prefix}${safeText}`;
  }, []);

  return { analyze, labelFromScore, humanizeResponse };
};