import type { IncomingMessage, ServerResponse } from "node:http";
import { CompanyRegistry } from "../imclaw/organization/company-registry.js";
import { CompanySimulationOrchestrator } from "../imclaw/organization/company-simulation.js";
import type {
  SpecialistAgent,
  DepartmentConfig,
} from "../imclaw/organization/organization-types.js";
import { TaskRouter } from "../imclaw/organization/task-router.js";

const sharedRegistry = new CompanyRegistry();
const sharedRouter = new TaskRouter(sharedRegistry);
const sharedOrchestrator = new CompanySimulationOrchestrator();

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-cache",
  });
  res.end(json);
}

function renderHtml(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | imClaw Agents Office</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --text-bright: #f0f6fc;
      --accent: #58a6ff;
      --success: #3fb950;
      --warning: #d29922;
      --purple: #bc8cff;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    h1 {
      color: var(--text-bright);
      margin: 0;
      font-size: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      background: rgba(88, 166, 255, 0.15);
      color: var(--accent);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid rgba(88, 166, 255, 0.3);
    }
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-bright);
    }
    .stat-label {
      font-size: 13px;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dept-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }
    .dept-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .dept-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }
    .dept-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-bright);
    }
    .lead-badge {
      background: rgba(188, 140, 255, 0.15);
      color: var(--purple);
      border: 1px solid rgba(188, 140, 255, 0.3);
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .specialist-list {
      list-style: none;
      padding: 0;
      margin: 12px 0 0 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .specialist-item {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .specialist-name {
      font-weight: 500;
      color: var(--text-bright);
    }
    .specialist-role {
      color: #8b949e;
      font-size: 12px;
    }
    .nav-links {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .nav-link {
      color: var(--accent);
      text-decoration: none;
      font-size: 14px;
    }
    .nav-link:hover {
      text-decoration: underline;
    }
    .interactive-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      margin-top: 24px;
    }
    .input-box {
      width: 100%;
      box-sizing: border-box;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text-bright);
      padding: 10px;
      border-radius: 6px;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .btn {
      background: #238636;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn:hover {
      background: #2ea043;
    }
    pre {
      background: #090d13;
      border: 1px solid var(--border);
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      overflow-x: auto;
      color: #7ee787;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>🏢 imClaw Agents Office <span class="badge">Autonomous Organization</span></h1>
        <p style="margin: 4px 0 0 0; color: #8b949e; font-size: 14px;">
          Clean-Room Multi-Department Operating Platform & 35-Specialist Intelligence System
        </p>
      </div>
      <div class="nav-links">
        <a class="nav-link" href="/api/imclaw/departments">Departments API (JSON)</a>
        <a class="nav-link" href="/api/imclaw/agents">Agents API (JSON)</a>
        <a class="nav-link" href="/">Back to Control UI</a>
      </div>
    </header>
    ${bodyContent}
  </div>
</body>
</html>`;
}

/**
 * Handle incoming imClaw Organization HTTP requests.
 * Routes:
 * - GET /imclaw/office -> Visual HTML Dashboard of 7 departments and 35 agents
 * - GET /api/imclaw/departments -> JSON list of 7 departments + details
 * - GET /api/imclaw/agents -> JSON list of 35 specialist agents
 * - POST /api/imclaw/route -> Routes a prompt to department and specialists
 * - POST /api/imclaw/simulate -> Runs live multi-department autonomous simulation
 */
export async function handleImclawOrganizationHttpRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://localhost");
  const pathname = url.pathname;

  if (!pathname.startsWith("/imclaw/office") && !pathname.startsWith("/api/imclaw/")) {
    return false;
  }

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return true;
  }

  // Visual Dashboard Route
  if (pathname === "/imclaw/office" && req.method === "GET") {
    const departments = sharedRegistry.getAllDepartments();
    const agents = sharedRegistry.getAllAgents();

    let deptHtml = "";
    for (const d of departments) {
      const specialists = sharedRegistry.getDepartmentAgents(d.id);
      const specialistRows = specialists
        .map(
          (s: SpecialistAgent) => `
        <li class="specialist-item">
          <div>
            <span class="specialist-name">${s.name}</span>
            <div class="specialist-role">${s.role}</div>
          </div>
          <span style="color:#58a6ff; font-family:monospace; font-size:11px;">${s.id}</span>
        </li>`,
        )
        .join("");

      deptHtml += `
      <div class="dept-card">
        <div class="dept-header">
          <div class="dept-title">${d.name}</div>
          <span class="lead-badge">Lead: ${d.leadId}</span>
        </div>
        <p style="font-size: 13px; color: #8b949e; margin: 0 0 10px 0;">${d.description}</p>
        <div style="font-size: 12px; font-weight: 600; color: #8b949e; text-transform: uppercase;">
          Specialist Desks (${specialists.length})
        </div>
        <ul class="specialist-list">
          ${specialistRows}
        </ul>
      </div>`;
    }

    const bodyContent = `
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-value" style="color: #58a6ff;">${departments.length}</div>
        <div class="stat-label">Active Departments</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #3fb950;">${agents.length}</div>
        <div class="stat-label">Specialist Agents</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #bc8cff;">Concurrent</div>
        <div class="stat-label">Team Execution Engine</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #d29922;">Active</div>
        <div class="stat-label">Feedback Revision Guard</div>
      </div>
    </div>

    <div class="dept-grid">
      ${deptHtml}
    </div>

    <div class="interactive-card">
      <h3 style="margin-top:0; color:var(--text-bright);">⚡ Test Real-Time Team Routing</h3>
      <p style="font-size:13px; color:#8b949e;">
        Enter any task prompt below to see the imClaw Task Router assign it to the proper department lead and specialist desks.
      </p>
      <input id="promptInput" class="input-box" type="text" value="Run email marketing outreach campaign and draft newsletter" placeholder="Enter task prompt..." />
      <button class="btn" onclick="runRoute()">Test Routing</button>
      <div id="routeResult" style="margin-top:12px; display:none;">
        <pre id="routeOutput"></pre>
      </div>
      <script>
        async function runRoute() {
          const prompt = document.getElementById('promptInput').value;
          const res = await fetch('/api/imclaw/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
          });
          const data = await res.json();
          document.getElementById('routeResult').style.display = 'block';
          document.getElementById('routeOutput').innerText = JSON.stringify(data, null, 2);
        }
      </script>
    </div>
    `;

    const html = renderHtml("Office Dashboard", bodyContent);
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    });
    res.end(html);
    return true;
  }

  // GET /api/imclaw/departments
  if (pathname === "/api/imclaw/departments" && req.method === "GET") {
    const departments = sharedRegistry.getAllDepartments().map((dept: DepartmentConfig) => ({
      ...dept,
      specialists: sharedRegistry.getDepartmentAgents(dept.id),
    }));
    sendJson(res, 200, { ok: true, count: departments.length, departments });
    return true;
  }

  // GET /api/imclaw/agents
  if (pathname === "/api/imclaw/agents" && req.method === "GET") {
    const agents = sharedRegistry.getAllAgents();
    sendJson(res, 200, { ok: true, count: agents.length, agents });
    return true;
  }

  // POST /api/imclaw/route
  if (pathname === "/api/imclaw/route" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body || "{}");
        const prompt = parsed.prompt || "";
        const route = sharedRouter.routeRequest(prompt);
        const department = sharedRegistry.getDepartment(route.departmentId);
        const specialists = sharedRegistry.getDepartmentAgents(route.departmentId);
        sendJson(res, 200, {
          ok: true,
          prompt,
          assignedDepartment: department,
          assignedSpecialists: specialists,
        });
      } catch (err: any) {
        sendJson(res, 400, { ok: false, error: err.message });
      }
    });
    return true;
  }

  // POST /api/imclaw/simulate
  if (pathname === "/api/imclaw/simulate" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const parsed = JSON.parse(body || "{}");
        const result = await sharedOrchestrator.executeCompanyTask(
          parsed.prompt || "Launch Q4 campaign and reconcile finances",
        );
        sendJson(res, 200, { ok: true, result });
      } catch (err: any) {
        sendJson(res, 500, { ok: false, error: err.message });
      }
    });
    return true;
  }

  return false;
}
