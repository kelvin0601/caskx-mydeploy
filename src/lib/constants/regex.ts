export const REGEX_PATTERNS = {
    // Basic Information
    fullName: /\*\*Name:\*\* (.*?)(?:\n|$)/,
    dateOfBirth: /\*\*Date of Birth:\*\* (.*?)(?:\n|$)/,
    address: /\*\*Address:\*\* (.*?)(?:\n|$)/,
    expirationDate: /\*\*Expiration Date:\*\* (.*?)(?:\n|$)/,
    idNumber: /\*\*ID Number:\*\* (.*?)(?:\n|$)/,

    // Additional Details
    iss: /\*\*ISS:\*\* (.*?)(?:\n|$)/,
    sex: /\*\*Sex:\*\* (.*?)(?:\n|$)/,
    eyes: /\*\*Eyes:\*\* (.*?)(?:\n|$)/,
    height: /\*\*Height:\*\* (.*?)(?:\n|$)/,
    dups: /\*\*DUPS:\*\* (.*?)(?:\n|$)/,

    // Location Information
    state: /\*\*State:\*\* (.*?)(?:\n|$)/,
    country: /\*\*Country:\*\* (.*?)(?:\n|$)/,

    // Organ Donor
    organDonor: /\*\*Organ Donor:\*\* (.*?)(?:\n|$)/,

    // Security Features
    hologram: /\*\*Hologram:\*\* (.*?)(?:\n|$)/,
    watermark: /\*\*Watermark:\*\* (.*?)(?:\n|$)/,

    // Footer Information
    copyright: /\*\*Copyright:\*\* (.*?)(?:\n|$)/,
    disclaimer: /\*\*Disclaimer:\*\* (.*?)(?:\n|$)/,
};

// Function to extract field using regex
export const extractField = (text: string, pattern: RegExp): string | null => {
    const match = text.match(pattern);
    return match ? match[1].trim() : null;
};
