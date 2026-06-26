import request from "@/utils/request.js";

export function submitAssessmentRecord(data) {
	return request.post("education/assessment_records", data);
}
