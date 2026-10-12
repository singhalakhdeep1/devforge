// Kafka producer for devforge

import { Kafka, Producer } from 'kafkajs';

class KafkaProducer {
  private producer: Producer;
  private kafka: Kafka;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'devforge-producer',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.producer = this.kafka.producer();
  }

  async connect() {
    await this.producer.connect();
  }

  async disconnect() {
    await this.producer.disconnect();
  }

  async sendMessage(topic: string, message: any, key?: string) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key,
            value: JSON.stringify(message),
          },
        ],
      });
      return { success: true, message: 'Message sent successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async sendBatch(topic: string, messages: any[]) {
    try {
      await this.producer.send({
        topic,
        messages: messages.map((msg) => ({
          value: JSON.stringify(msg),
        })),
      });
      return { success: true, message: 'Batch sent successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const kafkaProducer = new KafkaProducer();
