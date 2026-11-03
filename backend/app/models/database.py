"""
SupplyLens Relational Database Models
SQLAlchemy 2.0 Data Models for PostgreSQL

Models included:
1. Users
2. Businesses
3. Sectors
4. Products
5. BusinessRequirements
6. Suppliers
7. SupplierProducts
8. SupplierContacts
9. SupplierLocations
10. SupplierRatings
11. SupplierVerification
12. SavedSuppliers
13. SearchHistory
14. PriceHistory
"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Table,
    Enum as SQLEnum,
    JSON,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()




class User(Base):
    """Platform entrepreneur or sourcing manager."""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="entrepreneur")  # entrepreneur, admin, auditor
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    businesses = relationship("Business", back_populates="user", cascade="all, delete-orphan")
    saved_suppliers = relationship("SavedSupplier", back_populates="user", cascade="all, delete-orphan")
    searches = relationship("SupplierSearch", back_populates="user", cascade="all, delete-orphan")


class Sector(Base):
    """Broad industry sector (Packaging, Coffee, Furniture, EV Mobility, Skincare, etc.)."""
    __tablename__ = "sectors"

    id = Column(String(36), primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), nullable=True)

    # Relationships
    products = relationship("Product", back_populates="sector")
    businesses = relationship("Business", back_populates="sector")


class Business(Base):
    """User-created business concept and active sourcing workspace."""
    __tablename__ = "businesses"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    sector_id = Column(String(36), ForeignKey("sectors.id"), nullable=True)
    
    name = Column(String(255), nullable=False)
    idea_description = Column(Text, nullable=False)
    target_market = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    budget_amount = Column(Float, nullable=False)
    budget_currency = Column(String(10), default="INR")
    business_model = Column(String(50), default="contract_oem")  # manufacture, contract_oem, buy_resell, unsure
    expected_scale = Column(String(50), default="pilot")  # pilot, growth, scaled
    
    # Simple Readiness Statuses (JSON format)
    readiness_data = Column(JSON, nullable=True)
    
    # Enhanced Onboarding & Sourcing Profile Fields
    business_type = Column(String(100), default="D2C brand")
    business_stage = Column(String(50), default="idea")
    country = Column(String(100), default="India")
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    business_registration_status = Column(String(50), default="unregistered")
    target_customer_market = Column(String(255), nullable=True)
    business_size = Column(String(50), default="1-10")
    geographic_preferences = Column(JSON, default=list)
    supplier_priorities = Column(JSON, default=list)
    ai_sourcing_summary = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="businesses")
    sector = relationship("Sector", back_populates="businesses")
    requirements = relationship("BusinessRequirement", back_populates="business", cascade="all, delete-orphan")
    saved_suppliers = relationship("SavedSupplier", back_populates="business")


class Product(Base):
    """Standardized global product or raw material catalog entity."""
    __tablename__ = "products"

    id = Column(String(36), primary_key=True)
    sector_id = Column(String(36), ForeignKey("sectors.id"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False)  # Raw Materials, Machinery, Packaging, etc.
    standard_unit = Column(String(50), default="pieces")
    description = Column(Text, nullable=True)
    hs_code = Column(String(20), nullable=True)  # Harmonized Tariff System code

    # Relationships
    sector = relationship("Sector", back_populates="products")
    requirements = relationship("BusinessRequirement", back_populates="product")
    supplier_products = relationship("SupplierProduct", back_populates="product")


class BusinessRequirement(Base):
    """Bill of Materials (BOM) item required for a user's business."""
    __tablename__ = "business_requirements"

    id = Column(String(36), primary_key=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=True)

    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    estimated_qty = Column(Float, nullable=False)
    unit = Column(String(50), default="pieces")
    priority = Column(String(50), default="essential")  # essential, recommended, optional
    technical_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    business = relationship("Business", back_populates="requirements")
    product = relationship("Product", back_populates="requirements")


