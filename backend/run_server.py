"""
SupplyLens Standalone Python Backend Server (Port 8000)
Pure Python 3 standard library server with zero third-party dependencies.
Dispatches all REST endpoints directly to backend models, OR solver, neural networks, and AI services.
"""

import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

# Ensure backend root is on sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.data.seed_data import SUPPLIERS_SEED, DESTINATIONS_SEED
from app.services.logistics.cost_engine import LandedCostEngine
from app.services.logistics.scenario_service import ScenarioService
from app.services.recommendation_service import generate_recommendations
from app.services.optimization_engine import solve_sourcing_allocation
from app.services.ai_service import ai_service
from app.services.business_service import classify_budget, generate_business_snapshot, get_stage_guidelines
from app.services.profile_service import validate_and_save_profile, get_profile
from app.services.maps.service import MapService
from ml import neural_service
from optimization import solve_sourcing_problem, generate_alternatives_for_problem
from optimization.model.problem import SourcingProblem
from optimization.model.variables import CandidateSupplier
from optimization.scenarios.what_if import run_what_if_simulation

class SupplyLensRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Concise logging
        sys.stderr.write(f"[{self.log_date_time_string()}] {self.command} {self.path} -> {args[0]}\n")

    def _set_cors_headers(self, status=200):
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Content-Type", "application/json")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers(204)

    def _read_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw = self.rfile.read(content_length).decode("utf-8")
            try:
                return json.loads(raw)
            except Exception:
                return {}
        return {}

    def _send_json(self, data, status=200):
        self._set_cors_headers(status)
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_GET(self):
        try:
            parsed = urllib.parse.urlparse(self.path)
            path = parsed.path.rstrip("/")
            query = urllib.parse.parse_qs(parsed.query)

            if path == "" or path == "/api/health":
                self._send_json({"status": "healthy", "service": "SupplyLens Standalone Server", "port": 8000})
            elif path == "/api/destinations":
                self._send_json(DESTINATIONS_SEED)
            elif path == "/api/suppliers":
                country = query.get("country", ["all"])[0]
                product = query.get("product", [None])[0]
                max_moq = query.get("max_moq", [None])[0]
                filtered = list(SUPPLIERS_SEED)
                if country != "all":
                    filtered = [s for s in filtered if s.get("country", "").lower() == country.lower()]
                if product:
                    filtered = [s for s in filtered if any(product.lower() in p.get("name", "").lower() for p in s.get("products", []))]
                if max_moq:
                    try:
                        moq_val = int(max_moq)
                        filtered = [s for s in filtered if any(p.get("moq", 0) <= moq_val for p in s.get("products", []))]
                    except ValueError:
                        pass
                self._send_json(filtered)
            elif path.startswith("/api/suppliers/"):
                sub_id = path.split("/")[-1]
                if sub_id == "saved":
                    self._send_json([])
                elif sub_id == "clusters":
                    zoom = int(query.get("zoom", [4])[0])
                    self._send_json(MapService.get_map_clusters_and_markers(SUPPLIERS_SEED, zoom_level=zoom))
                else:
                    s = next((item for item in SUPPLIERS_SEED if str(item.get("id")) == sub_id), None)
                    if s:
                        self._send_json(s)
                    else:
                        self._send_json({"detail": "Supplier not found"}, 404)
            elif path == "/api/scenarios/saved":
                self._send_json(ScenarioService.get_saved_scenarios())
            elif path == "/api/business/profile":
                b_id = query.get("business_id", ["biz-001"])[0]
                self._send_json(get_profile(b_id) or {})
            elif path == "/api/ml/models":
                self._send_json(neural_service.get_models_metadata())
            else:
                self._send_json({"error": "Endpoint not found", "path": path}, 404)
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip("/")
        body = self._read_json_body()

        try:
            if path == "/api/ai/extract":
                text = body.get("text", "") or body.get("query", "")
                self._send_json(ai_service.extract_business_info(text))
            elif path == "/api/ai/clarify":
                self._send_json(ai_service.detect_missing_info_and_clarify(body))
            elif path == "/api/ai/requirements":
                idea = body.get("idea", "")
                sector = body.get("sector", "Sustainable Packaging")
                self._send_json(ai_service.generate_requirements(idea, sector))
            elif path == "/api/business/profile":
                self._send_json(validate_and_save_profile(body))
            elif path == "/api/suppliers/natural-search":
                q = body.get("query", "")
                intent = ai_service.interpret_natural_search(q)
                self._send_json({"intent": intent, "suppliers": SUPPLIERS_SEED[:4]})
            elif path == "/api/suppliers/compare":
                ids = body.get("supplier_ids", [])
                profile = body.get("business_profile") or get_profile("biz-001") or {}
                selected = [s for s in SUPPLIERS_SEED if s.get("id") in ids]
                self._send_json({
                    "suppliers": selected,
                    "ai_summary": ai_service.summarize_supplier_comparison(selected, profile)
                })
            elif path == "/api/suppliers/recommendations":
                profile = body.get("business_profile") or get_profile("biz-001") or {}
                self._send_json(generate_recommendations(profile, SUPPLIERS_SEED))
            elif path == "/api/assistant/ask":
                q = body.get("query") or body.get("question", "")
                profile = body.get("business_profile") or get_profile("biz-001") or {}
                sups = body.get("suppliers") or SUPPLIERS_SEED
                self._send_json(ai_service.answer_assistant_query(q, profile, sups))
            elif path == "/api/scenarios/calculate":
                sup_id = body.get("supplier_id")
                qty = int(body.get("quantity", 5000))
                dest_city = body.get("destination_city", "Bhubaneswar")
                dest_country = body.get("destination_country", "India")
                dest_type = body.get("destination_type", "Business")
                p_name = body.get("product_name")
                b_prof = body.get("business_profile")
                b_id = body.get("business_id")
                if not b_prof and b_id:
                    b_prof = get_profile(b_id)
                scen = ScenarioService.calculate_scenario(
                    supplier_id=sup_id,
                    quantity=qty,
                    destination_city=dest_city,
                    destination_country=dest_country,
                    destination_type=dest_type,
                    product_name=p_name,
                    business_profile=b_prof,
                    scenario_id=body.get("scenario_id")
                )
                self._send_json(scen)
            elif path == "/api/scenarios/compare":
                scens = body.get("scenarios") or body.get("items") or []
                profile = body.get("business_profile")
                b_id = body.get("business_id")
                if not profile and b_id:
                    profile = get_profile(b_id)
                res = ScenarioService.compare_scenarios(scens, profile or {})
                self._send_json(res)
            elif path == "/api/scenarios/what-if":
                scen_ids = body.get("scenario_ids") or ([body.get("scenario_id")] if body.get("scenario_id") else [])
                new_qty = int(body.get("new_quantity", 10000))
                dest_city = body.get("destination_city", "Bhubaneswar")
                dest_country = body.get("destination_country", "India")
                b_prof = body.get("business_profile")
                b_id = body.get("business_id")
                if not b_prof and b_id:
                    b_prof = get_profile(b_id)
                res = ScenarioService.what_if_recalculate(
                    scenario_ids=scen_ids,
                    new_quantity=new_qty,
                    destination_city=dest_city,
                    destination_country=dest_country,
                    business_profile=b_prof
                )
                self._send_json(res)
            elif path == "/api/scenarios/explain":
                scen = body.get("scenario", {})
                profile = body.get("business_profile") or get_profile("biz-001") or {}
                self._send_json(ai_service.explain_sourcing_scenario(scen, profile))
            elif path == "/api/scenarios/ask":
                q = body.get("question") or body.get("query", "")
                scens = body.get("scenarios", [])
                profile = body.get("business_profile") or get_profile("biz-001") or {}
                self._send_json(ai_service.answer_sourcing_question(q, scens, profile))
            elif path == "/api/scenarios/save":
                scen_id = body.get("scenario_id", "")
                self._send_json(ScenarioService.save_scenario(scen_id))
            elif path == "/api/optimization/solve" or path == "/api/optimization/allocate":
                req_qty = int(body.get("required_quantity", 5000))
                b_lim = body.get("budget_limit")
                b_lim = float(b_lim) if b_lim is not None else None
                obj = body.get("objective_type", "balanced")
                m_sup = int(body.get("max_suppliers", 3))
                m_share = float(body.get("max_supplier_share", 1.0))
                m_cshare = float(body.get("max_country_share", 1.0))
                pref = body.get("preferred_countries")
                excl = body.get("excluded_countries")
                s_ids = body.get("supplier_ids")
                p_cat = body.get("product_category")
                b_id = body.get("business_id", "biz-001")
                b_prof = body.get("business_profile")
                n_asst = bool(body.get("neural_assisted", True))
                res = solve_sourcing_problem(
                    required_quantity=req_qty,
                    budget_limit=b_lim,
                    objective_type=obj,
                    max_suppliers=m_sup,
                    max_supplier_share=m_share,
                    max_country_share=m_cshare,
                    preferred_countries=pref,
                    excluded_countries=excl,
                    supplier_ids=s_ids,
                    product_category=p_cat,
                    business_id=b_id,
                    business_profile=b_prof,
                    neural_assisted=n_asst,
                    save_run=False
                )
                self._send_json(res)
            elif path == "/api/optimization/scenarios":
                req_qty = int(body.get("required_quantity", 5000))
                b_lim = body.get("budget_limit")
                b_lim = float(b_lim) if b_lim is not None else None
                m_sup = int(body.get("max_suppliers", 3))
                m_share = float(body.get("max_supplier_share", 1.0))
                m_cshare = float(body.get("max_country_share", 1.0))
                pref = body.get("preferred_countries")
                excl = body.get("excluded_countries")
                s_ids = body.get("supplier_ids")
                p_cat = body.get("product_category")
                alts = generate_alternatives_for_problem(
                    required_quantity=req_qty,
                    budget_limit=b_lim,
                    max_suppliers=m_sup,
                    max_supplier_share=m_share,
                    max_country_share=m_cshare,
                    preferred_countries=pref,
                    excluded_countries=excl,
                    supplier_ids=s_ids,
                    product_category=p_cat
                )
                self._send_json(alts)
            elif path == "/api/optimization/what-if":
                base_request = body.get("base_request", {})
                req_qty = int(base_request.get("required_quantity", 5000))
                b_lim = base_request.get("budget_limit")
                b_lim = float(b_lim) if b_lim is not None else None
                candidates = [
                    CandidateSupplier.from_dict(s)
                    for s in SUPPLIERS_SEED
                    if not base_request.get("supplier_ids") or s["id"] in base_request["supplier_ids"]
                ]
                base_problem = SourcingProblem(
                    required_quantity=req_qty,
                    budget_limit=b_lim,
                    candidate_suppliers=candidates,
                    objective_type=base_request.get("objective_type", "balanced"),
                    max_suppliers=int(base_request.get("max_suppliers", 3)),
                    max_supplier_share=float(base_request.get("max_supplier_share", 1.0)),
                    max_country_share=float(base_request.get("max_country_share", 1.0)),
                    preferred_countries=base_request.get("preferred_countries", []),
                    excluded_countries=base_request.get("excluded_countries", [])
                )
                result = run_what_if_simulation(
                    base_problem=base_problem,
                    quantity_delta_pct=body.get("quantity_delta_pct"),
                    new_quantity=body.get("new_quantity"),
                    budget_delta_pct=body.get("budget_delta_pct"),
                    new_budget=body.get("new_budget"),
                    exclude_supplier_ids=body.get("exclude_supplier_ids"),
                    only_country=body.get("only_country")
                )
                self._send_json(result)
            elif path == "/api/optimization/command":
                cmd = body.get("command", "")
                curr = body.get("current_request", {})
                self._send_json(ai_service.parse_optimization_command(cmd, curr))
            elif path == "/api/optimization/explain":
                plan = body.get("plan", {})
                profile = body.get("business_profile", {})
                query = body.get("user_query")
                self._send_json(ai_service.explain_optimization_plan(plan, profile, query))
            elif path == "/api/ml/predict-fit":
                prof = body.get("business_profile", {})
                sup = body.get("supplier", {})
                self._send_json(neural_service.predict_supplier_fit(prof, sup))
            elif path == "/api/ml/predict-price":
                sup = body.get("supplier", {})
                qty = int(body.get("quantity", 5000))
                p_name = sup.get("name", "Standard Packaging")
                p_type = sup.get("supplier_type", "OEM")
                p_country = sup.get("country", "India")
                self._send_json(neural_service.predict_price_range(p_name, "Packaging", p_country, qty, p_type))
            elif path == "/api/ml/predict-risk":
                sup = body.get("supplier", {})
                self._send_json(neural_service.predict_supplier_risk(sup))
            elif path == "/api/ml/batch-rank":
                prof = body.get("business_profile", {})
                sups = body.get("suppliers", SUPPLIERS_SEED)
                self._send_json(neural_service.rank_suppliers_for_profile(prof, sups))
            else:
                self._send_json({"error": "POST endpoint not found", "path": path}, 404)
        except Exception as e:
            self._send_json({"error": str(e)}, 500)


def run():
    port = 8000
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, SupplyLensRequestHandler)
    print(f"==================================================")
    print(f" SUPPLYLENS BACKEND RUNNING ON http://localhost:{port}")
    print(f" Connected to Gemini 2.5 Flash & Geoapify Routing")
    print(f"==================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == "__main__":
    run()
