import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SolutionsSection from '../components/SolutionsSection'
import { useState } from 'react'

export default function SolutionsPage() {
  const [lang, setLang] = useState('fr')
  return (
    <div className="min-h-screen" style={{ background: '#F9F6F0' }}>
      <Navbar lang={lang} onLangChange={setLang} />
      <div className="pt-16">
        <SolutionsSection />
      </div>
      <Footer lang={lang} />
    </div>
  )
}