class Supplier(Base):
    """Verified manufacturing facility, factory, or authorized distributor."""
    __tablename__ = "suppliers"

    id = Column(String(36), primary_key=True)
    legal_name = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    supplier_type = Column(String(50), default="OEM", index=True)  # OEM, Contract Manufacturer, Distributor, Raw Material Producer
    industry = Column(String(100), nullable=True, index=True)
    country = Column(String(100), nullable=False, index=True)
    country_code = Column(String(5), nullable=False, index=True)
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=False, index=True)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    website = Column(String(255), nullable=True)
    year_established = Column(Integer, nullable=True)
    employee_range = Column(String(50), nullable=True)
    business_status = Column(String(50), default="active")  # active, under_review, inactive
    
    # Verification & Trust
    verification_status = Column(String(50), default="Verified", index=True)  # Verified, Partially verified, Unverified
    verification_score = Column(Integer, default=90)  # 0 to 100
    data_confidence = Column(Integer, default=92)  # 0 to 100%
    last_verified_at = Column(DateTime, default=datetime.utcnow)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    products = relationship("SupplierProduct", back_populates="supplier", cascade="all, delete-orphan")
    contacts = relationship("SupplierContact", back_populates="supplier", cascade="all, delete-orphan")
    locations = relationship("SupplierLocation", back_populates="supplier", cascade="all, delete-orphan")
    ratings = relationship("SupplierRating", back_populates="supplier", cascade="all, delete-orphan")
    verifications = relationship("SupplierVerification", back_populates="supplier", cascade="all, delete-orphan")
    sources = relationship("SupplierSource", back_populates="supplier", cascade="all, delete-orphan")
    saved_by = relationship("SavedSupplier", back_populates="supplier", cascade="all, delete-orphan")
    recommendations = relationship("SupplierRecommendation", back_populates="supplier", cascade="all, delete-orphan")

    @property
    def name(self) -> str:
        return self.display_name or self.legal_name

    @name.setter
    def name(self, val: str):
        self.display_name = val
        if not self.legal_name:
            self.legal_name = val


class SupplierProduct(Base):
    """Mapping between a supplier and products they manufacture/quote."""
    __tablename__ = "supplier_products"

    id = Column(String(36), primary_key=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=True, index=True)

    product_name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    specifications = Column(JSON, nullable=True)
    minimum_order_quantity = Column(Integer, nullable=False, default=1000)  # MOQ
    maximum_capacity = Column(Integer, nullable=True)
    unit = Column(String(50), default="piece")
    currency = Column(String(10), default="INR")
    price_min = Column(Float, nullable=False, index=True)
    price_max = Column(Float, nullable=False)
    price_type = Column(String(50), default="estimated")  # quoted, publicly_listed, estimated, range, user_provided
    price_source = Column(String(255), nullable=True)
    price_last_updated = Column(DateTime, default=datetime.utcnow)

    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    product = relationship("Product", back_populates="supplier_products")
    price_histories = relationship("PriceHistory", back_populates="supplier_product", cascade="all, delete-orphan")


class SupplierContact(Base):
    """Legitimate, verified public business contact information."""
    __tablename__ = "supplier_contacts"

    id = Column(String(36), primary_key=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)
    
    contact_type = Column(String(50), nullable=False)  # phone, email, website, address
    value = Column(String(255), nullable=False)
    source = Column(String(255), nullable=False)
    is_public_business_contact = Column(Boolean, default=True)
    verification_status = Column(String(50), default="Verified")  # Verified, Unverified
    last_verified_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    supplier = relationship("Supplier", back_populates="contacts")


class SupplierLocation(Base):
    """Geographic facility location for geospatial mapping & transit calculations."""
    __tablename__ = "supplier_locations"

    id = Column(String(36), primary_key=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)

    location_type = Column(String(50), default="headquarters")  # headquarters, factory, warehouse
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    source = Column(String(255), nullable=True)
    verification_status = Column(String(50), default="Verified")

    # Relationships
    supplier = relationship("Supplier", back_populates="locations")


