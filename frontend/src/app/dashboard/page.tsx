"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LeftNavRail } from "@/components/layout/LeftNavRail";
import { ModernDashboard } from "@/components/dashboard/ModernDashboard";
import { AIAssistantDrawer } from "@/components/assistant/AIAssistantDrawer";
import { SupplierProfileModal } from "@/components/suppliers/SupplierProfileModal";
import { LoginPage } from "@/components/auth/LoginPage";
import { UserProfileModal } from "@/components/profile/UserProfileModal";
import { authService, AuthUser } from "@/lib/auth";
import { api } from "@/services/api";
import {
  initialBusinessProfile,
  verifiedSuppliers as mockSuppliers,
  initialRequirements,
} from "@/data/mockData";
import { Supplier, BusinessProfile } from "@/types";

export default function DashboardPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState<Supplier | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // 1. Load user session
    authService.getSessionUser().then((user) => {
      const activeUser: AuthUser = user || {
        id: "usr-demo-001",
        email: "hossein@supplylens.ai",
        name: "Hossein",
        role: "Lead Sourcing Director",
        onboarding_status: "completed",
        active_step: 6,
      };
      setCurrentUser(activeUser);

      // 2. Check local saved profile
      if (typeof window !== "undefined") {
        const localSaved = localStorage.getItem("supplylens_demo_onboarding_profile");
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (parsed?.business_info) {
              setBusinessProfile((prev) => ({
                ...prev,
                name: parsed.business_info.business_name || prev.name,
                sector: parsed.business_info.industry || prev.sector,
                idea: parsed.business_info.business_description || prev.idea,
                city: parsed.business_info.city || prev.city,
                country: parsed.business_info.country || prev.country,
                budgetAmount: parsed.sourcing_preferences?.budget || prev.budgetAmount,
                budgetCurrency: parsed.sourcing_preferences?.currency || prev.budgetCurrency,
              }));
            }
          } catch {}
        }
      }

      // 3. Try to sync with backend
      api.onboarding.getPersonalizedDashboard(activeUser.id)
        .then((data) => {
          if (data?.business) {
            setBusinessProfile((prev) => ({
              ...prev,
              name: data.business.name || prev.name,
              sector: data.business.industry || prev.sector,
              city: data.business.city || prev.city,
              country: data.business.country || prev.country,
              budgetAmount: data.business.budget_amount || prev.budgetAmount,
            }));
          }
          if (data?.matched_suppliers && data.matched_suppliers.length > 0) {
            setSuppliers(data.matched_suppliers);
          }
        })
        .catch(() => {
          // Gracefully fallback to mockSuppliers
        });
    });
  }, []);

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case "dashboard":
        router.push("/dashboard");
        break;
      case "workspaces":
        router.push("/customer/requirements");
        break;
      case "suppliers":
        router.push("/customer/saved-vendors");
        break;
      case "compare":
        router.push("/customer/comparisons");
        break;
      case "verification":
        router.push("/verification");
        break;
      case "deals":
        router.push("/customer/deals");
        break;
      case "economics":
      case "optimizer":
        router.push("/customer/sourcing-plan");
        break;
      case "billing":
        router.push("/billing");
        break;
      case "revenue":
        router.push("/admin/revenue");
        break;
      case "landing":
        router.push("/");
        break;
      default:
        router.push("/dashboard");
        break;
    }
  };

  const displayUser = currentUser
    ? {
        name: currentUser.name || "Hossein",
        handle: `@${(currentUser.name || "user680523").toLowerCase().replace(/\s+/g, "")}`,
        role: currentUser.role || "Lead Sourcing Director",
      }
    : {
        name: "Hossein",
        handle: "@user680523",
        role: "Lead Sourcing Director",
      };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F9] text-slate-800 antialiased font-sans">
      {/* Sleek Left Navigation Rail */}
      <LeftNavRail
        activeTab="dashboard"
        onTabChange={handleTabChange}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenAuth={() => setIsProfileModalOpen(true)}
        isLoggedIn={true}
        theme="light"
        isCollapsed={isExpanded}
        onToggleCollapse={() => setIsExpanded(!isExpanded)}
      />

      {/* Main Cockpit Content Area */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative">
        <ModernDashboard
          businessProfile={businessProfile}
          suppliers={suppliers}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenSupplierModal={(sup) => setSelectedSupplierForModal(sup)}
          onNavigateTab={handleTabChange}
          onOpenLoginModal={() => setIsAuthModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          user={displayUser}
          onPerformLiveSearch={(query) => {
            router.push(`/vendors?search=${encodeURIComponent(query)}`);
          }}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />
      </main>

      {/* Supplier Profile Evidence Dossier Modal */}
      {selectedSupplierForModal && (
        <SupplierProfileModal
          supplier={selectedSupplierForModal}
          onClose={() => setSelectedSupplierForModal(null)}
          onToggleCompare={() => {
            setSelectedSupplierForModal(null);
            router.push("/customer/comparisons");
          }}
          isCompared={false}
          onToggleSave={() => {}}
          isSaved={false}
        />
      )}

      {/* Full AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        businessProfile={businessProfile}
        suppliers={suppliers}
        onSelectSupplierById={(id) => {
          const sup = suppliers.find((s) => s.id === id);
          if (sup) {
            setIsAssistantOpen(false);
            setSelectedSupplierForModal(sup);
          }
        }}
        onNavigateTab={(tab) => {
          setIsAssistantOpen(false);
          handleTabChange(tab);
        }}
      />

      {/* Auth / Login Modal */}
      {isAuthModalOpen && (
        <LoginPage
          isModal={true}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser({
              id: "usr-demo-001",
              email: user.email,
              name: user.name,
              role: user.role,
              onboarding_status: "completed",
              active_step: 6,
            });
            setIsAuthModalOpen(false);
          }}
        />
      )}

      {/* User Profile & Sign Out Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onSignOut={() => {
          setCurrentUser(null);
          setIsProfileModalOpen(false);
        }}
      />
    </div>
  );
}
