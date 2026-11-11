import { jsPDF } from 'jspdf'

export interface WhitePaperPdfOptions {
  onProgress?: (status: string) => void
}

interface LoadedImage {
  dataUrl: string
  width: number
  height: number
}

/**
 * Loads an image via an off-screen canvas and returns
 * a standard PNG data URL with its natural dimensions.
 */
function loadPngData(src: string): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const nw = img.naturalWidth || img.width || 800
        const nh = img.naturalHeight || img.height || 600
        canvas.width = nw
        canvas.height = nh
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0)
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: nw,
          height: nh,
        })
      } catch (err) {
        console.warn('Canvas export failed for:', src, err)
        resolve(null)
      }
    }
    img.onerror = () => {
      console.warn('Image failed to load:', src)
      resolve(null)
    }
    img.src = src
  })
}

/**
 * Loads an image and clips it to a circle for author portraits.
 */
function loadCircularAvatar(src: string, size = 180): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()

        const nw = img.naturalWidth || img.width
        const nh = img.naturalHeight || img.height
        const minDim = Math.min(nw, nh)
        const sx = (nw - minDim) / 2
        const sy = (nh - minDim) / 2
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export async function generateWhitePaperPdf(options?: WhitePaperPdfOptions): Promise<void> {
  const { onProgress } = options || {}
  onProgress?.('Loading architecture diagram & partner portraits...')

  const [flowchart, avatarSagar, avatarPatricia] = await Promise.all([
    loadPngData('/charts/nsrc-holdings-flowchart.png'),
    loadCircularAvatar('/assets/aistudio/ST_-_Black_Japan_6033a488.png', 180),
    loadCircularAvatar('/assets/aistudio/patricia-sosrodjojo.png', 180),
  ])

  onProgress?.('Composing document...')

  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 12) {
      doc.addPage()
      y = margin + 5
      return true
    }
    return false
  }

  const addHeaderTag = (text: string) => {
    checkPageBreak(8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(140, 120, 80)
    doc.text(text.toUpperCase(), margin, y)
    y += 6
  }

  const addHeading = (text: string) => {
    checkPageBreak(16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(15, 20, 25)
    doc.text(text, margin, y)
    y += 8
  }

  const addSubHeading = (text: string) => {
    checkPageBreak(12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 35, 42)
    doc.text(text, margin, y)
    y += 6
  }

  const addParagraph = (text: string, isItalic = false) => {
    doc.setFont('helvetica', isItalic ? 'italic' : 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(45, 50, 58)
    const lines = doc.splitTextToSize(text, contentWidth)
    checkPageBreak(lines.length * 4.8 + 3)
    doc.text(lines, margin, y)
    y += lines.length * 4.8 + 4
  }

  // ────────── COVER / HEADER ──────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(150, 110, 40)
  doc.text('NEW SILK ROAD CAPITAL ADVISORY SERVICES', margin, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(10, 15, 22)
  doc.text('NSRC Holdings', margin, y)
  y += 7.5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(80, 85, 95)
  doc.text('By Silk Road Siblings', margin, y)
  y += 8

  // Subtitle
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9.5)
  doc.setTextColor(95, 100, 110)
  const subtitle = 'Connecting small and mid-cap "Mini-Berkshire" compounders in East Asia and Nordics/Europe with global institutional capital through deep analytical rigor and narrative conviction.'
  const subLines = doc.splitTextToSize(subtitle, contentWidth)
  doc.text(subLines, margin, y)
  y += subLines.length * 4.6 + 6

  // Partners bar
  doc.setDrawColor(220, 224, 230)
  doc.line(margin, y, margin + contentWidth, y)
  y += 5

  // Partner Avatars & Info
  const avatarSize = 13
  if (avatarSagar) {
    try {
      doc.addImage(avatarSagar, 'PNG', margin, y - 1, avatarSize, avatarSize)
    } catch {
      // ignore
    }
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(20, 25, 30)
  doc.text('Sagar Tandon', margin + avatarSize + 3, y + 4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(110, 115, 125)
  doc.text('sagar@firstfollowers.co', margin + avatarSize + 3, y + 8.5)

  const col2X = margin + 85
  if (avatarPatricia) {
    try {
      doc.addImage(avatarPatricia, 'PNG', col2X, y - 1, avatarSize, avatarSize)
    } catch {
      // ignore
    }
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(20, 25, 30)
  doc.text('Patricia Sosrodjojo', col2X + avatarSize + 3, y + 4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(110, 115, 125)
  doc.text('patricia.sosrodjojo@gmail.com', col2X + avatarSize + 3, y + 8.5)

  y += avatarSize + 5
  doc.setDrawColor(220, 224, 230)
  doc.line(margin, y, margin + contentWidth, y)
  y += 8

  // ────────── SECTION 1: THE INVISIBLE COMPOUNDERS ──────────
  addHeaderTag('Core Thesis')
  addHeading('The Invisible Compounders')
  addParagraph(
    'Sometimes great companies are often invisible to the capital that needs them the most. Small and mid-cap "Mini-Berkshire" compounders in East Asia and Nordics/Europe build incredible capital allocation machines, but they lack the IR infrastructure, the language skills, and the network to attract global institutional capital.'
  )
  addParagraph(
    'These regions — the Nordics, Canada, and East Asia (Japan, Taiwan, South Korea) — are home to societies that prioritize long-term stewardship over quarterly results, and where the real economy of manufacturing, infrastructure, and technology innovation remains the bedrock of prosperity.'
  )
  addParagraph(
    "Conversely, global capital providers — family offices and corporate treasuries — are desperate for uncorrelated, high-quality yield, but they don't know how to find or evaluate these hidden gems."
  )
  addParagraph(
    'New Silk Road Capital Advisory Services (NSRC Holdings) sits in the middle, connecting these two worlds through a specialized, two-sided advisory service. We combine deep analytical rigor with compelling storytelling to make these companies visible, investable, and easy to understand.'
  )

  // ────────── SECTION 2: TO THE COMPANIES ──────────
  addHeading('1. To the Companies (The IR Sherpa & Storytelling Service)')
  addParagraph(
    'We partner with publicly listed serial acquirers / compounders / mini-berkshires in East Asia and Europe. We act as their outsourced, cross-border IR department. We don\'t just translate documents; we architect their narrative. We combine deep investment research with storytelling to translate their decentralized capital allocation model into a rigorous, compelling equity story. We provide introductions to institutional capital and help architect paths to dual listings (e.g., bringing a Japanese micro-cap to a Nordic exchange or a European compounder to Asian investors).'
  )

  // ────────── SECTION 3: TO THE CAPITAL PROVIDERS ──────────
  addHeading('2. To the Capital Providers (Research & Education)')
  addParagraph(
    'We act as the trusted filter for family offices, institutions, and corporate treasuries. We provide detailed research memos and deep-dive analysis. Crucially, we don\'t just send them data; we combine analytical rigor with narrative context so they truly understand the machine they are investing in. We also run educational workshops on the Capital Allocation Platform model, teaching allocators how to evaluate these unique businesses.'
  )

  // ────────── SECTION 4: THE ALIGNMENT ENGINE ──────────
  addHeading('3. The Alignment Engine (Skin in the Game)')
  addParagraph(
    'We do not operate like a traditional investment bank that takes a fee and walks away. We align our incentives by investing a significant portion of our advisory fees and service revenue directly into our partner companies\' stock. We literally turn our fees into equity. We are not just advisors; we are permanent shareholders who compound alongside the companies we represent. We only win if they compound.'
  )

  // ────────── SECTION 5: METICULOUS CURATION ──────────
  addHeading('4. Meticulous Curation')
  addParagraph(
    'We are incredibly selective. We do not take on every company that knocks on our door. We only partner with businesses that pass our strict internal tests for durable capital allocation, frugality, and long-term compounding. If we don\'t believe in the machine enough to invest our own money in it, we won\'t represent them.'
  )

  // ────────── SECTION 6: THE PARTNERS ──────────
  addHeading('The Partners — Silk Road Siblings')
  addParagraph(
    'Patricia Sosrodjojo and Sagar Tandon lead the firm together, combining Investor Relations expertise with Investment Research. We do not operate in silos — we both contribute to the analytical rigor and the storytelling, ensuring every partner company is presented with clarity, depth, and conviction.'
  )

  // ────────── SECTION 7: FLOWCHART ──────────
  if (flowchart) {
    checkPageBreak(90)
    addHeading('Architecture & Cross-Border Capital Flow Model')
    const imgAspect = flowchart.height / flowchart.width
    const targetW = contentWidth
    const targetH = Math.min(targetW * imgAspect, 92)
    doc.addImage(flowchart.dataUrl, 'PNG', margin, y, targetW, targetH)
    y += targetH + 3
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7.5)
    doc.setTextColor(130, 135, 145)
    doc.text(
      'NSRC Holdings Two-Sided Platform: Bridging East Asia & European Compounders with Global Capital Allocators',
      margin,
      y
    )
    y += 8
  }

  // ────────── SECTION 8: PARTNER BIOS ──────────
  checkPageBreak(50)
  addHeading('Partner Biographies')

  // Sagar Tandon Bio
  checkPageBreak(35)
  addSubHeading('Sagar Tandon')
  addParagraph(
    'Sagar Tandon is a capital allocator and investor with over a decade of experience in venture building, governance, and cross-border capital. He has evaluated nearly 100 listed serial acquirers globally and invested in 18 across Japan, Canada, Sweden, and Finland, publishing extensive research on the Capital Allocation Platform model (threadsunite.xyz and compounders.cc). A close observer of the Finnish market, he is dedicated to seeing a Finnish serial acquirer reach the heights of its Swedish, Japanese, and Canadian peers. Beyond his research, he co-founded an edtech venture, helped establish an Australian Government-backed fund, served as an Investor-in-Residence at MIT D-Lab, and is a Partner at Beyond Impact VC, where he leads due diligence and sits on three portfolio boards. He also advises 2X Global and the EIT Community New European Bauhaus Advisory Board.'
  )

  // Patricia Sosrodjojo Bio
  checkPageBreak(28)
  addSubHeading('Patricia Sosrodjojo')
  addParagraph(
    'Investor and board leader with 15+ years in private equity and venture capital across emerging markets. Deployed $350 million across Africa, Asia, and Latin America in food systems, climate adaptation, and financial inclusion. Raised $800 million across three funds from DFIs, foundations, family offices, and asset managers.'
  )

  // Sign-off
  checkPageBreak(25)
  y += 4
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9.5)
  doc.setTextColor(70, 75, 85)
  doc.text('In Service of Humanity,', margin, y)
  y += 5.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(20, 25, 30)
  doc.text('Sagar Tandon & Patricia Sosrodjojo', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(110, 115, 125)
  doc.text('Silk Road Siblings // NSRC Holdings', margin, y)
  y += 4
  doc.text('First Follower (firstfollowers.co) • Threads Unite (threadsunite.xyz) • Compounders (compounders.cc)', margin, y)

  // Page Numbers
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(150, 155, 165)
    doc.text('NSRC Holdings — New Silk Road Capital Advisory Services', margin, pageHeight - 10)
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 10)
  }

  doc.save('NSRC-Holdings-About.pdf')
}
