/**
 * TellEye — Soil Academy
 * Public educational page accessible to everyone
 * Route: /academy
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const C = {
  maroon:  '#6B1F1F',
  forest:  '#2D6A3F',
  amber:   '#E8941A',
  cream:   '#F9F6F0',
  sage:    '#EAF2EB',
  charcoal:'#1C1C1C',
  mid:     '#6B7280',
  border:  '#E5E7EB',
  white:   '#FFFFFF',
}

const CATEGORIES = [
  { id:'all',        label:'Tout'           },
  { id:'soil',       label:'Science du sol' },
  { id:'algeria',    label:'Agriculture DZ' },
  { id:'technology', label:'Télédétection'  },
  { id:'regulations',label:'Réglementation' },
]

const ARTICLES = [
  {
    id:1,
    category:      'soil',
    categoryLabel: 'Science du sol',
    title:         "Qu'est-ce que le carbone organique du sol (SOC) ?",
    description:   "Découvrez pourquoi le SOC est l'indicateur clé de la santé du sol et comment il influence la fertilité, la rétention d'eau et la productivité agricole.",
    image:         'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
  
    level:         'Débutant',
    isNew:         false,
  },
  {
    id:2,
    category:      'technology',
    categoryLabel: 'Télédétection',
    title:         "Comment Sentinel-2 détecte le carbone du sol depuis l'espace",
    description:   "Comprendre les 12 bandes spectrales de Sentinel-2 et comment les modeles d'apprentissage profond extraient les propriétés du sol à partir de la réflectance spectrale.",
    image:         'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80',
    
    level:         'Intermédiaire',
    isNew:         true,
  },
  {
    id:3,
    category:      'algeria',
    categoryLabel: 'Agriculture DZ',
    title:         'Distribution du SOC dans les régions agricoles algériennes',
    description:   "Analyse des trois zones agro-climatiques d'Algérie — Tell, Hauts Plateaux et zones sahariques — et leurs profils typiques de carbone organique.",
    image:         'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',
   
    level:         'Intermédiaire',
    isNew:         false,
  },
  {
    id:4,
    category:      'algeria',
    categoryLabel: 'Agriculture DZ',
    title:         'Améliorer le SOC de votre parcelle : guide pratique',
    description:   "Techniques concrètes pour les agriculteurs algériens : compostage, rotation des cultures, travail minimum du sol et apport de matière organique.",
    image:         'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80',
    
    level:         'Débutant',
    isNew:         false,
  },
  {
    id:5,
    category:      'soil',
    categoryLabel: 'Science du sol',
    title:         "Gestion du pH dans les sols calcaires d'Afrique du Nord",
    description:   "Stratégies pour corriger l'alcalinité élevée des sols méditerranéens et améliorer la disponibilité du phosphore et des micronutriments.",
    image:         'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80',
  
    level:         'Intermédiaire',
    isNew:         false,
  },
  {
    id:6,
    category:      'algeria',
    categoryLabel: 'Agriculture DZ',
    title:         "Lutter contre la désertification : le barrage vert",
    description:   "Contexte historique et approches modernes basées sur les données pour protéger les terres arables algériennes et surveiller la progression de la désertification.",
    image:         'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80',
   
    level:         'Tous niveaux',
    isNew:         false,
  },
  {
    id:7,
    category:      'technology',
    categoryLabel: 'Télédétection',
    title:         'Comprendre votre rapport SOC TellEye',
    description:   "Guide pas-à-pas pour interpréter les valeurs SOC, les classes de régime minéral/organique et les indices de confiance fournis dans vos rapports.",
    image:         'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',

    level:         'Tous niveaux',
    isNew:         false,
  },
  {
    id:8,
    category:      'regulations',
    categoryLabel: 'Réglementation',
    title:         'Réglementations 2024 sur les sols agricoles en Algérie',
    description:   "Synthèse des nouvelles dispositions réglementaires concernant la protection des terres agricoles, les normes de qualité du sol et les obligations de reporting.",
    image:         'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
    
    level:         'Tous niveaux',
    isNew:         true,
  },
  {
    id:9,
    category:      'technology',
    categoryLabel: 'Télédétection',
    title:         'Cartographie numérique du sol : méthodes et limites',
    description:   "Vue d'ensemble des approches DSM : krigeage, random forest, réseaux de neurones et adaptation de domaine pour les régions à données limitées.",
    image:         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    
    level:         'Avancé',
    isNew:         false,
  },
]

const LEVEL_COLORS = {
  'Débutant':     { bg:'#EAF2EB', color:'#2D6A3F' },
  'Intermédiaire':{ bg:'#FEF3C7', color:'#92400E' },
  'Avancé':       { bg:'#FEE2E2', color:'#6B1F1F' },
  'Tous niveaux': { bg:'#F3F4F6', color:'#6B7280' },
}

const CATEGORY_COLORS = {
  'soil':        { bg:'#EAF2EB', color:'#2D6A3F' },
  'technology':  { bg:'#EFF6FF', color:'#1D4ED8' },
  'algeria':     { bg:'#FEF3C7', color:'#92400E' },
  'regulations': { bg:'#F5F3FF', color:'#7C3AED' },
}

export default function SoilAcademy() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search,         setSearch]         = useState('')
  const [openArticle,    setOpenArticle]    = useState(null)
  const [lang,           setLang]           = useState('fr')

  const filtered = ARTICLES.filter(a => {
    const matchCat    = activeCategory === 'all' || a.category === activeCategory
    const matchSearch = search === '' ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen" style={{ background:C.cream, fontFamily:'var(--font-body)' }}>
      <Navbar lang={lang} onLangChange={setLang} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Hero ────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden mb-8 relative"
          style={{ background:`linear-gradient(135deg, ${C.charcoal} 0%, #1a2e1a 100%)`,
            minHeight:180 }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage:'radial-gradient(circle at 70% 50%, #2D6A3F 0%, transparent 60%)' }}/>
          <div className="relative z-10 p-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color:C.amber }}>
                Ressource éducative
              </p>
              <h1 className="text-3xl font-black text-white mb-2"
                style={{ fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
                Académie du Sol
              </h1>
              <p className="text-sm max-w-md"
                style={{ color:'rgba(255,255,255,0.55)' }}>
                Approfondissez vos connaissances en science du sol,
                télédétection et agriculture de précision adaptées
                au contexte algérien.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)' }}>
                {ARTICLES.length} articles disponibles
              </div>
              <div className="px-4 py-2 rounded-xl text-xs"
                style={{ background:'rgba(45,106,63,0.3)', color:'#7bc67e' }}>
                Mis à jour régulièrement
              </div>
            </div>
          </div>
        </div>

        {/* ── Filters + Search ────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                style={{
                  background:  activeCategory === cat.id ? C.charcoal : C.white,
                  color:       activeCategory === cat.id ? C.white    : C.mid,
                  borderColor: activeCategory === cat.id ? C.charcoal : C.border,
                }}>
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un article..."
              className="pl-8 pr-4 py-2 rounded-xl text-xs outline-none"
              style={{ border:`1.5px solid ${C.border}`, width:220,
                color:C.charcoal, background:C.white }}
              onFocus={e => e.target.style.borderColor = C.forest}
              onBlur={e  => e.target.style.borderColor = C.border}
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs"
              style={{ color:C.mid }}>🔍</span>
          </div>
        </div>

        {/* ── Articles grid ────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border"
            style={{ borderColor:C.border, background:C.white }}>
            <p className="text-sm" style={{ color:C.mid }}>Aucun article trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filtered.map((article, i) => (
              <motion.div key={article.id}
                initial={{ opacity:0, y:16 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.05, duration:0.3 }}
                onClick={() => setOpenArticle(article)}
                className="rounded-2xl border overflow-hidden cursor-pointer group"
                style={{ background:C.white, borderColor:C.border }}
                whileHover={{ y:-3, boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}>

                {/* Image */}
                <div style={{ height:160, overflow:'hidden', position:'relative' }}>
                  <img src={article.image} alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                  {article.isNew && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background:C.amber, color:C.white }}>
                      Nouveau
                    </span>
                  )}
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background:'rgba(0,0,0,0.5)', color:'white' }}>
                    {article.readTime}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: CATEGORY_COLORS[article.category]?.bg,
                        color:      CATEGORY_COLORS[article.category]?.color,
                      }}>
                      {article.categoryLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: LEVEL_COLORS[article.level]?.bg,
                        color:      LEVEL_COLORS[article.level]?.color,
                      }}>
                      {article.level}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold mb-1.5"
                    style={{ color:C.charcoal, fontFamily:'var(--font-heading)',
                      lineHeight:1.4,
                      display:'-webkit-box', WebkitLineClamp:2,
                      WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {article.title}
                  </h3>

                  <p className="text-xs mb-3"
                    style={{ color:C.mid, lineHeight:1.6,
                      display:'-webkit-box', WebkitLineClamp:2,
                      WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {article.description}
                  </p>

                  <span className="text-xs font-semibold" style={{ color:C.forest }}>
                    Lire l'article →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── CTA ─────────────────────────────────────────── */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background:`linear-gradient(135deg, ${C.forest} 0%, #1a3d22 100%)` }}>
          <h3 className="text-xl font-black text-white mb-2"
            style={{ fontFamily:'var(--font-heading)' }}>
            Maîtrisez le potentiel de vos terres
          </h3>
          <p className="text-sm mb-5 max-w-md mx-auto"
            style={{ color:'rgba(255,255,255,0.6)' }}>
            Rejoignez notre réseau d'agronomes et chercheurs pour recevoir
            des mises à jour mensuelles sur la cartographie des sols algériens.
          </p>
          <div className="flex items-center gap-2 max-w-sm mx-auto">
            <input placeholder="Votre email professionnel"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background:'rgba(255,255,255,0.12)', color:C.white,
                border:'1px solid rgba(255,255,255,0.2)' }}/>
            <button className="px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap"
              style={{ background:C.amber, color:C.white, fontFamily:'var(--font-heading)' }}>
              S'inscrire
            </button>
          </div>
        </div>

      </div>

      <Footer lang={lang} />

      {/* ── Article modal ────────────────────────────────── */}
      {openArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)' }}
          onClick={() => setOpenArticle(null)}>
          <motion.div
            initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            onClick={e => e.stopPropagation()}
            className="rounded-2xl overflow-hidden max-w-xl w-full"
            style={{ background:C.white, maxHeight:'85vh', overflowY:'auto' }}>

            <div style={{ height:220, overflow:'hidden', position:'relative' }}>
              <img src={openArticle.image} alt={openArticle.title}
                className="w-full h-full object-cover"/>
              <button onClick={() => setOpenArticle(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background:'rgba(0,0,0,0.5)', color:'white' }}>
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: CATEGORY_COLORS[openArticle.category]?.bg,
                    color:      CATEGORY_COLORS[openArticle.category]?.color,
                  }}>
                  {openArticle.categoryLabel}
                </span>
                <span className="text-xs" style={{ color:C.mid }}>
                  {openArticle.readTime} · {openArticle.level}
                </span>
              </div>

              <h2 className="text-xl font-black mb-3"
                style={{ color:C.charcoal, fontFamily:'var(--font-heading)' }}>
                {openArticle.title}
              </h2>

              <p className="text-sm mb-4" style={{ color:C.mid, lineHeight:1.8 }}>
                {openArticle.description}
              </p>

              <div className="p-4 rounded-xl mb-4"
                style={{ background:C.cream, border:`1px solid ${C.border}` }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color:C.mid }}>Contenu à venir</p>
                <p className="text-sm" style={{ color:C.mid, lineHeight:1.6 }}>
                  Cet article sera disponible prochainement.
                  Notre équipe rédige du contenu scientifique
                  validé par des experts en science du sol algérien.
                </p>
              </div>

              <button onClick={() => setOpenArticle(null)}
                className="w-full py-2.5 rounded-xl text-sm font-bold"
                style={{ background:C.charcoal, color:C.white,
                  fontFamily:'var(--font-heading)' }}>
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}