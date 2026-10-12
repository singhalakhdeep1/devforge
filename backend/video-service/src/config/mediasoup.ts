import * as mediasoup from 'mediasoup';
import { logger } from './logger';
import { types as mediasoupTypes } from 'mediasoup';

export interface WorkerConfig {
    logLevel: mediasoupTypes.WorkerLogLevel;
    logTags: mediasoupTypes.WorkerLogTag[];
    rtcMinPort: number;
    rtcMaxPort: number;
}

export interface RouterConfig {
    mediaCodecs: mediasoupTypes.RtpCodecCapability[];
}

export interface WebRtcServerConfig {
    listenInfos: mediasoupTypes.WebRtcServerListenInfo[];
}

export interface WebRtcTransportConfig {
    listenIps: mediasoupTypes.TransportListenIp[];
    enableUdp: boolean;
    enableTcp: boolean;
    preferUdp: boolean;
    initialAvailableOutgoingBitrate: number;
    maxIncomingBitrate: number;
}

// Worker configuration
export const workerConfig: WorkerConfig = {
    logLevel: 'warn',
    logTags: [
        'info',
        'ice',
        'dtls',
        'rtp',
        'srtp',
        'rtcp',
        'rtx',
        'bwe',
        'score',
        'simulcast',
        'svc',
        'sctp'
    ],
    rtcMinPort: parseInt(process.env.RTC_MIN_PORT || '40000'),
    rtcMaxPort: parseInt(process.env.RTC_MAX_PORT || '49999'),
};

// Router configuration
export const routerConfig: RouterConfig = {
    mediaCodecs: [
        {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2,
        },
        {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
            parameters: {
                'x-google-start-bitrate': 1000,
            },
        },
        {
            kind: 'video',
            mimeType: 'video/VP9',
            clockRate: 90000,
            parameters: {
                'profile-id': 2,
                'x-google-start-bitrate': 1000,
            },
        },
        {
            kind: 'video',
            mimeType: 'video/h264',
            clockRate: 90000,
            parameters: {
                'packetization-mode': 1,
                'profile-level-id': '4d0032',
                'level-asymmetry-allowed': 1,
                'x-google-start-bitrate': 1000,
            },
        },
        {
            kind: 'video',
            mimeType: 'video/h264',
            clockRate: 90000,
            parameters: {
                'packetization-mode': 1,
                'profile-level-id': '42e01f',
                'level-asymmetry-allowed': 1,
                'x-google-start-bitrate': 1000,
            },
        },
    ],
};

// WebRTC transport configuration
export const webRtcTransportConfig: WebRtcTransportConfig = {
    listenIps: [
        {
            ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
            announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP,
        },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: 1000000,
    maxIncomingBitrate: 1500000,
};

/**
 * Create mediasoup workers
 */
export async function createWorkers(numWorkers: number = 4) {
    const workers: mediasoupTypes.Worker[] = [];

    for (let i = 0; i < numWorkers; i++) {
        try {
            const worker = await mediasoup.createWorker({
                logLevel: workerConfig.logLevel,
                logTags: workerConfig.logTags,
                rtcMinPort: workerConfig.rtcMinPort,
                rtcMaxPort: workerConfig.rtcMaxPort,
            });

            worker.on('died', () => {
                logger.error(`Worker ${worker.pid} died, exiting in 2 seconds...`);
                setTimeout(() => process.exit(1), 2000);
            });

            workers.push(worker);
            logger.info(`Created worker ${worker.pid}`);
        } catch (error) {
            logger.error('Error creating worker:', error);
            throw error;
        }
    }

    return workers;
}

/**
 * Get next available worker (round-robin)
 */
export function getNextWorker(workers: mediasoupTypes.Worker[], currentIndex: number): {
    worker: mediasoupTypes.Worker;
    nextIndex: number;
} {
    const worker = workers[currentIndex];
    const nextIndex = (currentIndex + 1) % workers.length;
    return { worker, nextIndex };
}
