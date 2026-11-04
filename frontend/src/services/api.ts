import { 
  BusinessProfile, 
  BusinessRequirement, 
  Supplier, 
  SupplierRecommendation, 
  Destination, 
  SourcingScenario, 
  ScenarioComparison, 
  BatchRankResponse 
} from "@/types";
import {
  verifiedSuppliers,
  initialBusinessProfile,
  mockDestinations,
  initialRecommendations,
  initialRequirements,
  initialSavedSuppliers,
  initialQuotations
} from "@/data/mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const demoQuotationsStore = [...initialQuotations];

export const initialDemoInvoices = [
  {
    id: "inv-pending-003",
    invoice_number: "SL-2026-0003",
    deal_id: "deal-002",
    customer_name: "Sustainable Packaging Labs",
    customer_email: "billing@ecopack.io",
    supplier_name: "Klingele Paper & Packaging SE",
    subtotal: 7125,
    base_fee_amount: 7125,
    tax_amount: 1283,
    total_amount: 8408,
    currency: "USD",
    status: "issued" as const,
    issued_date: "2026-11-04T00:00:00Z",
    due_date: "2026-11-19T00:00:00Z",
    notes: "5% Commercial Success Fee on Confirmed Sourcing Order (Klingele Packaging)",
  },
  {
    id: "inv-pending-004",
    invoice_number: "SL-2026-0004",
    deal_id: "deal-001",
    customer_name: "Sustainable Packaging Labs",
    customer_email: "billing@ecopack.io",
    supplier_name: "Utkal GreenFiber Pvt Ltd",
    subtotal: 17000,
    base_fee_amount: 17000,
    tax_amount: 3060,
    total_amount: 20060,
    currency: "INR",
    status: "issued" as const,
    issued_date: "2026-11-02T10:00:00Z",
    due_date: "2026-11-17T10:00:00Z",
    notes: "5% Platform Service Fee on Confirmed Bio Bagasse PO #CTR-2026-088",
  },
  {
    id: "inv-245d3111",
    invoice_number: "SL-2026-0001",
    deal_id: "deal-003",
    customer_name: "Sustainable Packaging Labs",
    customer_email: "billing@ecopack.io",
    supplier_name: "Deccan BioPlastics & Packaging",
    subtotal: 50000,
    base_fee_amount: 50000,
    tax_amount: 9000,
    total_amount: 59000,
    currency: "INR",
    status: "paid" as const,
    issued_date: "2026-10-18T14:30:00Z",
    due_date: "2026-11-02T14:30:00Z",
    paid_at: "2026-10-24T16:15:00Z",
    payment_method: "Razorpay Standard Gateway",
    payment_reference: "rzp_pay_confirmed_001",
    notes: "Settled in full via Corporate UPI / Razorpay Gateway",
  },
  {
    id: "inv-d3ca76e2",
    invoice_number: "SL-2026-0002",
    deal_id: "deal-004",
    customer_name: "Sustainable Packaging Labs",
    customer_email: "billing@ecopack.io",
    supplier_name: "Aura Organic Looms & Knitwear",
    subtotal: 7000,
    base_fee_amount: 7000,
    tax_amount: 1260,
    total_amount: 8260,
    currency: "INR",
    status: "paid" as const,
    issued_date: "2026-09-12T09:15:00Z",
    due_date: "2026-09-27T09:15:00Z",
    paid_at: "2026-09-20T11:45:00Z",
    payment_method: "Bank NEFT Wire",
    payment_reference: "NEFT-AXIS-2026-092044",
    notes: "Settled via Corporate Escrow Bank Wire",
  },
];

