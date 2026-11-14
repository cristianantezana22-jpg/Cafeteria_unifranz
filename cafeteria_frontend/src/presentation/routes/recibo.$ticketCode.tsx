import { createFileRoute } from '@tanstack/react-router'
import { jsPDF } from 'jspdf'
import { decodeReceiptData } from '../../application/receipt/receiptData'

export const Route = createFileRoute('/recibo/$ticketCode')({
  validateSearch: (search: Record<string, unknown>) => ({
    d: typeof search.d === 'string' ? search.d : '',
  }),
  component: ReceiptView,
})

function ReceiptView() {
  const { ticketCode } = Route.useParams()
  const { d } = Route.useSearch()
  const decodedReceipt = decodeReceiptData(d)
  const receipt = decodedReceipt?.ticketCode === ticketCode ? decodedReceipt : null

  function downloadReceipt() {
    if (!receipt) return

    const pdf = new jsPDF()
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.text('CAFETERÍA UNIFRANZ', 20, 24)
    pdf.setFontSize(15)
    pdf.text('Comprobante de compra', 20, 36)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.text(`Ticket: ${receipt.ticketCode}`, 20, 50)
    pdf.text(`Fecha: ${receipt.date}`, 20, 58)
    pdf.text(`Hora: ${receipt.time}`, 20, 66)
    pdf.line(20, 73, 190, 73)

    let y = 84
    for (const item of receipt.items) {
      if (y > 265) {
        pdf.addPage()
        y = 22
      }
      const nameLines = pdf.splitTextToSize(item.name, 115)
      pdf.setFont('helvetica', 'bold')
      pdf.text(nameLines, 20, y)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Bs ${item.subtotal.toFixed(2)}`, 190, y, { align: 'right' })
      y += nameLines.length * 6
      pdf.setFontSize(9)
      pdf.text(`${item.quantity} x Bs ${item.unitPrice.toFixed(2)}`, 20, y)
      pdf.setFontSize(11)
      y += 10
    }

    if (y > 265) {
      pdf.addPage()
      y = 22
    }
    pdf.line(20, y, 190, y)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Total', 20, y + 11)
    pdf.text(`Bs ${receipt.total.toFixed(2)}`, 190, y + 11, { align: 'right' })
    pdf.save(`recibo-${receipt.ticketCode}.pdf`)
  }

  return (
    <main className="digital-receipt-page">
      {receipt ? (
        <article className="digital-receipt">
          <header className="digital-receipt-header">
            <p>CAFETERÍA UNIFRANZ</p>
            <h1>Comprobante de compra</h1>
          </header>
          <dl className="digital-receipt-meta">
            <div><dt>Número de ticket</dt><dd>{receipt.ticketCode}</dd></div>
            <div><dt>Fecha</dt><dd>{receipt.date}</dd></div>
            <div><dt>Hora</dt><dd>{receipt.time}</dd></div>
          </dl>
          <section aria-labelledby="receipt-items-heading">
            <h2 id="receipt-items-heading">Detalle de productos</h2>
            <ul className="digital-receipt-items">
              {receipt.items.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.quantity} x Bs {item.unitPrice.toFixed(2)}</span>
                  </div>
                  <strong>Bs {item.subtotal.toFixed(2)}</strong>
                </li>
              ))}
            </ul>
          </section>
          <div className="digital-receipt-total">
            <span>Precio total</span>
            <strong>Bs {receipt.total.toFixed(2)}</strong>
          </div>
          <button type="button" className="digital-receipt-download" onClick={downloadReceipt}>
            Descargar Recibo PDF
          </button>
        </article>
      ) : (
        <section className="digital-receipt digital-receipt-invalid" role="alert">
          <h1>Comprobante no disponible</h1>
          <p>No encontramos datos válidos para el ticket {ticketCode}.</p>
        </section>
      )}
    </main>
  )
}
