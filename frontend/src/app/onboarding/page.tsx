"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Sparkles,
  Building2,
  User,
  Package,
  Layers,
  Coins,
  Globe2,
  SlidersHorizontal,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  FileCheck,
  Save,
} from "lucide-react";
import { authService, AuthUser } from "@/lib/auth";
import { api } from "@/services/api";

const STEPS = [
  { id: 1, title: "Personal Details", subtitle: "Let's get to know you" },
  { id: 2, title: "Business Profile", subtitle: "Tell us about your business" },
  { id: 3, title: "Products & Materials", subtitle: "What are you sourcing?" },
  { id: 4, title: "Sourcing Preferences", subtitle: "How would you like to source?" },
  { id: 5, title: "AI Sourcing Intelligence", subtitle: "Structured requirements" },
  { id: 6, title: "Review & Confirm", subtitle: "Confirm and launch workspace" },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // STEP 1: Personal Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [city, setCity] = useState("Bhubaneswar");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [jobTitle, setJobTitle] = useState("Founder");
  const [professionalRole, setProfessionalRole] = useState("Sourcing Lead");

  // STEP 2: Business Profile
  const [businessName, setBusinessName] = useState("EcoPack Solutions");
  const [industry, setIndustry] = useState("Sustainable Packaging");
  const [businessStage, setBusinessStage] = useState("Operating business");
  const [businessType, setBusinessType] = useState("D2C brand");
  const [businessCountry, setBusinessCountry] = useState("India");
  const [businessCity, setBusinessCity] = useState("Bhubaneswar");
  const [businessDescription, setBusinessDescription] = useState(
    "Manufacturer and distributor of compostable takeaway food packaging, kraft corrugated mailer boxes, and zero-plastic retail packaging."
  );
  const [website, setWebsite] = useState("https://ecopack-solutions.example.com");
  const [targetMarket, setTargetMarket] = useState("E-commerce brands and food chains across India and North America");
  const [businessSize, setBusinessSize] = useState("1-10");

  // STEP 3: Products and Materials
  const [productName, setProductName] = useState("Compostable Food Container");
  const [productCategory, setProductCategory] = useState("Food Packaging");
  const [productSpecs, setProductSpecs] = useState("Biodegradable sugarcane bagasse with leak-proof PLA barrier");
  const [materials, setMaterials] = useState<Array<{ name: string; grade: string; quantity: number; unit: string }>>([
    { name: "Sugarcane Bagasse Pulp", grade: "Food Grade A", quantity: 10000, unit: "kg" },
    { name: "PLA Bio-film Coating", grade: "EN 13432 Certified", quantity: 2500, unit: "kg" },
  ]);
  const [newMatName, setNewMatName] = useState("");
  const [newMatGrade, setNewMatGrade] = useState("");
  const [newMatQty, setNewMatQty] = useState<number>(1000);
  const [newMatUnit, setNewMatUnit] = useState("kg");

  // STEP 4: Sourcing Preferences
  const [budget, setBudget] = useState<number>(150000);
  const [expectedOrderQty, setExpectedOrderQty] = useState<number>(5000);
  const [orderUnit, setOrderUnit] = useState("units");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["India", "Vietnam", "Germany"]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    "Lowest price",
    "Low MOQ",
    "Quality certifications",
  ]);

  // STEP 5: AI Understanding
  const [aiResult, setAiResult] = useState<any>(null);

  // Load session & restore onboarding progress
  useEffect(() => {
    authService.getSessionUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        setFullName(user.name || "");
        setEmail(user.email || "");

        // Fetch backend saved state
        api.onboarding.getProgress(user.id).then((progress) => {
          if (progress) {
            if (progress.active_step) setActiveStep(progress.active_step);
            if (progress.completed_steps) setCompletedSteps(progress.completed_steps);

            const snap = progress.data_snapshot || {};
            if (snap.personal_info) {
              setFullName(snap.personal_info.full_name || user.name);
              setCountry(snap.personal_info.country || "India");
              setCity(snap.personal_info.city || "Bhubaneswar");
              setPhone(snap.personal_info.phone_number || "");
              setCurrency(snap.personal_info.preferred_currency || "USD");
              setJobTitle(snap.personal_info.job_title || "Founder");
            }
            if (snap.business_info) {
              setBusinessName(snap.business_info.name || snap.business_info.business_name || "EcoPack Solutions");
              setIndustry(snap.business_info.industry || "Sustainable Packaging");
              setBusinessStage(snap.business_info.business_stage || "Operating business");
              setBusinessType(snap.business_info.business_type || "D2C brand");
              setBusinessDescription(snap.business_info.description || snap.business_info.business_description || businessDescription);
              setTargetMarket(snap.business_info.target_market || targetMarket);
            }
            if (snap.products_and_materials && snap.products_and_materials.length > 0) {
              const p0 = snap.products_and_materials[0];
              setProductName(p0.name || productName);
              setProductCategory(p0.category || productCategory);
              setProductSpecs(p0.specifications || productSpecs);
              if (p0.materials && p0.materials.length > 0) {
                setMaterials(p0.materials);
              }
            }
            if (snap.sourcing_preferences) {
              if (snap.sourcing_preferences.budget) setBudget(snap.sourcing_preferences.budget);
              if (snap.sourcing_preferences.geographic_preferences) {
                setSelectedCountries(snap.sourcing_preferences.geographic_preferences);
              }
              if (snap.sourcing_preferences.supplier_priorities) {
                setSelectedPriorities(snap.sourcing_preferences.supplier_priorities);
              }
            }
            if (snap.ai_understanding) {
              setAiResult(snap.ai_understanding);
            }
          }
        }).catch(() => {});
      } else {
        // Fallback demo user
        setFullName("Pritam Biswas");
        setEmail("pritam@supplylens.ai");
      }
    });
  }, []);

  const saveCurrentStepProgress = async (stepNum: number) => {
    setIsSaving(true);
    const userId = currentUser?.id || "usr-demo-001";

    let stepData: any = {};
    if (stepNum === 1) {
      stepData = {
        full_name: fullName,
        email,
        country,
        city,
        phone_number: phone,
        preferred_currency: currency,
        job_title: jobTitle,
        professional_role: professionalRole,
      };
    } else if (stepNum === 2) {
      stepData = {
        business_name: businessName,
        industry,
        business_stage: businessStage,
        business_type: businessType,
        country: businessCountry,
        city: businessCity,
        business_description: businessDescription,
        website,
        target_market: targetMarket,
        business_size: businessSize,
      };
    } else if (stepNum === 3) {
      stepData = [
        {
          id: "prod-001",
          name: productName,
          category: productCategory,
          specifications: productSpecs,
          materials,
        },
      ];
    } else if (stepNum === 4) {
      stepData = {
        budget,
        currency,
        expected_order_quantity: expectedOrderQty,
        order_unit: orderUnit,
        geographic_preferences: selectedCountries,
        supplier_priorities: selectedPriorities,
      };
    } else if (stepNum === 5) {
      stepData = aiResult;
    }

    try {
      await api.onboarding.saveStep({
        user_id: userId,
        step: stepNum,
        data: stepData,
      });
      if (!completedSteps.includes(stepNum)) {
        setCompletedSteps((prev) => [...prev, stepNum]);
      }
    } catch {
      // Non-fatal fallback
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    setError(null);

    // Validation
    if (activeStep === 1) {
      if (!fullName.trim()) {
        setError("Please provide your full name.");
        return;
      }
    } else if (activeStep === 2) {
      if (!businessName.trim()) {
        setError("Please provide your business name.");
        return;
      }
      if (!businessDescription.trim() || businessDescription.length < 15) {
        setError("Please enter a short description of what you are building (at least 15 characters).");
        return;
      }
    } else if (activeStep === 3) {
      if (!productName.trim()) {
        setError("Please provide at least one product or component name.");
        return;
      }
      if (materials.length === 0) {
        setError("Please add at least one raw material or component requirement.");
        return;
      }
    } else if (activeStep === 4) {
      if (selectedCountries.length === 0) {
        setError("Please select at least one preferred sourcing country.");
        return;
      }
      // Trigger AI Understanding on transition to Step 5
      fetchAiUnderstanding();
    }

    await saveCurrentStepProgress(activeStep);
    setActiveStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const fetchAiUnderstanding = async () => {
    setIsAiProcessing(true);
    try {
      const res = await api.onboarding.aiUnderstand({
        business_name: businessName,
        industry,
        business_stage: businessStage,
        business_description: businessDescription,
        target_market: targetMarket,
        budget,
        currency,
        preferred_countries: selectedCountries,
        supplier_priorities: selectedPriorities,
        raw_materials: materials,
      });
      setAiResult(res);
    } catch {
      // Handled via backend graceful fallback
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAddMaterial = () => {
    if (!newMatName.trim()) return;
    setMaterials([
      ...materials,
      {
        name: newMatName.trim(),
        grade: newMatGrade.trim() || "Commercial Grade",
        quantity: newMatQty || 1000,
        unit: newMatUnit,
      },
    ]);
    setNewMatName("");
    setNewMatGrade("");
    setNewMatQty(1000);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleAddAiSuggestedMaterial = (mat: any) => {
    setMaterials([
      ...materials,
      {
        name: mat.material_name,
        grade: mat.grade || "Standard",
        quantity: mat.estimated_quantity || 1000,
        unit: mat.unit || "kg",
      },
    ]);
  };

  const handleToggleCountry = (countryName: string) => {
    if (selectedCountries.includes(countryName)) {
      if (selectedCountries.length > 1) {
        setSelectedCountries(selectedCountries.filter((c) => c !== countryName));
      }
    } else {
      setSelectedCountries([...selectedCountries, countryName]);
    }
  };

  const handleTogglePriority = (p: string) => {
    if (selectedPriorities.includes(p)) {
      if (selectedPriorities.length > 1) {
        setSelectedPriorities(selectedPriorities.filter((item) => item !== p));
      }
    } else {
      setSelectedPriorities([...selectedPriorities, p]);
    }
  };

  const handleConfirmAndLaunch = async () => {
    setIsSaving(true);
    const userId = currentUser?.id || "usr-demo-001";

    const payload = {
      user_id: userId,
      personal_info: {
        full_name: fullName,
        email,
        country,
        city,
        phone_number: phone,
        preferred_currency: currency,
        job_title: jobTitle,
        professional_role: professionalRole,
      },
      business_info: {
        business_name: businessName,
        industry,
        business_stage: businessStage,
        business_type: businessType,
        country: businessCountry,
        city: businessCity,
        business_description: businessDescription,
        website,
        target_market: targetMarket,
        business_size: businessSize,
      },
      products_and_materials: [
        {
          id: "prod-001",
          name: productName,
          category: productCategory,
          specifications: productSpecs,
          materials,
        },
      ],
      sourcing_preferences: {
        budget,
        currency,
        expected_order_quantity: expectedOrderQty,
        order_unit: orderUnit,
        geographic_preferences: selectedCountries,
        supplier_priorities: selectedPriorities,
      },
      ai_understanding: aiResult,
    };

    try {
      const res = await api.onboarding.complete(payload);
      if (typeof window !== "undefined") {
        localStorage.setItem("supplylens_demo_onboarding_profile", JSON.stringify(payload));
      }
      if (currentUser) {
        authService.setStoredUser({
          ...currentUser,
          name: fullName,
          onboarding_status: "completed",
          active_step: 6,
        });
      }
      router.push(res?.redirect_url || "/dashboard");
    } catch (err: any) {
      console.warn("Backend sync offline, saving onboarding profile locally:", err);
      // Fallback for Vercel demo or offline backend
      if (typeof window !== "undefined") {
        localStorage.setItem("supplylens_demo_onboarding_profile", JSON.stringify(payload));
      }
      const activeUser = currentUser || {
        id: userId,
        email: email || "founder@supplylens.ai",
        name: fullName || "Hossein",
        role: "Founder",
        onboarding_status: "completed",
        active_step: 6,
      };
      authService.setStoredUser({
        ...activeUser,
        name: fullName || activeUser.name,
        onboarding_status: "completed",
        active_step: 6,
      });
      // Redirect seamlessly so user is never blocked
      router.push("/dashboard");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800 antialiased flex flex-col selection:bg-blue-600/20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                SL
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-lg">SupplyLens</span>
            </Link>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Workspace Onboarding
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 animate-pulse">
                <Save className="w-3.5 h-3.5 text-blue-500" />
                <span>Auto-saving...</span>
              </span>
            )}
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
              Step {activeStep} of 6
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col">
        {/* Progress Bar & Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-2 mb-3">
            {STEPS.map((s) => {
              const isPast = completedSteps.includes(s.id) || activeStep > s.id;
              const isCurrent = activeStep === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (isPast) setActiveStep(s.id);
                  }}
                  className={`flex-1 flex flex-col items-center text-center cursor-pointer transition-all ${
                    isCurrent
                      ? "opacity-100"
                      : isPast
                      ? "opacity-80 hover:opacity-100"
                      : "opacity-40 pointer-events-none"
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1 ${
                      isCurrent
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-4 ring-blue-500/15"
                        : isPast
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[2.5]" /> : s.id}
                  </div>
                  <span className="hidden sm:block text-[11px] font-semibold text-slate-700 truncate max-w-[100px]">
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 rounded-full"
              initial={{ width: "16%" }}
              animate={{ width: `${(activeStep / 6) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-700 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-xs font-bold text-blue-700 bg-white border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Launch Dashboard Directly →
            </button>
          </motion.div>
        )}

        {/* Form Card Content */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* STEP 1: PERSONAL INFORMATION */}
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                    Step 1 · Personal Information
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    Let's get to know you.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Tell us a little about yourself so we can set up your SupplyLens workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Pritam Biswas"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Work Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Synced from verified Supabase session
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Country of Residence *
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Germany">Germany</option>
                      <option value="Vietnam">Vietnam</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Preferred Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bhubaneswar"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Founder & Sourcing Lead"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Professional Role
                    </label>
                    <select
                      value={professionalRole}
                      onChange={(e) => setProfessionalRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Sourcing Director">Sourcing Director</option>
                      <option value="Founder / CEO">Founder / CEO</option>
                      <option value="Procurement Manager">Procurement Manager</option>
                      <option value="Supply Chain Architect">Supply Chain Architect</option>
                      <option value="Product Designer">Product Designer</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: BUSINESS INFORMATION */}
            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                    Step 2 · Business Information
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    Tell us about your business.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Help us understand what you're building so we can personalize your sourcing workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Business Name or Working Title *
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. EcoPack Solutions"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Industry Sector *
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Sustainable Packaging">Sustainable Packaging</option>
                      <option value="Apparel & Textiles">Apparel & Textiles</option>
                      <option value="Consumer Electronics">Consumer Electronics</option>
                      <option value="Furniture & Decor">Furniture & Decor</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Industrial Materials">Industrial Materials</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Business Stage *
                    </label>
                    <select
                      value={businessStage}
                      onChange={(e) => setBusinessStage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Idea stage">Idea stage</option>
                      <option value="Planning to launch">Planning to launch</option>
                      <option value="Newly launched">Newly launched</option>
                      <option value="Operating business">Operating business</option>
                      <option value="Scaling business">Scaling business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Business Type
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="D2C brand">D2C brand</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Startup">Startup</option>
                      <option value="Small business">Small business</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Operating Country
                    </label>
                    <input
                      type="text"
                      value={businessCountry}
                      onChange={(e) => setBusinessCountry(e.target.value)}
                      placeholder="e.g. India"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Business Description *
                    </label>
                    <textarea
                      rows={3}
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      placeholder="Describe what your business makes or sells, your mission, and the key materials you need..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourcompany.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Target Customer Market
                    </label>
                    <input
                      type="text"
                      value={targetMarket}
                      onChange={(e) => setTargetMarket(e.target.value)}
                      placeholder="e.g. D2C brands, hospitality, export retail"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PRODUCTS & RAW MATERIALS */}
            {activeStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                    Step 3 · Product & Material Requirements
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    What are you looking to source?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Tell us what you want to manufacture or purchase. We'll help organize the materials and supplier matches.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Primary Product
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="e.g. Compostable Takeaway Box"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={productCategory}
                          onChange={(e) => setProductCategory(e.target.value)}
                          placeholder="e.g. Food Packaging"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Specifications / Requirements
                        </label>
                        <input
                          type="text"
                          value={productSpecs}
                          onChange={(e) => setProductSpecs(e.target.value)}
                          placeholder="e.g. Oil resistant, microwave safe, 750ml volume"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Raw Materials List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Required Raw Materials & Components ({materials.length})
                      </label>
                    </div>

                    <div className="space-y-2 mb-3">
                      {materials.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900">{m.name}</span>
                              <span className="text-slate-400 mx-1.5">·</span>
                              <span className="text-slate-600">{m.grade}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-700">
                              {m.quantity.toLocaleString()} {m.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(idx)}
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Material Row */}
                    <div className="p-3.5 rounded-2xl border border-dashed border-slate-300 bg-white grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <input
                        type="text"
                        value={newMatName}
                        onChange={(e) => setNewMatName(e.target.value)}
                        placeholder="Material name (e.g. Kraft board)"
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 sm:col-span-2"
                      />
                      <input
                        type="text"
                        value={newMatGrade}
                        onChange={(e) => setNewMatGrade(e.target.value)}
                        placeholder="Grade / Spec"
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={newMatQty}
                          onChange={(e) => setNewMatQty(Number(e.target.value))}
                          placeholder="Qty"
                          className="w-20 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={handleAddMaterial}
                          className="flex-1 px-3 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SOURCING PREFERENCES */}
            {activeStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                    Step 4 · Sourcing Preferences
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    How would you like to source?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Set your sourcing priorities so we can focus on suppliers that fit your business scale.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Estimated Sourcing Budget ({currency})
                    </label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Expected Batch Order Quantity
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={expectedOrderQty}
                        onChange={(e) => setExpectedOrderQty(Number(e.target.value))}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                      <input
                        type="text"
                        value={orderUnit}
                        onChange={(e) => setOrderUnit(e.target.value)}
                        placeholder="units"
                        className="w-24 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Geographic Preferences */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Preferred Sourcing Countries (Multi-select)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["India", "Vietnam", "United States", "Germany", "China", "Bangladesh", "Japan"].map((c) => {
                        const selected = selectedCountries.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleToggleCountry(c)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              selected
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {selected ? `✓ ${c}` : c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Supplier Priorities */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Top Supplier Priorities (Multi-select)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Lowest price",
                        "Low MOQ",
                        "High product compatibility",
                        "Quality certifications",
                        "Geographic proximity",
                        "Faster delivery",
                        "Established supplier",
                        "Diversified sourcing",
                      ].map((p) => {
                        const selected = selectedPriorities.includes(p);
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleTogglePriority(p)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              selected
                                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {selected ? `✓ ${p}` : p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: AI-POWERED BUSINESS UNDERSTANDING */}
            {activeStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center gap-1.5 w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Step 5 · AI Sourcing Intelligence</span>
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    Let's organize your sourcing requirements.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Our AI turns your business idea into a structured sourcing profile and identifies missing specifications.
                  </p>
                </div>

                {isAiProcessing ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                    <div className="text-sm font-bold text-slate-900">
                      Analyzing business model & decomposing BOM...
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Synthesizing industry requirements, normalizing materials, and screening verified factory criteria.
                    </p>
                  </div>
                ) : aiResult ? (
                  <div className="space-y-4">
                    {/* Executive Summary */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/60 text-xs text-blue-950">
                      <div className="font-bold text-[11px] uppercase tracking-wider text-blue-700 mb-1">
                        AI Executive Sourcing Analysis
                      </div>
                      <p className="leading-relaxed">{aiResult.business_summary}</p>
                    </div>

                    {/* Suggested Raw Materials */}
                    {aiResult.suggested_materials && aiResult.suggested_materials.length > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>AI Suggested Complementary Materials</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3">
                          Based on your business model, these items were identified as likely requirements:
                        </p>
                        <div className="space-y-2">
                          {aiResult.suggested_materials.map((sm: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{sm.material_name}</span>
                                <span className="text-slate-400 mx-1.5">·</span>
                                <span className="text-slate-600">{sm.grade}</span>
                                <p className="text-[10px] text-slate-500 mt-0.5">{sm.specifications}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddAiSuggestedMaterial(sm)}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors"
                              >
                                + Add to BOM
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clarifying Questions */}
                    {aiResult.clarifying_questions && aiResult.clarifying_questions.length > 0 && (
                      <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs">
                        <div className="font-bold text-[11px] uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Recommended Clarifications for Suppliers</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700 mt-1">
                          {aiResult.clarifying_questions.map((q: string, idx: number) => (
                            <li key={idx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    <p>AI decomposition will generate once you proceed.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 6: REVIEW AND CONFIRM */}
            {activeStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Step 6 · Review & Confirm
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                    Your sourcing profile is ready.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Review your workspace details below. Confirming will generate your personalized dashboard.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Summary Card 1: Personal & Business */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Personal & Company Overview
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Founder</span>
                        <span className="font-bold text-slate-900">{fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Business Name</span>
                        <span className="font-bold text-slate-900">{businessName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Industry</span>
                        <span className="font-bold text-slate-900">{industry}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Stage</span>
                        <span className="font-bold text-slate-900">{businessStage}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card 2: Sourcing Materials */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Products & Materials ({materials.length})
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(3)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {materials.map((m, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span className="font-medium">• {m.name} ({m.grade})</span>
                          <span className="font-semibold text-slate-900">{m.quantity.toLocaleString()} {m.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Card 3: Commercial Preferences */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Sourcing Scope & Priorities
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(4)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Budget</span>
                        <span className="font-bold text-slate-900">{currency} {budget.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Sourcing Regions</span>
                        <span className="font-bold text-slate-900">{selectedCountries.join(", ")}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Top Priorities</span>
                        <span className="font-bold text-slate-900">{selectedPriorities.slice(0, 2).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Footer */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between mt-8">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {activeStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmAndLaunch}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Launching Personalized Workspace...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Create Personalized Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
