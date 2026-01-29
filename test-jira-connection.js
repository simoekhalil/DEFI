const https = require('https');

// Test JIRA connection
const JIRA_CONFIG = {
  baseURL: 'https://galagames.atlassian.net',
  email: 'Skhalil@gala.games',
  apiToken: process.env.JIRA_API_TOKEN || '',  // Set via environment variable
  projectKey: 'GW'
};

// Test connection by getting project info
function testJIRAConnection() {
  const auth = Buffer.from(JIRA_CONFIG.email + ':' + JIRA_CONFIG.apiToken).toString('base64');
  
  const options = {
    hostname: 'galagames.atlassian.net',
    port: 443,
    path: '/rest/api/3/project/' + JIRA_CONFIG.projectKey,
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json'
    }
  };

  console.log('🔍 Testing JIRA connection...');
  console.log('Base URL:', JIRA_CONFIG.baseURL);
  console.log('Project Key:', JIRA_CONFIG.projectKey);
  console.log('Email:', JIRA_CONFIG.email);

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const response = JSON.parse(data);
        console.log('✅ JIRA Connection Successful!');
        console.log('Project Name:', response.name);
        console.log('Project Key:', response.key);
        console.log('Project ID:', response.id);
        console.log('Project Type:', response.projectTypeKey);
      } else {
        console.error('❌ JIRA Connection Failed');
        console.error('Status Code:', res.statusCode);
        console.error('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error);
  });

  req.end();
}

testJIRAConnection();

