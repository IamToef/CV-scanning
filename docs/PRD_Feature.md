# Product Requirements Document (PRD): CV Scoring Engine Upgrade

## 1. Giới thiệu (Introduction)
Tính năng "CV Scoring Engine" là trái tim của hệ thống Application Tracking System (ATS). Nó tự động hóa việc đánh giá mức độ phù hợp của Ứng viên (Candidate) so với Mô tả công việc (JD).

**Mục tiêu:**
- Tự động chấm điểm CV trên thang điểm 100.
- Cung cấp giải thích chi tiết (Explainable AI) cho điểm số.
- Hỗ trợ HR ra quyết định nhanh chóng, chính xác.

## 2. Đối tượng sử dụng (User Personas)
*   **Recruiter/HR:** Người tải lên JD và danh sách CV. Cần nhìn thấy ngay ứng viên nào tiềm năng nhất.
*   **Hiring Manager:** Cần xem chi tiết tại sao ứng viên này được điểm cao (Skill match? Experience?).

## 3. Luồng người dùng (User Flow)
1.  **Input JD:** Người dùng upload/paste JD $\rightarrow$ Hệ thống trích xuất Requirements (Skill, Experience, Education...).
2.  **Verify JD:** Người dùng xem và chỉnh sửa các tiêu chí đã trích xuất (đã có tính năng này).
3.  **Input CV:** Người dùng upload hàng loạt CV (PDF).
4.  **Processing:** Hệ thống phân tích từng CV, sơ khớp với Requirements của JD.
5.  **Output:** Hiển thị danh sách ứng viên với:
    *   **Overall Score:** Điểm tổng (0-100).
    *   **Detailed Breakdown:** Điểm thành phần (Kinh nghiệm, Kỹ năng, Học vấn...).
    *   **Match Analysis:** Lý do đạt điểm (VD: "Matched 5/7 required skills").

## 4. Yêu cầu Chức năng (Functional Requirements)

### 4.1. Cơ chế Chấm điểm (Scoring Logic)
Hệ thống chấm điểm dựa trên 5 tiêu chí với trọng số (Weights) như sau:

| Tiêu chí | Trọng số | Logic đánh giá |
| :--- | :--- | :--- |
| **1. Kinh nghiệm (Experience)** | **40%** | So sánh số năm kinh nghiệm và mức độ phù hợp của vị trí cũ. <br> *Logic:* `(CandidateYears / RequiredYears) * 100`. Max 100. |
| **2. Kỹ năng (Tech Stack)** | **30%** | So khớp keyword kỹ năng (Hard Skills). <br> *Logic:* `% số kỹ năng trùng khớp / tổng kỹ năng yêu cầu`. |
| **3. Học vấn (Education)** | **10%** | Kiểm tra bằng cấp/chuyên ngành. <br> *Logic:* Có bằng ĐH/CĐ phù hợp = 100, trái ngành = 50, không có = 0. |
| **4. Dự án (Projects)** | **10%** | Đánh giá based on keywords trong phần dự án (quy mô, công nghệ). <br> *Logic:* Keyword matching với JD description. |
| **5. Kỹ năng mềm (Soft Skills)** | **10%** | So khớp keyword kỹ năng mềm. |

### 4.2. Xử lý dữ liệu (Data Processing)
*   **Keyword Normalization:** Cần chuẩn hóa từ khóa (VD: "React", "ReactJS", "React.js" coi là một).
*   **Case Insensitive:** Không phân biệt hoa thường.
*   **Content Extraction:** Trích xuất text từ CV (đã có sẵn service).

## 5. Yêu cầu Giao diện (UI Requirements)
*   **Scorecard:** Hiển thị điểm số dạng Progress Bar hoặc Circle Chart.
*   **Color Coding:**
    *   Xanh lá: > 75% (Potenial)
    *   Vàng: 50-75% (Consider)
    *   Đỏ: < 50% (Reject)
*   **Tooltip/Details:** Khi hover hoặc click vào điểm số, hiển thị chi tiết (VD: "Thiếu kỹ năng: Docker, Kubernetes").

## 6. Kế hoạch (Roadmap)
*   **Phase 1 (Current):** Cải thiện logic chấm điểm trong `cv-scorer.ts` để chính xác hơn, hỗ trợ array matching tốt hơn. Hiện tại logic đang quá sơ sài.
*   **Phase 2:** Tích hợp AI (LLM) để chấm điểm ngữ nghĩa (Semantic Scoring).

---
*Created by: Agent PO*
