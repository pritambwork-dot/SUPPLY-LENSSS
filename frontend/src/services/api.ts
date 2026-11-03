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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

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
      let errorMessage = `HTTP error! status: ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // Ignore JSON parse error if response is not JSON
      }
      throw new Error(errorMessage);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return (await res.text()) as any;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds');
    }
    throw error;
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