class SupplierRating(Base):
    """Supplier quality, timeliness, and customer satisfaction audits."""
    __tablename__ = "supplier_ratings"

    id = Column(String(36), primary_key=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)

    source = Column(String(100), nullable=False)  # e.g., "Google Business Profile", "Dun & Bradstreet", "Trade Registry"
    rating = Column(Float, nullable=False, index=True)  # 1.0 to 5.0
    review_count = Column(Integer, default=0)
    rating_scale = Column(String(20), default="5.0")
    retrieved_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    supplier = relationship("Supplier", back_populates="ratings")


class SupplierVerification(Base):
    """Audited inspection records, trade licenses, and certifications."""
    __tablename__ = "supplier_verifications"

    id = Column(String(36), primary_key=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)

    verification_type = Column(String(100), nullable=False)  # Physical Onsite, Registry Match, Product Catalog Match
    status = Column(String(50), default="Verified")  # Verified, Partially verified, Unverified
    source = Column(String(255), nullable=False)
    evidence = Column(JSON, nullable=False)  # Checklist & structured proof records
    checked_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    supplier = relationship("Supplier", back_populates="verifications")


class SupplierSource(Base):
    """Origin sources from which supplier information was discovered/audited."""
    __tablename__ = "supplier_sources"

    id = Column(String(36), primary_key=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)

    source_name = Column(String(100), nullable=False)  # "Government Trade Registry", "Google Places", "Official Source"
    source_url = Column(String(255), nullable=True)
    source_type = Column(String(50), default="registry")  # registry, directory, place, manual_audit
    retrieved_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    supplier = relationship("Supplier", back_populates="sources")


class SupplierSearch(Base):
    """Search queries and filter logs for sourcing discovery analytics."""
    __tablename__ = "supplier_searches"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=True, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=True)

    query = Column(Text, nullable=False)
    filters = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    recommendations = relationship("SupplierRecommendation", back_populates="search", cascade="all, delete-orphan")
    user = relationship("User", back_populates="searches")


SearchHistory = SupplierSearch


class SupplierRecommendation(Base):
    """Personalized recommendations computed for a specific search or profile."""
    __tablename__ = "supplier_recommendations"

    id = Column(String(36), primary_key=True)
    search_id = Column(String(36), ForeignKey("supplier_searches.id"), nullable=True, index=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)

    recommendation_type = Column(String(50), default="best_overall")  # best_overall, cheapest_suitable, best_rated, starting_small
    overall_score = Column(Float, nullable=False)
    price_score = Column(Float, default=0.0)
    product_fit_score = Column(Float, default=0.0)
    location_score = Column(Float, default=0.0)
    moq_score = Column(Float, default=0.0)
    rating_score = Column(Float, default=0.0)
    verification_score = Column(Float, default=0.0)
    logistics_score = Column(Float, default=0.0)
    data_confidence_score = Column(Float, default=0.0)
    recommendation_reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    search = relationship("SupplierSearch", back_populates="recommendations")
    supplier = relationship("Supplier", back_populates="recommendations")


class SavedSupplier(Base):
    """Bookmarks / shortlists saved by an entrepreneur for their business."""
    __tablename__ = "saved_suppliers"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=True, index=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)
    product_name = Column(String(255), nullable=True)

    notes = Column(Text, nullable=True)
    saved_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="saved_suppliers")
    business = relationship("Business", back_populates="saved_suppliers")
    supplier = relationship("Supplier", back_populates="saved_by")


class PriceHistory(Base):
    """Historical quote tracking to monitor commodity & freight trends."""
    __tablename__ = "price_history"

    id = Column(String(36), primary_key=True)
    supplier_product_id = Column(String(36), ForeignKey("supplier_products.id"), nullable=False, index=True)

    quoted_price = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    recorded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    supplier_product = relationship("SupplierProduct", back_populates="price_histories")


class Destination(Base):
    """User-defined delivery location (business location, warehouse, store, port, etc.)."""
    __tablename__ = "destinations"

    id = Column(String(36), primary_key=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=True, index=True)
    name = Column(String(255), nullable=False)  # e.g., "My Business Location", "Bhubaneswar Hub"
    country = Column(String(100), default="India")
    state = Column(String(100), default="Odisha")
    city = Column(String(100), default="Bhubaneswar")
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False, default=20.2961)
    longitude = Column(Float, nullable=False, default=85.8245)
    destination_type = Column(String(50), default="Business")  # Business, Warehouse, Store, Port, Market, Other
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    scenarios = relationship("SourcingScenario", back_populates="destination", cascade="all, delete-orphan")


