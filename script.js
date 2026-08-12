const POSTER_COUNT = 15
const POSTER_ROOT = '/poster-gallery/assets/posters/batch-01'
const CLOUD_ASSETS = {
  waves: '/poster-gallery/assets/cloud-waves.png',
  scroll: '/poster-gallery/assets/cloud-scroll.png',
}

const existingPosters = [
  { categoryLabel:'热点要闻', src: `${POSTER_ROOT}/culture/news-01.jpg` },
  { categoryLabel: '热点要闻', src: `${POSTER_ROOT}/culture/news-02.jpg` },
  { categoryLabel: '热点要闻', src: `${POSTER_ROOT}/culture/news-03.png` },
  { categoryLabel: '热点要闻', src: `${POSTER_ROOT}/culture/hot-new-04.png` },
  { categoryLabel: '满井日报', src: `${POSTER_ROOT}/culture/poster-01.jpg` },
  { categoryLabel: '校史访谈', src: `${POSTER_ROOT}/culture/poster-09.jpg` },
  { categoryLabel: '校史访谈', src: `${POSTER_ROOT}/culture/poster-10.jpg` },
  { categoryLabel: '矿业学科', src: `${POSTER_ROOT}/culture/poster-07.png` },
  { categoryLabel: '矿业学科', src: `${POSTER_ROOT}/culture/poster-08.png` },
  { categoryLabel: '体育力量', src: `${POSTER_ROOT}/culture/poster-11.jpg` },
  { categoryLabel: '体育力量', src: `${POSTER_ROOT}/culture/poster-12.jpg` },
  { categoryLabel: '地脉薪传', src: `${POSTER_ROOT}/culture/poster-04.png` },
  { categoryLabel: '西迁足迹', src: `${POSTER_ROOT}/culture/west.jpg` },
  { categoryLabel: '艺润满井', src: `${POSTER_ROOT}/culture/art.png` },
  { categoryLabel: '全部海报', src: "" },


]

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

// 存真正加载成功的海报，用于弹窗上下翻页
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

function placeholderMarkup(index, categoryLabel) {
  const number = String(index + 1).padStart(2, '0')
  return `
    <span class="placeholder-index">${number}</span>
    <span class="placeholder-mark" aria-hidden="true">源</span>
    <strong>海报待发布</strong>
    <small>${categoryLabel}</small>`
}

/**
 * 创建卡片，不再提前探测；图片加载失败onerror切换占位
 */
function createPosterCard(poster, globalIndex) {
  const article = document.createElement('article')
  article.className = 'poster-card is-published'
  const displayNumber = String(poster.number).padStart(2, '0')

  const button = document.createElement('button')
  button.className = 'poster-cover'
  button.type = 'button'

  const image = document.createElement('img')
  image.src = poster.src
  image.alt = `第 ${displayNumber} 号海报封面`
  image.loading = 'lazy'
  image.decoding = 'async'

  // 关键：图片加载失败，动态变为待发布状态
  image.onerror = () => {
    article.className = 'poster-card is-empty'
    button.disabled = true
    button.innerHTML = ''
    const placeholder = document.createElement('span')
    placeholder.className = 'poster-placeholder'
    placeholder.innerHTML = placeholderMarkup(poster.number - 1, poster.categoryLabel)
    button.append(placeholder)
    // 从可用列表移除
    const idx = visiblePublishedPosters.findIndex(p=>p.number === poster.number)
    if(idx>-1) visiblePublishedPosters.splice(idx,1)
    publishedCount.textContent = String(visiblePublishedPosters.length)
  }

  button.append(image)
  button.addEventListener('click', () => openViewer(visiblePublishedPosters.findIndex(p=>p.number===poster.number), button))

  const metadata = document.createElement('div')
  metadata.className = 'poster-meta'
  metadata.innerHTML = `
    <div>
      <h3>${poster.categoryLabel} · ${displayNumber}</h3>
      <p>点击查看完整海报</p>
    </div>
    <span>已发布</span>`

  article.append(button, metadata)
  return article
}

async function renderPosters() {
  const records = createPosterRecords()
  loadingState.hidden = false
  posterGrid.setAttribute('aria-busy', 'true')
  visiblePublishedPosters = []

  const cards = records.map((poster, index)=>{
    // src为空，直接渲染待发布
    if(!poster.src?.trim()){
      const article = document.createElement('article')
      article.className = 'poster-card is-empty'
      const button = document.createElement('button')
      button.className = 'poster-cover'
      button.type = 'button'
      button.disabled = true
      const placeholder = document.createElement('span')
      placeholder.className = 'poster-placeholder'
      placeholder.innerHTML = placeholderMarkup(index, poster.categoryLabel)
      button.append(placeholder)
      const metadata = document.createElement('div')
      metadata.className = 'poster-meta'
      metadata.innerHTML = `
      <div>
        <h3>${poster.categoryLabel} · ${String(poster.number).padStart(2,'0')}</h3>
        <p>POSTER COMING SOON</p>
      </div>
      <span>待发布</span>`
      article.append(button, metadata)
      return article
    }else{
      visiblePublishedPosters.push(poster)
      return createPosterCard(poster, index)
    }
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
  if (index < 0) return
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
