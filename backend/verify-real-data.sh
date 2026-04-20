#!/bin/bash
# Quick verification script to check real data in database

echo "🔍 Checking Real-World Data in Database..."
echo ""

cd "$(dirname "$0")"

# Check employees
echo "👥 EMPLOYEES (Real names from Random User API):"
sqlite3 db/database.sqlite "SELECT COUNT(*) as total FROM employees;" 2>/dev/null | xargs -I {} echo "  Total: {} employees"
sqlite3 db/database.sqlite "SELECT name, type, department FROM employees LIMIT 5;" 2>/dev/null | tail -5

echo ""
echo "🏭 WAREHOUSES (Real US Cities):"
sqlite3 db/database.sqlite "SELECT location FROM warehouses;" 2>/dev/null

echo ""
echo "📦 PRODUCTS (Industrial Equipment):"
sqlite3 db/database.sqlite "SELECT COUNT(*) as total FROM parts;" 2>/dev/null | xargs -I {} echo "  Total: {} products"
sqlite3 db/database.sqlite "SELECT description, price, stock FROM parts LIMIT 5;" 2>/dev/null | tail -5

echo ""
echo "📈 BACKORDERS:"
sqlite3 db/database.sqlite "SELECT COUNT(*) as total FROM backorders;" 2>/dev/null | xargs -I {} echo "  Total: {} backorders"

echo ""
echo "✅ Database verification complete!"
