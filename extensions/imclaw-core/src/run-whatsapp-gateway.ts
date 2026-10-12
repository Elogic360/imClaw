/**
 * Standalone launcher for imClaw WhatsApp Gateway WebSocket Daemon
 */
import { WhatsAppGatewayService } from "./adapters/whatsapp/whatsapp-gateway.js";

async function main() {
  const gateway = new WhatsAppGatewayService({
    adminPhone: process.env.ADMIN_PHONE || "255733246558",
  });

  await gateway.start();
  console.log(
    "[imClaw WhatsApp Gateway] Real-time event listener running and subscribed to OpenWA!",
  );

  process.on("SIGINT", async () => {
    await gateway.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Failed to start WhatsApp Gateway:", err);
  process.exit(1);
});
