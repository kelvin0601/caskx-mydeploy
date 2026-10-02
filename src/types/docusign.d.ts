import type { EDocuSignStatus } from "../enum/docusign";

declare namespace docusign {
    type TSellerAgreementLinkResponse = {
        envelopeId: string;
        signingUrl: string;
        status: EDocuSignStatus;
    };
    type TDocumentsResponse = string;
}
