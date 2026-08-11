const POSTER_COUNT = 15
const POSTER_ROOT = '/poster-gallery/assets/posters/batch-01'
const CLOUD_ASSETS = {
  waves: '/poster-gallery/assets/cloud-waves.png',
  scroll: '/poster-gallery/assets/cloud-scroll.png',
}

const existingPosters = [
  { categoryLabel:'热点要闻', src: `${POSTER_ROOT}/culture/热点要闻-01.jpg` },
  { categoryLabel: '热点要闻', src: `${POSTER_ROOT}/culture/热点要闻-02.jpg` },
  { categoryLabel: '热点要闻', src: `${POSTER_ROOT}/culture/热点要闻-03.png` },
  { categoryLabel: '热点要闻', src: `${POSTER_ROOT}/culture/hot-new-04.png` },
  { categoryLabel: '满井日报', src: `${POSTER_ROOT}/culture/poster-01.jpg` },
  { categoryLabel: '校史访谈', src: `${POSTER_ROOT}/culture/poster-09.jpg` },
  { categoryLabel: '校史访谈', src: `${POSTER_ROOT}/culture/poster-10.jpg` },
  { categoryLabel: '矿业学科', src: `${POSTER_ROOT}/culture/poster-07.png` },
  { categoryLabel: '矿业学科', src: `${POSTER_ROOT}/culture/poster-08.png` },
  { categoryLabel: '体育力量', src: `${POSTER_ROOT}/culture/poster-11.jpg` },
  { categoryLabel: '体育力量', src: `${POSTER_ROOT}/culture/poster-12.jpg` },
  { categoryLabel: '地脉薪传', src: `${POSTER_ROOT}/culture/poster-04.png` },
  { categoryLabel: '西迁足迹', src: `${POSTER_ROOT}/culture/西迁.jpg` },
  { categoryLabel: '艺润满井', src: `${POSTER_ROOT}/culture/艺术.png` },
  { categoryLabel: '全部海报', src: "" },


]

const imageAvailability = new Map()
const posterGrid = document.querySelector('#poster-grid')
const publishedCount = document.querySelector('#published-count')
const loadingState = document.querySelector('#loading-state')
const viewer = document.querySelector('#poster-viewer')
const viewerImage = document.querySelector('#viewer-image')
const viewerTitle = document.querySelector('#viewer-title')
const viewerCategory = document.querySelector('#viewer-category')
const viewerClose = document.querySelector('#viewer-close')
const viewerPrevious = document.querySelector('#viewer-previous')
const viewerNext = document.querySelector('#viewer-next')

let visiblePublishedPosters = []
let activeViewerIndex = -1
let lastFocusedElement = null

function renderRandomClouds() {
  const decor = document.querySelector('.heritage-decor')
  if (!decor) return

  const existing = decor.querySelector('.random-cloud-layer')
  if (existing) existing.remove()

  const layer = document.createElement('div')
  layer.className = 'random-cloud-layer'

  const placements = [
    { type: 'scroll', className: 'cloud-scroll-left', x: -4, y: 18, width: 45, opacity: .12, rotation: -2, flip: 1 },
    { type: 'waves', className: 'cloud-waves-right', x: 84, y: 40, width: 38, opacity: .13, rotation: 0, flip: 1 },
    { type: 'waves', className: 'cloud-waves-bottom', x: 16, y: 84, width: 54, opacity: .1, rotation: 1, flip: -1 },
    { type: 'scroll', className: 'cloud-scroll-bottom', x: 91, y: 88, width: 46, opacity: .11, rotation: 1, flip: -1 },
    { type: 'waves', className: 'cloud-waves-left-middle', x: 2, y: 53, width: 34, opacity: .09, rotation: -1, flip: 1 },
    { type: 'scroll', className: 'cloud-scroll-right-top', x: 96, y: 16, width: 31, opacity: .1, rotation: 2, flip: -1 },
  ]

  placements.map((placement) => {
    const image = document.createElement('img')
    image.className = `random-cloud ${placement.className}`
    image.src = CLOUD_ASSETS[placement.type]
    image.alt = ''
    image.setAttribute('aria-hidden', 'true')
    image.style.left = `${placement.x}%`
    image.style.top = `${placement.y}%`
    image.style.setProperty('--cloud-width', `${placement.width}%`)
    image.style.setProperty('--cloud-opacity', String(placement.opacity))
    image.style.setProperty('--cloud-rotation', `${placement.rotation}deg`)
    image.style.setProperty('--cloud-flip', String(placement.flip))
    return image
  }).forEach((image) => layer.append(image))

  decor.append(layer)
}

function createPosterRecords() {
  return Array.from({ length: POSTER_COUNT }, (_, index) => ({
    number: index + 1,
    categoryLabel: existingPosters[index]?.categoryLabel || '全部海报',
    src: existingPosters[index]?.src || '',
  }))
}

