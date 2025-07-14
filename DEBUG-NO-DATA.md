# Debug: No Athletes Found

## 🔍 **Check What Data Exists**

Run these SQL queries in order to understand what data you have:

### **1. Check if athletes exist at all:**
```sql
SELECT id, name, created_at 
FROM athletes 
ORDER BY created_at DESC 
LIMIT 10;
```

### **2. Check readiness_scores table:**
```sql
SELECT 
    athlete_uuid, 
    score, 
    ts::date as date,
    COUNT(*) OVER() as total_records
FROM readiness_scores 
ORDER BY ts DESC 
LIMIT 5;
```

### **3. Check muscle_load_daily table:**
```sql
SELECT 
    athlete_id, 
    day, 
    muscle, 
    acute_load,
    COUNT(*) OVER() as total_records
FROM muscle_load_daily 
ORDER BY day DESC 
LIMIT 5;
```

### **4. Check athletes with ANY data (no date filter):**
```sql
SELECT DISTINCT 
    a.id as athlete_id,
    a.name,
    COUNT(r.score) as readiness_count,
    COUNT(m.acute_load) as muscle_load_count
FROM athletes a
LEFT JOIN readiness_scores r ON a.id = r.athlete_uuid 
LEFT JOIN muscle_load_daily m ON a.id = m.athlete_id 
GROUP BY a.id, a.name
ORDER BY readiness_count DESC, muscle_load_count DESC
LIMIT 10;
```

## 🏗️ **Create Test Data**

If no data exists, create some test data:

### **Step 1: Create a test athlete (if none exist):**
```sql
INSERT INTO athletes (id, name, email, created_at)
VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'Test Athlete', 'test@example.com', NOW())
ON CONFLICT (id) DO NOTHING;
```

### **Step 2: Add test readiness data:**
```sql
INSERT INTO readiness_scores (athlete_uuid, score, ts)
VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 75, CURRENT_DATE),
    ('123e4567-e89b-12d3-a456-426614174000', 82, CURRENT_DATE - INTERVAL '1 day'),
    ('123e4567-e89b-12d3-a456-426614174000', 68, CURRENT_DATE - INTERVAL '2 days')
ON CONFLICT DO NOTHING;
```

### **Step 3: Add test muscle load data:**
```sql
INSERT INTO muscle_load_daily (athlete_id, day, muscle, acute_load, chronic_load, acwr)
VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', CURRENT_DATE, 'chest', 150, 120, 1.25),
    ('123e4567-e89b-12d3-a456-426614174000', CURRENT_DATE, 'legs', 200, 180, 1.11),
    ('123e4567-e89b-12d3-a456-426614174000', CURRENT_DATE, 'back', 180, 160, 1.13),
    ('123e4567-e89b-12d3-a456-426614174000', CURRENT_DATE - INTERVAL '1 day', 'chest', 140, 118, 1.19),
    ('123e4567-e89b-12d3-a456-426614174000', CURRENT_DATE - INTERVAL '1 day', 'legs', 190, 175, 1.09)
ON CONFLICT DO NOTHING;
```

### **Step 4: Verify test data was created:**
```sql
-- Check our test athlete now has data
SELECT DISTINCT 
    a.id as athlete_id,
    a.name,
    COUNT(r.score) as readiness_count,
    COUNT(m.acute_load) as muscle_load_count
FROM athletes a
LEFT JOIN readiness_scores r ON a.id = r.athlete_uuid 
    AND r.ts >= CURRENT_DATE - INTERVAL '7 days'
LEFT JOIN muscle_load_daily m ON a.id = m.athlete_id 
    AND m.day >= CURRENT_DATE - INTERVAL '7 days'
WHERE a.id = '123e4567-e89b-12d3-a456-426614174000'
GROUP BY a.id, a.name;
```

## 🧪 **Test the Function**

After creating test data, use this UUID in the function test:
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

## 🎯 **Expected Results**

After running the test data creation:
- ✅ Should find 1 athlete with data
- ✅ Function should return `{"created": 2}` or `{"created": 3}`
- ✅ aria_insights table should have new records

## 🔧 **Common Table Issues**

If inserts fail, check table structure:

### **Check athletes table structure:**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'athletes' 
ORDER BY ordinal_position;
```

### **Check readiness_scores table structure:**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'readiness_scores' 
ORDER BY ordinal_position;
```

### **Check muscle_load_daily table structure:**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'muscle_load_daily' 
ORDER BY ordinal_position;
```

This will help you understand what data exists and create test data if needed!