import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider }          from '../../domain/interfaces/email-provider.interface';
import { GmailProviderService } from '../providers/gmail-provider.service';
import { MailgunProviderService } from '../providers/mailgun-provider.service';

@Injectable()
export class EmailProviderFactory {
  constructor(
    private readonly gmail   : GmailProviderService,
    private readonly mailgun : MailgunProviderService,
    private readonly config  : ConfigService,
  ) {}

  /** Returns the concrete provider selected through `EMAIL_PROVIDER`. Defaults to Gmail. */
  getProvider(): EmailProvider {
    const provider = this.config.get<string>('EMAIL_PROVIDER', 'gmail').toLowerCase();

    switch (provider) {
      case 'mailgun':
        return this.mailgun;

      case 'gmail':
      default:
        return this.gmail;
    }
  }
}