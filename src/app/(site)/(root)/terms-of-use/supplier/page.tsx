import { PAGE_METADATA } from "@/lib/constants/metadata";
import TermOfServicesModule from "@/modules/term-of-services";
import React from "react";

export const metadata = PAGE_METADATA.TERMS_SUPPLIER;

function SupplierTermsOfUsePage() {
    const supplierTermsContent = `
        <div>
            <h3 id="who-we-are-and-how-to-contact-us">1. Who we are and how to contact us</h3>
            <p>We are Cask Exchange (UK) LTD., a company incorporated in England and Wales with company number 16074148 and its registered office at 316a Beulah Hill, London, United Kingdom, SE19 3HF. For information on the best way to contact us, see [LINK TO CONTACT PAGE].</p>
        </div>

        <div>
            <h3 id="when-these-terms-apply">2. When these terms apply</h3>
            <p>These terms apply to Suppliers on our Cask Exchange platform ("Platform") through which you can list and customers can purchase whisky casks, and we provide marketplace services that will connect such sellers and customers ("Platform Services").</p>
            <p>We amend these terms from time to time. Every time you wish to use our Platform, please check these terms to ensure you understand the terms that apply at that time. You may use the Platform as a marketplace to sell your whisky cask unless we decide to act as the reseller for that particular cask. If we determine to proceed as the reseller, you may not list the cask independently on our Platform. The method of sale-either via marketplace or through us as reseller-will be determined solely at our discretion based on the value of the whisky cask.</p>
        </div>

        <div>
            <h3 id="how-to-become-a-supplier">3. How to become a Supplier on our Platform and our agreement with you</h3>
            <p>You can apply to become a Supplier on our Platform. An agreement between you and us governed by these terms will come into force when we accept your application.</p>
        </div>

        <div>
            <h3 id="our-communications-with-each-other">4. Our communications with each other</h3>
            <p>When we accept your application to become a Supplier, we'll give you access to our Supplier interface. We'll generally use our Supplier interface to tell you about customer orders, questions, cancellations, refunds and complaints (if applicable). We may also contact you via telephone, email or other methods. You should use our Platform to get in touch with us wherever possible, but we may also give you other ways of contacting us.</p>
        </div>

        <div>
            <h3 id="your-communications-with-customers">5. Your communications with customers</h3>
            <p>You must always use the Supplier interface to communicate with customers who have ordered with you through our Platform or enquired about your whisky casks through our Platform. This helps us to keep a full record of all communications in relation to any transaction, in case there are any disputes.</p>
            <p>Where this is not possible (for example, where a customer, having ordered through Cask Exchange finds and calls you directly), you should enter accurate details of any communications with customers on the supplier interface.</p>
            <p>If a customer contacts you about your whisky casks through our Platform you mustn't:</p>
            <ul>
                <li>ask or encourage the customer to buy those whisky casks (or repeat orders for whisky casks) either directly from you or from another source;</li>
                <li>include links that take customers off the Platform in listings or messages;</li>
                <li>offer or solicit discounts to make any purchases outside of the Platform;</li>
                <li>cancel existing full or partial purchases to reorder outside of the Platform; and</li>
                <li>ask customers to review their purchased product or experience with you as a seller on a website other than the Platform.</li>
            </ul>
            <p>You must ensure that your supplier profile and the listings for your whisky casks do not include anything which would encourage or allow customers to contact you other than through the supplier interface, such as email or social media contact details, website addresses or other links. We reserve the right to remove such information.</p>
            <p>A breach of this clause 5 shall be deemed a material breach of contract. In that case we may suspend or permanently deactivate your account.</p>
        </div>

        <div>
            <h3 id="your-use-of-our-platform">6. Your use of our Platform</h3>
            <p>You agree to use all reasonable security practices to prevent unauthorised access or damage to our Platform. These practices include but are not limited to:</p>
            <ul>
                <li>Making sure any devices you use to access our Platform have up to date anti-virus protection and not introducing any viruses into our Platform.</li>
                <li>Ensuring that your log-in details and passwords for our Platform are only used by your employees and subcontractors who are required to comply with these terms; are not shared between users; and are changed as and when prompted by our Platform.</li>
                <li>Telling us immediately if you think that log-in details or passwords are being or may be used in an unauthorised way or that the security of our systems has been compromised in any other way.</li>
            </ul>
            <p>Except as permitted by any applicable law which you and we can't agree to exclude, you mustn't:</p>
            <ul>
                <li>Attempt to copy, modify, duplicate, create derivative works from, frame, mirror, republish, download, display, transmit, or distribute all or any portion of our Platform in any form or media or by any means.</li>
                <li>Attempt to de-compile, reverse compile, disassemble, reverse engineer or otherwise reduce to human-perceivable form all or any part of our systems.</li>
                <li>Access all or any part of our Platform to build a product or service which competes with the Platform.</li>
                <li>Use our Platform to provide services to third parties or allow or assist third parties to access our Platform.</li>
            </ul>
        </div>

        <div>
            <h3 id="creating-supplier-profile">7. Creating your Supplier profile and listing whisky casks on our Platform</h3>
            <p>You must create a Supplier profile on our Platform. Once you've done this you can create listings to sell your whisky casks on our platform. You represent and warrant that you'll:</p>
            <ul>
                <li>Only list whisky casks which do not violate any laws, including those governing export control and consumer protection or which you don't have authority to sell.</li>
                <li>Only advertise whisky casks that you are able and suitably qualified to provide.</li>
                <li>Include in your listings, or where appropriate your Supplier profile, all the information about you and your whisky casks and how you'll fulfil orders that is needed to comply with consumer protection law, as well as any relevant safety information about your whisky casks.</li>
            </ul>
        </div>

        <div>
            <h3 id="providing-your-whisky-casks">8. Providing your whisky casks</h3>
            <p><strong>Where you use the Platform as a marketplace:</strong></p>
            <p>You understand that when you provide your whisky casks to the customer, [your standard customer terms OR on the terms of the Buyer-Seller Agreement provided on our Platform] will apply. The contract for the supply of whisky casks is between you and the customer and is formed in accordance with clause 11.1.</p>
            <p>You understand that the purpose of our Platform is to connect customers and Suppliers, and therefore we want to ensure that customers have a good experience not only using our Platform but also receiving your whisky casks.</p>
            <p>Accordingly, you agree to:</p>
            <ul>
                <li>provide whisky casks that conform substantially with the whisky cask description provided on your profile, in a competent manner and with reasonable care, skill and diligence.</li>
                <li>Cooperate with the customer in all matters relating to the supply of whisky casks and provide such assistance and information as may reasonably be requested.</li>
                <li>If applicable, obtain and maintain all necessary licences and consents and comply with all relevant legislation as required to enable you to provide the whisky casks.</li>
                <li>Not make any false or misleading claims as to the quality, features or effectiveness of the whisky casks.</li>
                <li>Not do anything that could in our sole opinion harm our business or reputation.</li>
            </ul>
            <p><strong>Where we act as a reseller:</strong></p>
            <p>When Cask Exchange purchases whisky casks directly from you, in order to then sell them to customers on the Platform as a reseller, you understand that CaskX's purchase of the whisky casks from you will be governed by the terms of the Cask Whisky Supply and Services Agreement or such other terms of purchase, which you and we will agree and enter into separately.</p>
        </div>

        <div>
            <h3 id="platform-availability">9. Platform availability</h3>
            <p>We aim to make our Platform available to you and to customers on a 24/7 basis. We reserve the right to take some or all of our Platform offline as reasonably required for routine and emergency maintenance or repairs. We'll give you as much notice of such downtime as is reasonably possible. All communications using the internet may be affected by events outside our reasonable control.</p>
        </div>

        <div>
            <h2 id="marketplace-terms">THE FOLLOWING TERMS APPLY ONLY WHERE YOU USE THE PLATFORM AS A MARKETPLACE</h2>
        </div>

        <div>
            <h3 id="pricing-your-whisky-casks">10. Pricing your whisky casks</h3>
            <p>How you price your whisky casks is entirely up to you and you can change the price for your whisky casks at any time using the Supplier interface. Please allow a reasonable time for revised prices to be displayed on our Platform. We'll charge customers the price shown on our Platform at the time they submit their order. Your prices must be inclusive of VAT.</p>
        </div>

        <div>
            <h3 id="dealing-with-customer-orders">11. Dealing with customer orders, refunds and complaints</h3>
            <p><strong>11.1 What we do when a customer orders</strong></p>
            <p>Customers ordering whisky casks from our Platform must click to accept our Platform Terms of Use, which are linked to at the registration page.</p>
            <p>When a customer orders one of your whisky casks from our Platform, we, acting as your agent in your name and on your behalf, will:</p>
            <ul>
                <li>Send the customer an order acknowledgement email in our standard format.</li>
                <li>Promptly inform you of the customer order.</li>
                <li>Unless you tell us that you can't fulfil an order within [●] days of the order being submitted, send the customer an order acceptance email in our standard format and so form a direct contract for you to supply your whisky cask to the customer [on your standard customer terms OR on the terms of the Buyer-Seller Agreement provided on our Platform]. The contract is between you and the customer.</li>
                <li>If you tell us that you can't fulfil an order, send the customer an order rejection email in our standard format.</li>
                <li>Take payment for customer orders for your whisky cask when we confirm acceptance of an order in your name and on your behalf.</li>
            </ul>
            <p>Our order acceptance email will serve as the customer's supply VAT receipt issued in your name and on your behalf. Our email will include all the information about the ordered whisky cask which you've included in your whisky cask listing as well as separately showing the UK VAT collected as part of the order. You're responsible for ensuring that this information meets legal information requirements and for compliance with all applicable legal, tax and regulatory requirements in connection with any customer VAT receipt issued in your name.</p>
            
            <p><strong>11.2 What you must do when we tell you about an order</strong></p>
            <p>When we tell you about an order you must:</p>
            <ul>
                <li>Using the Platform, tell us as soon as possible, and in any event within [●] days of the order being submitted, if you won't be able to supply the whisky cask.</li>
                <li>In all other cases, supply the whisky cask to the customer in the way and within at least the timescale set out in your whisky cask listing.</li>
                <li>After the whisky cask has been provided, confirm on our Platform that the whisky cask has been provided, and after you have received payment from us, confirm on our Platform that payment has been received.</li>
            </ul>
            
            <p><strong>11.3 Dealing with customer cancellations</strong></p>
            <p>We'll tell you if a consumer contacts us to cancel an order. When we do so, or when a consumer contacts you directly to cancel an order, you must promptly tell us of any refunds due to customers who have cancelled, if applicable.</p>
        </div>

        <div>
            <h3 id="fees-and-commission">12. Fees and commission on your whisky cask sales</h3>
            <p>We'll pay you the sums received by us from customers for your whisky casks less:</p>
            <ul>
                <li>Our commission and any VAT applicable to it.</li>
                <li>Any sums owed to us in connection with any third party claim and any fees charged by us for handling refunds, which are unpaid at the time we pay you.</li>
            </ul>
            <p>Our commission is calculated as a percentage of the total price paid by the customer for the whisky cask (excluding VAT), at the rates set out on our Platform.</p>
            <p>You must account to HMRC for any VAT or other applicable tax due on UK sales of your whisky casks on our Platform and fully comply with your tax obligations in connection with the use of our whisky casks and the offer and sale of your whisky casks on our Platform including the collection, reporting, filing and payment of any and all applicable taxes (such as VAT, plastic packaging taxes and duties) and other governmental assessments.</p>
            
            <p><strong>12.1 When we pay you</strong></p>
            <p>When a customer pays us the sums for your whisky casks, we will hold any such sum in our bank account for [●] business days before releasing the sum due to you. After such period, we'll send you a statement of the sum due to you and how this have been calculated and credit such sum to the bank account you've notified to us via our Platform.</p>
            
            <p><strong>12.2 Interest on late payments</strong></p>
            <p>If either of us fails to make a payment due to the other under these terms by the due date, then, without limiting the other party's remedies, the defaulting party shall pay interest on the overdue sum from the due date until payment of the overdue sum, whether before or after judgment at the rate of 2% above the Bank of England's base rate from time to time.</p>
            
            <p><strong>12.3 How customers are refunded</strong></p>
            <p>If you instruct us to refund a customer on your behalf, we'll do so provided we can deduct such sums from money due from us to you. We are not obliged to refund more than the sums collected from the customer at checkout. If we can't deduct such sums from money due from us to you, we may either require you to refund customers directly or choose to refund customers ourselves and you must pay us the sums we refund in this way. We don't charge you commission on sums paid by customers and refunded to them.</p>
            
            <p><strong>12.4 Our and your rights of set-off</strong></p>
            <p>Save as expressly provided in these terms, you and we shall each pay all amounts due under this agreement in full without any set-off, counterclaim, deduction or withholding (other than any deduction or withholding of tax as required by law).</p>
        </div>

        <div>
            <h2 id="terms-for-all-sellers">THE FOLLOWING TERMS APPLY TO ALL SELLERS</h2>
        </div>

        <div></div>
            <h3 id="access-to-data">13. Access to and use of data generated through use of our Platform</h3>
            <p>Use of our Platform will generate data (including personal data), about orders, customer queries, ratings and reviews for your whisky casks and other matters. Our Privacy Policy [LINK] sets out how we process personal data relating to Suppliers. This also describes your data protection rights including rights to object to certain types of processing activity.</p>
        </div>

        <div>
            <h3 id="using-each-others-branding">14. Using each other's branding and other intellectual property rights</h3>
            <p><strong>14.1 Your use of our branding</strong></p>
            <p>You may publicise your listings on our Platform, or the fact that we list any of your whisky casks in our capacity as a reseller (whatever applicable), for example, on social media. In doing so you must take care not to in any way suggest that you or your listings are endorsed, controlled or created by us. You can share the urls for your listings and Supplier pages and state that your whisky casks can be bought on our Platform. However, you can't use our or our Platform's stylised name or logos either on their own or in combination with another word or use our or our Platform's name in your social media profile name or photo. You also can't create content with the same look or feel as that of our Platform.</p>
            <p>As soon as reasonably possible after this agreement ends, you must remove any content that suggests you sell on our Platform from any places you control and use your best efforts to remove such content from any places owned by any third parties.</p>
            
            <p><strong>14.2 Our use of your branding and other intellectual property rights</strong></p>
            <p>You grant us a non-exclusive, worldwide, royalty-free licence to host, reproduce, display and publish any content, data or information (including trade marks and branding) you provide to us in connection with you and your whisky casks (your "Materials") for the purposes of listing and selling your whisky casks on our Platform and operating, improving and marketing our Platform in any media.</p>
            <p>As soon as reasonably possible after this agreement ends, we'll stop all use of your Materials on our Platform. You acknowledge that we may following termination of this agreement, use your Materials for the purpose of selling and distributing any whisky casks that we had purchased from you for the purpose of reselling them to customers on our Platform.</p>
            <p>Except as stated above, we won't acquire any rights to your Materials and any goodwill generated by our use of your Materials on our Platform or through our marketing activities will accrue to you.</p>
        </div>

        <div>
            <h3 id="suspension-and-termination">15. Suspension of listings, ending this agreement and disputes</h3>
            <p><strong>15.1 When we'll suspend your listings or end this agreement</strong></p>
            <p>Where you use the Platform as a marketplace, we can suspend or restrict any individual listing you make on our Platform if we become aware, or have reason to believe, that what you've told us about your whisky cask or said about your whisky cask in the listing for it is not true or up to date or that the whisky cask or the listing doesn't comply with these terms or is otherwise unlawful.</p>
            <p>We can end this agreement and your rights to use our Platform for any of the following reasons:</p>
            <ul>
                <li>You've not complied with these terms, including the policies referred to in them and your non-compliance is more than trivial or is repeated.</li>
                <li>You've become insolvent or you suspend, threaten to suspend, cease or threaten to cease to carry on all or a substantial part of your business or your financial position deteriorates to such an extent that we think your ability to fulfil your obligations under this agreement is at risk.</li>
                <li>We reasonably consider that our continuing to list your whisky casks (if applicable) could expose our Platform to disrepute, contempt, scandal or ridicule, or would tend to shock, insult or offend the public or reflect unfavourably on our Platform's reputation or the other Suppliers selling on our Platform.</li>
                <li>We decide to stop providing our Platform.</li>
                <li>We reasonably determine, or receive information or notice from HMRC, that you are not meeting your tax obligations.</li>
            </ul>
            <p>We'll give you at least 30 days' notice that we are ending this agreement unless:</p>
            <ul>
                <li>Our legal, tax or regulatory obligations require us to end this agreement without such notice.</li>
                <li>It's imperative for us to end this agreement either immediately or on shorter notice. For example, we may end this agreement with immediate effect if you become insolvent or we discover that your whisky casks are unsafe or counterfeit or present a danger to minors or if we reasonably suspect you of fraud or of using our Platform to spam others.</li>
                <li>You've repeatedly broken this agreement.</li>
            </ul>
            
            <p><strong>15.2 How you can end this agreement</strong></p>
            <p>You may stop using our Platform at any time. This agreement will end when you've informed us, using our Platform, that you no longer wish to use our Platform and you've removed your whisky cask listings. You acknowledge that we may following termination of this agreement, sell and distribute any whisky casks that we had purchased from you for the purpose of reselling them to customers on our Platform.</p>
            
            <p><strong>15.3 Your obligations after this agreement ends</strong></p>
            <p>After this agreement ends (for whatever reason) you must (unless we tell you otherwise):</p>
            <ul>
                <li>Immediately remove any listings for your whisky casks from our Platform (if applicable).</li>
                <li>Leave your customer facing Supplier profile (excluding listings for your whisky casks) live until 60 days after your fulfilment of the last order you received through our Platform (if applicable), to allow customers to contact you about orders previously submitted. Once this period has expired you must remove your customer facing Supplier profile.</li>
                <li>Continue to comply with these terms insofar as they relate to customer orders received through our Platform before removal of your whisky cask listings (if applicable). You need only comply with the version of these terms which applied when this agreement ended.</li>
            </ul>
            
            <p><strong>15.4 Our obligations after this agreement ends</strong></p>
            <p>After this agreement ends (for whatever reason) we:</p>
            <ul>
                <li>May remove all listings for your whisky casks from our Platform (if applicable), if you've not already done so, and reject any order received after this agreement ends.</li>
                <li>May remove your customer facing Supplier profile from our Platform, if you've not already done so, except that we can keep it live until 60 days after your fulfilment of the last order you received through our Platform, to allow customers to contact you about orders previously submitted (if applicable).</li>
                <li>Will continue to comply with these terms insofar as they relate to customer orders received through our Platform before removal of your whisky cask listings, including by paying sums due to you for such orders. We'll comply with the version of these terms which applied when this agreement ended.</li>
                <li>Will give you access to data (including personal data) generated by your use of our Platform to the extent and for the period set out in our Privacy Policy [LINK TO POLICY].</li>
            </ul>
        </div>

        <div>
            <h3 id="limitations-on-liability">16. Limitations on liability and platform availability</h3>
            <p><strong>16.1 Liabilities neither you nor we limit or exclude</strong></p>
            <p>Nothing in these terms limits any liability (whether yours or ours) which can't legally be limited, including but not limited to liability for death or personal injury caused by negligence and fraud or fraudulent misrepresentation.</p>
            <p>The limitations and exclusions set out in this agreement don't apply in respect of any liability arising from your or our deliberate default and your liabilities to us under clause 16.</p>
            
            <p><strong>16.2 Types of loss you and we exclude liability for</strong></p>
            <p>Except in respect of such liabilities neither you nor we limit or exclude, we won't be liable to you and you'll not be liable to us for:</p>
            <ul>
                <li>Loss of profits.</li>
                <li>Loss of sales or business.</li>
                <li>Loss of agreements or contracts.</li>
                <li>Loss of anticipated savings.</li>
                <li>Any indirect or consequential loss.</li>
            </ul>
            
            <p><strong>16.3 Caps on your and our liability to each other</strong></p>
            <p>Except in respect of liabilities neither you nor we limit or exclude (which are uncapped) and any liability arising in relation to a breach of clause 13 or our data protection obligations under this agreement, our total liability to you and your total liability to us amount equal to the commission paid you to us during the twelve (12) month period preceding the date on which the claim arose.</p>
        </div>

        <div>
            <h3 id="claims-and-actions">17. Claims and actions against us in connection with you or your whisky casks</h3>
            <p><strong>17.1 Dealing with claims against us</strong></p>
            <p>Where you use the Platform as a marketplace, we'll pass on to you any complaints we receive about you or one of your whisky casks as described in clause 11.3. However, if anyone, including (but not limited to) a customer, any regulator, HMRC, couriers or any third party rights holder, makes a claim or takes any kind of action against us in connection with:</p>
            <ul>
                <li>Your whisky casks and their supply through our Platform, where you use the Platform as a marketplace.</li>
                <li>Content you've uploaded to or otherwise distributed through our Platform, including but not limited to your profile, your whisky cask listings, your communications with customers, advertising, and any omissions or inaccuracies in such content.</li>
                <li>Things we have or haven't done in reliance on information you've provided (or omitted to provide) to us, including our exercise of rights you've granted to us.</li>
                <li>Things you have or haven't done including but not limited to any breach of these terms and our policies,</li>
            </ul>
            <p>(a "third party claim"), then you must, at our option and as we request, either help us defend or deal with the third party claim or defend or deal with it on our behalf, in each case at your own expense. If we ask you to defend or deal with a claim on our behalf, you must get our prior written agreement before settling or compromising it or attempting to do so.</p>
            
            <p><strong>17.2 Compensation for claims against us</strong></p>
            <p>You must pay us an amount (calculated on a full indemnity after-tax basis) equivalent to any liabilities, fines, costs, expenses, damages and losses (including but not limited to any direct, indirect or consequential losses, loss of profit, loss of reputation and any tax liabilities or third party charges such as brokers' fees) and all interest, penalties and legal costs and all other reasonable professional costs and expenses we incur arising out of or in connection with any third party claim.</p>
        </div>

        <div>
            <h3 id="compliance-with-law">18. Compliance with the law</h3>
            <p>You must at all times when doing anything in connection with this agreement comply with all applicable laws, statutes, regulations and codes from time to time in force.</p>
        </div>

        <div>
            <h3 id="data-protection-obligations">19. Data protection obligations</h3>
            <p>We'll process your personal data in accordance with our Privacy Policy [LINK TO POLICY].</p>
            <p>We and you may share with each other personal data we've collected in connection with this agreement, consisting of contact information of customers, and information about customer orders, queries and complaints ("Shared Personal Data"). We and you agree that we shall only process Shared Personal Data which we receive from the other for fulfilling orders for your whisky casks, dealing with queries and complaints from customers about your whisky casks, and marketing our whisky casks to customers. Both we and you will ensure that all necessary notices, consents and lawful bases are in place to enable lawful processing and transfer of the Shared Personal Data.</p>
            <p>Both we and you shall ensure that we comply with and assist the other party to comply with the requirements of any all applicable legislation and regulatory requirements in force from time to time relating to the use of personal data. This clause is in addition to, and does not reduce, remove or replace, a party's obligations arising from such requirements.</p>
        </div>

        <div>
            <h3 id="status">20. Status</h3>
            <p>This agreement constitutes a contract for the provision of whisky casks and not a contract of employment and accordingly you shall be fully responsible for and shall indemnify us for and in respect of:</p>
            <ul>
                <li>any income tax, National Insurance and social security contributions and any other liability, deduction, contribution, assessment or claim arising from or made in connection with the performance of the Platform Services, where the recovery is not prohibited by law. You shall further indemnify us against all reasonable costs, expenses and any penalty, fine or interest incurred or payable by us in connection with or in consequence of any such liability, deduction, contribution, assessment or claim; and</li>
                <li>any liability arising from any employment-related claim or any claim based on worker status (including reasonable costs and expenses) brought by you or any of your employees against us arising out of or in connection with the provision of our Platform Services, except where such claim is as a result of any act or omission of us.</li>
            </ul>
        </div>

        <div>
            <h3 id="other-important-terms">21. Other important terms</h3>
            <p><strong>21.1 Impact of events beyond your or our reasonable control (force majeure)</strong></p>
            <p>Neither you nor we (the "affected party") shall be in breach of this agreement or otherwise liable for any failure or delay in performing their obligations if such delay or failure results from events, circumstances or causes beyond the affected party's reasonable control. The time for performance of such obligations shall be extended accordingly. If the period of delay or non-performance continues for four weeks, the party not affected may end this agreement by giving 14 days' written notice to the affected party.</p>
            
            <p><strong>21.2 Transferring our rights and obligations under this agreement</strong></p>
            <p>We may at any time assign, mortgage, charge, subcontract, delegate, declare a trust over or deal in any other manner with any or all of our rights and obligations under this agreement.</p>
            <p>You need to get our consent before you can assign, mortgage, charge, subcontract, delegate, declare a trust over or deal in any other manner with any of your rights and obligations under this agreement, including by using subcontractors.</p>
            
            <p><strong>21.3 How we and you must protect each other's confidential information</strong></p>
            <p>Neither you nor we (the "recipient") shall at any time during the term of this agreement, and for a period of two years after it ends (for whatever reason) disclose to any person any confidential information concerning the business, assets, affairs, customers, clients or Suppliers of the other (the discloser, except:</p>
            <ul>
                <li>To the recipient's employees, officers, representatives, contractors, subcontractors or advisers who need to know such information for the purposes of exercising the recipient's rights or carrying out its obligations under or in connection with this agreement. The recipient shall ensure that its employees, officers, representatives, contractors, subcontractors or advisers to whom it discloses the discloser's confidential information comply with this clause.</li>
                <li>As may be required by law, a court of competent jurisdiction or any governmental or regulatory authority.</li>
            </ul>
            <p>The recipient shall not use the discloser's confidential information for any purpose other than to exercise its rights and perform its obligations under or in connection with this agreement.</p>
            
            <p><strong>21.4 Neither we nor you are bound by anything said but not included in this agreement</strong></p>
            <p>This agreement (comprising these terms and the policies referred to in them) constitutes the entire agreement between you and us in relation to our Platform Services. Both you and we acknowledge that in entering into this agreement neither of us relies on any statement, representation, assurance or warranty (whether made innocently or negligently) that is not set out in this agreement.</p>
            <p>Both you and we agree that neither of us shall have any claim for innocent or negligent misrepresentation based on any statement in this agreement.</p>
            
            <p><strong>21.5 Informal changes to this agreement aren't valid</strong></p>
            <p>Except for changes made as described in clause 2, no variation of this agreement shall be effective unless it is in writing and signed by you and us.</p>
            
            <p><strong>21.6 You and we can only waive our rights under this agreement in writing</strong></p>
            <p>A waiver of any right or remedy is only effective if given in writing. A delay or failure to exercise, or the single or partial exercise of, any right or remedy shall not waive that or any other right or remedy, nor shall it prevent or restrict the further exercise of that or any other right or remedy.</p>
            
            <p><strong>21.7 Invalidity of part of this agreement doesn't affect the rest of it</strong></p>
            <p>If any provision or part-provision of this agreement is or becomes invalid, illegal or unenforceable, it shall be deemed deleted, but that shall not affect the validity and enforceability of the rest of this agreement.</p>
            
            <p><strong>21.8 Only you and we have rights under this agreement</strong></p>
            <p>This agreement does not give rise to any rights to any third party to enforce any term of this agreement.</p>
            
            <p><strong>21.9 Governing law and jurisdiction</strong></p>
            <p>This agreement and any dispute or claim (including non-contractual disputes or claims) arising out of or in connection with it or its subject matter or formation shall be governed by and construed in accordance with the laws of England and Wales.</p>
            <p>Each of us irrevocably agrees that the courts of England and Wales shall have exclusive jurisdiction to settle any dispute or claim (including non-contractual disputes or claims) arising out of or in connection with this agreement, its subject matter or formation.</p>
        </div>
    `;

    return (
        <TermOfServicesModule
            title="Supplier Terms of Use"
            lastUpdated="05/12/2025"
            content={supplierTermsContent}
        />
    );
}

export default SupplierTermsOfUsePage;
