import axiosInstance from "@/config/axios";
import { OCR_KEYS } from "@/lib/constants/key";
import { PATH_OCR } from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";

class OcrServices {
    validateIdCardData(data: Record<string, string>) {
        // Define regex patterns for each field
        const regexPatterns = {
            fullName: /^[A-Za-z\s]+$/,
            dateOfBirth:
                /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/,
            address: /^\d+\s[A-Za-z\s.,]+,\s[A-Za-z\s]+,\sPA\s\d{5}(-\d{4})?$/,
            expirationDate:
                /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/,
            iss: /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/,
            sex: /^[MF]$/,
            eyes: /^(BLK|BLU|BRO|GRN|GRY|HAZ)$/,
            height: /^\d'-([0-9]|1[0-1])"$/,
            idNumber: /^\d{2}\s\d{3}\s\d{3}$/,
            dups: /^\d{2}$/,
            state: /^Pennsylvania$/,
            country: /^USA$/,
            portrait: /^A\s+photo\s+of\s+[A-Za-z\s]+$/,
            state_seal: /^An\s+image\s+of\s+the\s+Pennsylvania\s+state\s+seal$/,
            organ_donor: /^(Yes|No)$/,
            hologram: /^A\s+hologram\s+of\s+the\s+state\s+seal$/,
            watermark: /^A\s+watermark\s+of\s+the\s+state\s+flag$/,
            copyright: /^\d{4}\s+Commonwealth\s+of\s+Pennsylvania$/,
            disclaimer:
                /^This\s+is\s+a\s+sample\s+ID\s+card\s+and\s+not\s+a\s+real\s+identification\s+document\.$/,
        };

        // Object to store validation results
        const results: Record<string, { value: string; isValid: boolean }> = {};

        // Process each field, handling both naming conventions
        for (const [field, pattern] of Object.entries(regexPatterns)) {
            // Check for field in both formats (e.g., fullName or *_**name)
            const value = data[field] || data[`*_**${field}`];
            const cleanedValue = value ? value.replace(/\*\*/g, "").trim() : "";
            if (cleanedValue !== undefined) {
                results[field] = {
                    value: cleanedValue,
                    isValid: cleanedValue ? pattern.test(cleanedValue) : false,
                };
            } else {
                results[field] = {
                    value: "",
                    isValid: false,
                };
            }
        }

        return results;
    }
    async getOcrData(
        data: File
    ): Promise<Record<string, { value: string; isValid: boolean }>> {
        const formData = new FormData();
        formData.append("file", data);
        const res = await handleRequest(
            axiosInstance.post(
                `${PATH_OCR}/${OCR_KEYS.ID_DOCUMENT}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    timeout: Infinity,
                }
            )
        );
        const dataConvert = this.validateIdCardData(res.data);
        return dataConvert;
    }
}

const ocrServices = new OcrServices();

export default ocrServices;
