/**
 * imClaw Organization — Department Roster & Company Registry
 * Houses the 6 business departments and 35 specialist desks alongside the Trading department.
 */

import type {
  CompanyOrganization,
  DepartmentConfig,
  DepartmentId,
  SpecialistAgent,
} from "./organization-types.js";

export class CompanyRegistry {
  private organization: CompanyOrganization;

  constructor(companyName: string = "Integral Market Autonomous Systems") {
    this.organization = {
      name: companyName,
      departments: new Map(),
      agents: new Map(),
    };
    this.seedDepartments();
    this.seedSpecialistRoster();
  }

  public getDepartment(id: DepartmentId): DepartmentConfig | undefined {
    return this.organization.departments.get(id);
  }

  public getAgent(id: string): SpecialistAgent | undefined {
    return this.organization.agents.get(id);
  }

  public getDepartmentAgents(deptId: DepartmentId): SpecialistAgent[] {
    return Array.from(this.organization.agents.values()).filter((a) => a.departmentId === deptId);
  }

  public getAllDepartments(): DepartmentConfig[] {
    return Array.from(this.organization.departments.values());
  }

  public getAllAgents(): SpecialistAgent[] {
    return Array.from(this.organization.agents.values());
  }

  private seedDepartments(): void {
    const depts: DepartmentConfig[] = [
      {
        id: "marketing",
        name: "Marketing & Growth",
        leadId: "mkt-lead",
        description: "Manages market positioning, campaigns, content, social media, and growth.",
        responsibilities: ["campaigns", "content", "social_media", "growth", "branding"],
        allowedTools: ["web_search", "browser", "social_api"],
        requiresApprovalForActions: true,
      },
      {
        id: "emails",
        name: "Email Communications",
        leadId: "elead",
        description:
          "Orchestrates inbox triage, outbound client correspondence, and vendor communications.",
        responsibilities: ["inbox_triage", "client_replies", "vendor_threads", "summaries"],
        allowedTools: ["email_client", "notion"],
        requiresApprovalForActions: true,
      },
      {
        id: "sales",
        name: "Sales & Pipeline",
        leadId: "slead",
        description:
          "Drives lead generation, account qualification, pipeline advancement, and proposals.",
        responsibilities: ["prospecting", "qualification", "deal_flow", "proposals"],
        allowedTools: ["crm", "linkedin", "browser"],
        requiresApprovalForActions: true,
      },
      {
        id: "operations",
        name: "Internal Operations",
        leadId: "olead",
        description:
          "Coordinates internal business workflows, infrastructure maintenance, and process compliance.",
        responsibilities: ["process_automation", "tool_integrations", "ops_tracking", "sla_audits"],
        allowedTools: ["bash", "git", "cloud_admin"],
        requiresApprovalForActions: true,
      },
      {
        id: "finance",
        name: "Financial Operations & Accounting",
        leadId: "flead",
        description:
          "Performs accounting, reconciliation, cashflow forecasting, and budget audits.",
        responsibilities: ["accounting", "financial_reports", "cashflow", "invoicing_audit"],
        allowedTools: ["accounting_ledger", "spreadsheet", "bank_read"],
        requiresApprovalForActions: true, // Crucial: Financial side-effects must always be guarded
      },
      {
        id: "delivery",
        name: "Delivery & Fulfillment",
        leadId: "dlead",
        description:
          "Oversees client deliverables, technical fulfillment, QA benchmarks, and project tracking.",
        responsibilities: ["project_delivery", "qa_testing", "deliverable_packaging"],
        allowedTools: ["github", "ci_cd", "project_tracker"],
        requiresApprovalForActions: false,
      },
      {
        id: "trading",
        name: "Autonomous Trading Operations",
        leadId: "chief-trading-shihan",
        description:
          "Quantitative market structure, liquidity analysis, and algorithmic risk-gated execution.",
        responsibilities: [
          "market_structure",
          "liquidity_sweeps",
          "orderflow",
          "risk_guard",
          "execution",
        ],
        allowedTools: ["simulation_broker", "market_feed", "order_pipeline"],
        requiresApprovalForActions: true,
      },
    ];

    for (const d of depts) {
      this.organization.departments.set(d.id, d);
    }
  }

