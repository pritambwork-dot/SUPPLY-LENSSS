-- Seed demo destinations
INSERT INTO destinations (id, name, city, state, country, latitude, longitude, destination_type) VALUES
('dest-001', 'Bhubaneswar Logistics Hub (Default)', 'Bhubaneswar', 'Odisha', 'India', 20.2961, 85.8245, 'Business'),
('dest-002', 'Mumbai Nhava Sheva CFS Hub', 'Navi Mumbai', 'Maharashtra', 'India', 18.9499, 72.9515, 'Warehouse'),
('dest-003', 'Delhi NCR Inland Container Depot', 'New Delhi', 'Delhi', 'India', 28.5085, 77.2917, 'Warehouse'),
('dest-004', 'Bengaluru Peenya Logistics Terminal', 'Bengaluru', 'Karnataka', 'India', 13.0285, 77.5197, 'Warehouse');

-- Seed demo suppliers
INSERT INTO suppliers (id, legal_name, display_name, country, country_code, city, state, address, supplier_type, verification_status, verification_score, data_confidence, is_demo_data, latitude, longitude) VALUES
('sup-000-odisha', 'Utkal GreenFiber Industries Pvt. Ltd.', 'Utkal GreenFiber', 'India', 'IN', 'Cuttack', 'Odisha', 'Plot 45, Jagatpur Industrial Estate Phase 1, Cuttack 754021, Odisha, India', 'OEM', 'Verified', 96, 95, TRUE, 20.4625, 85.8828),
('sup-ecopack-dg', 'Dongguan EcoPack Advanced Packaging Co., Ltd.', 'EcoPack Dongguan', 'China', 'CN', 'Dongguan', 'Guangdong', 'Building 4, High-Tech Industrial Zone, Chang''an Town, Dongguan, Guangdong 523850, China', 'OEM', 'Verified', 96, 93, TRUE, 22.8167, 113.8000),
('sup-vietbio-kraft', 'VietBio Eco-Packaging Joint Stock Company', 'VietBio Kraft', 'Vietnam', 'VN', 'Binh Duong', 'Binh Duong', 'VSIP Industrial Park II, Thuan An, Binh Duong 820000, Vietnam', 'Contract Manufacturer', 'Verified', 93, 90, TRUE, 10.9274, 106.7456),
('sup-ply-001', 'Kalinga EcoPly Industries Pvt. Ltd.', 'Kalinga EcoPly', 'India', 'IN', 'Cuttack', 'Odisha', 'Plot 12B, OCL Industrial Corridor, Cuttack 754021, Odisha, India', 'OEM', 'Verified', 95, 94, TRUE, 20.4625, 85.8828),
('sup-ply-002', 'Yamuna Agro Timber & Plywood LLP', 'Yamuna AgroPly', 'India', 'IN', 'Yamunanagar', 'Haryana', 'Timber Market Road, Yamunanagar 135001, Haryana, India', 'Contract Manufacturer', 'Verified', 92, 90, TRUE, 30.129, 77.2674),
('sup-ply-003', 'GreenDeco WoodCraft Industries Ltd.', 'GreenDeco Panels', 'India', 'IN', 'Kolkata', 'West Bengal', 'Taratala Industrial Area, Phase 2, Kolkata 700088, West Bengal, India', 'OEM', 'Verified', 98, 96, TRUE, 22.5026, 88.3139),
('sup-001', 'Navrang FiberTech Industries Pvt. Ltd.', 'Navrang FiberTech', 'India', 'IN', 'Pune', 'Maharashtra', 'Gat No. 142/A, Chakan MIDC Industrial Area Phase 2, Pune 410501, India', 'OEM', 'Verified', 94, 92, TRUE, 18.7606, 73.8567),
('sup-006', 'Nordic EcoForm GMBH', 'Nordic EcoForm', 'Germany', 'DE', 'Hamburg', 'Hamburg', 'Alsterufer 32, 20354 Hamburg, Germany', 'Raw Material Producer', 'Verified', 99, 98, TRUE, 53.5511, 9.9937);

-- Set source to demo_seed
INSERT INTO supplier_sources (id, supplier_id, source_name, source_type) VALUES
('src-0', 'sup-000-odisha', 'Demo dataset', 'demo_seed'),
('src-1', 'sup-ecopack-dg', 'Demo dataset', 'demo_seed'),
('src-2', 'sup-vietbio-kraft', 'Demo dataset', 'demo_seed'),
('src-3', 'sup-ply-001', 'Demo dataset', 'demo_seed'),
('src-4', 'sup-ply-002', 'Demo dataset', 'demo_seed'),
('src-5', 'sup-ply-003', 'Demo dataset', 'demo_seed'),
('src-6', 'sup-001', 'Demo dataset', 'demo_seed'),
('src-7', 'sup-006', 'Demo dataset', 'demo_seed');
