import axiosInstance from "@/config/axios";
import { KEY_DOCUSIGN } from "@/lib/constants/key";
import { PATH_ADMIN, PATH_DOCUSIGN } from "@/lib/constants";
import { handleRequest } from "@/lib/utils";
import { docusign } from "@/types";

class DocuSignServices {
    /**
     * GET /api/docusign/seller-agreement/{transactionId}/link
     */
    async getSellerAgreementLink(
        transactionId: string
    ): Promise<docusign.TSellerAgreementLinkResponse> {
        return handleRequest(
            axiosInstance.get<docusign.TSellerAgreementLinkResponse>(
                `${PATH_DOCUSIGN}/${KEY_DOCUSIGN.GET_SELLER_AGREEMENT_LINK}/${transactionId}/link`
            )
        );
    }

    //GET /api/docusign/envelopes/{envelopeId}/documents
    async getDocuments(envelopeId: string): Promise<Blob | string> {
        return handleRequest(
            axiosInstance.get<Blob | string>(
                `${PATH_DOCUSIGN}/envelopes/${envelopeId}/${KEY_DOCUSIGN.GET_DOCUMENTS}`,
                {
                    responseType: "blob",
                }
            )
        );
    }

    /**
     * GET /api/admin/docusign/seller-agreement/{transactionId}/link
     * Generate admin countersign link for seller agreement
     */
    async getAdminSellerAgreementLink(
        transactionId: string
    ): Promise<docusign.TSellerAgreementLinkResponse> {
        return handleRequest(
            axiosInstance.get<docusign.TSellerAgreementLinkResponse>(
                `${PATH_ADMIN}${PATH_DOCUSIGN}/${KEY_DOCUSIGN.GET_SELLER_AGREEMENT_LINK}/${transactionId}/link`
            )
        );
    }

    /**
     * GET /api/admin/docusign/buyer-agreement/{checkoutSessionId}/link
     * Generate admin countersign link for buyer agreement
     */
    async getAdminBuyerAgreementLink(
        checkoutSessionId: string
    ): Promise<docusign.TSellerAgreementLinkResponse> {
        return handleRequest(
            axiosInstance.get<docusign.TSellerAgreementLinkResponse>(
                `${PATH_ADMIN}${PATH_DOCUSIGN}/${KEY_DOCUSIGN.GET_BUYER_AGREEMENT_LINK}/${checkoutSessionId}/link`
            )
        );
    }
}

const docusignServices = new DocuSignServices();

export default docusignServices;
