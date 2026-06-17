import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const C = {
  maroon:  '#6B1F1F',
  forest:  '#2D6A3F',
  amber:   '#E8941A',
  cream:   '#F9F6F0',
  charcoal:'#1C1C1C',
  mid:     '#6B7280',
  border:  '#E5E7EB',
  white:   '#FFFFFF',
}

export default function GovLogin() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [localError, setLocalError] = useState('')

  const { login, logout, loading, error, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  // If already logged in as INSTITUTION → redirect to gov dashboard
  // If already logged in as ADMIN or other → force logout first
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'institution') {
        navigate('/gov/dashboard', { replace: true })
      } else {
        // Wrong role stored — clear it so user can login as institution
        logout()
      }
    }
  }, [isAuthenticated, user, navigate, logout])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    const result = await login(email, password)

    if (result.ok) {
      // Only allow institution role through this portal
      if (result.role === 'institution') {
        navigate('/gov/dashboard', { replace: true })
      } else {
        // Admin or other role tried to use this portal
        logout()
        setLocalError(
          'Ce portail est reservé aux institutions partenaires. ' +
          'Les administrateurs TellEye accèdent via /admin.'
        )
      }
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: C.cream }}>

      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12"
        style={{ background: C.charcoal }}>
        <div>
          <p className="text-2xl font-black"
            style={{ color: C.white, fontFamily:'var(--font-heading)' }}>
            Tell<span style={{ color: C.amber }}>Eye</span>
          </p>
          <p className="text-xs font-semibold uppercase tracking-widest mt-1"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            Espace Institutionnel
          </p>
        </div>

        <div>
          <p className="text-3xl font-black leading-tight mb-4"
            style={{ color: C.white, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
            Intelligence sol pour les decideurs algeriens.
          </p>
          <p className="text-sm leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            Acces reserve aux institutions partenaires.
            Vos cartes SOC, rapports saisonniers et donnees sol
            sont accessibles depuis ce portail.
          </p>
        </div>

        <div className="space-y-3">
          {[
            'Cartes SOC par wilaya assignee',
            'Mises a jour saisonnieres automatiques',
            'Rapports PDF et exports GeoTIFF',
            'Historique des predictions',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: C.amber }}/>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{item}</p>
            </div>
          ))}
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Acces fourni par l'equipe TellEye · contact@telleye.dz
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <p className="text-2xl font-black"
              style={{ color: C.charcoal, fontFamily:'var(--font-heading)' }}>
              Tell<span style={{ color: C.amber }}>Eye</span>
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest mt-0.5"
              style={{ color: C.mid }}>Espace Institutionnel</p>
          </div>

          <h1 className="text-2xl font-black mb-1"
            style={{ color: C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
            Connexion Institution
          </h1>
          <p className="text-sm mb-8" style={{ color: C.mid }}>
            Utilisez les identifiants fournis par l'equipe TellEye.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
                Email
              </label>
              <input
                type="email" value={email} required autoFocus
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@institution.gov.dz"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border:`1.5px solid ${C.border}`, background:C.white, color:C.charcoal }}
                onFocus={e => e.target.style.borderColor = C.forest}
                onBlur={e  => e.target.style.borderColor = C.border}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password} required
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-12"
                  style={{ border:`1.5px solid ${C.border}`, background:C.white, color:C.charcoal }}
                  onFocus={e => e.target.style.borderColor = C.forest}
                  onBlur={e  => e.target.style.borderColor = C.border}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold"
                  style={{ color: C.mid }}>
                  {showPass ? 'Cacher' : 'Voir'}
                </button>
              </div>
            </div>

            {/* Error */}
            {(error || localError) && (
              <motion.div
                initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background:'#FEF2F2', color:C.maroon, border:`1px solid ${C.maroon}22` }}>
                {localError || error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3.5 rounded-xl text-sm font-bold mt-2"
              style={{
                background: loading ? C.mid : C.maroon,
                color: '#fff',
                fontFamily: 'var(--font-heading)',
                cursor: loading ? 'wait' : 'pointer',
              }}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </motion.button>
          </form>

          {/* Help */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: C.border }}>
            <p className="text-xs text-center" style={{ color: C.mid }}>
              Identifiants non recus ?
            </p>
            <p className="text-xs text-center mt-1">
              <a href="mailto:contact@telleye.dz"
                className="font-semibold" style={{ color: C.forest }}>
                contact@telleye.dz
              </a>
            </p>
          </div>

          <p className="text-xs text-center mt-6" style={{ color:'rgba(0,0,0,0.2)' }}>
            Portail reserve aux institutions partenaires TellEye.
            Cette page n'est pas accessible depuis le site public.
          </p>
        </motion.div>
      </div>
    </div>
  )
}