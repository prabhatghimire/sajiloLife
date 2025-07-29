const fetch = require('node-fetch');

// Test the API endpoint
async function testAPI() {
  try {
    const response = await fetch(
      'http://192.168.1.77:8000/api/delivery/requests/',
      {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUzODA5NjMwLCJpYXQiOjE3NTM4MDYwMzAsImp0aSI6ImZkMzc0ZDgzOTJhNjRiM2E4NjZjZDQyZDU4MGEwYmVlIiwidXNlcl9pZCI6MX0.1z_BjB2U6YWJWeZASIiP-jZwdfOSMpW33aKKPNkwE2w',
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    console.log('Status:', response.status);
    console.log('Number of deliveries:', data.count);
  } catch (error) {
    console.error('API Test Error:', error.message);
  }
}

testAPI();
