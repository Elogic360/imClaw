/**
 * imClaw Trading Engine — Broker Interfaces & Order Contracts
 */

import type { ExecutionMode, TradeDirection } from "../risk/risk-types.js";

export type OrderStatus =
  | "PENDING_RISK_CHECK"
  | "RISK_REJECTED"
  | "SUBMITTED"
  | "FILLED"
  | "PARTIALLY_FILLED"
  | "CANCELLED"
  | "REJECTED_BY_BROKER";

export interface ExecutionOrder {
  orderId: string;
  intentId: string;
  symbol: string;
  direction: TradeDirection;
  volumeLots: number;
  entryPrice?: number;
  stopLossPrice: number;
  takeProfitPrice?: number;
  status: OrderStatus;
  mode: ExecutionMode;
  brokerOrderId?: string;
  fillPrice?: number;
  filledAt?: number;
  rejectionReason?: string;
  createdAt: number;
}

export interface BrokerAdapter {
  readonly brokerName: string;
  readonly supportedMode: ExecutionMode;
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  submitOrder(order: ExecutionOrder): Promise<ExecutionOrder>;
  cancelOrder(orderId: string): Promise<boolean>;
  modifyOrder(orderId: string, stopLoss?: number, takeProfit?: number): Promise<boolean>;
  getOpenPositions(): Promise<Array<{ positionId: string; symbol: string; volumeLots: number }>>;
}
