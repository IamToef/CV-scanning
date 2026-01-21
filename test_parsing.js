
const data = [
    {
        "Kỹ năng kỹ thuật":
            [
                "Thành thạo công cụ thiết kế giao diện và mô hình hóa: Figma, Draw.io",
                "Sử dụng thành thạo các công cụ quản lý dự án: Jira, Confluence",
                "Thành thạo sử dụng AI/LLM (ChatGPT, Claude, Gemini…)",
                "Có khả năng ứng dụng AI để tự động hóa quy trình, kết hợp với n8n, Zapier hoặc tương tự",
                "Hiểu rõ và kinh nghiệm làm việc theo mô hình Agile/Scrum"
            ],
        "Số năm kinh nghiệm":
            [
                "Từ 2 đến 3 năm kinh nghiệm làm Business Analyst trong công ty phát triển sản phẩm (Product Company)",
                "Ưu tiên có kinh nghiệm với sản phẩm sử dụng AI trong lĩnh vực Bán lẻ/Phân phối"
            ],
        "education":
            [
                "Tốt nghiệp Cao đẳng/Đại học chuyên ngành Công nghệ Thông tin, Hệ thống Thông tin hoặc các ngành liên quan",
                "Không đề cập chứng chỉ cụ thể"
            ],
        "soft_skills":
            [
                "Kỹ năng trình bày, giao tiếp rõ ràng và hiệu quả",
                "Kỹ năng giải quyết vấn đề",
                "Khả năng làm việc trực tiếp với khách hàng và phối hợp hiệu quả với các bên liên quan",
                "Tư duy phát triển sản phẩm theo hướng Product mindset: tập trung vào giá trị người dùng, hiệu quả dài hạn và tối ưu trải nghiệm liên tục"
            ]
    }
];

function parse(data) {
    let result = { raw_text: "" };

    const itemObj = Array.isArray(data) ? data[0] : data;
    const rawObj = itemObj.output || itemObj.json || itemObj;

    if (rawObj && rawObj['Kỹ năng kỹ thuật']) {
        const rawExp = rawObj['Số năm kinh nghiệm'] || [];
        const rawEdu = rawObj['education'] || [];

        let minYears = 0;
        if (Array.isArray(rawExp) && rawExp.length > 0) {
            const match = rawExp[0].match(/(\d+)/);
            if (match) minYears = parseInt(match[1]);
        }

        let degree = "Đại học/Cao đẳng";
        let major = "";
        if (Array.isArray(rawEdu) && rawEdu.length > 0) {
            major = rawEdu[0];
        }

        result.job_requirements = {
            technical_skills: rawObj['Kỹ năng kỹ thuật'] || [],
            soft_skills: rawObj['soft_skills'] || [],
            years_of_experience: {
                min_years: minYears,
                description: Array.isArray(rawExp) ? rawExp.join('. ') : String(rawExp)
            },
            education: {
                degree_level: "",
                major: major,
                certifications: Array.isArray(rawEdu) && rawEdu.length > 1 ? rawEdu.slice(1) : []
            }
        };
    }
    return result;
}

console.log(JSON.stringify(parse(data), null, 2));
