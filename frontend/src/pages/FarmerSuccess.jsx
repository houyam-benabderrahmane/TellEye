/**
 * TellEye — Farmer Payment Success Page
 * URL: /farmer/success?ref=TE-XXXXXX
 */
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'

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

export default function FarmerSuccess() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const ref = params.get('ref') || '—'

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: C.cream }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full text-center p-10 rounded-2xl border"
        style={{ background: C.white, borderColor: C.border }}>

        {/* Check icon */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: C.sage }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
            stroke={C.forest} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </motion.div>

        <h2 className="text-2xl font-black mb-2"
          style={{ color: C.charcoal, fontFamily: 'var(--font-heading)' }}>
          Paiement confirmé !
        </h2>

        <p className="text-sm mb-2" style={{ color: C.mid }}>
          Votre paiement a été reçu avec succès.
        </p>
        <p className="text-sm mb-6" style={{ color: C.mid }}>
          Notre équipe va traiter votre analyse et vous enverra
          le rapport SOC par email dans un délai de <strong>24 à 72 heures</strong>.
        </p>

        {/* Reference */}
        <div className="p-4 rounded-xl mb-6"
          style={{ background: C.sage, border: `1px solid ${C.forest}30` }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: C.forest }}>
            Référence de commande
          </p>
          <p className="text-xl font-black"
            style={{ color: C.forest, fontFamily: 'var(--font-heading)' }}>
            {ref}
          </p>
        </div>

        {/* What's next */}
        <div className="text-left mb-6 space-y-2">
          {[
            'Récupération des images Sentinel-2 de votre parcelle',
            'Analyse SOC via notre modèle DANN-Dual-Ent',
            'Génération du rapport PDF avec recommandations',
            'Envoi par email dans 24 à 72 heures',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ background: C.maroon, color: C.white }}>
                {i + 1}
              </span>
              <p className="text-sm" style={{ color: C.mid }}>{step}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-xl text-sm font-bold"
          style={{ background: C.maroon, color: C.white, fontFamily: 'var(--font-heading)' }}>
          Retour à l'accueil
        </button>

        <p className="text-xs mt-4" style={{ color: C.mid }}>
          Des questions ? Contactez-nous à{' '}
          <a href="mailto:contact@telleye.dz"
            style={{ color: C.forest, fontWeight: 600 }}>
            contact@telleye.dz
          </a>
        </p>
      </motion.div>
    </div>
  )
}