class SourcingScenario(Base):
    """Specific evaluated sourcing option connecting supplier, product, quantity, origin, and destination."""
    __tablename__ = "sourcing_scenarios"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=True, index=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=True)
    supplier_product_id = Column(String(36), ForeignKey("supplier_products.id"), nullable=True)

    supplier_name = Column(String(255), nullable=False)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False, default=1000)
    origin_location_id = Column(String(36), nullable=True)
    origin_city = Column(String(100), nullable=True)
    origin_country = Column(String(100), nullable=True)
    origin_lat = Column(Float, nullable=True)
    origin_lng = Column(Float, nullable=True)

    destination_location_id = Column(String(36), ForeignKey("destinations.id"), nullable=True, index=True)
    destination_city = Column(String(100), default="Bhubaneswar")
    destination_country = Column(String(100), default="India")
    destination_lat = Column(Float, default=20.2961)
    destination_lng = Column(Float, default=85.8245)

    currency = Column(String(10), default="INR")
    supplier_unit_price = Column(Float, nullable=False)
    estimated_product_cost = Column(Float, nullable=False)
    estimated_logistics_cost = Column(Float, nullable=False)
    estimated_total_cost = Column(Float, nullable=False)
    estimated_cost_per_unit = Column(Float, nullable=False)

    scenario_status = Column(String(50), default="active")  # draft, active, saved, compared, archived
    cost_confidence = Column(String(50), default="medium")  # high, medium, low
    confidence_reason = Column(Text, nullable=True)
    price_source = Column(String(100), default="Publicly listed price")
    price_date = Column(String(50), default="Recently verified")
    is_price_stale = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    destination = relationship("Destination", back_populates="scenarios")
    supplier = relationship("Supplier")
    logistics_estimates = relationship("LogisticsEstimate", back_populates="scenario", cascade="all, delete-orphan")


class LogisticsEstimate(Base):
    """Estimated shipping and cargo freight calculation for a scenario."""
    __tablename__ = "logistics_estimates"

    id = Column(String(36), primary_key=True)
    scenario_id = Column(String(36), ForeignKey("sourcing_scenarios.id"), nullable=False, index=True)

    mode = Column(String(50), default="road")  # road, sea, air, multimodal
    distance = Column(Float, nullable=False)  # Distance in km
    estimated_transit_time = Column(String(50), default="2-4 days")
    estimated_cost = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    source = Column(String(100), default="Distance model & standard carrier tariffs")
    estimate_type = Column(String(50), default="indicative_freight")
    confidence = Column(String(50), default="medium")  # high, medium, low
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    scenario = relationship("SourcingScenario", back_populates="logistics_estimates")


class OptimizationRun(Base):
    """Auditable mathematical optimization run record."""
    __tablename__ = "optimization_runs"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=True, index=True)
    scenario_id = Column(String(36), ForeignKey("sourcing_scenarios.id"), nullable=True, index=True)

    objective_type = Column(String(50), default="min_cost")  # min_cost, balanced, diversified, min_risk, min_logistics
    objective_configuration = Column(JSON, nullable=True)  # weights & parameters
    solver = Column(String(50), default="Exact-B&B")  # CP-SAT, MILP-SCIP, Exact-B&B
    status = Column(String(50), default="OPTIMAL")  # OPTIMAL, FEASIBLE, INFEASIBLE, TIMEOUT

    required_quantity = Column(Float, nullable=False)
    available_budget = Column(Float, nullable=False)
    total_allocated_quantity = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    average_unit_cost = Column(Float, default=0.0)

    objective_value = Column(Float, default=0.0)
    runtime_ms = Column(Float, default=0.0)
    model_version = Column(String(50), default="1.0.0")
    input_snapshot = Column(JSON, nullable=True)
    explanation = Column(Text, nullable=True)
    infeasibility_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    allocations = relationship("OptimizationAllocation", back_populates="run", cascade="all, delete-orphan")
    constraints = relationship("OptimizationConstraintRecord", back_populates="run", cascade="all, delete-orphan")


