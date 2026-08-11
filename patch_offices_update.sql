-- 1. Add columns to departments if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='acronym') THEN
        ALTER TABLE departments ADD COLUMN acronym TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='email') THEN
        ALTER TABLE departments ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2. Insert new departments and update existing ones

DO $$
DECLARE
    office_data json := '[
        {"name": "Mayor''s Office Administrative Section", "acronym": "MO-Admin", "email": "mo_admin@malungon.gov.ph"},
        {"name": "Bureau of Fire Protection", "acronym": "BFP", "email": "fire@malungon.gov.ph"},
        {"name": "Bids and Awards Committee", "acronym": "BAC", "email": "bac@malungon.gov.ph"},
        {"name": "Bureau of Internal Revenue", "acronym": "BIR", "email": "bir@malungon.gov.ph"},
        {"name": "Civil Security Unit", "acronym": "CSU", "email": "csu@malungon.gov.ph"},
        {"name": "General Services Office", "acronym": "GSO", "email": "gso@malungon.gov.ph"},
        {"name": "Local Disaster Risk Reduction and Management Office", "acronym": "LDRRMO", "email": "ldrrmo@malungon.gov.ph"},
        {"name": "Liga ng mga Barangay", "acronym": "LB", "email": "liga@malungon.gov.ph"},
        {"name": "Local Youth Development Office", "acronym": "LYDO", "email": "lydo@malungon.gov.ph"},
        {"name": "Municipal Economic Enterprise Development Office", "acronym": "MEEDO", "email": "market@malungon.gov.ph"},
        {"name": "Municipal Environment and Natural Resources Office", "acronym": "MENRO", "email": "menro@malungon.gov.ph"},
        {"name": "Municipal Local Government Operations Office", "acronym": "MLGOO", "email": "mlgoo@malungon.gov.ph"},
        {"name": "Municipal Social Welfare and Development Office", "acronym": "MSWDO", "email": "mswdo@malungon.gov.ph"},
        {"name": "Municipal Accounting Office", "acronym": "ACCOUNTING", "email": "accounting@malungon.gov.ph"},
        {"name": "Office of the Municipal Agriculturist", "acronym": "OMAG", "email": "agri@malungon.gov.ph"},
        {"name": "Municipal Assessor''s Office", "acronym": "MASSO", "email": "assessor@malungon.gov.ph"},
        {"name": "Municipal Budget Office", "acronym": "MBO", "email": "budget@malungon.gov.ph"},
        {"name": "Municipal Civil Registrar Office", "acronym": "MCR", "email": "registrar@malungon.gov.ph"},
        {"name": "Municipal Cooperative Development Office", "acronym": "MCDO", "email": "coop@malungon.gov.ph"},
        {"name": "Municipal Engineering Office", "acronym": "MEO", "email": "engineer@malungon.gov.ph"},
        {"name": "Municipal Health Office", "acronym": "MHO", "email": "health@malungon.gov.ph"},
        {"name": "Municipal Information Office", "acronym": "MIO", "email": "info@malungon.gov.ph"},
        {"name": "Municipal Treasurer''s Office", "acronym": "MTO", "email": "treasurer@malungon.gov.ph"},
        {"name": "Municipal Tribal Council", "acronym": "MTC", "email": "tribal@malungon.gov.ph"},
        {"name": "Municipal Nutrition Office", "acronym": "MNO", "email": "nutrition@malungon.gov.ph"},
        {"name": "Office of the Mayor", "acronym": "OM", "email": "mayor@malungon.gov.ph"},
        {"name": "Office of the Vice Mayor", "acronym": "OVM", "email": "vicemayor@malungon.gov.ph"},
        {"name": "Business Permits and Licensing Office", "acronym": "BPLO", "email": "permits@malungon.gov.ph"},
        {"name": "Human Resource Management Office", "acronym": "HRMO", "email": "hr@malungon.gov.ph"},
        {"name": "Public Employment Service Office", "acronym": "PESO", "email": "peso@malungon.gov.ph"},
        {"name": "Municipal Planning and Development Office", "acronym": "MPDO", "email": "planning@malungon.gov.ph"},
        {"name": "Philippine National Police", "acronym": "PNP", "email": "pnp@malungon.gov.ph"},
        {"name": "Sangguniang Bayan", "acronym": "SB", "email": "sb@malungon.gov.ph"},
        {"name": "Municipal Tourism Office", "acronym": "MTO", "email": "tourism@malungon.gov.ph"},
        {"name": "Systems Administrator", "acronym": "SYSTEMS", "email": "systems@malungon.gov.ph"},
        {"name": "Web Administrator", "acronym": "WEBADMIN", "email": "webadmin@malungon.gov.ph"}
    ]';
    rec record;
BEGIN
    FOR rec IN SELECT * FROM json_populate_recordset(null::record, office_data) AS x(name text, acronym text, email text)
    LOOP
        IF EXISTS (SELECT 1 FROM departments WHERE name = rec.name) THEN
            UPDATE departments SET acronym = rec.acronym, email = rec.email WHERE name = rec.name;
        ELSE
            INSERT INTO departments (name, acronym, email) VALUES (rec.name, rec.acronym, rec.email);
        END IF;
    END LOOP;
END $$;
