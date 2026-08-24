import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({ 
    endpoint: process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces' 
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
