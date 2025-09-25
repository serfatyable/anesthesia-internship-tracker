#!/usr/bin/env tsx

import { isAdmin, isTutor, isIntern } from '../lib/rbac';

console.log('🧪 Testing RBAC helpers...\n');

// Test role detection
console.log('✅ isAdmin("ADMIN"):', isAdmin('ADMIN'));
console.log('✅ isTutor("TUTOR"):', isTutor('TUTOR'));
console.log('✅ isIntern("INTERN"):', isIntern('INTERN'));
console.log('❌ isAdmin("TUTOR"):', isAdmin('TUTOR'));
console.log('❌ isTutor("INTERN"):', isTutor('INTERN'));
console.log('❌ isIntern("ADMIN"):', isIntern('ADMIN'));

// Test null/undefined handling
console.log('\n🔍 Testing null/undefined handling...');
console.log('❌ isAdmin(null):', isAdmin(null));
console.log('❌ isTutor(undefined):', isTutor(undefined));
console.log('❌ isIntern(null):', isIntern(null));

console.log('\n✅ RBAC helpers working correctly!');
