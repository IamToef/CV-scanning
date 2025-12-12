const fs = require('fs');

const workflow = JSON.parse(fs.readFileSync('HR-CV-debug.json', 'utf8'));

// 1. Define the new Code Node
const codeNode = {
    "parameters": {
        "jsCode": `
const candidates = items.map(item => {
  const d = item.json;
  return {
    id: d["Link_CV"] || "unknown_" + Math.random().toString(36).substr(2, 9),
    name: d["Họ tên ứng viên"] || "Unknown",
    email: d["email"] || "",
    phone: d["phone_number"] || "",
    score: parseInt(d["score_overall"] || "0"),
    status: "analyzed",
    summary: d["summary"] || "",
    match_level: d["match_level"] || "",
    
    // Map Factors to lists as best effort
    strengths: d["giải thích reward"] ? [d["giải thích reward"]] : [],
    weaknesses: d["giải thích risk"] ? [d["giải thích risk"]] : [],
    skills_found: [], 
    skills_missing: [],
    
    // Add raw scores for detailed view if needed
    details: {
        experience: d["experience_match_score"],
        skills: d["skill_match_score"],
        education: d["education_match_score"],
        potential: d["achivement_potential_score"]
    }
  };
});

return [{
  json: {
    candidates: candidates
  }
}];
    `
    },
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [
        880,
        192
    ],
    "id": "format-response-node",
    "name": "Format API Response"
};

// 2. Add the node
workflow.nodes.push(codeNode);

// 3. Update Connections
// Connection: "Append or update row in sheet" -> "Format API Response"
// Connection: "Format API Response" -> "Respond to Webhook"

const sheetNodeName = "Append or update row in sheet";
const webhookResponseName = "Respond to Webhook";
const formatNodeName = "Format API Response";

// Remove old connection TO Respond to Webhook
if (workflow.connections[sheetNodeName]) {
    workflow.connections[sheetNodeName].main = [
        [
            {
                "node": formatNodeName,
                "type": "main",
                "index": 0
            }
        ]
    ];
}

// Add connection FROM Format Node
workflow.connections[formatNodeName] = {
    "main": [
        [
            {
                "node": webhookResponseName,
                "type": "main",
                "index": 0
            }
        ]
    ]
};

// Write result
fs.writeFileSync('HR-CV-fixed.json', JSON.stringify(workflow, null, 2));
console.log('Fixed workflow saved to HR-CV-fixed.json');