  private seedSpecialistRoster(): void {
    const agents: SpecialistAgent[] = [
      // 1. Marketing Department
      {
        id: "mkt-lead",
        departmentId: "marketing",
        name: "Marketing Lead",
        role: "Department Lead",
        isLead: true,
        description: "Directs campaigns and splits creative briefs across marketing desks.",
        skills: ["campaign_planning", "brand_voice"],
        tools: ["web_search", "browser"],
        canSpawnTeam: true,
      },
      {
        id: "mkt-research",
        departmentId: "marketing",
        name: "Market Researcher",
        role: "Competitive Intelligence",
        isLead: false,
        description: "Conducts deep market analysis and customer persona research.",
        skills: ["competitive_audit"],
        tools: ["web_search"],
      },
      {
        id: "mkt-copy",
        departmentId: "marketing",
        name: "Lead Copywriter",
        role: "Creative Copywriter",
        isLead: false,
        description: "Drafts high-converting landing page, campaign, and brand copy.",
        skills: ["persuasive_copy"],
        tools: ["browser"],
      },
      {
        id: "mkt-social",
        departmentId: "marketing",
        name: "Social Strategist",
        role: "Social & Community",
        isLead: false,
        description: "Creates viral distribution threads, announcements, and newsletters.",
        skills: ["social_distribution"],
        tools: ["social_api"],
      },
      {
        id: "mkt-analytics",
        departmentId: "marketing",
        name: "Growth Analyst",
        role: "Performance Marketer",
        isLead: false,
        description: "Tracks conversion metrics, CAC, and attribution modeling.",
        skills: ["attribution_modeling"],
        tools: ["analytics_read"],
      },

      // 2. Email Department
      {
        id: "elead",
        departmentId: "emails",
        name: "Emails Lead",
        role: "Inbox Lead",
        isLead: true,
        description: "Triages and routes incoming messages, checking tone before escalation.",
        skills: ["email_triage"],
        tools: ["email_client"],
        canSpawnTeam: true,
      },
      {
        id: "cmail",
        departmentId: "emails",
        name: "Client Email Specialist",
        role: "Client Relations",
        isLead: false,
        description: "Drafts prompt, accurate client responses backed by knowledge.",
        skills: ["client_care"],
        tools: ["email_client"],
      },
      {
        id: "vmail",
        departmentId: "emails",
        name: "Vendor Communications",
        role: "Vendor Coordinator",
        isLead: false,
        description: "Manages supplier communications, quote verifications, and SLA logs.",
        skills: ["vendor_negotiation"],
        tools: ["email_client"],
      },
      {
        id: "imail",
        departmentId: "emails",
        name: "Internal Comms Desk",
        role: "Team Coordinator",
        isLead: false,
        description: "Synthesizes thread recaps and coordinates internal announcements.",
        skills: ["thread_summarization"],
        tools: ["notion"],
      },

      // 3. Sales Department
      {
        id: "slead",
        departmentId: "sales",
        name: "Sales Director",
        role: "Revenue Lead",
        isLead: true,
        description: "Coordinates pipeline growth, deal qualification, and proposal sprints.",
        skills: ["pipeline_strategy"],
        tools: ["crm"],
        canSpawnTeam: true,
      },
      {
        id: "sales-sdr",
        departmentId: "sales",
        name: "Inbound/Outbound SDR",
        role: "Prospector",
        isLead: false,
        description: "Identifies and qualifies high-value customer leads.",
        skills: ["prospecting"],
        tools: ["crm", "browser"],
      },
      {
        id: "sales-ae",
        departmentId: "sales",
        name: "Account Executive",
        role: "Deal Closer",
        isLead: false,
        description: "Conducts discovery reviews and builds customized commercial proposals.",
        skills: ["commercial_proposals"],
        tools: ["crm"],
      },

      // 4. Operations Department
      {
        id: "olead",
        departmentId: "operations",
        name: "Operations Director",
        role: "Operations Lead",
        isLead: true,
        description: "Ensures operational integrity, systems uptime, and workflow throughput.",
        skills: ["ops_management"],
        tools: ["cloud_admin"],
        canSpawnTeam: true,
      },
      {
        id: "ops-auto",
        departmentId: "operations",
        name: "Automation Specialist",
        role: "Workflow Engineer",
        isLead: false,
        description: "Builds and audits continuous process automations.",
        skills: ["dag_orchestration"],
        tools: ["bash", "git"],
      },
      {
        id: "ops-sec",
        departmentId: "operations",
        name: "Security & Compliance Desk",
        role: "Compliance Officer",
        isLead: false,
        description: "Monitors tool permissions and audit logs.",
        skills: ["compliance_audit"],
        tools: ["cloud_admin"],
      },

      // 5. Finance Department
      {
        id: "flead",
        departmentId: "finance",
        name: "Finance Director",
        role: "Finance Lead",
        isLead: true,
        description: "Oversees financial hygiene, reporting schedules, and expenditure reviews.",
        skills: ["financial_strategy"],
        tools: ["accounting_ledger"],
        canSpawnTeam: true,
      },
      {
        id: "fin-audit",
        departmentId: "finance",
        name: "Audit & Compliance Desk",
        role: "Financial Auditor",
        isLead: false,
        description: "Verifies reconciliations and audits cashflow without payment access.",
        skills: ["ledger_reconciliation"],
        tools: ["accounting_ledger"],
      },
      {
        id: "fin-analyst",
        departmentId: "finance",
        name: "Quantitative Financial Analyst",
        role: "Financial Analyst",
        isLead: false,
        description: "Generates performance models, budget forecasts, and KPI dossiers.",
        skills: ["financial_modeling"],
        tools: ["spreadsheet"],
      },

      // 6. Delivery Department
      {
        id: "dlead",
        departmentId: "delivery",
        name: "Delivery Lead",
        role: "Delivery Director",
        isLead: true,
        description: "Drives sprint deliverables, project quality, and client milestones.",
        skills: ["delivery_orchestration"],
        tools: ["github"],
        canSpawnTeam: true,
      },
      {
        id: "del-qa",
        departmentId: "delivery",
        name: "Quality Assurance Specialist",
        role: "QA Engineer",
        isLead: false,
        description: "Executes regression suites and acceptance checks on deliverables.",
        skills: ["qa_validation"],
        tools: ["ci_cd"],
      },
      {
        id: "del-tech",
        departmentId: "delivery",
        name: "Technical Fulfillment Desk",
        role: "Implementation Engineer",
        isLead: false,
        description: "Packages artifacts, documentation, and technical deliverables.",
        skills: ["technical_packaging"],
        tools: ["github"],
      },

      // 7. Trading Department (Integrated with Shihan/Sensei Hierarchy)
      {
        id: "chief-trading-shihan",
        departmentId: "trading",
        name: "Chief Trading Shihan",
        role: "Trading Shihan",
        isLead: true,
        description:
          "Supreme trading authority coordinating market structure and orderflow Senseis.",
        skills: ["macro_market_structure", "risk_architecture"],
        tools: ["order_pipeline"],
        canSpawnTeam: true,
      },
      {
        id: "sensei-market-structure",
        departmentId: "trading",
        name: "Market Structure Sensei",
        role: "Senior Market Analyst",
        isLead: false,
        description: "Analyzes liquidity sweeps, fair value gaps, and supply/demand zones.",
        skills: ["liquidity_analysis", "ict_wyckoff"],
        tools: ["market_feed"],
      },
      {
        id: "sensei-risk-sentinel",
        departmentId: "trading",
        name: "Risk Sentinel Sensei",
        role: "Deterministic Risk Officer",
        isLead: false,
        description: "Audits stop loss compliance and maximum drawdown parameters.",
        skills: ["deterministic_risk_guard"],
        tools: ["simulation_broker"],
      },
    ];

    for (const a of agents) {
      this.organization.agents.set(a.id, a);
    }
  }
}
