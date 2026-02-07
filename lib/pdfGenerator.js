import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (invoiceData) => {
    const doc = new jsPDF();

    // Branding
    doc.setFontSize(22);
    doc.setTextColor(245, 158, 11); // Accent color #f59e0b
    doc.text("LIGHTBILL PRO", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Shooting Lights Rental Business", 14, 28);

    // Invoice Details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Invoice No: ${invoiceData.invoiceNo}`, 140, 20);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 28);

    // Client Details
    doc.setFontSize(14);
    doc.text("Bill To:", 14, 45);
    doc.setFontSize(10);
    doc.text(invoiceData.clientName, 14, 52);
    doc.text(`Location: ${invoiceData.location}`, 14, 58);
    doc.text(`Incharge: ${invoiceData.incharge}`, 14, 64);

    // Rental Dates
    doc.text(`D.O.H: ${invoiceData.doh}`, 140, 52);
    doc.text(`D.O.R: ${invoiceData.dor}`, 140, 58);
    doc.text(`N.O.D: ${invoiceData.nod}`, 140, 64);

    // Items Table
    const tableColumn = ["Item", "Qty", "Rate", "Days", "Total"];
    const tableRows = invoiceData.items.map(item => [
        item.name,
        item.qty,
        `Rs. ${item.rate}`,
        invoiceData.nod,
        `Rs. ${item.total}`
    ]);

    autoTable(doc, {
        startY: 75,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] },
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Subtotal: Rs. ${invoiceData.subtotal}`, 140, finalY);
    doc.text(`Transport: Rs. ${invoiceData.transport || 0}`, 140, finalY + 7);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: Rs. ${invoiceData.grandTotal}`, 140, finalY + 17);

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text("Thank you for your business!", 70, finalY + 40);

    return doc;
};
