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
        leadId: "mlead",
        description:
          "Manages market positioning, campaigns, content, social media, ad budgets, and growth.",
        responsibilities: [
          "campaigns",
          "content",
          "social_media",
          "growth",
          "branding",
          "ad_campaigns",
        ],
        allowedTools: ["meta", "clarity", "notion", "beehiiv", "loops", "canva", "hyperframes"],
        requiresApprovalForActions: true,
      },
      {
        id: "emails",
        name: "Email Communications",
        leadId: "elead",
        description:
          "Orchestrates inbox triage, outbound client correspondence, and vendor communications.",
        responsibilities: [
          "inbox_triage",
          "client_replies",
          "vendor_threads",
          "summaries",
          "contractor_agreements",
        ],
        allowedTools: ["gmail", "notion"],
        requiresApprovalForActions: true,
      },
      {
        id: "sales",
        name: "Sales & Pipeline",
        leadId: "lexi",
        description:
          "Drives lead generation, account qualification, pipeline advancement, proposals, and followups.",
        responsibilities: [
          "prospecting",
          "qualification",
          "deal_flow",
          "proposals",
          "lead_enrichment",
          "outreach",
        ],
        allowedTools: ["crm", "notion", "gmail", "fullenrich", "imessage", "apollo"],
        requiresApprovalForActions: true,
      },
      {
        id: "operations",
        name: "Internal Operations",
        leadId: "olead",
        description:
          "Coordinates internal business workflows, contracts, compliance audits, competitor intel, and dashboards.",
        responsibilities: [
          "process_automation",
          "tool_integrations",
          "ops_tracking",
          "sla_audits",
          "legal_review",
          "compliance_checks",
        ],
        allowedTools: ["bash", "git", "cloud_admin", "notion", "gmail", "pandadoc"],
        requiresApprovalForActions: true,
      },
      {
        id: "finance",
        name: "Financial Operations & Accounting",
        leadId: "alead",
        description:
          "Performs accounting, reconciliation, invoicing, payables audit, and cashflow monitoring.",
        responsibilities: [
          "accounting",
          "financial_reports",
          "cashflow",
          "invoicing_audit",
          "accounts_payable",
          "bank_reconciliation",
        ],
        allowedTools: ["xero", "stripe", "gmail", "spreadsheet"],
        requiresApprovalForActions: true,
      },
      {
        id: "delivery",
        name: "Delivery & Fulfillment",
        leadId: "dlead",
        description:
          "Oversees live projects, deliverables, QA verification, client reporting, digital assets, and onboarding.",
        responsibilities: [
          "project_delivery",
          "qa_testing",
          "deliverable_packaging",
          "client_reporting",
          "asset_sync",
          "client_onboarding",
        ],
        allowedTools: ["github", "notion", "gmail", "pandadoc", "canva"],
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
      // 1. Email Communications (5 Desks)
      {
        id: "elead",
        departmentId: "emails",
        name: "Emails Lead",
        role: "Inbox Lead",
        isLead: true,
        description:
          "Runs the whole inbox: routes every email to the right desk, checks tone, and escalates only what needs the owner.",
        skills: ["inbox_routing", "tone_audit", "escalation_gate"],
        tools: ["gmail", "notion"],
        canSpawnTeam: true,
      },
      {
        id: "cmail",
        departmentId: "emails",
        name: "Client Emails",
        role: "Client Email Agent",
        isLead: false,
        description:
          "Answers every client email from the Brain — scope, timelines, results — and never lets one sit past an hour.",
        skills: ["client_correspondence", "brain_grounded_replies"],
        tools: ["gmail"],
      },
      {
        id: "imail",
        departmentId: "emails",
        name: "Internal Emails",
        role: "Internal Email Agent",
        isLead: false,
        description:
          "Keeps the team inbox moving — triage, summaries of long threads, calendar holds, and the weekly numbers circulated.",
        skills: ["thread_summarization", "calendar_holds", "number_circulation"],
        tools: ["gmail", "notion"],
      },
      {
        id: "vmail",
        departmentId: "emails",
        name: "Vendor Emails",
        role: "Vendor Email Agent",
        isLead: false,
        description:
          "Handles every supplier thread — quotes, renewals, SLAs, outages — and flags anything that changes what we pay.",
        skills: ["vendor_negotiation", "quote_validation", "sla_auditing"],
        tools: ["gmail"],
      },
      {
        id: "kmail",
        departmentId: "emails",
        name: "Contractor Emails",
        role: "Contractor Email Agent",
        isLead: false,
        description:
          "Talks to the freelancers — briefs out, hours in, invoice questions answered against the contract.",
        skills: ["contractor_management", "timesheet_audit"],
        tools: ["gmail"],
      },

      // 2. Sales & Pipeline (6 Desks)
      {
        id: "lexi",
        departmentId: "sales",
        name: "Sales Lead",
        role: "Sales Team Lead Agent",
        isLead: true,
        description:
          "Runs the sales team — five agents report to it — and it owns the reps' call lists.",
        skills: ["pipeline_management", "sales_orchestration"],
        tools: ["notion", "gmail"],
        canSpawnTeam: true,
      },
      {
        id: "enzo",
        departmentId: "sales",
        name: "Lead Enricher",
        role: "Prospect Enrichment Agent",
        isLead: false,
        description: "Enriches every signup via FullEnrich — role, company size, mobile, LinkedIn.",
        skills: ["prospect_enrichment", "firmographic_lookup"],
        tools: ["fullenrich"],
      },
      {
        id: "ilm",
        departmentId: "sales",
        name: "Inbound Leads Manager",
        role: "Inbound Leads Manager",
        isLead: false,
        description:
          "Owns every lead that comes to us — qualifies it within the hour, routes the hot ones to a rep, books the calls.",
        skills: ["lead_qualification", "calendar_booking", "rapid_response"],
        tools: ["gmail", "imessage", "fullenrich"],
      },
      {
        id: "pros",
        departmentId: "sales",
        name: "Prospector",
        role: "Outbound Prospecting Agent",
        isLead: false,
        description: "Builds fresh outbound lead lists to ICP spec — verified before anyone dials.",
        skills: ["icp_list_building", "contact_verification"],
        tools: ["apollo", "gmail"],
      },
      {
        id: "piper",
        departmentId: "sales",
        name: "Proposals",
        role: "Proposal Agent",
        isLead: false,
        description: "Turns a deal brief into a proposal + send-ready email in minutes.",
        skills: ["proposal_authoring", "pricing_matrix"],
        tools: ["notion", "gmail"],
      },
      {
        id: "folo",
        departmentId: "sales",
        name: "Follow Ups",
        role: "Second-Touch & Revival Agent",
        isLead: false,
        description:
          "Chases everything that went quiet — unanswered calls, post-demo silence, stalled deals.",
        skills: ["deal_revival", "cadence_followup"],
        tools: ["gmail", "imessage"],
      },

      // 3. Marketing & Growth (7 Desks)
      {
        id: "mlead",
        departmentId: "marketing",
        name: "Marketing Lead",
        role: "Marketing Lead",
        isLead: true,
        description:
          "Runs the marketing team — six agents report to it — owns the content calendar and the ad budget, and reports weekly.",
        skills: ["marketing_strategy", "budget_oversight", "team_delegation"],
        tools: ["meta", "clarity", "notion"],
        canSpawnTeam: true,
      },
      {
        id: "riley",
        departmentId: "marketing",
        name: "Research",
        role: "Daily Research Agent",
        isLead: false,
        description: "Scans the sales-tech industry and competitors every morning at 6am.",
        skills: ["market_intelligence", "competitor_scanning"],
        tools: ["meta", "beehiiv", "clarity", "notion"],
      },
      {
        id: "newt",
        departmentId: "marketing",
        name: "Newsletter",
        role: "Newsletter Creator Agent",
        isLead: false,
        description: "Writes the monthly newsletter your signups actually open.",
        skills: ["newsletter_editorial", "audience_engagement"],
        tools: ["beehiiv", "loops"],
      },
      {
        id: "gfx",
        departmentId: "marketing",
        name: "Graphics Designer",
        role: "Marketing Design Agent",
        isLead: false,
        description:
          "Designs everything marketing ships — ads, carousels, decks — on one brand kit.",
        skills: ["visual_design", "brand_kit_styling"],
        tools: ["canva"],
      },
      {
        id: "ada",
        departmentId: "marketing",
        name: "Meta Ads",
        role: "Meta Ads Agent",
        isLead: false,
        description: "Watches every campaign hourly; flags what to scale, kill or fix.",
        skills: ["ad_optimization", "roas_monitoring"],
        tools: ["meta", "clarity"],
      },
      {
        id: "iggy",
        departmentId: "marketing",
        name: "Instagram Organic",
        role: "Instagram Organic Content Agent",
        isLead: false,
        description:
          "Runs the IG content engine — hooks, reels, carousels. Nothing posts without the owner.",
        skills: ["social_hooks", "organic_distribution"],
        tools: ["canva", "clarity"],
      },
      {
        id: "vid",
        departmentId: "marketing",
        name: "Video Editor",
        role: "Video Editing Agent",
        isLead: false,
        description:
          "Cuts every video marketing ships — reels, ads, demos — rendered frame-perfect on HyperFrames.",
        skills: ["video_composition", "motion_graphics"],
        tools: ["hyperframes", "canva"],
      },

      // 4. Operations (6 Desks)
      {
        id: "olead",
        departmentId: "operations",
        name: "Operations Lead",
        role: "Operations Lead",
        isLead: true,
        description:
          "Runs operations — five agents report to it — keeps contracts, compliance, intel and reporting moving, and escalates only what needs the owner.",
        skills: ["operational_hygiene", "systems_continuity"],
        tools: ["notion", "gmail", "pandadoc"],
        canSpawnTeam: true,
      },
      {
        id: "scout",
        departmentId: "operations",
        name: "Intel",
        role: "Competitor & Industry Analysis Agent",
        isLead: false,
        description: "Turns Research's raw findings into 'here's what we should do about it.'",
        skills: ["strategic_insights", "actionable_briefs"],
        tools: ["notion"],
      },
      {
        id: "legal",
        departmentId: "operations",
        name: "Legal Review",
        role: "Agreement Review Agent",
        isLead: false,
        description: "Reads every agreement before it goes out and gives it a second lens.",
        skills: ["contract_redlining", "liability_assessment"],
        tools: ["pandadoc", "gmail"],
      },
      {
        id: "comply",
        departmentId: "operations",
        name: "Compliance Checker",
        role: "Regulatory Watch Agent",
        isLead: false,
        description: "Watches government and regulator sites daily and reports what changed.",
        skills: ["regulatory_tracking", "statutory_compliance"],
        tools: ["notion", "gmail"],
      },
      {
        id: "report",
        departmentId: "operations",
        name: "Internal Reporting",
        role: "Company Reporting Agent",
        isLead: false,
        description: "Builds the reports and keeps every company dashboard current.",
        skills: ["metric_aggregation", "kpi_dashboards"],
        tools: ["gmail", "notion"],
      },
      {
        id: "dash",
        departmentId: "operations",
        name: "Internal Dashboards",
        role: "Dashboards Agent",
        isLead: false,
        description:
          "Builds and keeps the internal dashboards honest — every tile traces to a number in the Brain, refreshed on schedule.",
        skills: ["dashboard_synthesis", "brain_data_verification"],
        tools: ["notion"],
      },

      // 5. Finance & Accounting (4 Desks)
      {
        id: "alead",
        departmentId: "finance",
        name: "Accounting Lead",
        role: "Accounting Lead Agent",
        isLead: true,
        description: "Runs the accounting team: Invoicing, Payables, Reconciliation report to it.",
        skills: ["financial_governance", "ledger_closing"],
        tools: ["xero", "gmail"],
        canSpawnTeam: true,
      },
      {
        id: "invo",
        departmentId: "finance",
        name: "Invoicing",
        role: "Invoicing Agent",
        isLead: false,
        description: "Raises every invoice, chases every overdue — politely and relentlessly.",
        skills: ["invoice_dispatch", "dunning_management"],
        tools: ["xero", "stripe"],
      },
      {
        id: "apay",
        departmentId: "finance",
        name: "Accounts Payable",
        role: "Accounts Payable Agent",
        isLead: false,
        description:
          "Audits every card charge and contractor invoice against what we actually agreed to pay.",
        skills: ["expenditure_audit", "receipt_matching"],
        tools: ["xero"],
      },
      {
        id: "recon",
        departmentId: "finance",
        name: "Reconciliation",
        role: "Accounts Reconciliation Agent",
        isLead: false,
        description: "Matches every bank line to an invoice or bill. Unmatched = investigated.",
        skills: ["bank_reconciliation", "anomaly_flagging"],
        tools: ["stripe", "xero"],
      },

      // 6. Delivery & Fulfillment (7 Desks)
      {
        id: "dlead",
        departmentId: "delivery",
        name: "Delivery Lead",
        role: "Delivery Lead",
        isLead: true,
        description:
          "Owns every live project end to end — risk, timelines, staffing, handovers — and reports the state of play to the owner weekly.",
        skills: ["project_management", "milestone_tracking"],
        tools: ["notion", "gmail"],
        canSpawnTeam: true,
      },
      {
        id: "pco",
        departmentId: "delivery",
        name: "Project Co-ordinator",
        role: "Project Co-ordinator",
        isLead: false,
        description:
          "Keeps every project plan true — milestones, sign-offs, hours — and moves things before they become late.",
        skills: ["gantt_scheduling", "milestone_defense"],
        tools: ["notion"],
      },
      {
        id: "qa",
        departmentId: "delivery",
        name: "Quality Assurance Checker",
        role: "QA Checker",
        isLead: false,
        description:
          "Nothing reaches a client until it passes: links, spelling, brand rules, numbers, the flows a client will actually click.",
        skills: ["deliverable_inspection", "broken_link_verification", "brand_rules_check"],
        tools: ["notion"],
      },
      {
        id: "crep",
        departmentId: "delivery",
        name: "Client Reports",
        role: "Client Reports Agent",
        isLead: false,
        description:
          "Writes every client status and results report from the numbers in the Brain — same format, every month, on time.",
        skills: ["client_reporting", "performance_recaps"],
        tools: ["pandadoc", "notion"],
      },
      {
        id: "cass",
        departmentId: "delivery",
        name: "Client Assets",
        role: "Client Assets Agent",
        isLead: false,
        description:
          "Every logo, file, export and final lives in the right place, named right, synced to the client portal.",
        skills: ["asset_management", "file_hygiene"],
        tools: ["canva", "notion"],
      },
      {
        id: "dasst",
        departmentId: "delivery",
        name: "Designer Assistant",
        role: "Designer Assistant",
        isLead: false,
        description:
          "Takes the routine design work off the designer — templates, resizes, mockups, brand sheets — on brand, every time.",
        skills: ["template_production", "asset_resizing"],
        tools: ["canva"],
      },
      {
        id: "ona",
        departmentId: "delivery",
        name: "Onboarder",
        role: "Onboarding Concierge (High-Usage)",
        isLead: false,
        description: "Texts high-usage new users and gets them set up like a human would.",
        skills: ["onboarding_concierge", "user_walkthrough"],
        tools: ["gmail", "notion"],
      },

      // 7. Trading Operations (3 Desks - Shihan & Senseis)
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