class OptimizationAllocation(Base):
    """Allocated supplier quantity and share from an optimization run."""
    __tablename__ = "optimization_allocations"

    id = Column(String(36), primary_key=True)
    optimization_run_id = Column(String(36), ForeignKey("optimization_runs.id"), nullable=False, index=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)
    supplier_name = Column(String(255), nullable=False)

    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    supplier_cost = Column(Float, nullable=False)
    percentage_of_total = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    run = relationship("OptimizationRun", back_populates="allocations")


class OptimizationConstraintRecord(Base):
    """Audit record of a mathematical constraint applied during an optimization run."""
    __tablename__ = "optimization_constraints"

    id = Column(String(36), primary_key=True)
    optimization_run_id = Column(String(36), ForeignKey("optimization_runs.id"), nullable=False, index=True)

    constraint_type = Column(String(50), nullable=False)  # demand, budget, moq, capacity, supplier_limit, concentration, country
    constraint_value = Column(String(100), nullable=False)
    actual_value = Column(String(100), nullable=False)
    status = Column(String(50), default="SATISFIED")  # SATISFIED, VIOLATED, TIGHT

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    run = relationship("OptimizationRun", back_populates="constraints")


# =============================================================
# Machine Learning & Neural Sourcing Lifecycle Models
# =============================================================

class ModelVersion(Base):
    """Registry of trained neural network and ML model checkpoints."""
    __tablename__ = "model_versions"

    id = Column(String(64), primary_key=True)
    model_name = Column(String(100), nullable=False, index=True)
    version_tag = Column(String(50), nullable=False)
    architecture_type = Column(String(100), nullable=False)  # e.g., "TwoTower-MLP", "MLP-Regressor"
    hyperparameters = Column(JSON, default=dict)
    metrics_snapshot = Column(JSON, default=dict)  # roc_auc, mae, val_loss
    is_active = Column(Boolean, default=True)
    trained_at = Column(DateTime, default=datetime.utcnow)


class TrainingDatasetVersion(Base):
    """Metadata catalog for versioned benchmark and real interaction training datasets."""
    __tablename__ = "training_dataset_versions"

    id = Column(String(64), primary_key=True)
    name = Column(String(100), nullable=False)
    sample_count = Column(Integer, default=0)
    features_spec = Column(JSON, default=dict)
    source_description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class ModelFeatureRecord(Base):
    """Cached preprocessed feature embeddings for users, suppliers, and pairs."""
    __tablename__ = "model_features"

    id = Column(String(64), primary_key=True)
    entity_type = Column(String(50), nullable=False)  # user, supplier, pair
    entity_id = Column(String(64), nullable=False, index=True)
    feature_vector = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)


class ModelPredictionRecord(Base):
    """Audit record of live inference predictions generated by neural networks."""
    __tablename__ = "model_predictions"

    id = Column(String(64), primary_key=True)
    model_version_id = Column(String(64), nullable=False, index=True)
    business_id = Column(String(64), nullable=True, index=True)
    supplier_id = Column(String(64), nullable=False, index=True)
    prediction_type = Column(String(50), nullable=False)  # fit_score, price_estimation, risk_score
    predicted_value = Column(Float, nullable=False)
    predicted_range_min = Column(Float, nullable=True)
    predicted_range_max = Column(Float, nullable=True)
    confidence = Column(Float, default=1.0)
    explanation_factors = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class PredictionLog(Base):
    """Online user interaction telemetry linked to model predictions for continuous learning."""
    __tablename__ = "prediction_logs"

    id = Column(String(64), primary_key=True)
    prediction_id = Column(String(64), nullable=True, index=True)
    supplier_id = Column(String(64), nullable=False, index=True)
    user_action = Column(String(50), nullable=False)  # viewed, saved, compared, contacted, contracted
    timestamp = Column(DateTime, default=datetime.utcnow)




