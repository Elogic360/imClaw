/**
 * imClaw Simulation / Paper Broker Adapter
 * Provides deterministic trade execution simulation for backtesting, strategy validation, and safe defaults.
 */

import crypto from "node:crypto";
import type { ExecutionMode } from "../risk/risk-types.js";
import type { BrokerAdapter, ExecutionOrder } from "./broker-adapter.js";

export class SimulationBrokerAdapter implements BrokerAdapter {
  public readonly brokerName = "imclaw-paper-broker";
  public readonly supportedMode: ExecutionMode = "SIMULATION";
  private connected = false;
  private orders: Map<string, ExecutionOrder> = new Map();

  public async connect(): Promise<boolean> {
    this.connected = true;
    return true;
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async submitOrder(order: ExecutionOrder): Promise<ExecutionOrder> {
    if (!this.connected) {
      throw new Error("Simulation broker is not connected");
    }

    const brokerOrderId = `sim-${crypto.randomUUID().slice(0, 8)}`;
    const filledOrder: ExecutionOrder = {
      ...order,
      status: "FILLED",
      brokerOrderId,
      fillPrice: order.entryPrice || 1.085, // Default realistic FX fill if market order
      filledAt: Date.now(),
    };

    this.orders.set(order.orderId, filledOrder);
    return filledOrder;
  }

  public async cancelOrder(orderId: string): Promise<boolean> {
    const existing = this.orders.get(orderId);
    if (!existing) return false;
    existing.status = "CANCELLED";
    return true;
  }

  public async modifyOrder(
    orderId: string,
    stopLoss?: number,
    takeProfit?: number,
  ): Promise<boolean> {
    const existing = this.orders.get(orderId);
    if (!existing) return false;
    if (stopLoss !== undefined) existing.stopLossPrice = stopLoss;
    if (takeProfit !== undefined) existing.takeProfitPrice = takeProfit;
    return true;
  }

  public async getOpenPositions(): Promise<
    Array<{ positionId: string; symbol: string; volumeLots: number }>
  > {
    const open: Array<{ positionId: string; symbol: string; volumeLots: number }> = [];
    for (const [id, ord] of this.orders.entries()) {
      if (ord.status === "FILLED") {
        open.push({ positionId: id, symbol: ord.symbol, volumeLots: ord.volumeLots });
      }
    }
    return open;
  }
}
