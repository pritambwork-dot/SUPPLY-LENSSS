import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  BusinessProfile,
  BusinessStage,
  BudgetConstraintCategory,
  SourcingPreference,
  ManufacturingPreference,
} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number | null, currency: string = "INR"): string {
  if (amount == null || isNaN(amount)) {
    return "Not publicly available";
  }
  if (currency === "INR") {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)} Lakh`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  if (currency === "USD") {
    return `$${amount.toLocaleString("en-US")}`;
  }
  if (currency === "EUR") {
    return `€${amount.toLocaleString("de-DE")}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

export function classifyBudget(amount: number, currency: string = "INR"): {
  category: BudgetConstraintCategory;
  insight: string;
} {
  const inrAmount = currency === "USD" ? amount * 85 : currency === "EUR" ? amount * 92 : amount;

  if (inrAmount <= 1000000) {
    return {
      category: "low_initial_capital",
      insight: "Your biggest constraint right now is initial capital. We're prioritizing suppliers with smaller order sizes (low MOQ) and low upfront tooling costs.",
    };
  } else if (inrAmount <= 5000000) {
    return {
      category: "moderate_capital",
      insight: "You have a balanced launch budget. You can split capital between custom-branded pilot batches and certified packaging.",
    };
  } else {
    return {
      category: "well_funded",
      insight: "You have strong growth capital. We're prioritizing high-capacity manufacturers offering maximum volume discounts and automated lines.",
    };
  }
}

export function isPromptVague(text: string): boolean {
  const lower = text.trim().toLowerCase();
  const words = lower.split(/\s+/);
  if (words.length <= 4 && !lower.includes("packaging") && !lower.includes("coffee") && !lower.includes("furniture") && !lower.includes("clothing") && !lower.includes("food")) {
    return true;
  }
  if (lower.includes("sell stuff online") || lower.includes("start a business") || lower.includes("make money") || lower.includes("do something")) {
    return true;
  }
  return false;
}

