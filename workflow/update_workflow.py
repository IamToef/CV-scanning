import json

path = r"c:\A\baihoc\Intern\phong\talent-iq\workflow\JD_Extraction.json"
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

# The Output Parser Schema we want
schema = {
  "job_position": "string (Tên vị trí công việc, VD: Business Analyst)",
  "technical_skills": ["string (Danh sách kỹ năng chuyên môn và công cụ, VD: Java, SQL)"],
  "years_of_experience": {
    "min_years": "number (Số năm kinh nghiệm tối thiểu)",
    "description": "string (Trích dẫn nguyên văn yêu cầu kinh nghiệm)"
  },
  "education": {
    "degree_level": "string (VD: Đại học, Cao đẳng)",
    "major": "string (Chuyên ngành)",
    "certifications": ["string (Các chứng chỉ yêu cầu)"]
  },
  "soft_skills": ["string (Danh sách kỹ năng mềm)"]
}

# Find the nodes
ai_agent = next(n for n in data["nodes"] if n["id"] == "3b28f260-b35c-4b36-b177-3cca2d06a366")
code_node = next((n for n in data["nodes"] if n["id"] == "b3e10aa2-551b-482a-9914-51775f4669f0"), None)

# 1. Update AI Agent to Chain LLM
ai_agent["type"] = "@n8n/n8n-nodes-langchain.chainLlm"
ai_agent["typeVersion"] = 1.4
ai_agent["name"] = "Information Extraction Builder"
ai_agent["parameters"] = {
    "promptType": "define",
    "text": "={{ $json.body.message }}",
    "hasOutputParser": True,
    "options": {
        "systemMessage": "Bạn là một trợ lý nhân sự (HR) chuyên nghiệp. Nhiệm vụ của bạn là trích xuất các yêu cầu quan trọng từ Bản mô tả công việc (JD). Trả về kết quả dưới dạng JSON dựa trên cấu trúc được cung cấp. Bỏ qua các phần giới thiệu công ty hoặc các thông tin không phải yêu cầu công việc. Trích xuất chính xác."
    }
}
ai_agent["position"] = [260, 0]

# 2. Add Output Parser Node
parser_id = "f05b9679-b1d7-46e3-98eb-843de419e123"
parser_node = {
    "parameters": {
        "jsonSchemaExample": json.dumps(schema, indent=2, ensure_ascii=False)
    },
    "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
    "typeVersion": 1.3,
    "position": [240, 240],
    "id": parser_id,
    "name": "Structured Output Parser"
}
data["nodes"].append(parser_node)

# 3. Modify the Code in Javascript to format JSON
# We keep its node but update ID, name and code
cleaner_id = "fb12a9e2-ab33-4f93-b1d5-bc102319f321"
cleaner_node = {
    "parameters": {
        "jsCode": """
// Get the output from the LLM Chain
const extracted = items[0].json.text || items[0].json.output || items[0].json; 
try {
   const parsed = typeof extracted === 'string' ? JSON.parse(extracted) : extracted;
   return [{ json: parsed }];
} catch(e) {
   // Fallback slightly formatting if it's string but not fully JSON, though structured output parser handles this
   const cleanStr = extracted.replace(/```json\\n?/g, '').replace(/```\\n?/g, '').trim();
   return [{ json: JSON.parse(cleanStr) }];
}
"""
    },
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [560, 0],
    "id": cleaner_id,
    "name": "Format JSON"
}

if code_node:
    data["nodes"].remove(code_node)
data["nodes"].append(cleaner_node)

# 4. Update the connections using correct Node Names!
# In N8N, connections are by exact node Name!
# Let's map Node IDs to Node Names to be safe:
# Original names:
# "Webhook"
# "OpenAI Chat Model"
# "AI Agent" -> renamed to "Information Extraction Builder"
# "Code in JavaScript" -> removed
# "Respond to Webhook"

data["connections"] = {
    "Webhook": {
        "main": [
            [{"node": "Information Extraction Builder", "type": "main", "index": 0}]
        ]
    },
    "OpenAI Chat Model": {
        "ai_languageModel": [
            [{"node": "Information Extraction Builder", "type": "ai_languageModel", "index": 0}]
        ]
    },
    "Structured Output Parser": {
        "ai_outputParser": [
            [{"node": "Information Extraction Builder", "type": "ai_outputParser", "index": 0}]
        ]
    },
    "Information Extraction Builder": {
        "main": [
            [{"node": "Format JSON", "type": "main", "index": 0}]
        ]
    },
    "Format JSON": {
        "main": [
            [{"node": "Respond to Webhook", "type": "main", "index": 0}]
        ]
    }
}

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Workflow updated successfully!")
