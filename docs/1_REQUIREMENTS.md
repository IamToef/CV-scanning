# Yêu cầu hệ thống chấm điểm CV (CV Scoring System Requirements)

Tài liệu này mô tả các yêu cầu cốt lõi cho hệ thống chấm điểm CV tự động, dựa trên nghiên cứu các công cụ hàng đầu thị trường và tiêu chuẩn tuyển dụng chuyên nghiệp.

## 1. Nghiên cứu thị trường: Top 3 Công cụ chấm điểm CV hàng đầu (2024-2025)

Dưới đây là 3 công cụ chấm điểm CV tự động tiêu biểu được các chuyên gia tuyển dụng tin dùng nhờ tính năng vượt trội:

1.  **MokaHR**
    *   **Điểm mạnh**: Sử dụng AI/NLP tiên tiến để chấm điểm và xếp hạng hồ sơ theo tiêu chí cụ thể của từng vị trí.
    *   **Tính năng nổi bật**: Tốc độ sàng lọc nhanh hơn gấp 3 lần, độ chính xác 87% so với rà soát thủ công.
2.  **NTRVSTA**
    *   **Điểm mạnh**: Kết hợp chấm điểm CV thời gian thực với sàng lọc qua điện thoại bằng AI.
    *   **Tính năng nổi bật**: Hỗ trợ đa ngôn ngữ, tích hợp sâu với các ATS lớn, giúp giảm 50% thời gian tuyển dụng.
3.  **Greenhouse**
    *   **Điểm mạnh**: Cung cấp thẻ điểm (scorecards) có trọng số tùy chỉnh để chuẩn hóa quy trình đánh giá, giảm thiểu thiên kiến.
    *   **Tính năng nổi bật**: Khung đánh giá có cấu trúc, khả năng phân tích cú pháp (parsing) đa ngôn ngữ mạnh mẽ.

---

## 2. Tiêu chí chấm điểm & Trọng số (Scoring Criteria & Weights)

Hệ thống sẽ chấm điểm ứng viên (Developer) dựa trên 5 tiêu chí chính sau đây với tổng điểm 100%. Đây là cấu hình mặc định cho vị trí Developer tiêu chuẩn.

| STT | Tiêu chí (Criteria) | Trọng số (Weight) | Mô tả chi tiết (Description) |
| :-- | :-- | :-- | :-- |
| 1 | **Kinh nghiệm làm việc (Experience)** | **40%** | Đánh giá dựa trên số năm kinh nghiệm, sự phù hợp của các vị trí trước đây với yêu cầu công việc hiện tại (Job Description). Bao gồm cả tính liên tục và thăng tiến trong sự nghiệp. |
| 2 | **Kỹ năng công nghệ (Technical Skills)** | **30%** | Mức độ khớp của Tech Stack (Ngôn ngữ lập trình, Framework, Database, Tools) trong CV so với JD. Ưu tiên các kỹ năng "Must-have" (Bắt buộc) hơn "Nice-to-have" (Điểm cộng). |
| 3 | **Học vấn & Chứng chỉ (Education & Certifications)** | **10%** | Bằng cấp đại học/cao đẳng chuyên ngành CNTT hoặc liên quan. Các chứng chỉ chuyên môn uy tín (AWS, Google, Microsoft, v.v.). |
| 4 | **Dự án & Portfolio (Projects & Portfolio)** | **10%** | Chất lượng và quy mô của các dự án đã tham gia (Product/Outsource). Sự đóng góp cụ thể (Role) trong dự án. Có link GitHub/Demo sản phẩm thực tế là điểm cộng lớn. |
| 5 | **Kỹ năng mềm & Ngoại ngữ (Soft Skills & Language)** | **10%** | Kỹ năng làm việc nhóm, giải quyết vấn đề, tư duy logic (thể hiện qua keywords). Trình độ ngoại ngữ (Tiếng Anh/Nhật...) phù hợp với môi trường làm việc. |

**Tổng cộng: 100%**

---

## 3. Ghi chú cho Team Dev

*   **Tính linh hoạt**: Hệ thống cần được thiết kế (Design) để có thể tùy chỉnh trọng số (Configurable Weights) cho các vị trí khác nhau trong tương lai (VD: Intern có thể giảm trọng số Kinh nghiệm, tăng trọng số Học vấn).
*   **Keyword Matching**: Sử dụng NLP để trích xuất và so khớp từ khóa thông minh, tránh chỉ so sánh chuỗi ký tự đơn thuần (VD: "ReactJS" và "React.js" là một).
*   **Giải thích điểm số**: Khi hiển thị điểm tổng kết, cần breakdown (chia nhỏ) điểm số theo từng tiêu chí để HR hiểu lý do tại sao ứng viên đạt điểm đó (Explainable AI).
