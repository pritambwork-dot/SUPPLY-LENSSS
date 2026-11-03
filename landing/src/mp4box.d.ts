declare module 'mp4box' {
  export interface MP4Track {
    id: number;
    created: Date;
    modified: Date;
    volume: number;
    track_width: number;
    track_height: number;
    timescale: number;
    duration: number;
    bitrate: number;
    codec: string;
    language: string;
    nb_samples: number;
    mdia?: {
      minf?: {
        stbl?: {
          stsd?: {
            entries?: Array<{
              avcC?: {
                write: (stream: DataStream) => void;
              };
              hvcC?: {
                write: (stream: DataStream) => void;
              };
              vpcC?: {
                write: (stream: DataStream) => void;
              };
              av1C?: {
                write: (stream: DataStream) => void;
              };
            }>;
          };
        };
      };
    };
  }

  export interface MP4Info {
    duration: number;
    timescale: number;
    isFragmented: boolean;
    isProgressive: boolean;
    hasMoov: boolean;
    tracks: MP4Track[];
    videoTracks: MP4Track[];
    audioTracks: MP4Track[];
  }

  export interface MP4Sample {
    track_id: number;
    description: any;
    is_rap: boolean;
    is_sync: boolean;
    pts: number;
    dts: number;
    duration: number;
    cts: number;
    size: number;
    data: Uint8Array;
    alreadyRead?: number;
  }

  export interface MP4ExtractionOptions {
    nbSamples?: number;
    rapAlignement?: boolean;
  }

  export class DataStream {
    static readonly BIG_ENDIAN: boolean;
    static readonly LITTLE_ENDIAN: boolean;
    buffer: ArrayBuffer;
    position: number;
    constructor(buffer?: ArrayBuffer, byteOffset?: number, endianness?: boolean);
    writeUint8(value: number): void;
    writeUint16(value: number): void;
    writeUint32(value: number): void;
    writeUint8Array(array: Uint8Array): void;
  }

  export interface MP4File {
    onReady?: (info: MP4Info) => void;
    onError?: (e: string) => void;
    onSamples?: (id: number, user: any, samples: MP4Sample[]) => void;
    appendBuffer(data: ArrayBuffer & { fileStart?: number }): number;
    setExtractionOptions(id: number, user?: any, options?: MP4ExtractionOptions): void;
    start(): void;
    stop(): void;
    flush(): void;
    seek(time: number, useRAP?: boolean): { offset: number; time: number };
    getTrackById(id: number): MP4Track | undefined;
  }

  export function createFile(): MP4File;

  export namespace MP4Box {
    export type { MP4Track, MP4Info, MP4Sample, MP4ExtractionOptions, MP4File, DataStream };
  }

  const mp4box: {
    createFile: () => MP4File;
    DataStream: typeof DataStream;
  };

  export default mp4box;
}