class SupplierReport(Base):
    """User reports for incorrect supplier data."""
    __tablename__ = "supplier_reports"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)
    report_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CustomerActivity(Base):
    """Customer activity event stream for audit trails and workspace timelines."""
    __tablename__ = "customer_activities"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=True, index=True)
    activity_type = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(100), nullable=True)
    metadata_json = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class QuotationRequest(Base):
    """Customer Request for Quotation (RFQ) directly targeted to a vendor."""
    __tablename__ = "quotation_requests"

    id = Column(String(36), primary_key=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)
    
    product_name = Column(String(255), nullable=False)
    product_category = Column(String(100), nullable=False)
    required_quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="piece")
    target_budget = Column(Float, nullable=True)
    currency = Column(String(10), default="INR")
    specifications = Column(Text, nullable=True)
    delivery_terms = Column(String(100), default="FOB")
    destination_city = Column(String(100), nullable=True)
    destination_country = Column(String(100), default="India")
    required_certifications = Column(JSON, default=list)
    
    status = Column(String(50), default="submitted", index=True)  # submitted, under_review, quoted, accepted, declined, expired
    quoted_unit_price = Column(Float, nullable=True)
    quoted_moq = Column(Integer, nullable=True)
    quoted_lead_time_days = Column(Integer, nullable=True)
    quotation_valid_until = Column(DateTime, nullable=True)
    vendor_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    supplier = relationship("Supplier")
    business = relationship("Business")


class VendorProfileInteraction(Base):
    """Interactions and telemetry on vendor profile views."""
    __tablename__ = "vendor_profile_interactions"

    id = Column(String(36), primary_key=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    interaction_type = Column(String(50), nullable=False, index=True)  # view, contact_click, website_visit, save, quotation_start
    metadata_json = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class Profile(Base):
    """User profile metadata directly tied to Supabase Auth user id."""
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    country = Column(String(100), default="India")
    city = Column(String(100), nullable=True)
    phone_number = Column(String(50), nullable=True)
    preferred_currency = Column(String(10), default="USD")
    preferred_language = Column(String(20), default="en")
    job_title = Column(String(100), nullable=True)
    professional_role = Column(String(100), default="Sourcing Manager")
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BusinessMember(Base):
    """Team membership mapping between users and businesses."""
    __tablename__ = "business_members"

    id = Column(String(36), primary_key=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(50), default="owner")  # owner, admin, sourcing_manager, viewer
    created_at = Column(DateTime, default=datetime.utcnow)


class UserOnboardingProgress(Base):
    """Multi-step onboarding state persistence."""
    __tablename__ = "user_onboarding_progress"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=True)
    active_step = Column(Integer, default=1)
    completed_steps = Column(JSON, default=list)
    onboarding_status = Column(String(50), default="in_progress", index=True)  # not_started, in_progress, completed
    data_snapshot = Column(JSON, default=dict)
    started_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)



class ProductMaterial(Base):
    """Product-to-raw-material relational mapping with specs and quantities."""
    __tablename__ = "product_materials"

    id = Column(String(36), primary_key=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    material_name = Column(String(255), nullable=False)
    material_grade = Column(String(100), nullable=True)
    specifications = Column(Text, nullable=True)
    required_quantity = Column(Float, nullable=True)
    unit = Column(String(50), default="kg")
    quality_requirements = Column(Text, nullable=True)
    is_ai_suggested = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AIConversation(Base):
    """AI Sourcing consultation thread."""
    __tablename__ = "ai_conversations"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False, default="Sourcing Consultation")
    context_snapshot = Column(JSON, default=dict)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AIMessage.created_at")


class AIMessage(Base):
    """Individual turn in an AI assistant conversation."""
    __tablename__ = "ai_messages"

    id = Column(String(36), primary_key=True)
    conversation_id = Column(String(36), ForeignKey("ai_conversations.id"), nullable=False, index=True)
    sender = Column(String(20), nullable=False)  # user, assistant, system
    role = Column(String(20), nullable=False)    # user, assistant, system
    text = Column(Text, nullable=False)
    suggested_actions = Column(JSON, default=list)
    referenced_supplier_ids = Column(JSON, default=list)
    tool_calls = Column(JSON, default=list)
    tokens_used = Column(Integer, default=0)
    model_used = Column(String(100), default="gemini-flash-lite-latest")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversation = relationship("AIConversation", back_populates="messages")
    feedback = relationship("AIFeedback", back_populates="message", cascade="all, delete-orphan")


