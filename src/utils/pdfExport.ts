import jsPDF from 'jspdf';
import type { Credential, Note } from '../types';
import { exportBlob } from './exportFile';

const PAGE_MARGIN = 16;
const LINE_HEIGHT = 5.4;
const SECTION_GAP = 9;
const LABEL_COL_WIDTH = 54;

function drawPageHeader(doc: jsPDF, title: string, subtitle: string, continuation = false) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(24, 36, 66);
  doc.rect(0, 0, w, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Notecore Secure Export', PAGE_MARGIN, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Issued by Notecore', PAGE_MARGIN, 22);
  doc.text(new Date().toLocaleString(), w - PAGE_MARGIN, 22, { align: 'right' });

  doc.setTextColor(24, 36, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(continuation ? `${title} (continued)` : title, PAGE_MARGIN, 44);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(subtitle, PAGE_MARGIN, 50);
}

function drawFooter(doc: jsPDF) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(220, 224, 228);
  doc.line(PAGE_MARGIN, h - 14, w - PAGE_MARGIN, h - 14);
  doc.setTextColor(90, 98, 112);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Confidential export - handle with care', PAGE_MARGIN, h - 9.2);
}

function ensureSpace(doc: jsPDF, y: number, needed: number, title: string, subtitle: string) {
  const h = doc.internal.pageSize.getHeight();
  if (y + needed <= h - 20) return y;
  drawFooter(doc);
  doc.addPage();
  drawPageHeader(doc, title, subtitle, true);
  return 60;
}

function drawSectionCard(doc: jsPDF, y: number, title: string) {
  const width = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;
  doc.setFillColor(242, 244, 246);
  doc.roundedRect(PAGE_MARGIN, y - 6, width, 12, 2, 2, 'F');
  doc.setTextColor(24, 36, 66);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(title, PAGE_MARGIN + 3, y + 1.8);
  return y + 10;
}

function writeLabelValue(doc: jsPDF, y: number, label: string, value: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const valueX = PAGE_MARGIN + LABEL_COL_WIDTH;
  const valueWidth = pageWidth - PAGE_MARGIN - valueX;
  const safeValue = (value || '-').trim() || '-';
  const wrapped = doc.splitTextToSize(safeValue, valueWidth);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 36, 66);
  doc.text(`${label}:`, PAGE_MARGIN, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(wrapped, valueX, y);

  const lines = Math.max(1, wrapped.length);
  return y + lines * LINE_HEIGHT + 1;
}

function writeDivider(doc: jsPDF, y: number) {
  const w = doc.internal.pageSize.getWidth();
  doc.setDrawColor(228, 230, 232);
  doc.line(PAGE_MARGIN, y, w - PAGE_MARGIN, y);
  return y + 5;
}

export async function downloadNotesPdf(notes: Note[]) {
  const doc = new jsPDF();
  const title = 'Notes Export';
  const subtitle = `${notes.length} note${notes.length === 1 ? '' : 's'} selected`;
  drawPageHeader(doc, title, subtitle);

  let y = 60;
  notes.forEach((note, idx) => {
    y = ensureSpace(doc, y, 60, title, subtitle);
    y = drawSectionCard(doc, y, `Note ${idx + 1}: ${note.title || 'Untitled note'}`);

    y = writeLabelValue(doc, y, 'Created', new Date(note.createdAt).toLocaleString());
    y = writeLabelValue(doc, y, 'Updated', new Date(note.updatedAt).toLocaleString());
    y = writeLabelValue(doc, y, 'Tags', note.tags.length ? note.tags.join(', ') : '-');
    y = writeLabelValue(doc, y, 'Content', note.content || '-');
    y = writeDivider(doc, y);
    y += SECTION_GAP;
  });

  drawFooter(doc);
  const blob = doc.output('blob');
  await exportBlob(`notecore-notes-${new Date().toISOString().slice(0, 10)}.pdf`, blob);
}

export async function downloadCredentialsPdf(credentials: Credential[]) {
  const doc = new jsPDF();
  const title = 'Credentials Export';
  const subtitle = `${credentials.length} credential${credentials.length === 1 ? '' : 's'} selected`;
  drawPageHeader(doc, title, subtitle);

  let y = 60;
  credentials.forEach((cred, idx) => {
    y = ensureSpace(doc, y, 92, title, subtitle);
    y = drawSectionCard(doc, y, `Credential ${idx + 1}: ${cred.label || 'Untitled credential'}`);

    y = writeLabelValue(doc, y, 'Category', cred.category);
    y = writeLabelValue(doc, y, 'Website', cred.website ?? '-');
    y = writeLabelValue(doc, y, 'Username', cred.username ?? '-');
    y = writeLabelValue(doc, y, 'Email', cred.email ?? '-');
    y = writeLabelValue(doc, y, 'Password', cred.password ?? '-');
    y = writeLabelValue(doc, y, 'Notes', cred.notes ?? '-');
    y = writeLabelValue(doc, y, 'Password Updated', new Date(cred.passwordUpdatedAt).toLocaleString());

    if (cred.category === 'Banking') {
      y = writeLabelValue(doc, y, 'Bank Name', cred.bankName ?? '-');
      y = writeLabelValue(doc, y, 'Bank Account Number', cred.bankAccountNumber ?? '-');
      y = writeLabelValue(doc, y, 'Bank App Name', cred.bankAppName ?? '-');
      y = writeLabelValue(doc, y, 'Bank User ID', cred.bankUserId ?? '-');
      y = writeLabelValue(doc, y, 'Card Info Enabled', cred.cardEnabled ? 'Yes' : 'No');
      if (cred.cardEnabled) {
        y = writeLabelValue(doc, y, 'Card Name', cred.cardName ?? '-');
        y = writeLabelValue(doc, y, 'Card Number', (cred as any).cardNumber ?? '-');
        y = writeLabelValue(doc, y, 'Name on Card', cred.cardHolderName ?? '-');
        y = writeLabelValue(doc, y, 'Card Type', cred.cardType ?? '-');
        y = writeLabelValue(doc, y, 'Expiry Date', cred.cardExpiryDate ?? '-');
        y = writeLabelValue(doc, y, 'CVV', cred.cardCvv ?? '-');
      }
    }
    if (cred.category === 'Government IDs') {
      y = writeLabelValue(doc, y, 'Document Type', cred.govIdType ?? '-');
      y = writeLabelValue(doc, y, 'Document Number', cred.govIdNumber ?? '-');
      y = writeLabelValue(doc, y, 'Front Image Saved', cred.govFrontImage ? 'Yes' : 'No');
      y = writeLabelValue(doc, y, 'Back Image Saved', cred.govBackImage ? 'Yes' : 'No');
    }
    if (cred.category === 'Social Media') {
      y = writeLabelValue(doc, y, 'Social App', cred.socialPlatform ?? '-');
      y = writeLabelValue(doc, y, 'Phone Number', cred.phoneNumber ?? '-');
    }
    if (cred.category === 'Google Account') {
      y = writeLabelValue(doc, y, 'Gmail', cred.email ?? '-');
      y = writeLabelValue(doc, y, 'Recovery Email', cred.googleRecoveryEmail ?? '-');
      y = writeLabelValue(doc, y, 'Recovery Number', cred.googleRecoveryPhone ?? '-');
      y = writeLabelValue(doc, y, 'Backup Codes', cred.googleBackupCodes ?? '-');
    }

    y = writeDivider(doc, y);
    y += SECTION_GAP;
  });

  drawFooter(doc);
  const blob = doc.output('blob');
  await exportBlob(`notecore-credentials-${new Date().toISOString().slice(0, 10)}.pdf`, blob);
}

