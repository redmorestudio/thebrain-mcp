#!/usr/bin/env node

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.THEBRAIN_API_KEY;
const BRAIN_ID = '16aa75d1-ee3b-468e-a796-7ac6f95a4ba6';

console.log('Testing TheBrain API authentication...');
console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');

async function testAuth() {
  const baseUrl = 'https://api.bra.in';
  
  // Test 1: GET request (works)
  console.log('\n1. Testing GET request (list brains):');
  try {
    const response = await fetch(`${baseUrl}/brains`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    console.log('Response status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GET request successful, found', data.length, 'brains');
    } else {
      console.log('❌ GET request failed:', await response.text());
    }
  } catch (error) {
    console.log('❌ GET request error:', error.message);
  }

  // Test 2: POST request with Bearer token
  console.log('\n2. Testing POST request with Bearer token:');
  try {
    const thoughtData = {
      name: 'Test Auth Thought',
      kind: 1,
      acType: 0
    };
    
    const response = await fetch(`${baseUrl}/thoughts/${BRAIN_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(thoughtData)
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ POST request successful');
    } else {
      console.log('❌ POST request failed');
    }
  } catch (error) {
    console.log('❌ POST request error:', error.message);
  }

  // Test 3: Try different auth header formats
  console.log('\n3. Testing alternative auth formats:');
  
  // Try without Bearer prefix
  console.log('\n3a. Testing without Bearer prefix:');
  try {
    const response = await fetch(`${baseUrl}/thoughts/${BRAIN_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Test No Bearer', kind: 1 })
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
      console.log('Response:', await response.text());
    } else {
      console.log('✅ Success without Bearer!');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Try X-API-Key header
  console.log('\n3b. Testing X-API-Key header:');
  try {
    const response = await fetch(`${baseUrl}/thoughts/${BRAIN_ID}`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Test X-API-Key', kind: 1 })
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
      console.log('Response:', await response.text());
    } else {
      console.log('✅ Success with X-API-Key!');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Try Api-Key header
  console.log('\n3c. Testing Api-Key header:');
  try {
    const response = await fetch(`${baseUrl}/thoughts/${BRAIN_ID}`, {
      method: 'POST',
      headers: {
        'Api-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Test Api-Key', kind: 1 })
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
      console.log('Response:', await response.text());
    } else {
      console.log('✅ Success with Api-Key!');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAuth().catch(console.error);
