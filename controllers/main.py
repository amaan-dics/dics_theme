from collections import OrderedDict
from odoo.osv import expression
from odoo import http,fields
from odoo.http import request
from odoo.addons.website.controllers.main import Website
from odoo.addons.account.controllers.portal import PortalAccount
import logging
_logger = logging.getLogger(__name__)

class DataIntegerWebsite(http.Controller):

    def _render_template(self, template, values):
        view = request.env.ref(template, raise_if_not_found=False)
        return request.render(view.id if view else template, values)

    def _render_with_page(self, template, **extra):
        website = request.website
        page = request.env['website.page'].sudo().search([
            ('url', '=', request.httprequest.path),
            ('website_id', '=', website.id),
        ], limit=1)
        ctx = {
            'website': website,
            'main_object': page or website,
            'website_page': page or request.env['website.page'],
        }
        ctx.update(extra)
        return self._render_template(template, ctx)

    @http.route('/services/whatsapp-integration', type='http', auth='public', website=True)
    def whatsapp_integration(self, **kw):
        return self._render_with_page('dics_theme.page_whatsapp_integration')

    @http.route('/services/claude-integration', type='http', auth='public', website=True)
    def claude_integration(self, **kw):
        return self._render_with_page('dics_theme.page_claude_integration')


class DataIntegerWebsiteController(Website):
    """Static page routing for the Datainteger Consultancy Services Solutions theme."""

    def _is_dics_website(self):
        website = request.website
        dics_website = request.env.ref(
            'dics_theme.dics_website', raise_if_not_found=False)
        return bool(website and dics_website and website.id == dics_website.id)

    def _render_page(self, template, page_name):
        website = request.website
        # Find the website.page record matching the current URL
        page = request.env['website.page'].sudo().search([
            ('url', '=', request.httprequest.path),
            ('website_id', '=', website.id),
        ], limit=1)
        view = request.env.ref(template, raise_if_not_found=False)
        return request.render(view.id if view else template, {
            'website': website,
            'main_object': page or website,
            'website_page': page or request.env['website.page'],
            'pageName': page_name,
        })

    @http.route()
    def index(self, **kw):
        if self._is_dics_website():
            return self._render_page('dics_theme.dics_home', 'home')
        return super().index(**kw)

    @http.route('/<path:invalid_path>', type='http', auth='public', website=True)
    def handle_404(self, invalid_path, **kw):
        if not self._is_dics_website():
            return request.not_found()
        view = request.env.ref('dics_theme.page_404', raise_if_not_found=False)
        return request.render(view.id if view else 'dics_theme.page_404', {
            'invalid_path': invalid_path,
        })

    @http.route('/services/odoo-erp', type='http', auth='public', website=True)
    def odoo_erp_services(self, **kw):
        return self._render_page('dics_theme.dics_odoo_services', 'odoo_erp')

    @http.route('/services/ai-solutions', type='http', auth='public', website=True)
    def ai_solutions_service(self, **kw):
        return self._render_page('dics_theme.dics_ai_solutions', 'ai_solutions')

    @http.route('/services/web-mobile-apps', type='http', auth='public', website=True)
    def web_mobile_service(self, **kw):
        return self._render_page('dics_theme.dics_web_mobile', 'web_mobile')



    @http.route('/services/custom-software', type='http', auth='public', website=True)
    def custom_software_service(self, **kw):
        return self._render_page('dics_theme.dics_custom_software', 'custom_software')

    @http.route('/services/digital-marketing', type='http', auth='public', website=True)
    def digital_marketing_service(self, **kw):
        return self._render_page('dics_theme.dics_digital_marketing', 'digital_marketing')

    @http.route('/services/saas-products', type='http', auth='public', website=True)
    def saas_service(self, **kw):
        return self._render_page('dics_theme.dics_saas', 'saas')

    @http.route('/favicon.ico', type='http', auth='public', website=True, sitemap=False)
    def favicon(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return request.redirect('/dics_theme/static/src/img/favicon.svg')

    @http.route('/services', type='http', auth='public', website=True)
    def services(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_services', 'services')

    @http.route(['/about-us', '/about'], type='http', auth='public', website=True)
    def about(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_about', 'about')

    @http.route(['/contactus', '/contact'], type='http', auth='public', website=True)
    def contact(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page('dics_theme.dics_contact', 'contact')

    @http.route('/contactus-thank-you', type='http', auth='public', website=True)
    def contact_thank_you(self, **kw):
        if not self._is_dics_website():
            return request.not_found()
        return self._render_page(
            'dics_theme.dics_contact_thank_you', 'contact_thank_you')





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

            # 1. Draft invoices -> Pending
            if invoice.state == "draft":
                totals["pending"] += sign * abs(invoice.amount_total)
                continue

            # 2. Ignore anything except posted invoices
            if invoice.state != "posted":
                continue

            # 3. Ignore fully-paid invoices
            if invoice.currency_id.is_zero(invoice.amount_residual):
                continue

            amount = sign * abs(invoice.amount_residual)

            # Add/subtract from Total Outstanding
            totals["outstanding"] += amount

            # 4. Add past-due invoices AND past-due credit notes to Overdue
            if invoice.invoice_date_due and invoice.invoice_date_due < today:
                totals["overdue"] += amount

        # 5. ACCOUNTING SAFETY CLAMPS:
        # - Overdue can never be negative
        # - Overdue can NEVER exceed Total Outstanding (credit notes offset overdue first)
        totals["outstanding"] = max(0.0, totals["outstanding"])
        totals["overdue"] = max(0.0, min(totals["overdue"], totals["outstanding"]))
        totals["pending"] = max(0.0, totals["pending"])

        # Prevent floating-point drift
        for key in totals:
            totals[key] = round(totals[key], 2)

        return totals

    def _prepare_my_invoices_values(self, page, date_begin, date_end, sortby, filterby, domain=None, url="/my/invoices"):
        """
        Override Odoo 17's native value preparation to calculate summary card totals
        globally across all matching records before pagination slicing occurs.
        """
        values = super()._prepare_my_invoices_values(
            page, date_begin, date_end, sortby, filterby, domain=domain, url=url
        )

        AccountInvoice = request.env['account.move']

        # Reconstruct the exact global search domain used by Odoo for the active filter/dates
        search_domain = expression.AND([
            domain or [],
            self._get_invoices_domain(),
        ])

        searchbar_filters = self._get_account_searchbar_filters()
        active_filter = filterby if filterby in searchbar_filters else 'all'
        search_domain += searchbar_filters[active_filter]['domain']

        if date_begin and date_end:
            search_domain += [('create_date', '>', date_begin), ('create_date', '<=', date_end)]

        # Search ALL matching invoices globally across all pages (no limit/offset)
        if AccountInvoice.check_access_rights('read', raise_exception=False):
            all_invoices = AccountInvoice.search(search_domain)
        else:
            all_invoices = AccountInvoice

        _logger.info("Global matching invoices count for summary cards: %s", len(all_invoices))

        # Compute global totals and inject into QWeb template context
        values['dics_invoice_totals'] = self._compute_invoice_summary_totals(all_invoices)

        return values