export function parseNaturalLanguageIdea(text: string): Partial<BusinessProfile> {
  const lower = text.toLowerCase();

  let sector = "Sustainable Packaging";
  let businessIdea = text;
  let city = "Bhubaneswar";
  let country = "India";
  let location = "Bhubaneswar, India";
  let targetMarket = "Bhubaneswar & Eastern India";
  let targetCustomer = "Restaurants and food businesses";
  let budgetAmount = 800000; // 8 Lakh default or extracted
  let budgetCurrency = "INR";
  let businessModel = "B2B";
  let businessStage: BusinessStage = "idea";
  let sourcingPreference: SourcingPreference = "domestic";
  let manufacturingPreference: ManufacturingPreference = "contract_oem";
  let name = "EcoPack Bhubaneswar";

  // 1. Detect Budget
  const lakhMatch = lower.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lacs|lac)/i);
  const crMatch = lower.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:crore|cr)/i);
  const rawNumMatch = lower.match(/(?:₹|rs\.?|inr)\s*(\d{5,8})/i);
  const usdMatch = lower.match(/(?:\$|usd)\s*(\d+(?:,\d+)?)/i);
  const eurMatch = lower.match(/(?:€|eur)\s*(\d+(?:,\d+)?)/i);

  if (lakhMatch) {
    budgetAmount = parseFloat(lakhMatch[1]) * 100000;
    budgetCurrency = "INR";
  } else if (crMatch) {
    budgetAmount = parseFloat(crMatch[1]) * 10000000;
    budgetCurrency = "INR";
  } else if (rawNumMatch) {
    budgetAmount = parseInt(rawNumMatch[1], 10);
    budgetCurrency = "INR";
  } else if (usdMatch) {
    budgetAmount = parseInt(usdMatch[1].replace(/,/g, ""), 10);
    budgetCurrency = "USD";
  } else if (eurMatch) {
    budgetAmount = parseInt(eurMatch[1].replace(/,/g, ""), 10);
    budgetCurrency = "EUR";
  }

  // 2. Detect Sector & Product Focus
  if (lower.includes("packaging") || lower.includes("bagasse") || lower.includes("paper bowl") || lower.includes("disposable")) {
    sector = "Sustainable Packaging";
    name = "EcoPack Solutions";
    targetCustomer = lower.includes("restaurant") ? "Restaurants, cloud kitchens & cafes" : "B2B food & retail brands";
  } else if (lower.includes("clothing") || lower.includes("apparel") || lower.includes("garment") || lower.includes("fashion")) {
    sector = "Apparel & Garments";
    name = "Urban Thread Co.";
    targetCustomer = lower.includes("retail") ? "Everyday consumers (D2C)" : "Boutiques & fashion retailers";
    businessModel = "D2C";
  } else if (lower.includes("electronic") || lower.includes("import") || lower.includes("gadget")) {
    sector = "Consumer Electronics & Accessories";
    name = "NexTech Sourcing";
    targetCustomer = "Online consumers & regional wholesalers";
    sourcingPreference = "international";
    manufacturingPreference = "buy_resell";
  } else if (lower.includes("furniture") || lower.includes("wood") || lower.includes("chair") || lower.includes("table")) {
    sector = "Sustainable Furniture";
    name = "TimberCraft Studio";
    targetCustomer = "Offices, interior designers & direct homeowners";
    businessModel = "B2B / Custom Contract";
  } else if (lower.includes("coffee") || lower.includes("cafe") || lower.includes("roastery")) {
    sector = "Specialty Coffee & Beverages";
    name = "Origins Roastery";
    targetCustomer = "Specialty cafes & retail subscribers";
    businessModel = "D2C & Cafe Wholesale";
  } else if (lower.includes("food") || lower.includes("restaurant") || lower.includes("kitchen")) {
    sector = "Food & Cloud Kitchen";
    name = "CloudKitchen Hub";
    targetCustomer = "Food delivery consumers";
    businessModel = "B2C";
  } else if (lower.includes("skincare") || lower.includes("cosmetic") || lower.includes("beauty")) {
    sector = "Clean Beauty & Skincare";
    name = "Aura Pure Skincare";
    targetCustomer = "Conscious beauty consumers";
    businessModel = "D2C";
  }

  // 3. Detect Location
  if (lower.includes("bhubaneswar")) {
    city = "Bhubaneswar";
    country = "India";
    location = "Bhubaneswar, India";
    targetMarket = "Bhubaneswar & Odisha Metros";
  } else if (lower.includes("mumbai")) {
    city = "Mumbai";
    country = "India";
    location = "Mumbai, India";
    targetMarket = "Mumbai & Maharashtra";
  } else if (lower.includes("pune")) {
    city = "Pune";
    country = "India";
    location = "Pune, India";
    targetMarket = "Pune & Western India";
  } else if (lower.includes("bengaluru") || lower.includes("bangalore")) {
    city = "Bengaluru";
    country = "India";
    location = "Bengaluru, India";
    targetMarket = "Bengaluru & South India";
  } else if (lower.includes("delhi")) {
    city = "New Delhi";
    country = "India";
    location = "Delhi NCR, India";
    targetMarket = "North India";
  } else if (lower.includes("kolkata")) {
    city = "Kolkata";
    country = "India";
    location = "Kolkata, India";
    targetMarket = "Eastern India";
  } else if (lower.includes("india")) {
    city = "India (Nationwide)";
    country = "India";
    location = "India";
    targetMarket = "Domestic India";
  }

  // 4. Detect Target Customer
  if (lower.includes("restaurant") || lower.includes("food businesses") || lower.includes("cafe")) {
    targetCustomer = "Restaurants and food businesses";
    businessModel = "B2B";
  } else if (lower.includes("consumer") || lower.includes("d2c") || lower.includes("online shopper")) {
    targetCustomer = "Direct-to-consumer shoppers";
    businessModel = "D2C";
  }

  // 5. Detect Manufacturing vs Reselling Preference
  if (lower.includes("manufacture") || lower.includes("production") || lower.includes("factory")) {
    manufacturingPreference = "contract_oem";
  } else if (lower.includes("import") || lower.includes("buy and resell") || lower.includes("trading")) {
    manufacturingPreference = "buy_resell";
  }

  // 6. Stage
  if (lower.includes("launching") || lower.includes("next month")) {
    businessStage = "launching";
  } else if (lower.includes("testing") || lower.includes("samples")) {
    businessStage = "testing";
  } else if (lower.includes("already") || lower.includes("growing") || lower.includes("scale")) {
    businessStage = "growing";
  } else {
    businessStage = "idea";
  }

  const { category: budgetConstraintCategory, insight: budgetInsight } = classifyBudget(budgetAmount, budgetCurrency);

  const businessSnapshot = `A ${businessModel} business in ${city}, ${country} focused on ${sector.toLowerCase()}, supplying to ${targetCustomer.toLowerCase()} with an initial operating capital of ${formatCurrency(budgetAmount, budgetCurrency)}.`;

  return {
    name,
    idea: text,
    sector,
    city,
    country,
    location,
    targetMarket,
    targetCustomer,
    budgetAmount,
    budgetCurrency,
    businessModel,
    expectedScale: budgetAmount <= 1000000 ? "pilot" : budgetAmount <= 5000000 ? "growth" : "scaled",
    businessStage,
    sourcingPreference,
    manufacturingPreference,
    budgetConstraintCategory,
    budgetInsight,
    businessSnapshot,
  };
}
