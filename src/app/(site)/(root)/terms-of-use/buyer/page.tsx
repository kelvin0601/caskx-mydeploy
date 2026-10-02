import { PAGE_METADATA } from "@/lib/constants/metadata";
import TermOfServicesModule from "@/modules/term-of-services";
import React from "react";

export const metadata = PAGE_METADATA.TERMS_BUYER;

export default function TermOfServicesPage() {
    return (
        <TermOfServicesModule
            title="Buyer Terms of Use"
            lastUpdated="05/12/2025"
            content={buyerTermsData.content}
        />
    );
}

const buyerTermsData = {
    title: "Buyer Terms of Use",
    lastUpdated: "05/12/2025",
    content: `
            <h3 id="who-we-are">Who are we</h3>
            <p>We are Cask Exchange (UK) LTD., a company incorporated in England and Wales with company number 16074148 and its registered office at 316a Beulah Hill, London, United Kingdom, SE19 3HF.</p>
            <p>We own and operate the Cask Exchange platform ("Platform") through which you can purchase Platform Whisky Casks from us, and we provide marketplace services ("Marketplace Services") that will connect you with third party suppliers offering Marketplace Whisky Casks ("Third Party Supplier"), (all of our services together will be the "Platform Services").</p>

            <h3 id="introduction">Introduction</h3>
            <p>These Terms of Use apply to your use of our Platform.</p>
            <p>By accessing or using the Platform in any way-including browsing, registering an account, placing an order, or making a booking-you confirm that you have read, understood, and agreed to be legally bound by these Terms of Use. If you do not agree with these Terms of Use, you must refrain from using the Platform.</p>
            <p>We amend these Terms of Use from time to time. When we have done so, we will notify you on the Platform.</p>
            
            <h3 id="there-are-other-terms">There are other terms that may apply to you</h3>
            <p>These Terms of Use refer to the following additional terms, which also apply to your use of our Platform:</p>
            <ul>
                <li>For information on how we may use your personal information please see our Privacy Policy [INSERT LINK TO PRIVACY POLICY].</li>
                <li>If you access our Platform via our mobile application, the ways in which you use such mobile application or make purchases may also be controlled by an App Store's rules and policies and will apply instead of these terms where there are differences between the two.</li>
                <li>If you purchase Whisky Casks from Third Party Suppliers through our Platform, the [Third Party Supplier's terms and conditions OR on the terms of the Buyer-Seller Agreement provided on our Platform] will apply to such purchase between you and the Third Party Supplier.</li>
            </ul>

            <h2 id="terms-of-supply-of-platform-whisky-casks">1. Terms of supply of platform whisky casks</h2>
            <p>Where you purchase any Whisky Casks directly from us ("Platform Whisky Casks"), we will enter into a separate Supply and Services Agreement with you. The terms of the Supply and Services Agreement and these Buyer Platform Terms will apply to the supply of the relevant Platform Whisky Cask.</p>
            <p>You can find everything you need to know about us, and our Platform Whisky Casks on our Platform before you order. We also confirm the key information to you in writing after you order, either by email, or in your online account.</p>

            <h2 id="marketplace-services">2. Marketplace services</h2>
            <p>The terms set out in this section apply to our Marketplace Services.</p>
            
            <h3 id="our-status">2.1. Our status</h3>
            <p>We offer a way for you to communicate orders (each an "Order") for Whisky Casks ("Marketplace Whisky Casks") to Third Party Suppliers listed on our Platform. The legal contract for the supply and purchase of the Marketplace Whisky Casks is between you and the Third Party Supplier that you place your Order with. The Third Party Supplier is solely responsible for performing that contract.</p>
            
            <h3 id="your-requirements">2.2. Your requirements</h3>
            <p>You understand that some Marketplace Whisky Casks require the customer to be at least 18 years old. You agree to provide such information and documentation if necessary and requested by the Third Party Supplier to process your Order.</p>
            
            <h3 id="placing-an-order">2.3. Placing an order</h3>
            <p>Once you have chosen the Marketplace Whisky Casks you wish to purchase from a Third Party Supplier, you can submit your Order by clicking the "place my order" or similar button. On receipt of your Order, we will send it to the relevant Third Party Supplier and will notify you by email or on our Platform that your Order has been received and is being processed. We will notify you by email or on our Platform if a Third Party Supplier accepts or rejects your Order. Once the Third Party Supplier accepts your Order, you will enter into a contract with the Third Party Supplier [on the terms made available on our Platform].</p>
            <p>You understand that all Orders are subject to product or service availability. Deliveries may be handled by the Third Party Supplier's own delivery team or through a third party delivery provider. Delivery charges and estimated delivery times are provided by the Third Party Supplier during the Order process and calculated based on factors including distance, and delivery method.</p>
            
            <h3 id="amending-or-cancelling-your-order">2.4. Amending or cancelling your order</h3>
            <p>If you are domiciled in the United Kingdom or European Union and have purchased Marketplace Whisky Casks via our Platform, you might have the right to cancel your purchase and receive a refund of what you paid for it. Please refer to the terms of the Third Party Supplier on your right to cancel and how to exercise it.</p>
            
            <h3 id="price-and-payment">2.5. Price and payment</h3>
            <p>Prices will be as quoted on the Platform and are provided by the Third Party Suppliers. These prices include VAT or other applicable sales tax. Payment for Orders must be made by an accepted credit or debit card through the Platform.</p>
            
            <h3 id="we-are-not-responsible-for-the-quality">2.6. We are not responsible for the quality of the Marketplace Whisky Casks</h3>
            <p>We will try to ensure that we only accept reputable Third Party Suppliers to offer Marketplace Whisky Casks on our Platform. The images and description of any Marketplace Whisky Casks provided by us on our Platform are for illustrative purposes only. The exact specification of any Marketplace Whisky Casks should be confirmed with the Third Party Suppliers. To the extent permitted by law, we exclude all warranties and representations with regards to the quality and suitability of the Marketplace Whisky Casks. We are not responsible for the performance or conduct of any Third Party Suppliers or any third parties engaged by them, such as delivery companies. This clause does not affect your legal and statutory rights when ordering the Marketplace Whisky Casks via our Platform.</p>
            
            <h3 id="refunds-questions-and-changes">2.7. Refunds, questions and changes about your order</h3>
            <p>If you have questions about your Order, if you wish to change your Order, or if you are dissatisfied with the quality of any Marketplace Whisky Casks and wish to seek a refund, a price reduction or any other compensation, please let the Third Party Supplier know. Alternatively you may contact us and we will attempt to contact the Third Party Supplier in order to communicate your requests.</p>

            <h2 id="use-of-our-platform">3. Use of our platform</h2>
            <p>The terms set out in this section apply to any use of our Platform by you.</p>
            
            <h3 id="your-obligations-when-using-this-platform">3.1. Your obligations when using this platform</h3>
            <p>You agree to use the Platform only for lawful, personal, and non-commercial purposes, and in accordance with these Terms of Use.</p>
            <p>Prohibited activities include, but are not limited to:</p>
            <ul>
                <li>Using the Platform in a way that is fraudulent or violates any applicable law or regulation or has any unlawful or fraudulent purpose or effect;</li>
                <li>Posting, uploading, or sharing content that is defamatory, obscene, offensive, fraudulent, or misleading;</li>
                <li>Attempting to interfere with, disable, or circumvent any security features or payment processing systems;</li>
                <li>Gaining or attempting to gain unauthorized access to other users' accounts, personal data, or restricted areas of the Platform;</li>
                <li>Impersonating another person or entity, or falsely stating or otherwise misrepresenting your identity or affiliation;</li>
                <li>Engaging in scraping, data mining, or any automated extraction of content from the Platform without prior written consent;</li>
                <li>Reselling, sublicensing, or redistributing Whisky Casks, services, or access to the Platform without our explicit authorization;</li>
                <li>Using the Platform to transmit spam, promotional materials, or unsolicited communications;</li>
                <li>Using our Platform in any way that infringes any third party intellectual property rights;</li>
                <li>Using our Platform in any way that breaches any legal duty owed to a third party, such as a contractual duty or a duty of confidence;</li>
                <li>Knowingly introducing viruses, Trojan horses, worms, time-bombs, keystroke loggers, spyware, adware, or other material which is malicious or technologically harmful;</li>
                <li>Reproducing, duplicating, copying, or re-selling any part of our Platform; and</li>
                <li>Interfering with, damaging, or disrupting any part of our Platform; any equipment or network on which our Platform is stored; any software used in the provision of our Platform; or any equipment or network or software owned or used by any third party.</li>
            </ul>
            <p>If you choose, or you are provided with, a user identification code, password or any other piece of information as part of our security procedures, you must treat such information as confidential. You must not disclose it to any third party. If you know or suspect that anyone other than you know your user identification code or password, you must promptly notify us.</p>
            <p>Any misuse of the Platform may result in suspension or termination of your access, including by disabling any user identification code or password.</p>
            
            <h3 id="how-you-may-use-material">3.2. How you may use material on our platform</h3>
            <p>We are the owner or the licensee of all intellectual property rights in our Platform, and in the material published on it. Those works are protected by copyright laws and treaties around the world. All such rights are reserved. We hereby grant to you a non-transferable, non-exclusive, revocable licence to use our Platform in accordance with these Terms of Use. Your right to use such intellectual property is limited to the extent that such use arises automatically in the use of the Platform in accordance with these Terms of Use.</p>
            
            <h3 id="do-not-rely-on-information">3.3. Do not rely on information on this platform</h3>
            <p>The content on our Platform is provided for general information only. It is not intended to amount to advice on which you should rely. You must obtain professional or specialist advice before taking, or refraining from, any action on the basis of the content on our Platform.</p>
            <p>Although we make reasonable efforts to update the information on our Platform, we make no representations, warranties or guarantees, whether express or implied, that the content on our Platform is accurate, complete or up to date.</p>
            
            <h3 id="we-are-not-responsible-for-websites">3.4. We are not responsible for websites we link to</h3>
            <p>Where our Platform contains links to other websites and resources provided by third parties, these links are provided for your information only. Such links should not be interpreted as approval by us of those linked websites or information you may obtain from them. We have no control over the contents of those websites or resources.</p>
            
            <h3 id="rights-you-are-giving-us">3.5. Rights you are giving us to use material you upload</h3>
            <p>When you upload content to our Platform, you grant us a worldwide, non-exclusive, royalty-free, transferable licence to use, reproduce, distribute, prepare derivative works of, display, and perform that content in connection with the Platform Services.</p>
            
            <h3 id="user-generated-content-is-not-approved">3.6. User-generated content is not approved by us</h3>
            <p>This Platform may include information and materials uploaded by other users of the Platform. This information and these materials have not been verified or approved by us. The views expressed by other users on our Platform do not represent our views or values.</p>
            
            <h3 id="rules-about-linking">3.7. Rules about linking to our platform</h3>
            <p>You may link to our home page, provided you do so in a way that is fair and legal and does not damage our reputation or take advantage of it.</p>
            <p>You must not establish a link in such a way as to suggest any form of association, approval or endorsement on our part where none exists.</p>
            <p>Our Platform must not be framed on any other website, nor may you create a link to any part of our Platform other than the home page.</p>
            <p>We reserve the right to withdraw linking permission without notice.</p>
            <p>If you wish to link to or make any use of content on our Platform other than that set out above, please contact us to discuss.</p>
            
            <h3 id="breach-of-these-terms">3.8. Breach of these terms</h3>
            <p>When we consider that a breach of these Terms of Use has occurred, we may take such action as we deem appropriate, including all or any of the following actions:</p>
            <ul>
                <li>Immediate, temporary or permanent withdrawal of your right to use our Platform, including terminating your account.</li>
                <li>Issue of a warning to you.</li>
                <li>Legal proceedings against you for reimbursement of all costs on an indemnity basis (including, but not limited to, reasonable administrative and legal costs) resulting from the breach. This means you will be responsible for any loss or damage we suffer as a result of your breach of these Terms of Use.</li>
                <li>We exclude our liability for all action we may take in response to breaches of this acceptable use policy. The actions we may take are not limited to those described above, and we may take any other action we reasonably deem appropriate.</li>
            </ul>

            <h3 id="termination-of-your-account">3.9. Termination of your account</h3>
            <p>You may request to terminate any account you created on our Platform ("Account") at any time by contacting our customer support at [EMAIL].</p>
            <p>We have the right to terminate your Account for any reason by giving you two weeks' prior notice, which will be delivered to your Account and to such email address you have provided as part of your Account set up.</p>
            <p>Upon termination, we will disable your access to your Account, and you will no longer have access to the Platform Services, and any content associated with such.</p>
            <p>Termination of your Account does not affect or prejudice any rights, remedies, obligations or liabilities of both of us that have accrued up to the date of termination, including the right to claim damages in respect of any breach of the Terms of Use, which existed at or before the date of termination.</p>

            <h3 id="our-responsibility-for-loss-or-damage">3.10. Our responsibility for loss or damage suffered by you</h3>
            <p>We do not exclude or limit in any way our liability to you where it would be unlawful to do so. This includes liability for death or personal injury caused by our negligence or the negligence of our employees, agents or subcontractors and for fraud or fraudulent misrepresentation.</p>
            <p>We exclude any liability stemming from the performance, non-performance, conduct, or policies of any Third Party Supplier in connection with the Marketplace Whisky Casks, including, but not limited to the quality of any Marketplace Whisky Casks supplied to you, and the payment process.</p>
            <p>We are not responsible for events outside our control. If our provision of the Platform Services or support for such or the Platform is delayed by an event outside our control then we will contact you as soon as possible to let you know and we will take steps to minimise the effect of the delay.</p>
            <p>Please note that we only provide our Platform for domestic and private use. You agree not to use our Platform for any commercial or business purposes, and we have no liability to you for any loss of profit, loss of business, business interruption, or loss of business opportunity.</p>
            <p>If defective digital content that we have supplied, damages a device or digital content belonging to you and this is caused by our failure to use reasonable care and skill, we will either repair the damage or pay you compensation. However, we will not be liable for damage that you could have avoided by following our advice to apply an update offered to you free of charge or for damage that was caused by you failing to correctly follow installation instructions or to have in place the minimum system requirements advised by us.</p>

            <h3 id="general">3.11. General</h3>
            <p>If we choose to waive any particular right which we have under these Terms of Use on any particular occasion this does not prevent us from exercising that right on another occasion.</p>
            <p>If any part of these Terms of Use is held by a court of law (or similar forum) to be invalid or unenforceable, this shall not affect the validity or enforceability of the rest of these Terms of Use.</p>
            <p>We may transfer our rights and obligations under these terms to another organisation. We will always tell you in writing if this happens and we will ensure that the transfer will not affect your rights under the contract.</p>
            
            <p>While our Platform is accessible globally, we do not represent that content available on or through our Platform is appropriate for use or available in locations other than the United Kingdom or the European Union.</p>
            
            <h3 id="which-countrys-laws-apply">3.12. Which country's laws apply to any disputes?</h3>
            <p>Please note that these terms of service, their subject matter and their formation, are governed by the laws of Scotland. We both agree that the courts of England and Wales will have exclusive jurisdiction, except that if you are a resident of Northern Ireland, you may also bring proceedings in Northern Ireland, and if you are a resident of England or Wales, you may also bring proceedings in England or Wales.</p>
    `,
};
