/**
 * Kompres file gambar pakai Canvas API native browser.
 *
 * @param {File|Blob} file - File asli dari input
 * @param {object} options
 * @param {number} options.maxWidth   - Lebar maksimal dalam pixel (default 1280)
 * @param {number} options.maxHeight  - Tinggi maksimal dalam pixel (default 1280)
 * @param {number} options.quality    - Kualitas JPEG 0.0-1.0 (default 0.75)
 * @param {string} options.mimeType   - Output MIME (default 'image/jpeg')
 * @returns {Promise<File>}
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.75,
    mimeType = 'image/jpeg',
  } = options

  // Skip kalau bukan gambar atau sudah kecil (<200 KB)
  if (!file.type?.startsWith('image/')) return file
  if (file.size < 200 * 1024) return file

  // Load image
  const img = await loadImage(file)

  // Hitung ukuran akhir, jaga aspect ratio
  let { width, height } = img
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  // Render ke canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)

  // Convert ke blob
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality))
  if (!blob) return file // fallback kalau gagal

  // Kalau hasil kompres lebih besar dari original (jarang tapi mungkin untuk PNG kecil),
  // pakai file original saja
  if (blob.size >= file.size) return file

  // Bikin File baru dengan nama yang sama
  const ext = mimeType === 'image/jpeg' ? 'jpg' : (mimeType.split('/')[1] || 'jpg')
  const baseName = (file.name || 'image').replace(/\.[^/.]+$/, '')
  return new File([blob], `${baseName}.${ext}`, { type: mimeType, lastModified: Date.now() })
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gagal memuat gambar.'))
    }
    img.src = url
  })
}

/**
 * Kompres banyak file sekaligus (paralel).
 */
export async function compressImages(files, options) {
  return Promise.all(files.map((f) => compressImage(f, options)))
}
