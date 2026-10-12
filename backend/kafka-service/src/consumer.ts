// Kafka consumer for devforge

import { Kafka, Consumer, ConsumerRunConfig } from 'kafkajs';

class KafkaConsumer {
  private consumer: Consumer;
  private kafka: Kafka;

  constructor(groupId: string = 'devforge-consumer') {
    this.kafka = new Kafka({
      clientId: 'devforge-consumer',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.consumer = this.kafka.consumer({ groupId });
  }

  async connect() {
    await this.consumer.connect();
  }

  async disconnect() {
    await this.consumer.disconnect();
  }

  async subscribe(topics: string[]) {
    await this.consumer.subscribe({ topics, fromBeginning: false });
  }

  async run(config: ConsumerRunConfig) {
    await this.consumer.run(config);
  }

  async consumeEachMessage(callback: (message: any) => Promise<void>) {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = JSON.parse(message.value?.toString() || '{}');
          await callback({ topic, partition, message, value });
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });
  }

  async consumeEachBatch(callback: (batch: any) => Promise<void>) {
    await this.consumer.run({
      eachBatch: async ({ batch }) => {
        try {
          const messages = batch.messages.map((msg) => ({
            key: msg.key?.toString(),
            value: JSON.parse(msg.value?.toString() || '{}'),
            offset: msg.offset,
          }));
          await callback({ messages, topic: batch.topic, partition: batch.partition });
        } catch (error) {
          console.error('Error processing batch:', error);
        }
      },
    });
  }
}

export const kafkaConsumer = new KafkaConsumer();
