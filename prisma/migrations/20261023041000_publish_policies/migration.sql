-- Publish the legal pages: rewritten to match how the shop actually works
-- (division ranges, made-to-order, no customer emails, real cookies and data
-- processors) and switched from draft to published. Still editable in
-- Admin -> Policies.

UPDATE "Policy" SET "isDraft" = false, "lastUpdated" = CURRENT_TIMESTAMP, "title" = 'Terms & Conditions', "body" = $p$NorthWest Patriots is a trading name of Heimdell Tech Ai Ltd, a company registered in England & Wales (company number 16478408), registered office Preston, PR1 9DJ ("we", "us", "our"). You can contact us at support@support-your-local-patriot.online.

These terms apply to every order placed on this website. Please read them before you order. They don't affect your legal rights as a consumer.

1. Our products
We sell merchandise for the NorthWest Patriots divisions (Preston, Merseyside, Greater Manchester, Blackpool and Southport). Each division has its own range carrying its crest. Most items are printed or made to order once you've paid. Product photos show how the design is applied and may be digital mock-ups: print position, size and colours on the finished item can vary slightly from what you see on screen.

2. Prices and payment
Prices are in pounds sterling (GBP) and include VAT where VAT applies. Delivery is added at checkout, and you'll see the full total before you pay. Payment is taken by card through our payment provider, Stripe. We never see or store your full card details.

3. How the contract is formed
Your order is an offer to buy. A contract is formed when your payment is taken successfully and you're shown your order confirmation page with your order number. Please keep your order number: you can use it with your email address on our Track Your Order page. If we can't accept or fulfil your order, for example because of an obvious pricing error or a product we can no longer make, we'll contact you and refund you in full.

4. Your details
You must give a valid email address, phone number and delivery address so we can make and deliver your order and contact you about it. Please check them carefully: we can't be responsible for delays caused by incorrect details.

5. Phone cases
Phone cases are made for a specific phone model. After ordering, please send us your phone model through our Contact page, quoting your order number. We won't start making your case until we have it.

6. Delivery
We deliver within the United Kingdom only. See our Delivery Policy for current costs and timescales. Risk in the goods passes to you when they're delivered to the address you gave us. Ownership passes to you once we've received full payment.

7. Cancelling and returning
You can cancel most orders within 14 days of receiving them, without giving a reason. See our Cancellation Policy and Returns & Refunds Policy for how this works.

8. Faulty or misdescribed goods
If an item is faulty, damaged or not as described, you have legal rights under the Consumer Rights Act 2015. Nothing in these terms affects those rights. See our Returns & Refunds Policy.

9. Our responsibility to you
We are responsible for loss or damage you suffer that is a foreseeable result of us breaking this contract or failing to use reasonable care and skill. We are not responsible for loss or damage that is not foreseeable. We supply products for domestic and private use only. Nothing in these terms limits our liability for death or personal injury caused by our negligence, for fraud, or for anything else that cannot be limited under the law of England and Wales.

10. Events outside our control
We're not responsible for delays or failures caused by events outside our reasonable control. If that happens we'll tell you, and if the delay is likely to be significant you can cancel and receive a full refund for anything not yet delivered.

11. Accounts
You can order as a guest or create an account. If you create an account, keep your password secure and let us know if you think someone else has used it.

12. Reviews
Product reviews are checked before they appear. The name you give is shown with your review. We may decline reviews that are offensive, unlawful, or not about the product.

13. Complaints
If something goes wrong, please contact us first. See our Complaints Policy.

14. Law and courts
These terms are governed by the law of England and Wales. You can bring proceedings in the courts of England and Wales, or, if you live in Scotland or Northern Ireland, in your local courts.

15. Changes to these terms
We may update these terms from time to time. The version on this page when you placed your order is the one that applies to that order.$p$
WHERE "slug" = 'terms';

UPDATE "Policy" SET "isDraft" = false, "lastUpdated" = CURRENT_TIMESTAMP, "title" = 'Delivery Policy', "body" = $p$NorthWest Patriots is a trading name of Heimdell Tech Ai Ltd (company number 16478408), registered office Preston, PR1 9DJ.

1. Where we deliver
We deliver to addresses in the United Kingdom only.

