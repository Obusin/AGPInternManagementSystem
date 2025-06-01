#!/bin/bash

# AG&P Attendance System - Deployment Script
# This script prepares and deploys the application to Vercel

echo "🚀 AG&P Attendance System - Deployment Script"
echo "=============================================="
echo "📱 QR Code & Supabase Integration Ready"

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a Git repository. Please initialize Git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Prepare for deployment - $(date)"
fi

# Push to remote repository
echo "📤 Pushing to remote repository..."
git push origin main || git push origin master

echo "✅ Code pushed successfully!"

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    echo "🔧 Vercel CLI found. Deploying..."
    
    # Deploy to Vercel
    vercel --prod
    
    echo "🎉 Deployment complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Check your deployment at the provided URL"
    echo "2. Configure environment variables in Vercel dashboard:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "3. Set up Supabase database for QR code storage:"
    echo "   - Run SQL from docs/SUPABASE_SCHEMA.sql"
    echo "   - Enable Row Level Security"
    echo "4. Test QR code generation and scanning"
    echo ""
    echo "🔗 Useful Links:"
    echo "- Vercel Dashboard: https://vercel.com/dashboard"
    echo "- Supabase Dashboard: https://app.supabase.com"
    echo "- QR Schema: ./docs/SUPABASE_SCHEMA.sql"
    echo "- Documentation: ./docs/DEPLOYMENT.md"
    
else
    echo "⚠️  Vercel CLI not found. Please install it:"
    echo "   npm i -g vercel"
    echo ""
    echo "Or deploy manually:"
    echo "1. Go to https://vercel.com"
    echo "2. Import your GitHub repository"
    echo "3. Deploy with default settings"
    echo ""
    echo "📋 Manual Deployment Steps:"
    echo "1. Create new project in Vercel"
    echo "2. Connect your GitHub repository"
    echo "3. Set Framework Preset to 'Other'"
    echo "4. Deploy with default build settings"
    echo "5. Add environment variables if needed"
fi

echo ""
echo "🎊 Deployment script completed!"