function checkImage(src) {
  if (!src) return Promise.resolve(false)
  if (imageAvailability.has(src)) return Promise.resolve(imageAvailability.get(src))

  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      imageAvailability.set(src, true)
      resolve(true)
    }
    image.onerror = () => {
      imageAvailability.set(src, false)
      resolve(false)
    }
    image.src = src
  })
}

function placeholderMarkup(index, categoryLabel) {
  const number = String(index + 1).padStart(2, '0')
  return `
    <span class="placeholder-index">${number}</span>
    <span class="placeholder-mark" aria-hidden="true">源</span>
    <strong>海报待发布</strong>
    <small>${categoryLabel}</small>`
}

function createPosterCard(poster, index, isPublished) {
  const article = document.createElement('article')
  article.className = isPublished ? 'poster-card is-published' : 'poster-card is-empty'
  const displayNumber = String(poster.number).padStart(2, '0')

  const button = document.createElement('button')
  button.className = 'poster-cover'
  button.type = 'button'
  button.disabled = !isPublished

  if (isPublished) {
    button.setAttribute('aria-label', `查看第 ${displayNumber} 号海报大图`)
    const image = document.createElement('img')
    image.src = poster.src
    image.alt = `第 ${displayNumber} 号海报封面`
    image.loading = 'lazy'
    image.decoding = 'async'
    button.append(image)
    button.addEventListener('click', () => openViewer(index, button))
  } else {
    button.setAttribute('aria-label', `第 ${displayNumber} 号展位，海报待发布`)
    const placeholder = document.createElement('span')
    placeholder.className = 'poster-placeholder'
    placeholder.innerHTML = placeholderMarkup(poster.number - 1, poster.categoryLabel)
    button.append(placeholder)
  }

  const metadata = document.createElement('div')
  metadata.className = 'poster-meta'
  metadata.innerHTML = `
    <div>
      <h3>${poster.categoryLabel} · ${displayNumber}</h3>
      <p>${isPublished ? '点击查看完整海报' : 'POSTER COMING SOON'}</p>
    </div>
    <span>${isPublished ? '已发布' : '待发布'}</span>`

  article.append(button, metadata)
  return article
}

async function renderPosters() {
  const records = createPosterRecords()
  loadingState.hidden = false
  posterGrid.setAttribute('aria-busy', 'true')

  const availability = await Promise.all(records.map((poster) => checkImage(poster.src)))
  visiblePublishedPosters = records.filter((_, index) => availability[index])

  let viewerPosition = 0
  const cards = records.map((poster, index) => {
    const isPublished = availability[index]
    const card = createPosterCard(poster, isPublished ? viewerPosition : -1, isPublished)
    if (isPublished) viewerPosition += 1
    return card
  })

  posterGrid.replaceChildren(...cards)
  publishedCount.textContent = String(visiblePublishedPosters.length)
  loadingState.hidden = true
  posterGrid.setAttribute('aria-busy', 'false')
}

function updateViewer(index) {
  const poster = visiblePublishedPosters[index]
  if (!poster) return

  activeViewerIndex = index
  const displayNumber = String(poster.number).padStart(2, '0')
  viewerImage.src = poster.src
  viewerImage.alt = `第 ${displayNumber} 号海报大图`
  viewerCategory.textContent = poster.categoryLabel
  viewerTitle.textContent = `第 ${displayNumber} 号海报`
  const hasMultiple = visiblePublishedPosters.length > 1
  viewerPrevious.disabled = !hasMultiple
  viewerNext.disabled = !hasMultiple
}

function openViewer(index, trigger) {
  if (!visiblePublishedPosters[index]) return
  lastFocusedElement = trigger
  updateViewer(index)
  document.body.classList.add('viewer-open')
  viewer.showModal()
  viewerClose.focus()
}

function closeViewer() {
  if (!viewer.open) return
  viewer.close()
  document.body.classList.remove('viewer-open')
  viewerImage.src = ''
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus()
}

function moveViewer(direction) {
  if (visiblePublishedPosters.length < 2) return
  const nextIndex = (activeViewerIndex + direction + visiblePublishedPosters.length) % visiblePublishedPosters.length
  updateViewer(nextIndex)
}

viewerClose.addEventListener('click', closeViewer)
viewerPrevious.addEventListener('click', () => moveViewer(-1))
viewerNext.addEventListener('click', () => moveViewer(1))

viewer.addEventListener('click', (event) => {
  if (event.target === viewer) closeViewer()
})

viewer.addEventListener('cancel', (event) => {
  event.preventDefault()
  closeViewer()
})

viewer.addEventListener('close', () => document.body.classList.remove('viewer-open'))

document.addEventListener('keydown', (event) => {
  if (!viewer.open) return
  if (event.key === 'ArrowLeft') moveViewer(-1)
  if (event.key === 'ArrowRight') moveViewer(1)
})

renderRandomClouds()
renderPosters()
