import { passwordConstraintContent, pointSchema } from "@/lib/constants";
import { useEffect, useMemo, useState } from "react";

export default function usePasswordValidate(password: string) {
    const [validateContains, setIsValidateContains] = useState<string[]>([]);

    const pointPasswordStrong = useMemo(() => {
        if (password?.trim() === "") {
            return 0;
        }

        let point = 0;

        for (const key in pointSchema) {
            const value = pointSchema[key as keyof typeof pointSchema];
            if (validateContains.length >= value.match) {
                if (password.length >= value.minLength) {
                    point = value.point;
                }
            }
        }
        return point;
    }, [password, validateContains]);

    useEffect(() => {
        // Update the matched criteria array dynamically
        const updatedCriteria: string[] = [];

        // Check if th value is empty
        if (password?.trim() === "") {
            setIsValidateContains([]);
            return;
        }

        passwordConstraintContent.forEach((criteria) => {
            if (criteria.regex.test(password)) {
                updatedCriteria.push(criteria.name);
            }
        });

        // Update the matchedCriteria array
        setIsValidateContains(updatedCriteria);
    }, [password]);
    return { validateContains, pointPasswordStrong };
}