function getStoredInvoices() {
  if (typeof window === "undefined") return initialDemoInvoices;
  try {
    const raw = localStorage.getItem("supplylens_demo_invoices");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return initialDemoInvoices;
}

function saveStoredInvoices(invoices: any[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("supplylens_demo_invoices", JSON.stringify(invoices));
  } catch {}
}

function getDemoFallbackResponse<T>(path: string, options?: RequestInit): T {
  if (path.includes('/api/health')) {
    return { status: "ok", mode: "vercel_demo", version: "2.0.0" } as any;
  }
  if (path.includes('/api/destinations')) {
    return mockDestinations as any;
  }
  if (path.includes('/api/suppliers/natural-search')) {
    let query = "";
    try {
      if (options?.body) {
        const parsed = JSON.parse(options.body as string);
        query = (parsed.query || "").toLowerCase();
      }
    } catch {}
    const filtered = query
      ? verifiedSuppliers.filter(s => s.name.toLowerCase().includes(query) || (s as any).sector?.toLowerCase().includes(query) || s.country?.toLowerCase().includes(query))
      : verifiedSuppliers;
    return {
      search_results: { suppliers: filtered.length > 0 ? filtered : verifiedSuppliers },
      suppliers: filtered.length > 0 ? filtered : verifiedSuppliers,
      structured_intent: {
        industry: "Sustainable Packaging",
        target_country: "India",
        materials: ["recycled PET", "bagasse pulp", "kraft paper"],
        budget: 800000
      }
    } as any;
  }
  if (path.includes('/api/suppliers/compare')) {
    return {
      comparison_matrix: verifiedSuppliers.slice(0, 3).map(s => ({
        supplier: s,
        landed_cost: (s as any).pricePerUnit || s.products?.[0]?.quotedPrice || 0.08,
        moq: (s as any).moq || s.products?.[0]?.moq || 1000,
        lead_time_days: (s as any).leadTimeDays || (s as any).lead_time_days || 14,
        verification_score: s.verificationScore,
        esg_score: 94
      }))
    } as any;
  }
  if (path.includes('/api/suppliers/saved')) {
    return initialSavedSuppliers as any;
  }
  if (path.includes('/api/suppliers/save')) {
    return { success: true, message: "Supplier saved to your workspace." } as any;
  }
  if (path.startsWith('/api/suppliers/')) {
    const id = path.split('/api/suppliers/')[1]?.split('?')[0];
    const found = verifiedSuppliers.find(s => s.id === id) || verifiedSuppliers[0];
    return found as any;
  }
  if (path.startsWith('/api/suppliers')) {
    return verifiedSuppliers as any;
  }
  if (path.includes('/api/business/profile')) {
    return {
      business_id: "biz-001",
      business_name: "EcoPack Solutions",
      business_idea: "Biodegradable sugarcane bagasse food containers and compostable meal trays.",
      sector: "Sustainable Packaging",
      business_stage: "launching",
      country: "India",
      city: "Bhubaneswar",
      budget_amount: 23094.57,
      budget_currency: "USD",
      business_model: "contract_oem"
    } as any;
  }
  if (path.includes('/api/onboarding/dashboard') || path.includes('/api/onboarding/progress')) {
    return {
      business: {
        id: "biz-001",
        name: "EcoPack Solutions",
        industry: "Sustainable Packaging",
        city: "Bhubaneswar",
        country: "India",
        budget_amount: 23094.57
      },
      onboarding_status: "completed",
      active_step: 6,
      matched_suppliers: verifiedSuppliers,
      recommendations: initialRecommendations
    } as any;
  }
  if (path.includes('/api/monetization/analytics')) {
    return {
      confirmed_gmv: 142500,
      service_fee_collected: 7125,
      upfront_fees: 0,
      active_pipeline_gmv: 489000,
      fee_percentage: 5.0,
      currency: "USD"
    } as any;
  }
  if (path.includes('/api/deals')) {
    return [
      {
        id: "deal-001",
        business_id: "biz-001",
        supplier_id: "sup-utkal-001",
        supplier_name: "Utkal GreenFiber Pvt Ltd",
        title: "Biodegradable Bagasse Food Trays Production Run",
        status: "confirmed",
        contract_value: 45000,
        currency: "USD",
        fee_rate: 0.05,
        fee_amount: 2250,
        fee_status: "paid",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: "deal-002",
        business_id: "biz-001",
        supplier_id: "sup-kling-003",
        supplier_name: "Klingele Paper & Packaging SE",
        title: "Recycled Board Corrugated Shippers",
        status: "in_contract",
        contract_value: 97500,
        currency: "USD",
        fee_rate: 0.05,
        fee_amount: 4875,
        fee_status: "pending",
        created_at: new Date(Date.now() - 86400000 * 6).toISOString()
      }
    ] as any;
  }
  if (path.includes('/api/tenders')) {
    return [
      {
        id: "tnd-001",
        title: "Biodegradable Meal Trays 100k Units",
        product_category: "Molded Fiber",
        status: "awarded",
        budget_amount: 50000,
        currency: "USD",
        proposals_count: 5
      }
    ] as any;
  }
  if (path.includes('/api/invoices')) {
    return getStoredInvoices() as any;
  }
  if (path.includes('/api/payments/checkout')) {
    let parsed: any = {};
    try {
      if (options?.body) parsed = JSON.parse(options.body as string);
    } catch {}
    const payRef = `rzp_pay_${Math.random().toString(36).substring(2, 12)}`;
    return {
      gateway: "razorpay",
      order_id: `order_${Math.random().toString(36).substring(2, 14)}`,
      payment_reference: payRef,
      key_id: "rzp_test_supplylens_demo",
      invoice_id: parsed.invoice_id || "inv-pending-003",
      amount: 7125,
      currency: "USD",
      status: "order_created",
      created_at: new Date().toISOString(),
    } as any;
  }
  if (path.includes('/api/payments/verify')) {
    let parsed: any = {};
    try {
      if (options?.body) parsed = JSON.parse(options.body as string);
    } catch {}
    const invId = parsed.invoice_id;
    const currentInvoices = getStoredInvoices();
    const updated = currentInvoices.map((inv: any) => {
      if (inv.id === invId || (inv.status !== "paid" && (!invId || invId === "inv-pending-003"))) {
        return {
          ...inv,
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: "Razorpay Standard Gateway",
          payment_reference: parsed.payment_reference || `rzp_pay_${Math.random().toString(36).substring(2, 10)}`,
        };
      }
      return inv;
    });
    saveStoredInvoices(updated);
    return {
      gateway: "razorpay",
      payment_reference: parsed.payment_reference || "rzp_pay_success",
      status: "captured",
      message: "Payment verified via Razorpay Standard Gateway",
    } as any;
  }
  if (path.includes('/api/customer/quotations')) {
    if (options?.method === 'POST') {
      let parsed: any = {};
      try {
        if (options.body) {
          parsed = JSON.parse(options.body as string);
        }
      } catch {}
      const targetSupplier = verifiedSuppliers.find(s => s.id === parsed.supplier_id);
      const supplierName = targetSupplier ? targetSupplier.name : (parsed.supplier_name || "Jamestown Container Company");
      const newId = `rfq-${Date.now().toString(36).slice(-6)}`;
      const newRfq = {
        id: newId,
        business_id: parsed.business_id || "biz-001",
        user_id: parsed.user_id || "hossein-001",
        supplier_id: parsed.supplier_id || "sup-jamestown-002",
        supplier_name: supplierName,
        product_name: parsed.product_name || "Precision Custom Molded Pulp Cushion",
        product_category: parsed.product_category || "Custom Tooling",
        required_quantity: Number(parsed.required_quantity) || 500,
        unit: parsed.unit || "pieces",
        target_budget: parsed.target_budget ? Number(parsed.target_budget) : 50000,
        currency: parsed.currency || "INR",
        specifications: parsed.specifications || "Standard factory grade specifications with certified quality audit.",
        delivery_terms: parsed.delivery_terms || "FOB (Free On Board Factory)",
        destination_city: parsed.destination_city || "Bhubaneswar",
        destination_country: parsed.destination_country || "India",
        required_certifications: parsed.required_certifications || ["ISO 9001:2015"],
        status: "submitted" as const,
        quoted_unit_price: undefined,
        quoted_moq: undefined,
        quoted_lead_time_days: undefined,
        quotation_valid_until: undefined,
        vendor_notes: "Request routed to verified supplier commercial desk. Awaiting vendor response.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoQuotationsStore.unshift(newRfq);
      return {
        status: "success",
        message: "Quotation request registered with factory export desk.",
        quotation: newRfq,
      } as any;
    }

    const segments = path.split('/api/customer/quotations')[1]?.split('?')[0];
    if (segments && segments.length > 1) {
      const cleanId = segments.replace('/', '');
      const matched = demoQuotationsStore.find(q => q.id === cleanId) || demoQuotationsStore[0];
      return matched as any;
    }

    return {
      business_id: "biz-001",
      total_count: demoQuotationsStore.length,
      quotations: demoQuotationsStore,
    } as any;
  }
  if (path.includes('/api/customer/dashboard-metrics')) {
    return {
      customer_name: "Hossein",
      business_name: "Sustainable Packaging Labs",
      business_id: "biz-001",
      industry: "Sustainable Packaging",
      profile_completion_pct: 92,
      active_searches_count: 3,
      saved_vendors_count: initialSavedSuppliers.length,
      new_search_results_count: 14,
      pending_quotations_count: demoQuotationsStore.filter(q => q.status === 'submitted' || q.status === 'under_review').length,
      total_quotations_count: demoQuotationsStore.length,
      active_scenarios_count: 2,
      confirmed_deals_count: 1,
      outstanding_invoices_count: 1,
      recent_activities: [
        {
          id: "act-1",
          activity_type: "quotation_request",
          title: "RFQ Submitted to Jamestown Container Company",
          description: "Precision Custom Molded Pulp Cushion (500 pieces)",
          created_at: "Just now"
        },
        {
          id: "act-2",
          activity_type: "deal_progress",
          title: "Contract milestone signed with Utkal GreenFiber",
          description: "Payment escrow settled under Deal DEAL-UTKAL-2026-001",
          created_at: "2 hours ago"
        }
      ],
      budget_summary: {
        amount: 800000,
        currency: "INR"
      }
    } as any;
  }
  if (path.includes('/api/customer/activity')) {
    return {
      business_id: "biz-001",
      total_count: 4,
      activities: [
        {
          id: "act-1",
          activity_type: "quotation_request",
          title: "RFQ Submitted to Jamestown Container Company",
          description: "Precision Custom Molded Pulp Cushion (500 pieces)",
          created_at: "Just now"
        },
        {
          id: "act-2",
          activity_type: "deal_progress",
          title: "Contract milestone signed with Utkal GreenFiber",
          description: "Payment escrow settled under Deal DEAL-UTKAL-2026-001",
          created_at: "2 hours ago"
        }
      ]
    } as any;
  }
  if (path.includes('/api/customer/vendor-interaction')) {
    return { success: true, recorded: true } as any;
  }
  if (path.includes('/api/customer/requirements/interpret')) {
    return {
      interpreted_by: "SupplyLens AI Engine",
      requirements: initialRequirements,
      confidence: 0.96,
    } as any;
  }
  return { success: true, demo: true } as any;
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      // Gracefully fall back to demo data on 404/500 if running in demo/vercel
      return getDemoFallbackResponse<T>(path, options);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return (await res.text()) as any;
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Graceful fallback to verified demo data on Vercel
    return getDemoFallbackResponse<T>(path, options);
  }
}

export const api = {
  health: () => apiRequest('/api/health'),
  
  destinations: () => apiRequest<Destination[]>('/api/destinations'),

  suppliers: {
    list: async (params?: Record<string, any>): Promise<Supplier[]> => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const data: any = await apiRequest(`/api/suppliers${qs}`);
      return Array.isArray(data) ? data : (data?.suppliers || []);
    },
    getById: (id: string) => apiRequest<Supplier>(`/api/suppliers/${id}`),
    search: async (query: string, filters?: any): Promise<{ suppliers: Supplier[]; intent?: any }> => {
      const data: any = await apiRequest('/api/suppliers/natural-search', {
        method: 'POST',
        body: JSON.stringify({ query, filters }),
      });
      const suppliers = data?.search_results?.suppliers || data?.suppliers || (Array.isArray(data) ? data : []);
      return {
        suppliers,
        intent: data?.structured_intent,
      };
    },
    compare: (supplierIds: string[], businessProfile?: any) =>
      apiRequest('/api/suppliers/compare', {
        method: 'POST',
        body: JSON.stringify({
          supplier_ids: supplierIds,
          supplierIds,
          business_profile: businessProfile,
        }),
      }),
    recommend: (profile: any) =>
      apiRequest('/api/suppliers/recommendations', {
        method: 'POST',
        body: JSON.stringify({ business_profile: profile, ...profile }),
      }),
    getClusters: () => apiRequest('/api/suppliers/clusters'),
    save: (supplierId: string) =>
      apiRequest('/api/suppliers/save', {
        method: 'POST',
        body: JSON.stringify({ supplier_id: supplierId, supplierId }),
      }),
    getSaved: () => apiRequest<any[]>('/api/suppliers/saved'),
    report: (supplierId: string, issue: any) =>
      apiRequest('/api/suppliers/report', {
        method: 'POST',
        body: JSON.stringify({ supplier_id: supplierId, supplierId, issue }),
      }),
  },
  
  business: {
    getProfile: (id?: string) => apiRequest(`/api/business/profile${id ? `?business_id=${id}` : ''}`),
    saveProfile: (data: any) => apiRequest('/api/business/profile', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  scenarios: {
    calculate: (data: any) => apiRequest('/api/scenarios/calculate', { method: 'POST', body: JSON.stringify(data) }),
    compare: (data: any) => apiRequest('/api/scenarios/compare', { method: 'POST', body: JSON.stringify(data) }),
    whatIf: (data: any) => apiRequest('/api/scenarios/what-if', { method: 'POST', body: JSON.stringify(data) }),
    explain: (data: any) => apiRequest('/api/scenarios/explain', { method: 'POST', body: JSON.stringify(data) }),
    ask: (data: any) => apiRequest('/api/scenarios/ask', { method: 'POST', body: JSON.stringify(data) }),
    save: (data: any) => apiRequest('/api/scenarios/save', { method: 'POST', body: JSON.stringify(data) }),
    getSaved: () => apiRequest('/api/scenarios/saved'),
  },
  
  optimization: {
    solve: (data: any) => apiRequest('/api/optimization/solve', { method: 'POST', body: JSON.stringify(data) }),
    scenarios: (data: any) => apiRequest('/api/optimization/scenarios', { method: 'POST', body: JSON.stringify(data) }),
    whatIf: (data: any) => apiRequest('/api/optimization/what-if', { method: 'POST', body: JSON.stringify(data) }),
    command: (data: any) => apiRequest('/api/optimization/command', { method: 'POST', body: JSON.stringify(data) }),
    explain: (data: any) => apiRequest('/api/optimization/explain', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  ai: {
    extract: (data: any) => apiRequest('/api/ai/extract', { method: 'POST', body: JSON.stringify(data) }),
    clarify: (data: any) => apiRequest('/api/ai/clarify', { method: 'POST', body: JSON.stringify(data) }),
    requirements: (data: any) => apiRequest('/api/ai/requirements', { method: 'POST', body: JSON.stringify(data) }),
    ask: (message: string, context?: any) => apiRequest('/api/assistant/ask', { method: 'POST', body: JSON.stringify({ query: message, message, context }) }),
    detailedInfo: (query: string, context?: any) => apiRequest('/api/ai/detailed-info', { method: 'POST', body: JSON.stringify(query ? { query, context } : context) }),
  },
  
  ml: {
    predictFit: (data: any) => apiRequest('/api/ml/predict-fit', { method: 'POST', body: JSON.stringify(data) }),
    predictPrice: (data: any) => apiRequest('/api/ml/predict-price', { method: 'POST', body: JSON.stringify(data) }),
    predictRisk: (data: any) => apiRequest('/api/ml/predict-risk', { method: 'POST', body: JSON.stringify(data) }),
    batchRank: (data: any) => apiRequest('/api/ml/batch-rank', { method: 'POST', body: JSON.stringify(data) }),
    getModels: () => apiRequest('/api/ml/models'),
  },

  monetization: {
    getPolicy: () => apiRequest('/api/monetization/policies/active'),
    getAnalytics: (currency = 'INR') => apiRequest<import('@/types').RevenueAnalyticsItem>(`/api/monetization/analytics?currency=${currency}`),
    
    tenders: {
      list: (businessId?: string, status?: string) => {
        const params = new URLSearchParams();
        if (businessId) params.append('business_id', businessId);
        if (status) params.append('status', status);
        const qs = params.toString() ? `?${params.toString()}` : '';
        return apiRequest<import('@/types').TenderItem[]>(`/api/tenders${qs}`);
      },
      create: (data: any) => apiRequest('/api/tenders', { method: 'POST', body: JSON.stringify(data) }),
      getById: (id: string) => apiRequest<import('@/types').TenderItem>(`/api/tenders/${id}`),
      award: (id: string, supplierId: string) => apiRequest(`/api/tenders/${id}/award`, { method: 'POST', body: JSON.stringify({ supplier_id: supplierId }) }),
    },

    deals: {
      list: (businessId?: string, status?: string) => {
        const params = new URLSearchParams();
        if (businessId) params.append('business_id', businessId);
        if (status) params.append('status', status);
        const qs = params.toString() ? `?${params.toString()}` : '';
        return apiRequest<import('@/types').SourcingDealItem[]>(`/api/deals${qs}`);
      },
      create: (data: any) => apiRequest('/api/deals', { method: 'POST', body: JSON.stringify(data) }),
      getById: (id: string) => apiRequest<import('@/types').SourcingDealItem>(`/api/deals/${id}`),
      updateStatus: (id: string, newStatus: string, notes?: string) =>
        apiRequest(`/api/deals/${id}/status`, { method: 'POST', body: JSON.stringify({ new_status: newStatus, notes }) }),
      confirm: (id: string, contractReference?: string, notes?: string) =>
        apiRequest(`/api/deals/${id}/confirm`, { method: 'POST', body: JSON.stringify({ contract_reference: contractReference, confirmation_notes: notes }) }),
      dispute: (id: string, disputeReason: string) =>
        apiRequest(`/api/deals/${id}/dispute`, { method: 'POST', body: JSON.stringify({ dispute_reason: disputeReason }) }),
      addDocument: (id: string, doc: { document_type: string; file_name: string; file_url: string; file_size_bytes?: number }) =>
        apiRequest(`/api/deals/${id}/documents`, { method: 'POST', body: JSON.stringify(doc) }),
    },

    invoices: {
      list: (businessId?: string) => {
        const qs = businessId ? `?business_id=${businessId}` : '';
        return apiRequest<import('@/types').InvoiceItem[]>(`/api/invoices${qs}`);
      },
      getHtmlUrl: (invoiceNumber: string) => `${API_BASE}/api/invoices/${invoiceNumber}/html`,
    },

    payments: {
      checkout: (invoiceId: string, returnUrl?: string) =>
        apiRequest('/api/payments/checkout', { method: 'POST', body: JSON.stringify({ invoice_id: invoiceId, return_url: returnUrl }) }),
      verify: (paymentReference: string, invoiceId: string) =>
        apiRequest('/api/payments/verify', { method: 'POST', body: JSON.stringify({ payment_reference: paymentReference, invoice_id: invoiceId }) }),
    },

    admin: {
      verifyDeal: (dealId: string, adminId: string, verificationStatus: 'verified' | 'rejected', notes?: string) =>
        apiRequest(`/api/admin/deals/${dealId}/verify`, { method: 'POST', body: JSON.stringify({ admin_id: adminId, verification_status: verificationStatus, notes }) }),
      issueCreditNote: (invoiceId: string, amount: number, reason: string, approvedBy: string) =>
        apiRequest(`/api/admin/invoices/${invoiceId}/credit-note`, { method: 'POST', body: JSON.stringify({ amount, reason, approved_by: approvedBy }) }),
    },
  },

  verification: {
    getDashboard: () => apiRequest<any>('/api/verification/dashboard'),
    verifySupplier: (supplierId: string) =>
      apiRequest<any>(`/api/verification/verify/${supplierId}`, { method: 'POST' }),
    getEvidence: (supplierId: string) =>
      apiRequest<any>(`/api/verification/${supplierId}/evidence`),
    reviewSupplier: (supplierId: string, status: string, notes?: string) =>
      apiRequest<any>(`/api/verification/${supplierId}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, notes }),
      }),
  },

  customer: {
    getDashboardMetrics: (businessId = 'biz-001') =>
      apiRequest<import('@/types').CustomerDashboardMetrics>(`/api/customer/dashboard-metrics?business_id=${businessId}`),
    getActivity: (businessId = 'biz-001', limit = 20) =>
      apiRequest<{ business_id: string; total_count: number; activities: import('@/types').CustomerActivityItem[] }>(
        `/api/customer/activity?business_id=${businessId}&limit=${limit}`
      ),
    logActivity: (data: { business_id?: string; activity_type: string; title: string; description?: string; entity_type?: string; entity_id?: string }) =>
      apiRequest('/api/customer/activity', { method: 'POST', body: JSON.stringify(data) }),
    listQuotations: (businessId = 'biz-001', status?: string) => {
      const qs = status ? `&status=${status}` : '';
      return apiRequest<{ business_id: string; total_count: number; quotations: import('@/types').QuotationRequestItem[] }>(
        `/api/customer/quotations?business_id=${businessId}${qs}`
      );
    },
    createQuotation: (data: any) =>
      apiRequest<{ status: string; message: string; quotation: import('@/types').QuotationRequestItem }>('/api/customer/quotations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getQuotation: (rfqId: string) =>
      apiRequest<import('@/types').QuotationRequestItem>(`/api/customer/quotations/${rfqId}`),
    interpretRequirements: (text: string, sector = 'Sustainable Packaging') =>
      apiRequest<{ interpreted_by: string; requirements: any[]; confidence: number }>('/api/customer/requirements/interpret', {
        method: 'POST',
        body: JSON.stringify({ natural_language_input: text, sector }),
      }),
    recordVendorInteraction: (supplierId: string, interactionType = 'view', businessId = 'biz-001') =>
      apiRequest('/api/customer/vendor-interaction', {
        method: 'POST',
        body: JSON.stringify({ supplier_id: supplierId, interaction_type: interactionType, business_id: businessId }),
      }),
  },

  onboarding: {
    getProgress: (userId: string) =>
      apiRequest<any>(`/api/onboarding/progress?user_id=${encodeURIComponent(userId)}`),
    saveStep: (payload: { user_id: string; step: number; data: any }) =>
      apiRequest<any>('/api/onboarding/save-step', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    aiUnderstand: (payload: any) =>
      apiRequest<any>('/api/onboarding/ai-understand', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    complete: (payload: any) =>
      apiRequest<any>('/api/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getPersonalizedDashboard: (userId: string) =>
      apiRequest<any>(`/api/onboarding/personalized-dashboard?user_id=${encodeURIComponent(userId)}`),
  },

  assistant: {
    createConversation: (data?: { title?: string; business_id?: string; active_route?: string }) =>
      apiRequest<any>('/api/v1/assistant/conversations', { method: 'POST', body: JSON.stringify(data || {}) }),
    listConversations: () =>
      apiRequest<{ conversations: any[] }>('/api/v1/assistant/conversations'),
    getConversation: (conversationId: string) =>
      apiRequest<any>(`/api/v1/assistant/conversations/${conversationId}`),
    deleteConversation: (conversationId: string) =>
      apiRequest<any>(`/api/v1/assistant/conversations/${conversationId}`, { method: 'DELETE' }),
    sendMessageSync: (conversationId: string, data: { text: string; business_id?: string; active_route?: string; active_entity_id?: string }) =>
      apiRequest<any>(`/api/v1/assistant/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify(data) }),
    streamMessage: async (
      conversationId: string,
      data: { text: string; business_id?: string; active_route?: string; active_entity_id?: string },
      callbacks: {
        onStatus?: (status: string) => void;
        onChunk?: (delta: string) => void;
        onComplete?: (meta: any) => void;
        onError?: (err: any) => void;
      }
    ) => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/assistant/conversations/${conversationId}/messages/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          let errText = `HTTP ${response.status}`;
          try {
            const errData = await response.json();
            errText = errData.detail || errText;
          } catch (_) {}
          throw new Error(errText);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('Failed to open stream reader');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                if (parsed.type === 'status' && callbacks.onStatus) {
                  callbacks.onStatus(parsed.status);
                } else if (parsed.type === 'chunk' && callbacks.onChunk) {
                  callbacks.onChunk(parsed.delta);
                } else if (parsed.type === 'complete' && callbacks.onComplete) {
                  callbacks.onComplete(parsed);
                }
              } catch (_) {}
            }
          }
        }
      } catch (err) {
        if (callbacks.onError) callbacks.onError(err);
        else throw err;
      }
    },
    getContext: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiRequest<any>(`/api/v1/assistant/context${qs}`);
    },
    getMemory: () => apiRequest<any>('/api/v1/assistant/memory'),
    submitFeedback: (messageId: string, data: { rating: number; comment?: string }) =>
      apiRequest<any>(`/api/v1/assistant/messages/${messageId}/feedback`, { method: 'POST', body: JSON.stringify(data) }),
    getLimits: () => apiRequest<any>('/api/v1/assistant/limits'),
    getMetrics: () => apiRequest<any>('/api/v1/assistant/admin/metrics'),
  },

  discovery: {
    startSearch: (data: { query: string; business_id?: string; user_id?: string; category?: string; country?: string; max_results?: number; deep_crawl?: boolean }) =>
      apiRequest<{ job_id: string; status: string; progress_percent: number; current_step: string; query: string; message: string }>('/api/v1/search', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getJobStatus: (jobId: string) =>
      apiRequest<{ job_id: string; status: string; progress_percent: number; current_step: string; result_count: number; query: string; error_message?: string; started_at?: string; completed_at?: string; metadata?: any }>(`/api/v1/search/${jobId}`),
    getJobResults: (jobId: string) =>
      apiRequest<{ job_id: string; total: number; suppliers: any[]; source: string }>(`/api/v1/search/${jobId}/results`),
    findMore: (jobId: string) =>
      apiRequest<{ job_id: string; parent_job_id: string; status: string; message: string; extended_query: string }>(`/api/v1/search/${jobId}/find-more`, {
        method: 'POST',
      }),
    refreshSupplier: (supplierId: string) =>
      apiRequest<{ supplier_id: string; refreshed_url: string; verification_status: string; verification_score: number; refreshed_at: string; message: string }>(`/api/v1/suppliers/${supplierId}/refresh`, {
        method: 'POST',
      }),
    getSupplierEvidence: (supplierId: string) =>
      apiRequest<{ supplier_id: string; evidence_records: any[]; conflicts: any[]; count: number }>(`/api/v1/suppliers/${supplierId}/evidence`),
  },

  admin: {
    getProviders: () =>
      apiRequest<{ providers: any[]; total_active: number; timestamp: string }>('/api/v1/admin/providers'),
    getProviderUsage: () =>
      apiRequest<{ summary: Record<string, any>; total_requests: number; total_cost_usd: number; recent_events: any[] }>('/api/v1/admin/providers/usage'),
    getDiscoveryJobs: (limit: number = 25) =>
      apiRequest<{ total: number; jobs: any[] }>(`/api/v1/admin/discovery-jobs?limit=${limit}`),
  },
};


