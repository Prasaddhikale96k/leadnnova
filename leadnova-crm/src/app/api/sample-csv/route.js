import { NextResponse } from 'next/server'

export async function GET() {
  const csvContent = `Name,Business Name,Email,Phone,City,Category
John Smith,Smith & Associates,john@smithassociates.com,+919876543210,Mumbai,Consulting
Sarah Johnson,Tech Solutions,sarah@techsolutions.in,+919876543211,Delhi,Technology
Mike Davis,Green Energy,mike@greenenergy.co.in,+919876543212,Bangalore,Energy
Lisa Chen,Creative Studio,lisa@creativestudio.com,+919876543213,Chennai,Design
David Wilson,Wilson Logistics,david@wilsonlogistics.in,+919876543214,Pune,Logistics
Emma Brown,Brown Marketing,emma@brownmarketing.co.in,+919876543215,Hyderabad,Marketing
Robert Lee,Lee Construction,robert@leeconstruction.com,+919876543216,Kolkata,Construction
Anna Garcia,Garcia Consulting,anna@garciaconsulting.in,+919876543217,Ahmedabad,Consulting
Tom Anderson,Anderson Tech,tom@andersontech.co.in,+919876543218,Jaipur,Technology
Maria Rodriguez,Rodriguez Solutions,maria@rodriguezsolutions.com,+919876543219,Surat,Business Solutions`

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="sample-leads.csv"'
    }
  })
}