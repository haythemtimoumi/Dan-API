-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin user (password: admin123)
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2b$12$WCcbG/1RjvcJNTARGm1FWejjkcs5m5un6pRqa3r83ZLyPG.NDP83G', 'admin')
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;

-- Create regular user (password: user123)
INSERT INTO users (username, password, role) 
VALUES ('user', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON CONFLICT (username) DO NOTHING;