-- AG&P Attendance System - Supabase Database Schema
-- Run these SQL commands in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (enhanced with QR support)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'developer')),
    department VARCHAR(255),
    position VARCHAR(255),
    avatar TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- User QR Codes table
CREATE TABLE IF NOT EXISTS user_qr_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    qr_data JSONB NOT NULL,
    qr_image TEXT NOT NULL, -- Base64 encoded QR code image
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- One active QR code per user
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_in TIMESTAMP WITH TIME ZONE,
    time_out TIMESTAMP WITH TIME ZONE,
    total_hours DECIMAL(5,2),
    notes TEXT,
    scan_method VARCHAR(50) DEFAULT 'manual' CHECK (scan_method IN ('manual', 'qr_code', 'barcode', 'biometric')),
    location JSONB, -- Store location data if available
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    duration DECIMAL(5,2),
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Scan Logs table (for tracking QR code usage)
CREATE TABLE IF NOT EXISTS qr_scan_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    qr_code_id UUID REFERENCES user_qr_codes(id) ON DELETE CASCADE,
    scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scan_result VARCHAR(50) DEFAULT 'success' CHECK (scan_result IN ('success', 'failed', 'expired', 'invalid')),
    scan_location JSONB,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

CREATE INDEX IF NOT EXISTS idx_user_qr_codes_user_id ON user_qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_qr_codes_active ON user_qr_codes(is_active);

CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance_records(user_id, date);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);

CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_user_id ON qr_scan_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_timestamp ON qr_scan_logs(scan_timestamp);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scan_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own profile (except sensitive fields)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- QR Codes policies
CREATE POLICY "Users can view own QR codes" ON user_qr_codes
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own QR codes" ON user_qr_codes
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own QR codes" ON user_qr_codes
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Attendance records policies
CREATE POLICY "Users can view own attendance" ON attendance_records
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own attendance" ON attendance_records
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Activities policies
CREATE POLICY "Users can view own activities" ON activities
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own activities" ON activities
    FOR ALL USING (auth.uid()::text = user_id::text);

-- QR scan logs policies
CREATE POLICY "Users can view own scan logs" ON qr_scan_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can insert scan logs" ON qr_scan_logs
    FOR INSERT WITH CHECK (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_qr_codes_updated_at BEFORE UPDATE ON user_qr_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired QR codes
CREATE OR REPLACE FUNCTION cleanup_expired_qr_codes()
RETURNS void AS $$
BEGIN
    UPDATE user_qr_codes 
    SET is_active = false 
    WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Insert sample users (optional - for testing)
INSERT INTO users (email, username, password_hash, name, role, department, position) VALUES
('devmark@agp.com', 'devmark', '$2b$10$example_hash', 'Mark Developer', 'developer', 'IT_DEV', 'Senior Software Developer'),
('usermark@agp.com', 'usermark', '$2b$10$example_hash', 'Mark User', 'user', 'IT_DEV', 'Software Intern'),
('adminmark@agp.com', 'adminmark', '$2b$10$example_hash', 'Mark Admin', 'admin', 'HR', 'HR Manager')
ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts and profiles';
COMMENT ON TABLE user_qr_codes IS 'QR codes generated for each user for attendance scanning';
COMMENT ON TABLE attendance_records IS 'Daily attendance records with time in/out';
COMMENT ON TABLE activities IS 'User activities and tasks';
COMMENT ON TABLE qr_scan_logs IS 'Audit log of QR code scans';

COMMENT ON COLUMN user_qr_codes.qr_data IS 'JSON data embedded in the QR code';
COMMENT ON COLUMN user_qr_codes.qr_image IS 'Base64 encoded PNG image of the QR code';
COMMENT ON COLUMN attendance_records.scan_method IS 'Method used to record attendance';
COMMENT ON COLUMN qr_scan_logs.scan_result IS 'Result of the QR code scan attempt';