class AIMemory(Base):
    """Persistent user preferences, constraints and strategic sourcing memory."""
    __tablename__ = "ai_memory"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=True, index=True)
    memory_type = Column(String(50), nullable=False)  # preference, constraint, priority, decision
    key = Column(String(100), nullable=False)
    memory_value = Column(JSON, nullable=False)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AIUsageLog(Base):
    """Token accounting, latency telemetry and model cost observability."""
    __tablename__ = "ai_usage_logs"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=True, index=True)
    conversation_id = Column(String(36), ForeignKey("ai_conversations.id"), nullable=True)
    model = Column(String(100), nullable=False)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    status = Column(String(50), default="success")  # success, rate_limited, error
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AIRateLimitEvent(Base):
    """Rate limit breach and abuse mitigation telemetry."""
    __tablename__ = "ai_rate_limit_events"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=True, index=True)
    ip_address = Column(String(50), nullable=True)
    event_type = Column(String(50), nullable=False)  # per_minute_exceeded, per_day_tokens_exceeded, abuse_flag
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AIFeedback(Base):
    """Explicit user rating and quality feedback on assistant messages."""
    __tablename__ = "ai_feedback"

    id = Column(String(36), primary_key=True)
    message_id = Column(String(36), ForeignKey("ai_messages.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1 for thumbs up, -1 for thumbs down
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    message = relationship("AIMessage", back_populates="feedback")


class DataSource(Base):
    """Data source registry tracking provenance and trust tiers."""
    __tablename__ = "data_sources"

    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    source_type = Column(String(50), nullable=False)  # official_website, commercial_registry, b2b_directory
    domain = Column(String(255), nullable=False, index=True)
    base_url = Column(String(500), nullable=True)
    access_method = Column(String(50), default="public_http")
    trust_tier = Column(String(20), default="medium")  # authoritative, high, medium, low
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class BackgroundJob(Base):
    """Asynchronous supplier discovery and extraction job tracking."""
    __tablename__ = "background_jobs"

    id = Column(String(36), primary_key=True)
    job_type = Column(String(50), nullable=False)  # supplier_discovery, website_crawl, enrichment_agent, verification_audit
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=True)
    status = Column(String(50), default="queued", index=True)  # queued, searching, extracting, normalizing, verifying, completed, failed, cancelled
    provider = Column(String(50), nullable=True)  # nimbleway, apify, gemini, deepseek
    provider_run_id = Column(String(255), nullable=True)
    progress_percent = Column(Integer, default=0)
    current_step = Column(String(100), default="Initializing job...")
    query_text = Column(Text, nullable=True)
    result_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    metadata_json = Column("metadata", JSON, default=dict)
    started_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class SupplierCandidate(Base):
    """Discovered candidate URLs and preliminary metadata prior to verification."""
    __tablename__ = "supplier_candidates"

    id = Column(String(36), primary_key=True)
    job_id = Column(String(36), ForeignKey("background_jobs.id"), nullable=True, index=True)
    query = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    website_url = Column(String(500), nullable=False, index=True)
    domain = Column(String(255), nullable=True)
    snippet = Column(Text, nullable=True)
    country = Column(String(100), nullable=True)
    discovered_via = Column(String(50), default="nimbleway")  # nimbleway, apify, user_submitted
    processing_status = Column(String(50), default="discovered")  # discovered, crawling, extracted, resolved, ingested, rejected
    relevance_score = Column(Float, default=0.0)
    error_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RawSupplierRecord(Base):
    """Raw scraped supplier page text and unstructured payloads."""
    __tablename__ = "raw_supplier_records"

    id = Column(String(36), primary_key=True)
    candidate_id = Column(String(36), ForeignKey("supplier_candidates.id"), nullable=True)
    source_url = Column(String(500), nullable=False, index=True)
    provider = Column(String(50), nullable=False)  # nimbleway_extract, apify_actor, direct_http
    status_code = Column(Integer, default=200)
    raw_payload = Column(JSON, default=dict)
    text_content = Column(Text, nullable=True)
    extracted_at = Column(DateTime, default=datetime.utcnow)


class WebPage(Base):
    """Catalog of crawled web pages and checksums."""
    __tablename__ = "web_pages"

    id = Column(String(36), primary_key=True)
    domain = Column(String(255), nullable=False, index=True)
    url = Column(String(500), unique=True, nullable=False)
    page_type = Column(String(50), default="general")  # homepage, products, about, contact, certifications, factory
    page_title = Column(String(255), nullable=True)
    content_hash = Column(String(64), nullable=True)
    crawl_depth = Column(Integer, default=0)
    last_crawled_at = Column(DateTime, default=datetime.utcnow)


class SupplierFieldEvidence(Base):
    """Field-level provenance connecting specific supplier attributes to sources."""
    __tablename__ = "supplier_field_evidence"

    id = Column(String(36), primary_key=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=True, index=True)
    candidate_id = Column(String(36), ForeignKey("supplier_candidates.id"), nullable=True)
    field_name = Column(String(100), nullable=False, index=True)  # company_name, public_business_email, moq, unit_price, address
    field_value = Column(Text, nullable=False)
    source_url = Column(String(500), nullable=False)
    source_type = Column(String(50), default="official_company_website")
    provider = Column(String(50), nullable=False)  # apify, nimbleway, geoapify, registry
    excerpt = Column(Text, nullable=True)
    confidence = Column(String(20), default="high")  # high, medium, low
    verification_status = Column(String(50), default="requires_policy_check")  # passed, failed, requires_policy_check
    extracted_at = Column(DateTime, default=datetime.utcnow)


class SupplierConflict(Base):
    """Discrepancies and conflicting claims between multi-source observations."""
    __tablename__ = "supplier_conflicts"

    id = Column(String(36), primary_key=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)
    field_name = Column(String(100), nullable=False)
    claimed_value_a = Column(Text, nullable=False)
    source_a = Column(String(500), nullable=False)
    claimed_value_b = Column(Text, nullable=False)
    source_b = Column(String(500), nullable=False)
    resolution_status = Column(String(50), default="unresolved")  # unresolved, resolved, ignored
    resolved_value = Column(Text, nullable=True)
    resolved_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SupplierEntityLink(Base):
    """Deduplication and external identifier links for canonical suppliers."""
    __tablename__ = "supplier_entity_links"

    id = Column(String(36), primary_key=True)
    canonical_supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)
    external_source = Column(String(100), nullable=False)  # domain, cin, tax_id, nimbleway_url, apify_dataset_id
    external_id = Column(String(500), nullable=False, index=True)
    match_confidence = Column(Float, default=1.0)
    matched_by = Column(String(50), default="domain_resolver")  # exact_domain, name_similarity, phone_match
    created_at = Column(DateTime, default=datetime.utcnow)


class SupplierAuditEvent(Base):
    """Complete audit trail for supplier status changes, merges, and evaluations."""
    __tablename__ = "supplier_audit_events"

    id = Column(String(36), primary_key=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)  # created, verification_status_changed, field_updated, conflict_detected
    actor = Column(String(100), default="system")
    previous_state = Column(JSON, default=dict)
    new_state = Column(JSON, default=dict)
    change_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SearchProviderEvent(Base):
    """Telemetry, latency and cost tracking across external search providers."""
    __tablename__ = "search_provider_events"

    id = Column(String(36), primary_key=True)
    job_id = Column(String(36), ForeignKey("background_jobs.id"), nullable=True)
    provider = Column(String(50), nullable=False, index=True)  # nimbleway, apify, geoapify, deepseek, gemini
    endpoint = Column(String(255), nullable=False)
    request_type = Column(String(50), nullable=False)  # search, extract, crawl, geocode, chat
    status_code = Column(Integer, default=200)
    latency_ms = Column(Integer, default=0)
    estimated_cost_usd = Column(Float, default=0.0)
    is_success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)





