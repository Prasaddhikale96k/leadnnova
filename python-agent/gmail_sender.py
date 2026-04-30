import os
import sys
import json
import base64
import random
import logging
from email.message import EmailMessage
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

SCOPES = ['https://www.googleapis.com/auth/gmail.send']
CREDENTIALS_PATH = os.path.join(os.path.dirname(__file__), 'credentials.json')
TOKEN_PATH = os.path.join(os.path.dirname(__file__), 'token.json')


def get_gmail_credentials():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_PATH):
                logger.error(f'credentials.json not found at {CREDENTIALS_PATH}')
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(TOKEN_PATH, 'w') as token_file:
            token_file.write(creds.to_json())
        logger.info('OAuth token saved to token.json')

    return creds


class GmailSender:
    def __init__(self):
        creds = get_gmail_credentials()
        self.service = build('gmail', 'v1', credentials=creds)
        logger.info('Gmail API service initialized')

    def send_personalized_email(self, to, subject, body, from_name='LeadNova AI'):
        msg = EmailMessage()
        msg['To'] = to
        msg['From'] = f'"{from_name}" <leadnovaa001@gmail.com>'
        msg['Subject'] = subject
        msg.set_content(body)

        html_body = '\n'.join(
            f'<p style="color:#22c55e;margin:4px 0;">{line}</p>' if line.startswith('\u2705')
            else '<br/>' if line.strip() == ''
            else f'<p style="margin:4px 0;color:#333;">{line}</p>'
            for line in body.split('\n')
        )
        msg.add_alternative(
            f'<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">'
            f'{html_body}'
            f'<hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>'
            f'<p style="font-size:11px;color:#999;">Sent via LeadNova AI CRM</p>'
            f'</div>',
            subtype='html'
        )

        encoded_msg = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
        message_body = {'raw': encoded_msg}

        try:
            sent_message = self.service.users().messages().send(userId='me', body=message_body).execute()
            logger.info(f'[SYSTEM_READY] Email dispatched to {to} | Engine Status: OPTIMIZED')
            return {'success': True, 'message_id': sent_message['id']}
        except HttpError as error:
            logger.error(f'Failed to send email to {to}: {error}')
            return {'success': False, 'error': str(error)}

    def send_bulk(self, leads):
        results = []
        sent = 0
        failed = 0
        skipped = 0
        blocked = 0

        for i, lead in enumerate(leads):
            email = lead.get('email', '')
            if not email or '@' not in email:
                skipped += 1
                results.append({'lead_id': lead.get('id'), 'status': 'skipped', 'reason': 'no_email'})
                continue

            email_status = lead.get('email_status', '')
            if email_status in ('bounced', 'invalid'):
                skipped += 1
                results.append({'lead_id': lead.get('id'), 'status': 'skipped', 'reason': 'previously_bounced'})
                continue

            subject = lead.get('email_subject') or f"Quick question about {lead.get('company_name', 'your business')}"
            body = lead.get('email_body') or lead.get('cold_email', '')

            if not body:
                skipped += 1
                results.append({'lead_id': lead.get('id'), 'status': 'skipped', 'reason': 'no_email_body'})
                continue

            if i < len(leads) - 1:
                delay = random.uniform(5, 12)
                logger.info(f'Sleeping {delay:.1f}s before next send (anti-spam)')
                import time
                time.sleep(delay)

            result = self.send_personalized_email(email, subject, body)

            if result['success']:
                sent += 1
                results.append({'lead_id': lead.get('id'), 'status': 'sent', 'message_id': result['message_id']})
            else:
                failed += 1
                results.append({'lead_id': lead.get('id'), 'status': 'failed', 'error': result['error']})

        summary = {'success': True, 'sent': sent, 'failed': failed, 'skipped': skipped, 'blocked': blocked, 'results': results}
        print(json.dumps(summary))
        return summary


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Usage: python gmail_sender.py <leads_json_file_or_stdin_json>'}))
        sys.exit(1)

    input_arg = sys.argv[1]

    if os.path.isfile(input_arg):
        with open(input_arg, 'r') as f:
            leads = json.load(f)
    else:
        try:
            leads = json.loads(input_arg)
        except json.JSONDecodeError:
            print(json.dumps({'error': 'Invalid JSON input'}))
            sys.exit(1)

    if not isinstance(leads, list):
        leads = leads.get('leads', [])

    sender = GmailSender()
    sender.send_bulk(leads)
