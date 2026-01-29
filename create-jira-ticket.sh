#!/bin/bash

# JIRA Configuration
JIRA_BASE_URL="https://galagames.atlassian.net"
EMAIL="Skhalil@gala.games"
API_TOKEN="${JIRA_API_TOKEN}"  # Set via environment variable
PROJECT_KEY="GW"

# Create authentication header
AUTH_HEADER=$(echo -n "$EMAIL:$API_TOKEN" | base64)

# JIRA ticket data
TICKET_DATA='{
  "fields": {
    "project": {
      "key": "'$PROJECT_KEY'"
    },
    "summary": "Test Failure: Token Symbol Validation Test Timeout - Website Missing Validation Implementation",
    "description": {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "The \"should test token symbol validation rules\" test is failing due to timeout, but investigation reveals the actual issue is that the Gala DeFi website doesn'\''t implement the required form validation rules."
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [
            {
              "type": "text",
              "text": "Test Results"
            }
          ]
        },
        {
          "type": "bulletList",
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "✅ 6 tests PASSED (85.7% success rate)"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "❌ 1 test FAILED - Token Symbol Validation"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "⏱️ Duration: 33.6 seconds (exceeded 30s timeout)"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [
            {
              "type": "text",
              "text": "Root Cause Analysis"
            }
          ]
        },
        {
          "type": "orderedList",
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Test Timeout: Test exceeded 30-second timeout at line 259"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Missing Validation: Website doesn'\''t implement real-time form validation"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Expected vs Actual: Test expects validation errors that don'\''t exist on the website"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [
            {
              "type": "text",
              "text": "Validation Rules Not Implemented"
            }
          ]
        },
        {
          "type": "bulletList",
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "❌ Token Name: 2-25 characters, alphanumeric, no spaces/special chars"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "❌ Token Symbol: 1-8 characters, alphabets only, no spaces/numbers"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "❌ Description: 2-250 characters validation"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "❌ Image Upload: JPG/JPEG/PNG format, <4MB size validation"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [
            {
              "type": "text",
              "text": "Technical Details"
            }
          ]
        },
        {
          "type": "codeBlock",
          "attrs": { "language": "text" },
          "content": [
            {
              "type": "text",
              "text": "Test File: tests/launch-page-simple.spec.ts\nFailed Test: \"should test token symbol validation rules\"\nError Location: Line 259 - await page.waitForTimeout(1000)\nError Message: Test timeout of 30000ms exceeded"
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [
            {
              "type": "text",
              "text": "Recommendations"
            }
          ]
        },
        {
          "type": "orderedList",
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Option 1: Update Website (Recommended) - Implement the required form validation rules"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Option 2: Update Tests - Remove validation expectations, focus on form functionality"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Option 3: Hybrid Approach - Test current functionality, document missing validation"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    "issuetype": {
      "name": "Bug"
    },
    "priority": {
      "name": "Medium"
    },
    "labels": ["form-validation", "launch-page", "test-failure", "website-limitation", "web3", "defi"]
  }
}'

echo "🚀 Creating JIRA ticket..."

# Make the API call
curl -X POST \
  -H "Authorization: Basic $AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "$TICKET_DATA" \
  "$JIRA_BASE_URL/rest/api/3/issue" \
  | jq '.'

echo "✅ JIRA ticket creation completed!"

