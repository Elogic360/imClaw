/**
 * imClaw Event Bus — Reactive Multi-Agent Event Distribution
 * Distributes system, agent, market, and workflow events across components.
 */

export type ImClawEventType =
  | "agent.lifecycle_changed"
  | "market.tick"
  | "market.structure_break"
  | "trade.proposed"
  | "trade.risk_approved"
  | "trade.risk_rejected"
  | "trade.filled"
  | "workflow.triggered"
  | "workflow.completed";

export interface ImClawEvent<T = unknown> {
  eventId: string;
  type: ImClawEventType;
  source: string;
  timestamp: number;
  payload: T;
}

export type EventHandler<T = unknown> = (event: ImClawEvent<T>) => Promise<void> | void;

export class ImClawEventBus {
  private handlers: Map<ImClawEventType, Set<EventHandler>> = new Map();

  public subscribe<T>(type: ImClawEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    const set = this.handlers.get(type)!;
    set.add(handler as EventHandler);

    return () => {
      set.delete(handler as EventHandler);
    };
  }

  public async emit<T>(type: ImClawEventType, source: string, payload: T): Promise<ImClawEvent<T>> {
    const event: ImClawEvent<T> = {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      source,
      timestamp: Date.now(),
      payload,
    };

    const subscribers = this.handlers.get(type);
    if (subscribers) {
      for (const handler of subscribers) {
        try {
          await handler(event);
        } catch (err) {
          console.error(`Error in event handler for ${type}:`, err);
        }
      }
    }

    return event;
  }
}
