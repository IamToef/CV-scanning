# Thông số kỹ thuật hệ thống chấm điểm CV (CV Scoring Tech Specs)

Tài liệu này chi tiết hóa thiết kế cơ sở dữ liệu và logic tính toán cho hệ thống chấm điểm CV, dựa trên yêu cầu từ `docs/1_REQUIREMENTS.md`.

> [!NOTE]
> Hệ thống hiện tại chưa tích hợp Prisma. Thiết kế dưới đây là đề xuất chuẩn bị cho việc triển khai Prisma.

## 1. Thiết kế cơ sở dữ liệu (Database Schema)

Chúng tôi đề xuất thêm bảng `CVScore` vào `prisma/schema.prisma` để lưu trữ kết quả chấm điểm. Bảng này sẽ liên kết với `CV` (hoặc `Candidate`) và `Job`.

```prisma
// Đề xuất schema cho CVScore
model CVScore {
  id        String   @id @default(uuid())
  
  // Quan hệ (cần điều chỉnh theo schema thực tế của User/Job)
  cvId      String   
  // cv     CV       @relation(fields: [cvId], references: [id])
  
  jobId     String
  // job    Job      @relation(fields: [jobId], references: [id])

  // Điểm tổng quan (0-100)
  overallScore Float

  // Điểm chi tiết theo từng tiêu chí (0-100)
  experienceScore Float // Kinh nghiệm (40%)
  techStackScore  Float // Kỹ năng công nghệ (30%)
  educationScore  Float // Học vấn (10%)
  projectScore    Float // Dự án (10%)
  softSkillScore  Float // Kỹ năng mềm (10%)

  // Dữ liệu giải thích chi tiết (JSON)
  // Ví dụ: { "experience": ["Phù hợp 3/5 năm", "Thiếu role Leader"], "techStack": ["Matched: React, Node", "Missing: AWS"] }
  breakdown Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([cvId])
  @@index([jobId])
}
```

## 2. Logic tính toán (Scoring Logic)

Dưới đây là mã giả (Pseudo-code) mô tả thuật toán chấm điểm dựa trên trọng số đã định nghĩa.

```typescript
// Định nghĩa trọng số (Configurable constants)
const WEIGHTS = {
  EXPERIENCE: 0.40,
  TECH_SKILLS: 0.30,
  EDUCATION: 0.10,
  PROJECTS: 0.10,
  SOFT_SKILLS: 0.10,
};

interface ScoreResult {
  overallScore: number;
  details: {
    experience: number;
    techStack: number;
    education: number;
    projects: number;
    softSkills: number;
  };
  breakdown: any;
}

/**
 * Hàm tính điểm CV dựa trên JD
 * @param cvData Dữ liệu trích xuất từ CV
 * @param jobData Dữ liệu trích xuất từ JD
 */
function calculateCVScore(cvData: any, jobData: any): ScoreResult {
  // 1. Tính điểm từng thành phần (Scale 0-100)
  
  // 1.1 Kinh nghiệm (40%)
  // Logic: So sánh số năm kinh nghiệm, role, domain
  const expScore = calculateExperienceMatch(cvData.experience, jobData.requirements.experience);

  // 1.2 Kỹ năng công nghệ (30%)
  // Logic: So khớp keywords, ưu tiên key 'must-have'
  const techScore = calculateTechStackMatch(cvData.skills, jobData.requirements.techStack);

  // 1.3 Học vấn (10%)
  // Logic: Check bằng cấp, chứng chỉ liên quan
  const eduScore = calculateEducationMatch(cvData.education, jobData.requirements.education);

  // 1.4 Dự án (10%)
  // Logic: Đánh giá độ phức tạp dự án, vai trò
  const projectScore = calculateProjectRelevance(cvData.projects, jobData.description);

  // 1.5 Kỹ năng mềm (10%)
  // Logic: Keyword matching cho soft skills, language
  const softScore = calculateSoftSkillMatch(cvData.otherInfo, jobData.requirements.softSkills);

  // 2. Tính điểm tổng (Weighted Average)
  const overallScore = 
    (expScore * WEIGHTS.EXPERIENCE) +
    (techScore * WEIGHTS.TECH_SKILLS) +
    (eduScore * WEIGHTS.EDUCATION) +
    (projectScore * WEIGHTS.PROJECTS) +
    (softScore * WEIGHTS.SOFT_SKILLS);

  // 3. Trả về kết quả
  return {
    overallScore: Math.round(overallScore * 100) / 100, // Round to 2 decimals
    details: {
      experience: expScore,
      techStack: techScore,
      education: eduScore,
      projects: projectScore,
      softSkills: softScore
    },
    breakdown: {
      // Generate explanation data...
    }
  };
}

// Helper functions (Simplified)
function calculateExperienceMatch(cvExp, jobExp) {
  // Implementation details...
  return 0; // Placeholder
}
// ... other helpers
```

## 3. Hướng dẫn Implement cho Dev

1.  **Cài đặt Prisma**: Chạy `npm install prisma --save-dev` và `npx prisma init` nếu chưa có.
2.  **Cập nhật Schema**: Copy model `CVScore` vào `prisma/schema.prisma`. Chỉnh sửa quan hệ `cvId`, `jobId` map đúng với bảng User/Job thực tế.
3.  **Migration**: Chạy `npx prisma migrate dev --name add_cv_score_table`.
4.  **Backend Logic**: Implement hàm `calculateCVScore` trong service xử lý logic (ví dụ `services/scoring.ts`).
