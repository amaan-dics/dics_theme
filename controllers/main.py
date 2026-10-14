from odoo.osv import expression
from odoo import http, fields
from odoo.http import request
from odoo.addons.website.controllers.main import Website
from odoo.addons.account.controllers.portal import PortalAccount
import logging

from .industry_content import INDUSTRY_EXTRA

_logger = logging.getLogger(__name__)


class DataIntegerWebsiteController(Website):

    INDUSTRIES = {
        'healthcare': {
            'title': 'Healthcare',
            'icon': 'health_and_safety',
            'summary': 'Connect care delivery, finance, inventory, and patient administration in one dependable operating system.',
            'lead': 'Healthcare organizations need systems that respect people, process, privacy, and precision. Odoo can bring those moving parts into a clearer operational rhythm.',
            'challenges': ['Disconnected patient and administrative workflows',
                           'Manual billing, purchasing, and stock control',
                           'Limited visibility across clinics and departments'],
            'solutions': ['CRM and appointment workflows', 'Medical supply and inventory management',
                          'Finance, purchasing, and vendor controls', 'Role-based dashboards and reporting'],
            'insight_tag': 'CLINICAL SUPPLY CHAIN',
            'insight_headline': 'Eliminating Expiry Write-Offs: How FEFO Automation Saved a 400-Bed Hospital Network Annually',
            'insight_body': 'Traditional ERP systems rely on generic FIFO picking logic, resulting in near-expiry medications sitting dormant behind freshly received batches. By implementing automated lot-level FEFO algorithms in Odoo 18 with quarantine flags at 90, 60, and 30 days, hospitals achieve zero accidental dispenses and near-zero disposal waste.',
            'insight_highlights': ['Automated Lot Quarantining', 'GS1-128 Barcode Scanning',
                                   'Real-time Batch Allocation'],
            'benchmark_num': '99.8%',
            'benchmark_desc': 'Reduction in accidental expired inventory dispenses within 60 days of deployment.',
            'insight_briefs': [
                {'tag': 'COMPLIANCE & AUDIT', 'read': '4 MIN READ',
                 'title': '21 CFR Part 11 & NABH: Building Tamper-Proof Audit Trails in Odoo',
                 'body': 'How custom PostgreSQL trigger logs and cryptographic electronic signatures provide undeniable tracking for sensitive prescription and batch alterations without slowing clinical workflows.'},
                {'tag': 'COLD-CHAIN IOT', 'read': '5 MIN READ',
                 'title': 'Connecting Odoo IoT Box to Cryo & Cold-Storage Telemetry',
                 'body': 'Seamlessly logging ambient storage temperatures directly to Odoo lot records every 60 seconds, triggering emergency SMS dispatch protocols the instant thresholds drift.'},
                {'tag': 'CENTRALIZED PHARMACY', 'read': '4 MIN READ',
                 'title': 'Multi-Clinic Central Inventory Sync vs Local Emergency Stock',
                 'body': 'Balancing central bulk pharmaceutical purchasing power with decentralized, instant clinic requisitioning through automated replenishment rules and transit validation.'},
            ],
            'comparisons': [
                {'problem_title': 'Disconnected EHR & Billing with Manual Double Entry',
                 'problem_body': 'Nurses log consumed surgical kits in clinical systems, but ERP billing requires manual data entry, delaying insurance claims by days.',
                 'solution_title': 'Bidirectional REST & HL7 FHIR Integration',
                 'solution_body': 'Bedside barcode scans trigger instant stock write-offs and auto-generate draft claim line items in Odoo in under 200 milliseconds.'},
                {'problem_title': 'High-Volume Consumables Lost to Phantom Inventory',
                 'problem_body': 'Unmonitored floor wards and crash carts suffer from untracked inventory leakage, inflating procurement cost by up to 18%.',
                 'solution_title': 'Ward-Level Kanban & Auto Replenishment Rules',
                 'solution_body': 'Visual, handheld-supported Odoo Point-of-Use modules with min/max replenishment triggers maintain precise inventory baselines without clinical overhead.'},
                {'problem_title': 'Slow, Manual Supplier Recall Traceability',
                 'problem_body': 'When an FDA alert hits, searching fragmented spreadsheets to find where contaminated lots were administered takes days.',
                 'solution_title': 'Instant Upstream & Downstream Traceability Graph',
                 'solution_body': 'Trace an affected batch from the vendor purchase order to the exact ward and patient invoice in under 180 seconds with automated freeze locks.'},
            ],

        },
        'construction': {
            'title': 'Construction',
            'icon': 'engineering',
            'summary': 'Give project teams one view of estimates, materials, subcontractors, timesheets, and profitability.',
            'lead': 'Construction work moves between the office, job sites, suppliers, and subcontractors. Odoo connects those handoffs so project decisions are based on current information.',
            'challenges': ['Cost leakage between estimates and delivery', 'Scattered site updates and approvals',
                           'Material purchasing without project-level visibility'],
            'solutions': ['Project and work-order management', 'Job costing and budget tracking',
                          'Purchase approvals and inventory replenishment',
                          'Timesheets, field updates, and profitability reports'],
            'insight_tag': 'PROJECT COST CONTROL',
            'insight_headline': 'How Real-Time Job Costing in Odoo Recovered 12% of Lost Margin on a ₹45 Cr Infrastructure Project',
            'insight_body': 'Construction profitability evaporates in the gap between the estimate and what actually gets spent. Odoo project modules linked to purchasing, timesheets, and subcontractor billing give project managers a live cost picture that enables intervention while it still matters.',
            'insight_highlights': ['Live budget vs actual tracking', 'BOQ-linked purchase orders',
                                   'Milestone-triggered invoicing'],
            'benchmark_num': '12%',
            'benchmark_desc': 'Average margin recovery achieved through real-time job costing visibility within the first project cycle.',
            'insight_briefs': [
                {'tag': 'JOB COSTING', 'read': '5 MIN READ',
                 'title': 'Why Construction Projects Bleed Margin and How Odoo Stops It',
                 'body': 'Every purchase order raised without a project code, every timesheet entry delayed by a week, every subcontractor invoice approved without a work completion check — all of these erode margin silently until month-end.'},
                {'tag': 'BOQ MANAGEMENT', 'read': '4 MIN READ',
                 'title': 'Building a BOQ-Linked Procurement Engine in Odoo for Civil Projects',
                 'body': 'Custom Odoo modules that link bill-of-quantities line items to purchase orders give procurement managers an instant view of budget consumed versus quantity estimated — at item level.'},
                {'tag': 'SUBCONTRACTOR BILLING', 'read': '4 MIN READ',
                 'title': 'Automated Retention Tracking and Release in Odoo Accounting',
                 'body': 'Retention held against subcontractor invoices is tracked as a liability and released on milestone completion through automated journal entries — without month-end manual adjustments.'},
            ],
            'comparisons': [
                {'problem_title': 'Budget vs Actual Visible Only at Month-End',
                 'problem_body': 'Project managers receive cost reports three to four weeks after expenditure occurs — by which time the over-run is already baked in and can only be absorbed, not corrected.',
                 'solution_title': 'Live Cost Accumulation Against Project Budget',
                 'solution_body': 'Every purchase order raised against a project reduces the available budget instantly in Odoo. Project managers see actual cost vs estimate in real time throughout the project lifecycle.'},
                {'problem_title': 'Material Procurement Disconnected from Site Demand',
                 'problem_body': 'Site teams raise verbal requests that are transcribed into purchase orders by head office — losing project coding, delaying delivery, and generating uncosted receipts in the store.',
                 'solution_title': 'Digital Material Requests Flowing Directly to Coded Purchase Orders',
                 'solution_body': "Odoo's procurement portal lets site supervisors raise material    requests    that    auto - populate    project and work - order    codes    on    the    resulting    purchase    order — no    re - entry, no lost allocation."},
                {'problem_title': 'Subcontractor Payments Without Work Verification',
                 'problem_body': 'Subcontractor invoices are approved on receipt without a formal work-completion check, leading to advance payments, disputed deductions, and retention leakage.',
                 'solution_title': 'Work Order Completion Gates Before Payment Approval',
                 'solution_body': 'Odoo work orders require a site supervisor completion sign-off before a subcontractor invoice can be approved for payment — creating an auditable payment trail with zero manual chasing.'},

            ],

        },
        'software': {
            'title': 'Software & Technology',
            'icon': 'code',
            'summary': 'Align sales, subscriptions, delivery, support, and finance for technology businesses that scale quickly.',
            'lead': 'Software companies need operational systems that move as quickly as their product teams. We configure Odoo around recurring revenue, delivery milestones, and customer success.',
            'challenges': ['Sales data disconnected from delivery planning', 'Subscription and renewal visibility gaps',
                           'Manual resource and support coordination'],
            'solutions': ['CRM and pipeline automation', 'Subscriptions, renewals, and invoicing',
                          'Project delivery and resource planning', 'Support workflows and customer reporting'],
            'insight_tag': 'SaaS OPERATIONS',
            'insight_headline': 'How a 50-Person SaaS Company Unified CRM, Delivery, and Finance in Odoo and Recovered 15% of Billable Hours',
            'insight_body': 'Technology companies grow faster than their operational systems adapt. When CRM, project delivery, timesheets, and invoicing live in separate tools, billable hours slip through the cracks and revenue recognition lags reality by weeks. Odoo connects the full revenue lifecycle in one system.',
            'insight_highlights': ['CRM-to-project delivery handoff', 'Timesheet-linked invoicing',
                                   'Subscription MRR visibility'],
            'benchmark_num': '15%',
            'benchmark_desc': 'Average increase in captured billable hours within the first billing cycle after Odoo implementation.',
            'insight_briefs': [
                {'tag': 'REVENUE RECOGNITION', 'read': '5 MIN READ',
                 'title': 'Connecting Odoo CRM to Finance: From Pipeline to Recognised Revenue',
                 'body': 'Deals in CRM flow into delivery projects and subscription records automatically. Finance sees MRR, pipeline-weighted forecasts, and deferred revenue from a single source — without three-tool reconciliation.'},
                {'tag': 'BILLABLE HOURS', 'read': '4 MIN READ',
                 'title': 'Why SaaS Companies Lose Billable Hours and How Odoo Closes the Gap',
                 'body': 'Time entered against project tasks in Odoo flows directly into the client invoice when the billing cycle runs. No re-entry, no approval delays, no forgotten hours from the previous Friday afternoon.'},
                {'tag': 'SUBSCRIPTION RENEWALS', 'read': '4 MIN READ',
                 'title': 'Automating SaaS Renewal Pipelines in Odoo Subscriptions',
                 'body': 'Subscription expiry dates trigger renewal opportunities in CRM automatically, with the customer\'s support history, contract value, and invoice outstanding all visible on one screen.'},
            ],
            'comparisons': [
                {'problem_title': 'Billable Hours Leaked Between Tools',
                 'problem_body': 'Engineers log time in a time-tracking tool, project managers copy it to invoices in a billing tool, and finance reconciles the two in a spreadsheet — losing hours at every handoff.',
                 'solution_title': 'Timesheets Posted Directly to Project Tasks and Auto-Invoiced',
                 'solution_body': 'Hours logged in Odoo against project tasks accumulate in the billing queue automatically. The invoice is generated from actual timesheet data with one click — no re-entry, no reconciliation.'},
                {'problem_title': 'Subscription Renewals Managed in Spreadsheets',
                 'problem_body': 'Account managers track renewal dates in spreadsheets and rely on calendar reminders to follow up — missing renewals when the list grows beyond 50 customers.',
                 'solution_title': 'Automated Renewal Opportunities with Full Customer Context',
                 'solution_body': 'Odoo creates a CRM renewal opportunity 60 days before each subscription expires, pre-populated with the customer\'s support ticket history, contract value, and current outstanding balance.'},
                {'problem_title': 'Project Profitability Unknown Until Delivery Is Complete',
                 'problem_body': 'Without live timesheet-to-budget tracking, delivery managers only discover a project has over-delivered when the invoice goes out and the margin is already lost.',
                 'solution_title': 'Real-Time Hours Consumed vs Hours Sold on Every Engagement',
                 'solution_body': 'Odoo shows hours consumed against the project budget in real time. Delivery managers see margin erosion as it happens and can initiate the right commercial conversation before the project closes.'},
            ],
        },
        'ecommerce': {
            'title': 'E-commerce & Retail',
            'icon': 'shopping_cart',
            'summary': 'Unify storefronts, marketplaces, inventory, fulfillment, returns, and accounting across every channel.',
            'lead': 'Commerce operations become complex when every channel maintains a different version of stock, orders, and customer data. Odoo creates one reliable flow from cart to cash.',
            'challenges': ['Overselling caused by fragmented stock data', 'Manual marketplace and courier updates',
                           'Returns and reconciliation across channels'],
            'solutions': ['Multi-channel order synchronization', 'Warehouse, barcode, and fulfillment workflows',
                          'Payment, courier, and marketplace integrations',
                          'Returns, refunds, and finance reconciliation'],
            'insight_tag': 'OMNICHANNEL OPERATIONS',
            'insight_headline': 'How a D2C Brand Eliminated Overselling Across Amazon, Flipkart, and Own Website with Odoo',
            'insight_body': 'Multi-channel retail creates a structural inventory integrity problem. When every channel maintains a separate stock count, overselling is not a bug — it is an architectural inevitability. A single Odoo inventory layer shared across all channels removes the root cause entirely.',
            'insight_highlights': ['Real-time cross-channel stock sync', 'Unified order management',
                                   'Automated marketplace reconciliation'],
            'benchmark_num': '0',
            'benchmark_desc': 'Overselling incidents in the 90 days following Odoo omnichannel implementation for a 10,000 SKU catalogue.',
            'insight_briefs': [
                {'tag': 'MARKETPLACE SYNC', 'read': '5 MIN READ',
                 'title': 'Building a Bidirectional Odoo-Amazon-Flipkart Sync Without Data Loss',
                 'body': 'Marketplace orders sync into Odoo as standard sales orders within seconds of confirmation. Stock reservation happens before acknowledgement is sent back to the marketplace — eliminating the acceptance-then-reject failure mode.'},
                {'tag': 'RETURNS MANAGEMENT', 'read': '4 MIN READ',
                 'title': 'Unifying Cross-Channel Returns in Odoo Without Manual Reconciliation',
                 'body': 'A return initiated on any channel — marketplace, website, or store — flows through a single Odoo workflow that updates stock, generates the credit note, and posts the accounting entry without manual intervention.'},
                {'tag': 'FINANCIAL RECONCILIATION', 'read': '4 MIN READ',
                 'title': 'Matching Marketplace Settlements to Odoo Sales Orders Automatically',
                 'body': 'Platform settlement files from Amazon and Flipkart are imported and matched against Odoo sales orders, isolating commission deductions, return adjustments, and net receivables per platform per period.'},
            ],
            'comparisons': [
                {'problem_title': 'Overselling from Fragmented Channel Stock',
                 'problem_body': 'Each channel — website, Amazon, Flipkart, store — maintains its own stock count. A unit sold on Amazon is not deducted from Flipkart\'s available quantity until a manual sync runs hours later.',
                 'solution_title': 'Single Inventory Layer Serving All Channels Simultaneously',
                 'solution_body': 'Odoo maintains one stock quantity per location. When a unit is reserved for any channel, it is immediately unavailable everywhere else — with no sync delay and no manual intervention required.'},
                {'problem_title': 'Return Processing Requires Manual Steps Across Three Systems',
                 'problem_body': 'A marketplace return triggers a refund in the platform, a stock update in the WMS, and a credit note in the accounting system — each done manually, each prone to delay and error.',
                 'solution_title': 'Single Return Workflow Updating Stock, Finance, and Platform Simultaneously',
                 'solution_body': 'Odoo\'s return workflow updates inventory, generates the credit note, and posts the accounting entry in one confirmed action — regardless of which channel the return originated from.'},
                {'problem_title': 'Marketplace Settlement Reconciliation Takes Days Each Month',
                 'problem_body': 'Finance teams download settlement reports from each platform and manually match them to sales orders, spending three to five days reconciling commissions, returns, and net payables.',
                 'solution_title': 'Automated Settlement Import and Order Matching',
                 'solution_body': 'Settlement files are imported into Odoo and matched against sales orders automatically. Net revenue by platform, after all deductions, is visible in the accounting dashboard without manual effort.'},
            ],
        },
        'finance': {
            'title': 'Finance & Professional Services',
            'icon': 'account_balance',
            'summary': 'Turn engagements, time, expenses, billing, and collections into a controlled financial workflow.',
            'lead': 'Professional firms need more than accounting software. They need a connected view of the work that creates revenue and the financial controls that protect it.',
            'challenges': ['Time and expenses captured after the fact', 'Unclear project margin and utilization',
                           'Inconsistent billing and collection follow-up'],
            'solutions': ['Timesheets and engagement tracking', 'Milestone, recurring, and fixed-fee billing',
                          'Expense approvals and accounting automation',
                          'Margin, utilization, and receivables dashboards'],
            'insight_tag': 'ENGAGEMENT PROFITABILITY',
            'insight_headline': 'How a 30-Partner CA Firm Reduced Invoice-to-Collection Days from 42 to 18 Using Odoo',
            'insight_body': 'Professional services firms face a structural disconnect between the work that creates revenue and the systems that bill and collect it. Milestone invoicing triggered by project completion, combined with automated collection follow-up, compresses the cash conversion cycle without adding administrative overhead.',
            'insight_highlights': ['Milestone-triggered billing', 'Automated collection reminders',
                                   'Engagement profitability by partner'],
            'benchmark_num': '18',
            'benchmark_desc': 'Days from invoice to collection — down from 42 — after Odoo billing and collections automation.',
            'insight_briefs': [
                {'tag': 'BILLING AUTOMATION', 'read': '5 MIN READ',
                 'title': 'Configuring Milestone Billing in Odoo for Fixed-Fee Engagements',
                 'body': 'Milestone completion in the Odoo project module triggers invoice generation in accounts automatically. The billing cycle follows delivery events, not calendar dates — reducing disputed invoices and accelerating payment.'},
                {'tag': 'RESOURCE PLANNING', 'read': '4 MIN READ',
                 'title': 'Seeing Utilisation Across Your Entire Team Before Accepting New Work',
                 'body': 'Odoo resource allocation linked to confirmed projects shows available capacity by role and seniority. Principals see whether the team can absorb a new mandate before the engagement letter is signed.'},
                {'tag': 'COLLECTIONS', 'read': '4 MIN READ',
                 'title': 'Automating Receivables Follow-Up in Odoo Without a Dedicated Collections Role',
                 'body': 'Scheduled actions in Odoo send payment reminders at configurable intervals after the due date, escalating to a senior contact after a second missed payment — without manual chasing cycles.'},
            ],
            'comparisons': [
                {'problem_title': 'Billable Hours Captured After the Fact',
                 'problem_body': 'Staff fill in timesheets at the end of the week from memory, missing Friday afternoon hours and misallocating time across engagements — understating billed effort by 10-15%.',
                 'solution_title': 'Daily Timesheet Entry Against Odoo Project Tasks',
                 'solution_body': 'Odoo prompts engineers and consultants to log time daily against specific project tasks. Billing is compiled from actual, task-level records — reducing undercharging and disputed time entries.'},
                {'problem_title': 'Engagement Profitability Unknown Until It Is Too Late',
                 'problem_body': 'Fixed-fee engagements are priced on estimated hours. Without live tracking, firms discover they have over-delivered only when the final invoice is raised and the margin has already been consumed.',
                 'solution_title': 'Live Hours Consumed vs Budgeted on Every Fixed-Fee Engagement',
                 'solution_body': 'Odoo shows hours posted against a project vs hours sold in real time. Partners see margin risk as it develops and can make a timely scope or pricing conversation with the client.'},
                {'problem_title': 'Collections Managed by Manual Chasing Cycles',
                 'problem_body': 'Finance staff manually review aged debtor reports and send individual follow-up emails — an inconsistent process that lets low-priority overdue accounts slip past 90 days.',
                 'solution_title': 'Automated, Tiered Payment Reminders from Odoo Accounting',
                 'solution_body': 'Odoo sends a reminder 3 days before due date, a follow-up 7 days after, and escalates to a partner-level contact at 21 days — automatically, for every outstanding invoice, without human scheduling.'},
            ],
        },
        'manufacturing': {
            'title': 'Manufacturing',
            'icon': 'precision_manufacturing',
            'summary': 'Coordinate bills of materials, production, quality, maintenance, purchasing, and inventory in one system.',
            'lead': 'Manufacturers need accurate information at every stage of production. Odoo makes planning, shop-floor execution, and stock movement visible to the people who depend on them.',
            'challenges': ['Production plans disconnected from demand', 'Inventory variance and slow replenishment',
                           'Quality and maintenance records spread across tools'],
            'solutions': ['Manufacturing orders and planning', 'Bills of materials and work centers',
                          'Quality checks and maintenance schedules', 'Traceability, forecasting, and replenishment'],
            'insight_tag': 'MRP & PRODUCTION',
            'insight_headline': 'How Demand-Driven MRP Reduced Production Delays by 40% for a Discrete Manufacturer',
            'insight_body': 'Traditional production planning relies on static schedules and gut instinct. By implementing Odoo MRP with real-time demand signals from confirmed sales orders, manufacturers achieve accurate material requirements, reduced WIP, and shop-floor execution that actually matches the plan.',
            'insight_highlights': ['Demand-linked MRP scheduling', 'Multi-level BOM management',
                                   'Quality gate automation'],
            'benchmark_num': '40%',
            'benchmark_desc': 'Reduction in average production cycle time within 90 days of Odoo MRP implementation.',
            'insight_briefs': [
                {'tag': 'PRODUCTION PLANNING', 'read': '5 MIN READ',
                 'title': 'Why Static Production Schedules Fail and How Odoo MRP Fixes Them',
                 'body': 'Demand fluctuations expose the fragility of static weekly production plans. Odoo MRP reads confirmed sales orders in real time and regenerates procurement and work order proposals automatically.'},
                {'tag': 'QUALITY CONTROL', 'read': '4 MIN READ',
                 'title': 'Embedding Quality Gates Directly Into Work Orders in Odoo 18',
                 'body': 'Quality control points that trigger automatically between work orders prevent defective components from advancing through production — eliminating end-of-line rework and customer returns.'},
                {'tag': 'COST OF MANUFACTURE', 'read': '4 MIN READ',
                 'title': 'Actual vs Standard Cost: Getting Manufacturing Margins Right in Odoo',
                 'body': 'Configuring Odoo to capture actual material consumption, labour hours, and overhead per production order gives finance and operations a single, audit-ready version of manufacturing cost.'},
            ],
            'comparisons': [
                {'problem_title': 'Production Plans Disconnected from Demand',
                 'problem_body': 'Weekly Excel-based production schedules become stale within hours of a sales order change, leading to over-production, raw material shortages, and missed delivery dates.',
                 'solution_title': 'Live MRP Regeneration from Confirmed Sales Orders',
                 'solution_body': 'Odoo MRP reads confirmed demand and recomputes procurement and manufacturing proposals automatically — planners act on exceptions, not manual calculations.'},
                {'problem_title': 'Inventory Variance Discovered at Month-End',
                 'problem_body': 'Scrap, rework, and component substitutions are recorded on paper and entered into the ERP days later, creating stock discrepancies that only surface during physical counts.',
                 'solution_title': 'Real-Time Stock Moves Linked to Every Production Order',
                 'solution_body': 'Every material issue, scrap posting, and finished goods receipt is captured at the point of occurrence through Odoos shop floor interface, keeping accounts and warehouse in permanent agreement.'},
                {'problem_title': 'Quality Failures Found at Final Inspection',
                 'problem_body': 'Without in-process quality gates, defective components advance through all work orders before being caught at final inspection — multiplying the cost of the original defect.',
                 'solution_title': 'Automated Quality Control Points Between Work Orders',
                 'solution_body': 'Odoo Quality triggers inspection checklists at configurable points during production. A failed check blocks the next operation and generates a non-conformance record automatically.'},
            ],
        },
    }

    @classmethod
    def _industries(cls):
        """INDUSTRIES merged with the per-industry extras (cards, console, modules)."""
        return {slug: {**data, **INDUSTRY_EXTRA.get(slug, {})} for slug, data in cls.INDUSTRIES.items()}

    def _is_dics_website(self):
        website = request.website
        dics_website = request.env.ref('dics_theme.dics_website', raise_if_not_found=False)
        return bool(website and dics_website and website.id == dics_website.id)

    def _render_page(self, template, page_name, **extra):
        website = request.website
        page = request.env['website.page'].sudo().search([
            ('url', '=', request.httprequest.path),
            ('website_id', '=', website.id),
        ], limit=1)
        ctx = {
            'website': website,
            'main_object': page or website,
            'website_page': page or request.env['website.page'],
            'pageName': page_name,
        }
        ctx.update(extra)
        view = request.env.ref(template, raise_if_not_found=False)
        return request.render(view.id if view else template, ctx)

    def _render_industry(self, slug):
        industry = self._industries().get(slug)
        if not industry:
            return request.not_found()
        return self._render_page(
            'dics_theme.dics_industry_detail',
            'industry_detail',
            industry=industry,
            industry_slug=slug,
        )

    @http.route()
    def index(self, **kw):
        if self._is_dics_website():
            return self._render_page('dics_theme.dics_home', 'home')
        return super().index(**kw)

    @http.route('/<path:invalid_path>', type='http', auth='public', website=True)
    def handle_404(self, invalid_path, **kw):
        page = request.env['ir.http']._serve_page()
        _logger.info("handle_404: path=%s website=%s served_page=%s",
                     request.httprequest.path, request.website.id, bool(page))
        if page:
            return page
        if not self._is_dics_website():
            return request.not_found()
        view = request.env.ref('dics_theme.page_404', raise_if_not_found=False)
        return request.render(view.id if view else 'dics_theme.page_404', {
            'invalid_path': invalid_path,
        })

    @http.route('/favicon.ico', type='http', auth='public', website=True, sitemap=False)
    def favicon(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return request.redirect('/dics_theme/static/src/img/favicon.svg')


    @http.route('/about-us', type='http', auth='public', website=True)
    def about(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_about', 'about')

    @http.route('/about', type='http', auth='public', website=True)
    def about_alias(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return request.redirect('/about-us', code=301)

    @http.route('/contactus', type='http', auth='public', website=True)
    def contact(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_contact', 'contact')

    @http.route('/contact', type='http', auth='public', website=True)
    def contact_alias(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return request.redirect('/contactus', code=301)

    # @http.route('/contactus-thank-you', type='http', auth='public', website=True)
    # def contact_thank_you(self, **kw):
    #     if not self._is_dics_website():
    #         return request.not_found()
    #     return self._render_page('dics_theme.dics_contact_thank_you', 'contact_thank_you')

    @http.route('/insights', type='http', auth='public', website=True)
    def insights(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_insights', 'insights')


    @http.route('/services', type='http', auth='public', website=True)
    def services(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_services', 'services')

    @http.route('/services/odoo-erp', type='http', auth='public', website=True)
    def odoo_erp_services(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_odoo_services', 'odoo_erp')

    @http.route('/services/ai-solutions', type='http', auth='public', website=True)
    def ai_solutions_service(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_ai_solutions', 'ai_solutions')

    @http.route('/services/web-mobile', type='http', auth='public', website=True)
    def web_mobile_service(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_web_mobile', 'web_mobile')

    @http.route('/services/custom-software', type='http', auth='public', website=True)
    def custom_software_service(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_custom_software', 'custom_software')

    @http.route('/services/saas', type='http', auth='public', website=True)
    def saas_service(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_saas', 'saas')

    @http.route('/services/digital-marketing', type='http', auth='public', website=True)
    def digital_marketing_service(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_digital_marketing', 'digital_marketing')

    @http.route('/services/whatsapp-integration', type='http', auth='public', website=True)
    def whatsapp_integration(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.page_whatsapp_integration', 'whatsapp_integration')

    @http.route('/services/claude-integration', type='http', auth='public', website=True)
    def claude_integration(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.page_claude_integration', 'claude_integration')


    @http.route('/industries', type='http', auth='public', website=True)
    def industries(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_industries', 'industries', industries=self._industries())

    @http.route('/industries/<string:slug>', type='http', auth='public', website=True)
    def industry_detail(self, slug, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_industry(slug)


    @http.route('/what-is-odoo', type='http', auth='public', website=True)
    def what_is_odoo(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_what_is_odoo', 'what_is_odoo')

    @http.route('/odoo-migration', type='http', auth='public', website=True)
    def odoo_migration(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_odoo_migration', 'odoo_migration')

    @http.route('/odoo-nineteen', type='http', auth='public', website=True)
    def odoo_nineteen(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_whats_new_in_odoo_19', 'odoo_nineteen')

    @http.route('/whats-new-in-odoo-20', type='http', auth='public', website=True)
    def odoo_twenty(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_whats_new_in_odoo_20', 'odoo_twenty')

    @http.route('/faqs', type='http', auth='public', website=True)
    def faqs(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_faqs', 'faqs')

    @http.route('/faq', type='http', auth='public', website=True)
    def faq_alias(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return request.redirect('/faqs', code=301)

    @http.route('/glossary', type='http', auth='public', website=True)
    def odoo_glossary(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_glossary', 'glossary')

    @http.route('/odoo-vs-sap', type='http', auth='public', website=True)
    def odoo_vs_sap(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_odoo_vs_sap', 'odoo_vs_sap')

    @http.route('/odoo-vs-zoho', type='http', auth='public', website=True)
    def odoo_vs_zoho(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_odoo_vs_zoho', 'odoo_vs_zoho')

    @http.route('/odoo-vs-netsuite', type='http', auth='public', website=True)
    def odoo_vs_netsuite(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_odoo_vs_netsuite', 'odoo_vs_netsuite')

    @http.route('/odoo-vs-salesforce', type='http', auth='public', website=True)
    def odoo_vs_salesforce(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_odoo_vs_salesforce', 'odoo_vs_salesforce')

    @http.route('/odoo-vs-microsoft-dynamics', type='http', auth='public', website=True)
    def odoo_vs_microsoft_dynamics(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_odoo_vs_microsoft_dynamics', 'odoo_vs_microsoft_dynamics')

    @http.route('/odoo-vs-tally', type='http', auth='public', website=True)
    def odoo_vs_tally(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_odoo_vs_tally', 'odoo_vs_tally')




class DataIntegerPortalAccount(PortalAccount):

    @http.route(['/my/invoices/<int:invoice_id>'], type='http', auth="public", website=True)
    def portal_my_invoice_detail(
            self,
            invoice_id,
            access_token=None,
            report_type=None,
            download=False,
            **kw
    ):
        response = super().portal_my_invoice_detail(
            invoice_id=invoice_id,
            access_token=access_token,
            report_type=report_type,
            download=download,
            **kw
        )

        if hasattr(response, "qcontext") and "invoice" in response.qcontext:
            invoice = response.qcontext["invoice"].sudo()

            lines = request.env["account.move.line"].sudo().search([
                ("move_id", "=", invoice.id),
                ("display_type", "in", ["product", False, ""]),
            ])

            response.qcontext["dics_lines"] = lines

        return response

    def _compute_invoice_summary_totals(self, invoices):
        today = fields.Date.context_today(request.env.user)

        totals = {
            "outstanding": 0.0,
            "overdue": 0.0,
            "pending": 0.0,
        }

        for invoice in invoices:
            sign = -1 if invoice.move_type == "out_refund" else 1

            if invoice.state == "draft":
                totals["pending"] += sign * abs(invoice.amount_total)
                continue

            if invoice.state != "posted":
                continue

            if invoice.currency_id.is_zero(invoice.amount_residual):
                continue

            amount = sign * abs(invoice.amount_residual)

            totals["outstanding"] += amount

            if invoice.invoice_date_due and invoice.invoice_date_due < today:
                totals["overdue"] += amount

        totals["outstanding"] = max(0.0, totals["outstanding"])
        totals["overdue"] = max(0.0, min(totals["overdue"], totals["outstanding"]))
        totals["pending"] = max(0.0, totals["pending"])

        for key in totals:
            totals[key] = round(totals[key], 2)

        return totals

    def _prepare_my_invoices_values(self, page, date_begin, date_end, sortby, filterby, domain=None,
                                    url="/my/invoices"):
        values = super()._prepare_my_invoices_values(
            page, date_begin, date_end, sortby, filterby, domain=domain, url=url
        )

        AccountInvoice = request.env['account.move']


        search_domain = expression.AND([
            domain or [],
            self._get_invoices_domain(),
        ])

        searchbar_filters = self._get_account_searchbar_filters()
        active_filter = filterby if filterby in searchbar_filters else 'all'
        search_domain += searchbar_filters[active_filter]['domain']

        if date_begin and date_end:
            search_domain += [('create_date', '>', date_begin), ('create_date', '<=', date_end)]


        if AccountInvoice.check_access_rights('read', raise_exception=False):
            all_invoices = AccountInvoice.search(search_domain)
        else:
            all_invoices = AccountInvoice

        _logger.info("Global matching invoices count for summary cards: %s", len(all_invoices))

        values['dics_invoice_totals'] = self._compute_invoice_summary_totals(all_invoices)

        return values