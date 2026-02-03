import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateBillPDF = (bill) => {
  if (!bill || typeof bill !== 'object') {
    console.error("Invalid bill data for PDF generation", bill);
    return;
  }

  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(200, 0, 0); // Reddish color for SRM AGENCY
  doc.setFont("helvetica", "bold");
  doc.text("SRM AGENCY", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text("(Electrical & Plumbing Works & Public Health)", 105, 26, { align: "center" });
  doc.text("No.5/302, Koonampatti, Pallagoundenpalayam (Post),", 105, 31, { align: "center" });
  doc.text("Vijayamangalam (Via), Tirupur Dt - 638 056.", 105, 36, { align: "center" });

  // GSTIN and Contact
  doc.setFontSize(10);
  doc.text(`GSTIN: 33CLPPB8841Q1ZF`, 15, 15);
  doc.text(`Cell: 97886 54170`, 195, 15, { align: "right" });

  // Invoice Title
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(15, 42, 195, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 105, 48, { align: "center" });
  doc.line(15, 52, 195, 52);

  // Bill To and Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("To:", 15, 60);
  doc.setFont("helvetica", "bold");
  doc.text(bill.billTo?.name || "", 25, 60);
  doc.setFont("helvetica", "normal");
  doc.text(bill.billTo?.address || "", 25, 65, { maxWidth: 100 });

  const billDate = bill.date ? new Date(bill.date).toLocaleDateString() : new Date().toLocaleDateString();
  doc.text(`Date: ${billDate}`, 195, 60, { align: "right" });
  doc.text(`Invoice No: ${bill.invoiceNo || 'N/A'}`, 195, 65, { align: "right" });

  doc.text(`State: ${bill.billTo?.state || 'Tamilnadu'}`, 15, 80);
  doc.text(`State Code: ${bill.billTo?.stateCode || '33'}`, 80, 80);
  doc.text(`GSTIN No: 33CLPPB8841Q1ZF`, 140, 80);

  // Table
  const tableData = (bill.items || []).map((item, index) => [
    index + 1,
    item.description || "",
    item.unit || "",
    item.qty || 0,
    (item.rate || 0).toFixed(2),
    (item.total || 0).toFixed(2)
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["S.No", "Description", "Unit", "Qty", "Rate", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30, halign: "right" }
    }
  });

  // Totals
  const finalY = (doc).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Total", 140, finalY);
  doc.text((bill.subtotal || 0).toFixed(2), 195, finalY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text(`CGST ${bill.cgstRate || 9}%`, 140, finalY + 7);
  doc.text((bill.cgstAmount || 0).toFixed(2), 195, finalY + 7, { align: "right" });

  doc.text(`SGST ${bill.sgstRate || 9}%`, 140, finalY + 14);
  doc.text((bill.sgstAmount || 0).toFixed(2), 195, finalY + 14, { align: "right" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Grand Total", 140, finalY + 22);
  doc.text((bill.grandTotal || 0).toFixed(2), 195, finalY + 22, { align: "right" });

  // Amount in words
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  const words = numberToWords(Math.round(bill.grandTotal || 0));
  doc.text(`Rupees: ${words} only`, 15, finalY + 35);

  // Signatory
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("For SRM AGENCY", 195, finalY + 50, { align: "right" });
  doc.text("(Authorised Signatory)", 195, finalY + 70, { align: "right" });

  doc.save(`Invoice_${bill.invoiceNo || 'Draft'}.pdf`);
};

// Helper function for number to words
function numberToWords(num) {
  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim();
}