2. Making your order
Most of our range is printed or made to order once you've paid. Orders are usually dispatched within 7-14 days. For phone cases, the clock starts once we have your phone model (see our Terms & Conditions).

3. Delivery time
Once dispatched, standard UK delivery usually takes 7-14 days. These are estimates, not guarantees. If we expect a significant delay, we'll contact you.

4. Delivery cost
Standard UK delivery is £2.95. Delivery is free on orders over £35. The cost for your order is always shown at checkout before you pay.

5. Tracking your order
You can check your order's status on our Track Your Order page using your order number and email address, or from your account if you have one. Where a tracking number is available, it will be shown there once your order is dispatched.

6. Late, missing or damaged deliveries
If your order hasn't arrived within the expected time, or arrives damaged, please email support@support-your-local-patriot.online with your order number and we'll look into it with the courier. If your order is lost in transit, we'll send a replacement or give you a full refund.

7. Ownership and risk
The goods are your responsibility once delivered to the address you gave us. They become yours once we've received full payment.$p$
WHERE "slug" = 'delivery';

UPDATE "Policy" SET "isDraft" = false, "lastUpdated" = CURRENT_TIMESTAMP, "title" = 'Cancellation Policy', "body" = $p$NorthWest Patriots is a trading name of Heimdell Tech Ai Ltd (company number 16478408), registered office Preston, PR1 9DJ.

1. Your right to cancel
Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013, you can cancel your order within 14 days of the day you receive it, without giving a reason. This applies to our whole standard range, including items that are printed or made to order with a division's crest.

2. How to cancel
Email support@support-your-local-patriot.online with your name and order number and tell us you want to cancel. You can also use the Contact page. Your message just needs to be clear.

3. Cancelling before dispatch
If your order hasn't been dispatched yet, we'll stop it and refund you in full, including delivery.

4. Cancelling after delivery
Send the items back to us within 14 days of telling us you're cancelling. Contact us first and we'll give you the return address. You pay the cost of returning items unless they're faulty or not as described.

5. Your refund
We'll refund the price of the items and the standard delivery charge you paid, within 14 days of receiving the items back (or proof you've sent them, if that comes first). Refunds go back to the card you paid with. We may reduce the refund if an item has been handled or used more than needed to check it, for example worn outside or washed.

6. Personalised items
The right to cancel doesn't apply to items made to your own specification, such as an item printed with your own name or text. We don't currently sell any. If we do in future, the product page will say so clearly before you order.

7. Changing your order
If you want to change a size, item or address rather than cancel, contact us as soon as you can. We can usually help if your order hasn't gone into production yet.$p$
WHERE "slug" = 'cancellation';

UPDATE "Policy" SET "isDraft" = false, "lastUpdated" = CURRENT_TIMESTAMP, "title" = 'Returns & Refunds Policy', "body" = $p$NorthWest Patriots is a trading name of Heimdell Tech Ai Ltd (company number 16478408), registered office Preston, PR1 9DJ.

1. Changed your mind?
You can cancel and return most items within 14 days of receiving them, without giving a reason. This includes our division ranges, even though they're made to order. See our Cancellation Policy for the full details.

2. How to return an item
Email support@support-your-local-patriot.online with your order number and the items you're returning. We'll reply with the return address. Please send the items back within 14 days of telling us.

3. Condition of returns
Please return items unused, unwashed and, where possible, in their original packaging. If an item has been handled or used more than needed to check it, we may reduce your refund to reflect its reduced value.

4. Return postage
You pay the cost of returning items you've changed your mind about. We pay for returns of faulty, damaged or incorrect items. Please use a tracked service, as items are your responsibility until they reach us.

5. Refunds
We'll refund you within 14 days of receiving the items back (or proof you've sent them, if that comes first), to the card you paid with. For a change-of-mind return of your whole order we also refund the standard delivery charge you paid. Return postage isn't refunded unless the item was faulty or not as described.

6. Faulty, damaged or wrong items
If an item is faulty, damaged, or not as described, the Consumer Rights Act 2015 protects you:
- Within 30 days of delivery you can reject it for a full refund.
- After that, we'll repair or replace it. If that isn't possible or doesn't work, you can have a refund or a price reduction.
Please email us with your order number and photos of the problem where you can. These rights apply to every item we sell, including made-to-order items.

