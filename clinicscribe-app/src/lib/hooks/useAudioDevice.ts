'use client';

import { useCallback, useEffect, useState } from 'react';

export type AudioDeviceType = 'bluetooth' | 'builtin' | 'usb' | 'unknown';

interface AudioDevice {
  label: string;
  type: AudioDeviceType;
  shortLabel: string;
}

function classifyDevice(label: string): AudioDeviceType {
  const lower = label.toLowerCase();
  if (
    lower.includes('airpods') ||
    lower.includes('bluetooth') ||
    lower.includes('beats') ||
    lower.includes('bose') ||
    lower.includes('sony wh') ||
    lower.includes('sony wf') ||
    lower.includes('jabra') ||
    lower.includes('galaxy buds')
  ) {
    return 'bluetooth';
  }
  if (
    lower.includes('macbook') ||
    lower.includes('built-in') ||
    lower.includes('internal') ||
    lower.includes('default')
  ) {
    return 'builtin';
  }
  if (lower.includes('usb') || lower.includes('yeti') || lower.includes('blue ') || lower.includes('rode')) {
    return 'usb';
  }
  return 'unknown';
}

function shortenLabel(label: string): string {
  // "Ihtisham's AirPods Pro (Bluetooth)" -> "AirPods Pro"
  // "MacBook Pro Microphone" -> "MacBook Mic"
  const lower = label.toLowerCase();

  if (lower.includes('airpods pro')) return 'AirPods Pro';
  if (lower.includes('airpods max')) return 'AirPods Max';
  if (lower.includes('airpods')) return 'AirPods';

  if (lower.includes('macbook pro')) return 'MacBook Pro Mic';
  if (lower.includes('macbook air')) return 'MacBook Air Mic';
  if (lower.includes('macbook')) return 'MacBook Mic';

  if (lower.includes('imac')) return 'iMac Mic';
  if (lower.includes('built-in')) return 'Built-in Mic';

  // For other devices, truncate to first meaningful part
  const cleaned = label
    .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheticals
    .replace(/\s*microphone\s*/gi, ' Mic')
    .trim();

  return cleaned.length > 24 ? cleaned.substring(0, 22) + '…' : cleaned;
}

export function useAudioDevice() {
  const [device, setDevice] = useState<AudioDevice | null>(null);

  const detectFromStream = useCallback((stream: MediaStream) => {
    const track = stream.getAudioTracks()[0];
    if (!track) return;

    const label = track.label || 'Unknown';
    setDevice((prev) => {
      if (prev?.label === label) return prev;
      return { label, type: classifyDevice(label), shortLabel: shortenLabel(label) };
    });
  }, []);

  const detectDefault = useCallback(async () => {
    try {
      // Need permission to get device labels — request a temporary stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];
      const label = track?.label || 'Unknown';
      setDevice((prev) => {
        if (prev?.label === label) return prev;
        return { label, type: classifyDevice(label), shortLabel: shortenLabel(label) };
      });
      // Stop the temporary stream
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      // Permission denied or no mic
      setDevice(null);
    }
  }, []);

  const clear = useCallback(() => setDevice(null), []);

  // Listen for device changes (e.g. plugging in AirPods)
  useEffect(() => {
    const handler = () => {
      // If we already have a device detected, re-detect
      if (device) {
        detectDefault();
      }
    };
    navigator.mediaDevices?.addEventListener('devicechange', handler);
    return () => navigator.mediaDevices?.removeEventListener('devicechange', handler);
  }, [device, detectDefault]);

  return { device, detectFromStream, detectDefault, clear };
}
