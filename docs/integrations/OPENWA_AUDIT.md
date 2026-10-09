# OpenWA Architecture & API Audit

**Target Service**: `OpenWA Gateway v0.24.0`  
**Deployment**: Rootless Podman Compose (`docker-compose.dev.yml`)  
**Container**: `openwa-api` on `127.0.0.1:2785`  
**Database**: SQLite (`dataDatabase` & `mainDatabase`)  
**Status**: UP & HEALTHY (`/api/health/ready` returns status: `ok`)

---

## 1. Verified Endpoints

- **Web Dashboard**: [http://127.0.0.1:2785](http://127.0.0.1:2785)
- **API Root**: [http://127.0.0.1:2785/api](http://127.0.0.1:2785/api)
- **Swagger Documentation**: [http://127.0.0.1:2785/api/docs](http://127.0.0.1:2785/api/docs)
- **Readiness Health Check**: [http://127.0.0.1:2785/api/health/ready](http://127.0.0.1:2785/api/health/ready)

---

## 2. Security & Credentials Model

- **Bootstrap API Key**: Automatically provisioned by `AuthService` and stored in `/app/data/.api-key`.
- **RBAC Policy**: Admin keys must remain strictly in infrastructure. Individual agents (`WhatsAppSignalAgent`, `WhatsAppSalesAgent`) receive scoped session access tokens rather than master privileges.
- **Rootless Podman Security**: SELinux volume relabeling `:Z,U` applied to `./data:/app/data` to guarantee non-root `openwa:openwa` UID (997) file permissions.

---

## 3. Supported WhatsApp Capabilities in OpenWA

1. **Multi-Session Engine**: Supports WhatsApp-Web.js and Baileys engines concurrently.
2. **Messages**: Text, media, audio transcoding (ffmpeg), location, documents, buttons.
3. **Groups**: Group creation, member additions/removals, participant promotion/demotion, metadata management.
4. **Channels / Newsletters**: WhatsApp Channels support with link preview and updates.
5. **Webhooks**: Event dispatching with signature verification and retry backoff.