7. Personalised items
Items made to your own specification, such as an item printed with your own name or text, can't be returned for a change of mind, but are fully covered if faulty. We don't currently sell any personalised items.

8. Gifts
If you received an item as a gift, contact us and we'll help. Refunds can normally only go to the original payment card.$p$
WHERE "slug" = 'returns-refunds';

UPDATE "Policy" SET "isDraft" = false, "lastUpdated" = CURRENT_TIMESTAMP, "title" = 'Privacy Policy', "body" = $p$NorthWest Patriots is a trading name of Heimdell Tech Ai Ltd, a company registered in England & Wales (company number 16478408), registered office Preston, PR1 9DJ. We are the data controller for the personal data described here and are registered with the Information Commissioner's Office (ICO), registration number ZC079121. Contact us about your data at support@support-your-local-patriot.online.

1. What we collect
- When you order: your name, email address, phone number, delivery address, the items you buy and your order history. Your card details go straight to our payment provider, Stripe. We never see or store them.
- If you create an account: your name, email address and saved addresses. Your password is stored scrambled (hashed), so we can't read it.
- If you contact us: your name, email address, phone number if you give it, and your message.
- If you join our mailing list: your email address.
- If you leave a review: the name and email address you give, and your review.
- If you use our chat assistant: your questions. Questions it can't answer are saved without your name so we can improve our answers. Please don't type personal details into the chat.
- When you use the site: technical information such as your IP address and browser, which our server uses for security, for example to stop repeated login attempts.

2. Why we use it and our lawful basis
- To make, deliver and support your order, including returns and refunds, and to contact you about it: to perform our contract with you.
- To answer your messages and complaints: our contract with you, or our legitimate interest in helping our customers.
- To send you news and offers by email, only if you've signed up: your consent, which you can withdraw at any time.
- To keep the site and payments secure and prevent fraud: our legitimate interests.
- To keep tax and accounting records: our legal obligations.

3. Who we share it with
We only share what each provider needs to do their job, and we never sell your data:
- Stripe, to take payments.
- Our web hosting provider, whose servers are in the UK and store the site and its database.
- Resend, an email service we may use to send ourselves notifications about new orders and sign-ups. These emails contain your order and contact details.
- Delivery couriers, who receive your name, address and, where needed, phone number.
- Professional advisers such as accountants, and authorities where the law requires it.
We don't use advertising or analytics tracking at the moment. If we add it, it will only run with your consent (see our Cookie Policy).

4. International transfers
Stripe, and Resend where we use it, may process data in the United States. Where data leaves the UK, it's protected by approved safeguards such as the UK Extension to the EU-US Data Privacy Framework or the UK International Data Transfer Agreement.

5. How long we keep it
- Orders and related records: 6 years after the end of the financial year they relate to, as required for tax.
- Accounts: until you ask us to close your account, apart from order records.
- Messages to us: up to 2 years after we've dealt with them.
- Mailing list: until you unsubscribe.
- Reviews: while they're shown on the site.

6. Your rights
You can ask us to give you a copy of your data, correct it, delete it, restrict how we use it, object to us using it, or send it to you or someone else in a portable format. Where we rely on your consent, you can withdraw it at any time. Email us to make a request. We'll reply within one month. We don't make decisions about you using only automated processing.

7. Security
The site uses encrypted connections (HTTPS), admin access is password-protected and limited, passwords are hashed, and card details never reach our servers.

8. Children
Our shop isn't aimed at children.

9. Complaints
If you're unhappy with how we've handled your data, please contact us first. You can also complain to the Information Commissioner's Office at ico.org.uk or on 0303 123 1113.

10. Changes
We'll update this page if anything changes. The date at the top shows when it was last updated.$p$
WHERE "slug" = 'privacy';

UPDATE "Policy" SET "isDraft" = false, "lastUpdated" = CURRENT_TIMESTAMP, "title" = 'Cookie Policy', "body" = $p$This policy explains how NorthWest Patriots (Heimdell Tech Ai Ltd) uses cookies and similar storage on this website.

1. What cookies are
Cookies are small files a website saves on your device. Sites can also save small pieces of information in your browser's local storage. We use both only to make the shop work.

