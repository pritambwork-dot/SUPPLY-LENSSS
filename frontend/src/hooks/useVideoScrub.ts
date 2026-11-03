"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import * as MP4BoxModule from 'mp4box';
import type { MP4Track, MP4Info, MP4Sample } from 'mp4box';

const MP4Box = (MP4BoxModule as any).createFile ? MP4BoxModule : ((MP4BoxModule as any).default || MP4BoxModule);

const LERP_TAU = 8;
const SNAP = 0.002;
const LRU_MAX = 24;
const LEAD = 24;
const WATCHDOG = 60000; // 60s

export interface VideoScrubState {
  scrollProgress: number;
  canvasLive: boolean;
  current: number;
  target: number;
  ready: boolean;
  building: boolean;
  reverted: boolean;
  duration: number;
}

export function useVideoScrub(
  videoSrc: string,
  containerRef: React.RefObject<HTMLElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  videoRef: React.RefObject<HTMLVideoElement>
): VideoScrubState {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canvasLive, setCanvasLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [building, setBuilding] = useState(false);
  const [reverted, setReverted] = useState(false);
  const [duration, setDuration] = useState(0);

  const bankRef = useRef<{ ts: number; blob: Blob }[]>([]);
  const lruRef = useRef<Map<number, ImageBitmap>>(new Map());
  const currentRef = useRef(0);
  const targetRef = useRef(0);
  const durRef = useRef(0);
  const readyRef = useRef(false);
  const revertedRef = useRef(false);
  const paintedRef = useRef(false);
  const buildingRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);
  const prefersReducedMotionRef = useRef(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Compute scroll progress
  const getProgress = useCallback(() => {
    if (typeof window === 'undefined' || !containerRef.current) return 0;
    const container = containerRef.current;
    const scrollSpan = container.offsetHeight - window.innerHeight;
    if (scrollSpan <= 0) return 0;
    return Math.min(1, Math.max(0, window.scrollY / scrollSpan));
  }, [containerRef]);

  // Handle resize and orientationchange
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResizeOrOrientation = () => {
      const p = getProgress();
      setScrollProgress(p);
    };
    window.addEventListener('resize', onResizeOrOrientation);
    window.addEventListener('orientationchange', onResizeOrOrientation);
    return () => {
      window.removeEventListener('resize', onResizeOrOrientation);
      window.removeEventListener('orientationchange', onResizeOrOrientation);
    };
  }, [getProgress]);

  // Video metadata & duration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        durRef.current = video.duration;
        setDuration(video.duration);
      }
    };

    if (video.readyState >= 1 && video.duration && !isNaN(video.duration)) {
      handleLoadedMetadata();
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [videoRef]);

  // LRU Bitmap helper
  const getBitmap = useCallback(async (idx: number): Promise<ImageBitmap | null> => {
    if (idx < 0 || idx >= bankRef.current.length) return null;
    const lru = lruRef.current;
    const cached = lru.get(idx);
    if (cached) {
      // Re-insert to mark as recently used
      lru.delete(idx);
      lru.set(idx, cached);
      return cached;
    }

    const item = bankRef.current[idx];
    if (!item) return null;

    try {
      const bitmap = await createImageBitmap(item.blob);
      if (lru.size >= LRU_MAX) {
        const oldest = lru.keys().next().value;
        if (oldest !== undefined) {
          const oldBitmap = lru.get(oldest);
          oldBitmap?.close();
          lru.delete(oldest);
        }
      }
      lru.set(idx, bitmap);
      return bitmap;
    } catch {
      return null;
    }
  }, []);

  // Warm adjacent frames
  const warmLRU = useCallback((centerIdx: number) => {
    for (let offset = -1; offset <= 2; offset++) {
      const idx = centerIdx + offset;
      if (idx >= 0 && idx < bankRef.current.length && !lruRef.current.has(idx)) {
        getBitmap(idx);
      }
    }
  }, [getBitmap]);

  // Binary search nearest timestamp in microseconds
  const findNearestIndex = useCallback((targetMicroseconds: number): number => {
    const bank = bankRef.current;
    if (bank.length === 0) return -1;
    let low = 0;
    let high = bank.length - 1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      if (bank[mid].ts === targetMicroseconds) return mid;
      if (bank[mid].ts < targetMicroseconds) low = mid + 1;
      else high = mid - 1;
    }

    const i1 = Math.max(0, Math.min(bank.length - 1, low));
    const i2 = Math.max(0, Math.min(bank.length - 1, high));
    return Math.abs(bank[i1].ts - targetMicroseconds) < Math.abs(bank[i2].ts - targetMicroseconds)
      ? i1
      : i2;
  }, []);

  // Frame Bank Building (WebCodecs + MP4Box)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isCancelled = false;
    let decoder: VideoDecoder | null = null;
    let watchdogTimer: ReturnType<typeof setTimeout> | null = null;

    const startBuilding = async () => {
      if (prefersReducedMotionRef.current || typeof VideoDecoder === 'undefined') {
        revertedRef.current = true;
        setReverted(true);
        return;
      }

      buildingRef.current = true;
      setBuilding(true);

      // 60-second watchdog
      watchdogTimer = setTimeout(() => {
        if (!readyRef.current && !paintedRef.current) {
          console.warn('[useVideoScrub] 60s watchdog fired, reverting to video seeking fallback');
          revertedRef.current = true;
          setReverted(true);
          setCanvasLive(false);
        }
      }, WATCHDOG);

      try {
        const response = await fetch(videoSrc);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const buffer = await response.arrayBuffer();
        if (isCancelled) return;

        const mp4boxfile = MP4Box.createFile();
        let videoTrack: MP4Track | null = null;
        const tempBank: { ts: number; blob: Blob }[] = [];
        let processedCount = 0;
        let sentCount = 0;

        // Offscreen canvas for frame-to-webp conversion
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 1920;
        offCanvas.height = 1080;
        const offCtx = offCanvas.getContext('2d');

        const initDecoder = async (hardwarePreference: HardwareAcceleration): Promise<VideoDecoder> => {
          return new Promise<VideoDecoder>((resolve, reject) => {
            let resolved = false;
            const dec = new VideoDecoder({
              output: async (frame: VideoFrame) => {
                try {
                  const ts = frame.timestamp;
                  if (offCtx) {
                    offCtx.drawImage(frame, 0, 0, 1920, 1080);
                    frame.close();
                    offCanvas.toBlob(
                      (blob) => {
                        if (blob) {
                          tempBank.push({ ts, blob });
                        }
                        processedCount++;
                      },
                      'image/webp',
                      0.82
                    );
                  } else {
                    frame.close();
                    processedCount++;
                  }
                } catch {
                  frame.close();
                  processedCount++;
                }
              },
              error: (e) => {
                console.error('[useVideoScrub] Decoder error:', e);
                if (!resolved) {
                  reject(e);
                }
              },
            });

            if (!videoTrack) {
              reject(new Error('No video track available'));
              return;
            }

            // Extract description box if present (avcC, hvcC, vpcC, av1C)
            let description: Uint8Array | undefined = undefined;
            const entry = videoTrack.mdia?.minf?.stbl?.stsd?.entries?.[0];
            if (entry) {
              const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
              if (box) {
                const stream = new MP4Box.DataStream(undefined, 0, MP4Box.DataStream.BIG_ENDIAN);
                box.write(stream);
                description = new Uint8Array(stream.buffer, 8);
              }
            }

            const config: VideoDecoderConfig = {
              codec: videoTrack.codec,
              codedWidth: videoTrack.track_width || 1920,
              codedHeight: videoTrack.track_height || 1080,
              hardwareAcceleration: hardwarePreference,
            };
            if (description) {
              config.description = description;
            }

            try {
              dec.configure(config);
              resolved = true;
              resolve(dec);
            } catch (err) {
              reject(err);
            }
          });
        };

        mp4boxfile.onReady = async (info: MP4Info) => {
          if (isCancelled) return;
          videoTrack = info.videoTracks[0] || null;
          if (!videoTrack) {
            revertedRef.current = true;
            setReverted(true);
            return;
          }

          if (videoTrack.duration && videoTrack.timescale && durRef.current === 0) {
            const trackDur = videoTrack.duration / videoTrack.timescale;
            durRef.current = trackDur;
            setDuration(trackDur);
          }

          // Try hardware decode first, fallback to software
          try {
            decoder = await initDecoder('prefer-hardware');
          } catch (hwErr) {
            console.warn('[useVideoScrub] Hardware decode failed, retrying with prefer-software:', hwErr);
            try {
              decoder = await initDecoder('prefer-software');
            } catch (swErr) {
              console.error('[useVideoScrub] Software decode also failed:', swErr);
              revertedRef.current = true;
              setReverted(true);
              return;
            }
          }

          // Extract samples
          const trackTimescale = videoTrack.timescale || 1000;
          mp4boxfile.onSamples = async (_id: number, _user: any, samples: MP4Sample[]) => {
            if (isCancelled || !decoder) return;

            for (const sample of samples) {
              if (isCancelled) return;

              // Throttle with LEAD so decode doesn't outrun blob encoding
              while (sentCount - processedCount > LEAD) {
                await new Promise((r) => setTimeout(r, 10));
              }

              const chunk = new EncodedVideoChunk({
                type: sample.is_sync ? 'key' : 'delta',
                timestamp: (sample.cts * 1e6) / trackTimescale,
                duration: (sample.duration * 1e6) / trackTimescale,
                data: sample.data,
              });

              decoder.decode(chunk);
              sentCount++;
            }
          };

          mp4boxfile.setExtractionOptions(videoTrack.id, null, { nbSamples: 1000 });
          mp4boxfile.start();

          // Wait for all samples to process
          const checkCompletion = setInterval(async () => {
            if (isCancelled) {
              clearInterval(checkCompletion);
              return;
            }

            if (sentCount > 0 && processedCount >= sentCount) {
              clearInterval(checkCompletion);
              try {
                if (decoder && decoder.state === 'configured') {
                  await decoder.flush();
                }
              } catch (e) {
                console.warn('[useVideoScrub] Flush warning:', e);
              }

              // Sort bank by ts
              tempBank.sort((a, b) => a.ts - b.ts);
              bankRef.current = tempBank;

              readyRef.current = true;
              setReady(true);
              buildingRef.current = false;
              setBuilding(false);

              if (watchdogTimer) clearTimeout(watchdogTimer);
            }
          }, 50);
        };

        // Append file buffer to MP4Box
        const fileBuffer = buffer as ArrayBuffer & { fileStart?: number };
        fileBuffer.fileStart = 0;
        mp4boxfile.appendBuffer(fileBuffer);
        mp4boxfile.flush();
      } catch (err) {
        console.warn('[useVideoScrub] Frame bank build failed or aborted:', err);
        revertedRef.current = true;
        setReverted(true);
        buildingRef.current = false;
        setBuilding(false);
      }
    };

    if (document.readyState === 'complete') {
      startBuilding();
    } else {
      window.addEventListener('load', startBuilding, { once: true });
    }

    return () => {
      isCancelled = true;
      if (watchdogTimer) clearTimeout(watchdogTimer);
      if (decoder && decoder.state !== 'closed') {
        try {
          decoder.close();
        } catch {
          // ignore
        }
      }
    };
  }, [videoSrc]);

  // Main rAF loop
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const deltaSeconds = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const dt = Math.min(0.1, deltaSeconds);
      const p = getProgress();
      setScrollProgress(p);

      const dur = durRef.current;
      if (dur > 0) {
        const target = p * dur;
        targetRef.current = target;

        if (prefersReducedMotionRef.current) {
          currentRef.current = target;
        } else {
          currentRef.current += (target - currentRef.current) * (1 - Math.exp(-dt * LERP_TAU));
          if (Math.abs(target - currentRef.current) < SNAP) {
            currentRef.current = target;
          }
        }

        const current = currentRef.current;

        // If frame bank is ready, paint frame from bank
        if (readyRef.current && bankRef.current.length > 0 && canvasRef.current) {
          const nearestIdx = findNearestIndex(current * 1e6);
          if (nearestIdx >= 0) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const bitmap = lruRef.current.get(nearestIdx);

            if (bitmap && ctx) {
              ctx.drawImage(bitmap, 0, 0, 1920, 1080);
              if (!paintedRef.current) {
                paintedRef.current = true;
                setCanvasLive(true);
              }
            } else {
              // Async load into LRU
              getBitmap(nearestIdx).then((loadedBitmap) => {
                if (loadedBitmap && canvasRef.current) {
                  const currentCtx = canvasRef.current.getContext('2d');
                  currentCtx?.drawImage(loadedBitmap, 0, 0, 1920, 1080);
                  if (!paintedRef.current) {
                    paintedRef.current = true;
                    setCanvasLive(true);
                  }
                }
              });
            }

            warmLRU(nearestIdx);
          }
        } else {
          // Fallback: video.currentTime scrubbing
          const video = videoRef.current;
          if (video && !video.seeking && Math.abs(video.currentTime - current) > 0.01) {
            video.currentTime = current;
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [canvasRef, videoRef, getProgress, findNearestIndex, getBitmap, warmLRU]);

  return {
    scrollProgress,
    canvasLive,
    current: currentRef.current,
    target: targetRef.current,
    ready,
    building,
    reverted,
    duration,
  };
}
