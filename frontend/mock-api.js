import http from 'http'
import url from 'url'

const data = {
  company: {
    name: 'Alkana Coating',
    slogan: 'Sơn & Chất phủ bề mặt công nghiệp',
    about: 'Giải pháp toàn diện cho sơn và chất phủ bề mặt trong công nghiệp, xây dựng và hàng hải.',
    email: 'info@alkanacoating.com',
    phone: '0900 000 000',
    address: 'TP. Hồ Chí Minh, Việt Nam',
    socials: {
      zalo: 'https://zalo.me',
      facebook: 'https://facebook.com'
    }
  },
  categories: [
    { id: 1, name: 'Sơn Epoxy', slug: 'son-epoxy', description: 'Bền hóa chất, chống mài mòn' },
    { id: 2, name: 'Sơn PU', slug: 'son-pu', description: 'Bề mặt đẹp, độ bóng cao' },
    { id: 3, name: 'Chống ăn mòn', slug: 'chong-an-mon', description: 'Bảo vệ môi trường khắc nghiệt' }
  ],
  products: [
    { id: 1, category_id: 1, name: 'Epoxy Floor 100', slug: 'epoxy-floor-100', summary: 'Sơn epoxy sàn công nghiệp', thumbnail: '', specs: { color: 'xanh', finish: 'mờ' } },
    { id: 2, category_id: 2, name: 'PU Clear Pro', slug: 'pu-clear-pro', summary: 'Sơn PU phủ bóng', thumbnail: '', specs: { finish: 'bóng' } },
    { id: 3, category_id: 3, name: 'AntiCor 900', slug: 'anticor-900', summary: 'Sơn chống ăn mòn biển', thumbnail: '', specs: { resistance: 'muối' } }
  ],
  projects: [
    { id: 1, title: 'Nhà xưởng A', slug: 'nha-xuong-a', summary: 'Thi công sơn epoxy sàn 5000m2', thumbnail: '' },
    { id: 2, title: 'Bến cảng B', slug: 'ben-cang-b', summary: 'Chống ăn mòn kết cấu thép', thumbnail: '' }
  ],
  posts: [
    { id: 1, title: 'Chọn sơn epoxy cho sàn', slug: 'chon-son-epoxy-cho-san', excerpt: 'Những tiêu chí khi chọn sơn epoxy...', thumbnail: '' },
    { id: 2, title: 'Quy trình chống ăn mòn', slug: 'quy-trinh-chong-an-mon', excerpt: 'Các bước chuẩn bị bề mặt và thi công...', thumbnail: '' }
  ],
  jobs: [
    { id: 1, title: 'Kỹ sư sơn', location: 'HCM', type: 'Full-time' },
    { id: 2, title: 'Sales kỹ thuật', location: 'HN', type: 'Full-time' }
  ]
}

const send = (res, code, payload) => {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(payload))
}

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    return res.end()
  }

  if (pathname === '/api/health') return send(res, 200, { ok: true })
  if (pathname === '/api/company') return send(res, 200, data.company)
  if (pathname === '/api/categories') return send(res, 200, data.categories)
  if (pathname === '/api/products') {
    let list = data.products
    const { category, keyword } = query
    if (category) {
      const cat = data.categories.find(c => c.slug === category)
      list = cat ? list.filter(p => p.category_id === cat.id) : []
    }
    if (keyword) {
      const k = keyword.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(k) || p.summary.toLowerCase().includes(k))
    }
    return send(res, 200, list)
  }
  if (pathname.startsWith('/api/products/')) {
    const slug = pathname.split('/').pop()
    const item = data.products.find(p => p.slug === slug)
    return item ? send(res, 200, item) : send(res, 404, { error: 'Not found' })
  }
  if (pathname === '/api/projects') return send(res, 200, data.projects)
  if (pathname.startsWith('/api/projects/')) {
    const slug = pathname.split('/').pop()
    const item = data.projects.find(p => p.slug === slug)
    return item ? send(res, 200, item) : send(res, 404, { error: 'Not found' })
  }
  if (pathname === '/api/posts') return send(res, 200, data.posts)
  if (pathname.startsWith('/api/posts/')) {
    const slug = pathname.split('/').pop()
    const item = data.posts.find(p => p.slug === slug)
    return item ? send(res, 200, item) : send(res, 404, { error: 'Not found' })
  }
  if (pathname === '/api/jobs') return send(res, 200, data.jobs)
  if (pathname === '/api/contact' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}')
        console.log('Lead:', payload)
      } catch {}
      send(res, 200, { success: true })
    })
    return
  }

  send(res, 404, { error: 'Not found' })
})

server.listen(9000, () => console.log('Mock API running http://localhost:9000'))