2. What we use
These are all strictly necessary, so they're set without asking:
- hbm_cart (cookie): remembers what's in your basket. Lasts 60 days.
- hbm_customer_session (cookie): keeps you signed in if you log in to your account. Lasts up to 30 days, or until you sign out.
- hbm_admin_session (cookie): used only by our own staff when signed in to manage the shop. Lasts up to 7 days.
- hbm_cookie_consent (local storage): remembers your choice on our cookie banner, so we don't ask again on every visit.

3. Payments
When you pay, you're taken to Stripe's secure checkout page. Stripe sets its own cookies there to process your payment and prevent fraud. See Stripe's privacy and cookie policy at stripe.com.

4. Analytics and marketing
We don't currently use any analytics or advertising cookies. If we add them in future, they'll only be set if you choose to allow them on our cookie banner, and we'll list them here.

5. Managing cookies
You can delete or block cookies in your browser's settings. If you block the necessary cookies, your basket and sign-in won't work.

6. Questions
Email support@support-your-local-patriot.online.$p$
WHERE "slug" = 'cookies';

UPDATE "Policy" SET "isDraft" = false, "lastUpdated" = CURRENT_TIMESTAMP, "title" = 'Complaints Policy', "body" = $p$NorthWest Patriots is a trading name of Heimdell Tech Ai Ltd (company number 16478408), registered office Preston, PR1 9DJ.

1. How to complain
If something has gone wrong, we want to put it right. Email support@support-your-local-patriot.online with "Complaint" in the subject line, your order number if you have one, and what happened. You can also use our Contact page.

2. What happens next
We'll acknowledge your complaint within 2 working days and aim to give you a full reply within 10 working days. If we need longer, we'll tell you why and keep you updated.

3. If you're still not happy
For free, impartial advice on your consumer rights, contact Citizens Advice at citizensadvice.org.uk or on 0808 223 1133. You can also contact your local Trading Standards service through Citizens Advice. For complaints about how we handle your personal data, you can contact the Information Commissioner's Office at ico.org.uk.$p$
WHERE "slug" = 'complaints';

UPDATE "Policy" SET "isDraft" = false, "lastUpdated" = CURRENT_TIMESTAMP, "title" = 'Product Care Guide', "body" = $p$Always check the care instructions on each product's page first. They take priority over the general guidance below.

Hoodies, t-shirts and tracksuits
Wash cold (30°C or below), inside out, with similar colours. Don't tumble dry, and don't iron directly over the print. Heat is the most common cause of prints cracking or peeling.

Mugs
Hand wash only. Our enamel mugs aren't microwave or dishwasher safe, as both can damage the enamel and the printed design.

Keyrings
Wipe clean with a soft, dry cloth. Keep away from harsh cleaners. Not suitable for children under 3 (small parts).

Phone cases
Wipe clean with a soft, slightly damp cloth. Avoid abrasive cleaners and solvents, which can scratch or fade the print.

Wallets
Wipe clean with a dry cloth. Avoid soaking, and keep out of prolonged direct sunlight to stop the finish fading.

Gift sets
Follow the care guidance for each item in the set.

Questions
If you're not sure how to look after something you've bought, email support@support-your-local-patriot.online.$p$
WHERE "slug" = 'product-care';

UPDATE "Policy" SET "isDraft" = false, "lastUpdated" = CURRENT_TIMESTAMP, "title" = 'Accessibility Statement', "body" = $p$We want everyone to be able to use the NorthWest Patriots shop, on any device.

1. Our aim
We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.

2. What we've done
- The site is designed for phones first and works at any screen size, including when zoomed in.
- Pages use proper headings, and buttons, links and form fields have clear labels for screen readers.
- You can use the site with a keyboard, with visible focus outlines.
- Text is designed to have strong contrast against the dark background.

3. Known limitations
- Division crests and some product photos contain text as part of the image. We give these images text descriptions, but the artwork's wording can be hard to read at small sizes.
- Payment happens on Stripe's checkout pages, which have their own accessibility standards.

4. Tell us about a problem
If anything on the site is hard to use, email support@support-your-local-patriot.online with the page and the problem. We'll try to fix it, and in the meantime we'll help you place your order another way.

5. Enforcement
If you're not happy with our response, you can contact the Equality Advisory and Support Service (EASS) at equalityadvisoryservice.com.$p$
WHERE "slug" = 'accessibility';
