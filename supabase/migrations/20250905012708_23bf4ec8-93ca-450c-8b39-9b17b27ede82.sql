-- Add search_tsv columns and triggers for full-text search across all tables
-- Buildings table
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS search_tsv tsvector;

-- Create function for updating search_tsv on buildings
CREATE OR REPLACE FUNCTION buildings_tsv_trg()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_tsv := to_tsvector('english',
    COALESCE(NEW.name,'') || ' ' || 
    COALESCE(NEW.code,'') || ' ' || 
    COALESCE(NEW.category,'')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for buildings
DROP TRIGGER IF EXISTS buildings_search_tsv_update ON buildings;
CREATE TRIGGER buildings_search_tsv_update
  BEFORE INSERT OR UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION buildings_tsv_trg();

-- Courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS search_tsv tsvector;

CREATE OR REPLACE FUNCTION courses_tsv_trg()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_tsv := to_tsvector('english',
    COALESCE(NEW.title,'') || ' ' || 
    COALESCE(NEW.code,'') || ' ' || 
    COALESCE(NEW.description,'') || ' ' ||
    COALESCE(NEW.prereqs,'')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS courses_search_tsv_update ON courses;
CREATE TRIGGER courses_search_tsv_update
  BEFORE INSERT OR UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION courses_tsv_trg();

-- Faculty table
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS search_tsv tsvector;

CREATE OR REPLACE FUNCTION faculty_tsv_trg()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_tsv := to_tsvector('english',
    COALESCE(NEW.name,'') || ' ' || 
    COALESCE(NEW.dept,'') || ' ' || 
    COALESCE(NEW.research_areas::text,'') || ' ' ||
    COALESCE(NEW.office,'')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS faculty_search_tsv_update ON faculty;
CREATE TRIGGER faculty_search_tsv_update
  BEFORE INSERT OR UPDATE ON faculty
  FOR EACH ROW EXECUTE FUNCTION faculty_tsv_trg();

-- Programs table
ALTER TABLE programs ADD COLUMN IF NOT EXISTS search_tsv tsvector;

CREATE OR REPLACE FUNCTION programs_tsv_trg()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_tsv := to_tsvector('english',
    COALESCE(NEW.name,'') || ' ' || 
    COALESCE(NEW.dept,'') || ' ' || 
    COALESCE(NEW.level,'') || ' ' ||
    COALESCE(NEW.overview,'')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS programs_search_tsv_update ON programs;
CREATE TRIGGER programs_search_tsv_update
  BEFORE INSERT OR UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION programs_tsv_trg();

-- Update existing records to populate search_tsv
UPDATE buildings SET search_tsv = to_tsvector('english',
  COALESCE(name,'') || ' ' || 
  COALESCE(code,'') || ' ' || 
  COALESCE(category,'')
) WHERE search_tsv IS NULL;

UPDATE courses SET search_tsv = to_tsvector('english',
  COALESCE(title,'') || ' ' || 
  COALESCE(code,'') || ' ' || 
  COALESCE(description,'') || ' ' ||
  COALESCE(prereqs,'')
) WHERE search_tsv IS NULL;

UPDATE faculty SET search_tsv = to_tsvector('english',
  COALESCE(name,'') || ' ' || 
  COALESCE(dept,'') || ' ' || 
  COALESCE(research_areas::text,'') || ' ' ||
  COALESCE(office,'')
) WHERE search_tsv IS NULL;

UPDATE programs SET search_tsv = to_tsvector('english',
  COALESCE(name,'') || ' ' || 
  COALESCE(dept,'') || ' ' || 
  COALESCE(level,'') || ' ' ||
  COALESCE(overview,'')
) WHERE search_tsv IS NULL;