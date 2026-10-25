# SYLP community pages

The merchandise hero remains first. Four community cards below it lead to
registration, incident reporting, whistleblower information and item donations.
These requests do not create shopper accounts or marketing subscriptions.

## Reviewing requests

Sign in as an OWNER and open **Community Inbox** (`/admin/community`).
Community records use the existing ContactMessage table with a fixed category
prefix and a versioned JSON payload. Ordinary store staff cannot open the inbox
or download evidence, and community records are excluded from Contact Messages.
Use Mark read / Mark handled to manage requests. Collection and drop-off offers
are requests, with confirmation to be arranged by the team.

Incident reports are forwarded server-to-server to the existing incident endpoint
using its normal challenge protocol. Only incident fields are sent. Visitors stay
on SYLP; there is no redirect or public link to the receiving website. The local
case reference is included in the report, so reviewers can match it to evidence.
A network error is recorded as UNCONFIRMED, never falsely acknowledged as sent.
The owner can check for the reference in the review service and retry delivery.
This is not an exactly-once delivery contract; check before retrying after a timeout.

## Evidence

The incident form accepts up to three JPG/PNG/WebP/MP4/WebM files, six MiB combined.
The application request limit is eight MiB; the reverse proxy must also allow at
least eight MiB. File signatures and declared MIME types must match. Original
filenames are not retained. Files are stored as UUID `.bin` objects in
`MEDIA_DIR/community-private` (or `media-data/community-private`), mode 0600 in a
0700 directory. Deployment provisions that directory for the `sylp` service user.
They are not under public/ or served by the public media route. Back up this
directory with the database; do not wipe it during deployments.

Downloads require a current OWNER session and are attachment-only, sandboxed and
non-cacheable. The receiving report service gets the case reference, not public
file URLs. Files are not malware-scanned or automatically stripped of metadata.

## Privacy and operation

Anonymous-mode submissions discard name/email/phone server-side. Technical
hosting records may still exist; this is not an untraceable or end-to-end encrypted
channel. The public notice explains this and the incident review/public-summary
process. Forms do not render analytics scripts or chat. Entry links use full-page
navigation so shop analytics are not carried into a sensitive form.

The owner must review the inbox, deal with data requests and arrange appropriate
retention/deletion. There is no automatic deletion job or promise of 24-hour
monitoring. No confidential report body is sent by email automatically. The
process-local limiter permits five submissions per fifteen minutes per ephemeral
HMAC-derived address key; it does not add visitor IPs to submission records.
