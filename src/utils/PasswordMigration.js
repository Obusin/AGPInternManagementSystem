/**
 * Password Migration Utility
 * Migrates existing plain text passwords to hashed passwords
 */

class PasswordMigration {
    constructor() {
        this.migrationKey = 'agp_password_migration_completed';
    }

    /**
     * Check if migration has been completed
     */
    isMigrationCompleted() {
        return localStorage.getItem(this.migrationKey) === 'true';
    }

    /**
     * Mark migration as completed
     */
    markMigrationCompleted() {
        localStorage.setItem(this.migrationKey, 'true');
    }

    /**
     * Migrate all user passwords from plain text to hashed
     */
    async migratePasswords() {
        if (this.isMigrationCompleted()) {
            console.log('Password migration already completed');
            return { success: true, message: 'Migration already completed' };
        }

        try {
            console.log('Starting password migration...');
            
            // Get all users from the database
            const users = window.userDatabase.users;
            let migratedCount = 0;
            let errors = [];

            for (const [username, user] of Object.entries(users)) {
                try {
                    // Check if password is already hashed
                    if (typeof user.password === 'object' && user.password.hash) {
                        console.log(`User ${username} already has hashed password`);
                        continue;
                    }

                    // Hash the plain text password
                    const plainPassword = user.password;
                    const hashedPassword = await window.securityService.hashPassword(plainPassword);
                    
                    // Update user with hashed password
                    user.password = hashedPassword;
                    user.passwordLastChanged = new Date().toISOString();
                    user.requirePasswordChange = false; // They can change it later if needed
                    
                    migratedCount++;
                    console.log(`Migrated password for user: ${username}`);
                    
                } catch (error) {
                    console.error(`Failed to migrate password for user ${username}:`, error);
                    errors.push(`${username}: ${error.message}`);
                }
            }

            // Save updated users back to database
            window.userDatabase.users = users;
            
            // Mark migration as completed
            this.markMigrationCompleted();
            
            console.log(`Password migration completed. Migrated ${migratedCount} passwords.`);
            
            return {
                success: true,
                message: `Successfully migrated ${migratedCount} passwords`,
                migratedCount: migratedCount,
                errors: errors
            };
            
        } catch (error) {
            console.error('Password migration failed:', error);
            return {
                success: false,
                message: 'Password migration failed: ' + error.message,
                error: error
            };
        }
    }

    /**
     * Reset migration status (for testing purposes)
     */
    resetMigration() {
        localStorage.removeItem(this.migrationKey);
        console.log('Migration status reset');
    }

    /**
     * Verify that all passwords are properly hashed
     */
    verifyMigration() {
        const users = window.userDatabase.users;
        const results = {
            total: 0,
            hashed: 0,
            plainText: 0,
            invalid: 0,
            details: []
        };

        for (const [username, user] of Object.entries(users)) {
            results.total++;
            
            if (typeof user.password === 'object' && user.password.hash && user.password.salt) {
                results.hashed++;
                results.details.push({
                    username: username,
                    status: 'hashed',
                    algorithm: user.password.algorithm || 'PBKDF2'
                });
            } else if (typeof user.password === 'string') {
                results.plainText++;
                results.details.push({
                    username: username,
                    status: 'plain-text',
                    needsMigration: true
                });
            } else {
                results.invalid++;
                results.details.push({
                    username: username,
                    status: 'invalid',
                    error: 'Invalid password format'
                });
            }
        }

        return results;
    }

    /**
     * Create backup of current user data before migration
     */
    createBackup() {
        try {
            const users = window.userDatabase.users;
            const backup = {
                timestamp: new Date().toISOString(),
                version: '2.0.0',
                users: JSON.parse(JSON.stringify(users)) // Deep copy
            };
            
            localStorage.setItem('agp_password_backup', JSON.stringify(backup));
            console.log('User data backup created');
            return { success: true, message: 'Backup created successfully' };
            
        } catch (error) {
            console.error('Failed to create backup:', error);
            return { success: false, message: 'Failed to create backup: ' + error.message };
        }
    }

    /**
     * Restore from backup
     */
    restoreFromBackup() {
        try {
            const backupData = localStorage.getItem('agp_password_backup');
            if (!backupData) {
                return { success: false, message: 'No backup found' };
            }
            
            const backup = JSON.parse(backupData);
            window.userDatabase.users = backup.users;
            
            // Reset migration status
            this.resetMigration();
            
            console.log('Restored from backup');
            return { success: true, message: 'Successfully restored from backup' };
            
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            return { success: false, message: 'Failed to restore from backup: ' + error.message };
        }
    }

    /**
     * Show migration progress UI
     */
    showMigrationProgress() {
        // Create progress modal
        const modal = document.createElement('div');
        modal.className = 'migration-modal';
        modal.innerHTML = `
            <div class="migration-content">
                <h3><i class="fas fa-shield-alt"></i> Security Upgrade</h3>
                <p>Upgrading password security for all users...</p>
                <div class="migration-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="migrationProgress"></div>
                    </div>
                    <div class="progress-text" id="migrationText">Preparing migration...</div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .migration-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            .migration-content {
                background: var(--card-bg, #2a2a2a);
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                max-width: 400px;
                width: 90%;
            }
            .migration-content h3 {
                color: var(--primary-color, #ff7a45);
                margin-bottom: 1rem;
            }
            .migration-progress {
                margin-top: 1.5rem;
            }
            .progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 1rem;
            }
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff7a45, #ff9a65);
                width: 0%;
                transition: width 0.3s ease;
            }
            .progress-text {
                color: var(--text-secondary, #ccc);
                font-size: 0.9rem;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        return {
            updateProgress: (percent, text) => {
                const progressFill = document.getElementById('migrationProgress');
                const progressText = document.getElementById('migrationText');
                if (progressFill) progressFill.style.width = percent + '%';
                if (progressText) progressText.textContent = text;
            },
            close: () => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        };
    }

    /**
     * Run migration with UI feedback
     */
    async runMigrationWithUI() {
        const ui = this.showMigrationProgress();
        
        try {
            // Step 1: Create backup
            ui.updateProgress(10, 'Creating backup...');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const backupResult = this.createBackup();
            if (!backupResult.success) {
                throw new Error('Failed to create backup');
            }
            
            // Step 2: Verify current state
            ui.updateProgress(20, 'Analyzing current passwords...');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const verification = this.verifyMigration();
            
            // Step 3: Migrate passwords
            ui.updateProgress(30, 'Migrating passwords...');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const migrationResult = await this.migratePasswords();
            
            // Step 4: Verify migration
            ui.updateProgress(80, 'Verifying migration...');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const finalVerification = this.verifyMigration();
            
            // Step 5: Complete
            ui.updateProgress(100, 'Migration completed successfully!');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            ui.close();
            
            return {
                success: true,
                message: 'Password migration completed successfully',
                details: {
                    before: verification,
                    after: finalVerification,
                    migrationResult: migrationResult
                }
            };
            
        } catch (error) {
            ui.updateProgress(0, 'Migration failed: ' + error.message);
            await new Promise(resolve => setTimeout(resolve, 2000));
            ui.close();
            
            return {
                success: false,
                message: 'Migration failed: ' + error.message,
                error: error
            };
        }
    }
}

// Create global instance
window.passwordMigration = new PasswordMigration();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PasswordMigration;
}
